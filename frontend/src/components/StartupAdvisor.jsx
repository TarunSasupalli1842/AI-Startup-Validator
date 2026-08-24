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
  const q = query.toLowerCase().trim();
  const name = report?.extracted_idea?.startup_name || 'your startup';
  const aud = report?.extracted_idea?.target_audience || 'your target customers';
  const ind = report?.extracted_idea?.industry || 'your industry';
  const prob = report?.extracted_idea?.core_problem || 'the core user problem';
  const sol = report?.extracted_idea?.core_solution || 'your product solution';
  const overallScore = report?.validation_scores?.overall_score || 78;
  const verdict = report?.summary?.feasibility_verdict || 'Viable Venture';

  const mvp = report?.mvp_recommendation || {};
  const risks = report?.risk_analysis || {};
  const gtm = report?.gtm_strategy || {};
  const opp = report?.market_opportunity || {};
  const comps = report?.competitor_analysis || {};
  const swot = report?.swot_analysis || {};
  const segs = report?.customer_segmentation || {};

  // 1. User Acquisition, First 100 Users, Marketing
  if (/100|acquire|acquisition|marketing|growth|channel|traffic|customer|reach|funnel|get user|find customer|early user|users/i.test(q)) {
    const channels = gtm.acquisition_channels || [];
    let channelsStr = '';
    if (channels.length > 0) {
      channelsStr = channels.slice(0, 2).map(c => `- **${c.channel_name || 'Channel'}**: ${c.description || ''} *(Target: ${c.expected_cac || 'Low CAC'})*`).join('\n');
    } else {
      channelsStr = `- **Founder Direct Outreach**: Message 25 decision-makers in ${aud} daily.\n- **Niche Community Teardowns**: Share actionable insights in targeted industry groups.`;
    }
    return {
      reply: `**Fastest path to 100 paying customers for ${name}:**\n\n${channelsStr}\n- **Playbook**: Offer white-glove onboarding to your first 20 users in exchange for video case studies.`,
      suggested_followups: [
        "What is my ideal pricing model?",
        "What is my estimated CAC vs LTV?",
        "What should I build first in my MVP?"
      ]
    };
  }

  // 2. MVP & Build scope
  if (/build|mvp|feature|moscow|scope|timeline|tech|stack|prototype/i.test(q)) {
    const mustHaves = mvp.must_have || [];
    const timeline = mvp.target_timeline_weeks || '4-6 Weeks';
    let featuresStr = '';
    if (mustHaves.length > 0) {
      featuresStr = mustHaves.slice(0, 2).map(f => `- **${f.feature_name || 'Feature'}**: ${f.description || 'Core workflow'}`).join('\n');
    } else {
      featuresStr = `- **Core Automation Engine**: Direct solution for ${prob.slice(0, 50)}.\n- **Frictionless UI**: Instant self-service workflow for ${aud}.`;
    }
    return {
      reply: `**Focus strictly on the Must-Have workflow (${timeline} build):**\n\n${featuresStr}\n- **Golden Rule**: Deliver value in <60 seconds; validate with 10 beta users before adding more features.`,
      suggested_followups: [
        "What features should I defer to Phase 2?",
        "How can I get my first 100 users?",
        "How should I price my MVP?"
      ]
    };
  }

  // 3. Risk & Mitigation
  if (/risk|risky|threat|fail|danger|pitfall|regulation|mitigat|challenge/i.test(q)) {
    const riskList = risks.risks || [];
    const riskLevel = risks.overall_risk_level || 'Moderate';
    let riskStr = '';
    if (riskList.length > 0) {
      riskStr = riskList.slice(0, 2).map(r => `- **${r.category || 'Risk'}**: ${r.risk || ''} *(Mitigation: ${r.mitigation || 'Validate early'})*`).join('\n');
    } else {
      riskStr = `- **Adoption Friction**: Inertia moving ${aud} off legacy habits.\n- **Moat Protection**: Need fast execution against competitors.`;
    }
    const topMitigation = risks.key_mitigation_priorities?.[0] || 'Secure 5 pre-launch beta commitments';
    return {
      reply: `**Top risk factors for ${name} (${riskLevel} Risk Tier):**\n\n${riskStr}\n- **Top Priority**: ${topMitigation}.`,
      suggested_followups: [
        "How can I build a stronger competitive moat?",
        "How do I validate willingness to pay?",
        "What should I build first in my MVP?"
      ]
    };
  }

  // Pricing & Monetization
  if (/price|pricing|monetiz|charge|cost|fee|revenue|tier|subscription|pay/i.test(q)) {
    const tiers = gtm.pricing_tiers || [];
    const pricingStrategy = gtm.pricing_strategy || `Value-aligned subscription for ${aud}.`;
    const tiersStr = tiers.length > 0 ? tiers.slice(0, 2).map(t => `- **${t}**`).join('\n') : `- **Starter Tier**: Core workflow access.\n- **Pro Tier**: Advanced automation and team features.`;
    return {
      reply: `**Pricing & Monetization Strategy for ${name}:**\n\n${tiersStr}\n- **Strategy**: ${pricingStrategy}\n- **Action**: Charge early beta users an upfront annual discounted plan to confirm real budget.`,
      suggested_followups: [
        "How do I test pricing before building?",
        "What is my estimated CAC vs LTV?",
        "How can I get my first 100 paying customers?"
      ]
    };
  }

  // Competitors & Moat
  if (/competitor|rival|alternative|moat|advantage|differentiate|defensib|vs/i.test(q)) {
    const directComps = comps.direct_competitors || [];
    const moat = comps.unique_moat || `Tailored workflows and faster time-to-value for ${aud}.`;
    const compStr = directComps.length > 0 
      ? directComps.slice(0, 2).map(c => `- **${c.name}**: ${c.weaknesses?.[0] || 'Legacy interface'} *(Your advantage: ${c.competitive_advantage || 'Faster setup'})*`).join('\n')
      : `- **Legacy Alternatives**: Bulky, expensive tools with slow setup.\n- **Manual Workarounds**: Low cost but highly inefficient.`;
    return {
      reply: `**Competitive Landscape & Moat for ${name}:**\n\n${compStr}\n- **Defensible Moat**: ${moat}.`,
      suggested_followups: [
        "How do I convince customers to switch from competitors?",
        "What is my ideal pricing model?",
        "Why is my startup risky?"
      ]
    };
  }

  // TAM & Unit Economics
  if (/tam|sam|som|market size|potential|opportunity|cac|ltv|economics/i.test(q)) {
    return {
      reply: `**Market Opportunity & Unit Economics for ${name}:**\n\n- **Market Sizing**: TAM of **${opp.tam || 'Global Market'}**, SAM of **${opp.sam || 'Target Market'}**, and SOM target of **${opp.som || 'Target SOM'}**.\n- **Unit Economics**: Estimated CAC of **${opp.estimated_cac || 'Moderate'}** vs LTV of **${opp.estimated_ltv || 'High'}**.\n- **Assessment**: ${opp.unit_economics_summary || 'Strong recurring margins.'}`,
      suggested_followups: [
        "How do I lower my CAC?",
        "What is my ideal pricing model?",
        "How can I get my first 100 users?"
      ]
    };
  }

  // General fallback
  const moat = comps.unique_moat || `Specialized workflow platform for ${aud}.`;
  const firstPhase = gtm.launch_strategy?.[0]?.phase_name || 'Pre-launch customer discovery';
  return {
    reply: `**Strategic Advisory for ${name}:**\n\n- **Thesis Viability**: **${overallScore}%** (${verdict}).\n- **Core Moat**: ${moat}\n- **Next Priority**: Execute *${firstPhase}* with 10 beta prospects in ${aud}.`,
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

  const initialWelcome = {
    role: 'assistant',
    content: `👋 Hi! I'm your **AI Startup Advisor** for **${startupName}** (${overallScore}% Viability Score).\n\nAsk me any specific question about your MVP roadmap, go-to-market plan, pricing, defensible moat, or risk mitigations!`,
    suggestedFollowups: [
      "What should I build first in my MVP?",
      "Why is my startup risky and how do I fix it?",
      "How can I get my first 100 paying customers?"
    ]
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [initialWelcome];
  });

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
    setMessages([initialWelcome]);
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
    // Regex matches **bold** or *italic*
    const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return tokens.map((tok, i) => {
      if (tok.startsWith('**') && tok.endsWith('**') && tok.length >= 4) {
        return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{tok.slice(2, -2)}</strong>;
      }
      if (tok.startsWith('*') && tok.endsWith('*') && tok.length >= 2) {
        return <em key={i} className="italic text-slate-600 dark:text-slate-300">{tok.slice(1, -1)}</em>;
      }
      return tok;
    });
  };

  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }

          // Standalone bold titles (e.g. **Focus strictly on the MVP:**)
          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
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
              <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700 dark:text-slate-300">
                <span className="font-mono font-extrabold text-brand-600 dark:text-brand-400 shrink-0">{num}</span>
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

