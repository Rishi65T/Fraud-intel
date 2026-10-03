import os
import sys
import json
import sqlite3
import datetime
import random
import numpy as np
import pandas as pd

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Set deterministic random seed for reproducibility
random.seed(42)
np.random.seed(42)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'data')
RAW_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'fraud_intel.db')

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Jamtara', 'Kolkata', 'Chennai', 'Pune', 'Ahmedabad', 'Jaipur']
MERCHANTS = [
    {'id': 'MERCH-001', 'name': 'Flipkart Pay', 'category': 'E-Commerce', 'risk': 0.02},
    {'id': 'MERCH-002', 'name': 'CryptoExchange India', 'category': 'Fintech/Crypto', 'risk': 0.35},
    {'id': 'MERCH-003', 'name': 'GamingZone Wallet', 'category': 'Digital Goods', 'risk': 0.25},
    {'id': 'MERCH-004', 'name': 'Reliance Digital', 'category': 'Retail Electronics', 'risk': 0.03},
    {'id': 'MERCH-005', 'name': 'QuickCash P2P Gateway', 'category': 'P2P Gateway', 'risk': 0.48},
    {'id': 'MERCH-006', 'name': 'Swiggy Food', 'category': 'Food & Dining', 'risk': 0.01},
]

DEVICES = [f"DEV-{1000 + i}" for i in range(50)]
SUSPICIOUS_DEVICES = ['DEV-1005', 'DEV-1012', 'DEV-1024', 'DEV-9921']
IP_POOL = [f"192.168.1.{i}" for i in range(1, 100)] + [f"45.112.23.{i}" for i in range(1, 20)]

def generate_synthetic_fraud_dataset(num_records=5000):
    """
    Generates a realistic multi-entity transaction dataset with temporal order.
    Includes normal customer behavior + synthetic fraud attack patterns (UPI Velocity, Shared Device, Impossible Travel).
    """
    print(f"Generating {num_records} realistic historical transactions...")
    start_time = datetime.datetime.now() - datetime.timedelta(days=60)
    
    customers = [f"CUST-{100 + i}" for i in range(200)]
    
    records = []
    for i in range(num_records):
        tx_id = f"TXN-{100000 + i}"
        cust_id = random.choice(customers)
        acc_id = f"ACC-{cust_id.split('-')[1]}"
        
        # Inject suspicious fraud patterns periodically
        is_fraud = 0
        rand_val = random.random()
        
        if rand_val < 0.05:
            # Type 1: High amount crypto/p2p fraud
            is_fraud = 1
            merchant = random.choice([m for m in MERCHANTS if m['risk'] > 0.2])
            amount = round(random.uniform(50000, 250000), 2)
            device = random.choice(SUSPICIOUS_DEVICES)
            city = 'Jamtara' if random.random() < 0.6 else random.choice(INDIAN_CITIES)
            ip = f"45.112.23.{random.randint(1, 19)}"
            payment_method = 'UPI'
        elif rand_val < 0.08:
            # Type 2: Rapid velocity small amount testing before large drain
            is_fraud = 1
            merchant = random.choice(MERCHANTS)
            amount = round(random.uniform(100, 2000), 2)
            device = random.choice(SUSPICIOUS_DEVICES)
            city = random.choice(INDIAN_CITIES)
            ip = f"192.168.1.{random.randint(80, 99)}"
            payment_method = random.choice(['CARD', 'UPI'])
        else:
            # Normal transaction
            is_fraud = 0
            merchant = random.choice(MERCHANTS)
            amount = round(np.random.exponential(scale=2500) + 10, 2)
            device = random.choice(DEVICES)
            city = random.choice([c for c in INDIAN_CITIES if c != 'Jamtara'])
            ip = f"192.168.1.{random.randint(1, 79)}"
            payment_method = random.choice(['UPI', 'CARD', 'NETBANKING'])

        # Increment time chronologically
        tx_time = start_time + datetime.timedelta(minutes=int(i * 12 + random.randint(0, 5)))
        
        records.append({
            'transaction_id': tx_id,
            'customer_id': cust_id,
            'account_id': acc_id,
            'merchant_id': merchant['id'],
            'merchant_name': merchant['name'],
            'amount': amount,
            'currency': 'INR',
            'payment_method': payment_method,
            'timestamp': tx_time.strftime('%Y-%m-%d %H:%M:%S'),
            'location_city': city,
            'location_country': 'India',
            'device_id': device,
            'ip_address': ip,
            'is_fraud': is_fraud
        })
        
    df = pd.DataFrame(records)
    
    # Save CSV, Parquet, and SQLite database
    csv_path = os.path.join(RAW_DIR, 'transactions_raw.csv')
    parquet_path = os.path.join(PROCESSED_DIR, 'transactions_processed.parquet')
    df.to_csv(csv_path, index=False)
    df.to_parquet(parquet_path, index=False)
    
    print(f"Dataset generated! Raw CSV: {csv_path}, Processed Parquet: {parquet_path}")
    print(f"Total Transactions: {len(df)}, Fraud Count: {df['is_fraud'].sum()} ({df['is_fraud'].mean()*100:.2f}%)")
    
    # Seed SQLite local fallback DB
    seed_sqlite_db(df, customers)
    return df

