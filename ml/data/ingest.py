import os
import pandas as pd
import sqlite3

class DatasetAdapter:
    """Standardizes heterogeneous raw datasets (IEEE-CIS, PaySim, CreditCard, Custom CSV)."""
    
    @staticmethod
    def inspect_and_normalize(df_raw: pd.DataFrame, dataset_name: str = "generic") -> pd.DataFrame:
        df = df_raw.copy()
        cols = {c.lower(): c for c in df.columns}
        
        # Standardize column mapping
        mapping = {}
        for col in df.columns:
            c_low = col.lower()
            if col in ['merchant_id', 'customer_id', 'device_id', 'transaction_id', 'is_fraud', 'amount', 'timestamp']:
                continue
            if 'amount' in c_low or c_low == 'val' or c_low == 'step':
                mapping[col] = 'amount'
            elif 'fraud' in c_low or 'target' in c_low or c_low == 'label':
                mapping[col] = 'is_fraud'
            elif ('cust' in c_low or 'user' in c_low or 'nameorig' in c_low) and 'customer_id' not in df.columns:
                mapping[col] = 'customer_id'
            elif ('merchant_id' in c_low or 'namedest' in c_low) and 'merchant_id' not in df.columns:
                mapping[col] = 'merchant_id'
            elif 'device' in c_low and 'device_id' not in df.columns:
                mapping[col] = 'device_id'
            elif ('time' in c_low or 'date' in c_low) and 'timestamp' not in df.columns:
                mapping[col] = 'timestamp'
            elif 'ip' in c_low and 'ip_address' not in df.columns:
                mapping[col] = 'ip_address'

        df.rename(columns=mapping, inplace=True)
        
        # Fill required defaults if missing
        if 'is_fraud' not in df.columns:
            df['is_fraud'] = 0
        if 'amount' not in df.columns:
            df['amount'] = 100.0
        if 'timestamp' not in df.columns:
            df['timestamp'] = pd.date_range(end=pd.Timestamp.now(), periods=len(df), freq='T')
        else:
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce').fillna(pd.Timestamp.now())
            
        if 'customer_id' not in df.columns:
            df['customer_id'] = [f"CUST-{i % 100}" for i in range(len(df))]
        if 'merchant_id' not in df.columns:
            df['merchant_id'] = [f"MERCH-{i % 20}" for i in range(len(df))]
        if 'device_id' not in df.columns:
            df['device_id'] = [f"DEV-{i % 50}" for i in range(len(df))]
        if 'ip_address' not in df.columns:
            df['ip_address'] = [f"192.168.1.{i % 100}" for i in range(len(df))]
        if 'location_city' not in df.columns:
            df['location_city'] = 'Mumbai'

        return df

class DataIngestionEngine:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            data_dir = os.path.dirname(__file__)
        self.raw_dir = os.path.join(data_dir, 'raw')
        self.processed_dir = os.path.join(data_dir, 'processed')
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)

    def load_from_csv(self, filepath: str) -> pd.DataFrame:
        print(f"Ingesting CSV dataset: {filepath}")
        df_raw = pd.read_csv(filepath)
        df_norm = DatasetAdapter.inspect_and_normalize(df_raw)
        return df_norm

    def load_from_parquet(self, filepath: str) -> pd.DataFrame:
        print(f"Ingesting Parquet dataset: {filepath}")
        df_raw = pd.read_parquet(filepath)
        return DatasetAdapter.inspect_and_normalize(df_raw)

    def load_from_sqlite(self, db_path: str, table_name: str = "transactions") -> pd.DataFrame:
        print(f"Ingesting SQLite table '{table_name}' from: {db_path}")
        conn = sqlite3.connect(db_path)
        df_raw = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
        conn.close()
        return DatasetAdapter.inspect_and_normalize(df_raw)

    def generate_quality_report(self, df: pd.DataFrame) -> dict:
        total_rows = len(df)
        fraud_count = int(df['is_fraud'].sum()) if 'is_fraud' in df.columns else 0
        quality_report = {
            'row_count': total_rows,
            'column_count': len(df.columns),
            'columns': list(df.columns),
            'missing_values': df.isnull().sum().to_dict(),
            'fraud_count': fraud_count,
            'fraud_rate_pct': round((fraud_count / total_rows * 100), 2) if total_rows > 0 else 0,
            'temporal_range': {
                'start': str(df['timestamp'].min()),
                'end': str(df['timestamp'].max())
            },
            'data_quality_score': round(1.0 - (df.isnull().sum().sum() / (total_rows * len(df.columns) + 1e-5)), 4)
        }
        return quality_report

if __name__ == '__main__':
    engine = DataIngestionEngine()
    db_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'database', 'fraud_intel.db')
    if os.path.exists(db_file):
        df = engine.load_from_sqlite(db_file)
        report = engine.generate_quality_report(df)
        print("Dataset Quality Report:", report)
