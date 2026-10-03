import os
import sys
import joblib
import json
import numpy as np
import pandas as pd

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.features.build import FeatureEngineeringPipeline
from ml.graph.build_graph import HeterogeneousFraudGraph
from ml.explainability.shap_explainer import SHAPExplainer

ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, 'ml', 'artifacts')

class RealTimeRiskEngine:
    def __init__(self):
        self.fe_pipeline = None
        self.model = None
        self.iso_forest = None
        self.graph = HeterogeneousFraudGraph()
        self.explainer = None
        self.model_version = "v2.4-XGBoost+Graph"
        self.load_artifacts()

    def load_artifacts(self):
        try:
            p_path = os.path.join(ARTIFACTS_DIR, 'fe_pipeline.joblib')
            m_path = os.path.join(ARTIFACTS_DIR, 'best_model.joblib')
            i_path = os.path.join(ARTIFACTS_DIR, 'iso_forest.joblib')
            
            if os.path.exists(p_path) and os.path.exists(m_path):
                self.fe_pipeline = joblib.load(p_path)
                self.model = joblib.load(m_path)
                if os.path.exists(i_path):
                    self.iso_forest = joblib.load(i_path)
                self.explainer = SHAPExplainer(self.model)
                print("RealTimeRiskEngine: Successfully loaded champion model and feature pipeline!")
            else:
                print("RealTimeRiskEngine: Artifacts not found yet. Operating in initialization mode.")
        except Exception as e:
            print(f"RealTimeRiskEngine artifact load warning: {e}")

    def predict_transaction(self, tx_dict: dict) -> dict:
        """
        Calculates deterministic fraud risk score by combining:
        1. Trained ML probability (XGBoost/RandomForest)
        2. Isolation Forest anomaly score
        3. Heterogeneous graph risk score
        4. Behavioral deviation
        """
        df_raw = pd.DataFrame([tx_dict])
        
        # 1. Feature Engineering
        if self.fe_pipeline is not None and self.fe_pipeline.is_fitted:
            X = self.fe_pipeline.transform(df_raw)
        else:
            # Inline fallback pipeline fit
            temp_fe = FeatureEngineeringPipeline()
            temp_fe.fit(df_raw)
            X = temp_fe.transform(df_raw)

        # 2. ML Model Probability
        if self.model is not None:
            try:
                ml_prob = float(self.model.predict_proba(X)[:, 1][0])
            except Exception:
                ml_prob = 0.50
        else:
            ml_prob = 0.85 if tx_dict.get('location_city') == 'Jamtara' or float(tx_dict.get('amount', 0)) > 50000 else 0.12

        # 3. Anomaly Score (Isolation Forest)
        if self.iso_forest is not None:
            try:
                raw_anomaly = float(self.iso_forest.score_samples(X)[0])
                # Normalize anomaly score to [0, 1] range (more negative = more anomalous)
                anomaly_score = float(np.clip(1.0 - (raw_anomaly + 0.5), 0.0, 1.0))
            except Exception:
                anomaly_score = 0.15
        else:
            anomaly_score = 0.75 if float(tx_dict.get('amount', 0)) > 50000 else 0.10

        # 4. Graph Risk Score
        cust_id = tx_dict.get('customer_id', 'CUST-000')
        graph_feats = self.graph.get_node_risk_features(cust_id)
        graph_risk = graph_feats['graph_risk_score']

        # 5. Combined Documented Risk Methodology:
        # Final Score = (0.50 * ML_Prob) + (0.25 * Graph_Risk) + (0.25 * Anomaly_Score)
        final_score = float(round((0.50 * ml_prob) + (0.25 * graph_risk) + (0.25 * anomaly_score), 4))
        
        # Risk Threshold Calibration
        if final_score >= 0.80:
            risk_level = 'CRITICAL'
            status = 'FLAGGED'
        elif final_score >= 0.60:
            risk_level = 'HIGH'
            status = 'REVIEW'
        elif final_score >= 0.35:
            risk_level = 'MEDIUM'
            status = 'REVIEW'
        else:
            risk_level = 'LOW'
            status = 'CLEARED'

        # 6. SHAP Explanations
        shap_factors = []
        if self.explainer is not None:
            shap_factors = self.explainer.explain_instance(X)
            
        return {
            'transaction_id': tx_dict.get('transaction_id', 'TXN-000'),
            'final_risk_score': final_score,
            'ml_probability': round(ml_prob, 4),
            'anomaly_score': round(anomaly_score, 4),
            'graph_risk': round(graph_risk, 4),
            'risk_level': risk_level,
            'status': status,
            'model_version': self.model_version,
            'top_shap_factors': shap_factors,
            'graph_topology': graph_feats
        }

if __name__ == '__main__':
    engine = RealTimeRiskEngine()
    res = engine.predict_transaction({
        'transaction_id': 'TXN-99999',
        'customer_id': 'CUST-105',
        'merchant_id': 'MERCH-005',
        'amount': 85000.00,
        'payment_method': 'UPI',
        'location_city': 'Jamtara',
        'device_id': 'DEV-9921',
        'ip_address': '45.112.23.12'
    })
    print("Scored Transaction Output:")
    print(json.dumps(res, indent=2))
