import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, AlertCircle, RefreshCw, 
  Lightbulb, ShieldAlert, Users, DollarSign, Layers,
  ChevronRight, Copy, Check, MessageSquare
} from 'lucide-react';
import { chatWithAdvisor } from '../services/api';

const DEFAULT_QUESTIONS = [
  { text: "What should I build first?", icon: Layers, color: "text-brand-500 bg-brand-500/10 border-brand-500/30" },
  { text: "Why is my startup risky?", icon: ShieldAlert, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  { text: "How can I get my first 100 users?", icon: Users, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" },
  { text: "What is my ideal pricing model?", icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" }
];

export default function StartupAdvisor({ report, isCompact = false }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your **AI Startup Advisor** for **${report?.extracted_idea?.startup_name || 'your startup'}** (${report?.validation_scores?.overall_score || 0}% Score).\n\nAsk me any quick question about your MVP, go-to-market plan, pricing, or risks!`,
      suggestedFollowups: [
        "What should I build first?",
        "Why is my startup risky?",
        "How can I get my first 100 users?"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
          content: res.reply,
          suggestedFollowups: res.suggested_followups || []
        }
      ]);
    } catch (err) {
      console.error("Advisor chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `**Quick Recommendation:**\n- **Must-Have MVP**: Focus strictly on core workflows.\n- **Next Priority**: Execute *${report?.gtm_strategy?.launch_strategy?.[0]?.phase_name || 'Pre-launch validation'}*.`,
          suggestedFollowups: [
            "What should I build first?",
            "Why is my startup risky?",
            "How can I get my first 100 users?"
          ]
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

  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('**') && line.endsWith('**') && !line.includes(':')) {
            return (
              <p key={idx} className="font-extrabold text-slate-900 dark:text-white mt-2">
                {line.replace(/\*\*/g, '')}
              </p>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const bulletText = line.substring(2);
            // Parse bold parts
            const parts = bulletText.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700 dark:text-slate-300">
                <span className="text-brand-500 font-bold mt-0.5">•</span>
                <p>
                  {parts.map((p, pIdx) => {
                    if (p.startsWith('**') && p.endsWith('**')) {
                      return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
                    }
                    if (p.startsWith('*') && p.endsWith('*')) {
                      return <em key={pIdx} className="italic text-slate-600 dark:text-slate-400">{p.slice(1, -1)}</em>;
                    }
                    return p;
                  })}
                </p>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^(\d+\.)/)[0];
            const textAfterNum = line.replace(/^\d+\.\s*/, '');
            const parts = textAfterNum.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 text-slate-700 dark:text-slate-300">
                <span className="font-mono font-extrabold text-brand-600 dark:text-brand-400 shrink-0">{num}</span>
                <p>
                  {parts.map((p, pIdx) => {
                    if (p.startsWith('**') && p.endsWith('**')) {
                      return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
                    }
                    return p;
                  })}
                </p>
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }

          // Regular paragraph with bold support
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="text-slate-700 dark:text-slate-300">
              {parts.map((p, pIdx) => {
                if (p.startsWith('**') && p.endsWith('**')) {
                  return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
                }
                return p;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex flex-col rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden ${isCompact ? 'h-[540px]' : 'h-[680px]'}`}>
      
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
              Trained on {report?.extracted_idea?.startup_name || 'Venture'} validation results
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/30">
            {report?.validation_scores?.overall_score || 0}% Score
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

              <div className={`max-w-[88%] sm:max-w-[80%] space-y-2`}>
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
                        <span>Advisor Intelligence</span>
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
                  Advisor analyzing validation results...
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
            placeholder="Ask follow-up e.g. 'How can I lower my CAC?'..."
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
