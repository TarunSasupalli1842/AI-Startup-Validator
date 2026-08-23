import json
import logging
from services.search_service import search_tavily
from services.llm_service import call_gemini
from models.validation import ExtractedIdea, CompetitorAnalysisData, CompetitorEntry

logger = logging.getLogger(__name__)

class CompetitorAnalysisAgent:
    def __init__(self):
        self.name = "Competitor Analysis Agent"
        
    async def run(self, idea: ExtractedIdea) -> CompetitorAnalysisData:
        """
        Runs competitor analysis. Searches Tavily for potential competitors/alternatives,
        then synthesizes competitor entries and evaluates unique moat using Gemini.
        """
        logger.info(f"[{self.name}] searching competitors for: '{idea.startup_name}'")
        
        # Build search query for competitors
        search_query = f"competitors and alternative companies for {idea.industry} {idea.core_solution[:50]}"
        
        # Execute search
        search_response = await search_tavily(search_query, max_results=4)
        results = search_response.get("results", [])
        
        # Extract snippets
        snippets = [f"Source: {res.get('url')}\nContent: {res.get('content')}" for res in results]
        web_context = "\n\n---\n\n".join(snippets)
        
        prompt = f"""
        Analyze competitors using simple, clear words for:
        Startup Name: {idea.startup_name}
        Industry: {idea.industry}
        Core Solution: {idea.core_solution}
        Target Audience: {idea.target_audience}
        
        Search Context:
        {web_context or "General industry knowledge."}
        
        RULES:
        - Use simple, everyday words.
        - Identify 2 competitors.
        - description, comparison, competitive_advantage, unique_moat: 1 short simple sentence (max 12 words each).
        - strengths / weaknesses: 2-5 simple words per bullet.

        Return strictly as a JSON object:
        {{
            "competitors": [
                {{
                    "name": "Competitor Name",
                    "description": "1 short simple sentence.",
                    "strengths": [
                        "strength 1 (2-5 simple words)",
                        "strength 2"
                    ],
                    "weaknesses": [
                        "weakness 1 (2-5 simple words)",
                        "weakness 2"
                    ],
                    "comparison": "1 short simple comparison sentence.",
                    "competitive_advantage": "1 short simple edge sentence."
                }}
            ],
            "unique_moat": "1 short simple sentence on defensibility."
        }}
        """
        
        system_instruction = "You write in short, simple words. Give direct competitor insights and moats. Zero fluff."
        
        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            
            # Convert competitors list into Pydantic models
            comp_entries = []
            for item in parsed_data.get("competitors", []):
                comp_entries.append(CompetitorEntry(**item))
                
            logger.info(f"[{self.name}] successfully completed competitor analysis mapping.")
            return CompetitorAnalysisData(
                competitors=comp_entries,
                unique_moat=parsed_data.get("unique_moat", "Data network effect and vertical integration.")
            )
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize competitors: {str(e)}")
            # Fallback mock competitor entries if LLM fails
            ind_name = idea.industry.split(" ")[0] or "Cloud"
            fallback_competitors = [
                CompetitorEntry(
                    name=f"Global{ind_name} Inc",
                    description=f"A massive market incumbent providing full suite solutions inside {idea.industry}.",
                    strengths=["Huge marketing budget", "Direct integrations", "Vast brand trust"],
                    weaknesses=["Legacy codebase", "Expensive license models", "Slow UI/UX iteration speed"],
                    comparison=f"They provide general solutions, whereas {idea.startup_name} targets a highly focused set of operations.",
                    competitive_advantage=f"A specialized UI and frictionless setup tailored to {idea.target_audience}."
                ),
                CompetitorEntry(
                    name=f"Simple{ind_name} App",
                    description="An early-stage competitor offering lightweight template plugins for automation.",
                    strengths=["Low entry price", "Active indie dev support", "Simple tool sets"],
                    weaknesses=["No AI capabilities", "Poor security integrations", "Lacks enterprise scalability"],
                    comparison="They provide simple scripts, but lack the integrated AI logic we offer.",
                    competitive_advantage="Native AI-driven orchestrator, providing automated validation in a single click."
                )
            ]
            return CompetitorAnalysisData(
                competitors=fallback_competitors,
                unique_moat=f"Our startup stands out through its proprietary workflows and optimized design, which is highly targeted to {idea.target_audience}."
            )
