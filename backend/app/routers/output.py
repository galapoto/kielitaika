from fastapi import APIRouter

from app.services import micro_output_engine

router = APIRouter()


@router.get("/micro")
async def micro_task(user_id: str | None = None):
    """Return a 10-second micro output task."""
    task = micro_output_engine.generate_micro_task(user_id)
    return {"task": task}


@router.post("/micro/evaluate")
async def micro_task_evaluate(payload: dict):
    """Return quick heuristic feedback for a completed micro task."""
    task_id = payload.get("task_id", "")
    transcript = payload.get("transcript", "")
    return {"result": micro_output_engine.evaluate_micro_task(task_id, transcript)}

