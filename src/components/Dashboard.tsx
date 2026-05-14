import React, { useState } from 'react';
import { 
  Plus, FileText, Sparkles, Image, ChevronRight, Activity, 
  Trash2, Copy, FileSpreadsheet, Download, Settings, BarChart3,
  Calendar, Globe, Moon, Sun, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { ResumeData, ActivityLog } from '../types';
import { translations, LanguageType } from '../utils/translations';

interface DashboardProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  resumes: ResumeData[];
  activeResumeId: string | null;
  onSelectResume: (id: string) => void;
  onDeleteResume: (id: string) => void;
  onDuplicateResume: (id: string, name: string) => void;
  onCreateResume: () => void;
  activityLogs: ActivityLog[];
  setTab: (tab: 'dashboard' | 'builder' | 'preview' | 'history' | 'settings') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Dashboard({
  language,
  setLanguage,
  resumes,
  activeResumeId,
  onSelectResume,
  onDeleteResume,
  onDuplicateResume,
  onCreateResume,
  activityLogs,
  setTab,
  darkMode,
  setDarkMode
}: DashboardProps) {
  const t = translations[language];

  const totalResumesCount = resumes.length;
  const countAIUsed = activityLogs.filter(log => log.type === 'ai').length;
  const totalVerifiedPhotos = resumes.filter(r => r.photoUrl !== "").length;

  return (
    <div id="saas-dashboard-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* Welcome & Stats Section */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Banner with Warm Greetings */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-600/90 to-indigo-600/95 dark:from-blue-755 dark:to-indigo-855 text-white shadow-lg shadow-blue-500/10">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative space-y-4 max-w-lg">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-white/10 rounded-full font-mono">
              Japan Career Portal Active
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ja'
                ? "理想の日本キャリア、ここから始まる"
                : language === 'id'
                ? "Langkah Karir Profesional Anda di Jepang Dimulai dari Sini!"
                : "Your professional Japanese career journey starts here."}
            </h2>
            <p className="text-xs text-blue-100 leading-relaxed font-sans">
              {language === 'ja'
                ? "日本の採用者に直接刺さる高度なビジネス敬語で、履歴書・職務経歴書を自動作成。お気に入りの写真をロードし、ATSを最適化させましょう。"
                : "Construct Japanese business CV layouts perfectly. Backed by our customized visual photo compliance scoring and auto-translation modifiers."}
            </p>
            <div>
              <button
                onClick={() => {
                  onCreateResume();
                  setTab('builder');
                }}
                className="px-5 py-3 bg-white hover:bg-slate-50 text-blue-600 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md group active:scale-95"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>{t.createNew}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Stat Figures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-mono font-bold block uppercase">{t.completed}</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{totalResumesCount}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-mono font-bold block uppercase">{t.aiCredits}</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{countAIUsed} times</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 flex items-center justify-center shrink-0">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-mono font-bold block uppercase">{t.photoStatus}</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{totalVerifiedPhotos} Loaded</span>
            </div>
          </div>
        </div>

        {/* Resumes Document List */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-550 dark:text-zinc-350">
            {language === 'ja' ? "作成中の履歴書一覧" : "Your Active Japanese Resumes"}
          </h3>

          {resumes.length === 0 ? (
            <div className="border border-dashed border-slate-250 dark:border-zinc-800 p-8 rounded-2xl bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center space-y-2">
              <span className="text-zinc-400 text-xs font-mono">{language === 'ja' ? "まだ履歴書がありません。" : "No Japanese resumes drafted yet."}</span>
              <button
                onClick={() => {
                  onCreateResume();
                  setTab('builder');
                }}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Create your first resume now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resumes.map((res) => (
                <div
                  key={res.id}
                  className={`border-2 rounded-2xl p-5 bg-white dark:bg-zinc-900 transition-all text-left flex flex-col justify-between h-[160px] ${
                    activeResumeId === res.id 
                      ? 'border-blue-650 shadow-md shadow-blue-500/5 dark:border-blue-600' 
                      : 'border-slate-150 dark:border-zinc-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-white truncate max-w-[130px] block">
                        {res.fullName || 'No Name Candidate'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-zinc-400 rounded-md font-mono">
                        {res.photoSize}
                      </span>
                    </div>
                    
                    <span className="text-[10px] text-zinc-400 block mt-1 tracking-wide font-mono truncate">
                      {res.address || "No address added yet"}
                    </span>
                    <span className="text-[9.5px] text-zinc-400 font-mono block mt-0.5">
                      Updated: {new Date(res.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-zinc-800 mt-2">
                    <button
                      onClick={() => {
                        onSelectResume(res.id);
                        setTab('builder');
                      }}
                      className="text-[10px] text-blue-600 dark:text-blue-450 font-bold hover:underline flex items-center space-x-0.5"
                    >
                      <span>Edit details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => onDuplicateResume(res.id, `${res.fullName} (Copy)`)}
                        title="Duplicate CV"
                        className="p-1 text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteResume(res.id)}
                        title="Delete CV"
                        className="p-1 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity & settings sidebar */}
      <div className="lg:col-span-4 space-y-8">
        
        {/* Quick parameters */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs text-left space-y-4">
          <h4 className="font-bold text-[11px] tracking-wider text-slate-400 uppercase font-mono">Fast Setup Preferences</h4>
          
          <div className="space-y-4">
            
            {/* Dark mode Toggle */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-800 dark:text-zinc-200 font-semibold">Ambient Dark Theme</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-6 p-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center relative transition-colors duration-200"
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center transform transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}>
                  {darkMode ? <Moon className="w-3 h-3 text-blue-600" /> : <Sun className="w-3 h-3 text-orange-500" />}
                </div>
              </button>
            </div>

            {/* Language dropdown standard */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 block">Workspace Language</span>
              <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium">
                {(['en', 'ja', 'id'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-1 text-center rounded transition-all ${
                      language === lang 
                        ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm font-bold' 
                        : 'text-slate-500'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'ja' ? '日本語' : 'ID'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/40 rounded-xl">
              <span className="text-[10px] font-bold text-blue-650 dark:text-blue-300 block mb-0.5">Clerk Core Auth Integration</span>
              <p className="text-[9.5px] text-zinc-500 font-sans leading-relaxed">
                Supabase schema RLS is linked to user account authentication. Live preview holds local mock sync key.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs text-left space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-orange-500" />
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-zinc-200">
              {t.recentActivity}
            </h4>
          </div>

          {activityLogs.length === 0 ? (
            <p className="text-[10px] text-zinc-400 italic">No events or activities registered yet.</p>
          ) : (
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs leading-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-800 dark:text-zinc-300">{log.title}</p>
                    <p className="text-[9.5px] text-zinc-400 font-mono">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
