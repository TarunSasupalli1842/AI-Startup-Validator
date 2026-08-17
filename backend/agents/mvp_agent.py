import json
import logging
from services.llm_service import call_gemini
from models.validation import (
    ExtractedIdea, CustomerSegmentationData, MarketResearchData,
    MvpRecommendationData, MvpFeatureItem
)

logger = logging.getLogger(__name__)

class MvpRecommendationAgent:
    def __init__(self):
        self.name = "MVP Recommendation Agent"

    async def run(
        self,
        idea: ExtractedIdea,
        segmentation: CustomerSegmentationData,
        research: MarketResearchData
    ) -> MvpRecommendationData:
        """
        Synthesizes an MVP build roadmap categorized strictly by the MoSCoW prioritization framework:
        - MUST HAVE (Crucial validation core)
        - SHOULD HAVE (Important high-value features for v1.1)
        - COULD HAVE (Delight features if resources allow)
        - WON'T HAVE (Explicitly out-of-scope for initial launch)
        """
        logger.info(f"[{self.name}] formulating MoSCoW MVP roadmap for '{idea.startup_name}'")

        context = f"""
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Industry: {idea.industry}
        Target Customer: {segmentation.primary_segment.persona_name} ({segmentation.primary_segment.target_profile})
        Customer Pain Points: {", ".join(research.customer_pain_points)}
        Value Proposition: {idea.value_proposition}
        """

        prompt = f"""
        Formulate a razor-sharp, actionable MVP product plan using the MoSCoW framework for this startup:
        {context}

        Requirements:
        - Consider market fit, primary customer pain points, resource constraints, and technical complexity.
        - MUST HAVE: 3 core essential features needed to deliver the core value proposition.
        - SHOULD HAVE: 2 high-impact features for immediate post-MVP retention.
        - COULD HAVE: 2 nice-to-have features for future delight.
        - WON'T HAVE: 2 features explicitly deferred to prevent scope creep.

        Each feature must have:
        - feature_name: Short title (max 5 words)
        - description: 1 concise sentence describing functionality.
        - rationale: 1 short sentence explaining why it's placed in this MoSCoW bucket.
        - complexity: "Low" | "Medium" | "High"
        - priority: "MUST HAVE" | "SHOULD HAVE" | "COULD HAVE" | "WON'T HAVE"

        Also provide:
        - mvp_summary: 1 concise sentence describing the MVP build philosophy.
        - target_timeline_weeks: Estimated build timeframe (e.g. "4-6 Weeks").
        - development_approach: 1 concise sentence on recommended tech stack and build strategy.

        Return strictly a JSON object matching this schema:
        {{
            "mvp_summary": "1 concise sentence defining core MVP scope.",
            "target_timeline_weeks": "4-6 Weeks",
            "development_approach": "Build a modular React/FastAPI prototype with external API integrations to test core loop.",
            "must_have": [
                {{
                    "feature_name": "Feature 1",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is Must-Have.",
                    "complexity": "Medium",
                    "priority": "MUST HAVE"
                }},
                {{
                    "feature_name": "Feature 2",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is Must-Have.",
                    "complexity": "Low",
                    "priority": "MUST HAVE"
                }},
                {{
                    "feature_name": "Feature 3",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is Must-Have.",
                    "complexity": "Medium",
                    "priority": "MUST HAVE"
                }}
            ],
            "should_have": [
                {{
                    "feature_name": "Feature 4",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is Should-Have.",
                    "complexity": "Medium",
                    "priority": "SHOULD HAVE"
                }},
                {{
                    "feature_name": "Feature 5",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is Should-Have.",
                    "complexity": "High",
                    "priority": "SHOULD HAVE"
                }}
            ],
            "could_have": [
                {{
                    "feature_name": "Feature 6",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is Could-Have.",
                    "complexity": "Low",
                    "priority": "COULD HAVE"
                }},
                {{
                    "feature_name": "Feature 7",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is Could-Have.",
                    "complexity": "Medium",
                    "priority": "COULD HAVE"
                }}
            ],
            "wont_have": [
                {{
                    "feature_name": "Feature 8",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is out of scope for MVP.",
                    "complexity": "High",
                    "priority": "WON'T HAVE"
                }},
                {{
                    "feature_name": "Feature 9",
                    "description": "Feature description sentence.",
                    "rationale": "Why it is out of scope for MVP.",
                    "complexity": "High",
                    "priority": "WON'T HAVE"
                }}
            ]
        }}
        """

        system_instruction = "You are a pragmatic VP of Product and technical founder. Design laser-focused MoSCoW MVP feature scopes that minimize time-to-market and maximize customer learning."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)

            def parse_items(key, default_priority):
                raw_list = parsed_data.get(key, [])
                items = []
                for item in raw_list:
                    if not item.get("priority"):
                        item["priority"] = default_priority
                    items.append(MvpFeatureItem(**item))
                return items

            logger.info(f"[{self.name}] MVP MoSCoW plan generated successfully.")
            return MvpRecommendationData(
                mvp_summary=parsed_data.get("mvp_summary", f"Deliver the single most critical workflow for {idea.target_audience} in the shortest time possible."),
                target_timeline_weeks=parsed_data.get("target_timeline_weeks", "4-6 Weeks"),
                development_approach=parsed_data.get("development_approach", "Lean single-page web app with backend AI pipeline and instant feedback loop."),
                must_have=parse_items("must_have", "MUST HAVE"),
                should_have=parse_items("should_have", "SHOULD HAVE"),
                could_have=parse_items("could_have", "COULD HAVE"),
                wont_have=parse_items("wont_have", "WON'T HAVE")
            )
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize MVP recommendations: {str(e)}")
            return self._fallback_mvp(idea)

    def _fallback_mvp(self, idea: ExtractedIdea) -> MvpRecommendationData:
        ind = idea.industry or "Software"
        aud = idea.target_audience or "Users"
        return MvpRecommendationData(
            mvp_summary=f"Focus solely on solving the core problem ({idea.core_problem[:60]}...) for {aud} with zero peripheral bloat.",
            target_timeline_weeks="4-6 Weeks",
            development_approach="Single-page responsive React web interface backed by lightweight FastAPI microservices.",
            must_have=[
                MvpFeatureItem(
                    feature_name="Core Automated Engine",
                    description=f"Primary automation tool solving {idea.core_problem[:50]}.",
                    rationale="Essential mechanism that delivers the core value proposition.",
                    complexity="Medium",
                    priority="MUST HAVE"
                ),
                MvpFeatureItem(
                    feature_name="One-Click Guided Workflow",
                    description=f"Streamlined form interface allowing {aud} to receive instant outputs.",
                    rationale="Minimizes user onboarding friction to establish immediate time-to-value.",
                    complexity="Low",
                    priority="MUST HAVE"
                ),
                MvpFeatureItem(
                    feature_name="Structured Results & Export",
                    description="Clear visual dashboard presenting results with PDF/clipboard export.",
                    rationale="Enables users to immediately utilize and share generated outputs.",
                    complexity="Low",
                    priority="MUST HAVE"
                )
            ],
            should_have=[
                MvpFeatureItem(
                    feature_name="User Accounts & History Log",
                    description="Save, reload, and review past analysis and project sessions.",
                    rationale="Increases multi-session retention and customer stickiness.",
                    complexity="Medium",
                    priority="SHOULD HAVE"
                ),
                MvpFeatureItem(
                    feature_name="Custom Workflow Presets",
                    description=f"Pre-configured templates tailored to specific {ind} scenarios.",
                    rationale="Accelerates output quality for diverse customer sub-segments.",
                    complexity="Medium",
                    priority="SHOULD HAVE"
                )
            ],
            could_have=[
                MvpFeatureItem(
                    feature_name="Interactive Team Workspace",
                    description="Invite team members to comment on and review outputs collaboratively.",
                    rationale="Expands single-user utility into B2B team licensing.",
                    complexity="High",
                    priority="COULD HAVE"
                ),
                MvpFeatureItem(
                    feature_name="Third-party Webhook Integration",
                    description="Push output notifications directly to Slack, Notion, or Email.",
                    rationale="Increases workflow embeddability across enterprise toolsets.",
                    complexity="Medium",
                    priority="COULD HAVE"
                )
            ],
            wont_have=[
                MvpFeatureItem(
                    feature_name="Native Mobile Applications (iOS/Android)",
                    description="Dedicated native apps on app stores.",
                    rationale="High build & review overhead; mobile web responsive view is sufficient for validation.",
                    complexity="High",
                    priority="WON'T HAVE"
                ),
                MvpFeatureItem(
                    feature_name="Custom On-Premise Enterprise Deployment",
                    description="Private cloud infrastructure installations.",
                    rationale="Too early in lifecycle; introduces complex sales cycles before product-market fit.",
                    complexity="High",
                    priority="WON'T HAVE"
                )
            ]
        )
