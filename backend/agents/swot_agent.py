import json
import logging
from services.llm_service import call_gemini
from models.validation import (
    ExtractedIdea, MarketResearchData, MarketOpportunityData, 
    CompetitorAnalysisData, SwotAnalysis
)

logger = logging.getLogger(__name__)

class SwotAgent:
    def __init__(self):
        self.name = "SWOT Analysis Agent"

    async def run(
        self,
        idea: ExtractedIdea,
        research: MarketResearchData,
        opportunity: MarketOpportunityData,
        competitors: CompetitorAnalysisData
    ) -> SwotAnalysis:
        """
        Conducts deep strategic SWOT analysis leveraging market metrics, competitor moats, and startup capabilities.
        """
        logger.info(f"[{self.name}] conducting SWOT analysis for '{idea.startup_name}'")

        competitor_names = ", ".join([c.name for c in competitors.competitors])

        prompt = f"""
        Conduct a SWOT Analysis using simple, clear words for:
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Industry: {idea.industry}
        Target Audience: {idea.target_audience}
        
        RULES:
        - Use simple, everyday words.
        - Exactly 4 bullet points per quadrant.
        - Strictly 4 to 7 simple words per bullet point.
        - No long matter, buzzwords, or filler.

        Return strictly as a JSON object:
        {{
            "strengths": [
                "strength 1 (4-7 simple words)",
                "strength 2",
                "strength 3",
                "strength 4"
            ],
            "weaknesses": [
                "weakness 1 (4-7 simple words)",
                "weakness 2",
                "weakness 3",
                "weakness 4"
            ],
            "opportunities": [
                "opportunity 1 (4-7 simple words)",
                "opportunity 2",
                "opportunity 3",
                "opportunity 4"
            ],
            "threats": [
                "threat 1 (4-7 simple words)",
                "threat 2",
                "threat 3",
                "threat 4"
            ]
        }}
        """

        system_instruction = "You write in short, simple words. Provide direct, compact SWOT bullets (4-7 words each). Zero fluff."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            logger.info(f"[{self.name}] SWOT analysis completed successfully.")
            return SwotAnalysis(**parsed_data)
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize SWOT analysis: {str(e)}")
            return self._fallback_swot(idea, competitors)

    def _fallback_swot(self, idea: ExtractedIdea, competitors: CompetitorAnalysisData) -> SwotAnalysis:
        ind = idea.industry or "Technology"
        aud = idea.target_audience or "Target Users"
        return SwotAnalysis(
            strengths=[
                f"Purpose-built workflow solving real {ind} friction",
                f"Laser-focused value proposition tailored to {aud}",
                "Streamlined modern architecture with rapid time-to-value",
                f"Transparent recurring {idea.revenue_model or 'pricing'} lowering user adoption barriers"
            ],
            weaknesses=[
                "Early brand presence requiring aggressive trust building",
                "Lean initial feature scope focused solely on primary workflow",
                "Reliance on third-party APIs and infrastructure",
                "Limited initial historical user behavior data"
            ],
            opportunities=[
                f"Capturing underserved {aud} neglected by complex legacy incumbents",
                f"Expanding horizontally across adjacent {ind} workflows",
                "Introducing team collaboration and advanced analytics tiers",
                "Building strategic integration partnerships in the software ecosystem"
            ],
            threats=[
                "Legacy competitors responding with discounted feature bundles",
                "Rapid emergence of low-barrier copycat wrappers",
                "Rising paid digital acquisition and advertising costs",
                "Evolving enterprise data security and compliance requirements"
            ]
        )
