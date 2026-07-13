import logging
from config import settings
from models.validation import StartupIdeaInput, ValidationReportResponse
from agents.extraction_agent import ExtractionAgent
from agents.market_research_agent import MarketResearchAgent
from agents.competitor_analysis_agent import CompetitorAnalysisAgent
from agents.validation_agent import ValidationAgent
from agents.mock_data import generate_mock_report

logger = logging.getLogger(__name__)

class ValidationOrchestrator:
    def __init__(self):
        self.extraction_agent = ExtractionAgent()
        self.market_research_agent = MarketResearchAgent()
        self.competitor_agent = CompetitorAnalysisAgent()
        self.validation_agent = ValidationAgent()
        
    async def validate_idea(self, raw_input: StartupIdeaInput) -> ValidationReportResponse:
        """
        Coordinates the execution of the multi-agent pipeline.
        If environment API keys are missing, automatically routes to mock generator.
        """
        # Convert Pydantic input to raw dict for agents
        input_dict = raw_input.model_dump()
        
        # Check if LLM configurations are missing
        if not settings.is_gemini_configured:
            logger.info("Gemini key is missing. Routing request to Mock Validation Engine.")
            return self._run_mock_fallback(input_dict)
            
        try:
            logger.info("Initializing multi-agent pipeline...")
            
            # Step 1: Extract and structure the startup concept
            logger.info("Step 1: Running Extraction Agent...")
            extracted_idea = await self.extraction_agent.run(input_dict)
            
            # Step 2: Query market size, trends, and demand (using search)
            logger.info("Step 2: Running Market Research Agent...")
            market_research = await self.market_research_agent.run(extracted_idea)
            
            # Step 3: Map competitor landscape and target uniqueness (using search)
            logger.info("Step 3: Running Competitor Agent...")
            competitor_analysis = await self.competitor_agent.run(extracted_idea)
            
            # Step 4: Synthesize SWOT, recommendations, and calculate final scores
            logger.info("Step 4: Running Validation Agent...")
            final_report = await self.validation_agent.run(
                extracted_idea, 
                market_research, 
                competitor_analysis
            )
            
            logger.info("Multi-agent validation pipeline completed successfully.")
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
