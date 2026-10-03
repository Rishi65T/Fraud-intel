import os
import sys
import numpy as np
import pandas as pd
from scipy.stats import ks_2samp

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

class DriftMonitor:
    def __init__(self, reference_df: pd.DataFrame = None):
        self.reference_df = reference_df

    def set_reference(self, df: pd.DataFrame):
        self.reference_df = df

    def compute_drift_metrics(self, current_df: pd.DataFrame) -> dict:
        if self.reference_df is None or len(self.reference_df) == 0:
            return {'status': 'NO_REFERENCE', 'drift_detected': False, 'feature_drifts': {}}

        feature_cols = ['amount', 'is_fraud']
        if 'tx_hour' in current_df.columns:
            feature_cols.append('tx_hour')
            
        drifts = {}
        drift_detected = False

        for col in feature_cols:
            if col in self.reference_df.columns and col in current_df.columns:
                ref_vals = pd.to_numeric(self.reference_df[col], errors='coerce').dropna()
                cur_vals = pd.to_numeric(current_df[col], errors='coerce').dropna()
                
                if len(ref_vals) > 5 and len(cur_vals) > 5:
                    ks_stat, p_val = ks_2samp(ref_vals, cur_vals)
                    is_drifted = bool(p_val < 0.05)
                    if is_drifted:
                        drift_detected = True
                        
                    drifts[col] = {
                        'ks_statistic': round(float(ks_stat), 4),
                        'p_value': round(float(p_val), 4),
                        'is_drifted': is_drifted,
                        'reference_mean': round(float(ref_vals.mean()), 2),
                        'current_mean': round(float(cur_vals.mean()), 2)
                    }

        status = 'DRIFT_DETECTED' if drift_detected else 'NORMAL'
        return {
            'status': status,
            'drift_detected': drift_detected,
            'feature_drifts': drifts,
            'timestamp': str(pd.Timestamp.now())
        }

if __name__ == '__main__':
    ref_df = pd.DataFrame({'amount': np.random.exponential(1000, 500), 'is_fraud': np.random.choice([0, 1], 500, p=[0.95, 0.05])})
    cur_df = pd.DataFrame({'amount': np.random.exponential(4000, 500), 'is_fraud': np.random.choice([0, 1], 500, p=[0.80, 0.20])})
    monitor = DriftMonitor(ref_df)
    report = monitor.compute_drift_metrics(cur_df)
    print("Data Drift Report:", report)
