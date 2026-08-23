import json
import logging
from services.llm_service import call_gemini
from models.validation import ExtractedIdea, CustomerSegmentationData, CustomerSegmentPersona

logger = logging.getLogger(__name__)

class CustomerSegmentationAgent:
    def __init__(self):
        self.name = "Customer Segmentation Agent"

    async def run(self, idea: ExtractedIdea) -> CustomerSegmentationData:
        """
        Identifies core Customer Personas (ICPs), pain points, willingness to pay, acquisition channels, and conversion triggers.
        """
        logger.info(f"[{self.name}] mapping customer personas for startup: '{idea.startup_name}'")

        prompt = f"""
        Map customer personas using simple, clear words for:
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Target Audience: {idea.target_audience}
        Industry: {idea.industry}
        
        RULES:
        - Use simple, everyday words.
        - target_profile: 1 short sentence (max 12 words).
        - Bullets: 4 to 8 simple words each.
        - willingness_to_pay: In Indian Rupees (e.g., "High (₹2,999 - ₹7,999/mo)").
        - segmentation_strategy: 1 short simple sentence.

        Return strictly as a JSON object:
        {{
            "primary_segment": {{
                "persona_name": "Simple Name",
                "target_profile": "1 short simple profile sentence.",
                "key_pain_points": [
                    "pain point 1 (4-8 simple words)",
                    "pain point 2"
                ],
                "willingness_to_pay": "High (₹2,999 - ₹7,999/mo)",
                "acquisition_channels": [
                    "channel 1",
                    "channel 2"
                ],
                "buying_triggers": [
                    "trigger 1",
                    "trigger 2"
                ]
            }},
            "secondary_segments": [
                {{
                    "persona_name": "Secondary Name",
                    "target_profile": "1 short simple profile sentence.",
                    "key_pain_points": [
                        "pain point 1"
                    ],
                    "willingness_to_pay": "Medium (₹1,499 - ₹2,999/mo)",
                    "acquisition_channels": [
                        "channel 1"
                    ],
                    "buying_triggers": [
                        "trigger 1"
                    ]
                }},
                {{
                    "persona_name": "Team / Growth Name",
                    "target_profile": "1 short simple profile sentence.",
                    "key_pain_points": [
                        "pain point 1"
                    ],
                    "willingness_to_pay": "Very High (₹12,999+/mo)",
                    "acquisition_channels": [
                        "channel 1"
                    ],
                    "buying_triggers": [
                        "trigger 1"
                    ]
                }}
            ],
            "segmentation_strategy": "1 short simple sentence on customer rollout."
        }}
        """

        system_instruction = "You write in short, simple words. Keep personas, pain points, and channels compact, clear, and direct. Zero fluff."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)

            primary = CustomerSegmentPersona(**parsed_data["primary_segment"])
            secondaries = [CustomerSegmentPersona(**item) for item in parsed_data.get("secondary_segments", [])]

            logger.info(f"[{self.name}] customer segmentation mapping finished successfully.")
            return CustomerSegmentationData(
                primary_segment=primary,
                secondary_segments=secondaries,
                segmentation_strategy=parsed_data.get("segmentation_strategy", "Focus on early adopters in the primary segment before expanding to secondary enterprise tiers.")
            )
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize customer segmentation: {str(e)}")
            # Fallback customer segmentation
            primary_p = CustomerSegmentPersona(
                persona_name=f"Primary {idea.industry} Innovators",
                target_profile=f"Early-stage teams and individual operators in {idea.industry} who value high efficiency and modern AI automation.",
                key_pain_points=[
                    "Manual, repetitive setup processes",
                    "Lack of unified workflow tools",
                    "High cost of legacy enterprise software"
                ],
                willingness_to_pay="High (₹2,499 - ₹7,999/month)",
                acquisition_channels=[
                    "Direct Search & Content Marketing",
                    "Product-Led Growth (Freemium)",
                    "Niche Community Platforms & Product Hunt"
                ],
                buying_triggers=[
                    "Overwhelmed by manual workflows",
                    "Seeking competitive edge through AI speed"
                ]
            )

            secondaries_p = [
                CustomerSegmentPersona(
                    persona_name="Growth Stage Teams",
                    target_profile="Mid-sized department heads seeking team-wide collaboration features.",
                    key_pain_points=[
                        "Inconsistent team execution",
                        "Lack of analytics and reporting visibility"
                    ],
                    willingness_to_pay="Very High (₹15,999 - ₹39,999/month)",
                    acquisition_channels=[
                        "LinkedIn Outbound & Targeted Ads",
                        "Webinars and Industry Case Studies"
                    ],
                    buying_triggers=[
                        "Scaling team headcount without process control"
                    ]
                ),
                CustomerSegmentPersona(
                    persona_name="Indie Creators & Consultants",
                    target_profile="Solo entrepreneurs looking for fast, budget-friendly tools.",
                    key_pain_points=[
                        "Limited time and engineering resources",
                        "Need plug-and-play simplicity"
                    ],
                    willingness_to_pay="Moderate (₹1,299 - ₹2,999/month)",
                    acquisition_channels=[
                        "Social Media (X, YouTube, LinkedIn)",
                        "Affiliate & Partner Networks"
                    ],
                    buying_triggers=[
                        "High demand for automated self-service"
                    ]
                )
            ]

            return CustomerSegmentationData(
                primary_segment=primary_p,
                secondary_segments=secondaries_p,
                segmentation_strategy=f"Acquire early adopters through product-led growth (PLG) targeting '{idea.target_audience}', then introduce team collaboration tiers for enterprise upsell."
            )
