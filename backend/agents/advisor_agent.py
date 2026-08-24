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

def _safe_str(val: Any, default: str = "") -> str:
    if val is None:
        return default
    return str(val).strip() or default

def _safe_list_str(val: Any) -> List[str]:
    if not isinstance(val, list):
        return []
    res = []
    for item in val:
        if isinstance(item, str):
            res.append(item)
        elif isinstance(item, dict):
            res.append(str(item.get("feature_name") or item.get("name") or item.get("channel_name") or item.get("risk") or item))
        elif item is not None:
            res.append(str(item))
    return res

class AdvisorAgent:
    def __init__(self):
        self.name = "Startup Advisor Agent"

    async def chat(self, request: AdvisorChatRequest) -> AdvisorChatResponse:
        """
        Answers user follow-up questions in a conversational manner using the validation report as context.
        """
        user_msg = request.message.strip() if request.message else ""
        if not user_msg:
            return AdvisorChatResponse(
                reply="Please ask a question about your startup, MVP roadmap, pricing, or go-to-market strategy.",
                suggested_followups=DEFAULT_SUGGESTIONS[:3],
                confidence="High"
            )

        report_data = request.report_context or {}
        history = request.history or []

        logger.info(f"[{self.name}] processing question: '{user_msg[:60]}...'")

        # Format context summary safely
        summary = report_data.get("summary") if isinstance(report_data.get("summary"), dict) else {}
        idea = report_data.get("extracted_idea") if isinstance(report_data.get("extracted_idea"), dict) else {}
        scores = report_data.get("validation_scores") if isinstance(report_data.get("validation_scores"), dict) else {}
        swot = report_data.get("swot_analysis") if isinstance(report_data.get("swot_analysis"), dict) else {}
        risks = report_data.get("risk_analysis") if isinstance(report_data.get("risk_analysis"), dict) else {}
        mvp = report_data.get("mvp_recommendation") if isinstance(report_data.get("mvp_recommendation"), dict) else {}
        gtm = report_data.get("gtm_strategy") if isinstance(report_data.get("gtm_strategy"), dict) else {}
        opp = report_data.get("market_opportunity") if isinstance(report_data.get("market_opportunity"), dict) else {}
        comps = report_data.get("competitor_analysis") if isinstance(report_data.get("competitor_analysis"), dict) else {}
        segs = report_data.get("customer_segmentation") if isinstance(report_data.get("customer_segmentation"), dict) else {}

        startup_name = _safe_str(idea.get("startup_name"), "Startup")
        target_audience = _safe_str(idea.get("target_audience"), "Target Audience")

        # Extract competitor names safely
        comp_entries = comps.get("competitors") or comps.get("direct_competitors") or []
        comp_names = [c.get("name", "") if isinstance(c, dict) else str(c) for c in comp_entries]

        # Extract personas safely
        primary_seg = segs.get("primary_segment") if isinstance(segs.get("primary_segment"), dict) else {}
        persona_name = _safe_str(primary_seg.get("persona_name"), "Primary Customer")
        pain_points = _safe_list_str(primary_seg.get("key_pain_points"))
        buying_triggers = _safe_list_str(primary_seg.get("buying_triggers"))

        # Extract MVP features safely
        must_haves = [f.get("feature_name", "") if isinstance(f, dict) else str(f) for f in (mvp.get("must_have") or [])]
        should_haves = [f.get("feature_name", "") if isinstance(f, dict) else str(f) for f in (mvp.get("should_have") or [])]

        # Extract GTM channels safely
        channels = [c.get("channel_name", "") if isinstance(c, dict) else str(c) for c in (gtm.get("acquisition_channels") or [])]

        context_text = f"""
        [STARTUP PROFILE]
        Name: {startup_name}
        Problem: {_safe_str(idea.get("core_problem"), "N/A")}
        Solution: {_safe_str(idea.get("core_solution"), "N/A")}
        Target Audience: {target_audience}
        Industry: {_safe_str(idea.get("industry"), "N/A")}
        Revenue Model: {_safe_str(idea.get("revenue_model"), "N/A")}
        Overall Viability Score: {scores.get("overall_score", 78)}/100
        Verdict: {_safe_str(summary.get("feasibility_verdict"), "N/A")}

        [MARKET & ECONOMICS]
        TAM: {_safe_str(opp.get("tam"), "N/A")} | SAM: {_safe_str(opp.get("sam"), "N/A")} | SOM: {_safe_str(opp.get("som"), "N/A")}
        Growth Rate: {_safe_str(opp.get("market_growth_rate"), "N/A")}
        Estimated CAC: {_safe_str(opp.get("estimated_cac"), "N/A")} | LTV: {_safe_str(opp.get("estimated_ltv"), "N/A")}
        Unit Economics: {_safe_str(opp.get("unit_economics_summary"), "N/A")}

        [CUSTOMER SEGMENTATION]
        Primary Persona: {persona_name}
        Pain Points: {", ".join(pain_points) or "N/A"}
        Buying Triggers: {", ".join(buying_triggers) or "N/A"}

        [COMPETITORS & MOAT]
        Unique Moat: {_safe_str(comps.get("unique_moat"), "N/A")}
        Competitors: {", ".join(comp_names) or "N/A"}

        [SWOT SUMMARY]
        Strengths: {", ".join(_safe_list_str(swot.get("strengths"))) or "N/A"}
        Weaknesses: {", ".join(_safe_list_str(swot.get("weaknesses"))) or "N/A"}
        Opportunities: {", ".join(_safe_list_str(swot.get("opportunities"))) or "N/A"}
        Threats: {", ".join(_safe_list_str(swot.get("threats"))) or "N/A"}

        [RISK PROFILE]
        Overall Risk: {_safe_str(risks.get("overall_risk_level"), "Moderate")}
        Risk Summary: {_safe_str(risks.get("risk_summary"), "N/A")}
        Key Mitigations: {", ".join(_safe_list_str(risks.get("key_mitigation_priorities"))) or "N/A"}

        [MVP ROADMAP]
        MVP Philosophy: {_safe_str(mvp.get("mvp_summary"), "N/A")}
        Target Timeline: {_safe_str(mvp.get("target_timeline_weeks"), "4-6 Weeks")}
        Must-Have Features: {", ".join(must_haves) or "N/A"}
        Should-Have Features: {", ".join(should_haves) or "N/A"}

        [GO-TO-MARKET]
        Positioning: {_safe_str(gtm.get("positioning_statement"), "N/A")}
        Pricing: {_safe_str(gtm.get("pricing_strategy"), "N/A")}
        Pricing Tiers: {", ".join(_safe_list_str(gtm.get("pricing_tiers"))) or "N/A"}
        Acquisition Channels: {", ".join(channels) or "N/A"}
        Launch Steps: {", ".join(_safe_list_str(gtm.get("how_to_get_started"))) or "N/A"}
        """

        # Format conversation history
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
        msg_lower = user_msg.lower().strip() if user_msg else ""
        
        idea = report.get("extracted_idea") if isinstance(report.get("extracted_idea"), dict) else {}
        name = _safe_str(idea.get("startup_name"), "your startup")
        aud = _safe_str(idea.get("target_audience"), "your target audience")
        ind = _safe_str(idea.get("industry"), "your industry")
        prob = _safe_str(idea.get("core_problem"), "the core customer pain point")
        sol = _safe_str(idea.get("core_solution"), "your core solution")
        rev = _safe_str(idea.get("revenue_model"), "subscription model")
        
        mvp = report.get("mvp_recommendation") if isinstance(report.get("mvp_recommendation"), dict) else {}
        risks = report.get("risk_analysis") if isinstance(report.get("risk_analysis"), dict) else {}
        gtm = report.get("gtm_strategy") if isinstance(report.get("gtm_strategy"), dict) else {}
        opp = report.get("market_opportunity") if isinstance(report.get("market_opportunity"), dict) else {}
        comps = report.get("competitor_analysis") if isinstance(report.get("competitor_analysis"), dict) else {}
        swot = report.get("swot_analysis") if isinstance(report.get("swot_analysis"), dict) else {}
        segs = report.get("customer_segmentation") if isinstance(report.get("customer_segmentation"), dict) else {}
        scores = report.get("validation_scores") if isinstance(report.get("validation_scores"), dict) else {}
        summary = report.get("summary") if isinstance(report.get("summary"), dict) else {}
        overall_score = scores.get("overall_score", 78)

        # 1. Customer Acquisition, First 100 Users, Marketing Channels, Growth
        if any(k in msg_lower for k in ["100", "acquire", "acquisition", "marketing", "growth", "channel", "lead", "traffic", "funnel", "get user", "get customer", "find user", "find customer", "early user", "users"]):
            channels = gtm.get("acquisition_channels") if isinstance(gtm.get("acquisition_channels"), list) else []
            if channels and len(channels) > 0:
                channel_items = []
                for c in channels[:2]:
                    if isinstance(c, dict):
                        channel_items.append(f"- **{c.get('channel_name', 'Channel')}**: {c.get('description', '')} *(Target CAC: {c.get('expected_cac', 'Low')})*")
                    else:
                        channel_items.append(f"- **{str(c)}**: Direct founder outreach and targeted industry community.")
                channels_str = "\n".join(channel_items)
            else:
                channels_str = f"- **Direct Founder Outreach**: Contact 25 decision-makers in {aud} daily with personalized video audits.\n- **Niche Community Seeding**: Share valuable workflow teardowns in targeted industry hubs."

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
            must_haves = mvp.get("must_have") if isinstance(mvp.get("must_have"), list) else []
            timeline = _safe_str(mvp.get("target_timeline_weeks"), "4-6 Weeks")
            if must_haves and len(must_haves) > 0:
                feature_items = []
                for f in must_haves[:2]:
                    if isinstance(f, dict):
                        feature_items.append(f"- **{f.get('feature_name', 'Core Feature')}**: {f.get('description', 'Essential workflow automation')}")
                    else:
                        feature_items.append(f"- **{str(f)}**: Essential core capability")
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
            risk_list = risks.get("risks") if isinstance(risks.get("risks"), list) else []
            risk_level = _safe_str(risks.get("overall_risk_level"), "Moderate")
            if risk_list and len(risk_list) > 0:
                risk_items = []
                for r in risk_list[:2]:
                    if isinstance(r, dict):
                        risk_items.append(f"- **{r.get('category', 'Risk')}**: {r.get('risk', '')} *(Fix: {r.get('mitigation', 'Pre-sell early')})*")
                    else:
                        risk_items.append(f"- **Risk**: {str(r)} *(Fix: Validate with beta users early)*")
                risk_str = "\n".join(risk_items)
            else:
                risk_str = f"- **Adoption Friction**: Resistance from {aud} switching from manual routines.\n- **Defensibility**: Preventing fast followers from copying {sol[:40]}."

            mitigation_list = risks.get("key_mitigation_priorities") if isinstance(risks.get("key_mitigation_priorities"), list) else []
            top_mitigation = mitigation_list[0] if (mitigation_list and len(mitigation_list) > 0) else "Secure 5 pre-launch letters of intent (LOIs)"

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
            tiers = gtm.get("pricing_tiers") if isinstance(gtm.get("pricing_tiers"), list) else []
            pricing_strategy = _safe_str(gtm.get("pricing_strategy"), f"Value-aligned subscription for {aud}.")
            if tiers and len(tiers) > 0:
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
            comp_list = comps.get("competitors") or comps.get("direct_competitors") or []
            if not isinstance(comp_list, list):
                comp_list = []
            moat = _safe_str(comps.get("unique_moat"), f"Hyper-tailored workflows and faster time-to-value for {aud}.")
            if comp_list and len(comp_list) > 0:
                comp_items = []
                for c in comp_list[:2]:
                    if isinstance(c, dict):
                        c_name = c.get('name', 'Competitor')
                        w_list = c.get('weaknesses') if isinstance(c.get('weaknesses'), list) else []
                        c_weak = w_list[0] if (w_list and len(w_list) > 0) else "Legacy interface and slow workflow"
                        c_adv = c.get('competitive_advantage', 'Instant setup and tailored features')
                        comp_items.append(f"- **{c_name}**: {c_weak} *(Your edge: {c_adv})*")
                    else:
                        comp_items.append(f"- **{str(c)}**: Legacy architecture *(Your edge: Faster setup)*")
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
            tam = _safe_str(opp.get("tam"), "Large Addressable Market")
            sam = _safe_str(opp.get("sam"), "Focused Segment")
            som = _safe_str(opp.get("som"), "3-Year Target")
            cac = _safe_str(opp.get("estimated_cac"), "Moderate")
            ltv = _safe_str(opp.get("estimated_ltv"), "High LTV")
            unit_eco = _safe_str(opp.get("unit_economics_summary"), "Healthy recurring unit economics.")

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
            primary = segs.get("primary_segment") if isinstance(segs.get("primary_segment"), dict) else {}
            p_name = _safe_str(primary.get("persona_name"), f"Primary {aud}")
            pains = primary.get("key_pain_points") if isinstance(primary.get("key_pain_points"), list) else []
            pain = pains[0] if (pains and len(pains) > 0) else prob
            wtp = _safe_str(primary.get("willingness_to_pay"), "High willingness to pay for ROI")

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
            raw_strengths = swot.get("strengths") if isinstance(swot.get("strengths"), list) else []
            raw_weaknesses = swot.get("weaknesses") if isinstance(swot.get("weaknesses"), list) else []
            raw_opps = swot.get("opportunities") if isinstance(swot.get("opportunities"), list) else []

            strengths = raw_strengths[:2] if len(raw_strengths) > 0 else [f"Tailored solution for {aud}"]
            weaknesses = raw_weaknesses[:2] if len(raw_weaknesses) > 0 else ["Early-stage brand recognition"]
            opps = raw_opps[:2] if len(raw_opps) > 0 else ["Rapid market digitization"]

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
            phases = gtm.get("launch_strategy") if isinstance(gtm.get("launch_strategy"), list) else []
            steps = gtm.get("how_to_get_started") if isinstance(gtm.get("how_to_get_started"), list) else []
            phase_1 = phases[0].get("phase_name", "Phase 1: Pre-launch validation") if (phases and len(phases) > 0 and isinstance(phases[0], dict)) else "Phase 1: Pre-launch validation"
            
            if steps and len(steps) > 0:
                step_items = [f"- **Step {i+1}**: {s}" for i, s in enumerate(steps[:2])]
            else:
                step_items = [f"- **Validate**: Interview 15 target users in {aud}.\n- **Prototype**: Build the core 1-click workflow."]

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
        elif any(k in msg_lower for k in ["pitch", "investor", "fundrais", "angel", "vc", "raise", "valuation", "deck", "capital"]):
            tam = _safe_str(opp.get("tam"), "Market Opportunity")
            moat = _safe_str(comps.get("unique_moat"), "Proprietary workflow")

            reply = f"""**Investor Pitch Narrative for {name} ({overall_score}% Score):**

- **The Hook**: {aud} are bleeding time and budget on *{prob[:60]}*.
- **The Engine**: {name} delivers *{sol[:60]}* with a moat in *{moat[:40]}*.
- **Market Sizing**: Capitalizing on a **{tam}** sector opportunity."""

            followups = [
                "What traction metrics do investors want to see?",
                "What is my estimated CAC vs LTV?",
                "Why is my startup risky?"
            ]

        # 11. Feasibility Score & Verdict
        elif any(k in msg_lower for k in ["score", "feasib", "verdict", "viability", "rating", "why"]):
            verdict = _safe_str(summary.get("feasibility_verdict"), "Viable Concept")
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

        # 12. Tech Stack, Architecture & AI Integration
        elif any(k in msg_lower for k in ["tech", "stack", "architecture", "code", "database", "ai model", "api", "framework", "backend", "frontend"]):
            reply = f"""**Recommended Tech Architecture for {name}:**

- **Frontend & App**: Lightweight React/Next.js or React Native mobile shell for quick iteration.
- **Backend & AI Engine**: FastAPI / Node.js backend with LLM orchestration and vector embeddings.
- **Database & Auth**: PostgreSQL with Supabase or Firebase for rapid auth and real-time data sync."""

            followups = [
                "What should I build first in my MVP?",
                "How do I keep API token costs low?",
                "How can I get my first 100 users?"
            ]

        # 13. Team, Hiring, Co-founders
        elif any(k in msg_lower for k in ["hire", "team", "cofounder", "co-founder", "developer", "engineer", "designer", "sales"]):
            reply = f"""**Early Team Strategy for {name}:**

- **Core Pair**: 1 Full-Stack Builder (Tech/AI) + 1 Domain Expert (Sales/Distribution to {aud}).
- **Early Stage Rule**: Do not hire full-time before $1k MRR; use founder-led sales and contractor help for initial validation."""

            followups = [
                "What should I build first in my MVP?",
                "How can I get my first 100 paying customers?",
                "How should I pitch to investors?"
            ]

        # 14. Retention, Churn & Engagement
        elif any(k in msg_lower for k in ["churn", "retention", "retain", "stickiness", "engagement", "repeat", "usage"]):
            reply = f"""**Retention & Stickiness Strategy for {name}:**

- **Time-to-Value**: Guide {aud} to their first successful workflow outcome in <3 minutes.
- **Workflow Lock-in**: Store key proprietary history, templates, and analytics to make switching costly."""

            followups = [
                "What is my ideal pricing model?",
                "How can I get my first 100 paying customers?",
                "Why is my startup risky?"
            ]

        # 15. General Comprehensive Advisor Response
        else:
            verdict = _safe_str(summary.get("feasibility_verdict"), "High Viability Concept")
            moat = _safe_str(comps.get("unique_moat"), f"Specialized workflows tailored for {aud}.")
            phases = gtm.get("launch_strategy") if isinstance(gtm.get("launch_strategy"), list) else []
            first_phase = phases[0].get("phase_name", "Pre-launch customer discovery") if (phases and len(phases) > 0 and isinstance(phases[0], dict)) else "Pre-launch discovery"

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


