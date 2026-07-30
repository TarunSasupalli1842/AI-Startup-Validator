from fastapi import APIRouter, HTTPException
import logging
from models.validation import StartupIdeaInput, ValidationReportResponse
from agents.orchestrator import ValidationOrchestrator
from services.input_validator import validate_startup_input

logger = logging.getLogger(__name__)

router = APIRouter()
orchestrator = ValidationOrchestrator()

@router.post("/validate", response_model=ValidationReportResponse)
async def validate_startup_idea(payload: StartupIdeaInput):
    """
    Submits a startup idea and runs the multi-agent validation report pipeline.
    Validates input quality and rejects gibberish or nonsensical submissions.
    """
    logger.info(f"Received startup validation request for: '{payload.name}'")
    
    # Run input sanity and gibberish validator
    is_valid, reason = await validate_startup_input(payload.model_dump())
    if not is_valid:
        logger.warning(f"Input validation rejected submission for '{payload.name}': {reason}")
        raise HTTPException(
            status_code=400,
            detail=f"Input Validation Failed: {reason}"
        )

    try:
        report = await orchestrator.validate_idea(payload)
        return report
    except ValueError as ve:
        logger.warning(f"Validation pipeline rejected input: {str(ve)}")
        raise HTTPException(
            status_code=400,
            detail=f"Input Validation Failed: {str(ve)}"
        )
    except Exception as e:
        logger.error(f"Error handling validation endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during startup validation: {str(e)}"
        )

