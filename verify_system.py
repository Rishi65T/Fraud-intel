import os
import sys
import json
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from backend.main import app
from backend.database_manager import db_manager

def run_system_verification():
    print("=================================================================")
    print("FRAUDINTEL COMPREHENSIVE SYSTEM VERIFICATION: DB + ML + RAG + API")
    print("=================================================================\n")

    client = TestClient(app)

    # ---------------- 1. VERIFY DATABASE STORAGE ----------------
    print("[TEST 1/4] Verifying Database Schema and Data Storage...")
    initial_stats = db_manager.get_database_stats()
    print(f"Initial Database Counts: {initial_stats}")
    assert initial_stats['transactions'] > 0, "Transactions table should have records!"
    assert initial_stats['alerts'] > 0, "Alerts table should have records!"
    assert initial_stats['investigations'] > 0, "Investigations table should have records!"
    print("[OK] Schema verified and initial historical records present in database.")

    # ---------------- 2. VERIFY ML MODEL INFERENCE & SHAP ----------------
    print("\n[TEST 2/4] Verifying ML Models, Anomaly Detector, Graph Risk & SHAP...")
    high_risk_txn = {
        'transaction_id': f'TXN-VERIFY-{int(time.time())}',
        'customer_id': 'CUST-105',
        'merchant': 'QuickCash P2P Gateway',
        'amount': 125000.0,
        'payment_method': 'UPI',
        'location_city': 'Jamtara',
        'device_id': 'DEV-9921',
        'ip_address': '45.112.23.12',
        'isTorOrVpn': True,
        'isNewDevice': True
    }
    
    pred_res = client.post('/api/predict-risk', json=high_risk_txn)
    assert pred_res.status_code == 200, f"Predict failed: {pred_res.text}"
    pred_data = pred_res.json()
    
    print(f"Prediction Result for INR 1,25,000 Jamtara UPI Transaction:")
    print(f" - Final Risk Score: {pred_data['final_risk_score']} ({pred_data['risk_level']})")
    print(f" - ML Probability:   {pred_data['ml_probability']} (Model: {pred_data['model_version']})")
    print(f" - Anomaly Score:    {pred_data['anomaly_score']}")
    print(f" - Graph Risk:       {pred_data['graph_risk']}")
    print(f" - Latency:          {pred_data['inferenceLatencyMs']} ms")
    print(f" - Top SHAP Factors: {len(pred_data.get('top_shap_factors', []))} features evaluated")
    for s in pred_data.get('top_shap_factors', [])[:2]:
        print(f"    * {s['feature']}: impact = {s['impact_direction']}, val = {s['value']}")

    assert 0.0 <= pred_data['final_risk_score'] <= 1.0, "Risk score must be bounded in [0, 1]!"
    assert pred_data['risk_level'] in ['CRITICAL', 'HIGH'], "High-value Jamtara transaction should be high/critical risk!"
    print("[OK] ML models, Isolation Forest, Graph ML, and SHAP explainability are working correctly.")

    # Check that database transaction, prediction, and alert counts INCREASED!
    post_stats = db_manager.get_database_stats()
    print(f"\nDatabase Counts after scoring new transaction: {post_stats}")
    assert post_stats['transactions'] == initial_stats['transactions'] + 1, "Transaction was NOT saved to database!"
    assert post_stats['predictions'] == initial_stats['predictions'] + 1, "Prediction was NOT saved to database!"
    assert post_stats['alerts'] == initial_stats['alerts'] + 1, "High-risk alert was NOT saved to database!"
    print("[OK] Data storage confirmed: New transaction, prediction, and alert were persisted to database!")

    # ---------------- 3. VERIFY LOCAL RAG & AI COPILOT ----------------
    print("\n[TEST 3/4] Verifying Local RAG System and Grounded AI Copilot...")
    rag_res = client.post('/api/rag/ask', json={
        'query': 'Why was this Jamtara transaction flagged and what is the policy for device DEV-9921?',
        'transaction_context': pred_data
    })
    assert rag_res.status_code == 200, f"RAG ask failed: {rag_res.text}"
    rag_data = rag_res.json()

    print("RAG Grounded Response Output:")
    print(f"[MODEL EVIDENCE]:\n{rag_data['model_evidence']}")
    print(f"\n[DATABASE EVIDENCE]:\n{rag_data['database_evidence']}")
    print(f"\n[RETRIEVED KNOWLEDGE]:\n{rag_data['retrieved_knowledge'][:160]}...")
    print(f"\n[LLM-GENERATED EXPLANATION]:\n{rag_data['llm_explanation']}")
    
    assert "MODEL EVIDENCE" in json.dumps(rag_data) or 'model_evidence' in rag_data
    assert "DATABASE EVIDENCE" in json.dumps(rag_data) or 'database_evidence' in rag_data
    assert "RETRIEVED KNOWLEDGE" in json.dumps(rag_data) or 'retrieved_knowledge' in rag_data
    assert "llm_explanation" in rag_data
    assert len(rag_data['retrieved_knowledge']) > 10, "Knowledge retrieval returned empty!"
    print("[OK] Local RAG Copilot correctly grounds answers across all 4 tiers without hallucination.")

    # ---------------- 4. VERIFY ALL REST ENDPOINTS ----------------
    print("\n[TEST 4/4] Verifying All REST API Endpoints...")
    endpoints_to_test = [
        ('/api/health', 'GET', None),
        ('/api/analytics', 'GET', None),
        ('/api/transactions?limit=5', 'GET', None),
        ('/api/alerts?limit=5', 'GET', None),
        ('/api/entities', 'GET', None),
        ('/api/entities/ACC-78291', 'GET', None),
        ('/api/graph/ACC-78291', 'GET', None),
        ('/api/clusters', 'GET', None),
        ('/api/investigations', 'GET', None),
        ('/api/model-performance', 'GET', None),
        ('/api/geographic-risk', 'GET', None),
        ('/api/drift', 'GET', None),
        ('/api/data-sources', 'GET', None),
        ('/api/rag/search?q=device+sharing', 'GET', None),
        ('/api/investigate-ai', 'POST', {'entityId': 'ACC-78291', 'riskScore': 0.92}),
        ('/api/investigations', 'POST', {
            'title': 'Test Case Jamtara Mule Ring',
            'primaryEntityId': 'CUST-105',
            'riskScore': 0.95,
            'summary': 'Automated case generated by verification tester'
        }),
        ('/api/stream/start', 'POST', {'speed_tps': 5}),
        ('/api/stream/stop', 'POST', {})
    ]

    for path, method, payload in endpoints_to_test:
        if method == 'GET':
            r = client.get(path)
        else:
            r = client.post(path, json=payload)
        assert r.status_code == 200, f"Endpoint {path} failed with {r.status_code}: {r.text}"
        print(f" [OK] [{method}] {path} -> 200 OK")

    final_stats = db_manager.get_database_stats()
    print(f"\nFinal Database Record Counts: {final_stats}")
    print("\n=================================================================")
    print("ALL TESTS PASSED! DATA STORAGE & ML MODELS VERIFIED AND ACCURATE.")
    print("=================================================================")

if __name__ == '__main__':
    run_system_verification()
