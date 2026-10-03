import pandas as pd
import numpy as np

def clean_and_prepare_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans numeric and datetime columns."""
    df_clean = df.copy()
    
    # Ensure timestamp is datetime
    if not pd.api.types.is_datetime64_any_dtype(df_clean['timestamp']):
        df_clean['timestamp'] = pd.to_datetime(df_clean['timestamp'], errors='coerce')
    
    # Fill missing values
    df_clean['amount'] = pd.to_numeric(df_clean['amount'], errors='coerce').fillna(0.0)
    df_clean['is_fraud'] = pd.to_numeric(df_clean['is_fraud'], errors='coerce').fillna(0).astype(int)
    
    # Sort chronologically to maintain temporal integrity
    df_clean = df_clean.sort_values('timestamp').reset_index(drop=True)
    return df_clean

def temporal_train_val_test_split(df: pd.DataFrame, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15):
    """
    Splits time-series transaction data strictly chronologically.
    Older transactions -> train
    Later transactions -> validation
    Latest transactions -> test
    Prevents temporal data leakage!
    """
    df_sorted = clean_and_prepare_data(df)
    n = len(df_sorted)
    
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))
    
    train_df = df_sorted.iloc[:train_end].copy()
    val_df = df_sorted.iloc[train_end:val_end].copy()
    test_df = df_sorted.iloc[val_end:].copy()
    
    split_info = {
        'total_records': n,
        'train_records': len(train_df),
        'train_fraud_pct': round(train_df['is_fraud'].mean() * 100, 2),
        'train_time_range': (str(train_df['timestamp'].min()), str(train_df['timestamp'].max())),
        'val_records': len(val_df),
        'val_fraud_pct': round(val_df['is_fraud'].mean() * 100, 2),
        'val_time_range': (str(val_df['timestamp'].min()), str(val_df['timestamp'].max())),
        'test_records': len(test_df),
        'test_fraud_pct': round(test_df['is_fraud'].mean() * 100, 2),
        'test_time_range': (str(test_df['timestamp'].min()), str(test_df['timestamp'].max()))
    }
    
    return train_df, val_df, test_df, split_info

if __name__ == '__main__':
    from ml.data.ingest import DataIngestionEngine
    import os
    db_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'database', 'fraud_intel.db')
    engine = DataIngestionEngine()
    df = engine.load_from_sqlite(db_file)
    train_df, val_df, test_df, info = temporal_train_val_test_split(df)
    print("Temporal Split Info:", info)
