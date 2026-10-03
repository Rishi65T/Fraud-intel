import os
import sys
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

class LocalEmbedder:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._load_attempted = False

    def _ensure_model(self):
        if not self._load_attempted:
            self._load_attempted = True
            if HAS_SENTENCE_TRANSFORMERS:
                try:
                    print(f"Loading local embedding model: {self.model_name}...")
                    self.model = SentenceTransformer(self.model_name)
                    print("Local embedding model loaded successfully!")
                except Exception as e:
                    print(f"SentenceTransformer fallback: {e}")
                    self.model = None

    def encode(self, texts: list) -> np.ndarray:
        self._ensure_model()
        if self.model is not None:
            try:
                embeddings = self.model.encode(texts, convert_to_numpy=True)
                return embeddings
            except Exception as e:
                print(f"Embedding encoding fallback: {e}")

        # Deterministic TF-IDF / Bag of words hash vector fallback (384-dims)
        vectors = []
        for text in texts:
            vec = np.zeros(384, dtype=np.float32)
            words = text.lower().split()
            for idx, word in enumerate(words):
                h = abs(hash(word)) % 384
                vec[h] += 1.0
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            vectors.append(vec)
        return np.array(vectors)

if __name__ == '__main__':
    embedder = LocalEmbedder()
    res = embedder.encode(["UPI Velocity attack pattern", "Device sharing policy"])
    print("Embedded vectors shape:", res.shape)
