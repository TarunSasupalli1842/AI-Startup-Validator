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
        You are an elite, empathetic, and highly analytical AI Startup Advisor & Venture Partner.
        Answer the founder's question directly, referencing their specific validation metrics, SWOT, risks, MVP features, and GTM strategy.

        [VALIDATION KNOWLEDGE BASE]
        {context_text}

        [RECENT CONVERSATION HISTORY]
        {history_formatted or "None (start of conversation)"}

        [FOUNDER QUESTION]
        "{user_msg}"

        Requirements:
        - Provide an actionable, direct, and well-structured answer (2-4 paragraphs or formatted bullet points).
        - Ground your advice specifically in their startup's domain ({idea.get("industry", "their industry")}), target audience ({idea.get("target_audience", "their customers")}), and validation metrics.
        - Be encouraging yet pragmatically realistic about risks and execution pitfalls.
        - Generate 3 smart, highly relevant follow-up questions the founder should consider asking next.

        Return strictly a JSON object matching this schema:
        {{
            "reply": "Comprehensive, markdown-formatted response with clear advice and bullet points.",
            "suggested_followups": [
                "Suggested question 1",
                "Suggested question 2",
                "Suggested question 3"
            ]
        }}
        """

        system_instruction = "You are a seasoned startup advisor, Y Combinator-style mentor, and venture partner. Offer precise, battle-tested, and constructive guidance based strictly on the startup's validation dossier."

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
        """Rule-based contextual response engine when Gemini is unavailable."""
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
                feature_items = [f"- **{f.get('feature_name', 'Feature')}**: {f.get('description', '')}" for f in must_haves[:3]]
                features_str = "\n".join(feature_items)
            else:
                features_str = f"- **Core Automation Engine**: Build the simplest prototype solving {prob}.\n- **1-Click Self-Service UI**: Provide an intuitive interface allowing {aud} to test and receive results immediately."

            timeline = mvp.get('target_timeline_weeks', '4-6 Weeks')
            reply = f"""### 🚀 What You Should Build First for **{name}**

To validate customer demand without wasting engineering cycles, focus exclusively on the **Must-Have** core workflow:

{features_str}

**Key Strategic Advice:**
1. **Target Timeline:** Commit to a strict **{timeline} sprint**. Anything longer increases risk of building unvalidated features.
2. **Defensibility Focus:** Ensure your MVP delivers immediate value within 60 seconds of onboarding.
3. **Do Things That Don't Scale:** Manually verify outputs for your first 15 beta users to refine the algorithm before automating everything."""

            followups = [
                "How do I keep MVP development under 4 weeks?",
                "How can I get my first 100 users?",
                "What features should I deliberately NOT build yet?"
            ]

        elif "risk" in msg_lower or "risky" in msg_lower or "threat" in msg_lower:
            risk_list = risks.get("risks", [])
            if risk_list:
                risk_items = [f"- **{r.get('category', 'Risk')}**: {r.get('risk', '')} *(Mitigation: {r.get('mitigation', '')})*" for r in risk_list[:3]]
                risk_str = "\n".join(risk_items)
            else:
                risk_str = f"- **Customer Adoption Risk**: {aud} may exhibit friction moving away from existing legacy processes.\n- **Competitor Risk**: Incumbents in {ind} may replicate features if your workflow lacks sticky data lock-in."

            cac = opp.get('estimated_cac', '$50')
            ltv = opp.get('estimated_ltv', '$500')
            risk_level = risks.get('overall_risk_level', 'Moderate')

            reply = f"""### ⚠️ Risk Breakdown for **{name}** (Overall Risk: **{risk_level}**)

Here are the primary risk vectors identified in your validation analysis:

{risk_str}

**Top Recommended Mitigations:**
- **Pre-Sell to Design Partners:** Secure 5-10 letters of intent or beta commitments before writing extensive code.
- **Unit Economics Vigilance:** Keep customer acquisition cost below your projected LTV target ({cac} vs {ltv})."""

            followups = [
                "How can I protect my product against competitor copycats?",
                "What should I build first?",
                "How do I validate customer willingness to pay?"
            ]

        elif "user" in msg_lower or "100" in msg_lower or "acquire" in msg_lower or "marketing" in msg_lower or "growth" in msg_lower:
            channels = gtm.get("acquisition_channels", [])
            if channels:
                channel_items = [f"- **{c.get('channel_name', 'Channel')}**: {c.get('description', '')} *(CAC: {c.get('expected_cac', 'Low')})*" for c in channels[:3]]
                channels_str = "\n".join(channel_items)
            else:
                channels_str = f"1. **Direct Founder Outreach:** Personally message 50 decision makers in {aud} offering exclusive early access.\n2. **Community Seeding:** Share insightful teardowns and case studies in niche LinkedIn and Reddit groups.\n3. **Freemium Interactive Preview:** Allow visitors to experience the core value proposition with zero signup friction."

            reply = f"""### 🎯 How to Acquire Your First 100 Users for **{name}**

For early traction in **{ind}**, broad paid advertising is often too expensive. Instead, deploy a high-touch, product-led acquisition funnel:

{channels_str}

**Founder Action Checklist:**
1. Launch a lean waitlist landing page featuring a 45-second demo video.
2. Direct message 15 target users daily with personalized value pitches.
3. Offer initial users white-glove onboarding and free 3-month upgrades in exchange for case studies and referrals."""

            followups = [
                "What is my ideal pricing model?",
                "What should I build first?",
                "Why is my startup risky?"
            ]

        elif "price" in msg_lower or "pricing" in msg_lower or "monetiz" in msg_lower or "charge" in msg_lower:
            tiers = gtm.get("pricing_tiers", [])
            if tiers:
                tiers_str = "\n".join([f"- **{t}**" for t in tiers])
            else:
                tiers_str = "- **Free Starter Tier**: Basic trial limits to trigger viral word-of-mouth.\n- **Pro Tier ($39/mo)**: Unlimited core workflow executions.\n- **Team Tier ($149/mo)**: Collaborative features and priority support."

            pricing_strategy = gtm.get('pricing_strategy', f'Value-aligned subscription model tailored for {aud}.')

            reply = f"""### 💳 Monetization & Pricing Strategy for **{name}**

**Pricing Philosophy:** {pricing_strategy}

**Recommended Tier Architecture:**
{tiers_str}

**Validation Strategy:** Don't wait until full release to charge. Ask beta testers for a pre-order discount or upfront annual subscription to prove genuine willingness to pay."""

            followups = [
                "How do I test if customers will pay before building?",
                "How can I get my first 100 users?",
                "What should I build first?"
            ]

        else:
            verdict = summary.get('feasibility_verdict', 'Strong Concept')
            tam = opp.get('tam', f'High-growth segment in {ind}')
            moat = report.get('competitor_analysis', {}).get('unique_moat', f'Purpose-built workflows tailored specifically for {aud}.')
            launch_phases = gtm.get('launch_strategy', [])
            first_phase = launch_phases[0].get('phase_name', 'Pre-launch validation & MVP construction') if launch_phases else 'Pre-launch validation & MVP construction'

            reply = f"""### 💡 Venture Analysis Insight for **{name}**

Regarding your question about *"{user_msg}"*:

- **Current Viability Score:** **{overall_score}%** ({verdict}).
- **Core Market Opportunity:** {tam}.
- **Primary Moat:** {moat}.

**Recommended Next Step:**
Focus on executing the initial phase of your Go-To-Market roadmap: *{first_phase}*."""

            followups = DEFAULT_SUGGESTIONS[:3]

        return AdvisorChatResponse(
            reply=reply,
            suggested_followups=followups,
            confidence="High"
        )
