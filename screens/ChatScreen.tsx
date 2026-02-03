
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPastorMessage } from '../geminiService';
import { ChatMessage } from '../types';

const ChatScreen: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { 
      role: 'user', 
      text: input, 
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendPastorMessage(
        input, 
        messages.map(m => ({ role: m.role, text: m.text }))
      );
      
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response || "I'm sorry, I couldn't process that. God bless you.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = { 
        role: 'model', 
        text: "I am having trouble connecting right now, but remember that God is always with you. Please try again in a moment.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <header className="glass border-b border-white/5 p-4 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)} className="text-white flex size-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white font-bold font-jakarta leading-none text-base">Pastor AI</h2>
          <span className="text-[9px] text-green-500 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div> Active Spirit
          </span>
        </div>
        <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-xl">church</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 px-8 animate-in fade-in zoom-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="size-24 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 border-4 border-white/5 shadow-2xl relative z-10 animate-float">
                <span className="material-symbols-outlined text-5xl">forum</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white font-jakarta tracking-tight">How can I support you?</h3>
              <p className="text-slate-500 text-sm leading-relaxed italic font-display">
                "Ask, and it will be given to you; seek, and you will find..."
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full pt-4">
              {[
                "Tell me a verse about hope",
                "I'm feeling anxious today",
                "How do I pray for strength?"
              ].map(prompt => (
                <button 
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="bg-surface-dark border border-white/5 py-4 px-5 rounded-2xl text-xs text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-left font-bold"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-5 rounded-2xl shadow-lg ${
              m.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-surface-dark text-slate-200 rounded-tl-none border border-white/5 shadow-black/40'
            }`}>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{m.text}</p>
              <div className={`text-[8px] mt-3 font-black uppercase tracking-widest opacity-40 ${m.role === 'user' ? 'text-white text-right' : 'text-slate-400 text-left'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="bg-surface-dark border border-white/5 p-5 rounded-2xl rounded-tl-none shadow-lg">
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5">
                  <div className="size-1.5 bg-primary/60 rounded-full animate-bounce [animation-duration:1s]"></div>
                  <div className="size-1.5 bg-primary/60 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]"></div>
                  <div className="size-1.5 bg-primary/60 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Meditating on Response</span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-12 glass border-t border-white/5 z-20">
        <div className="max-w-md mx-auto flex gap-3">
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Seek wisdom or encouragement..."
              className="w-full bg-surface-dark/50 border border-white/5 rounded-2xl px-7 py-5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:bg-surface-dark outline-none transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="size-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 active:scale-90 disabled:opacity-50 transition-all shrink-0 group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
