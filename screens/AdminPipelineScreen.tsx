
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedContent, Role, PipelineStatus, Format, Theme, CalendarEntry, PipelineItem, ContentTemplate, Length, Audience, Style, User } from '../types';
import { authService } from '../authService';
import { generateDevotional } from '../geminiService';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'studio' | 'scheduler' | 'pipeline' | 'users' | 'distribution';

const themeIcons: Record<Theme, string> = {
  [Theme.Hope]: 'brightness_5',
  [Theme.Anxiety]: 'air',
  [Theme.Courage]: 'shield',
  [Theme.Faith]: 'star',
  [Theme.Healing]: 'spa',
  [Theme.Wisdom]: 'menu_book',
  [Theme.Strength]: 'bolt',
  [Theme.Love]: 'favorite',
};

const AdminPipelineScreen: React.FC<{ onRefine: (c: GeneratedContent) => void }> = ({ onRefine }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('scheduler');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingSubMessage, setLoadingSubMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const session = authService.getSession();

  // Studio State
  const [studioTheme, setStudioTheme] = useState<Theme | null>(null);
  const [studioVerse, setStudioVerse] = useState('');
  const [studioFormat, setStudioFormat] = useState<Format | "">("");
  const [studioLength, setStudioLength] = useState<Length>(Length.Short);
  const [studioAudience, setStudioAudience] = useState<Audience>(Audience.Adults);
  const [studioStyle, setStudioStyle] = useState<Style>(Style.Inspirational);
  const [showValidation, setShowValidation] = useState(false);

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);

  const [calendar, setCalendar] = useState<CalendarEntry[]>([
    { id: 'c1', date: '2023-10-25', verse: 'John 3:16', theme: Theme.Love, requestedFormats: [Format.SMS, Format.SocialPost] },
    { id: 'c2', date: '2023-10-26', verse: 'Psalm 23:1', theme: Theme.Strength, requestedFormats: [Format.VideoScript, Format.ImagePrompt] }
  ]);

  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [templates] = useState<ContentTemplate[]>([
    { format: Format.SMS, tone: 'Urgent/Encouraging', systemInstruction: 'Keep it under 160 chars, use emojis sparingly.' },
    { format: Format.SocialPost, tone: 'Visual/Engaging', systemInstruction: 'Focus on hooks, use 5 relevant hashtags.' }
  ]);

  useEffect(() => {
    if (!session || session.user.role !== Role.Admin) {
      navigate('/home');
    }
    setUsers(authService.getUsers());
  }, [session, navigate]);

  const handleStudioGenerate = async () => {
    if (!studioTheme || !studioFormat) {
      setShowValidation(true);
      if (!studioTheme) step1Ref.current?.scrollIntoView({ behavior: 'smooth' });
      else if (!studioFormat) step2Ref.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setLoadingMessage('Activating Content Engine...');
    setLoadingSubMessage('Synthesizing scriptural data...');
    try {
      const content = await generateDevotional(studioTheme, studioVerse, studioFormat as Format, studioLength, studioAudience, studioStyle);
      onRefine(content);
    } catch (err) {
      console.error(err);
      alert('Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async (entry: CalendarEntry) => {
    setLoading(true);
    try {
      const newItems: PipelineItem[] = [];
      for (let i = 0; i < entry.requestedFormats.length; i++) {
        const format = entry.requestedFormats[i];
        setLoadingMessage(`Orchestrating Pipeline...`);
        setLoadingSubMessage(`Batch generation: ${format} (${i + 1}/${entry.requestedFormats.length})`);
        const template = templates.find(t => t.format === format);
        const content = await generateDevotional(entry.theme, entry.verse, format, undefined, undefined, undefined, template?.systemInstruction);
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          calendarId: entry.id,
          format,
          content,
          status: PipelineStatus.Ready
        });
      }
      setPipeline(prev => [...newItems, ...prev]);
      setActiveTab('pipeline');
    } catch (err) {
      alert('Generation failed: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = (user: User) => {
    const newRole = user.role === Role.Admin ? Role.User : Role.Admin;
    authService.updateUserRole(user.id, newRole);
    setUsers(authService.getUsers());
  };

  const approveItem = (id: string) => {
    setPipeline(prev => prev.map(item => 
      item.id === id ? { ...item, status: PipelineStatus.Approved } : item
    ));
  };

  const postToSocials = (id: string) => {
    setPipeline(prev => prev.map(item => 
      item.id === id ? { ...item, status: PipelineStatus.Posted, postedAt: Date.now(), platforms: ['Instagram', 'Facebook'] } : item
    ));
    alert('Simulated multi-platform social post successful!');
  };

  if (!session || session.user.role !== Role.Admin) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white pb-32">
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute size-32 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="size-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl relative z-10 animate-float">
              <span className="material-symbols-outlined text-4xl animate-spin-slow">hub</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-white animate-pulse">{loadingMessage}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{loadingSubMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="size-10 rounded-full flex items-center justify-center bg-white/5 transition-colors hover:bg-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold font-jakarta">Admin Command</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Pipeline Active</span>
        </div>
      </header>

      {/* Tabs Nav */}
      <nav className="flex p-3 bg-surface-dark/30 border-b border-white/5 gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'studio', label: 'Studio', icon: 'auto_fix' },
          { id: 'scheduler', label: 'Scheduler', icon: 'calendar_month' },
          { id: 'pipeline', label: 'Review', icon: 'playlist_add_check' },
          { id: 'users', label: 'Users', icon: 'group' },
          { id: 'distribution', label: 'Published', icon: 'share' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6">
        {activeTab === 'studio' && (
          <div className="space-y-12">
            <div className="flex flex-col gap-1 px-1">
              <h3 className="text-white font-bold text-2xl tracking-tight">AI Content Studio</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Manual Content Orchestration</p>
            </div>
            
            <section ref={step1Ref} className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black bg-primary text-white size-6 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">1</span>
                <h3 className="text-white font-bold text-lg">Select Theme</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(Theme).map((t) => (
                  <button
                    key={t}
                    onClick={() => setStudioTheme(t)}
                    className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border transition-all active:scale-95 ${
                      studioTheme === t 
                        ? 'bg-primary border-primary text-white shadow-xl' 
                        : 'bg-surface-dark border-white/5 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">{themeIcons[t]}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">{t}</span>
                  </button>
                ))}
              </div>
            </section>

            <section ref={step2Ref} className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black bg-primary text-white size-6 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">2</span>
                <h3 className="text-white font-bold text-lg">Select Medium</h3>
              </div>
              <select 
                value={studioFormat}
                onChange={(e) => setStudioFormat(e.target.value as Format)}
                className="w-full bg-surface-dark border-white/5 rounded-2xl text-white text-sm py-5 px-6 outline-none focus:ring-2 focus:ring-primary appearance-none border transition-all"
              >
                <option value="" disabled>Destination Format?</option>
                {Object.values(Format).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </section>

            <div className="pt-6">
              <button 
                disabled={loading}
                onClick={handleStudioGenerate}
                className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl shadow-2xl shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <span className="animate-spin material-symbols-outlined">sync</span> : 'Trigger Studio Logic'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1 px-1">
              <h3 className="text-white font-bold text-2xl tracking-tight">Identity Registry</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Manage Administrator Privileges</p>
            </div>

            <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">User Email</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{u.email}</span>
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg tracking-widest border ${u.role === Role.Admin ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.email !== 'admin@devotional.ai' && (
                           <button 
                            onClick={() => toggleUserRole(u)}
                            className="text-[10px] font-black uppercase text-primary hover:underline transition-all"
                          >
                            Set to {u.role === Role.Admin ? 'User' : 'Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'scheduler' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Scheduled Feed</h3>
              <button className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest hover:bg-primary/20 transition-colors">+ Add New</button>
            </div>
            <div className="grid gap-6">
              {calendar.map(entry => (
                <div key={entry.id} className="bg-surface-dark border border-white/5 p-8 rounded-2xl space-y-6 shadow-xl transition-all hover:border-white/10 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-2">{entry.date}</p>
                      <h4 className="text-white font-bold text-xl group-hover:text-primary transition-colors">{entry.verse}</h4>
                    </div>
                    <span className="text-[9px] bg-white/5 px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] text-slate-400 border border-white/5">{entry.theme}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.requestedFormats.map(f => (
                      <span key={f} className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-black/20 px-3 py-1 rounded-lg border border-white/5">{f}</span>
                    ))}
                  </div>
                  <button 
                    onClick={() => runPipeline(entry)}
                    disabled={loading}
                    className="w-full bg-primary/5 border border-primary/20 text-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Start AI Pipeline
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 px-1">Review Queue</h3>
            <div className="grid gap-6">
              {pipeline.filter(p => p.status === PipelineStatus.Ready).map(item => (
                <div key={item.id} className="bg-surface-dark border border-white/5 p-8 rounded-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 shadow-xl">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">{item.format}</p>
                    <span className="text-[9px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-green-500/20">Ready for Review</span>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-white font-bold text-lg leading-tight">{item.content.title}</h5>
                    <p className="text-slate-400 text-sm italic leading-relaxed line-clamp-4 font-display">"{item.content.devotionalMessage}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button 
                      onClick={() => approveItem(item.id)}
                      className="bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => onRefine(item.content)}
                      className="bg-white/5 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                    >
                      Refine
                    </button>
                  </div>
                </div>
              ))}
              {pipeline.filter(p => p.status === PipelineStatus.Ready).length === 0 && (
                <div className="py-24 text-center opacity-30 flex flex-col items-center">
                  <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Review queue is clear</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'distribution' && (
          <div className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 px-1">Release History</h3>
             <div className="grid gap-6">
              {pipeline.filter(p => p.status === PipelineStatus.Approved || p.status === PipelineStatus.Posted).map(item => (
                <div key={item.id} className="bg-surface-dark border border-white/5 p-8 rounded-2xl space-y-6 shadow-xl">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.format}</p>
                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${item.status === PipelineStatus.Posted ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                      {item.status}
                    </span>
                  </div>
                  <h5 className="text-white font-bold text-lg leading-tight">{item.content.title}</h5>
                  {item.status === PipelineStatus.Approved ? (
                    <button 
                      onClick={() => postToSocials(item.id)}
                      className="w-full bg-white text-background-dark py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">rocket_launch</span>
                      Distribute Now
                    </button>
                  ) : (
                    <div className="pt-4 flex flex-col gap-4 text-slate-500 border-t border-white/5">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">schedule</span>
                           {new Date(item.postedAt!).toLocaleTimeString()}
                         </span>
                         <div className="flex gap-2">
                            {item.platforms?.map(p => (
                              <span key={p} className="text-[8px] bg-white/10 px-2 py-0.5 rounded-lg text-white font-black">{p}</span>
                            ))}
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPipelineScreen;
