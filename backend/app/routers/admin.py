"""Admin Dashboard API endpoints."""

from fastapi import APIRouter, HTTPException
from app.services import professional_reporting_service

router = APIRouter()


@router.post("/cohorts/create")
async def create_cohort(payload: dict):
    """Create a new cohort."""
    cohort_id = payload.get("cohort_id")
    name = payload.get("name", "")
    user_ids = payload.get("user_ids", [])
    
    if not cohort_id:
        raise HTTPException(status_code=400, detail="cohort_id is required")
    
    cohort = professional_reporting_service._professional_reporting.create_cohort(
        cohort_id, name, user_ids
    )
    return {"cohort": cohort}


@router.get("/cohorts")
async def list_cohorts():
    """List available cohorts."""
    cohorts = await professional_reporting_service.list_cohorts()
    return {"cohorts": cohorts}


@router.get("/cohorts/{cohort_id}/analytics")
async def get_cohort_analytics_endpoint(cohort_id: str, start_date: str | None = None, end_date: str | None = None):
    """Get analytics for a cohort."""
    date_range = None
    if start_date and end_date:
        date_range = {"start": start_date, "end": end_date}
    
    analytics = await professional_reporting_service.get_cohort_analytics(cohort_id, date_range)
    return {"analytics": analytics}


@router.get("/cohorts/{cohort_id}/report")
async def get_cohort_report(
    cohort_id: str,
    format: str = "json",
    start_date: str | None = None,
    end_date: str | None = None,
):
    """Generate and download cohort report."""
    date_range = None
    if start_date and end_date:
        date_range = {"start": start_date, "end": end_date}
    
    report = await professional_reporting_service.generate_cohort_report(
        cohort_id, format, date_range
    )
    return report


@router.get("/users/{user_id}/progress")
async def get_user_progress(user_id: str):
    """Get detailed progress report for a user."""
    report = await professional_reporting_service.get_user_progress_report(user_id)
    return {"report": report}


@router.get("/users")
async def list_users(cohort_id: str | None = None):
    """List users optionally filtered by cohort."""
    users = await professional_reporting_service.list_users(cohort_id)
    return {"users": users}


@router.post("/cohorts/{cohort_id}/users")
async def add_user_to_cohort(cohort_id: str, payload: dict):
    """Add user to cohort."""
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    success = professional_reporting_service._professional_reporting.add_user_to_cohort(
        cohort_id, user_id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Cohort not found")
    
    return {"status": "added", "cohort_id": cohort_id, "user_id": user_id}
