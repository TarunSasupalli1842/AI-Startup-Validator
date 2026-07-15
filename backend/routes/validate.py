from fastapi import APIRouter, HTTPException
import logging
from models.validation import StartupIdeaInput, ValidationReportResponse
from agents.orchestrator import ValidationOrchestrator

logger = logging.getLogger(__name__)

router = APIRouter()
orchestrator = ValidationOrchestrator()

@router.post("/validate", response_model=ValidationReportResponse)
async def validate_startup_idea(payload: StartupIdeaInput):
    """
    Submits a startup idea and runs the multi-agent validation report pipeline.
    """
    logger.info(f"Received startup validation request for: '{payload.name}'")
    try:
        report = await orchestrator.validate_idea(payload)
        return report
    except Exception as e:
        logger.error(f"Error handling validation endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during startup validation: {str(e)}"
        )
