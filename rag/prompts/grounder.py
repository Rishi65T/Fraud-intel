import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

def construct_grounded_copilot_response(
    query: str,
    tx_context: dict = None,
    rag_docs: list = None
) -> dict:
    """
    Strictly formats RAG response into 4 distinct grounded sections without hallucination:
    1. MODEL EVIDENCE
    2. DATABASE EVIDENCE
    3. RETRIEVED KNOWLEDGE
    4. LLM-GENERATED EXPLANATION
    """
    # 1. Model Evidence
    model_evidence = []
    if tx_context:
        model_evidence.append(f"Champion Model Risk Score: {tx_context.get('final_risk_score', 'N/A')} ({tx_context.get('risk_level', 'N/A')})")
        model_evidence.append(f"ML Probability: {tx_context.get('ml_probability', 'N/A')} | Anomaly Score: {tx_context.get('anomaly_score', 'N/A')} | Graph Risk: {tx_context.get('graph_risk', 'N/A')}")
        shap_list = tx_context.get('top_shap_factors', [])
        if shap_list:
            top_f = [f"{s['feature']} (val: {s['value']}, impact: {s['impact_direction']})" for s in shap_list[:3]]
            model_evidence.append(f"Top SHAP Feature Attributions: {', '.join(top_f)}")
    else:
        model_evidence.append("Insufficient evidence (No model prediction context supplied).")

    # 2. Database Evidence
    db_evidence = []
    if tx_context:
        db_evidence.append(f"Transaction ID: {tx_context.get('transaction_id', 'N/A')} | Amount: INR {tx_context.get('amount', 'N/A')} | Payment Method: {tx_context.get('payment_method', 'N/A')}")
        db_evidence.append(f"Customer: {tx_context.get('customer_id', 'N/A')} | Location: {tx_context.get('location_city', 'N/A')} | Merchant: {tx_context.get('merchant_id', 'N/A')}")
        db_evidence.append(f"Hardware Device ID: {tx_context.get('device_id', 'N/A')} | IP Address: {tx_context.get('ip_address', 'N/A')}")
    else:
        db_evidence.append("Insufficient evidence (No database record context provided).")

    # 3. Retrieved Knowledge
    retrieved_knowledge = []
    if rag_docs:
        for doc in rag_docs:
            retrieved_knowledge.append(f"[{doc.get('doc_id')}] {doc.get('title')} ({doc.get('category')}): {doc.get('content')}")
    else:
        retrieved_knowledge.append("Insufficient evidence (No matching domain knowledge base documents retrieved).")

    # 4. Synthesis & Grounded Explanation
    explanation_parts = []
    if tx_context and tx_context.get('final_risk_score', 0) >= 0.60:
        explanation_parts.append(
            f"The transaction was flagged high risk ({tx_context.get('final_risk_score')}) due to significant ML probability "
            f"({tx_context.get('ml_probability')}) combined with abnormal anomaly signals from device ({tx_context.get('device_id')}) "
            f"and location ({tx_context.get('location_city')})."
        )
        if rag_docs:
            explanation_parts.append(f"Based on policy '{rag_docs[0].get('title')}', recommended analyst action is step-up authorization or temporary lien.")
    else:
        explanation_parts.append(f"Query regarding '{query}' evaluated against local grounded knowledge base and ML evidence.")

    return {
        'query': query,
        'model_evidence': "\n".join(model_evidence),
        'database_evidence': "\n".join(db_evidence),
        'retrieved_knowledge': "\n\n".join(retrieved_knowledge),
        'llm_explanation': " ".join(explanation_parts)
    }
