import os
import sys
import numpy as np
import pandas as pd

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

class FeatureEngineeringPipeline:
    def __init__(self):
        self.customer_stats = {}
        self.merchant_stats = {}
        self.device_stats = {}
        self.ip_stats = {}
        self.is_fitted = False

    def fit(self, train_df: pd.DataFrame):
        """Calculates baseline statistics on training set to prevent data leakage."""
        df = train_df.copy()
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
        
        # Customer baseline statistics
        cust_grouped = df.groupby('customer_id').agg(
            cust_tx_count=('amount', 'count'),
            cust_amount_mean=('amount', 'mean'),
            cust_amount_std=('amount', 'std'),
            cust_fraud_rate=('is_fraud', 'mean')
        ).reset_index()
        self.customer_stats = cust_grouped.set_index('customer_id').to_dict('index')
        
        # Merchant baseline statistics
        merch_grouped = df.groupby('merchant_id').agg(
            merch_tx_count=('amount', 'count'),
            merch_fraud_rate=('is_fraud', 'mean'),
            merch_amount_mean=('amount', 'mean')
        ).reset_index()
        self.merchant_stats = merch_grouped.set_index('merchant_id').to_dict('index')
        
        # Device & IP velocity statistics
        dev_grouped = df.groupby('device_id')['customer_id'].nunique().to_dict()
        self.device_stats = dev_grouped
        
        ip_grouped = df.groupby('ip_address')['customer_id'].nunique().to_dict()
        self.ip_stats = ip_grouped
        
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineers transaction, customer, merchant, device, IP, and location features."""
        df_feat = df.copy()
        
        # Ensure timestamp exists
        if 'timestamp' not in df_feat.columns:
            df_feat['timestamp'] = pd.Timestamp.now()
        elif not pd.api.types.is_datetime64_any_dtype(df_feat['timestamp']):
            df_feat['timestamp'] = pd.to_datetime(df_feat['timestamp'], errors='coerce').fillna(pd.Timestamp.now())

        # 1. Transaction Features
        df_feat['log_amount'] = np.log1p(df_feat['amount'])
        df_feat['tx_hour'] = df_feat['timestamp'].dt.hour
        df_feat['day_of_week'] = df_feat['timestamp'].dt.dayofweek
        df_feat['is_weekend'] = df_feat['day_of_week'].isin([5, 6]).astype(int)

        # 2. Customer Historical Features
        def get_cust_stat(c_id, key, default=0.0):
            if c_id in self.customer_stats:
                return self.customer_stats[c_id].get(key, default)
            return default

        df_feat['cust_tx_count'] = df_feat['customer_id'].apply(lambda x: get_cust_stat(x, 'cust_tx_count', 1))
        df_feat['cust_amount_mean'] = df_feat['customer_id'].apply(lambda x: get_cust_stat(x, 'cust_amount_mean', 1000.0))
        df_feat['cust_amount_std'] = df_feat['customer_id'].apply(lambda x: get_cust_stat(x, 'cust_amount_std', 500.0)).fillna(500.0)
        df_feat['cust_fraud_rate'] = df_feat['customer_id'].apply(lambda x: get_cust_stat(x, 'cust_fraud_rate', 0.0))
        
        # Deviation feature: How far is current amount from customer baseline?
        df_feat['amount_deviation_cust'] = (df_feat['amount'] - df_feat['cust_amount_mean']) / (df_feat['cust_amount_std'] + 1e-5)

        # 3. Merchant Features
        def get_merch_stat(m_id, key, default=0.0):
            if m_id in self.merchant_stats:
                return self.merchant_stats[m_id].get(key, default)
            return default

        df_feat['merch_fraud_rate'] = df_feat['merchant_id'].apply(lambda x: get_merch_stat(x, 'merch_fraud_rate', 0.02))
        df_feat['merch_tx_count'] = df_feat['merchant_id'].apply(lambda x: get_merch_stat(x, 'merch_tx_count', 10))

        # 4. Device & IP Velocity Features
        df_feat['device_account_count'] = df_feat['device_id'].apply(lambda x: self.device_stats.get(x, 1))
        df_feat['ip_account_count'] = df_feat['ip_address'].apply(lambda x: self.ip_stats.get(x, 1))

        # 5. Location & Risk Features
        df_feat['is_jamtara'] = (df_feat['location_city'] == 'Jamtara').astype(int)
        df_feat['is_upi'] = (df_feat['payment_method'] == 'UPI').astype(int)

        feature_cols = [
            'amount', 'log_amount', 'tx_hour', 'day_of_week', 'is_weekend',
            'cust_tx_count', 'cust_amount_mean', 'cust_amount_std', 'cust_fraud_rate',
            'amount_deviation_cust', 'merch_fraud_rate', 'merch_tx_count',
            'device_account_count', 'ip_account_count', 'is_jamtara', 'is_upi'
        ]
        
        return df_feat[feature_cols]

if __name__ == '__main__':
    from ml.data.ingest import DataIngestionEngine
    from ml.preprocessing.prepare import temporal_train_val_test_split
    import os
    db_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'database', 'fraud_intel.db')
    engine = DataIngestionEngine()
    df = engine.load_from_sqlite(db_file)
    train_df, val_df, test_df, _ = temporal_train_val_test_split(df)
    
    pipeline = FeatureEngineeringPipeline()
    pipeline.fit(train_df)
    X_train = pipeline.transform(train_df)
    print("Engineered Feature Columns:", list(X_train.columns))
    print("X_train Shape:", X_train.shape)
