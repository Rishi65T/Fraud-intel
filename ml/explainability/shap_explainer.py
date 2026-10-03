import os
import sys
import numpy as np
import pandas as pd

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

class SHAPExplainer:
    def __init__(self, model=None):
        self.model = model
        self.explainer = None
        if HAS_SHAP and model is not None:
            try:
                self.explainer = shap.TreeExplainer(model)
            except Exception:
                try:
                    self.explainer = shap.Explainer(model)
                except Exception:
                    self.explainer = None

    def explain_instance(self, X_instance: pd.DataFrame) -> list:
        """
        Generates feature attributions (waterfall breakdown) for a transaction.
        Returns top positive and negative contributing factors.
        """
        feature_names = list(X_instance.columns)
        values = X_instance.values[0]

        if self.explainer is not None:
            try:
                shap_values = self.explainer(X_instance)
                sv = shap_values.values[0]
                if len(sv.shape) > 1:
                    sv = sv[:, 1] # Class 1 (Fraud)
                
                factors = []
                for name, val, s_val in zip(feature_names, values, sv):
                    factors.append({
                        'feature': name,
                        'value': float(val),
                        'contribution': float(s_val),
                        'impact_direction': 'INCREASED_RISK' if s_val > 0 else 'REDUCED_RISK'
                    })
                factors = sorted(factors, key=lambda x: abs(x['contribution']), reverse=True)
                return factors[:5]
            except Exception as e:
                print(f"SHAP calculation fallback: {e}")

        # Deterministic Rule-Based Fallback Explanation if SHAP TreeExplainer fails
        factors = []
        for name, val in zip(feature_names, values):
            contrib = 0.0
            if 'amount' in name and val > 10000:
                contrib = 0.35
            elif 'jamtara' in name and val > 0:
                contrib = 0.40
            elif 'device' in name and val > 2:
                contrib = 0.25
            elif 'fraud_rate' in name and val > 0.05:
                contrib = 0.30
            else:
                contrib = -0.05

            factors.append({
                'feature': name,
                'value': float(val),
                'contribution': round(contrib, 4),
                'impact_direction': 'INCREASED_RISK' if contrib > 0 else 'REDUCED_RISK'
            })

        factors = sorted(factors, key=lambda x: abs(x['contribution']), reverse=True)
        return factors[:5]

if __name__ == '__main__':
    explainer = SHAPExplainer()
    dummy_df = pd.DataFrame([{
        'amount': 75000.0, 'log_amount': 11.22, 'tx_hour': 3, 'day_of_week': 2, 'is_weekend': 0,
        'cust_tx_count': 5, 'cust_amount_mean': 1500.0, 'cust_amount_std': 500.0, 'cust_fraud_rate': 0.0,
        'amount_deviation_cust': 147.0, 'merch_fraud_rate': 0.35, 'merch_tx_count': 50,
        'device_account_count': 4, 'ip_account_count': 3, 'is_jamtara': 1, 'is_upi': 1
    }])
    factors = explainer.explain_instance(dummy_df)
    print("SHAP Factors:", factors)
