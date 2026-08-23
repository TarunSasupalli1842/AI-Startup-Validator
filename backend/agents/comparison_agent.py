import json
import logging
from services.llm_service import call_gemini
from models.validation import ExtractedIdea, CompetitorAnalysisData, ComparisonData, MatrixComparisonRow

logger = logging.getLogger(__name__)

class ComparisonAgent:
    def __init__(self):
        self.name = "Comparison Matrix Agent"

    async def run(self, idea: ExtractedIdea, competitor_data: CompetitorAnalysisData) -> ComparisonData:
        """
        Creates a head-to-head comparison matrix between the startup and its top competitors.
        """
        logger.info(f"[{self.name}] building comparison matrix for startup: '{idea.startup_name}'")

        # Gather top competitor names
        comp_names = [c.name for c in competitor_data.competitors[:2]]
        comp_1_name = comp_names[0] if len(comp_names) > 0 else "Legacy Competitor"
        comp_2_name = comp_names[1] if len(comp_names) > 1 else "Niche Alternative"

        competitor_details = "\n".join([
            f"- {c.name}: {c.description} (Strengths: {', '.join(c.strengths)}; Weaknesses: {', '.join(c.weaknesses)})"
            for c in competitor_data.competitors
        ])

        prompt = f"""
        Build a head-to-head Comparison Matrix using simple, clear words for '{idea.startup_name}':
        Core Solution: {idea.core_solution}
        Revenue Model: {idea.revenue_model}
        Competitor Details:
        {competitor_details}
        
        RULES:
        - Use simple, everyday words.
        - Matrix cells: Strictly 2 to 5 simple words per cell.
        - positioning_summary: 1 short simple sentence (max 15 words).
        - No jargon or long matter.

        Return strictly as a JSON object:
        {{
            "competitor_names": ["{comp_1_name}", "{comp_2_name}"],
            "comparison_matrix": [
                {{
                    "dimension": "Pricing",
                    "our_startup": "Affordable monthly plan",
                    "primary_competitor": "Expensive contracts",
                    "secondary_competitor": "High per-user fees",
                    "our_advantage": "Lower entry cost"
                }},
                {{
                    "dimension": "Ease of Use",
                    "our_startup": "Instant 1-click setup",
                    "primary_competitor": "Weeks of onboarding",
                    "secondary_competitor": "Manual setup required",
                    "our_advantage": "Zero learning curve"
                }},
                {{
                    "dimension": "Speed & Automation",
                    "our_startup": "Automated AI workflows",
                    "primary_competitor": "Manual data entry",
                    "secondary_competitor": "Basic templates only",
                    "our_advantage": "Saves 10+ hours weekly"
                }},
                {{
                    "dimension": "Target Fit",
                    "our_startup": "Tailored for {idea.target_audience}",
                    "primary_competitor": "Generic enterprise tool",
                    "secondary_competitor": "Limited flexibility",
                    "our_advantage": "Built for their exact needs"
                }},
                {{
                    "dimension": "Customer Support",
                    "our_startup": "Fast 24/7 self-service",
                    "primary_competitor": "Slow email tickets",
                    "secondary_competitor": "Community forum only",
                    "our_advantage": "Instant AI guidance"
                }}
            ],
            "positioning_summary": "1 short simple sentence on competitive positioning."
        }}
        """

        system_instruction = "You write in short, simple words. Give clean, compact feature comparisons (2-5 words per cell). Zero fluff."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)

            matrix_rows = [MatrixComparisonRow(**item) for item in parsed_data.get("comparison_matrix", [])]
            comp_names_list = parsed_data.get("competitor_names", [comp_1_name, comp_2_name])

            logger.info(f"[{self.name}] comparison matrix generated successfully.")
            return ComparisonData(
                competitor_names=comp_names_list,
                comparison_matrix=matrix_rows,
                positioning_summary=parsed_data.get("positioning_summary", f"{idea.startup_name} positions itself as the modern, AI-first solution that combines enterprise-grade intelligence with friction-free setup.")
            )
        except Exception as e:
            logger.error(f"[{self.name}] failed to synthesize comparison matrix: {str(e)}")
            # Fallback comparison matrix
            fallback_matrix = [
                MatrixComparisonRow(
                    dimension="Pricing Model & Transparency",
                    our_startup=f"Flexible {idea.revenue_model} with low entry barrier",
                    primary_competitor=f"Expensive enterprise licensing ({comp_1_name})",
                    secondary_competitor=f"Rigid monthly tier ({comp_2_name})",
                    our_advantage="Pay-as-you-grow transparency with no hidden setup fees"
                ),
                MatrixComparisonRow(
                    dimension="AI & Automation Depth",
                    our_startup="Native multi-agent validation pipeline",
                    primary_competitor="Manual rule-based workflow engine",
                    secondary_competitor="Basic single-prompt AI plugin",
                    our_advantage="Autonomous multi-agent synthesis & web intelligence"
                ),
                MatrixComparisonRow(
                    dimension="Time-to-Value",
                    our_startup="Instant automated report generation",
                    primary_competitor="Requires 2+ weeks onboarding",
                    secondary_competitor="Requires manual workflow building",
                    our_advantage="Immediate actionable output in under 60 seconds"
                ),
                MatrixComparisonRow(
                    dimension="Domain Specialization",
                    our_startup=f"Built specifically for {idea.target_audience}",
                    primary_competitor="Generic across all industries",
                    secondary_competitor="Narrow single-feature scope",
                    our_advantage=f"Deep alignment with {idea.industry} requirements"
                ),
                MatrixComparisonRow(
                    dimension="Defensibility & Moat",
                    our_startup=f"{competitor_data.unique_moat[:60]}...",
                    primary_competitor="High legacy technical debt",
                    secondary_competitor="Easily replicated thin wrapper",
                    our_advantage="Multi-agent orchestration and network data loops"
                )
            ]

            return ComparisonData(
                competitor_names=[comp_1_name, comp_2_name],
                comparison_matrix=fallback_matrix,
                positioning_summary=f"{idea.startup_name} captures the sweet spot by offering superior multi-agent automation compared to {comp_1_name} and far deeper domain intelligence than {comp_2_name}."
            )
