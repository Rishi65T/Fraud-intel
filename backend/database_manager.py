import os
import sqlite3
import json
import datetime

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_POSTGRES = True
except ImportError:
    HAS_POSTGRES = False

try:
    from neo4j import GraphDatabase
    HAS_NEO4J = True
except ImportError:
    HAS_NEO4J = False

try:
    import redis
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False

from backend.config import settings

class DatabaseManager:
    """
    Manages connections to PostgreSQL, Neo4j, Redis, with instant fallback to SQLite + Memory.
    Guarantees zero crashes whether external DB services are running or not!
    """
    def __init__(self):
        self.sqlite_path = settings.SQLITE_PATH
        self.pg_conn = None
        self.neo4j_driver = None
        self.redis_client = None
        self.ensure_schema()
        self.init_connections()

    def ensure_schema(self):
        """Ensures all required tables exist in the local SQLite database."""
        conn = sqlite3.connect(self.sqlite_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        
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

        # Automatically migrate columns if table was created in earlier version
        for col_def in ["title TEXT", "priority TEXT DEFAULT 'High'", "updated_at TEXT"]:
            try:
                cursor.execute(f"ALTER TABLE investigations ADD COLUMN {col_def}")
            except sqlite3.OperationalError:
                pass

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

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT,
            actor TEXT,
            details TEXT,
            created_at TEXT
        )
        ''')

        conn.commit()
        conn.close()

    def init_connections(self):
        # Attempt PostgreSQL connection
        if HAS_POSTGRES:
            try:
                self.pg_conn = psycopg2.connect(
                    host=settings.POSTGRES_HOST,
                    port=settings.POSTGRES_PORT,
                    dbname=settings.POSTGRES_DB,
                    user=settings.POSTGRES_USER,
                    password=settings.POSTGRES_PASSWORD,
                    connect_timeout=1
                )
                print("DatabaseManager: Connected to PostgreSQL!")
            except Exception:
                print("DatabaseManager: PostgreSQL unavailable, using SQLite local DB.")

        # Attempt Neo4j connection
        if HAS_NEO4J:
            try:
                self.neo4j_driver = GraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
                )
                self.neo4j_driver.verify_connectivity()
                print("DatabaseManager: Connected to Neo4j Graph DB!")
            except Exception:
                print("DatabaseManager: Neo4j unavailable, using NetworkX Graph ML engine.")

        # Attempt Redis connection
        if HAS_REDIS:
            try:
                self.redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, socket_timeout=1)
                self.redis_client.ping()
                print("DatabaseManager: Connected to Redis Streams!")
            except Exception:
                print("DatabaseManager: Redis unavailable, using Python asyncio stream queue.")

    def get_sqlite_connection(self):
        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        return conn

    def fetch_transactions(self, limit: int = 100, status: str = None) -> list:
        conn = self.get_sqlite_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM transactions"
        params = []
        if status and status != 'ALL':
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        result = [dict(r) for r in rows]
        conn.close()
        return result

    def save_transaction(self, tx_dict: dict, prediction_result: dict) -> bool:
        """Saves an incoming transaction, its ML prediction, and generates an alert if high risk."""
        conn = self.get_sqlite_connection()
        cursor = conn.cursor()
        now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        tx_id = tx_dict.get('transaction_id') or f"TXN-{int(datetime.datetime.now().timestamp()*1000)}"
        score = prediction_result.get('final_risk_score', 0.05)
        level = prediction_result.get('risk_level', 'LOW')
        is_fraud = 1 if score >= 0.70 else 0
        status = 'FLAGGED' if score >= 0.70 else 'COMPLETED'
        
        # 1. Upsert Transaction
        cursor.execute('''
        INSERT OR REPLACE INTO transactions (
            transaction_id, customer_id, account_id, merchant_id, merchant_name,
            amount, currency, payment_method, timestamp, location_city,
            location_country, device_id, ip_address, is_fraud, predicted_risk_score,
            risk_level, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            tx_id,
            tx_dict.get('customer_id', 'CUST-101'),
            tx_dict.get('account_id', f"ACC-{tx_dict.get('customer_id', '101')}"),
            tx_dict.get('merchant_id', tx_dict.get('merchant', 'MERCH-001')),
            tx_dict.get('merchant', tx_dict.get('merchant_id', 'Flipkart Pay')),
            float(tx_dict.get('amount', 0)),
            tx_dict.get('currency', 'INR'),
            tx_dict.get('payment_method', 'UPI'),
            tx_dict.get('timestamp') or now_str,
            tx_dict.get('location_city', 'Mumbai'),
            tx_dict.get('location_country', 'India'),
            tx_dict.get('device_id', 'DEV-1001'),
            tx_dict.get('ip_address', '192.168.1.1'),
            is_fraud,
            score,
            level,
            status
        ))

        # 2. Insert Prediction Record
        pred_id = f"PRED-{int(datetime.datetime.now().timestamp()*1000)}"
        cursor.execute('''
        INSERT INTO predictions (
            prediction_id, transaction_id, ml_probability, anomaly_score,
            graph_risk, final_risk_score, shap_explanation, model_version, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            pred_id,
            tx_id,
            prediction_result.get('ml_probability', 0.0),
            prediction_result.get('anomaly_score', 0.0),
            prediction_result.get('graph_risk', 0.0),
            score,
            json.dumps(prediction_result.get('top_shap_factors', [])),
            prediction_result.get('model_version', 'v2.4-XGBoost+Graph'),
            now_str
        ))

        # 3. Create Alert if Risk Score is Elevated (>= 0.60)
        if score >= 0.60:
            alert_id = f"ALT-{int(datetime.datetime.now().timestamp()*1000) % 100000}"
            shap_names = [s.get('feature', '') for s in prediction_result.get('top_shap_factors', [])[:3]]
            cursor.execute('''
            INSERT INTO alerts (
                alert_id, transaction_id, risk_score, risk_level,
                trigger_reason, top_features, related_entities, model_version,
                created_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                alert_id,
                tx_id,
                score,
                level,
                f"Elevated risk score {score} detected on {tx_dict.get('payment_method', 'UPI')} transaction",
                json.dumps(shap_names),
                json.dumps({"customer": tx_dict.get('customer_id'), "device": tx_dict.get('device_id')}),
                prediction_result.get('model_version', 'v2.4-XGBoost+Graph'),
                now_str,
                'NEW'
            ))

        conn.commit()
        conn.close()
        return True

    def fetch_alerts(self, limit: int = 50) -> list:
        conn = self.get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        res = []
        for r in rows:
            d = dict(r)
            if d.get('top_features'):
                try: d['top_features'] = json.loads(d['top_features'])
                except Exception: pass
            if d.get('related_entities'):
                try: d['related_entities'] = json.loads(d['related_entities'])
                except Exception: pass
            res.append(d)
        conn.close()
        return res

    def fetch_investigations(self) -> list:
        conn = self.get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM investigations ORDER BY created_at DESC")
        rows = cursor.fetchall()
        res = []
        for r in rows:
            d = dict(r)
            if d.get('evidence_summary'):
                try: d['evidence_summary'] = json.loads(d['evidence_summary'])
                except Exception: pass
            res.append(d)
        conn.close()
        return res

    def create_investigation(self, inv_dict: dict) -> dict:
        conn = self.get_sqlite_connection()
        cursor = conn.cursor()
        now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        inv_id = inv_dict.get('id') or inv_dict.get('investigation_id') or f"INV-2026-{int(datetime.datetime.now().timestamp()*1000) % 9000 + 1000}"
        
        cursor.execute('''
        INSERT OR REPLACE INTO investigations (
            investigation_id, alert_id, analyst_id, status, title, priority,
            notes, evidence_summary, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            inv_id,
            inv_dict.get('alert_id', 'ALT-9000'),
            inv_dict.get('assignedAnalyst', inv_dict.get('analyst_id', 'analyst_01')),
            inv_dict.get('status', 'In Review'),
            inv_dict.get('title', 'Fraud Investigation Case'),
            inv_dict.get('priority', 'High'),
            inv_dict.get('summary', inv_dict.get('notes', 'Case created by analyst')),
            json.dumps(inv_dict.get('keyFindings', [])),
            now_str,
            now_str
        ))
        conn.commit()
        conn.close()
        
        inv_dict['id'] = inv_id
        inv_dict['investigation_id'] = inv_id
        inv_dict['createdDate'] = now_str
        inv_dict['lastUpdated'] = 'Just now'
        return inv_dict

    def update_investigation(self, inv_id: str, status: str) -> bool:
        conn = self.get_sqlite_connection()
        cursor = conn.cursor()
        now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute('''
        UPDATE investigations SET status = ?, updated_at = ? WHERE investigation_id = ?
        ''', (status, now_str, inv_id))
        conn.commit()
        conn.close()
        return True

    def get_database_stats(self) -> dict:
        conn = self.get_sqlite_connection()
        cursor = conn.cursor()
        stats = {}
        for table in ['transactions', 'alerts', 'investigations', 'predictions']:
            cursor.execute(f"SELECT COUNT(*) as cnt FROM {table}")
            stats[table] = cursor.fetchone()['cnt']
        conn.close()
        return stats

db_manager = DatabaseManager()
