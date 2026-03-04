import os


def parse_document(file_path: str, file_type: str) -> str:
    """Extract text from PDF, DOCX, or TXT files."""
    file_type = file_type.lower()

    if file_type == "pdf":
        return _parse_pdf(file_path)
    elif file_type in ("docx", "doc"):
        return _parse_docx(file_path)
    elif file_type == "txt":
        return _parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def _parse_pdf(file_path: str) -> str:
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except ImportError:
        # Fallback: try pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                return "\n".join(p.extract_text() or "" for p in pdf.pages).strip()
        except Exception as e:
            raise RuntimeError(f"PDF parsing failed: {e}")


def _parse_docx(file_path: str) -> str:
    try:
        from docx import Document
        doc = Document(file_path)
        return "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    except Exception as e:
        raise RuntimeError(f"DOCX parsing failed: {e}")


def _parse_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()
