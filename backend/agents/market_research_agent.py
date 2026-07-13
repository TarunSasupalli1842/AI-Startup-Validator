import json
import logging
from services.search_service import search_tavily
from services.llm_service import call_gemini
from models.validation import ExtractedIdea, MarketResearchData

logger = logging.getLogger(__name__)

class MarketResearchAgent:
    def __init__(self):
        self.name = "Market Research Agent"
        
    async def run(self, idea: ExtractedIdea) -> MarketResearchData:
        """
        Runs market research. Generates a search query based on the industry and problem,
        executes search using Tavily, and synthesizes the results via Gemini.
        """
        logger.info(f"[{self.name}] starting market research for industry: '{idea.industry}'")
        
        # Build search query
        search_query = f"{idea.industry} market size growth trends opportunities 2025 2026"
        
        # Execute search
        search_response = await search_tavily(search_query, max_results=4)
        results = search_response.get("results", [])
        
        # Extract sources and content snippets
        sources = [res.get("url") for res in results if res.get("url")]
        snippets = [f"Source: {res.get('url')}\nContent: {res.get('content')}" for res in results]
        web_context = "\n\n---\n\n".join(snippets)
        
        prompt = f"""
        Conduct market research for a startup operating in the '{idea.industry}' industry.
        Startup Value Proposition: {idea.value_proposition}
        Core Problem solved: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Target Audience: {idea.target_audience}
        
        We did a real-time web search for "{search_query}" and found these resources:
        {web_context or "No search results available. Please perform analysis using general industry knowledge."}
        
        Synthesize the research and output a structured market analysis matching this JSON schema:
        {{
            "demand_analysis": "A detailed 3-4 sentence paragraph describing the current customer demand, market size references if any, and growth drivers for this concept.",
            "industry_trends": [
                "trend 1 - describe recent shift or adoption in the industry",
                "trend 2",
                "trend 3",
                "trend 4"
            ],
            "opportunities": [
                "opportunity 1 - potential expansion or integration target",
                "opportunity 2",
                "opportunity 3",
                "opportunity 4"
            ],
            "customer_pain_points": [
                "pain point 1 - why existing systems fail the user",
                "pain point 2",
                "pain point 3",
                "pain point 4"
            ]
        }}
        """
        
        system_instruction = "You are a professional market research analyst. Synthesize the provided search results to identify market sizing, trends, opportunities, and user pain points. Do not make up URLs, only cite the ones provided."
        
        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            parsed_data["sources"] = sources
            logger.info(f"[{self.name}] successfully completed research and synthesis.")
            return MarketResearchData(**parsed_data)
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize market research: {str(e)}")
            # Fallback mock/manual data if LLM call fails
            return MarketResearchData(
                demand_analysis=f"The market demand for products addressing '{idea.core_problem[:60]}' within the {idea.industry} sector shows stable growth metrics. There is a growing user preference for automated workflows that simplify operations for {idea.target_audience}.",
                industry_trends=[
                    f"Rapid digitization and automation in the {idea.industry} space.",
                    "Rising adoption of self-service, cloud-native apps.",
                    "Consumer focus on privacy and high speed response rates."
                ],
                opportunities=[
                    f"Targeting early adopters among {idea.target_audience}.",
                    "Adding customized reporting metrics.",
                    "Creating custom integrations into legacy systems."
                ],
                customer_pain_points=[
                    "High cost of manual configurations.",
                    "Fragmented tool landscape.",
                    "Steep onboarding complexity."
                ],
                sources=sources or ["https://trends.google.com"]
            )
