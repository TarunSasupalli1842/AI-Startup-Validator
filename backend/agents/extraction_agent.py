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
        Refine and structure these startup inputs using simple, clear words:
        Startup Name: {raw_input.get('name')}
        Problem Statement: {raw_input.get('problem')}
        Proposed Solution: {raw_input.get('solution')}
        Target Audience: {raw_input.get('target_audience')}
        Industry/Domain: {raw_input.get('industry')}
        Revenue Model: {raw_input.get('revenue_model') or "Propose the simplest, best revenue model."}
        Additional Notes: {raw_input.get('additional_notes') or "None"}
        
        RULES:
        - Use simple, easy-to-understand words.
        - Keep every field very short (strictly 1 short sentence, max 15 words).
        - No long matter, buzzwords, or filler.

        Return strictly as a JSON object:
        {{
            "startup_name": "clean short name",
            "core_problem": "1 short sentence stating the exact user problem.",
            "core_solution": "1 short sentence stating the core solution.",
            "target_audience": "short target audience description",
            "industry": "short industry category",
            "revenue_model": "short revenue model (e.g., Monthly subscription)",
            "value_proposition": "1 punchy sentence value proposition."
        }}
        """
        
        system_instruction = "You write in short, simple words. Keep every output concise, clear, and direct. Zero fluff or long matter."
        
        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            logger.info(f"[{self.name}] successfully extracted and structured startup idea.")
            return ExtractedIdea(**parsed_data)
        except Exception as e:
            logger.error(f"[{self.name}] failed to extract idea details: {str(e)}")
            # Fallback to local structured parsing if Gemini fails
            return ExtractedIdea(
                startup_name=raw_input.get('name') or "Startup",
                core_problem=raw_input.get('problem') or "User workflow inefficiency.",
                core_solution=raw_input.get('solution') or "Automated simple platform.",
                target_audience=raw_input.get('target_audience') or "Target users.",
                industry=raw_input.get('industry') or "Technology",
                revenue_model=raw_input.get('revenue_model') or "Subscription",
                value_proposition=f"Simple, automated solution for {raw_input.get('name') or 'users'}."
            )
