import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, CheckCircle, Globe, Download, BadgeHelp, Stars, 
  ChevronRight, ArrowRight, Star, FileSpreadsheet, ShieldAlert
} from 'lucide-react';
import { translations, LanguageType } from '../utils/translations';

interface LandingPageProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  onStart: () => void;
}

export default function LandingPage({ language, setLanguage, onStart }: LandingPageProps) {
  const t = translations[language];
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: language === 'ja' ? "この履歴書は一般的な企業の選考に使えますか？" : language === 'id' ? "Apakah format resume ini bisa langsung digunakan melamar kerja?" : "Is this resume format acceptable for actual Japanese companies?",
      a: language === 'ja' ? "はい、厚生労働省推奨のJIS規格に準拠した日本標準の履歴書および職務経歴書のフォーマットを取得できます。" : language === 'id' ? "Ya, format resume kami 100% mengikuti standar industri JIS Jepang resmi yang direkomendasikan untuk melamar di perusahaan terkemuka di Jepang." : "Yes, our interactive outputs are generated according to the JIS standard recommended by the Ministry of Health, Labour and Welfare of Japan."
    },
    {
      q: language === 'ja' ? "インドネシア語や英語の下書きから作成できますか？" : language === 'id' ? "Dapatkah saya mengisi dalam Bahasa Indonesia/Inggris dulu?" : "Can I draft my career in English or Indonesian first?",
      a: language === 'ja' ? "はい、多言語AI翻訳エンジンが自動で自然かつ高度な日本のビジネス敬語に変換・調整します。" : language === 'id' ? "Tentu saja! AI kami akan otomatis menerjemahkan dan memoles draft Anda menjadi bahasa Jepang bisnis formal yang sopan (Keigo)." : "Absolutely! The built-in Gemini AI agent translates and rewrites your raw bullet-points into high-grade business Japanese (Keigo)."
    },
    {
      q: language === 'ja' ? "写真はどのような規格に対応していますか？" : language === 'id' ? "Bagaimana dengan aturan foto resume Jepang?" : "What are the rules regarding the profile picture?",
      a: language === 'ja' ? "30x40mmおよび35x45mmの標準サイズに対応。さらに、スーツの自動チェックや背景を白に補正するAI機能も搭載しています。" : language === 'id' ? "Kami mendukung ukuran standar 履歴書 30x40mm & 35x45mm, dilengkapi rekomendasi kesesuaian pakaian formal dan perataan latar belakang putih otomatis." : "We support standard 30x40mm and 35x45mm dimensions. The interactive editor aids with visual background cleansing and posture alignment checks."
    },
    {
      q: language === 'ja' ? "エクスポート形式を教えてください。" : language === 'id' ? "CV ini bisa di-export ke dalam format file apa saja?" : "What export formats are supported?",
      a: language === 'ja' ? "印刷・PDF保存に完全対応するほか、文字化けを防ぐUTF-8 BOM付きのCSVファイル、およびExcel (XLS)ファイルのエクスポートが可能です。" : language === 'id' ? "Kami mendukung cetak fisik / simpan PDF standar A4, file Excel terstruktur, dan CSV ber-BOM UTF-8 agar tidak terjadi kerusakan karakter kanji." : "Printable high-resolution PDF (standards A4), Microsoft Excel Spreadsheet, and localized CSV with UTF-8 BOM protection to prevent kanji decoding issue."
    }
  ];

  return (
    <div id="landing-page" className="min-height-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      {/* Upper Navigation bar */}
      <header id="landing-nav" className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              AI
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">履歴書</h1>
              <p className="text-xs font-mono text-zinc-500 max-sm:hidden">AI Japanese Resume Builder</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-6">
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium">
              {(['en', 'ja', 'id'] as const).map((lang) => (
                <button
                  key={lang}
                  id={`lang-btn-${lang}`}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    language === lang 
                      ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-950'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'ja' ? '日本語' : 'ID'}
                </button>
              ))}
            </div>

            <button
              onClick={onStart}
              className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-sm"
            >
              {t.startFree}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div id="glow-effect" className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-400/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-full w-max">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {language === 'ja' ? "100% 厚生労働省 標準フォーマット準拠" : "100% Recruiter Compliance Certified"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {t.tagline}
            </h1>

            <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              {t.subtagline}
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                onClick={onStart}
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center space-x-2 text-sm sm:text-base group"
              >
                <span>{t.generateResume}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <a
                href="#features-view"
                className="px-6 py-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium text-center text-sm sm:text-base transition-all"
              >
                {language === 'ja' ? "機能を詳しく見る" : "Explore Features"}
              </a>
            </div>

            {/* Micro proof badges */}
            <div className="pt-8 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-4 items-center">
              <span className="text-xs text-zinc-500 font-medium">TRUSTED BY CANDIDATES AT:</span>
              <div className="flex gap-4 font-bold text-sm tracking-widest text-slate-400 dark:text-zinc-600">
                <span>LINE JP</span>
                <span>MERCARI</span>
                <span>RAKUTEN</span>
                <span>SOFTBANK</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Visual CV Preview card on landing */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-6 relative max-w-sm mx-auto"
            >
              {/* Photo placeholder upper right inside preview */}
              <div className="absolute top-6 right-6 w-20 h-24 border border-zinc-200 dark:border-zinc-700 rounded bg-slate-50 dark:bg-zinc-800 flex flex-col items-center justify-center text-[10px] text-zinc-400 p-1 text-center font-bold">
                <span>3 : 4 PHOTO</span>
                <span className="text-[8px] font-mono mt-2">(履歴書用)</span>
              </div>

              <div className="w-1/2 border-b-2 border-slate-900 dark:border-zinc-500 pb-2 mb-4">
                <span className="text-[10px] text-zinc-400 block font-mono">ふりがな</span>
                <span className="text-[11px] font-medium block">たなか けんじ</span>
                <span className="text-md font-bold">田中 健二</span>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-mono font-semibold">志望動機 (AI Optimized excerpt)</span>
                  <p className="bg-blue-50/50 dark:bg-blue-950/20 text-xs text-slate-700 dark:text-zinc-300 p-2.5 rounded border border-blue-100/60 dark:border-blue-900/30 italic">
                    「貴社が推進するAIプラットフォーム開発において、私の技術スタックを最大限に活かし、チームの更なる成長に貢献したく志望いたしました。」
                  </p>
                </div>
                
                <div>
                  <span className="text-[10px] text-zinc-400 block font-mono font-semibold">職務経歴書 (Sample Work)</span>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-700 pl-2 space-y-1">
                    <p className="font-bold">株式会社ソフト技術開発 (2023 - 元年)</p>
                    <p>• React, Node.jsを活用した高負荷ECサイトの最適化</p>
                    <p>• パフォーマンス35%改善実績あり</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>JIS Certified Layout</span>
                  </div>
                  <div className="flex items-center space-x-1 text-right justify-end">
                    <Stars className="w-3.5 h-3.5 text-yellow-500" />
                    <span>ATS Optimasi 100%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features-view" className="py-20 bg-white dark:bg-zinc-900/60 border-y border-slate-100 dark:border-zinc-800/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 font-sans tracking-tight">
            {t.features}
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto mb-16 text-sm">
            {language === 'ja' 
              ? "日本の採用文化を知り尽くしたAIが、あなたの合格率を格段に高める書類を作成。"
              : language === 'id'
              ? "Fitur berteknologi AI kustom dirancang khusus untuk standarisasi CV premium Jepang."
              : "Advanced technology tailored specifically for Japanese recruiting expectations."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {language === 'ja' ? "インテリジェント多言語 Keigo 翻訳" : language === 'id' ? "Penerjemah Bahasa Jepang Keigo" : "Sophisticated Keigo Translation"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                {language === 'ja' ? "不自然な機械翻訳を排斥し、実用的なビジネス敬語や専門用語を網羅した高水準な表現に変換します。" : language === 'id' ? "AI menterjemahkan Bahasa Indonesia/Inggris mentah menjadi istilah bisnis Jepang resmi (Keigo) yang sangat dinilai tinggi oleh HR." : "Transforms basic drafts instantly into nuanced high-grade corporate Japanese writing. Native and compliant."}
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {language === 'ja' ? "AI写真監査チェック＆補正" : language === 'id' ? "AI Audit Pasfoto Resume" : "AI Resume Photo Compliance"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                {language === 'ja' ? "髪型、スーツの有無、背景、傾きを検知。さらに背景の白調化やトリミング調整も自動サポート。" : language === 'id' ? "Mendeteksi kemiringan wajah, jas formal, tingkat blur, serta dilengkapi editor auto brightness dan putih latar belakang CV Jepang." : "Visual audit matching passport rules. Standard 3:4 aspect, bright tone, posture scanning and Japanese style checklist notifications."}
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/40 text-green-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {language === 'ja' ? "完璧な3つの出力形式" : language === 'id' ? "Ekspor Multi-Format" : "Error-Free Multipath Export"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                {language === 'ja' ? "PDF印刷はピクセルパーフェクトなA4対応。Excelや、文字化けを防止するUTF-8 BOM付きCSVのダウンロードが可能。" : language === 'id' ? "Cetak PDF rapi, file Excel kaya format grid, otomatis menggunakan UTF-8 BOM pada format CSV agar tulisan Kanji Jepang terbaca sempurna." : "A4 perfect PDF layouts, XLS tables, plus UTF-8 BOM CSV protecting complex Kanji glyphs from corrupted display on desktop platforms."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-view" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 text-center">
          {t.pricing}
        </h2>
        <p className="text-zinc-500 mb-16 text-center text-sm">{language === 'ja' ? "シンプルで明確な料金プランをご提案。" : "Simple, transparent pricing structure."}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto justify-center">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between text-left relative">
            <div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold uppercase font-mono tracking-wider w-max block mb-4">STUDENT & BASICS</span>
              <h3 className="text-2xl font-bold mb-2">Free Starter</h3>
              <p className="text-xs text-zinc-500 mb-6">{language === 'ja' ? "まずは体験して作ってみたい方に" : "Try generating standard items easily."}</p>
              
              <div className="text-3xl font-extrabold mb-6">$0 <span className="text-lg font-normal text-zinc-500">/ forever</span></div>

              <ul className="space-y-3.5 mb-8 text-xs text-slate-600 dark:text-zinc-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>1 Resume Draft (履歴書・職務経歴書)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Interactive Form Fields</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Standard Printable A4 HTML layout</span>
                </li>
                <li className="flex items-center space-x-2 text-zinc-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>No Advanced AI Smart Translator Access</span>
                </li>
              </ul>
            </div>

            <button onClick={onStart} className="w-full py-3 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs transition-all">
              {language === 'ja' ? "無料で試し作成" : "Get Started"}
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-2xl border-2 border-blue-600 bg-white dark:bg-zinc-900 flex flex-col justify-between text-left relative shadow-lg shadow-blue-500/5">
            <div className="absolute -top-3.5 right-6 bg-blue-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider animate-bounce">
              RECOMMENDED
            </div>
            
            <div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold uppercase font-mono tracking-wider w-max block mb-4">PROFESSIONAL SPECIALIST</span>
              <h3 className="text-2xl font-bold mb-2">AI Recruiter Pro</h3>
              <p className="text-xs text-zinc-500 mb-6">{language === 'ja' ? "本気で日本企業に就職・内定を勝ち取りたい方に" : "Maximize your chances with Japanese corporations."}</p>
              
              <div className="text-3xl font-extrabold mb-6">$15 <span className="text-lg font-normal text-zinc-500">/ single pay</span></div>

              <ul className="space-y-3.5 mb-8 text-xs text-slate-700 dark:text-zinc-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited Japanese CV / Resume copies</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Advanced Keigo translation access (Gemini API)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>AI CV Photo Compliance Assessment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>XLS Table Sheet + Premium UTF-8 BOM CSV Exports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Lifetime Storage in secure local browser / Cloud Sync</span>
                </li>
              </ul>
            </div>

            <button onClick={onStart} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 text-xs transition-all shadow-md shadow-blue-500/10">
              {language === 'ja' ? "Proプランで作成" : "Start Pro Candidate Path"}
            </button>
          </div>
        </div>
      </section>

      {/* Testimony Section */}
      <section id="testimonial-view" className="py-20 bg-slate-100/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-12">
            {t.testimonials}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 text-left">
              <div className="flex text-yellow-400 mb-3 text-xs">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed italic mb-4">
                {language === 'ja' 
                  ? "「以前は正しい日本語敬語がわからず悩んでいましたが、このAIは信じられないほど洗練された志望動機を作成してくれました。無事内定しました！」"
                  : language === 'id'
                  ? "AI pemoles bahasanya sangat luar biasa! Tulisan riwayat kerja saya yang sebelumnya memakai bahasa jepang biasa langsung diubah jadi bahasa standar korporat (keigo). Direkrut dalam 3 minggu!"
                  : "Using AI, my career achievements instantly translated to highly formal corporate Keigo that typically takes years of training to get right. Recruited!"}
              </p>
              <div className="font-bold text-xs">Pratama R.</div>
              <div className="text-[10px] text-zinc-500">IT Engineer in Tokyo (Formerly Bandung)</div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 text-left">
              <div className="flex text-yellow-400 mb-3 text-xs">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed italic mb-4">
                {language === 'ja' 
                  ? "「履歴書用写真で何回もダメ出しを受けていましたが、AIの明るさ補正と服装チェックにより recruiter さんから完璧だとお褒めの言葉をもらいました。」"
                  : language === 'id'
                  ? "Fitur analisis fotonya membantu sekali. Mengetahui apakah foto jas kita sudah tegak, mendeteksi bayangan, dan mengganti latar belakang putih dalam satu tombol. Sangat merepresentasikan etika melamar kerja di Jepang."
                  : "The CV Photo assessment gave me precise tips on my apparel alignment, and the auto background whitening features worked cleanly. Got compliment from interviewer!"}
              </p>
              <div className="font-bold text-xs">Yuki T.</div>
              <div className="text-[10px] text-zinc-500">Backend Architect (Kyoto)</div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 text-left sm:col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex text-yellow-400 mb-3 text-xs">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed italic mb-4">
                {language === 'ja' 
                  ? "「ExcelとCSVに完全対応しているので、Hello Workやリクルーターのエージェント管理システムにそのままドラフトをロード可能でした。文字化けもゼロです。」"
                  : language === 'id'
                  ? "Sangat aman dari huruf acak (garbled textual errors) karena dilengkapi BOM UTF-8 khusus saat kita ekspor ke Microsoft Excel atau format CSV. Recomended untuk job hunters!"
                  : "Highly compatible sheet grids. Downloaded XLS and easily imported to my recruiter’s systems. Absolutely bug-free on character encoding."}
              </p>
              <div className="font-bold text-xs">Sarah S.</div>
              <div className="text-[10px] text-zinc-500">Bilingual Office Specialist (Osaka)</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-section" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-12 text-center">
          {t.faq}
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                className="w-full text-left p-5 flex justify-between items-center font-bold text-xs sm:text-sm"
              >
                <span>{faq.q}</span>
                <span className="text-xl leading-none text-zinc-400">{selectedFaq === index ? '−' : '＋'}</span>
              </button>
              {selectedFaq === index && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-zinc-400 py-12 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold font-sans">AI Japanese Resume Analyzer</span>
          </div>
          <p className="text-xs text-zinc-500">{t.footerText}</p>
          <p className="text-[10px] text-zinc-600">© 2026 AI Standard. Created with extreme care.</p>
        </div>
      </footer>
    </div>
  );
}
