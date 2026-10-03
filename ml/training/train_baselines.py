import os
import sys
import joblib
import json
import numpy as np
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, precision_recall_curve, auc

try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

try:
    import mlflow
    HAS_MLFLOW = True
except ImportError:
    HAS_MLFLOW = False

MODEL_ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'artifacts')
os.makedirs(MODEL_ARTIFACTS_DIR, exist_ok=True)

def train_and_benchmark_models(train_df: pd.DataFrame, val_df: pd.DataFrame, test_df: pd.DataFrame):
    """
    Trains multiple baseline models, benchmarks their imbalanced metrics (PR-AUC, ROC-AUC, F1, Precision, Recall),
    and saves the best model artifacts.
    """
    from ml.features.build import FeatureEngineeringPipeline
    
    # Fit feature engineering on train_df only (no temporal leakage)
    fe_pipeline = FeatureEngineeringPipeline()
    fe_pipeline.fit(train_df)
    
    X_train = fe_pipeline.transform(train_df)
    y_train = train_df['is_fraud'].values
    
    X_val = fe_pipeline.transform(val_df)
    y_val = val_df['is_fraud'].values
    
    X_test = fe_pipeline.transform(test_df)
    y_test = test_df['is_fraud'].values

    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=10, class_weight='balanced', random_state=42)
    }

    if HAS_XGBOOST:
        scale_pos_weight = float((len(y_train) - sum(y_train)) / (sum(y_train) + 1e-5))
        models['XGBoost'] = xgb.XGBClassifier(
            n_estimators=100, max_depth=6, learning_rate=0.05,
            scale_pos_weight=scale_pos_weight, random_state=42, eval_metric='logloss'
        )

    if HAS_LIGHTGBM:
        models['LightGBM'] = lgb.LGBMClassifier(
            n_estimators=100, max_depth=6, learning_rate=0.05,
            class_weight='balanced', random_state=42, verbose=-1
        )

    results = {}
    best_model_name = None
    best_pr_auc = -1.0
    best_model_obj = None

    if HAS_MLFLOW:
        try:
            mlflow.set_experiment("FraudIntel_Model_Benchmark")
        except Exception:
            pass

    for name, model in models.items():
        print(f"Training model: {name}...")
        model.fit(X_train, y_train)
        
        # Test Set Prediction
        preds_prob = model.predict_proba(X_test)[:, 1]
        preds_binary = (preds_prob >= 0.5).astype(int)
        
        precision, recall, _ = precision_recall_curve(y_test, preds_prob)
        pr_auc = float(auc(recall, precision))
        roc_auc = float(roc_auc_score(y_test, preds_prob))
        prec = float(precision_score(y_test, preds_binary, zero_division=0))
        rec = float(recall_score(y_test, preds_binary, zero_division=0))
        f1 = float(f1_score(y_test, preds_binary, zero_division=0))

        metrics = {
            'pr_auc': round(pr_auc, 4),
            'roc_auc': round(roc_auc, 4),
            'f1_score': round(f1, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4)
        }
        results[name] = metrics
        print(f"[{name}] PR-AUC: {metrics['pr_auc']} | ROC-AUC: {metrics['roc_auc']} | F1: {metrics['f1_score']}")

        if pr_auc > best_pr_auc:
            best_pr_auc = pr_auc
            best_model_name = name
            best_model_obj = model

    # Train Anomaly Detection (Isolation Forest)
    print("Training Anomaly Detector (Isolation Forest)...")
    iso_forest = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)
    iso_forest.fit(X_train)
    
    # Save Model Artifacts
    pipeline_path = os.path.join(MODEL_ARTIFACTS_DIR, 'fe_pipeline.joblib')
    model_path = os.path.join(MODEL_ARTIFACTS_DIR, 'best_model.joblib')
    iso_path = os.path.join(MODEL_ARTIFACTS_DIR, 'iso_forest.joblib')
    metrics_path = os.path.join(MODEL_ARTIFACTS_DIR, 'model_metrics.json')

    joblib.dump(fe_pipeline, pipeline_path)
    joblib.dump(best_model_obj, model_path)
    joblib.dump(iso_forest, iso_path)

    metadata = {
        'best_model_name': best_model_name,
        'best_pr_auc': best_pr_auc,
        'benchmarks': results,
        'trained_at': str(pd.Timestamp.now())
    }
    with open(metrics_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\nTraining Complete! Champion Model: {best_model_name} (PR-AUC: {best_pr_auc:.4f})")
    print(f"Saved artifacts to {MODEL_ARTIFACTS_DIR}")
    return metadata

if __name__ == '__main__':
    from ml.data.ingest import DataIngestionEngine
    from ml.preprocessing.prepare import temporal_train_val_test_split
    db_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'database', 'fraud_intel.db')
    engine = DataIngestionEngine()
    df = engine.load_from_sqlite(db_file)
    train_df, val_df, test_df, _ = temporal_train_val_test_split(df)
    train_and_benchmark_models(train_df, val_df, test_df)