def seed_sqlite_db(df, customers=None):
    """Populates local SQLite database for instant server startup without requiring Postgres."""
    if customers is None:
        customers = [f"CUST-{100 + i}" for i in range(200)]

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable WAL mode for high performance
    cursor.execute("PRAGMA journal_mode=WAL;")
    
    # 1. Transactions Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id TEXT PRIMARY KEY,
        customer_id TEXT,
        account_id TEXT,
        merchant_id TEXT,
        merchant_name TEXT,
        amount REAL,
        currency TEXT DEFAULT 'INR',
        payment_method TEXT DEFAULT 'UPI',
        timestamp TEXT,
        location_city TEXT,
        location_country TEXT DEFAULT 'India',
        device_id TEXT,
        ip_address TEXT,
        is_fraud INTEGER DEFAULT 0,
        predicted_risk_score REAL,
        risk_level TEXT,
        status TEXT DEFAULT 'COMPLETED'
    )
    ''')
    
    # 2. Alerts Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alerts (
        alert_id TEXT PRIMARY KEY,
        transaction_id TEXT,
        risk_score REAL,
        risk_level TEXT,
        trigger_reason TEXT,
        top_features TEXT,
        related_entities TEXT,
        model_version TEXT,
        created_at TEXT,
        status TEXT DEFAULT 'NEW'
    )
    ''')
    
    # 3. Investigations Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS investigations (
        investigation_id TEXT PRIMARY KEY,
        alert_id TEXT,
        analyst_id TEXT DEFAULT 'analyst_01',
        status TEXT DEFAULT 'IN_PROGRESS',
        title TEXT,
        priority TEXT DEFAULT 'High',
        notes TEXT,
        evidence_summary TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    ''')

    # 4. Predictions Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions (
        prediction_id TEXT PRIMARY KEY,
        transaction_id TEXT,
        ml_probability REAL,
        anomaly_score REAL,
        graph_risk REAL,
        final_risk_score REAL,
        shap_explanation TEXT,
        model_version TEXT,
        created_at TEXT
    )
    ''')

    # 5. Customers Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        country TEXT DEFAULT 'India',
        risk_level TEXT DEFAULT 'LOW',
        historical_fraud_count INTEGER DEFAULT 0,
        created_at TEXT
    )
    ''')

    # 6. Merchants Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS merchants (
        merchant_id TEXT PRIMARY KEY,
        merchant_name TEXT,
        category TEXT,
        risk_score REAL DEFAULT 0.05,
        fraud_rate REAL DEFAULT 0.01,
        total_volume REAL DEFAULT 0.0
    )
    ''')

    # 7. Devices Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS devices (
        device_id TEXT PRIMARY KEY,
        device_type TEXT DEFAULT 'Mobile',
        linked_accounts_count INTEGER DEFAULT 1,
        is_suspicious INTEGER DEFAULT 0
    )
    ''')

    # 8. Audit Logs Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT,
        actor TEXT DEFAULT 'SYSTEM',
        details TEXT,
        created_at TEXT
    )
    ''')

    # Clear and Seed Customers
    cursor.execute("DELETE FROM customers")
    for c_id in customers:
        num = c_id.split('-')[1]
        cursor.execute('''
        INSERT INTO customers (customer_id, name, email, phone, country, risk_level, historical_fraud_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            c_id, f"Customer {num}", f"user{num}@banking.in", f"+91 98200 {num}0",
            'India', 'HIGH' if int(num) % 15 == 0 else 'LOW', 1 if int(num) % 15 == 0 else 0,
            "2024-01-15 10:00:00"
        ))

    # Clear and Seed Merchants
    cursor.execute("DELETE FROM merchants")
    for m in MERCHANTS:
        cursor.execute('''
        INSERT INTO merchants (merchant_id, merchant_name, category, risk_score, fraud_rate, total_volume)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (m['id'], m['name'], m['category'], m['risk'], m['risk'] * 0.4, 1500000.00))

    # Clear and Seed Devices
    cursor.execute("DELETE FROM devices")
    for d in DEVICES:
        is_susp = 1 if d in SUSPICIOUS_DEVICES else 0
        cursor.execute('''
        INSERT INTO devices (device_id, device_type, linked_accounts_count, is_suspicious)
        VALUES (?, ?, ?, ?)
        ''', (d, 'Android Mobile' if is_susp else 'iOS / Android Mobile', 4 if is_susp else 1, is_susp))

    # Clear and Seed Transactions
    cursor.execute("DELETE FROM transactions")
    for _, row in df.iterrows():
        score = 0.88 if row['is_fraud'] == 1 else round(random.uniform(0.01, 0.25), 4)
        level = 'CRITICAL' if score >= 0.85 else ('HIGH' if score >= 0.65 else 'LOW')
        cursor.execute('''
        INSERT INTO transactions (
            transaction_id, customer_id, account_id, merchant_id, merchant_name,
            amount, currency, payment_method, timestamp, location_city,
            location_country, device_id, ip_address, is_fraud, predicted_risk_score,
            risk_level, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            row['transaction_id'], row['customer_id'], row['account_id'], row['merchant_id'],
            row['merchant_name'], row['amount'], row['currency'], row['payment_method'],
            row['timestamp'], row['location_city'], row['location_country'], row['device_id'],
            row['ip_address'], int(row['is_fraud']), score, level, 'COMPLETED'
        ))

    # Clear and Seed Alerts for Fraudulent transactions
    cursor.execute("DELETE FROM alerts")
    fraud_rows = df[df['is_fraud'] == 1].head(30)
    for i, (_, row) in enumerate(fraud_rows.iterrows()):
        alert_id = f"ALT-{9000 + i}"
        cursor.execute('''
        INSERT INTO alerts (
            alert_id, transaction_id, risk_score, risk_level,
            trigger_reason, top_features, related_entities, model_version,
            created_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert_id, row['transaction_id'], 0.92, 'CRITICAL',
            f"Suspicious {row['payment_method']} transfer at {row['merchant_name']} from {row['location_city']}",
            json.dumps(["Transaction Amount Velocity", "Shared Device Fingerprint", "Geographic Anomaly"]),
            json.dumps({"customer": row['customer_id'], "device": row['device_id'], "ip": row['ip_address']}),
            "v2.4-XGBoost+Graph", row['timestamp'], "NEW"
        ))

    # Clear and Seed Predictions
    cursor.execute("DELETE FROM predictions")
    for i, (_, row) in enumerate(fraud_rows.head(10).iterrows()):
        cursor.execute('''
        INSERT INTO predictions (
            prediction_id, transaction_id, ml_probability, anomaly_score,
            graph_risk, final_risk_score, shap_explanation, model_version, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            f"PRED-{row['transaction_id'].split('-')[1]}",
            row['transaction_id'],
            0.9850,
            0.9200,
            0.8500,
            0.9200,
            json.dumps([{"feature": "amount", "contribution": 0.35}, {"feature": "is_jamtara", "contribution": 0.40}]),
            "v2.4-XGBoost+Graph",
            row['timestamp']
        ))

    # Clear and Seed Investigations
    cursor.execute("DELETE FROM investigations")
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('''
    INSERT INTO investigations (
        investigation_id, alert_id, analyst_id, status, title, priority,
        notes, evidence_summary, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        "INV-8801", "ALT-9000", "analyst_01", "IN_PROGRESS",
        "Jamtara UPI Phishing Syndicate Investigation", "High",
        "Investigating suspicious high-value UPI drain from Jamtara cluster.",
        json.dumps(["UPI Velocity Spike", "Shared OnePlus Device DEV-9921"]),
        now_str,
        now_str
    ))

    # Seed initial audit log entry
    cursor.execute('''
    INSERT INTO audit_logs (event_type, actor, details, created_at)
    VALUES (?, ?, ?, ?)
    ''', (
        "SYSTEM_SEED", "SYSTEM",
        json.dumps({"status": "Database Seed Completed", "records": len(df)}),
        now_str
    ))

    conn.commit()

    # Query counts for validation
    counts = {}
    for tbl in ['transactions', 'alerts', 'investigations', 'predictions', 'customers', 'merchants', 'devices', 'audit_logs']:
        cursor.execute(f"SELECT COUNT(*) FROM {tbl}")
        counts[tbl] = cursor.fetchone()[0]

    conn.close()
    print(f"SQLite database seeded successfully at {DB_PATH}")
    print(f"Table Row Counts: {counts}")

if __name__ == '__main__':
    generate_synthetic_fraud_dataset(5000)
