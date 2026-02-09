
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GeneratedContent, Role, PipelineStatus, Format, Theme, CalendarEntry, PipelineItem, Length, Audience, Style, User } from '../types';
import { authService, MASTER_ADMIN_EMAIL } from '../authService';
import { storageService } from '../storageService';
import { generateDevotional, generateVeoVideo, generateImagePro, editImageFlash, generateVeoVideoFromImage, analyzeOrEditContent } from '../geminiService';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'studio' | 'media' | 'scheduler' | 'pipeline' | 'archive' | 'registry' | 'database' | 'help' | 'ai_center';
type AICenterTab = 'pro_image' | 'flash_edit' | 'veo_studio' | 'intelligence';

const themeIcons: Record<Theme, string> = {
  [Theme.Hope]: 'brightness_5',
  [Theme.Anxiety]: 'air',
  [Theme.Courage]: 'shield',
  [Theme.Faith]: 'star',
  [Theme.Healing]: 'spa',
  [Theme.Wisdom]: 'menu_book',
  [Theme.Strength]: 'bolt',
  [Theme.Love]: 'favorite',
  [Theme.BibleStories]: 'auto_stories',
  [Theme.Teaching]: 'school',
  [Theme.Family]: 'family_restroom',
  [Theme.Tribulation]: 'tsunami',
};

