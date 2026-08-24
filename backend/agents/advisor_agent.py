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

def extract_reply_and_followups(text: str) -> tuple:
    """Robustly parses LLM JSON or clean Markdown output without leaking JSON artifacts or escaped newlines."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*\n?", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\n?\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    # 1. Try standard JSON load with strict=False
    try:
        data = json.loads(cleaned, strict=False)
        if isinstance(data, dict):
            reply = str(data.get("reply", "")).strip()
            followups = data.get("suggested_followups", [])
            if reply:
                reply = reply.replace('\\n', '\n').replace('\\"', '"')
                return reply, [str(f) for f in followups if f]
    except Exception:
        pass

    # 2. Extract outer-most JSON object from first '{' to last '}'
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = cleaned[first_brace:last_brace + 1]
        try:
            data = json.loads(candidate, strict=False)
            if isinstance(data, dict):
                reply = str(data.get("reply", "")).strip()
                followups = data.get("suggested_followups", [])
                if reply:
                    reply = reply.replace('\\n', '\n').replace('\\"', '"')
                    return reply, [str(f) for f in followups if f]
        except Exception:
            pass

    # 3. Regex extraction fallback for malformed JSON strings
    reply_match = re.search(r'"reply"\s*:\s*"([\s\S]*?)"\s*,\s*"suggested_followups"', text)
    if not reply_match:
        reply_match = re.search(r'"reply"\s*:\s*"([\s\S]*?)"\s*\}', text)
    
    followups = []
    followups_match = re.search(r'"suggested_followups"\s*:\s*\[([\s\S]*?)\]', text)
    if followups_match:
        items = re.findall(r'"([^"]+)"', followups_match.group(1))
        followups = [it.strip() for it in items if it.strip()]

    if reply_match:
        raw_rep = reply_match.group(1)
        try:
            unescaped = raw_rep.encode('utf-8').decode('unicode_escape')
            return unescaped.replace('\\n', '\n').replace('\\"', '"').strip(), followups
        except Exception:
            return raw_rep.replace(r'\n', '\n').replace(r'\"', '"').strip(), followups

    # 4. Clean fallback text
    clean_text = text.strip()
    if clean_text.startswith("{") and '"reply"' in clean_text:
        clean_text = re.sub(r'^\s*\{\s*"reply"\s*:\s*"?', '', clean_text)
        clean_text = re.sub(r'"?\s*,\s*"suggested_followups"[\s\S]*$', '', clean_text)
    clean_text = clean_text.replace('\\n', '\n').replace('\\"', '"').strip()
    return clean_text, followups

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
        You are an elite, world-class AI Startup Co-founder, Technical Advisor, and Venture Partner dedicated to "{startup_name}".
        
        [STARTUP DOSSIER & CONTEXT]
        {context_text}

        [CONVERSATION HISTORY]
        {history_formatted or "None (start of conversation)"}

        [FOUNDER QUESTION / REQUEST]
        "{user_msg}"

        ADVISORY & INTELLIGENCE GUIDELINES:
        1. ACT AS A TRUE DEDICATED LLM CO-FOUNDER: Answer ANY question the founder asks—whether it's strategic advice, code snippets, cold emails, marketing taglines, equity/cap-table logic, competitive teardowns, user interview scripts, pitch deck slides, or technical architecture.
        2. CONTEXT GROUNDING: Deeply incorporate the specific realities of {startup_name} (target audience: {target_audience}, core problem, solution, unit economics, and competitive moat).
        3. CODE & ARTIFACTS: If the user asks for code, scripts, templates, emails, or outlines, provide COMPLETE, production-ready markdown code blocks (e.g. ```python, ```javascript, ```bash) or structured copy rather than generic placeholders.
        4. STRUCTURE & FORMATTING: Use clean, polished markdown with bold key takeaways, concise bullet points, and high-impact framing. Avoid repetitive filler or generic fluff.
        5. CURRENCY: Default to Indian Rupees (₹) for pricing and financial metrics when relevant, or USD ($) if global SaaS is discussed.
        6. SUGGESTED NEXT STEPS: Provide 3 sharp, highly contextual follow-up questions tailored specifically to the conversation.

        Return strictly a valid JSON object matching this schema:
        {{
            "reply": "Your comprehensive, high-signal markdown response (with code blocks, bullet points, or structured guidance as requested).",
            "suggested_followups": [
                "Sharp follow-up question 1",
                "Sharp follow-up question 2",
                "Sharp follow-up question 3"
            ]
        }}
        """

        system_instruction = "You are a world-class startup co-founder and technical advisor LLM. Provide deep, actionable, high-signal responses with production-ready code, persuasive copy, or sharp strategic frameworks tailored to the startup dossier."

        try:
            response_text = await call_gemini(prompt, expect_json=True, system_instruction=system_instruction)
            reply, followups = extract_reply_and_followups(response_text)

            if not reply:
                raise ValueError("Empty reply from LLM")

            logger.info(f"[{self.name}] response generated successfully via LLM.")
            return AdvisorChatResponse(
                reply=reply,
                suggested_followups=(followups[:3] if followups else DEFAULT_SUGGESTIONS[:3]),
                confidence="High"
            )
        except Exception as e:
            logger.info(f"[{self.name}] LLM advisor call skipped/fallback ({str(e)}). Generating contextual rule-based response.")
            return self._fallback_chat(user_msg, report_data)

    def _fallback_chat(self, user_msg: str, report: Dict[str, Any]) -> AdvisorChatResponse:
        """Comprehensive contextual rule-based advisory engine with prioritized multi-intent classification."""
        q = user_msg.lower().strip() if user_msg else ""
        
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

        # 1. Competitors, Rivalry, Moat, Advantage, Differentiator
        if re.search(r"\b(competitor|competitors|rival|rivals|alternative|alternatives|moat|advantage|differentiat\w*|defensib\w*|compete|vs|beat competitors)\b", q):
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
                "What is my ideal pricing model?",
                "Why is my startup risky?"
            ]

        # 2. Pricing, Monetization, Tiers, Charge
        elif re.search(r"\b(price|pricing|monetiz\w*|charge|cost|fee|fees|tier|tiers|subscription|freemium|revenue model|how much to charge|how do i make money)\b", q):
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

        # 3. MVP, Product Scope, Build First, Features
        elif re.search(r"\b(what (should|to|can) (i|we) build|build first|mvp|feature|features|moscow|scope|prototype|version 1|v1|roadmap|target timeline)\b", q):
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

        # 4. Risk Analysis, Dangers, Mitigations
        elif re.search(r"\b(risk|risks|risky|threat|threats|fail|failure|danger|pitfall|pitfalls|mitigat\w*|challenge|challenges|downside|vulnerabilit\w*)\b", q):
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

        # 5. Cold Outreach, Email Script, Message Template
        elif re.search(r"\b(cold (email|message|outreach)|email template|pitch script|outreach script|sales script|message to founder)\b", q):
            reply = f"""**High-Converting Cold Outreach Template for {name}:**

- **Subject**: Quick question regarding {prob[:35]}
- **Body**: *"Hi [First Name], noticed your team is actively scaling {ind}. Most {aud} spend hours dealing with {prob[:50]}. We built {name} to {sol[:50]} with 1-click automation. Would you be open to a 3-minute Loom video showing how it works?"*
- **Call-to-Action**: Soft ask for feedback, zero aggressive hard-selling."""

            followups = [
                "What channels are best to send this on?",
                "How can I get my first 100 paying customers?",
                "What is my ideal pricing model?"
            ]

        # 6. Customer Acquisition, First 100 Users, Marketing Channels, GTM
        elif re.search(r"\b(100 (paying|users|customers)|first 100|acquire|acquisition|growth|marketing channel|marketing strategy|funnel|get customers|find customers|gtm|go to market)\b", q):
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
                "Can you give me a cold outreach message template?"
            ]

        # 7. Target Audience / Customer Personas / ICP
        elif re.search(r"\b(who (is|are|should)|persona|personas|target audience|ideal customer|icp|demographic|customer profile|buyer persona|who will buy|who to sell)\b", q):
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

        # 8. TAM, SAM, SOM, Market Size, Economics, CAC vs LTV
        elif re.search(r"\b(tam|sam|som|market size|market potential|unit economics|cac vs ltv|cagr|growth rate|market opportunity)\b", q):
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

        # 9. SWOT Analysis
        elif re.search(r"\b(swot|strengths? and weakness\w*|strength|weakness|opportunities and threats)\b", q):
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

        # 10. Launch Roadmap & 30-Day Next Steps
        elif re.search(r"\b(launch|launch plan|next step|next steps|action item|action items|30[- ]day|checklist|how to start|getting started|phase 1)\b", q):
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

        # 11. Investor Pitch & Fundraising
        elif re.search(r"\b(pitch|investor|investors|fundrais\w*|angel|vc|venture capital|raise capital|valuation|deck|pitch deck)\b", q):
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

        # 12. Validation Score Breakdown & Feasibility Verdict
        elif re.search(r"\b(score|scores|verdict|rating|viability|feasibility|why this score|score breakdown)\b", q):
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

        # 13. Tech Stack & Architecture
        elif re.search(r"\b(tech stack|technology stack|architecture|programming language|database|framework|backend|frontend|ai model|api)\b", q):
            reply = f"""**Recommended Tech Architecture for {name}:**

- **Frontend & App**: Lightweight React/Next.js shell for fast iteration.
- **Backend & AI Engine**: FastAPI / Node.js backend with async LLM orchestration.
- **Database & Auth**: PostgreSQL with Supabase or Firebase for rapid setup."""

            followups = [
                "What should I build first in my MVP?",
                "How do I keep API token costs low?",
                "How can I get my first 100 users?"
            ]

        # 14. Team & Hiring
        elif re.search(r"\b(team|hire|hiring|cofounder|co-founder|developer|engineer|sales rep|first employee)\b", q):
            reply = f"""**Early Team Strategy for {name}:**

- **Core Pair**: 1 Full-Stack Builder (Tech/AI) + 1 Domain Expert (Sales/Distribution to {aud}).
- **Early Stage Rule**: Do not hire full-time before $1k MRR; use founder-led sales and contractor help for initial validation."""

            followups = [
                "What should I build first in my MVP?",
                "How can I get my first 100 paying customers?",
                "How should I pitch to investors?"
            ]

        # 15. Retention & Churn
        elif re.search(r"\b(churn|retention|retain|stickiness|engagement|repeat usage|keep users)\b", q):
            reply = f"""**Retention & Stickiness Strategy for {name}:**

- **Time-to-Value**: Guide {aud} to their first successful workflow outcome in <3 minutes.
- **Workflow Lock-in**: Store key proprietary history, templates, and analytics to make switching costly."""

            followups = [
                "What is my ideal pricing model?",
                "How can I get my first 100 paying customers?",
                "Why is my startup risky?"
            ]

        # 16. General Comprehensive Advisor Response
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


