import json
import logging
from services.llm_service import call_gemini
from models.validation import (
    ExtractedIdea, MarketResearchData, MarketOpportunityData, CustomerSegmentationData,
    CompetitorAnalysisData, ComparisonData, ValidationReportResponse, StartupSummary,
    SwotAnalysis, ValidationScores
)

logger = logging.getLogger(__name__)

class ValidationAgent:
    def __init__(self):
        self.name = "Validation Agent"
        
    async def run(
        self,
        idea: ExtractedIdea,
        research: MarketResearchData,
        opportunity: MarketOpportunityData,
        segmentation: CustomerSegmentationData,
        competitors: CompetitorAnalysisData,
        comparison: ComparisonData
    ) -> ValidationReportResponse:
        """
        Runs final validation scoring, SWOT analysis, and actionable recommendation synthesis
        by combining data from all 6 previous specialized pipeline agents.
        """
        logger.info(f"[{self.name}] starting final report synthesis for: '{idea.startup_name}'")
        
        competitors_summary = "\n".join([
            f"- {c.name}: {c.description} (Strengths: {', '.join(c.strengths)}; Weaknesses: {', '.join(c.weaknesses)})" 
            for c in competitors.competitors
        ])
        
        context = f"""
        [1. EXTRACTION & OVERVIEW]
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Industry: {idea.industry}
        Revenue Model: {idea.revenue_model}
        Value Proposition: {idea.value_proposition}
        Target Audience: {idea.target_audience}
        
        [2. MARKET RESEARCH]
        Demand analysis: {research.demand_analysis}
        Trends: {", ".join(research.industry_trends)}
        Opportunities: {", ".join(research.opportunities)}
        Pain Points: {", ".join(research.customer_pain_points)}
        
        [3. MARKET OPPORTUNITY]
        TAM: {opportunity.tam} | SAM: {opportunity.sam} | SOM: {opportunity.som}
        CAGR: {opportunity.market_growth_rate}
        Unit Economics: {opportunity.unit_economics_summary} (CAC: {opportunity.estimated_cac}, LTV: {opportunity.estimated_ltv})
        Pricing Power: {opportunity.pricing_power}
        
        [4. CUSTOMER SEGMENTATION]
        Primary Persona: {segmentation.primary_segment.persona_name} ({segmentation.primary_segment.target_profile})
        Willingness to Pay: {segmentation.primary_segment.willingness_to_pay}
        Acquisition Channels: {", ".join(segmentation.primary_segment.acquisition_channels)}
        Strategy: {segmentation.segmentation_strategy}
        
        [5. COMPETITOR LANDSCAPE]
        Unique Moat: {competitors.unique_moat}
        Competitors list:
        {competitors_summary}
        
        [6. COMPARISON MATRIX]
        Positioning Strategy: {comparison.positioning_summary}
        Key Advantage Points: {", ".join([r.our_advantage for r in comparison.comparison_matrix])}
        """
        
        prompt = f"""
        Synthesize a comprehensive final Startup Validation Report from the multi-agent findings below:
        {context}
        
        Calculate honest validation scores (0 to 100 range), build a 4-quadrant SWOT analysis, and formulate 5 highly strategic, actionable recommendations for building and scaling the startup.
        
        Return the response strictly as a JSON object matching this schema:
        {{
            "summary": {{
                "high_level_description": "A comprehensive 2-3 sentence description of the startup concept, market positioning, and revenue model.",
                "target_market_summary": "A 2-3 sentence overview of target market sizing (TAM/SOM), primary persona willingness to pay, and market growth momentum.",
                "feasibility_verdict": "A clear assessment (e.g. Excellent Viability / Strong Potential / Moderate Feasibility) along with a concise 2-sentence rationale."
            }},
            "swot_analysis": {{
                "strengths": [
                    "strength 1 - core internal edge, unique tech, skill or alignment",
                    "strength 2",
                    "strength 3",
                    "strength 4"
                ],
                "weaknesses": [
                    "weakness 1 - early execution gaps, dependency risk, or pricing model validation needs",
                    "weakness 2",
                    "weakness 3",
                    "weakness 4"
                ],
                "opportunities": [
                    "opportunity 1 - macro market trend, expansion tier, or partnership potential",
                    "opportunity 2",
                    "opportunity 3",
                    "opportunity 4"
                ],
                "threats": [
                    "threat 1 - market competition, tech commoditization, or regulatory hurdles",
                    "threat 2",
                    "threat 3",
                    "threat 4"
                ]
            }},
            "validation_scores": {{
                "problem_clarity": 88,
                "solution_strength": 84,
                "market_potential": 82,
                "competition_risk": 75,
                "feasibility": 80,
                "innovation": 85,
                "overall_score": 82
            }},
            "ai_recommendations": [
                "1. Build & Test MVP: ...",
                "2. Customer Acquisition: ...",
                "3. Revenue Optimization: ...",
                "4. Defensive Moat: ...",
                "5. Scalability & Integrations: ..."
            ]
        }}
        """
        
        system_instruction = "You are a seasoned startup incubator director and venture capital analyst. Provide rigorous, objective validation scores and clear, actionable growth recommendations."
        
        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            
            final_report = ValidationReportResponse(
                summary=StartupSummary(**parsed_data.get("summary", {})),
                extracted_idea=idea,
                market_research=research,
                market_opportunity=opportunity,
                customer_segmentation=segmentation,
                competitor_analysis=competitors,
                comparison=comparison,
                swot_analysis=SwotAnalysis(**parsed_data.get("swot_analysis", {})),
                validation_scores=ValidationScores(**parsed_data.get("validation_scores", {})),
                ai_recommendations=parsed_data.get("ai_recommendations", [])
            )
            logger.info(f"[{self.name}] successfully completed final report compilation.")
            return final_report
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize final validation report: {str(e)}")
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