const AdminPipelineScreen: React.FC<{ onRefine: (c: GeneratedContent) => void }> = ({ onRefine }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('studio');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Orchestrating Divine Wisdom...');
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [dbData, setDbData] = useState<{key: string, value: string}[]>([]);
  const [savedDevotionals, setSavedDevotionals] = useState<GeneratedContent[]>([]);

  // Studio / Refine States
  const [refiningItem, setRefiningItem] = useState<PipelineItem | null>(null);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [studioTheme, setStudioTheme] = useState<Theme>(Theme.Hope);
  const [studioFormat, setStudioFormat] = useState<Format>(Format.SMS);
  const [studioVerse, setStudioVerse] = useState('');

  // AI Center States
  const [aiCenterTab, setAiCenterTab] = useState<AICenterTab>('pro_image');
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [intelText, setIntelText] = useState('');
  const [intelTask, setIntelTask] = useState('');

  // Media Lab States (legacy from previous design, potentially merge)
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image');
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [mediaImage, setMediaImage] = useState<string | null>(null);

  // Scheduler States
  const [schedDate, setSchedDate] = useState('');
  const [schedTheme, setSchedTheme] = useState<Theme>(Theme.Hope);
  const [schedFormats, setSchedFormats] = useState<Format[]>([]);
  const [showAddSched, setShowAddSched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = useCallback(() => {
    setUsers(authService.getUsers());
    setBlacklist(storageService.getBlacklist());
    setCalendar(storageService.getCalendar());
    setPipeline(storageService.getPipeline());
    setDbData(storageService.getRawData());
    setSavedDevotionals(storageService.getSavedDevotionals());
  }, []);

  useEffect(() => {
    const session = authService.getSession();
    if (!session || session.user.role !== Role.Admin) {
      navigate('/home');
    } else {
      refreshData();
    }
  }, [navigate, refreshData]);

  // --- Helpers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- Actions ---

  const handleAICenterAction = async () => {
    setLoading(true);
    setAiResult(null);
    try {
      if (aiCenterTab === 'pro_image') {
        setLoadingMsg('Generating High-Def Vision...');
        const url = await generateImagePro(mediaPrompt, imageSize);
        setAiResult(url);
      } else if (aiCenterTab === 'flash_edit') {
        if (!uploadedImage) throw new Error("Upload an image first.");
        setLoadingMsg('Applying Flash Transformation...');
        const url = await editImageFlash(uploadedImage, mediaPrompt);
        setAiResult(url);
      } else if (aiCenterTab === 'veo_studio') {
        setLoadingMsg('Ananimating Cinematic Witness...');
        const url = uploadedImage 
          ? await generateVeoVideoFromImage(uploadedImage, mediaPrompt, videoAspect)
          : await generateVeoVideo(mediaPrompt, videoAspect);
        setAiResult(url);
      } else if (aiCenterTab === 'intelligence') {
        setLoadingMsg('Invoking Scriptural Intelligence...');
        const result = await analyzeOrEditContent(intelText, intelTask, true);
        setIntelText(result);
      }
    } catch (e: any) {
      alert(e.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessEntry = async (entry: CalendarEntry) => {
    setLoading(true);
    setLoadingMsg('Manifesting Content Batch...');
    try {
      for (const format of entry.requestedFormats) {
        const pipelineId = Math.random().toString(36).substr(2, 9);
        const placeholder: PipelineItem = {
          id: pipelineId,
          calendarId: entry.id,
          format: format,
          status: PipelineStatus.Generating,
          content: { title: 'Generating...', bibleVerse: entry.verse, devotionalMessage: '', practicalApplication: '', callToAction: '' }
        };
        storageService.savePipelineItem(placeholder);
        refreshData();

        // Actual Generation
        let content: GeneratedContent;
        if (format === Format.ImagePrompt) {
          const url = await generateImagePro(`Sacred spiritual art of ${entry.theme}. Verse: ${entry.verse}`, '1K');
          content = { title: `${entry.theme} Vision`, bibleVerse: entry.verse, devotionalMessage: 'Prophetic Concept Manifested', practicalApplication: '', callToAction: '', imageUrl: url };
        } else if (format === Format.VideoScript) {
          const url = await generateVeoVideo(`Cinematic reflection of ${entry.theme}. ${entry.verse}`);
          content = { title: `${entry.theme} Motion`, bibleVerse: entry.verse, devotionalMessage: 'Veo Cinematic testimony', practicalApplication: '', callToAction: '', videoUrl: url };
        } else {
          content = await generateDevotional(entry.theme, entry.verse, format);
        }

        storageService.updatePipelineItem({ ...placeholder, content, status: PipelineStatus.Ready });
      }
      storageService.deleteCalendarEntry(entry.id);
      refreshData();
    } catch (err) {
      alert('One or more generations failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualStudio = async () => {
    setLoading(true);
    setLoadingMsg('Consulting High-Level Models...');
    try {
      const content = await generateDevotional(studioTheme, studioVerse, studioFormat);
      onRefine(content);
    } catch (e) { alert('Failed.'); }
    finally { setLoading(false); }
  };

  const handleRefineAI = async () => {
    if (!refiningItem) return;
    setLoading(true);
    setLoadingMsg('Applying Prophetic Adjustments...');
    try {
      const content = await generateDevotional(
        Theme.Hope, // dummy
        refiningItem.content.bibleVerse,
        refiningItem.format,
        Length.Medium,
        Audience.Adults,
        Style.Inspirational,
        `EXISTING CONTENT: ${refiningItem.content.devotionalMessage}. ADJUSTMENT: ${refinePrompt}`
      );
      const updated = { ...refiningItem, content, status: PipelineStatus.Ready };
      storageService.updatePipelineItem(updated);
      setRefiningItem(null);
      setRefinePrompt('');
      refreshData();
    } catch (e) { alert('Refinement failed.'); }
    finally { setLoading(false); }
  };

  const handleApprove = (item: PipelineItem) => {
    storageService.updatePipelineItem({ ...item, status: PipelineStatus.Approved });
    refreshData();
  };

  const handlePublish = (item: PipelineItem) => {
    setLoading(true);
    setLoadingMsg('Distributing to Spiritual Networks...');
    setTimeout(() => {
      storageService.saveDevotional(item.content);
      storageService.deletePipelineItem(item.id);
      setLoading(false);
      refreshData();
      alert('Published to Global Feed.');
    }, 1500);
  };

  const handleBlacklist = (email: string) => {
    if (window.confirm(`Cast out ${email} from the Sanctuary?`)) {
      storageService.addToBlacklist(email);
      refreshData();
    }
  };

  const handleUnblacklist = (email: string) => {
    storageService.removeFromBlacklist(email);
    refreshData();
  };

  const handleSaveDB = (key: string, value: string) => {
    if (storageService.updateRawData(key, value)) {
      refreshData();
      alert('Scroll Updated.');
    } else {
      alert('Invalid Format.');
    }
  };

  const toggleSchedFormat = (f: Format) => {
    setSchedFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  // --- UI Components ---

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white pb-32">
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-dark/95 backdrop-blur-2xl">
          <div className="size-24 rounded-3xl bg-primary flex items-center justify-center animate-float shadow-2xl shadow-primary/40">
            <span className="material-symbols-outlined text-5xl animate-spin-slow">auto_awesome</span>
          </div>
          <p className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">{loadingMsg}</p>
        </div>
      )}

      {/* Refinement Modal */}
      {refiningItem && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-[40px] p-8 space-y-8 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-jakarta">Divine Refinement</h3>
              <button onClick={() => setRefiningItem(null)} className="size-10 rounded-full bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
            </div>
            <textarea 
              value={refinePrompt}
              onChange={e => setRefinePrompt(e.target.value)}
              className="w-full bg-background-dark border border-white/5 rounded-3xl p-6 text-sm min-h-[150px] outline-none focus:ring-1 focus:ring-primary"
              placeholder="How should the Word be adjusted? (e.g. 'Make it more poetic', 'Add a verse about joy')..."
            />
            <button onClick={handleRefineAI} className="w-full bg-primary py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30">Invoke Refinement</button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 glass border-b border-white/5 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="size-10 rounded-xl bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined">arrow_back</span></button>
          <div>
            <h2 className="text-lg font-bold font-jakarta leading-none">Command Center</h2>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary mt-1.5">Apostolic Authority</p>
          </div>
        </div>
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><span className="material-symbols-outlined">admin_panel_settings</span></div>
      </header>

      <nav className="flex p-4 bg-surface-dark/30 border-b border-white/5 gap-3 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'ai_center', label: 'AI Center', icon: 'spark' },
          { id: 'studio', label: 'Studio', icon: 'auto_fix' },
          { id: 'media', label: 'Media Lab', icon: 'movie' },
          { id: 'scheduler', label: 'Scheduler', icon: 'calendar_month' },
          { id: 'pipeline', label: 'Pipeline', icon: 'playlist_add_check' },
          { id: 'archive', label: 'Archive', icon: 'inventory_2' },
          { id: 'registry', label: 'Registry', icon: 'group' },
          { id: 'database', label: 'Database', icon: 'database' },
          { id: 'help', label: 'Help', icon: 'help' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2.5 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 space-y-12 max-w-lg mx-auto w-full overflow-y-auto">
        {activeTab === 'ai_center' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <div className="space-y-1">
              <h3 className="text-2xl font-bold font-jakarta">AI Command Center</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Harnessing Superior Modalities</p>
            </div>

            <div className="flex bg-surface-dark/50 rounded-2xl p-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'pro_image', label: 'Nano Pro', icon: 'image' },
                { id: 'flash_edit', label: 'Flash Edit', icon: 'image_edit_auto' },
                { id: 'veo_studio', label: 'Veo Studio', icon: 'movie' },
                { id: 'intelligence', label: 'Divine Intel', icon: 'psychology' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => { setAiCenterTab(sub.id as AICenterTab); setAiResult(null); setUploadedImage(null); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${aiCenterTab === sub.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">{sub.icon}</span>
                  {sub.label}
                </button>
              ))}
            </div>

            <div className="space-y-8 bg-surface-dark border border-white/5 p-8 rounded-[40px] shadow-3xl">
              {aiCenterTab === 'pro_image' && (
                <>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Image Resolution (Nano Pro)</label>
                    <div className="flex gap-2">
                      {["1K", "2K", "4K"].map(sz => (
                        <button key={sz} onClick={() => setImageSize(sz as any)} className={`flex-1 py-3 rounded-xl border text-[10px] font-black ${imageSize === sz ? 'bg-primary border-primary text-white' : 'bg-background-dark border-white/5 text-slate-500'}`}>{sz}</button>
                      ))}
                    </div>
                  </div>
                  <textarea value={mediaPrompt} onChange={e => setMediaPrompt(e.target.value)} placeholder="Describe the prophetic vision..." className="w-full bg-background-dark border border-white/5 rounded-3xl p-6 text-sm outline-none min-h-[120px]" />
                </>
              )}

              {aiCenterTab === 'flash_edit' && (
                <>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Source Image (Flash Image 2.5)</label>
                    <div onClick={() => fileInputRef.current?.click()} className="h-40 bg-background-dark border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative">
                      {uploadedImage ? <img src={uploadedImage} className="absolute inset-0 w-full h-full object-cover opacity-50" /> : <span className="material-symbols-outlined text-4xl text-slate-700">add_photo_alternate</span>}
                      <span className="text-[10px] font-black uppercase text-slate-500 relative z-10">{uploadedImage ? 'Change Image' : 'Upload Image to Edit'}</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>
                  <textarea value={mediaPrompt} onChange={e => setMediaPrompt(e.target.value)} placeholder="Adjustment (e.g. 'Add a retro filter', 'Make the sky more radiant')..." className="w-full bg-background-dark border border-white/5 rounded-3xl p-6 text-sm outline-none" />
                </>
              )}

              {aiCenterTab === 'veo_studio' && (
                <>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Aspect Ratio (Veo 3.1)</label>
                     <div className="flex gap-2">
                        {["16:9", "9:16"].map(asp => (
                          <button key={asp} onClick={() => setVideoAspect(asp as any)} className={`flex-1 py-3 rounded-xl border text-[10px] font-black ${videoAspect === asp ? 'bg-primary border-primary text-white' : 'bg-background-dark border-white/5 text-slate-500'}`}>{asp === '16:9' ? 'Landscape' : 'Portrait'}</button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Optional Starting Image</label>
                    <div onClick={() => fileInputRef.current?.click()} className="h-40 bg-background-dark border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative">
                       {uploadedImage ? <img src={uploadedImage} className="absolute inset-0 w-full h-full object-cover opacity-50" /> : <span className="material-symbols-outlined text-4xl text-slate-700">movie_edit</span>}
                       <span className="text-[10px] font-black uppercase text-slate-500 relative z-10">{uploadedImage ? 'Animate this Photo' : 'Upload Image or just use Text'}</span>
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>
                  <textarea value={mediaPrompt} onChange={e => setMediaPrompt(e.target.value)} placeholder="Video Prompt..." className="w-full bg-background-dark border border-white/5 rounded-3xl p-6 text-sm outline-none min-h-[100px]" />
                </>
              )}

              {aiCenterTab === 'intelligence' && (
                <div className="space-y-6">
                  <textarea value={intelText} onChange={e => setIntelText(e.target.value)} placeholder="Enter sacred text to analyze or edit..." className="w-full bg-background-dark border border-white/5 rounded-3xl p-6 text-sm outline-none min-h-[200px]" />
                  <div className="flex gap-2">
                    <button onClick={() => setIntelTask('Deep theological analysis of the above text.')} className="flex-1 py-3 rounded-xl bg-background-dark border border-white/5 text-[9px] font-black uppercase text-slate-400">Analyze</button>
                    <button onClick={() => setIntelTask('Rewrite the above text to be more poetic and soul-stirring.')} className="flex-1 py-3 rounded-xl bg-background-dark border border-white/5 text-[9px] font-black uppercase text-slate-400">Beautify</button>
                    <button onClick={() => setIntelTask('Condense the above text into a powerful 3-point mini-sermon.')} className="flex-1 py-3 rounded-xl bg-background-dark border border-white/5 text-[9px] font-black uppercase text-slate-400">Summarize</button>
                  </div>
                  <textarea value={intelTask} onChange={e => setIntelTask(e.target.value)} placeholder="Custom Intelligence Task..." className="w-full bg-background-dark border border-white/5 rounded-2xl p-4 text-[10px] outline-none" />
                </div>
              )}

              <button onClick={handleAICenterAction} className="w-full bg-primary py-6 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/40">Invoke Intelligence</button>

              {aiResult && (
                <div className="pt-8 border-t border-white/5 space-y-6">
                   <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Revelation Result</h4>
                   {aiCenterTab === 'veo_studio' ? (
                     <video src={aiResult} controls autoPlay className="w-full rounded-2xl shadow-3xl" />
                   ) : (
                     <img src={aiResult} className="w-full rounded-2xl shadow-3xl" />
                   )}
                   <div className="flex gap-4">
                     <button onClick={() => { storageService.saveDevotional({ title: 'AI Center Harvest', bibleVerse: 'Proverbs 1:5', devotionalMessage: 'Generated via Command Center', practicalApplication: '', callToAction: '', imageUrl: aiCenterTab !== 'veo_studio' ? aiResult : undefined, videoUrl: aiCenterTab === 'veo_studio' ? aiResult : undefined }); alert('Saved to Library'); }} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase">Archive</button>
                     <button onClick={() => { setAiResult(null); setMediaPrompt(''); setUploadedImage(null); }} className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase">Reset Lab</button>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'studio' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-jakarta">Divine Studio</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Direct revelation generator</p>
            </div>
            
            <section className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {Object.values(Theme).slice(0, 6).map(t => (
                  <button key={t} onClick={() => setStudioTheme(t)} className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${studioTheme === t ? 'bg-primary border-primary shadow-xl' : 'bg-surface-dark border-white/5'}`}>
                    <span className="material-symbols-outlined">{themeIcons[t]}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">{t}</span>
                  </button>
                ))}
              </div>
              <select value={studioFormat} onChange={e => setStudioFormat(e.target.value as Format)} className="w-full bg-surface-dark border border-white/5 rounded-2xl p-5 text-sm outline-none">
                {Object.values(Format).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <input value={studioVerse} onChange={e => setStudioVerse(e.target.value)} placeholder="Foundation Verse (Optional)" className="w-full bg-surface-dark border border-white/5 rounded-2xl p-5 text-sm outline-none" />
              <button onClick={handleManualStudio} className="w-full bg-primary py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] shadow-3xl shadow-primary/40 active:scale-95 transition-all">Invoke revelation</button>
            </section>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-jakarta">Media Lab</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Cinematic visual orchestration</p>
            </div>
            
            <div className="flex bg-surface-dark/50 rounded-full p-1.5 border border-white/5">
              <button onClick={() => setMediaTab('image')} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest ${mediaTab === 'image' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}>Nano Banana (Image)</button>
              <button onClick={() => setMediaTab('video')} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest ${mediaTab === 'video' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}>Veo 3.1 (Video)</button>
            </div>

            <textarea 
              value={mediaPrompt} 
              onChange={e => setMediaPrompt(e.target.value)}
              className="w-full bg-surface-dark border border-white/5 rounded-[32px] p-8 text-base outline-none min-h-[200px]"
              placeholder={mediaTab === 'image' ? "Describe the sacred vision..." : "Animate the testimony..."}
            />
            
            <button 
              onClick={async () => {
                setLoading(true);
                try {
                  const url = mediaTab === 'image' ? await generateImagePro(mediaPrompt) : await generateVeoVideo(mediaPrompt);
                  setMediaImage(url);
                } catch(e) { alert('Failed.'); } finally { setLoading(false); }
              }}
              className="w-full bg-primary py-6 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30"
            >
              Invoke Generation
            </button>

            {mediaImage && (
              <div className="p-8 bg-surface-dark border border-white/5 rounded-[40px] space-y-6">
                {mediaTab === 'image' ? <img src={mediaImage} className="w-full rounded-2xl shadow-3xl" /> : <video src={mediaImage} controls className="w-full rounded-2xl shadow-3xl" />}
                <button onClick={() => { storageService.saveDevotional({ title: 'Sacred Render', bibleVerse: 'Genesis 1:1', devotionalMessage: 'Media Lab Output', practicalApplication: '', callToAction: '', imageUrl: mediaTab === 'image' ? mediaImage : undefined, videoUrl: mediaTab === 'video' ? mediaImage : undefined }); alert('Saved to Library'); }} className="w-full py-4 text-primary text-[10px] font-black uppercase">Sanctify & Archive</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scheduler' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-jakarta">Scheduler</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Spiritual roadmap</p>
              </div>
              <button onClick={() => setShowAddSched(!showAddSched)} className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg"><span className="material-symbols-outlined">{showAddSched ? 'close' : 'add'}</span></button>
            </div>

            {showAddSched && (
              <div className="bg-surface-dark border border-white/5 p-8 rounded-[40px] space-y-8 animate-in slide-in-from-top-4">
                <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} className="w-full bg-background-dark border border-white/5 rounded-2xl p-5 text-sm" />
                <select value={schedTheme} onChange={e => setSchedTheme(e.target.value as Theme)} className="w-full bg-background-dark border border-white/5 rounded-2xl p-5 text-sm">
                  {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={studioVerse} onChange={e => setStudioVerse(e.target.value)} placeholder="Verse" className="w-full bg-background-dark border border-white/5 rounded-2xl p-5 text-sm" />
                <div className="flex flex-wrap gap-2">
                  {Object.values(Format).map(f => (
                    <button key={f} onClick={() => toggleSchedFormat(f)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${schedFormats.includes(f) ? 'bg-primary border-primary text-white shadow-lg' : 'bg-background-dark border-white/5 text-slate-500'}`}>{f}</button>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    storageService.saveCalendarEntry({ id: Math.random().toString(36).substr(2,9), date: schedDate, theme: schedTheme, verse: studioVerse || 'Psalm 23', requestedFormats: schedFormats });
                    setShowAddSched(false);
                    refreshData();
                  }}
                  className="w-full bg-primary py-6 rounded-3xl text-[11px] font-black uppercase"
                >
                  Confirm Goal
                </button>
              </div>
            )}

            <div className="space-y-6">
              {calendar.map(entry => (
                <div key={entry.id} className="bg-surface-dark border border-white/5 p-8 rounded-[40px] space-y-6 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold font-jakarta">{new Date(entry.date).toLocaleDateString()}</h4>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest">{entry.theme}</p>
                    </div>
                    <button onClick={() => { storageService.deleteCalendarEntry(entry.id); refreshData(); }} className="text-slate-600"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.requestedFormats.map(f => <span key={f} className="text-[8px] font-black uppercase px-2 py-1 bg-white/5 rounded-lg text-slate-500">{f}</span>)}
                  </div>
                  <button onClick={() => handleProcessEntry(entry)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-primary transition-all">Invoke Automated Pipeline</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-jakarta">Prophetic Pipeline</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Curating for the congregation</p>
            </div>

            <div className="space-y-8">
              {pipeline.length === 0 && <div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.5em]">Pipeline Empty</div>}
              {pipeline.map(item => (
                <div key={item.id} className="bg-surface-dark border border-white/5 p-8 rounded-[48px] space-y-8 shadow-3xl">
                  <div className="flex justify-between items-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === PipelineStatus.Ready ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>{item.status}</span>
                    <button onClick={() => { storageService.deletePipelineItem(item.id); refreshData(); }} className="text-slate-600"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold font-jakarta">{item.content.title}</h4>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{item.format}</p>
                  </div>
                  
                  {item.status === PipelineStatus.Ready && (
                    <div className="space-y-6">
                      <div className="p-6 bg-background-dark/50 rounded-3xl border border-white/5">
                        <p className="text-sm text-slate-400 italic line-clamp-3">"{item.content.devotionalMessage}"</p>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setRefiningItem(item)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase">Refine with AI</button>
                        <button onClick={() => handleApprove(item)} className="flex-1 py-4 bg-primary rounded-2xl text-[10px] font-black uppercase">Approve</button>
                      </div>
                    </div>
                  )}

                  {item.status === PipelineStatus.Approved && (
                    <button onClick={() => handlePublish(item)} className="w-full py-6 bg-primary rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30">Release to World</button>
                  )}

                  {item.status === PipelineStatus.Generating && <div className="py-12 flex flex-col items-center gap-4"><span className="material-symbols-outlined animate-spin text-primary">sync</span><span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Manifesting...</span></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <div className="space-y-1">
              <h3 className="text-2xl font-bold font-jakarta">Sanctified Library</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Treasury of wisdom</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {savedDevotionals.map((item, i) => (
                <div key={i} onClick={() => onRefine(item)} className="aspect-square bg-surface-dark border border-white/5 rounded-[40px] p-8 flex flex-col justify-end group active:scale-95 transition-all">
                   <p className="text-white font-bold text-sm line-clamp-2 leading-tight mb-2">{item.title}</p>
                   <p className="text-primary text-[9px] font-black uppercase tracking-widest opacity-60">{item.format || 'Word'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'registry' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <div className="space-y-1">
              <h3 className="text-2xl font-bold font-jakarta">Registry</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Member management</p>
            </div>
            
            <section className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Active Sanctuary</h4>
              <div className="bg-surface-dark border border-white/5 rounded-[32px] overflow-hidden">
                {users.map(u => (
                  <div key={u.id} className="p-6 border-b border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-cover" style={{ backgroundImage: `url('https://picsum.photos/seed/${u.email}/100/100')` }} />
                      <div>
                        <p className="text-sm font-bold text-white">{u.email}</p>
                        <p className="text-[9px] uppercase font-black text-slate-500 mt-1">{u.role}</p>
                      </div>
                    </div>
                    {u.email !== MASTER_ADMIN_EMAIL && (
                      <button onClick={() => handleBlacklist(u.email)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined">person_off</span></button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500/60">Forbidden Identities</h4>
              <div className="space-y-3">
                {blacklist.map(email => (
                  <div key={email} className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex items-center justify-between">
                    <span className="text-sm text-red-200/60">{email}</span>
                    <button onClick={() => handleUnblacklist(email)} className="text-slate-600 hover:text-white transition-colors"><span className="material-symbols-outlined">undo</span></button>
                  </div>
                ))}
                {blacklist.length === 0 && <p className="text-[9px] text-slate-600 uppercase text-center py-8">No identities cast out</p>}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <div className="space-y-1">
              <h3 className="text-2xl font-bold font-jakarta">Database</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Raw scroll inspector</p>
            </div>
            <div className="space-y-8">
              {dbData.map(db => (
                <div key={db.key} className="space-y-3">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest px-1">{db.key}</p>
                   <textarea 
                    defaultValue={db.value}
                    onBlur={e => handleSaveDB(db.key, e.target.value)}
                    className="w-full bg-surface-dark border border-white/5 rounded-3xl p-6 text-[10px] font-mono min-h-[150px] outline-none focus:ring-1 focus:ring-primary text-slate-500"
                   />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-12 animate-in fade-in duration-700 pb-20">
             <div className="space-y-1">
              <h3 className="text-2xl font-bold font-jakarta">Command Center Manual</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Mastering Apostolic Tools</p>
            </div>

            <div className="space-y-10">
              <section className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">spark</span>
                  <h4 className="text-white font-bold text-lg">AI Command Center</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-display">Power-user tools for direct generation. Nano Pro supports high-res art. Flash Edit allows prompt-based adjustments to existing photos. Veo Studio handles text-to-video and image-to-video animations.</p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">auto_fix</span>
                  <h4 className="text-white font-bold text-lg">Divine Studio</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-display">Manual orchestration. Use this for bespoke, high-touch content. Choose a theme and format, then refine with specific theological guidance to generate immediate social or liturgical assets.</p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">movie</span>
                  <h4 className="text-white font-bold text-lg">Media Lab</h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-4">
                    <span className="text-primary font-bold">Pro Vision:</span>
                    <span className="text-sm text-slate-400">Uses Gemini 3 Pro for ultra-high-definition 4K spiritual art.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-primary font-bold">Veo Engine:</span>
                    <span className="text-sm text-slate-400">Cinematic video generation. Animates prompts or static images into high-performance video testimonies.</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPipelineScreen;
