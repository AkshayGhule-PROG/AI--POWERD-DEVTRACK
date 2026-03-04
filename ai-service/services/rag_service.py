import os
from typing import List
from services.embeddings import EmbeddingService


class RAGService:
    def __init__(self):
        self.embedding_service = EmbeddingService()

    def retrieve(self, query: str, project_id: str, top_k: int = 5) -> List[str]:
        """Retrieve relevant chunks from all namespaces for a project."""
        # Try to find project namespaces in ChromaDB
        try:
            import chromadb
            persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_store")
            client = chromadb.PersistentClient(path=persist_dir)

            # Find all collections with this project_id
            all_collections = client.list_collections()
            project_collections = [
                c for c in all_collections
                if project_id.replace("-", "_") in c.name
            ]

            if not project_collections:
                return []

            all_chunks = []
            for collection_info in project_collections:
                chunks = self.embedding_service.query(
                    query_text=query,
                    namespace=collection_info.name,
                    top_k=top_k,
                )
                all_chunks.extend(chunks)

            # Return unique top chunks
            seen = set()
            unique_chunks = []
            for chunk in all_chunks:
                if chunk not in seen:
                    seen.add(chunk)
                    unique_chunks.append(chunk)

            return unique_chunks[:top_k]

        except Exception as e:
            print(f"RAG retrieve error: {e}")
            return []
