import json
import logging
from services.llm_service import call_gemini
from models.validation import (
    ExtractedIdea, MarketResearchData, MarketOpportunityData, CustomerSegmentationData,
    CompetitorAnalysisData, ComparisonData, SwotAnalysis, RiskAnalysisData,
    MvpRecommendationData, GtmStrategyData, ValidationReportResponse, StartupSummary,
    ValidationScores
)

logger = logging.getLogger(__name__)

class ValidationAgent:
    def __init__(self):
        self.name = "Validation Synthesis Agent"
        
    async def run(
        self,
        idea: ExtractedIdea,
        research: MarketResearchData,
        opportunity: MarketOpportunityData,
        segmentation: CustomerSegmentationData,
        competitors: CompetitorAnalysisData,
        comparison: ComparisonData,
        swot: SwotAnalysis,
        risks: RiskAnalysisData,
        mvp: MvpRecommendationData,
        gtm: GtmStrategyData
    ) -> ValidationReportResponse:
        """
        Runs final validation scoring and actionable recommendation synthesis
        by combining data from all specialized pipeline agents.
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
        Competitors: {competitors_summary}
        
        [6. COMPARISON MATRIX]
        Positioning Strategy: {comparison.positioning_summary}
        Key Advantage Points: {", ".join([r.our_advantage for r in comparison.comparison_matrix])}

        [7. SWOT HIGHLIGHTS]
        Strengths: {", ".join(swot.strengths)}
        Weaknesses: {", ".join(swot.weaknesses)}
        Opportunities: {", ".join(swot.opportunities)}
        Threats: {", ".join(swot.threats)}

        [8. RISK LEVEL]
        Overall Risk: {risks.overall_risk_level} - {risks.risk_summary}

        [9. MVP ROADMAP]
        MVP Philosophy: {mvp.mvp_summary}
        Timeline: {mvp.target_timeline_weeks}

        [10. GTM STRATEGY]
        Positioning: {gtm.positioning_statement}
        Pricing: {gtm.pricing_strategy}
        """
        
        prompt = f"""
        Synthesize the final Startup Validation Executive Summary and Multi-Metric Scoring from findings below:
        {context}
        
        STRICT REQUIREMENT: Be extremely concise, direct, accurate, and genuine. Avoid long matter or repetitive text.
        - high_level_description: 1 concise sentence describing concept, problem solved, and solution.
        - target_market_summary: 1 concise sentence on market sizing and target customer opportunity.
        - feasibility_verdict: Short assessment title followed by 1 short rationale sentence.
        - validation_scores: Evaluate realistic 0-100 scores for:
          * problem_clarity
          * solution_strength
          * market_potential
          * competition_risk (higher number = safer / lower risk)
          * feasibility
          * innovation
          * overall_score (weighted average)
        - ai_recommendations: 5 direct, actionable 1-sentence next steps.
        
        Return strictly a JSON object matching this schema:
        {{
            "summary": {{
                "high_level_description": "1 concise sentence overview of startup concept.",
                "target_market_summary": "1 concise sentence overview of target market.",
                "feasibility_verdict": "High Viability. 1 short rationale sentence."
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
                "1. Lean MVP: Build prototype for core solution.",
                "2. User Testing: Test with 20 early target users.",
                "3. Monetization Test: Validate willingness to pay.",
                "4. Defensibility: Focus on proprietary workflow speed.",
                "5. Acquisition Channel: Leverage targeted organic channels."
            ]
        }}
        """
        
        system_instruction = "You are an elite venture capital analyst and startup incubator judge. Synthesize validation scores and recommendations with surgical precision and honesty."
        
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
                swot_analysis=swot,
                risk_analysis=risks,
                mvp_recommendation=mvp,
                gtm_strategy=gtm,
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
