import json
import logging
from typing import Dict, Any, List
from services.llm_service import call_gemini
from models.validation import AdvisorChatRequest, AdvisorChatResponse

logger = logging.getLogger(__name__)

DEFAULT_SUGGESTIONS = [
    "What should I build first?",
    "Why is my startup risky?",
    "How can I get my first 100 users?",
    "What is my biggest competitive threat?",
    "How should I price my MVP?"
]

class AdvisorAgent:
    def __init__(self):
        self.name = "Startup Advisor Agent"

    async def chat(self, request: AdvisorChatRequest) -> AdvisorChatResponse:
        """
        Answers user follow-up questions in a conversational manner using the validation report as context.
        """
        user_msg = request.message.strip()
        report_data = request.report_context or {}
        history = request.history or []

        logger.info(f"[{self.name}] processing question: '{user_msg[:60]}...'")

        # Format context summary
        summary = report_data.get("summary", {})
        idea = report_data.get("extracted_idea", {})
        scores = report_data.get("validation_scores", {})
        swot = report_data.get("swot_analysis", {})
        risks = report_data.get("risk_analysis", {})
        mvp = report_data.get("mvp_recommendation", {})
        gtm = report_data.get("gtm_strategy", {})
        opp = report_data.get("market_opportunity", {})
        comps = report_data.get("competitor_analysis", {})

        context_text = f"""
        [STARTUP PROFILE]
        Name: {idea.get("startup_name", "Startup")}
        Problem: {idea.get("core_problem", "N/A")}
        Solution: {idea.get("core_solution", "N/A")}
        Target Audience: {idea.get("target_audience", "N/A")}
        Industry: {idea.get("industry", "N/A")}
        Revenue Model: {idea.get("revenue_model", "N/A")}
        Overall Viability Score: {scores.get("overall_score", 75)}/100
        Verdict: {summary.get("feasibility_verdict", "N/A")}

        [MARKET & ECONOMICS]
        TAM: {opp.get("tam", "N/A")} | SAM: {opp.get("sam", "N/A")}
        Estimated CAC: {opp.get("estimated_cac", "N/A")} | LTV: {opp.get("estimated_ltv", "N/A")}

        [COMPETITORS & MOAT]
        Unique Moat: {comps.get("unique_moat", "N/A")}

        [SWOT SUMMARY]
        Strengths: {", ".join(swot.get("strengths", []))}
        Weaknesses: {", ".join(swot.get("weaknesses", []))}
        Opportunities: {", ".join(swot.get("opportunities", []))}
        Threats: {", ".join(swot.get("threats", []))}

        [RISK PROFILE]
        Overall Risk: {risks.get("overall_risk_level", "Moderate")}
        Risk Summary: {risks.get("risk_summary", "N/A")}
        Top Mitigation: {", ".join(risks.get("key_mitigation_priorities", []))}

        [MVP ROADMAP]
        MVP Philosophy: {mvp.get("mvp_summary", "N/A")}
        Timeline: {mvp.get("target_timeline_weeks", "4-6 Weeks")}
        Must-Have Features: {", ".join([f.get("feature_name", "") for f in mvp.get("must_have", [])])}

        [GO-TO-MARKET]
        Positioning: {gtm.get("positioning_statement", "N/A")}
        Pricing: {gtm.get("pricing_strategy", "N/A")}
        Launch Steps: {", ".join(gtm.get("how_to_get_started", []))}
        """

        # Format conversation history
        history_formatted = "\n".join([
            f"{msg.role.capitalize()}: {msg.content}" for msg in history[-6:]
        ])

        prompt = f"""
        You are an elite, high-signal AI Startup Advisor & Venture Partner.
        Answer the founder's question directly using their validation dossier as context.

        [VALIDATION DOSSIER]
        {context_text}

        [RECENT CONVERSATION HISTORY]
        {history_formatted or "None (start of conversation)"}

        [FOUNDER QUESTION]
        "{user_msg}"

        CRITICAL CONCISENESS RULES:
        1. Keep your reply VERY CONCISE and punchy (strictly under 60-80 words total).
        2. NO fluff, filler words, lengthy greetings, or disclaimers.
        3. Start with 1 direct, high-impact sentence.
        4. Follow with 2 to 3 short bullet points with key takeaways bolded.
        5. Tailor specifically to their startup ({idea.get("startup_name", "Startup")}) and customers ({idea.get("target_audience", "target audience")}).
        6. Provide 3 short suggested follow-up questions.

        Return strictly a JSON object matching this schema:
        {{
            "reply": "Concise, punchy markdown response (1 short lead sentence + 2-3 short bullets, under 80 words).",
            "suggested_followups": [
                "Short follow-up 1",
                "Short follow-up 2",
                "Short follow-up 3"
            ]
        }}
        """

        system_instruction = "You are a concise, high-signal startup advisor. Provide short, punchy, direct advice (under 80 words) using 2-3 clean bullet points. Zero fluff."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            parsed_data = json.loads(response_text)

            reply = parsed_data.get("reply", "")
            followups = parsed_data.get("suggested_followups", []) or DEFAULT_SUGGESTIONS[:3]

            logger.info(f"[{self.name}] response generated successfully.")
            return AdvisorChatResponse(
                reply=reply,
                suggested_followups=followups,
                confidence="High"
            )
        except Exception as e:
            logger.error(f"[{self.name}] LLM advisor call failed: {str(e)}. Generating contextual rule-based response.")
            return self._fallback_chat(user_msg, report_data)

    def _fallback_chat(self, user_msg: str, report: Dict[str, Any]) -> AdvisorChatResponse:
        """Rule-based concise contextual response engine when Gemini is unavailable."""
        msg_lower = user_msg.lower()
        idea = report.get("extracted_idea", {})
        name = idea.get("startup_name", "your startup")
        aud = idea.get("target_audience", "your target audience")
        ind = idea.get("industry", "your industry")
        prob = idea.get("core_problem", "the core user problem")
        
        mvp = report.get("mvp_recommendation", {})
        risks = report.get("risk_analysis", {})
        gtm = report.get("gtm_strategy", {})
        opp = report.get("market_opportunity", {})
        scores = report.get("validation_scores", {})
        summary = report.get("summary", {})
        overall_score = scores.get("overall_score", 78)

        if "build" in msg_lower or "first" in msg_lower or "mvp" in msg_lower:
            must_haves = mvp.get("must_have", [])
            if must_haves:
                feature_items = [f"- **{f.get('feature_name', 'Feature')}**: {f.get('description', '')}" for f in must_haves[:2]]
                features_str = "\n".join(feature_items)
            else:
                features_str = f"- **Core Workflow**: The simplest tool solving {prob}.\n- **Self-Service UI**: Frictionless testing for {aud}."

            timeline = mvp.get('target_timeline_weeks', '4-6 Weeks')
            reply = f"""**Focus strictly on the Must-Have workflow ({timeline} build):**

{features_str}
- **Rule**: Deliver value in <60 seconds; test with 10 beta users before writing more code."""

            followups = [
                "How do I keep MVP development under 4 weeks?",
                "How can I get my first 100 users?",
                "What features should I skip?"
            ]

        elif "risk" in msg_lower or "risky" in msg_lower or "threat" in msg_lower:
            risk_list = risks.get("risks", [])
            if risk_list:
                risk_items = [f"- **{r.get('category', 'Risk')}**: {r.get('risk', '')}" for r in risk_list[:2]]
                risk_str = "\n".join(risk_items)
            else:
                risk_str = f"- **Adoption**: Friction moving {aud} off legacy tools.\n- **Moat**: Need sticky data lock-in against rivals."

            risk_level = risks.get('overall_risk_level', 'Moderate')
            reply = f"""**Top risks for {name} ({risk_level} Risk Level):**

{risk_str}
- **Key Mitigation**: Pre-sell 5–10 letters of intent or beta commitments before heavy coding."""

            followups = [
                "How can I build a stronger moat?",
                "What should I build first?",
                "How do I validate willingness to pay?"
            ]

        elif "user" in msg_lower or "100" in msg_lower or "acquire" in msg_lower or "marketing" in msg_lower or "growth" in msg_lower:
            channels = gtm.get("acquisition_channels", [])
            if channels:
                channel_items = [f"- **{c.get('channel_name', 'Channel')}**: {c.get('description', '')}" for c in channels[:2]]
                channels_str = "\n".join(channel_items)
            else:
                channels_str = f"- **Founder Outreach**: Message 20 target users in {aud} daily.\n- **Community Seeding**: Share teardowns in niche communities."

            reply = f"""**Fastest path to your first 100 users for {name}:**

{channels_str}
- **Action**: Offer white-glove onboarding to early users in exchange for case studies and referrals."""

            followups = [
                "What is my ideal pricing model?",
                "What should I build first?",
                "Why is my startup risky?"
            ]

        elif "price" in msg_lower or "pricing" in msg_lower or "monetiz" in msg_lower or "charge" in msg_lower:
            tiers = gtm.get("pricing_tiers", [])
            if tiers:
                tiers_str = "\n".join([f"- **{t}**" for t in tiers[:2]])
            else:
                tiers_str = "- **Pro Tier**: Core workflow subscription.\n- **Team Tier**: Multi-user collaboration & priority features."

            pricing_strategy = gtm.get('pricing_strategy', f'Value-aligned subscription for {aud}.')

            reply = f"""**Pricing & Monetization for {name}:**

{tiers_str}
- **Strategy**: {pricing_strategy}
- **Action**: Charge beta users a discounted upfront annual plan to confirm real willingness to pay."""

            followups = [
                "How do I test pricing before building?",
                "How can I get my first 100 users?",
                "What should I build first?"
            ]

        else:
            verdict = summary.get('feasibility_verdict', 'Viable Concept')
            moat = report.get('competitor_analysis', {}).get('unique_moat', f'Workflows tailored for {aud}.')
            launch_phases = gtm.get('launch_strategy', [])
            first_phase = launch_phases[0].get('phase_name', 'Pre-launch validation') if launch_phases else 'Pre-launch validation'

            reply = f"""**Key Insight for {name}:**

- **Viability**: **{overall_score}%** ({verdict}).
- **Core Moat**: {moat}
- **Next Step**: Execute *{first_phase}* to validate customer demand quickly."""

            followups = DEFAULT_SUGGESTIONS[:3]

        return AdvisorChatResponse(
            reply=reply,
            suggested_followups=followups,
            confidence="High"
        )
