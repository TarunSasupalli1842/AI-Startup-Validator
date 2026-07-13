import json
import logging
from services.llm_service import call_gemini
from models.validation import (
    ExtractedIdea, MarketResearchData, CompetitorAnalysisData,
    ValidationReportResponse, StartupSummary, SwotAnalysis, ValidationScores
)

logger = logging.getLogger(__name__)

class ValidationAgent:
    def __init__(self):
        self.name = "Validation Agent"
        
    async def run(self, idea: ExtractedIdea, research: MarketResearchData, competitors: CompetitorAnalysisData) -> ValidationReportResponse:
        """
        Runs validation scoring, SWOT analysis, and final recommendation reports
        by combining and analyzing inputs from all previous agents.
        """
        logger.info(f"[{self.name}] starting final report synthesis for: '{idea.startup_name}'")
        
        # Serialize previous details for context
        competitors_summary = "\n".join([
            f"- {c.name}: {c.description} (Strengths: {', '.join(c.strengths)}; Weaknesses: {', '.join(c.weaknesses)})" 
            for c in competitors.competitors
        ])
        
        context = f"""
        [STARTUP OVERVIEW]
        Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Industry: {idea.industry}
        Revenue Model: {idea.revenue_model}
        Value Proposition: {idea.value_proposition}
        Target Audience: {idea.target_audience}
        
        [MARKET RESEARCH DATA]
        Demand analysis summary: {research.demand_analysis}
        Industry trends: {", ".join(research.industry_trends)}
        Market Opportunities: {", ".join(research.opportunities)}
        Pain Points: {", ".join(research.customer_pain_points)}
        
        [COMPETITORS DATA]
        Unique Moat: {competitors.unique_moat}
        Competitors list:
        {competitors_summary}
        """
        
        prompt = f"""
        Analyze this startup idea context and synthesize a final validation report:
        {context}
        
        Evaluate the business feasibility, SWOT factors, validation scores (0 to 100 range), and actionable suggestions.
        Provide a concise high-level description, target market summary, and feasibility verdict.
        
        Output the response strictly as a JSON object matching this schema:
        {{
            "summary": {{
                "high_level_description": "A comprehensive 2-3 sentence description of the startup concept and its primary focus.",
                "target_market_summary": "A 2-3 sentence overview of the target customer segment, their readiness to adopt, and market size viability.",
                "feasibility_verdict": "A clear assessment (e.g. Excellent / Strong / Moderate feasibility) along with a short 2-sentence rationale."
            }},
            "swot_analysis": {{
                "strengths": [
                    "strength 1 - internal capacity, unique tech, skill or alignment",
                    "strength 2",
                    "strength 3",
                    "strength 4"
                ],
                "weaknesses": [
                    "weakness 1 - early gaps, dependency risk, or model validation needs",
                    "weakness 2",
                    "weakness 3",
                    "weakness 4"
                ],
                "opportunities": [
                    "opportunity 1 - external trend or partnership potential",
                    "opportunity 2",
                    "opportunity 3",
                    "opportunity 4"
                ],
                "threats": [
                    "threat 1 - market competition, policy changes, or price fluctuations",
                    "threat 2",
                    "threat 3",
                    "threat 4"
                ]
            }},
            "validation_scores": {{
                "problem_clarity": 85,
                "solution_strength": 80,
                "market_potential": 75,
                "competition_risk": 70,
                "feasibility": 75,
                "innovation": 80,
                "overall_score": 78
            }},
            "ai_recommendations": [
                "Actionable recommendation 1 - immediately implement MVP features...",
                "Actionable recommendation 2 - run targeted surveys on target audience...",
                "Actionable recommendation 3 - evaluate pricing plans...",
                "Actionable recommendation 4",
                "Actionable recommendation 5"
            ]
        }}
        
        Note on validation_scores:
        - overall_score should be a realistic combination of the individual scores.
        - scores must be integers between 0 and 100.
        """
        
        system_instruction = "You are a startup incubator director. Analyze the synthesized data to assign honest validation scores, build a realistic SWOT analysis, and list actionable, highly strategic recommendations for building the business."
        
        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            
            # Reconstruct the response with previous structures
            final_report = ValidationReportResponse(
                summary=StartupSummary(**parsed_data.get("summary", {})),
                extracted_idea=idea,
                market_research=research,
                competitor_analysis=competitors,
                swot_analysis=SwotAnalysis(**parsed_data.get("swot_analysis", {})),
                validation_scores=ValidationScores(**parsed_data.get("validation_scores", {})),
                ai_recommendations=parsed_data.get("ai_recommendations", [])
            )
            logger.info(f"[{self.name}] successfully completed final report compile.")
            return final_report
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize final validation: {str(e)}")
            # If combining fails, fallback to generate_mock_report structure so backend never crashes
            from agents.mock_data import generate_mock_report
            logger.info(f"[{self.name}] using dynamic mock fallback due to LLM error.")
            return generate_mock_report(
                name=idea.startup_name,
                problem=idea.core_problem,
                solution=idea.core_solution,
                target_audience=idea.target_audience,
                industry=idea.industry,
                revenue_model=idea.revenue_model
            )
