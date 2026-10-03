import os
import sys
import json
import requests

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from rag.retrieval.search import LocalVectorSearch
from rag.prompts.grounder import construct_grounded_copilot_response

class LocalFraudCopilot:
    """
    RAG Copilot engine operating completely locally without external API keys.
    Integrates Local Vector Search + Ollama local model (if running) + grounded synthesis engine.
    """
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.searcher = LocalVectorSearch()
        self.ollama_url = ollama_url

    def ask_copilot(self, query: str, tx_context: dict = None) -> dict:
        # Retrieve relevant fraud knowledge base docs
        rag_docs = self.searcher.search(query, top_k=2)
        
        # Build 4-tier grounded evidence payload
        grounded_resp = construct_grounded_copilot_response(query, tx_context, rag_docs)
        
        # Try asking local Ollama model if available
        try:
            prompt = f"System: You are FraudIntel AI Copilot. Answer using ONLY grounded context.\nQuery: {query}\nEvidence: {grounded_resp['model_evidence']}\nKnowledge: {grounded_resp['retrieved_knowledge']}"
            res = requests.post(
                f"{self.ollama_url}/api/generate",
                json={"model": "llama3", "prompt": prompt, "stream": False},
                timeout=2
            )
            if res.status_code == 200:
                ollama_text = res.json().get('response', '')
                if ollama_text:
                    grounded_resp['llm_explanation'] = ollama_text
        except Exception:
            # Operates seamlessly using local deterministic synthesis engine when Ollama is offline
            pass

        return grounded_resp

if __name__ == '__main__':
    copilot = LocalFraudCopilot()
    ans = copilot.ask_copilot("Why was transaction TXN-99999 flagged high risk?", {
        'transaction_id': 'TXN-99999',
        'final_risk_score': 0.92,
        'risk_level': 'CRITICAL',
        'ml_probability': 0.98,
        'anomaly_score': 0.95,
        'graph_risk': 0.85,
        'amount': 85000.0,
        'payment_method': 'UPI',
        'customer_id': 'CUST-105',
        'location_city': 'Jamtara',
        'device_id': 'DEV-9921',
        'ip_address': '45.112.23.12',
        'top_shap_factors': [{'feature': 'is_jamtara', 'value': 1, 'impact_direction': 'INCREASED_RISK'}]
    })
    print("Local RAG Grounded Copilot Output:")
    print(json.dumps(ans, indent=2))
