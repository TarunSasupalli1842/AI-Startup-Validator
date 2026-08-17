import logging
import asyncio
from config import settings
from models.validation import StartupIdeaInput, ValidationReportResponse
from agents.extraction_agent import ExtractionAgent
from agents.market_research_agent import MarketResearchAgent
from agents.market_opportunity_agent import MarketOpportunityAgent
from agents.customer_segmentation_agent import CustomerSegmentationAgent
from agents.competitor_analysis_agent import CompetitorAnalysisAgent
from agents.comparison_agent import ComparisonAgent
from agents.swot_agent import SwotAgent
from agents.risk_agent import RiskAgent
from agents.mvp_agent import MvpRecommendationAgent
from agents.gtm_agent import GtmAgent
from agents.validation_agent import ValidationAgent
from agents.mock_data import generate_mock_report

logger = logging.getLogger(__name__)

class ValidationOrchestrator:
    def __init__(self):
        self.extraction_agent = ExtractionAgent()
        self.market_research_agent = MarketResearchAgent()
        self.market_opportunity_agent = MarketOpportunityAgent()
        self.customer_segmentation_agent = CustomerSegmentationAgent()
        self.competitor_agent = CompetitorAnalysisAgent()
        self.comparison_agent = ComparisonAgent()
        self.swot_agent = SwotAgent()
        self.risk_agent = RiskAgent()
        self.mvp_agent = MvpRecommendationAgent()
        self.gtm_agent = GtmAgent()
        self.validation_agent = ValidationAgent()
        
    async def validate_idea(self, raw_input: StartupIdeaInput) -> ValidationReportResponse:
        """
        Coordinates the execution of the full multi-agent pipeline:
        1. Extraction
        2. Market Research (Live Tavily Search)
        3. Market Opportunity (TAM/SAM/SOM & Unit Economics)
        4. Customer Segmentation (Personas & ICPs)
        5. Competitor Analysis (Moats & Competitors)
        6. Comparison Matrix (Feature Matrix)
        7. SWOT Analysis (LLM Reasoning)
        8. Multi-Pillar Risk Analysis (6 Risk Domains)
        9. MVP Recommendation (MoSCoW Framework)
        10. Go-To-Market Strategy (Positioning, Channels, Launch Roadmap)
        11. Validation Synthesis (Scoring & Executive Summary)
        """
        input_dict = raw_input.model_dump()
        
        if not settings.is_gemini_configured:
            logger.info("Gemini key is missing. Routing request to Mock Validation Engine.")
            return self._run_mock_fallback(input_dict)
            
        try:
            logger.info("Initializing multi-agent startup validation pipeline...")
            
            # Step 1: Extraction Agent
            logger.info("Stage 1/11: Running Extraction Agent...")
            extracted_idea = await self.extraction_agent.run(input_dict)
            
            # Step 2: Market Research Agent
            logger.info("Stage 2/11: Running Market Research Agent...")
            market_research = await self.market_research_agent.run(extracted_idea)
            
            # Step 3: Market Opportunity Agent
            logger.info("Stage 3/11: Running Market Opportunity Agent...")
            market_opportunity = await self.market_opportunity_agent.run(extracted_idea, market_research)
            
            # Step 4: Customer Segmentation Agent
            logger.info("Stage 4/11: Running Customer Segmentation Agent...")
            customer_segmentation = await self.customer_segmentation_agent.run(extracted_idea)
            
            # Step 5: Competitor Analysis Agent
            logger.info("Stage 5/11: Running Competitor Analysis Agent...")
            competitor_analysis = await self.competitor_agent.run(extracted_idea)
            
            # Step 6: Comparison Agent
            logger.info("Stage 6/11: Running Comparison Matrix Agent...")
            comparison_matrix = await self.comparison_agent.run(extracted_idea, competitor_analysis)
            
            # Concurrent Execution of Milestone 3 Specialized Strategic Agents (Stages 7 - 10)
            logger.info("Stages 7-10/11: Running SWOT, Risk, MVP (MoSCoW), and GTM Agents in parallel...")
            swot_task = self.swot_agent.run(extracted_idea, market_research, market_opportunity, competitor_analysis)
            risk_task = self.risk_agent.run(extracted_idea, market_research, market_opportunity, competitor_analysis, customer_segmentation)
            mvp_task = self.mvp_agent.run(extracted_idea, customer_segmentation, market_research)
            gtm_task = self.gtm_agent.run(extracted_idea, customer_segmentation, market_opportunity, competitor_analysis)

            swot_res, risk_res, mvp_res, gtm_res = await asyncio.gather(
                swot_task, risk_task, mvp_task, gtm_task
            )
            
            # Step 11: Validation Synthesis Agent
            logger.info("Stage 11/11: Running Validation Synthesis Agent...")
            final_report = await self.validation_agent.run(
                idea=extracted_idea,
                research=market_research,
                opportunity=market_opportunity,
                segmentation=customer_segmentation,
                competitors=competitor_analysis,
                comparison=comparison_matrix,
                swot=swot_res,
                risks=risk_res,
                mvp=mvp_res,
                gtm=gtm_res
            )
            
            logger.info("Complete multi-agent validation pipeline completed successfully.")
            return final_report
            
        except Exception as err:
            logger.error(f"Error in multi-agent pipeline execution: {str(err)}. Falling back to mock data.")
            return self._run_mock_fallback(input_dict)
            
    def _run_mock_fallback(self, input_dict: dict) -> ValidationReportResponse:
        """Helper to call local mockup engine."""
        return generate_mock_report(
            name=input_dict.get("name", ""),
            problem=input_dict.get("problem", ""),
            solution=input_dict.get("solution", ""),
            target_audience=input_dict.get("target_audience", ""),
            industry=input_dict.get("industry", ""),
            revenue_model=input_dict.get("revenue_model", ""),
            additional_notes=input_dict.get("additional_notes", "")
        )
