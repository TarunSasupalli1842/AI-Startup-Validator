from fastapi import APIRouter, HTTPException
import logging
from models.validation import (
    StartupIdeaInput, ValidationReportResponse,
    AdvisorChatRequest, AdvisorChatResponse,
    SwotAnalysis, RiskAnalysisData, MvpRecommendationData, GtmStrategyData
)
from agents.orchestrator import ValidationOrchestrator
from agents.advisor_agent import AdvisorAgent
from agents.swot_agent import SwotAgent
from agents.risk_agent import RiskAgent
from agents.mvp_agent import MvpRecommendationAgent
from agents.gtm_agent import GtmAgent
from agents.extraction_agent import ExtractionAgent
from agents.market_research_agent import MarketResearchAgent
from agents.market_opportunity_agent import MarketOpportunityAgent
from agents.customer_segmentation_agent import CustomerSegmentationAgent
from agents.competitor_analysis_agent import CompetitorAnalysisAgent
from services.input_validator import validate_startup_input

logger = logging.getLogger(__name__)

router = APIRouter()
orchestrator = ValidationOrchestrator()
advisor_agent = AdvisorAgent()
extraction_agent = ExtractionAgent()
market_research_agent = MarketResearchAgent()
market_opportunity_agent = MarketOpportunityAgent()
customer_segmentation_agent = CustomerSegmentationAgent()
competitor_agent = CompetitorAnalysisAgent()
swot_agent = SwotAgent()
risk_agent = RiskAgent()
mvp_agent = MvpRecommendationAgent()
gtm_agent = GtmAgent()

@router.post(
    "/validate", 
    response_model=ValidationReportResponse,
    tags=["Validation Pipeline"],
    summary="Run full 11-stage multi-agent startup validation report"
)
async def validate_startup_idea(payload: StartupIdeaInput):
    """
    Submits a startup idea and runs the comprehensive multi-agent validation pipeline:
    - Idea Extraction & Structuring
    - Live Web Market Research
    - TAM/SAM/SOM Opportunity & Unit Economics
    - Customer Segmentation & Personas
    - Competitor Moat & Comparison Matrix
    - SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
    - Multi-Pillar Risk Analysis (Market, Competitor, Financial, Tech, Ops, Customer)
    - MoSCoW MVP Roadmap (Must, Should, Could, Won't Have)
    - Go-To-Market Strategy (Positioning, Channels, Launch Phases, Pricing, KPIs, Getting Started)
    - Validation Scoring & Strategic Recommendations
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

@router.post(
    "/advisor/chat",
    response_model=AdvisorChatResponse,
    tags=["Conversational Startup Advisor"],
    summary="Interactive AI Startup Advisor Chatbot"
)
async def chat_with_advisor(request: AdvisorChatRequest):
    """
    Allows founders to ask follow-up questions about their validation report.
    Uses the startup's existing validation data as its contextual knowledge base.
    """
    logger.info(f"Received Advisor Chat question: '{request.message[:60]}'")
    try:
        response = await advisor_agent.chat(request)
        return response
    except Exception as e:
        logger.error(f"Advisor chat error: {str(e)}")
        return AdvisorChatResponse(
            reply="I encountered an issue processing your request. Please try again or rephrase your question.",
            suggested_followups=[
                "What should I build first?",
                "Why is my startup risky?",
                "How can I get my first 100 users?"
            ]
        )

@router.post(
    "/agents/swot",
    response_model=SwotAnalysis,
    tags=["Specialized Agents"],
    summary="Run SWOT Analysis Agent"
)
async def run_swot_analysis(payload: StartupIdeaInput):
    """Generates structured Strengths, Weaknesses, Opportunities, and Threats for the given idea."""
    input_dict = payload.model_dump()
    extracted = await extraction_agent.run(input_dict)
    research = await market_research_agent.run(extracted)
    opp = await market_opportunity_agent.run(extracted, research)
    comps = await competitor_agent.run(extracted)
    return await swot_agent.run(extracted, research, opp, comps)

@router.post(
    "/agents/risk",
    response_model=RiskAnalysisData,
    tags=["Specialized Agents"],
    summary="Run Risk Analysis Agent"
)
async def run_risk_analysis(payload: StartupIdeaInput):
    """Analyzes market, competitor, financial, technical, operational, and customer risks with mitigation strategies."""
    input_dict = payload.model_dump()
    extracted = await extraction_agent.run(input_dict)
    research = await market_research_agent.run(extracted)
    opp = await market_opportunity_agent.run(extracted, research)
    comps = await competitor_agent.run(extracted)
    segs = await customer_segmentation_agent.run(extracted)
    return await risk_agent.run(extracted, research, opp, comps, segs)

@router.post(
    "/agents/mvp",
    response_model=MvpRecommendationData,
    tags=["Specialized Agents"],
    summary="Run MVP Recommendation Agent (MoSCoW)"
)
async def run_mvp_analysis(payload: StartupIdeaInput):
    """Recommends MVP scope using MoSCoW prioritization considering market fit, customer needs, and complexity."""
    input_dict = payload.model_dump()
    extracted = await extraction_agent.run(input_dict)
    segs = await customer_segmentation_agent.run(extracted)
    research = await market_research_agent.run(extracted)
    return await mvp_agent.run(extracted, segs, research)

@router.post(
    "/agents/gtm",
    response_model=GtmStrategyData,
    tags=["Specialized Agents"],
    summary="Run Go-To-Market Strategy Agent"
)
async def run_gtm_analysis(payload: StartupIdeaInput):
    """Generates complete GTM roadmap: Positioning, Channels, Launch Phases, Pricing, KPIs, and Getting Started."""
    input_dict = payload.model_dump()
    extracted = await extraction_agent.run(input_dict)
    segs = await customer_segmentation_agent.run(extracted)
    research = await market_research_agent.run(extracted)
    opp = await market_opportunity_agent.run(extracted, research)
    comps = await competitor_agent.run(extracted)
    return await gtm_agent.run(extracted, segs, opp, comps)
