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
        Build Customer Segmentation for:
        Startup Name: {idea.startup_name}
        Core Problem: {idea.core_problem}
        Proposed Solution: {idea.core_solution}
        Target Audience: {idea.target_audience}
        Industry: {idea.industry}
        
        Keep all profiles, pain points, channels, and strategy concise (max 10 words per bullet, 1 short sentence per profile).
        Return strictly a JSON object matching this schema:
        {{
            "primary_segment": {{
                "persona_name": "Concise Persona Name",
                "target_profile": "1 short sentence profile.",
                "key_pain_points": [
                    "crisp pain point 1",
                    "crisp pain point 2"
                ],
                "willingness_to_pay": "High ($XX - $XXX/mo)",
                "acquisition_channels": [
                    "channel 1",
                    "channel 2"
                ],
                "buying_triggers": [
                    "crisp trigger 1",
                    "crisp trigger 2"
                ]
            }},
            "secondary_segments": [
                {{
                    "persona_name": "Secondary Persona Name",
                    "target_profile": "1 short sentence profile.",
                    "key_pain_points": [
                        "crisp pain point 1"
                    ],
                    "willingness_to_pay": "Medium ($XX - $XX/mo)",
                    "acquisition_channels": [
                        "channel 1"
                    ],
                    "buying_triggers": [
                        "crisp trigger 1"
                    ]
                }},
                {{
                    "persona_name": "Growth Persona Name",
                    "target_profile": "1 short sentence profile.",
                    "key_pain_points": [
                        "crisp pain point 1"
                    ],
                    "willingness_to_pay": "Very High ($XXX+/mo)",
                    "acquisition_channels": [
                        "channel 1"
                    ],
                    "buying_triggers": [
                        "crisp trigger 1"
                    ]
                }}
            ],
            "segmentation_strategy": "1 crisp sentence go-to-market customer roadmap."
        }}
        """

        system_instruction = "You are a customer discovery expert. Keep personas and customer strategies direct, accurate, and concise without wordy filler."

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
                willingness_to_pay="High ($29 - $99/month)",
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
                    willingness_to_pay="Very High ($199 - $499/month)",
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
                    willingness_to_pay="Moderate ($15 - $35/month)",
                    acquisition_channels=[
                        "Social Media (X, YouTube, TikTok)",
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
