import json
import logging
import re
from typing import Dict, Any, List
from services.llm_service import call_gemini
from models.validation import AdvisorChatRequest, AdvisorChatResponse

logger = logging.getLogger(__name__)

DEFAULT_SUGGESTIONS = [
    "What should I build first in my MVP?",
    "Why is my startup risky and how do I fix it?",
    "How can I get my first 100 paying customers?",
    "What is my defensible competitive moat?",
    "How should I price my product tiers?"
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
        segs = report_data.get("customer_segmentation", {})
        matrix = report_data.get("comparison", {})

        startup_name = idea.get("startup_name", "Startup")
        target_audience = idea.get("target_audience", "Target Audience")

        context_text = f"""
        [STARTUP PROFILE]
        Name: {startup_name}
        Problem: {idea.get("core_problem", "N/A")}
        Solution: {idea.get("core_solution", "N/A")}
        Target Audience: {target_audience}
        Industry: {idea.get("industry", "N/A")}
        Revenue Model: {idea.get("revenue_model", "N/A")}
        Overall Viability Score: {scores.get("overall_score", 78)}/100
        Verdict: {summary.get("feasibility_verdict", "N/A")}

        [MARKET & ECONOMICS]
        TAM: {opp.get("tam", "N/A")} | SAM: {opp.get("sam", "N/A")} | SOM: {opp.get("som", "N/A")}
        Growth Rate: {opp.get("market_growth_rate", "N/A")}
        Estimated CAC: {opp.get("estimated_cac", "N/A")} | LTV: {opp.get("estimated_ltv", "N/A")}
        Unit Economics: {opp.get("unit_economics_summary", "N/A")}

        [CUSTOMER SEGMENTATION]
        Primary Persona: {segs.get("primary_segment", {}).get("persona_name", "N/A")}
        Pain Points: {", ".join(segs.get("primary_segment", {}).get("key_pain_points", []))}
        Buying Triggers: {", ".join(segs.get("primary_segment", {}).get("buying_triggers", []))}

        [COMPETITORS & MOAT]
        Unique Moat: {comps.get("unique_moat", "N/A")}
        Competitors: {", ".join([c.get("name", "") for c in comps.get("direct_competitors", [])])}

        [SWOT SUMMARY]
        Strengths: {", ".join(swot.get("strengths", []))}
        Weaknesses: {", ".join(swot.get("weaknesses", []))}
        Opportunities: {", ".join(swot.get("opportunities", []))}
        Threats: {", ".join(swot.get("threats", []))}

        [RISK PROFILE]
        Overall Risk: {risks.get("overall_risk_level", "Moderate")}
        Risk Summary: {risks.get("risk_summary", "N/A")}
        Key Mitigations: {", ".join(risks.get("key_mitigation_priorities", []))}

        [MVP ROADMAP]
        MVP Philosophy: {mvp.get("mvp_summary", "N/A")}
        Target Timeline: {mvp.get("target_timeline_weeks", "4-6 Weeks")}
        Must-Have Features: {", ".join([f.get("feature_name", "") for f in mvp.get("must_have", [])])}
        Should-Have Features: {", ".join([f.get("feature_name", "") for f in mvp.get("should_have", [])])}

        [GO-TO-MARKET]
        Positioning: {gtm.get("positioning_statement", "N/A")}
        Pricing: {gtm.get("pricing_strategy", "N/A")}
        Pricing Tiers: {", ".join(gtm.get("pricing_tiers", []))}
        Acquisition Channels: {", ".join([c.get("channel_name", "") for c in gtm.get("acquisition_channels", [])])}
        Launch Steps: {", ".join(gtm.get("how_to_get_started", []))}
        """

        # Format conversation history (excluding duplicate last user message)
        prior_messages = history[:-1] if history and history[-1].role == "user" and history[-1].content == user_msg else history
        history_formatted = "\n".join([
            f"{msg.role.capitalize()}: {msg.content}" for msg in prior_messages[-4:]
        ])

        prompt = f"""
        You are an elite, high-signal AI Startup Advisor and Venture Partner.
        Answer the founder's question directly using their validation dossier as context.

        [VALIDATION DOSSIER]
        {context_text}

        [RECENT CONVERSATION HISTORY]
        {history_formatted or "None (start of conversation)"}

        [FOUNDER QUESTION]
        "{user_msg}"

        CRITICAL CONCISENESS RULES:
        1. Keep your reply VERY CONCISE, punchy, and actionable (under 75 words total).
        2. NO greetings, filler phrases, or long disclaimers.
        3. Start with 1 direct, high-impact sentence.
        4. Follow with 2 to 3 short bullet points with key takeaways bolded.
        5. Tailor strictly to {startup_name} and {target_audience}. Use Indian Rupees (₹) for currency if relevant.
        6. Provide 3 short relevant follow-up questions.

        Return strictly a JSON object matching this schema:
        {{
            "reply": "Concise, punchy markdown response (1 short lead sentence + 2-3 short bullets, under 75 words).",
            "suggested_followups": [
                "Short follow-up 1",
                "Short follow-up 2",
                "Short follow-up 3"
            ]
        }}
        """

        system_instruction = "You are a concise, high-signal startup advisor. Provide short, punchy, direct advice (under 75 words) using 2-3 clean bullet points with bold key points. Zero fluff."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            
            # Robust JSON extraction
            try:
                parsed_data = json.loads(response_text)
                reply = parsed_data.get("reply", "").strip()
                followups = parsed_data.get("suggested_followups", []) or DEFAULT_SUGGESTIONS[:3]
            except Exception:
                # If JSON parsing failed but text exists, extract text cleanly
                reply = response_text.strip()
                followups = DEFAULT_SUGGESTIONS[:3]

            if not reply:
                raise ValueError("Empty reply from LLM")

            logger.info(f"[{self.name}] response generated successfully via LLM.")
            return AdvisorChatResponse(
                reply=reply,
                suggested_followups=followups[:3],
                confidence="High"
            )
        except Exception as e:
            logger.info(f"[{self.name}] LLM advisor call skipped/fallback ({str(e)}). Generating contextual rule-based response.")
            return self._fallback_chat(user_msg, report_data)

    def _fallback_chat(self, user_msg: str, report: Dict[str, Any]) -> AdvisorChatResponse:
        """Comprehensive contextual rule-based advisory engine leveraging the full validation report."""
        msg_lower = user_msg.lower().strip()
        
        idea = report.get("extracted_idea", {})
        name = idea.get("startup_name", "your startup")
        aud = idea.get("target_audience", "your target audience")
        ind = idea.get("industry", "your industry")
        prob = idea.get("core_problem", "the core customer pain point")
        sol = idea.get("core_solution", "your core solution")
        rev = idea.get("revenue_model", "subscription model")
        
        mvp = report.get("mvp_recommendation", {})
        risks = report.get("risk_analysis", {})
        gtm = report.get("gtm_strategy", {})
        opp = report.get("market_opportunity", {})
        comps = report.get("competitor_analysis", {})
        swot = report.get("swot_analysis", {})
        segs = report.get("customer_segmentation", {})
        scores = report.get("validation_scores", {})
        summary = report.get("summary", {})
        overall_score = scores.get("overall_score", 78)

        # 1. Customer Acquisition, First 100 Users, Marketing Channels, Growth (check before generic build/first)
        if any(k in msg_lower for k in ["100", "acquire", "acquisition", "marketing", "growth", "channel", "lead", "traffic", "funnel", "get user", "get customer", "find user", "find customer", "early user", "users"]):
            channels = gtm.get("acquisition_channels", [])
            if channels:
                channel_items = [f"- **{c.get('channel_name', 'Channel')}**: {c.get('description', '')} *(Target CAC: {c.get('expected_cac', 'Low')})*" for c in channels[:2]]
                channels_str = "\n".join(channel_items)
            else:
                channels_str = f"- **Direct Founder Outreach**: Contact 25 decision-makers in {aud} daily with personalized Loom audits.\n- **Niche Community Seeding**: Share valuable workflow teardowns in targeted industry hubs."

            reply = f"""**Fastest path to 100 paying users for {name}:**

{channels_str}
- **Playbook**: Offer white-glove onboarding to your first 20 beta users in exchange for case studies and referrals."""

            followups = [
                "What is my ideal pricing model?",
                "What is my estimated CAC vs LTV?",
                "What should I build first in my MVP?"
            ]

        # 2. MVP Scope, Features, Tech, Timeline
        elif any(k in msg_lower for k in ["build", "mvp", "feature", "moscow", "scope", "version", "timeline", "tech", "stack", "prototype"]):
            must_haves = mvp.get("must_have", [])
            timeline = mvp.get("target_timeline_weeks", "4-6 Weeks")
            if must_haves:
                feature_items = [f"- **{f.get('feature_name', 'Core Feature')}**: {f.get('description', 'Essential workflow automation')}" for f in must_haves[:2]]
                features_str = "\n".join(feature_items)
            else:
                features_str = f"- **Core Engine**: Solve {prob[:60]} in 1 click.\n- **Self-Service Flow**: Frictionless onboarding for {aud}."

            reply = f"""**Focus strictly on the Must-Have workflow ({timeline} build sprint):**

{features_str}
- **Rule**: Deliver measurable ROI in <60 seconds; test with 10 beta users before writing additional features."""

            followups = [
                "What features should I defer to Phase 2?",
                "How do I get my first 100 users?",
                "How should I price the MVP?"
            ]

        # 3. Risk, Threats, Failure Points, Mitigation
        elif any(k in msg_lower for k in ["risk", "risky", "threat", "fail", "danger", "pitfall", "regulation", "mitigat", "challenge"]):
            risk_list = risks.get("risks", [])
            risk_level = risks.get("overall_risk_level", "Moderate")
            if risk_list:
                risk_items = [f"- **{r.get('category', 'Risk')}**: {r.get('risk', '')} *(Fix: {r.get('mitigation', 'Pre-sell early')})*" for r in risk_list[:2]]
                risk_str = "\n".join(risk_items)
            else:
                risk_str = f"- **Adoption Friction**: Resistance from {aud} switching from manual routines.\n- **Defensibility**: Preventing fast followers from copying {sol[:40]}."

            top_mitigation = risks.get("key_mitigation_priorities", ["Secure 5 pre-launch letters of intent (LOIs)"])[0]
            reply = f"""**Top risk factors for {name} ({risk_level} Risk Tier):**

{risk_str}
- **Immediate Priority**: {top_mitigation}."""

            followups = [
                "How can I build a stronger competitive moat?",
                "How do I validate customer willingness to pay?",
                "What should I build first in my MVP?"
            ]

        # 4. Pricing, Monetization, Unit Economics, Subscription Tiers
        elif any(k in msg_lower for k in ["price", "pricing", "monetiz", "charge", "cost", "fee", "revenue", "tier", "subscription", "pay", "freemium", "dollar", "rupee"]):
            tiers = gtm.get("pricing_tiers", [])
            pricing_strategy = gtm.get("pricing_strategy", f"Value-aligned subscription for {aud}.")
            if tiers:
                tiers_str = "\n".join([f"- **{t}**" for t in tiers[:2]])
            else:
                tiers_str = f"- **Starter Tier**: Core workflow access for early {aud}.\n- **Pro Tier**: Advanced automation, integrations, and priority support."

            reply = f"""**Pricing & Monetization Strategy for {name}:**

{tiers_str}
- **Model**: {pricing_strategy}
- **Action**: Charge beta users upfront with an annual discount to validate true willingness to pay."""

            followups = [
                "How do I test pricing before writing code?",
                "What is my estimated CAC vs LTV?",
                "How can I get my first 100 paying customers?"
            ]

        # 5. Competitors, Alternatives, Moat, Differentiation
        elif any(k in msg_lower for k in ["competitor", "rival", "alternative", "moat", "advantage", "differentiate", "defensib", "compare", "vs", "market share", "replace"]):
            comp_list = comps.get("competitors", []) or comps.get("direct_competitors", [])
            moat = comps.get("unique_moat", f"Hyper-tailored workflows and faster time-to-value for {aud}.")
            if comp_list:
                comp_items = [f"- **{c.get('name', 'Competitor')}**: {c.get('weaknesses', ['Legacy architecture', 'High cost'])[0]} *(Your edge: {c.get('competitive_advantage', 'Instant setup')})*" for c in comp_list[:2]]
                comp_str = "\n".join(comp_items)
            else:
                comp_str = f"- **Legacy Incumbents**: Heavy, slow, and expensive enterprise tools.\n- **Manual Spreadsheets**: Cheap but error-prone and unscalable."

            reply = f"""**Competitive Landscape & Moat for {name}:**

{comp_str}
- **Defensible Moat**: {moat}."""

            followups = [
                "How do I convince customers to switch from competitors?",
                "What should I build first in my MVP?",
                "Why is my startup risky?"
            ]

        # 6. TAM, SAM, SOM, Market Size, Economics (CAC / LTV)
        elif any(k in msg_lower for k in ["tam", "sam", "som", "market size", "potential", "opportunity", "cac", "ltv", "unit economic", "cagr", "growth rate", "economics"]):
            tam = opp.get("tam", "Large Addressable Market")
            sam = opp.get("sam", "Focused Segment")
            som = opp.get("som", "3-Year Target")
            cac = opp.get("estimated_cac", "Moderate")
            ltv = opp.get("estimated_ltv", "High LTV")
            unit_eco = opp.get("unit_economics_summary", "Healthy recurring unit economics.")

            reply = f"""**Market Opportunity & Unit Economics for {name}:**

- **Market Sizing**: TAM of **{tam}**, SAM of **{sam}**, and SOM target of **{som}**.
- **Unit Economics**: Estimated CAC of **{cac}** vs LTV of **{ltv}**.
- **Assessment**: {unit_eco}"""

            followups = [
                "How do I lower my customer acquisition cost (CAC)?",
                "What is my ideal pricing model?",
                "How can I get my first 100 paying customers?"
            ]

        # 7. Customer Personas, Target Audience, ICP, Segmentation
        elif any(k in msg_lower for k in ["persona", "segment", "audience", "target", "demographic", "icp", "who", "profile", "ideal customer"]):
            primary = segs.get("primary_segment", {})
            p_name = primary.get("persona_name", f"Primary {aud}")
            pain = primary.get("key_pain_points", [prob])[0]
            wtp = primary.get("willingness_to_pay", "High willingness to pay for ROI")

            reply = f"""**Ideal Customer Profile (ICP) for {name}:**

- **Target Persona**: **{p_name}** in {ind}.
- **Core Pain Trigger**: {pain}.
- **Willingness to Pay**: {wtp}."""

            followups = [
                "How can I reach this persona directly?",
                "What is my ideal pricing model?",
                "What should I build first in my MVP?"
            ]

        # 8. SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
        elif any(k in msg_lower for k in ["swot", "strength", "weakness", "opportunit"]):
            strengths = swot.get("strengths", [f"Tailored solution for {aud}"])[:2]
            weaknesses = swot.get("weaknesses", ["Early-stage brand recognition"])[:2]
            opps = swot.get("opportunities", ["Rapid market digitization"])[:2]

            reply = f"""**SWOT Highlights for {name}:**

- **Strengths**: {', '.join(strengths)}.
- **Weaknesses**: {', '.join(weaknesses)}.
- **Top Opportunity**: {', '.join(opps)}."""

            followups = [
                "How do I overcome my biggest weaknesses?",
                "What is my defensible competitive moat?",
                "What should I build first in my MVP?"
            ]

        # 9. Launch Roadmap, Next Steps, Execution Checklist
        elif any(k in msg_lower for k in ["launch", "start", "step", "action", "roadmap", "plan", "execute", "begin", "checklist", "phase"]):
            phases = gtm.get("launch_strategy", [])
            steps = gtm.get("how_to_get_started", [])
            phase_1 = phases[0].get("phase_name", "Phase 1: Pre-launch validation") if phases else "Pre-launch validation"
            step_items = [f"- **Step {i+1}**: {s}" for i, s in enumerate(steps[:2])] if steps else [f"- **Validate**: Interview 15 target users in {aud}.\n- **Prototype**: Build the core 1-click workflow."]

            reply = f"""**Immediate Launch Execution Plan for {name}:**

- **Current Sprint**: **{phase_1}**.
{chr(10).join(step_items)}
- **Goal**: Lock in 5 committed beta pilot customers within 30 days."""

            followups = [
                "How can I get my first 100 paying customers?",
                "What should I build first in my MVP?",
                "What is my ideal pricing model?"
            ]

        # 10. Pitching, Investors, Fundraising, Valuation
        elif any(k in msg_lower for k in ["pitch", "investor", "fundrais", "angel", "vc", "raise", "valuation", "deck"]):
            tam = opp.get("tam", "Market")
            moat = comps.get("unique_moat", "Proprietary workflow")

            reply = f"""**Investor Pitch Narrative for {name} ({overall_score}% Score):**

- **The Hook**: {aud} are bleeding time on *{prob[:60]}*.
- **The Engine**: {name} delivers *{sol[:60]}* with a moat in *{moat[:40]}*.
- **Market Sizing**: Capitalizing on a **{tam}** sector opportunity."""

            followups = [
                "What traction metrics do investors want to see?",
                "What is my estimated CAC vs LTV?",
                "Why is my startup risky?"
            ]

        # 11. Feasibility Score & Verdict
        elif any(k in msg_lower for k in ["score", "feasib", "verdict", "viability", "rating", "why"]):
            verdict = summary.get("feasibility_verdict", "Viable Concept")
            clarity = scores.get("problem_clarity", 80)
            solution_score = scores.get("solution_strength", 80)
            market_score = scores.get("market_potential", 80)

            reply = f"""**Validation Score Breakdown for {name}:**

- **Overall Viability**: **{overall_score}%** ({verdict}).
- **Key Pillars**: Problem Clarity (**{clarity}%**), Solution Strength (**{solution_score}%**), Market Potential (**{market_score}%**).
- **Advisor Take**: Strong underlying thesis; execution speed is your primary differentiator."""

            followups = [
                "What should I build first in my MVP?",
                "How can I get my first 100 paying customers?",
                "Why is my startup risky?"
            ]

        # 12. General Comprehensive Advisor Response
        else:
            verdict = summary.get("feasibility_verdict", "High Viability Concept")
            moat = comps.get("unique_moat", f"Workflows tailored for {aud}.")
            phases = gtm.get("launch_strategy", [])
            first_phase = phases[0].get("phase_name", "Pre-launch customer discovery") if phases else "Pre-launch discovery"

            reply = f"""**Strategic Advisory for {name}:**

- **Thesis Viability**: **{overall_score}%** ({verdict}).
- **Core Differentiator**: {moat}
- **Immediate Next Sprint**: Execute *{first_phase}* with 10 beta prospects in {aud}."""

            followups = DEFAULT_SUGGESTIONS[:3]

        return AdvisorChatResponse(
            reply=reply,
            suggested_followups=followups,
            confidence="High"
        )

