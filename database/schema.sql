-- FRAUDINTEL PostgreSQL Database Schema
-- Stores transactions, entities, alerts, investigations, model predictions, and audit logs

CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128),
    email VARCHAR(128),
    phone VARCHAR(32),
    account_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    country VARCHAR(64) DEFAULT 'India',
    risk_level VARCHAR(32) DEFAULT 'LOW',
    historical_fraud_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accounts (
    account_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(customer_id),
    account_type VARCHAR(32) DEFAULT 'SAVINGS',
    balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS merchants (
    merchant_id VARCHAR(64) PRIMARY KEY,
    merchant_name VARCHAR(128),
    category VARCHAR(64),
    risk_score NUMERIC(5, 4) DEFAULT 0.05,
    fraud_rate NUMERIC(5, 4) DEFAULT 0.01,
    total_volume NUMERIC(18, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(64) PRIMARY KEY,
    device_type VARCHAR(64),
    os VARCHAR(64),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_accounts_count INT DEFAULT 1,
    is_suspicious BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(customer_id),
    account_id VARCHAR(64) REFERENCES accounts(account_id),
    merchant_id VARCHAR(64) REFERENCES merchants(merchant_id),
    device_id VARCHAR(64) REFERENCES devices(device_id),
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'INR',
    payment_method VARCHAR(32) NOT NULL, -- UPI, CARD, NETBANKING, WIRE
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location_city VARCHAR(64),
    location_country VARCHAR(64) DEFAULT 'India',
    ip_address VARCHAR(45),
    is_fraud INT DEFAULT 0, -- Ground truth label: 0 or 1
    predicted_risk_score NUMERIC(5, 4),
    risk_level VARCHAR(32), -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(32) DEFAULT 'COMPLETED'
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) REFERENCES transactions(transaction_id),
    risk_score NUMERIC(5, 4) NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    trigger_reason VARCHAR(256) NOT NULL,
    top_features JSONB,
    related_entities JSONB,
    model_version VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) DEFAULT 'NEW' -- NEW, INVESTIGATING, CONFIRMED_FRAUD, DISMISSED
);

CREATE TABLE IF NOT EXISTS investigations (
    investigation_id VARCHAR(64) PRIMARY KEY,
    alert_id VARCHAR(64) REFERENCES alerts(alert_id),
    analyst_id VARCHAR(64) DEFAULT 'analyst_01',
    status VARCHAR(32) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, ESCALATED, CLOSED_FRAUD, CLOSED_FALSE_POSITIVE
    notes TEXT,
    evidence_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_metadata (
    model_id VARCHAR(64) PRIMARY KEY,
    model_name VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL,
    algorithm VARCHAR(64) NOT NULL,
    pr_auc NUMERIC(6, 5),
    roc_auc NUMERIC(6, 5),
    f1_score NUMERIC(6, 5),
    precision NUMERIC(6, 5),
    recall NUMERIC(6, 5),
    feature_count INT,
    trained_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS predictions (
    prediction_id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) REFERENCES transactions(transaction_id),
    ml_probability NUMERIC(5, 4),
    anomaly_score NUMERIC(5, 4),
    graph_risk NUMERIC(5, 4),
    final_risk_score NUMERIC(5, 4),
    shap_explanation JSONB,
    model_version VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id SERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    actor VARCHAR(64) DEFAULT 'SYSTEM',
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
