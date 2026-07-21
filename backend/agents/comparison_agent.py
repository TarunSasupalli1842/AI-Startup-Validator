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
        Build a head-to-head Comparison Matrix evaluating '{idea.startup_name}' against top market alternatives.
        
        Startup Name: {idea.startup_name}
        Core Solution: {idea.core_solution}
        Value Proposition: {idea.value_proposition}
        Revenue Model: {idea.revenue_model}
        Unique Moat: {competitor_data.unique_moat}
        
        Competitor Profiles:
        {competitor_details}
        
        Construct a detailed matrix with at least 5 key dimensions (e.g., Pricing Structure, AI Automation Depth, Time-to-Value, Ease of Setup, Defensive Moat / Data Integration).
        
        Return the response strictly as a JSON object matching this schema:
        {{
            "competitor_names": ["{comp_1_name}", "{comp_2_name}"],
            "comparison_matrix": [
                {{
                    "dimension": "Pricing Model & Transparency",
                    "our_startup": "Description of our pricing edge (e.g., Flexible, usage-based / transparent)",
                    "primary_competitor": "Description for {comp_1_name}",
                    "secondary_competitor": "Description for {comp_2_name}",
                    "our_advantage": "Clear win summary for our startup"
                }},
                {{
                    "dimension": "AI & Automation Depth",
                    "our_startup": "Native multi-agent AI framework",
                    "primary_competitor": "Legacy manual entry or basic scripts",
                    "secondary_competitor": "Basic single-prompt AI integration",
                    "our_advantage": "Autonomous multi-agent orchestration"
                }},
                {{
                    "dimension": "Time-to-Value & Onboarding",
                    "our_startup": "Instant 1-click execution",
                    "primary_competitor": "Multi-week onboarding consultation",
                    "secondary_competitor": "Manual setup templates required",
                    "our_advantage": "Zero-friction setup with immediate results"
                }},
                {{
                    "dimension": "Target User Customization",
                    "our_startup": "Tailored specifically for {idea.target_audience}",
                    "primary_competitor": "Generic enterprise suite",
                    "secondary_competitor": "Limited customization options",
                    "our_advantage": "Deep domain specialization"
                }},
                {{
                    "dimension": "Defensible Moat & Speed",
                    "our_startup": "{competitor_data.unique_moat[:60]}...",
                    "primary_competitor": "Legacy code inertia",
                    "secondary_competitor": "Basic indie wrapper",
                    "our_advantage": "Proprietary agent workflows & data loops"
                }}
            ],
            "positioning_summary": "A 2-3 sentence strategic summary explaining why our startup wins against both enterprise incumbents and lightweight tools."
        }}
        """

        system_instruction = "You are a product strategist and competitive benchmark specialist. Formulate precise, objective, and convincing head-to-head feature comparisons."

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
