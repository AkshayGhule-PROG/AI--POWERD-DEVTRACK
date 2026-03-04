from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.llm_service import LLMService

router = APIRouter()
llm_service = LLMService()


class ChangedFile(BaseModel):
    filename: str
    status: str
    patch: Optional[str] = ""


class StoryInput(BaseModel):
    id: str
    title: str
    acceptanceCriteria: List[str]


class AnalyzeRequest(BaseModel):
    project_id: str
    changed_files: List[ChangedFile]
    stories: List[StoryInput]
    commit_sha: str
    commit_message: str


@router.post("/analyze")
async def analyze_code(req: AnalyzeRequest):
    """Analyze changed files against story acceptance criteria using LLM."""

    results = []

    for story in req.stories:
        # Compile code evidence from changed files
        code_snippets = []
        for f in req.changed_files:
            if f.patch:
                code_snippets.append(f"File: {f.filename}\n{f.patch[:2000]}")

        if not code_snippets:
            results.append({
                "storyId": story.id,
                "status": "not_started",
                "evidence": [],
            })
            continue

        combined_code = "\n\n---\n\n".join(code_snippets[:5])  # limit context

        result = llm_service.validate_code_against_story(
            story_title=story.title,
            acceptance_criteria=story.acceptanceCriteria,
            code_diff=combined_code,
            commit_message=req.commit_message,
        )

        results.append({
            "storyId": story.id,
            "status": result["status"],
            "evidence": result.get("evidence", []),
            "reasoning": result.get("reasoning", ""),
        })

    return {"success": True, "results": results}
