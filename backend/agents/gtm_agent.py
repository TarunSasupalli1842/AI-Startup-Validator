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
        Formulate a Go-To-Market strategy using simple, clear words for:
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Industry: {idea.industry}
        Revenue Model: {idea.revenue_model}
        Unique Moat: {competitors.unique_moat}

        RULES:
        - Use simple, everyday words. Keep sentences short and direct.
        - positioning_statement: 1 short simple sentence (max 15 words).
        - target_customers: 3 short customer profiles (max 8 words each).
        - acquisition_channels: 3 channels (description max 10 words, expected_cac in ₹, conversion_strategy max 8 words).
        - launch_strategy: 3 phases (3 short activity bullets per phase, max 7 words per bullet).
        - pricing_strategy: 1 short simple sentence (max 12 words).
        - pricing_tiers: 3 short tiers in Indian Rupees (₹).
        - key_kpis: 4 short simple metrics (max 6 words each).
        - how_to_get_started: Exactly 5 short action steps (max 8 words each).
        - No long matter, jargon, or filler.

        Return strictly as a JSON object:
        {{
            "positioning_statement": "Simple 1-sentence positioning statement.",
            "target_customers": [
                "Customer profile 1 (under 8 words)",
                "Customer profile 2",
                "Customer profile 3"
            ],
            "acquisition_channels": [
                {{
                    "channel_name": "Channel Name",
                    "description": "Short execution sentence (max 10 words).",
                    "expected_cac": "Low (₹500 - ₹1,500)",
                    "conversion_strategy": "Free interactive demo trial."
                }},
                {{
                    "channel_name": "Channel Name 2",
                    "description": "Short execution sentence (max 10 words).",
                    "expected_cac": "Moderate (₹2,500 - ₹5,000)",
                    "conversion_strategy": "Direct demo calls."
                }},
                {{
                    "channel_name": "Channel Name 3",
                    "description": "Short execution sentence (max 10 words).",
                    "expected_cac": "Organic (₹0 - ₹500)",
                    "conversion_strategy": "Community word of mouth."
                }}
            ],
            "launch_strategy": [
                {{
                    "phase_name": "Phase 1: Alpha & Waitlist",
                    "timeline": "Weeks 1-4",
                    "key_activities": [
                        "Build clean landing page and demo",
                        "Interview 20 target users",
                        "Collect initial 100 waitlist signups"
                    ],
                    "goals": "Validate core user problem with 20 testers."
                }},
                {{
                    "phase_name": "Phase 2: Closed Beta",
                    "timeline": "Weeks 5-8",
                    "key_activities": [
                        "Give beta access to waitlist",
                        "Fix bugs and improve speed",
                        "Collect 5 positive testimonials"
                    ],
                    "goals": "Reach 40%+ weekly active user retention."
                }},
                {{
                    "phase_name": "Phase 3: Public Launch",
                    "timeline": "Weeks 9-16",
                    "key_activities": [
                        "Launch on Product Hunt and forums",
                        "Start targeted search marketing",
                        "Introduce discounted paid annual plan"
                    ],
                    "goals": "Reach first ₹4,00,000 monthly revenue."
                }}
            ],
            "pricing_strategy": "Simple freemium plan converting active users to paid monthly tier.",
            "pricing_tiers": [
                "Starter (Free): Basic core features with monthly limits.",
                "Pro (₹2,499/mo): Unlimited workflows and fast support.",
                "Team (₹9,999/mo): Multi-seat access and priority speed."
            ],
            "key_kpis": [
                "Sign-up conversion rate > 15%",
                "Paid upgrade rate > 5%",
                "Monthly churn < 3%",
                "CAC payback under 60 days"
            ],
            "how_to_get_started": [
                "1. Create simple 1-page landing page.",
                "2. Message 20 target users for feedback.",
                "3. Build 3 core Must-Have features.",
                "4. Launch closed beta to waitlist.",
                "5. Share launch on Product Hunt."
            ]
        }}
        """

        system_instruction = "You write in short, simple words. Formulate clear, concise Go-To-Market roadmaps and playbooks in Indian Rupees (₹). Zero fluff."

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
                    expected_cac="Low (₹800 - ₹2,000)",
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
                    expected_cac="Moderate (₹3,500 - ₹6,500)",
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
                    goals="Reach first ₹4,00,000 Monthly Recurring Revenue with under 90-day payback period."
                )
            ],
            pricing_strategy="Value-aligned recurring subscription featuring a generous free tier to foster virality, converting power users through workflow caps and team features.",
            pricing_tiers=[
                "Starter (Free): 5 free monthly evaluations and basic reporting.",
                "Professional (₹2,999/month): Unlimited reports, advanced export options, and custom presets.",
                "Team / Organization (₹11,999/month): 5 seats, collaborative workspaces, and API access."
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
