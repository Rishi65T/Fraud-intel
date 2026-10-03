import os
import sys
import json
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from rag.embeddings.embedder import LocalEmbedder

KNOWLEDGE_BASE_PATH = os.path.join(PROJECT_ROOT, 'rag', 'documents', 'fraud_knowledge_base.json')

class LocalVectorSearch:
    def __init__(self):
        self.embedder = LocalEmbedder()
        self.documents = []
        self.doc_embeddings = None
        self.load_and_index_documents()

    def load_and_index_documents(self):
        if os.path.exists(KNOWLEDGE_BASE_PATH):
            with open(KNOWLEDGE_BASE_PATH, 'r') as f:
                self.documents = json.load(f)
            texts = [f"{d['title']} - {d['category']}: {d['content']}" for d in self.documents]
            self.doc_embeddings = self.embedder.encode(texts)
            print(f"Indexed {len(self.documents)} knowledge base documents into Local Vector Store.")

    def search(self, query: str, top_k: int = 3) -> list:
        if not self.documents or self.doc_embeddings is None:
            return []

        query_vec = self.embedder.encode([query])[0]
        
        # Cosine similarity calculation
        scores = np.dot(self.doc_embeddings, query_vec) / (
            np.linalg.norm(self.doc_embeddings, axis=1) * np.linalg.norm(query_vec) + 1e-8
        )
        
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            doc = self.documents[idx].copy()
            doc['similarity_score'] = round(float(scores[idx]), 4)
            results.append(doc)
            
        return results

if __name__ == '__main__':
    searcher = LocalVectorSearch()
    res = searcher.search("What happens if a device is shared across accounts?")
    print("Top RAG Document Match:", json.dumps(res[0], indent=2))
