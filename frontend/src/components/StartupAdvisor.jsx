import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, AlertCircle, RefreshCw, 
  Lightbulb, ShieldAlert, Users, DollarSign, Layers,
  ChevronRight, Copy, Check, MessageSquare, RotateCcw
} from 'lucide-react';
import { chatWithAdvisor } from '../services/api';

const DEFAULT_QUESTIONS = [
  { text: "What should I build first in my MVP?", icon: Layers, color: "text-brand-500 bg-brand-500/10 border-brand-500/30 hover:bg-brand-500/20" },
  { text: "Why is my startup risky and how do I fix it?", icon: ShieldAlert, color: "text-amber-500 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20" },
  { text: "How can I get my first 100 paying customers?", icon: Users, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20" },
  { text: "What is my ideal pricing model?", icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" }
];

/**
 * Intelligent client-side fallback advisor engine in case of network glitches.
 */
function generateLocalAdvice(query, report) {
  const q = (query || '').toLowerCase().trim();
  const idea = report?.extracted_idea || {};
  const name = idea.startup_name || 'your startup';
  const aud = idea.target_audience || 'your target customers';
  const ind = idea.industry || 'your industry';
  const prob = idea.core_problem || 'the core user problem';
  const sol = idea.core_solution || 'your product solution';
  const overallScore = report?.validation_scores?.overall_score || 78;
  const verdict = report?.summary?.feasibility_verdict || 'Viable Venture';

  const mvp = report?.mvp_recommendation || {};
  const risks = report?.risk_analysis || {};
  const gtm = report?.gtm_strategy || {};
  const opp = report?.market_opportunity || {};
  const comps = report?.competitor_analysis || {};
  const swot = report?.swot_analysis || {};
  const segs = report?.customer_segmentation || {};

  // 1. Competitors, Rivalry, Moat, Advantage, Differentiator
  if (/\b(competitor|competitors|rival|rivals|alternative|alternatives|moat|advantage|differentiat\w*|defensib\w*|compete|vs|beat competitors)\b/i.test(q)) {
    const compList = Array.isArray(comps.competitors) ? comps.competitors : (Array.isArray(comps.direct_competitors) ? comps.direct_competitors : []);
    const moat = comps.unique_moat || `Tailored workflows and faster time-to-value for ${aud}.`;
    let compStr = '';
    if (compList.length > 0) {
      compStr = compList.slice(0, 2).map(c => {
        if (typeof c === 'object') {
          const cName = c.name || 'Competitor';
          const cWeak = (Array.isArray(c.weaknesses) && c.weaknesses.length > 0) ? c.weaknesses[0] : 'Legacy interface & high cost';
          const cAdv = c.competitive_advantage || 'Faster setup';
          return `- **${cName}**: ${cWeak} *(Your advantage: ${cAdv})*`;
        }
        return `- **${String(c)}**: Legacy architecture *(Your edge: Faster setup)*`;
      }).join('\n');
    } else {
      compStr = `- **Legacy Alternatives**: Bulky, expensive tools with slow onboarding.\n- **Manual Spreadsheets**: Low cost but error-prone and unscalable.`;
    }
    return {
      reply: `**Competitive Landscape & Moat for ${name}:**\n\n${compStr}\n- **Defensible Moat**: ${moat}.`,
      suggested_followups: [
        "How do I convince customers to switch from competitors?",
        "What is my ideal pricing model?",
        "Why is my startup risky?"
      ]
    };
  }

  // 2. Pricing, Monetization, Tiers, Charge
  if (/\b(price|pricing|monetiz\w*|charge|cost|fee|fees|tier|tiers|subscription|freemium|revenue model|how much to charge|how do i make money)\b/i.test(q)) {
    const tiers = Array.isArray(gtm.pricing_tiers) ? gtm.pricing_tiers : [];
    const pricingStrategy = gtm.pricing_strategy || `Value-aligned subscription for ${aud}.`;
    const tiersStr = tiers.length > 0 
      ? tiers.slice(0, 2).map(t => `- **${String(t)}**`).join('\n') 
      : `- **Starter Tier**: Core workflow access for early ${aud}.\n- **Pro Tier**: Advanced automation, integrations, and priority support.`;
    return {
      reply: `**Pricing & Monetization Strategy for ${name}:**\n\n${tiersStr}\n- **Model**: ${pricingStrategy}\n- **Action**: Charge beta users upfront with an annual discount to validate true willingness to pay.`,
      suggested_followups: [
        "How do I test pricing before building?",
        "What is my estimated CAC vs LTV?",
        "How can I get my first 100 paying customers?"
      ]
    };
  }

  // 3. MVP, Product Scope, Build First, Features
  if (/\b(what (should|to|can) (i|we) build|build first|mvp|feature|features|moscow|scope|prototype|version 1|v1|roadmap|target timeline)\b/i.test(q)) {
    const mustHaves = Array.isArray(mvp.must_have) ? mvp.must_have : [];
    const timeline = mvp.target_timeline_weeks || '4-6 Weeks';
    let featuresStr = '';
    if (mustHaves.length > 0) {
      featuresStr = mustHaves.slice(0, 2).map(f => {
        const fName = typeof f === 'object' ? (f.feature_name || 'Core Feature') : String(f);
        const fDesc = typeof f === 'object' ? (f.description || 'Essential workflow automation') : 'Essential core capability';
        return `- **${fName}**: ${fDesc}`;
      }).join('\n');
    } else {
      featuresStr = `- **Core Engine**: Solve ${prob.slice(0, 60)} in 1 click.\n- **Self-Service Flow**: Frictionless onboarding for ${aud}.`;
    }
    return {
      reply: `**Focus strictly on the Must-Have workflow (${timeline} build sprint):**\n\n${featuresStr}\n- **Rule**: Deliver measurable ROI in <60 seconds; test with 10 beta users before writing additional features.`,
      suggested_followups: [
        "What features should I defer to Phase 2?",
        "How do I get my first 100 users?",
        "How should I price the MVP?"
      ]
    };
  }

  // 4. Risk Analysis, Dangers, Mitigations
  if (/\b(risk|risks|risky|threat|threats|fail|failure|danger|pitfall|pitfalls|mitigat\w*|challenge|challenges|downside|vulnerabilit\w*)\b/i.test(q)) {
    const riskList = Array.isArray(risks.risks) ? risks.risks : [];
    const riskLevel = risks.overall_risk_level || 'Moderate';
    let riskStr = '';
    if (riskList.length > 0) {
      riskStr = riskList.slice(0, 2).map(r => {
        const cat = typeof r === 'object' ? (r.category || 'Risk') : 'Risk';
        const desc = typeof r === 'object' ? (r.risk || '') : String(r);
        const fix = typeof r === 'object' ? (r.mitigation || 'Validate early') : 'Validate early';
        return `- **${cat}**: ${desc} *(Fix: ${fix})*`;
      }).join('\n');
    } else {
      riskStr = `- **Adoption Friction**: Resistance from ${aud} switching from manual routines.\n- **Defensibility**: Preventing fast followers from copying ${sol.slice(0, 40)}.`;
    }
    const topMitigation = (Array.isArray(risks.key_mitigation_priorities) && risks.key_mitigation_priorities.length > 0) 
      ? risks.key_mitigation_priorities[0] 
      : 'Secure 5 pre-launch letters of intent (LOIs)';
    return {
      reply: `**Top risk factors for ${name} (${riskLevel} Risk Tier):**\n\n${riskStr}\n- **Immediate Priority**: ${topMitigation}.`,
      suggested_followups: [
        "How can I build a stronger competitive moat?",
        "How do I validate customer willingness to pay?",
        "What should I build first in my MVP?"
      ]
    };
  }

  // 5. Cold Outreach, Email Script, Message Template
  if (/\b(cold (email|message|outreach)|email template|pitch script|outreach script|sales script|message to founder)\b/i.test(q)) {
    return {
      reply: `**High-Converting Cold Outreach Template for ${name}:**\n\n- **Subject**: Quick question regarding ${prob.slice(0, 35)}\n- **Body**: *"Hi [First Name], noticed your team is actively scaling in ${ind}. Most ${aud} spend hours dealing with ${prob.slice(0, 50)}. We built ${name} to ${sol.slice(0, 50)} with 1-click automation. Would you be open to a 3-minute Loom video showing how it works?"*\n- **Call-to-Action**: Soft ask for feedback, zero aggressive hard-selling.`,
      suggested_followups: [
        "What channels are best to send this on?",
        "How can I get my first 100 paying customers?",
        "What is my ideal pricing model?"
      ]
    };
  }

  // 6. Customer Acquisition, First 100 Users, Marketing Channels, GTM
  if (/\b(100 (paying|users|customers)|first 100|acquire|acquisition|growth|marketing channel|marketing strategy|funnel|get customers|find customers|gtm|go to market)\b/i.test(q)) {
    const channels = Array.isArray(gtm.acquisition_channels) ? gtm.acquisition_channels : [];
    let channelsStr = '';
    if (channels.length > 0) {
      channelsStr = channels.slice(0, 2).map(c => {
        const cName = typeof c === 'object' ? (c.channel_name || 'Channel') : String(c);
        const cDesc = typeof c === 'object' ? (c.description || '') : 'Direct founder outreach and targeted community.';
        const cCac = typeof c === 'object' ? (c.expected_cac || 'Low') : 'Low';
        return `- **${cName}**: ${cDesc} *(Target CAC: ${cCac})*`;
      }).join('\n');
    } else {
      channelsStr = `- **Direct Founder Outreach**: Contact 25 decision-makers in ${aud} daily with personalized video audits.\n- **Niche Community Seeding**: Share valuable workflow teardowns in targeted industry hubs.`;
    }
    return {
      reply: `**Fastest path to 100 paying users for ${name}:**\n\n${channelsStr}\n- **Playbook**: Offer white-glove onboarding to your first 20 beta users in exchange for case studies and referrals.`,
      suggested_followups: [
        "What is my ideal pricing model?",
        "What is my estimated CAC vs LTV?",
        "Can you give me a cold outreach message template?"
      ]
    };
  }

  // 7. Target Audience / Customer Personas / ICP
  if (/\b(who (is|are|should)|persona|personas|target audience|ideal customer|icp|demographic|customer profile|buyer persona|who will buy|who to sell)\b/i.test(q)) {
    const primary = (typeof segs.primary_segment === 'object') ? segs.primary_segment : {};
    const pName = primary.persona_name || `Primary ${aud}`;
    const pain = (Array.isArray(primary.key_pain_points) && primary.key_pain_points.length > 0) ? primary.key_pain_points[0] : prob;
    const wtp = primary.willingness_to_pay || 'High willingness to pay for ROI';
    return {
      reply: `**Ideal Customer Profile (ICP) for ${name}:**\n\n- **Target Persona**: **${pName}** in ${ind}.\n- **Core Pain Trigger**: ${pain}.\n- **Willingness to Pay**: ${wtp}.`,
      suggested_followups: [
        "How can I reach this persona directly?",
        "What is my ideal pricing model?",
        "What should I build first in my MVP?"
      ]
    };
  }

  // 8. TAM, SAM, SOM, Market Size, Economics, CAC vs LTV
  if (/\b(tam|sam|som|market size|market potential|unit economics|cac vs ltv|cagr|growth rate|market opportunity)\b/i.test(q)) {
    return {
      reply: `**Market Opportunity & Unit Economics for ${name}:**\n\n- **Market Sizing**: TAM of **${opp.tam || 'Large Addressable Market'}**, SAM of **${opp.sam || 'Focused Segment'}**, and SOM target of **${opp.som || '3-Year Target'}**.\n- **Unit Economics**: Estimated CAC of **${opp.estimated_cac || 'Moderate'}** vs LTV of **${opp.estimated_ltv || 'High LTV'}**.\n- **Assessment**: ${opp.unit_economics_summary || 'Healthy recurring unit economics.'}`,
      suggested_followups: [
        "How do I lower my customer acquisition cost (CAC)?",
        "What is my ideal pricing model?",
        "How can I get my first 100 paying customers?"
      ]
    };
  }

  // 9. SWOT Analysis
  if (/\b(swot|strengths? and weakness\w*|strength|weakness|opportunities and threats)\b/i.test(q)) {
    const rawStrengths = Array.isArray(swot.strengths) ? swot.strengths : [];
    const rawWeaknesses = Array.isArray(swot.weaknesses) ? swot.weaknesses : [];
    const rawOpps = Array.isArray(swot.opportunities) ? swot.opportunities : [];

    const strengths = rawStrengths.length > 0 ? rawStrengths.slice(0, 2) : [`Tailored solution for ${aud}`];
    const weaknesses = rawWeaknesses.length > 0 ? rawWeaknesses.slice(0, 2) : ['Early-stage brand recognition'];
    const opps = rawOpps.length > 0 ? rawOpps.slice(0, 2) : ['Rapid market digitization'];

    return {
      reply: `**SWOT Highlights for ${name}:**\n\n- **Strengths**: ${strengths.join(', ')}.\n- **Weaknesses**: ${weaknesses.join(', ')}.\n- **Top Opportunity**: ${opps.join(', ')}.`,
      suggested_followups: [
        "How do I overcome my biggest weaknesses?",
        "What is my defensible competitive moat?",
        "What should I build first in my MVP?"
      ]
    };
  }

  // 10. Launch Roadmap & 30-Day Next Steps
  if (/\b(launch|launch plan|next step|next steps|action item|action items|30[- ]day|checklist|how to start|getting started|phase 1)\b/i.test(q)) {
    const phases = Array.isArray(gtm.launch_strategy) ? gtm.launch_strategy : [];
    const steps = Array.isArray(gtm.how_to_get_started) ? gtm.how_to_get_started : [];
    const phase1 = (phases.length > 0 && typeof phases[0] === 'object') ? (phases[0].phase_name || 'Phase 1: Pre-launch validation') : 'Phase 1: Pre-launch validation';
    const stepItems = steps.length > 0 ? steps.slice(0, 2).map((s, i) => `- **Step ${i+1}**: ${s}`).join('\n') : `- **Validate**: Interview 15 target users in ${aud}.\n- **Prototype**: Build the core 1-click workflow.`;
    return {
      reply: `**Immediate Launch Execution Plan for ${name}:**\n\n- **Current Sprint**: **${phase1}**.\n${stepItems}\n- **Goal**: Lock in 5 committed beta pilot customers within 30 days.`,
      suggested_followups: [
        "How can I get my first 100 paying customers?",
        "What should I build first in my MVP?",
        "What is my ideal pricing model?"
      ]
    };
  }

  // 11. Investor Pitch & Fundraising
  if (/\b(pitch|investor|investors|fundrais\w*|angel|vc|venture capital|raise capital|valuation|deck|pitch deck)\b/i.test(q)) {
    const tam = opp.tam || 'Market Opportunity';
    const moat = comps.unique_moat || 'Proprietary workflow';
    return {
      reply: `**Investor Pitch Narrative for ${name} (${overallScore}% Score):**\n\n- **The Hook**: ${aud} are bleeding time and budget on *${prob.slice(0, 60)}*.\n- **The Engine**: ${name} delivers *${sol.slice(0, 60)}* with a moat in *${moat.slice(0, 40)}*.\n- **Market Sizing**: Capitalizing on a **${tam}** sector opportunity.`,
      suggested_followups: [
        "What traction metrics do investors want to see?",
        "What is my estimated CAC vs LTV?",
        "Why is my startup risky?"
      ]
    };
  }

  // 12. Validation Score Breakdown & Feasibility Verdict
  if (/\b(score|scores|verdict|rating|viability|feasibility|why this score|score breakdown)\b/i.test(q)) {
    const clarity = report?.validation_scores?.problem_clarity || 80;
    const solScore = report?.validation_scores?.solution_strength || 80;
    const mktScore = report?.validation_scores?.market_potential || 80;
    return {
      reply: `**Validation Score Breakdown for ${name}:**\n\n- **Overall Viability**: **${overallScore}%** (${verdict}).\n- **Key Pillars**: Problem Clarity (**${clarity}%**), Solution Strength (**${solScore}%**), Market Potential (**${mktScore}%**).\n- **Advisor Take**: Strong underlying thesis; execution speed is your primary differentiator.`,
      suggested_followups: [
        "What should I build first in my MVP?",
        "How can I get my first 100 paying customers?",
        "Why is my startup risky?"
      ]
    };
  }

  // 13. Tech Stack & Architecture
  if (/\b(tech stack|technology stack|architecture|programming language|database|framework|backend|frontend|ai model|api)\b/i.test(q)) {
    return {
      reply: `**Recommended Tech Architecture for ${name}:**\n\n- **Frontend & App**: Lightweight React/Next.js shell for fast iteration.\n- **Backend & AI Engine**: FastAPI / Node.js backend with async LLM orchestration.\n- **Database & Auth**: PostgreSQL with Supabase or Firebase for rapid setup.`,
      suggested_followups: [
        "What should I build first in my MVP?",
        "How do I keep API token costs low?",
        "How can I get my first 100 users?"
      ]
    };
  }

  // 14. Team & Hiring
  if (/\b(team|hire|hiring|cofounder|co-founder|developer|engineer|sales rep|first employee)\b/i.test(q)) {
    return {
      reply: `**Early Team Strategy for ${name}:**\n\n- **Core Pair**: 1 Full-Stack Builder (Tech/AI) + 1 Domain Expert (Sales/Distribution to ${aud}).\n- **Early Stage Rule**: Do not hire full-time before $1k MRR; use founder-led sales and contractor help for initial validation.`,
      suggested_followups: [
        "What should I build first in my MVP?",
        "How can I get my first 100 paying customers?",
        "How should I pitch to investors?"
      ]
    };
  }

  // 15. Retention & Churn
  if (/\b(churn|retention|retain|stickiness|engagement|repeat usage|keep users)\b/i.test(q)) {
    return {
      reply: `**Retention & Stickiness Strategy for ${name}:**\n\n- **Time-to-Value**: Guide ${aud} to their first successful workflow outcome in <3 minutes.\n- **Workflow Lock-in**: Store key proprietary history, templates, and analytics to make switching costly.`,
      suggested_followups: [
        "What is my ideal pricing model?",
        "How can I get my first 100 paying customers?",
        "Why is my startup risky?"
      ]
    };
  }

  // 16. General Comprehensive Advisor Response
  const moat = comps.unique_moat || `Specialized workflows tailored for ${aud}.`;
  const phases = Array.isArray(gtm.launch_strategy) ? gtm.launch_strategy : [];
  const firstPhase = (phases.length > 0 && typeof phases[0] === 'object') ? (phases[0].phase_name || 'Pre-launch customer discovery') : 'Pre-launch discovery';
  return {
    reply: `**Strategic Advisory for ${name}:**\n\n- **Thesis Viability**: **${overallScore}%** (${verdict}).\n- **Core Differentiator**: ${moat}\n- **Immediate Next Sprint**: Execute *${firstPhase}* with 10 beta prospects in ${aud}.`,
    suggested_followups: [
      "What should I build first in my MVP?",
      "Why is my startup risky and how do I fix it?",
      "How can I get my first 100 paying customers?"
    ]
  };
}

export default function StartupAdvisor({ report, isCompact = false }) {
  const startupName = report?.extracted_idea?.startup_name || 'your startup';
  const overallScore = report?.validation_scores?.overall_score || 0;
  const storageKey = `valistart_advisor_chat_${report?.extracted_idea?.startup_name || 'default'}`;

  const createInitialWelcome = (name, score) => ({
    role: 'assistant',
    content: `👋 Hi! I'm your **AI Startup Advisor** for **${name}** (${score}% Viability Score).\n\nAsk me any specific question about your MVP roadmap, go-to-market plan, pricing, defensible moat, or risk mitigations!`,
    suggestedFollowups: [
      "What should I build first in my MVP?",
      "Why is my startup risky and how do I fix it?",
      "How can I get my first 100 paying customers?"
    ]
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [createInitialWelcome(startupName, overallScore)];
  });

  // Switch chat conversation when a new startup report is loaded
  useEffect(() => {
    const currentKey = `valistart_advisor_chat_${report?.extracted_idea?.startup_name || 'default'}`;
    const curName = report?.extracted_idea?.startup_name || 'your startup';
    const curScore = report?.validation_scores?.overall_score || 0;
    try {
      const saved = sessionStorage.getItem(currentKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (_) {}
    setMessages([createInitialWelcome(curName, curScore)]);
  }, [report?.extracted_idea?.startup_name, report?.validation_scores?.overall_score]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Sync messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (_) {}
  }, [messages, storageKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleResetChat = () => {
    setMessages([createInitialWelcome(startupName, overallScore)]);
    try {
      sessionStorage.removeItem(storageKey);
    } catch (_) {}
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage = { role: 'user', content: query };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history for backend
      const apiHistory = updatedHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await chatWithAdvisor(query, apiHistory, report);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply || "Advice generated.",
          suggestedFollowups: res.suggested_followups && res.suggested_followups.length > 0 
            ? res.suggested_followups 
            : DEFAULT_QUESTIONS.map(q => q.text).slice(0, 3)
        }
      ]);
    } catch (err) {
      console.warn("Backend advisor call failed; using contextual client advisor:", err);
      const fallback = generateLocalAdvice(query, report);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: fallback.reply,
          suggestedFollowups: fallback.suggested_followups
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse bold & italics inline
  const renderInlineFormatted = (text) => {
    const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return tokens.map((tok, i) => {
      if (tok.startsWith('**') && tok.endsWith('**') && tok.length >= 4) {
        return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{tok.slice(2, -2)}</strong>;
      }
      if (tok.startsWith('*') && tok.endsWith('*') && tok.length >= 2) {
        return <em key={i} className="italic text-slate-600 dark:text-slate-300">{tok.slice(1, -1)}</em>;
      }
      if (tok.startsWith('`') && tok.endsWith('`') && tok.length >= 2) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-mono text-[11px]">{tok.slice(1, -1)}</code>;
      }
      return tok;
    });
  };

  const renderFormattedContent = (content) => {
    // 1. Normalize literal \n or escaped characters into real newlines
    let textToRender = (content || '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '  ');

    // 2. If the text itself looks like raw JSON with "reply": "...", extract it cleanly
    if (textToRender.trim().startsWith('{') && textToRender.includes('"reply"')) {
      try {
        const parsed = JSON.parse(textToRender);
        if (parsed.reply) {
          textToRender = String(parsed.reply).replace(/\\n/g, '\n');
        }
      } catch (_) {}
    }

    // 3. Strip any code block wrappers and convert comments/steps into clean bullets
    textToRender = textToRender.replace(/```(?:\w+)?\n?([\s\S]*?)```/g, (match, code) => {
      const lines = (code || '').split('\n').map(l => l.trim()).filter(Boolean);
      const cleanLines = lines.map(l => {
        if (l.startsWith('//') || l.startsWith('#') || l.startsWith('/*')) {
          return `- **Logic**: ${l.replace(/^(\/\/|#|\/\*|\*)\s*/, '').replace(/\*\/$/, '')}`;
        }
        if (!/^(import|const|let|var|function|async|def|class|return|from|npm|pip|export|require|\{|\}|\[|\]|\$)\b/.test(l)) {
          return `- ${l}`;
        }
        return null;
      }).filter(Boolean);
      return cleanLines.length > 0 ? `\n${cleanLines.join('\n')}\n` : '';
    });

    const lines = textToRender.split('\n');

    return (
      <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Headers
          if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            const title = trimmed.replace(/^###?\s*/, '');
            return (
              <h4 key={idx} className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white mt-3.5 mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                {title}
              </h4>
            );
          }

          // Blockquotes
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-4 border-brand-500 pl-3 py-1.5 my-2 bg-brand-50/50 dark:bg-brand-950/20 text-slate-700 dark:text-slate-300 italic rounded-r-xl">
                {renderInlineFormatted(trimmed.substring(2))}
              </blockquote>
            );
          }

          // Standalone bold titles
          if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes('\n')) {
            return (
              <p key={idx} className="font-extrabold text-slate-900 dark:text-white mt-2">
                {renderInlineFormatted(trimmed)}
              </p>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700 dark:text-slate-300">
                <span className="text-brand-500 font-black mt-0.5">•</span>
                <p className="flex-1">{renderInlineFormatted(bulletText)}</p>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const numMatch = trimmed.match(/^(\d+\.)/);
            const num = numMatch ? numMatch[0] : '';
            const rest = trimmed.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-1 text-slate-700 dark:text-slate-300">
                <span className="font-mono font-extrabold text-brand-600 dark:text-brand-400 shrink-0 text-xs bg-brand-50 dark:bg-brand-950/60 px-1.5 py-0.5 rounded-md border border-brand-200 dark:border-brand-800/60">{num}</span>
                <p className="flex-1">{renderInlineFormatted(rest)}</p>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-slate-700 dark:text-slate-300">
              {renderInlineFormatted(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex flex-col rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl overflow-hidden ${isCompact ? 'h-[550px]' : 'h-[700px]'}`}>
      
      {/* Top Advisor Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accentViolet-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Conversational Startup Advisor
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Context
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Trained on {startupName} validation data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="hidden sm:inline-flex text-[11px] font-extrabold px-3 py-1 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/30">
            {overallScore}% Score
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 bg-slate-100/50 dark:bg-slate-950/30 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto custom-scrollbar flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
          Suggested:
        </span>
        {DEFAULT_QUESTIONS.map((q, idx) => {
          const Icon = q.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              disabled={isLoading}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer disabled:opacity-50 ${q.color}`}
            >
              <Icon className="w-3 h-3" />
              <span>{q.text}</span>
            </button>
          );
        })}
      </div>

      {/* Message Chat Stream */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[90%] sm:max-w-[82%] space-y-2">
                <div
                  className={`p-4 rounded-3xl relative transition-all shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-sm ml-auto'
                      : 'bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-tl-sm shadow-md'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">{msg.content}</p>
                  ) : (
                    <div>
                      {renderFormattedContent(msg.content)}
                      
                      {/* Copy reply button */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-brand-600/80 dark:text-brand-400/80">Advisor Intelligence</span>
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          className="inline-flex items-center gap-1 hover:text-brand-500 transition-colors cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Advice</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Follow-up Suggestions */}
                {!isUser && msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && idx === messages.length - 1 && (
                  <div className="pt-1 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-500" />
                      Next Questions to Explore:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowups.map((fText, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(fText)}
                          disabled={isLoading}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-600 transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <span>{fText}</span>
                          <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-1 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-sm shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-brand-500 animate-spin" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Advisor synthesizing strategic intelligence...
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up e.g. 'How can I lower my CAC?'..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold transition-all shadow-md shadow-brand-500/20 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

