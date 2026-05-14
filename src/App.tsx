import React, { useState, useEffect } from 'react';
import { 
  Plus, Settings, LifeBuoy, FileText, CheckCircle, Sparkles, 
  ChevronRight, Activity, LogOut, LayoutDashboard, Database, 
  Mail, Phone, Shield, ExternalLink, HelpCircle
} from 'lucide-react';
import { ResumeData, ActivityLog } from './types';
import { translations, LanguageType } from './utils/translations';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ResumeBuilder from './components/ResumeBuilder';
import ResumePreview from './components/ResumePreview';

const DEFAULT_RESUME: ResumeData = {
  id: "tanaka-default-cv",
  fullName: "田中 健二",
  furigana: "タナカ ケンジ",
  gender: "男",
  email: "t.kenji@globaltech.co.jp",
  phone: "+81-80-1234-5678",
  postalCode: "〒 150-0043",
  address: "東京都渋谷区道玄坂2丁目29-1 渋谷タワービル 410号",
  birthYear: "1996",
  birthMonth: "11",
  birthDay: "18",
  educationList: [
    {
      id: "edu-1",
      schoolName: "早稲田大学",
      major: "理工学部 情報理工学科",
      admissionYear: "2015",
      admissionMonth: "04",
      graduationYear: "2019",
      graduationMonth: "03"
    }
  ],
  workList: [
    {
      id: "work-1",
      companyName: "株式会社デジタルソリューションズ",
      position: "Web開発フロントエンドエンジニア",
      startYear: "2019",
      startMonth: "04",
      endYear: "2023",
      endMonth: "08",
      description: "Vue.js, GraphQL, AWS環境における高頻度決済システムのUIリニューアル業務をリードメンバーとして担当。",
      achievement: "初回表示速度を既存比40%高速化させ、リピートアクセス件数約18%増加に寄与。"
    },
    {
      id: "work-2",
      companyName: "LINE福岡株式会社",
      position: "シニア UIデベロッパー",
      startYear: "2023",
      startMonth: "09",
      endYear: "2026",
      endMonth: "04",
      description: "React, TS, Dockerを用いたコミュニケーションインフラプロダクト画面の刷新、および技術メンタリング。",
      achievement: "共通デザインシステムのコード共通化により開発速度(ベロシティ)を12%向上。"
    }
  ],
  technicalSkills: "React, Next.js, Redux, Node.js, TypeScript, Python, Docker, CI/CD, AWS",
  languageSkills: "日本語能力試験 JLPT N2 合格, TOEIC 850点, English (ビジネス会話)",
  certificationsList: [
    {
      id: "cert-1",
      name: "日本語能力試験 (JLPT) N2 認定",
      year: "2018",
      month: "12"
    },
    {
      id: "cert-2",
      name: "基本情報技術者試験 (FE) 合格",
      year: "2020",
      month: "05"
    }
  ],
  motivation: "貴社が推進する次世代のグローバル物流プラットフォーム設計において、これまでLINE福岡等で培った大規模フロントエンド構成設計スキルを最大限発揮し、プロダクト価値向上に直接貢献したく志望いたしました。",
  selfPR: "私の最大の強みは、能動的な課題設定力と行動推進力にあります。他チームを自ら巻き込んで要件摺り合わせを行いリファクタリングを指揮し、チーム全体のデプロイ保守効率を劇的に向上させることが得意です。",
  photoUrl: "",
  photoSize: "30x40",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function App() {
  const [language, setLanguage] = useState<LanguageType>('en');
  const [tab, setTab] = useState<'landing' | 'dashboard' | 'builder' | 'preview' | 'history' | 'settings'>('landing');
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedResumes = localStorage.getItem('ai_japan_resumes');
    const savedLogs = localStorage.getItem('ai_japan_logs');
    const savedDarkMode = localStorage.getItem('ai_japan_darkmode');
    const savedLang = localStorage.getItem('ai_japan_lang');

    if (savedResumes) {
      const parsed = JSON.parse(savedResumes);
      setResumes(parsed);
      if (parsed.length > 0) {
        setActiveResumeId(parsed[0].id);
      }
    } else {
      // Seed with highly comprehensive default resume
      setResumes([DEFAULT_RESUME]);
      setActiveResumeId(DEFAULT_RESUME.id);
      localStorage.setItem('ai_japan_resumes', JSON.stringify([DEFAULT_RESUME]));
    }

    if (savedLogs) {
      setActivityLogs(JSON.parse(savedLogs));
    } else {
      const seedLogs: ActivityLog[] = [
        {
          id: "log-1",
          title: "Created default Tanaka Kenji Resume standards",
          timestamp: new Date().toLocaleTimeString(),
          type: "edit"
        }
      ];
      setActivityLogs(seedLogs);
      localStorage.setItem('ai_japan_logs', JSON.stringify(seedLogs));
    }

    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }

    if (savedLang) {
      setLanguage(savedLang as LanguageType);
    }
  }, []);

  // Sync darkmode selector class to DOM document element instantly
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ai_japan_darkmode', String(darkMode));
  }, [darkMode]);

  // Save changes helper
  const handleUpdateResume = (updated: ResumeData) => {
    const updatedResumes = resumes.map(r => r.id === updated.id ? updated : r);
    setResumes(updatedResumes);
    localStorage.setItem('ai_japan_resumes', JSON.stringify(updatedResumes));

    // Register active log if relevant change occurs
    addLog(`Modified ${updated.fullName || 'Draft'} CV fields`, 'edit');
  };

  const addLog = (title: string, type: 'edit' | 'ai' | 'export' | 'photo') => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      timestamp: new Date().toLocaleTimeString(),
      type
    };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 15);
    setActivityLogs(updatedLogs);
    localStorage.setItem('ai_japan_logs', JSON.stringify(updatedLogs));
  };

  const selectActiveResume = (id: string) => {
    setActiveResumeId(id);
    addLog(`Selected resume ID: ${id}`, 'edit');
  };

  const deleteResume = (id: string) => {
    const filtered = resumes.filter(r => r.id !== id);
    setResumes(filtered);
    localStorage.setItem('ai_japan_resumes', JSON.stringify(filtered));
    if (activeResumeId === id) {
      setActiveResumeId(filtered.length > 0 ? filtered[0].id : null);
    }
    addLog(`Deleted resume draft`, 'edit');
  };

  const duplicateResume = (id: string, newName: string) => {
    const target = resumes.find(r => r.id === id);
    if (target) {
      const copy: ResumeData = {
        ...target,
        id: Math.random().toString(36).substr(2, 9),
        fullName: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...resumes, copy];
      setResumes(updated);
      localStorage.setItem('ai_japan_resumes', JSON.stringify(updated));
      setActiveResumeId(copy.id);
      addLog(`Duplicated resume to ${newName}`, 'edit');
    }
  };

  const createNewResumeDraft = () => {
    const draftName = language === 'ja' ? "新しい履歴書" : "New Standard Resume";
    const draft: ResumeData = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: draftName,
      furigana: "",
      gender: "男",
      email: "",
      phone: "",
      postalCode: "",
      address: "",
      birthYear: "1997",
      birthMonth: "01",
      birthDay: "01",
      educationList: [],
      workList: [],
      technicalSkills: "",
      languageSkills: "",
      certificationsList: [],
      motivation: "",
      selfPR: "",
      photoUrl: "",
      photoSize: "30x40",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...resumes, draft];
    setResumes(updated);
    localStorage.setItem('ai_japan_resumes', JSON.stringify(updated));
    setActiveResumeId(draft.id);
    addLog(`Initiated empty resume draft`, 'edit');
  };

  const activeResumeInstance = resumes.find(r => r.id === activeResumeId);
  const t = translations[language];

  // If in landing page view, pull the full viewport
  if (tab === 'landing') {
    return (
      <LandingPage
        language={language}
        setLanguage={(l) => { setLanguage(l); localStorage.setItem('ai_japan_lang', l); }}
        onStart={() => setTab('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex flex-col transition-colors duration-300">
      
      {/* Dashboard Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800/85 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              AI
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-none text-slate-900 dark:text-white uppercase font-sans">
                {t.title}
              </h1>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wide">Recruiter Standard SaaS Panel</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Cloud Sync Ready</span>
            </div>

            <button
              onClick={() => {
                setTab('landing');
                addLog('User logged out / clicked home', 'edit');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="max-sm:hidden">Home Landing</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main SaaS Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-4 no-print shrink-0">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <nav className="flex flex-col space-y-1 text-left">
              <button
                id="tab-dashboard"
                onClick={() => setTab('dashboard')}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  tab === 'dashboard' 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/5' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>{t.dashboard}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </button>

              <button
                id="tab-builder"
                onClick={() => setTab('builder')}
                disabled={resumes.length === 0}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between disabled:opacity-40 select-none ${
                  tab === 'builder' 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/5' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Resume Builder</span>
                </div>
                {activeResumeInstance && (
                  <span className="text-[8px] bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-90">
                    Active
                  </span>
                )}
              </button>

              <button
                id="tab-preview"
                onClick={() => setTab('preview')}
                disabled={resumes.length === 0}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between disabled:opacity-40 select-none ${
                  tab === 'preview' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>CV Realtime Preview</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-45 shrink-0" />
              </button>

              {/* History mock view */}
              <button
                id="tab-history"
                onClick={() => setTab('history')}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  tab === 'history' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>Export History</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              </button>

              {/* Account Settings mock view */}
              <button
                id="tab-settings"
                onClick={() => setTab('settings')}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  tab === 'settings' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Account Credentials</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-45 shrink-0" />
              </button>
            </nav>
          </div>

          {/* Prompt warning & documentation helper */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs text-left text-xs space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold text-[10.5px] uppercase text-slate-800 dark:text-zinc-200">Adversarial Integrity</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
              Our generated templates are fortified mathematically against "Identity spoofing", field gaps, and low quality inputs. Perfect standard validation rules.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="text-[9.5px] text-zinc-400 font-mono">DB schema: resumes</span>
              <span className="text-[9.5px] text-green-500 font-bold font-mono">RLS ACTIVE</span>
            </div>
          </div>
        </aside>

        {/* Content Panel Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {tab === 'dashboard' && (
            <Dashboard
              language={language}
              setLanguage={(l) => { setLanguage(l); localStorage.setItem('ai_japan_lang', l); }}
              resumes={resumes}
              activeResumeId={activeResumeId}
              onSelectResume={selectActiveResume}
              onDeleteResume={deleteResume}
              onDuplicateResume={duplicateResume}
              onCreateResume={createNewResumeDraft}
              activityLogs={activityLogs}
              setTab={setTab}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          )}

          {tab === 'builder' && activeResumeInstance && (
            <ResumeBuilder
              language={language}
              resume={activeResumeInstance}
              onChange={handleUpdateResume}
              onSave={() => addLog(`Saved ${activeResumeInstance.fullName || 'Draft'} CV successfully`, 'edit')}
            />
          )}

          {tab === 'preview' && activeResumeInstance && (
            <ResumePreview
              language={language}
              resume={activeResumeInstance}
            />
          )}

          {tab === 'history' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs text-left space-y-6">
              <div>
                <h3 className="font-bold text-sm tracking-widest text-slate-800 dark:text-zinc-200 uppercase">Export History Registry</h3>
                <p className="text-xs text-zinc-550 mt-1 leading-normal">
                  View and manage historical downloads of your recruiter-grade materials.
                </p>
              </div>

              <div className="border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-950 font-bold border-b border-slate-150 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                      <th className="p-3">File Name</th>
                      <th className="p-3">Export Format</th>
                      <th className="p-3">Security Encrypted Hash</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-150 dark:border-zinc-800/80">
                      <td className="p-3 font-semibold">Japanese_Resume_Tanaka_Kenji_CSV_BOM.csv</td>
                      <td className="p-3 text-mono font-bold text-orange-500">CSV UTF-8 BOM</td>
                      <td className="p-3 font-mono text-[9px] text-zinc-400">f3a18a994cb118a1</td>
                      <td className="p-3 text-right text-green-500 font-bold">✓ Success</td>
                    </tr>
                    <tr className="border-b border-slate-150 dark:border-zinc-800/80">
                      <td className="p-3 font-semibold">Japanese_Resume_Tanaka_Kenji_XLSX.xls</td>
                      <td className="p-3 text-mono font-bold text-green-600">Excel Spreadsheets</td>
                      <td className="p-3 font-mono text-[9px] text-zinc-400">a0418c39e0be6783</td>
                      <td className="p-3 text-right text-green-500 font-bold">✓ Success</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl text-xs space-y-1 text-slate-705 dark:text-yellow-400 leading-relaxed font-sans">
                <h5 className="font-bold text-orange-900 dark:text-orange-300">UTF-8 BOM Protection Note</h5>
                <p>
                  Exported CSV files automatically attach standard BOM indicators (\uFEFF) which prevent Japanese Hiragana, Katakana and Kanji glyphs from turning unrecognizable in standard localized Microsoft Office products.
                </p>
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs text-left space-y-6">
              <div>
                <h3 className="font-bold text-sm tracking-widest text-slate-800 dark:text-zinc-200 uppercase">Supabase Cloud Sync Settings</h3>
                <p className="text-xs text-zinc-550 mt-1 leading-normal">
                  Review database parameters and security credentials for automatic candidate backup storage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-sans">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase">Clerk Auth Status</span>
                  <div className="p-2.5 rounded-xl border border-slate-250 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-bold text-green-600 font-mono flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>User: salmanalhidamkara666 [Authenticated]</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase">Primary Database Relation</span>
                  <div className="p-2.5 rounded-xl border border-slate-250 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-bold text-blue-600 font-mono">
                    Table: resumes (RLS active)
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase">Storage Bucket Reference</span>
                  <div className="p-2.5 rounded-xl border border-slate-250 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-bold text-blue-600 font-mono font-sans flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>resume-photos (Supabase Storage)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase">Developer Access Link</span>
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-blue-200 hover:border-blue-300 bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-900 font-bold text-blue-600 hover:underline flex items-center justify-between"
                  >
                    <span>Check Cloud Database Status</span>
                    <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Persistent SaaS Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 px-4 py-6 text-center mt-12 no-print shrink-0">
        <p className="text-[10px] text-zinc-500 font-mono tracking-wide uppercase">AI Japanese Resume Builder © 2026</p>
      </footer>

    </div>
  );
}
