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
        Conduct a comprehensive, objective SWOT Analysis for this startup:
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Industry: {idea.industry}
        Target Audience: {idea.target_audience}
        Revenue Model: {idea.revenue_model}
        Unique Moat: {competitors.unique_moat}
        TAM/SAM: {opportunity.tam} / {opportunity.sam}
        Competitors: {competitor_names}
        Market Trends: {", ".join(research.industry_trends)}

        Requirements:
        - Provide exactly 4 concise, high-impact bullet points per quadrant (max 10 words per bullet).
        - Strengths: Internal distinctive capabilities, proprietary tech, cost structure, or domain UX advantage.
        - Weaknesses: Internal resource limitations, brand anonymity, lack of historical data, or initial niche focus.
        - Opportunities: External market tailwinds, whitespace niches, enterprise expansion, or integration ecosystem.
        - Threats: External competitor copycats, platform shifts, legacy vendor retention, or CAC spikes.

        Return strictly a JSON object matching this schema:
        {{
            "strengths": [
                "crisp strength 1",
                "crisp strength 2",
                "crisp strength 3",
                "crisp strength 4"
            ],
            "weaknesses": [
                "crisp weakness 1",
                "crisp weakness 2",
                "crisp weakness 3",
                "crisp weakness 4"
            ],
            "opportunities": [
                "crisp opportunity 1",
                "crisp opportunity 2",
                "crisp opportunity 3",
                "crisp opportunity 4"
            ],
            "threats": [
                "crisp threat 1",
                "crisp threat 2",
                "crisp threat 3",
                "crisp threat 4"
            ]
        }}
        """

        system_instruction = "You are a senior venture partner conducting due diligence. Provide realistic, concise, and strategically sharp SWOT analysis with zero generic filler."

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
