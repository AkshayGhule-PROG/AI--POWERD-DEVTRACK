import os
import json
from typing import List, Dict, Any


STORY_GENERATION_PROMPT = """You are an expert Agile Scrum Master AI assistant for the project "{project_name}".

Module: {module_name}
{constraints}

Context from SRS document:
{context}

Additional context: {additional_context}

Generate a complete Agile breakdown for the "{module_name}" module. Return ONLY valid JSON with this exact structure:

{{
  "epics": [
    {{
      "tempId": "epic-1",
      "title": "Epic title",
      "description": "Epic description",
      "sprint": "S1",
      "priority": "high"
    }}
  ],
  "stories": [
    {{
      "tempId": "story-1",
      "epicTempId": "epic-1",
      "type": "story",
      "title": "As a [role], I can [action] so that [benefit]",
      "description": "Detailed description",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"],
      "sprint": "S1",
      "priority": "high",
      "storyPoints": 5
    }}
  ],
  "tasks": [
    {{
      "tempId": "task-1",
      "epicTempId": "epic-1",
      "type": "task",
      "title": "Technical task title",
      "description": "Technical description",
      "acceptanceCriteria": ["Technical criterion 1"],
      "sprint": "S1",
      "priority": "medium",
      "storyPoints": 3
    }}
  ],
  "subtasks": [
    {{
      "parentTempId": "story-1",
      "epicTempId": "epic-1",
      "type": "subtask",
      "title": "Specific subtask title",
      "description": "Specific implementation detail",
      "acceptanceCriteria": ["Subtask done criterion"],
      "sprint": "S1",
      "priority": "medium",
      "storyPoints": 1
    }}
  ]
}}

Rules:
- Generate 1-2 epics, 3-5 user stories, 3-5 technical tasks, 4-8 subtasks
- User stories must follow \"As a [role], I can [action] so that [benefit]\" format
- Each story/task must have 2-4 specific, testable acceptance criteria
- Subtasks are small implementation steps that belong to a parent story or task (use parentTempId)
- Assign realistic story points: stories(3-8), tasks(2-5), subtasks(1-2)
- Sprint values: S1, S2, S3 or S4
- Priority values: highest, high, medium, low, lowest
- Return ONLY the JSON object, no markdown, no explanation"""


CODE_ANALYSIS_PROMPT = """You are a code analysis AI. Determine if the following code changes satisfy a user story's acceptance criteria.

Story: {story_title}

Acceptance Criteria:
{acceptance_criteria}

Code Diff:
{code_diff}

Commit Message: {commit_message}

Analyze whether the code changes implement this story. Return ONLY valid JSON:

{{
  "status": "done|partial|not_started",
  "reasoning": "Brief explanation of your decision",
  "evidence": [
    {{
      "filePath": "src/example.js",
      "lineStart": 1,
      "lineEnd": 10,
      "description": "Implements the login form validation"
    }}
  ],
  "criteriamet": ["Criterion that is met", ...]
}}

Status guide:
- "done": All acceptance criteria clearly met by the code
- "partial": Some criteria met but not all
- "not_started": No evidence of implementation in changes"""


class LLMService:
    """
    Uses OpenRouter (https://openrouter.ai) which provides FREE AI models.
    Set OPENROUTER_API_KEY in .env — free signup, no credit card needed.
    Free model: google/gemini-2.0-flash-exp:free
    """
    def __init__(self):
        self.model = os.getenv("LLM_MODEL", "google/gemini-2.0-flash-exp:free")
        self.max_tokens = int(os.getenv("MAX_TOKENS", 4096))
        self._client = None

    def _get_client(self):
        if not self._client:
            from openai import OpenAI
            api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
            self._client = OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1",
                default_headers={
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "DevTrack AI",
                },
            )
        return self._client

    # Free models to try in order if one is rate-limited or unavailable
    FREE_MODELS = [
        "google/gemma-3-27b-it:free",
        "google/gemma-3-12b-it:free",
        "google/gemma-3-9b-it:free",
        "mistralai/mistral-7b-instruct:free",
        "meta-llama/llama-3.3-70b-instruct:free",
    ]

    def _call_llm(self, prompt: str, temperature: float = 0.3) -> str:
        client = self._get_client()
        # Try primary model first, then fallbacks
        models_to_try = [self.model] + [m for m in self.FREE_MODELS if m != self.model]
        last_error = None
        for model in models_to_try:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                    max_tokens=self.max_tokens,
                )
                return response.choices[0].message.content
            except Exception as e:
                err = str(e)
                if '429' in err or '404' in err or 'rate' in err.lower() or 'not found' in err.lower():
                    last_error = e
                    continue  # try next model
                raise  # non-rate-limit error, re-raise immediately
        raise last_error

    def generate_stories(
        self,
        project_name: str,
        module_name: str,
        context: str,
        additional_context: str = "",
        constraints: str = "",
    ) -> Dict[str, Any]:
        prompt = STORY_GENERATION_PROMPT.format(
            project_name=project_name,
            module_name=module_name,
            context=context or "No SRS document ingested yet.",
            additional_context=additional_context or "None",
            constraints=constraints or "",
        )

        raw = self._call_llm(prompt, temperature=0.4)

        # Parse JSON (handle markdown code blocks)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            # Attempt to extract JSON from response
            import re
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                result = json.loads(match.group())
            else:
                raise ValueError(f"LLM returned invalid JSON: {raw[:200]}")

        return result

    def validate_code_against_story(
        self,
        story_title: str,
        acceptance_criteria: List[str],
        code_diff: str,
        commit_message: str,
    ) -> Dict[str, Any]:
        criteria_text = "\n".join(f"- {c}" for c in acceptance_criteria)

        prompt = CODE_ANALYSIS_PROMPT.format(
            story_title=story_title,
            acceptance_criteria=criteria_text,
            code_diff=code_diff[:3000],
            commit_message=commit_message,
        )

        raw = self._call_llm(prompt, temperature=0.1)
        raw = raw.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"status": "not_started", "reasoning": "Analysis failed", "evidence": []}
