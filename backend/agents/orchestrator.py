import logging
from config import settings
from models.validation import StartupIdeaInput, ValidationReportResponse
from agents.extraction_agent import ExtractionAgent
from agents.market_research_agent import MarketResearchAgent
from agents.market_opportunity_agent import MarketOpportunityAgent
from agents.customer_segmentation_agent import CustomerSegmentationAgent
from agents.competitor_analysis_agent import CompetitorAnalysisAgent
from agents.comparison_agent import ComparisonAgent
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
        self.validation_agent = ValidationAgent()
        
    async def validate_idea(self, raw_input: StartupIdeaInput) -> ValidationReportResponse:
        """
        Coordinates the execution of the 7-stage multi-agent pipeline:
        1. Extraction
        2. Market Research
        3. Market Opportunity
        4. Customer Segmentation
        5. Competitor Analysis
        6. Comparison Matrix
        7. Validation Synthesis
        """
        input_dict = raw_input.model_dump()
        
        if not settings.is_gemini_configured:
            logger.info("Gemini key is missing. Routing request to Mock Validation Engine.")
            return self._run_mock_fallback(input_dict)
            
        try:
            logger.info("Initializing 7-stage multi-agent validation pipeline...")
            
            # Step 1: Extraction Agent
            logger.info("Stage 1/7: Running Extraction Agent...")
            extracted_idea = await self.extraction_agent.run(input_dict)
            
            # Step 2: Market Research Agent
            logger.info("Stage 2/7: Running Market Research Agent...")
            market_research = await self.market_research_agent.run(extracted_idea)
            
            # Step 3: Market Opportunity Agent
            logger.info("Stage 3/7: Running Market Opportunity Agent...")
            market_opportunity = await self.market_opportunity_agent.run(extracted_idea, market_research)
            
            # Step 4: Customer Segmentation Agent
            logger.info("Stage 4/7: Running Customer Segmentation Agent...")
            customer_segmentation = await self.customer_segmentation_agent.run(extracted_idea)
            
            # Step 5: Competitor Analysis Agent
            logger.info("Stage 5/7: Running Competitor Analysis Agent...")
            competitor_analysis = await self.competitor_agent.run(extracted_idea)
            
            # Step 6: Comparison Agent
            logger.info("Stage 6/7: Running Comparison Matrix Agent...")
            comparison_matrix = await self.comparison_agent.run(extracted_idea, competitor_analysis)
            
            # Step 7: Validation Synthesis Agent
            logger.info("Stage 7/7: Running Validation Agent...")
            final_report = await self.validation_agent.run(
                extracted_idea,
                market_research,
                market_opportunity,
                customer_segmentation,
                competitor_analysis,
                comparison_matrix
            )
            
            logger.info("7-Stage multi-agent validation pipeline completed successfully.")
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
