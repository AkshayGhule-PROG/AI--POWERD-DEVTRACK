import os
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.document_parser import parse_document
from services.embeddings import EmbeddingService

router = APIRouter()
embedding_service = EmbeddingService()


class IngestRequest(BaseModel):
    document_id: str
    file_path: str
    file_type: str
    namespace: str
    project_id: str


@router.post("/ingest")
async def ingest_document(req: IngestRequest):
    """Extract text from SRS document, chunk it, embed and store in vector DB."""
    start = time.time()

    if not os.path.exists(req.file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {req.file_path}")

    # Parse document
    text = parse_document(req.file_path, req.file_type)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from document")

    # Chunk, embed, store
    result = embedding_service.ingest(
        text=text,
        namespace=req.namespace,
        metadata={"document_id": req.document_id, "project_id": req.project_id},
    )

    elapsed = int((time.time() - start) * 1000)

    return {
        "success": True,
        "chunks": result["chunks"],
        "embeddings": result["embeddings"],
        "processingTime": elapsed,
    }
