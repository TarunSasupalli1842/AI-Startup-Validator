import json
import logging
from services.llm_service import call_gemini
from models.validation import ExtractedIdea

logger = logging.getLogger(__name__)

class ExtractionAgent:
    def __init__(self):
        self.name = "Idea Extraction Agent"
        
    async def run(self, raw_input: dict) -> ExtractedIdea:
        """
        Takes raw startup inputs and uses Gemini to output a structured ExtractedIdea model.
        """
        logger.info(f"[{self.name}] starting refinement for startup: '{raw_input.get('name')}'")
        
        prompt = f"""
        Refine and structure the following startup inputs:
        Startup Name: {raw_input.get('name')}
        Problem Statement: {raw_input.get('problem')}
        Proposed Solution: {raw_input.get('solution')}
        Target Audience: {raw_input.get('target_audience')}
        Industry/Domain: {raw_input.get('industry')}
        Revenue Model: {raw_input.get('revenue_model') or "Not provided. Based on the startup concept, brainstorm and propose the most suitable revenue model."}
        Additional Notes: {raw_input.get('additional_notes') or "None"}
        
        Create a concise value proposition based on the problem, solution, audience, and industry.
        Return the response strictly as a JSON object matching this schema:
        {{
            "startup_name": "refined name",
            "core_problem": "refined core problem statement",
            "core_solution": "refined core solution statement",
            "target_audience": "refined target audience details",
            "industry": "refined industry name",
            "revenue_model": "refined revenue model details (brainstormed if not provided)",
            "value_proposition": "a short impact-driven value proposition sentence"
        }}
        """
        
        system_instruction = "You are an expert startup analyst. Your task is to clean, structure, and summarize raw startup concept descriptions into high-quality, professional summaries. If the revenue model is not provided, brainstorm and suggest the most logical revenue model option based on standard startup patterns."
        
        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            logger.info(f"[{self.name}] successfully extracted and structured startup idea.")
            return ExtractedIdea(**parsed_data)
        except Exception as e:
            logger.error(f"[{self.name}] failed to extract idea details: {str(e)}")
            # Fallback to local structured parsing if Gemini fails
            return ExtractedIdea(
                startup_name=raw_input.get('name') or "Unnamed Startup",
                core_problem=raw_input.get('problem') or "No problem provided.",
                core_solution=raw_input.get('solution') or "No solution provided.",
                target_audience=raw_input.get('target_audience') or "General public.",
                industry=raw_input.get('industry') or "General",
                revenue_model=raw_input.get('revenue_model') or "TBD",
                value_proposition=f"Value proposition for {raw_input.get('name') or 'Unnamed Startup'} in the {raw_input.get('industry') or 'General'} domain."
            )
