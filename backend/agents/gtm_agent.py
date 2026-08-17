import json
import logging
from services.llm_service import call_gemini
from models.validation import (
    ExtractedIdea, CustomerSegmentationData, MarketOpportunityData,
    CompetitorAnalysisData, GtmStrategyData, GtmChannel, GtmLaunchPhase
)

logger = logging.getLogger(__name__)

class GtmAgent:
    def __init__(self):
        self.name = "Go-To-Market Strategy Agent"

    async def run(
        self,
        idea: ExtractedIdea,
        segmentation: CustomerSegmentationData,
        opportunity: MarketOpportunityData,
        competitors: CompetitorAnalysisData
    ) -> GtmStrategyData:
        """
        Formulates comprehensive Go-To-Market execution blueprint:
        - Positioning Statement
        - Target Customer ICPs
        - Acquisition Channels & CAC
        - Phased Launch Roadmap (Phase 1, 2, 3)
        - Pricing Strategy & Tiers
        - Key Performance Indicators (KPIs)
        - Actionable "How do we get started?" 5-step checklist
        """
        logger.info(f"[{self.name}] formulating Go-To-Market strategy for '{idea.startup_name}'")

        context = f"""
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Industry: {idea.industry}
        Revenue Model: {idea.revenue_model}
        Target Customer Persona: {segmentation.primary_segment.persona_name} ({segmentation.primary_segment.target_profile})
        Willingness to Pay: {segmentation.primary_segment.willingness_to_pay}
        Primary Competitors: {", ".join([c.name for c in competitors.competitors])}
        Unique Moat: {competitors.unique_moat}
        Estimated CAC: {opportunity.estimated_cac} | LTV: {opportunity.estimated_ltv}
        """

        prompt = f"""
        Generate an aggressive, actionable Go-To-Market (GTM) strategy for this startup:
        {context}

        Provide:
        1. Positioning: One sharp sentence using standard positioning syntax ("For [target] who [need], {idea.startup_name} is a [category] that [benefit], unlike [competitors], our product [moat].")
        2. Target Customers: 3 specific early-adopter buyer descriptions.
        3. Acquisition Channels: 3 distinct high-leverage channels. Each with:
           - channel_name
           - description (1 concise execution sentence)
           - expected_cac (e.g. "$20-$50 per acquired user" or "Organic / <$10")
           - conversion_strategy (1 concise sentence on turning traffic into signups)
        4. Launch Strategy: 3 chronological phases:
           - phase_name (e.g. "Phase 1: Alpha & Waitlist Building", "Phase 2: Community Beta Launch", "Phase 3: Scaled Growth & Paid Outreach")
           - timeline (e.g. "Weeks 1-4", "Weeks 5-8", "Weeks 9-16")
           - key_activities (3 concise actionable bullets per phase)
           - goals (1 crisp measurable milestone)
        5. Pricing Strategy: 1 concise sentence describing the monetization model.
        6. Pricing Tiers: 3 realistic pricing packages with price points and limits.
        7. Key KPIs: 4 primary metrics that determine startup traction (e.g. "Activation Rate > 40%", "CAC Payback < 6 months", "Weekly User Retention > 35%", "Monthly Recurring Revenue $10k+").
        8. How to Get Started: Exactly 5 immediate, sequential steps answering "How do we get started right now this week?"

        Return strictly a JSON object matching this schema:
        {{
            "positioning_statement": "For [target], {idea.startup_name} is the...",
            "target_customers": [
                "Customer profile 1",
                "Customer profile 2",
                "Customer profile 3"
            ],
            "acquisition_channels": [
                {{
                    "channel_name": "Channel Name",
                    "description": "How to execute this channel.",
                    "expected_cac": "$XX - $XX",
                    "conversion_strategy": "Lead magnet to interactive sandbox trial."
                }},
                {{
                    "channel_name": "Channel Name 2",
                    "description": "How to execute this channel.",
                    "expected_cac": "$XX - $XX",
                    "conversion_strategy": "Direct demo booking."
                }},
                {{
                    "channel_name": "Channel Name 3",
                    "description": "How to execute this channel.",
                    "expected_cac": "Organic ($0 - $15)",
                    "conversion_strategy": "Community viral referrals."
                }}
            ],
            "launch_strategy": [
                {{
                    "phase_name": "Phase 1: Private Alpha & Pre-Launch",
                    "timeline": "Weeks 1-4",
                    "key_activities": [
                        "Activity 1",
                        "Activity 2",
                        "Activity 3"
                    ],
                    "goals": "Onboard 25 active beta testers and achieve 80% satisfaction."
                }},
                {{
                    "phase_name": "Phase 2: Public Beta & Community Launch",
                    "timeline": "Weeks 5-8",
                    "key_activities": [
                        "Activity 1",
                        "Activity 2",
                        "Activity 3"
                    ],
                    "goals": "Acquire first 250 registered users and 15 paid conversions."
                }},
                {{
                    "phase_name": "Phase 3: Scale & Multi-Channel Acquisition",
                    "timeline": "Weeks 9-16",
                    "key_activities": [
                        "Activity 1",
                        "Activity 2",
                        "Activity 3"
                    ],
                    "goals": "Scale to $5,000 MRR with under 60-day CAC payback."
                }}
            ],
            "pricing_strategy": "Freemium tiered SaaS model converting power users to monthly subscription.",
            "pricing_tiers": [
                "Starter (Free): Core trial features with monthly usage caps.",
                "Pro ($29-$49/mo): Unlimited automation workflows and priority support.",
                "Team / Enterprise ($149+/mo): Multi-seat access, export integrations, and dedicated SLA."
            ],
            "key_kpis": [
                "Trial-to-Paid Conversion Rate > 5%",
                "User Onboarding Activation Rate > 45%",
                "CAC Payback Period < 3 Months",
                "Net Revenue Retention > 105%"
            ],
            "how_to_get_started": [
                "1. Build a high-converting landing page with an interactive demo sandbox.",
                "2. Conduct 15 structured problem interviews with target decision makers.",
                "3. Launch a private waitlist via niche industry forums and LinkedIn groups.",
                "4. Ship the 3 Must-Have MVP features within a 4-week development sprint.",
                "5. Onboard the first 20 beta users with direct personal concierge support."
            ]
        }}
        """

        system_instruction = "You are a growth marketing executive and venture builder. Deliver tactical, highly specific, and battle-tested Go-To-Market playbooks."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)

            channels = [GtmChannel(**item) for item in parsed_data.get("acquisition_channels", [])]
            phases = [GtmLaunchPhase(**item) for item in parsed_data.get("launch_strategy", [])]

            logger.info(f"[{self.name}] GTM strategy generated successfully.")
            return GtmStrategyData(
                positioning_statement=parsed_data.get("positioning_statement", f"For {idea.target_audience}, {idea.startup_name} delivers automated {idea.industry} solutions faster and simpler than legacy tools."),
                target_customers=parsed_data.get("target_customers", []),
                acquisition_channels=channels,
                launch_strategy=phases,
                pricing_strategy=parsed_data.get("pricing_strategy", f"Tiered recurring subscription tailored to {idea.revenue_model}."),
                pricing_tiers=parsed_data.get("pricing_tiers", []),
                key_kpis=parsed_data.get("key_kpis", []),
                how_to_get_started=parsed_data.get("how_to_get_started", [])
            )
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize GTM strategy: {str(e)}")
            return self._fallback_gtm(idea)

    def _fallback_gtm(self, idea: ExtractedIdea) -> GtmStrategyData:
        ind = idea.industry or "Technology"
        aud = idea.target_audience or "Early Adopters"
        return GtmStrategyData(
            positioning_statement=f"For {aud} struggling with manual workflows, {idea.startup_name} is the intuitive {ind} platform that provides automated clarity, unlike legacy alternatives.",
            target_customers=[
                f"Early adopter operators within {aud} looking for competitive speed",
                f"Boutique agencies and mid-sized teams managing multiple {ind} workflows",
                "Independent founders and specialists seeking self-service automation"
            ],
            acquisition_channels=[
                GtmChannel(
                    channel_name="Product-Led Organic Search & Content",
                    description=f"Publish high-intent workflow guides and solution comparisons targeting {ind} keywords.",
                    expected_cac="Low ($10 - $25)",
                    conversion_strategy="Free interactive sandbox preview requiring zero sign-in to test."
                ),
                GtmChannel(
                    channel_name="Targeted Community & Social Seeding",
                    description=f"Engage in niche Subreddits, Discord communities, and LinkedIn groups for {aud}.",
                    expected_cac="Near Zero (Founder Time)",
                    conversion_strategy="Share actionable case studies and invite members to exclusive beta access."
                ),
                GtmChannel(
                    channel_name="High-Intent Paid Search & Social Retargeting",
                    description="Run targeted Google Search and LinkedIn ads against competitor brand keywords.",
                    expected_cac="Moderate ($45 - $85)",
                    conversion_strategy="Direct landing page offering free trial with instant value demonstration."
                )
            ],
            launch_strategy=[
                GtmLaunchPhase(
                    phase_name="Phase 1: Pre-Launch Validation & Waitlist",
                    timeline="Weeks 1-4",
                    key_activities=[
                        "Publish interactive landing page with value proposition headline and live demo video.",
                        f"Conduct 20 user interviews with {aud} to calibrate messaging.",
                        "Accumulate 150+ verified waitlist signups from relevant professional communities."
                    ],
                    goals="Validate problem-solution messaging and secure 25 active alpha commitments."
                ),
                GtmLaunchPhase(
                    phase_name="Phase 2: Closed Beta & Iteration Loop",
                    timeline="Weeks 5-8",
                    key_activities=[
                        "Deploy MVP core functionality to waitlist cohort in weekly batches.",
                        "Implement in-app feedback widgets and track user drop-off points.",
                        "Gather 10 detailed video testimonials and quantifiable user case studies."
                    ],
                    goals="Achieve 40%+ weekly active retention among beta users and zero critical bugs."
                ),
                GtmLaunchPhase(
                    phase_name="Phase 3: Public Launch & Growth Scale",
                    timeline="Weeks 9-16",
                    key_activities=[
                        "Launch on Product Hunt, Hacker News, and industry discovery directories.",
                        "Activate paid search and targeted partner integration listings.",
                        "Roll out self-service paid tiers with introductory annual discount incentives."
                    ],
                    goals="Reach first $5,000 Monthly Recurring Revenue with under 90-day payback period."
                )
            ],
            pricing_strategy="Value-aligned recurring subscription featuring a generous free tier to foster virality, converting power users through workflow caps and team features.",
            pricing_tiers=[
                "Starter (Free): 5 free monthly evaluations and basic reporting.",
                "Professional ($39/month): Unlimited reports, advanced export options, and custom presets.",
                "Team / Organization ($149/month): 5 seats, collaborative workspaces, and API access."
            ],
            key_kpis=[
                "Trial-to-Paid Conversion Rate > 6.5%",
                "Visitor-to-Signup Landing Page Rate > 18%",
                "CAC to LTV Ratio > 3.5x",
                "Monthly User Churn Rate < 3.5%"
            ],
            how_to_get_started=[
                "1. Set up a simple landing page showcasing the core value proposition and interactive demo.",
                "2. Outreach directly to 25 target prospective users on LinkedIn/Twitter for 15-minute feedback calls.",
                "3. Build and test the 3 Must-Have MVP features to validate customer satisfaction early.",
                "4. Launch closed beta access to initial interviewees and iterate based on their direct feedback.",
                "5. Prepare Product Hunt and community launch assets once 80%+ satisfaction is verified."
            ]
        )
