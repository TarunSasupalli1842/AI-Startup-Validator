import json
import logging
from services.llm_service import call_gemini
from models.validation import (
    ExtractedIdea, MarketResearchData, MarketOpportunityData,
    CompetitorAnalysisData, CustomerSegmentationData,
    RiskAnalysisData, RiskItem
)

logger = logging.getLogger(__name__)

class RiskAgent:
    def __init__(self):
        self.name = "Risk Analysis Agent"

    async def run(
        self,
        idea: ExtractedIdea,
        research: MarketResearchData,
        opportunity: MarketOpportunityData,
        competitors: CompetitorAnalysisData,
        segmentation: CustomerSegmentationData
    ) -> RiskAnalysisData:
        """
        Evaluates risks across 6 critical startup pillars:
        1. Market Risk
        2. Competitor Risk
        3. Financial Risk
        4. Technical Risk
        5. Operational Risk
        6. Customer Risk
        Assigns probability, impact, severity, and concrete mitigation steps.
        """
        logger.info(f"[{self.name}] analyzing venture risks for '{idea.startup_name}'")

        context = f"""
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Industry: {idea.industry}
        Target Audience: {idea.target_audience}
        Revenue Model: {idea.revenue_model}
        CAC / LTV: {opportunity.estimated_cac} / {opportunity.estimated_ltv}
        Competitors: {", ".join([c.name for c in competitors.competitors])}
        Unique Moat: {competitors.unique_moat}
        Customer Segment: {segmentation.primary_segment.persona_name}
        """

        prompt = f"""
        Conduct a multi-pillar Risk Analysis for the startup concept below:
        {context}

        Analyze all 6 risk pillars:
        1. Market Risk (demand validation, market timing, market saturation)
        2. Competitor Risk (incumbent response, barrier to entry, copycat clones)
        3. Financial Risk (runway burn, CAC exceeding LTV, pricing pushback)
        4. Technical Risk (API latency/dependence, scalability bottlenecks, reliability)
        5. Operational Risk (key person dependency, execution speed, regulatory/data compliance)
        6. Customer Risk (churn, long onboarding friction, low willingness to pay)

        For each of the 6 pillars, specify:
        - risk: 1 crisp sentence explaining the specific risk scenario.
        - probability: "Low" | "Medium" | "High"
        - impact: "Low" | "Medium" | "High" | "Critical"
        - severity: "Low" | "Medium" | "High" | "Critical"
        - mitigation: 1 concise actionable mitigation strategy (max 15 words).

        Also provide:
        - overall_risk_level: "Low", "Moderate", "High", or "Critical"
        - risk_summary: 1 concise sentence summarizing the core venture vulnerability.
        - key_mitigation_priorities: 4 actionable, ranked bullet points for founders.

        Return strictly a JSON object matching this schema:
        {{
            "overall_risk_level": "Moderate",
            "risk_summary": "1 concise sentence summary of overall venture risk.",
            "risks": [
                {{
                    "category": "Market Risk",
                    "risk": "Description of market risk.",
                    "probability": "Medium",
                    "impact": "High",
                    "severity": "Medium",
                    "mitigation": "Actionable mitigation strategy."
                }},
                {{
                    "category": "Competitor Risk",
                    "risk": "Description of competitor risk.",
                    "probability": "High",
                    "impact": "Medium",
                    "severity": "High",
                    "mitigation": "Actionable mitigation strategy."
                }},
                {{
                    "category": "Financial Risk",
                    "risk": "Description of financial risk.",
                    "probability": "Low",
                    "impact": "High",
                    "severity": "Medium",
                    "mitigation": "Actionable mitigation strategy."
                }},
                {{
                    "category": "Technical Risk",
                    "risk": "Description of technical risk.",
                    "probability": "Medium",
                    "impact": "Medium",
                    "severity": "Medium",
                    "mitigation": "Actionable mitigation strategy."
                }},
                {{
                    "category": "Operational Risk",
                    "risk": "Description of operational risk.",
                    "probability": "Low",
                    "impact": "Medium",
                    "severity": "Low",
                    "mitigation": "Actionable mitigation strategy."
                }},
                {{
                    "category": "Customer Risk",
                    "risk": "Description of customer risk.",
                    "probability": "Medium",
                    "impact": "High",
                    "severity": "Medium",
                    "mitigation": "Actionable mitigation strategy."
                }}
            ],
            "key_mitigation_priorities": [
                "1. Priority 1 mitigation action",
                "2. Priority 2 mitigation action",
                "3. Priority 3 mitigation action",
                "4. Priority 4 mitigation action"
            ]
        }}
        """

        system_instruction = "You are a startup risk management expert and venture auditor. Evaluate risks candidly, accurately, and provide realistic mitigations."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)
            
            risks_list = [RiskItem(**item) for item in parsed_data.get("risks", [])]
            logger.info(f"[{self.name}] risk analysis completed successfully with {len(risks_list)} pillars.")
            
            return RiskAnalysisData(
                overall_risk_level=parsed_data.get("overall_risk_level", "Moderate"),
                risk_summary=parsed_data.get("risk_summary", f"Balanced risk profile with primary focus needed on customer acquisition and technical uptime."),
                risks=risks_list,
                key_mitigation_priorities=parsed_data.get("key_mitigation_priorities", [])
            )
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize risk analysis: {str(e)}")
            return self._fallback_risks(idea)

    def _fallback_risks(self, idea: ExtractedIdea) -> RiskAnalysisData:
        ind = idea.industry or "Tech"
        aud = idea.target_audience or "Customers"
        return RiskAnalysisData(
            overall_risk_level="Moderate",
            risk_summary=f"{idea.startup_name} faces typical early-stage go-to-market risks in {ind}, primarily around customer acquisition efficiency and incumbent feature parity.",
            risks=[
                RiskItem(
                    category="Market Risk",
                    risk=f"Adoption inertia as {aud} continue relying on legacy manual habits.",
                    probability="Medium",
                    impact="High",
                    severity="High",
                    mitigation="Offer zero-friction freemium sandbox showing instant time-to-value within 60 seconds."
                ),
                RiskItem(
                    category="Competitor Risk",
                    risk=f"Incumbents or fast-followers bundling similar features into existing suites.",
                    probability="High",
                    impact="Medium",
                    severity="High",
                    mitigation="Build deep vertical workflow integrations and establish sticky user data network effects."
                ),
                RiskItem(
                    category="Financial Risk",
                    risk="Digital customer acquisition costs rising before achieving strong organic referrals.",
                    probability="Medium",
                    impact="High",
                    severity="Medium",
                    mitigation="Prioritize product-led viral loops, community growth, and upfront annual contract discounts."
                ),
                RiskItem(
                    category="Technical Risk",
                    risk="Reliance on external AI APIs causing latency spikes or unpredictable unit costs.",
                    probability="Medium",
                    impact="Medium",
                    severity="Medium",
                    mitigation="Implement smart multi-tier caching, response streaming, and fallback model redundancy."
                ),
                RiskItem(
                    category="Operational Risk",
                    risk="Founder bandwidth constraints handling product, support, and sales simultaneously.",
                    probability="Low",
                    impact="Medium",
                    severity="Low",
                    mitigation="Automate customer onboarding documentation and use self-service knowledge bases."
                ),
                RiskItem(
                    category="Customer Risk",
                    risk="Customer churn if initial setup requires complex user data configuration.",
                    probability="Medium",
                    impact="High",
                    severity="Medium",
                    mitigation="Provide 1-click preset templates tailored specifically to {aud} standard workflows."
                )
            ],
            key_mitigation_priorities=[
                "1. Ship interactive sandbox demo to bypass initial user skepticism.",
                "2. Implement response caching to keep AI inference costs under 10% of revenue.",
                "3. Lock in 10 design partners on 6-month beta agreements to guarantee initial retention.",
                "4. Build custom export integrations to lock in workflow defensibility."
            ]
        )
