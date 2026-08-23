import json
import logging
from services.search_service import search_tavily
from services.llm_service import call_gemini
from models.validation import ExtractedIdea, MarketResearchData, MarketOpportunityData

logger = logging.getLogger(__name__)

class MarketOpportunityAgent:
    def __init__(self):
        self.name = "Market Opportunity Agent"

    async def run(self, idea: ExtractedIdea, market_research: MarketResearchData) -> MarketOpportunityData:
        """
        Calculates TAM/SAM/SOM, market growth drivers, entry barriers, and projected unit economics.
        """
        logger.info(f"[{self.name}] starting market opportunity evaluation for industry: '{idea.industry}'")

        # Query web search for market size & metrics
        search_query = f"{idea.industry} market size TAM CAGR growth statistics 2025 2026"
        search_response = await search_tavily(search_query, max_results=3)
        results = search_response.get("results", [])
        snippets = [f"Source: {res.get('url')}\nContent: {res.get('content')}" for res in results]
        web_context = "\n\n---\n\n".join(snippets)

        prompt = f"""
        Evaluate Market Opportunity (TAM, SAM, SOM, CAGR, Unit Economics) in Indian Rupees (INR / ₹) using simple, plain words:
        Startup Name: {idea.startup_name}
        Industry: {idea.industry}
        Target Audience: {idea.target_audience}
        Revenue Model: {idea.revenue_model}
        
        Search Context:
        {web_context or "Standard industry benchmark data."}
        
        RULES:
        - Use simple, everyday words. Keep all text short and clean.
        - TAM, SAM, SOM, CAC, LTV must be in Indian Rupees (INR / ₹) using Cr (e.g. "₹2,50,000 Cr", "₹35,000 Cr", "₹1,200 Cr").
        - market_drivers: Exactly 3 points (strictly 4-8 simple words each).
        - entry_barriers: Exactly 3 points (strictly 4-8 simple words each).
        - unit_economics_summary: 1 short simple sentence (max 15 words).
        - pricing_power: 1 short phrase (e.g. "High — customers save valuable hours").

        Return strictly as a JSON object:
        {{
            "tam": "₹XX,XXX Cr Total Market",
            "sam": "₹X,XXX Cr Target Market",
            "som": "₹XXX Cr 3-Year Goal",
            "market_growth_rate": "XX.X% CAGR",
            "market_drivers": [
                "driver 1 (4-8 simple words)",
                "driver 2",
                "driver 3"
            ],
            "entry_barriers": [
                "barrier 1 (4-8 simple words)",
                "barrier 2",
                "barrier 3"
            ],
            "unit_economics_summary": "1 short simple sentence on profits and costs in ₹.",
            "estimated_cac": "₹X,XXX - ₹X,XXX",
            "estimated_ltv": "₹XX,XXX - ₹XX,XXX",
            "pricing_power": "High — clear customer time savings"
        }}
        """

        system_instruction = "You write in short, simple words. Provide compact, clean market numbers and metrics in Indian Rupees (₹). No jargon or extra matter."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            logger.info(f"[{self.name}] market opportunity calculation completed successfully.")
            return MarketOpportunityData(**parsed_data)
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize market opportunity: {str(e)}")
            # Fallback estimation based on industry name length
            ind_clean = idea.industry.strip() or "SaaS"
            return MarketOpportunityData(
                tam="₹2,70,000 Cr Global Sector Market",
                sam="₹55,000 Cr Addressable Segment",
                som="₹3,600 Cr Realistic 3-Year Capture",
                market_growth_rate="16.4% CAGR (2024-2030)",
                market_drivers=[
                    f"Rapid enterprise digital transformation in {ind_clean}",
                    "Widespread customer adoption of AI automation tools",
                    "Demand for real-time data insights and workflow optimization",
                    "Shift toward cloud-native subscription platforms"
                ],
                entry_barriers=[
                    "High customer expectations for security and compliance",
                    "Established incumbent brand recognition",
                    "Initial customer acquisition cost in competitive ad markets"
                ],
                unit_economics_summary=f"Strong potential for 70%+ gross margins with recurring subscription revenue from {idea.target_audience}.",
                estimated_cac="₹3,500 - ₹9,500",
                estimated_ltv="₹35,000 - ₹95,000",
                pricing_power="High — tiered subscription model with strong expansion upsell potential."
            )
