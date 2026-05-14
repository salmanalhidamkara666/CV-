import React, { useState } from 'react';
import { 
  Download, Printer, FileSpreadsheet, FileText, CheckCircle, 
  MapPin, Phone, Mail, Award, Info, RefreshCw, Calendar
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeData } from '../types';
import { translations, LanguageType } from '../utils/translations';
import { toJapaneseEra, calculateJapaneseAge } from '../utils/eraConverter';
import { downloadCSV, downloadXLSX } from '../utils/exportHelper';

function oklabToRgb(l: number, a_lab: number, b_lab: number, a: number = 1): string {
  // Convert Oklab to LMS
  const l_ = l + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
  const m_ = l - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
  const s_ = l - 0.0894841775 * a_lab - 1.2914855480 * b_lab;

  const l_cube = l_ * l_ * l_;
  const m_cube = m_ * m_ * m_;
  const s_cube = s_ * s_ * s_;

  // LMS to Linear RGB
  const r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g_lin = -1.2684380046 * l_cube + 2.5061904746 * m_cube - 0.2377520701 * s_cube;
  const b_lin = -0.0041960863 * l_cube - 0.7034186140 * m_cube + 1.7076147010 * s_cube;

  // Gamma correction to sRGB
  const f = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

  const r = Math.max(0, Math.min(255, Math.round(f(r_lin) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(g_lin) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(b_lin) * 255)));

  if (a !== 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  // Convert polar coordinates to Cartesian in Oklab
  const hRad = (h * Math.PI) / 180;
  const a_lab = c * Math.cos(hRad);
  const b_lab = c * Math.sin(hRad);
  return oklabToRgb(l, a_lab, b_lab, a);
}

function replaceOklch(cssText: string): string {
  const oklchRegex = /oklch\(([^)]+)\)/gi;

  return cssText.replace(oklchRegex, (match, content) => {
    try {
      let normalized = content.replace(/,/g, ' ').replace(/\//g, ' / ').trim();
      let parts = normalized.split(/\s+/);
      let LStr = '';
      let CStr = '';
      let HStr = '';
      let AStr = '';

      if (parts.includes('/')) {
        const slashIdx = parts.indexOf('/');
        LStr = parts[0] || '0';
        CStr = parts[1] || '0';
        HStr = parts[2] || '0';
        AStr = parts[slashIdx + 1] || '1';
      } else if (parts[3] !== undefined && (parts[3] === '/' || !isNaN(Number(parts[3].replace('%', ''))))) {
        LStr = parts[0] || '0';
        CStr = parts[1] || '0';
        HStr = parts[2] || '0';
        AStr = parts[3];
      } else {
        LStr = parts[0] || '0';
        CStr = parts[1] || '0';
        HStr = parts[2] || '0';
      }

      if (LStr.includes('/')) {
        const splitL = LStr.split('/');
        LStr = splitL[0];
        CStr = splitL[1];
      }

      let l = parseFloat(LStr.trim());
      if (LStr.includes('%')) {
        l = l / 100;
      }

      let c = parseFloat(CStr.trim());
      if (CStr.includes('%')) {
        c = c / 100;
      }

      let h = parseFloat(HStr.replace(/(deg|rad|grad|turn)/gi, '').trim());
      if (HStr.includes('%')) {
        h = (parseFloat(HStr) / 100) * 360;
      }
      h = ((h % 360) + 360) % 360;

      let a = 1;
      if (AStr) {
        let parsedA = parseFloat(AStr.replace('%', '').trim());
        if (AStr.includes('%')) {
          a = parsedA / 100;
        } else {
          a = parsedA;
        }
      }

      return oklchToRgb(l, c, h, a);
    } catch (e) {
      console.warn("Failed parsing oklch content match in replaceOklch:", match, e);
      return 'rgb(120, 120, 120)';
    }
  });
}

function replaceOklab(cssText: string): string {
  const oklabRegex = /oklab\(([^)]+)\)/gi;

  return cssText.replace(oklabRegex, (match, content) => {
    try {
      let normalized = content.replace(/,/g, ' ').replace(/\//g, ' / ').trim();
      let parts = normalized.split(/\s+/);
      let LStr = '';
      let AStrVal = '';
      let BStrVal = '';
      let AStr = '';

      if (parts.includes('/')) {
        const slashIdx = parts.indexOf('/');
        LStr = parts[0] || '0';
        AStrVal = parts[1] || '0';
        BStrVal = parts[2] || '0';
        AStr = parts[slashIdx + 1] || '1';
      } else if (parts[3] !== undefined && (parts[3] === '/' || !isNaN(Number(parts[3].replace('%', ''))))) {
        LStr = parts[0] || '0';
        AStrVal = parts[1] || '0';
        BStrVal = parts[2] || '0';
        AStr = parts[3];
      } else {
        LStr = parts[0] || '0';
        AStrVal = parts[1] || '0';
        BStrVal = parts[2] || '0';
      }

      if (LStr.includes('/')) {
        const splitL = LStr.split('/');
        LStr = splitL[0];
        AStrVal = splitL[1];
      }

      let l = parseFloat(LStr.trim());
      if (LStr.includes('%')) {
        l = l / 100;
      }

      let a_val = parseFloat(AStrVal.trim());
      if (AStrVal.includes('%')) {
        a_val = a_val / 100;
      }

      let b_val = parseFloat(BStrVal.trim());
      if (BStrVal.includes('%')) {
        b_val = b_val / 100;
      }

      let a = 1;
      if (AStr) {
        let parsedA = parseFloat(AStr.replace('%', '').trim());
        if (AStr.includes('%')) {
          a = parsedA / 100;
        } else {
          a = parsedA;
        }
      }

      return oklabToRgb(l, a_val, b_val, a);
    } catch (e) {
      console.warn("Failed parsing oklab content match in replaceOklab:", match, e);
      return 'rgb(120, 120, 120)';
    }
  });
}

function replaceColors(cssText: string): string {
  if (!cssText) return cssText;
  let result = cssText;
  if (/oklch/i.test(result)) {
    result = replaceOklch(result);
  }
  if (/oklab/i.test(result)) {
    result = replaceOklab(result);
  }
  return result;
}

interface ResumePreviewProps {
  language: LanguageType;
  resume: ResumeData;
  onRefresh?: () => void;
}

export default function ResumePreview({
  language,
  resume,
  onRefresh
}: ResumePreviewProps) {
  const t = translations[language];
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    // Backup original window methods
    const originalGetComputedStyle = window.getComputedStyle;
    
    try {
      // Patch main window to intercept compute styles without passing receiver to avoid Illegal invocation
      window.getComputedStyle = function(el: Element, pseudo?: string | null) {
        const style = originalGetComputedStyle.call(window, el, pseudo);
        return new Proxy(style, {
          get(target, prop) {
            const val = Reflect.get(target, prop);
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                const innerVal = target.getPropertyValue(propertyName);
                if (innerVal && (innerVal.includes('oklch') || innerVal.includes('oklab') || innerVal.includes('OKLCH') || innerVal.includes('OKLAB'))) {
                  return replaceColors(innerVal);
                }
                return innerVal;
              };
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('OKLCH') || val.includes('OKLAB'))) {
              return replaceColors(val);
            }
            return val;
          }
        });
      };

      const element = document.getElementById('print-area-wrapper');
      if (!element) {
        alert('Print area wrapper not found.');
        return;
      }

      const sheets = element.querySelectorAll('.printable-a4');
      if (sheets.length === 0) {
        alert('No printable sheets found.');
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i] as HTMLElement;

        // Take snapshot using html2canvas with optimal web-to-pdf proportions
        const canvas = await html2canvas(sheet, {
          scale: 3, // Premium quality text and profile images
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: 1123,
          onclone: (clonedDocument) => {
            // Patch cloned document's view context to proxy style evaluation without prototype edits to avoid Illegal invocation
            if (clonedDocument.defaultView) {
              const win = clonedDocument.defaultView;
              const originalClonedGetComputedStyle = win.getComputedStyle;
              win.getComputedStyle = function(el: Element, pseudo?: string | null) {
                const style = originalClonedGetComputedStyle.call(win, el, pseudo);
                return new Proxy(style, {
                  get(target, prop) {
                    const val = Reflect.get(target, prop);
                    if (prop === 'getPropertyValue') {
                      return function(propertyName: string) {
                        const innerVal = target.getPropertyValue(propertyName);
                        if (innerVal && (innerVal.includes('oklch') || innerVal.includes('oklab') || innerVal.includes('OKLCH') || innerVal.includes('OKLAB'))) {
                          return replaceColors(innerVal);
                        }
                        return innerVal;
                      };
                    }
                    if (typeof val === 'function') {
                      return val.bind(target);
                    }
                    if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('OKLCH') || val.includes('OKLAB'))) {
                      return replaceColors(val);
                    }
                    return val;
                  }
                });
              };
            }

            // 1. Process all inline css <style> blocks
            const styleTags = clonedDocument.querySelectorAll('style');
            styleTags.forEach(style => {
              try {
                if (style.innerHTML) {
                  style.innerHTML = replaceColors(style.innerHTML);
                }
              } catch (error) {
                console.error("Failed to replace colors inside style tag", error);
              }
            });

            // 2. Process stylesheet-based styles/rules in the cloned document
            try {
              for (let idx = 0; idx < clonedDocument.styleSheets.length; idx++) {
                const sheetStyle = clonedDocument.styleSheets[idx];
                try {
                  const rules = sheetStyle.cssRules || sheetStyle.rules;
                  if (!rules) continue;
                  
                  const processRules = (ruleList: CSSRuleList) => {
                    for (let j = 0; j < ruleList.length; j++) {
                      const rule = ruleList[j];
                      if (rule instanceof CSSStyleRule) {
                        const styleDesc = rule.style;
                        for (let k = 0; k < styleDesc.length; k++) {
                          const prop = styleDesc[k];
                          const val = styleDesc.getPropertyValue(prop);
                          if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('OKLCH') || val.includes('OKLAB'))) {
                            try {
                              const newVal = replaceColors(val);
                              styleDesc.setProperty(prop, newVal);
                            } catch (e) {
                              // ignore style setting errors
                            }
                          }
                        }
                      } else if (rule && 'cssRules' in rule) {
                        processRules((rule as any).cssRules);
                      }
                    }
                  };
                  processRules(rules);
                } catch (e) {
                  // cross-origin stylesheets are bypassed
                }
              }
            } catch (e) {
              // ignore general stylesheet failures
            }

            // 3. Process element-specific inline styles
            try {
              const allElements = clonedDocument.querySelectorAll('*');
              allElements.forEach(el => {
                const htmlEl = el as HTMLElement;
                if (htmlEl.style) {
                  for (let index = 0; index < htmlEl.style.length; index++) {
                    const propName = htmlEl.style[index];
                    const propVal = htmlEl.style.getPropertyValue(propName);
                    if (propVal && (propVal.includes('oklch') || propVal.includes('oklab') || propVal.includes('OKLCH') || propVal.includes('OKLAB'))) {
                      try {
                        htmlEl.style.setProperty(propName, replaceColors(propVal));
                      } catch (e) {
                        // ignore property setting errors
                      }
                    }
                  }
                }
              });
            } catch (e) {
              // ignore element styles sweep errors
            }
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

        if (i < sheets.length - 1) {
          pdf.addPage();
        }
      }

      const safeName = resume.fullName ? resume.fullName.replace(/\s+/g, '_') : 'Standard';
      pdf.save(`Japanese_Resume_${safeName}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert(language === 'ja' 
        ? 'PDFの作成に失敗しました。時間をおいて再試行するか、ブラウザの標準印刷機能をお試しください。' 
        : 'Could not generate PDF. Please try again or use the standard browser print option.');
    } finally {
      // Restore original browser functions
      window.getComputedStyle = originalGetComputedStyle;
      setIsGeneratingPDF(false);
    }
  };

  const age = calculateJapaneseAge(resume.birthYear, resume.birthMonth, resume.birthDay);
  const currentJapaneseDate = `${toJapaneseEra(new Date().getFullYear())}${new Date().getMonth() + 1}月${new Date().getDate()}日`;

  const totalEducationRows = 5;
  const totalWorkRows = 6;
  const totalCertRows = 5;

  return (
    <div id="resume-preview-container" className="space-y-6">
      
      {/* Export Action Controls */}
      <div className="no-print bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-wrap gap-4 items-center justify-between text-left">
        <div>
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Candidate Export Platform</span>
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
            Generate recruiter-compliant files. Characters are protected against garbling.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => downloadCSV(resume)}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-orange-500" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={() => downloadXLSX(resume)}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span>{t.exportXls}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-zinc-400 disabled:to-zinc-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] disabled:pointer-events-none"
          >
            {isGeneratingPDF ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{language === 'ja' ? '高画質PDF保存' : language === 'id' ? 'Download PDF Langsung' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-500" />
            <span>{language === 'ja' ? '印刷 / PDF (ブラウザ)' : language === 'id' ? 'Cetak Browser' : 'Print / Save (Browser)'}</span>
          </button>
        </div>
      </div>

      <div className="no-print p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-105 dark:border-yellow-900/35 rounded-xl flex items-start space-x-2 text-[10px] text-yellow-800 dark:text-yellow-400 text-left leading-normal font-sans">
        <Info className="w-4 h-4 shrink-0 text-yellow-500" />
        <div>
          <p className="font-semibold">Best PDF Generation practice:</p>
          <p>
            When printing, set your browser destination to "Save as PDF", enable "Background graphics" option, and disable default headers/footers to produce a clean A4 PDF.
          </p>
        </div>
      </div>

      {/* A4 Printable Paper Sheets */}
      <div id="print-area-wrapper" className="space-y-12">
        
        {/* SHEET 1: 履歴書 (Rirekisho) */}
        <section className="printable-a4 font-serif text-slate-900 break-words border border-slate-200 shadow-md">
          
          {/* Header Row */}
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-3 mb-6">
            <h1 className="text-3xl font-extrabold tracking-widest font-sans">履　歴　書</h1>
            <span className="text-xs text-right font-sans">
              {currentJapaneseDate} 現在
            </span>
          </div>

          <div className="grid grid-cols-12 gap-0 border-t-2 border-x-2 border-slate-900">
            {/* Left Box: Personal info */}
            <div className="col-span-9 border-r border-slate-900 divide-y divide-slate-400">
              
              {/* Furigana row */}
              <div className="grid grid-cols-12 p-2">
                <span className="col-span-2 text-[9px] font-sans text-slate-500">ふりがな</span>
                <span className="col-span-10 text-xs font-sans tracking-wide">{resume.furigana || "たなか けんじ"}</span>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-12 p-3 items-center min-h-[50px]">
                <span className="col-span-2 text-xs font-sans text-slate-500 font-semibold">氏　名</span>
                <div className="col-span-10 flex items-center justify-between">
                  <span className="text-xl font-bold font-sans">{resume.fullName || "田中 健二"}</span>
                  
                  {/* Stamp (Hanko) circle simulator */}
                  <div className="w-7 h-7 rounded-full border-2 border-red-500 flex items-center justify-center text-[8px] text-red-500 font-sans font-bold select-none rotate-6 shrink-0 mr-8">
                    <span>印</span>
                  </div>
                </div>
              </div>

              {/* Birthdate and Gender row */}
              <div className="grid grid-cols-12 p-3 text-xs">
                <span className="col-span-2 text-slate-500 font-sans font-semibold">生年月日</span>
                <div className="col-span-6 font-sans">
                  {resume.birthYear ? `${toJapaneseEra(parseInt(resume.birthYear))}${resume.birthYear}年` : "昭和70年"}
                  {resume.birthMonth || "01"}月{resume.birthDay || "01"}日生 （満 {age || "28"} 歳）
                </div>
                <span className="col-span-2 text-slate-500 font-sans text-right pr-2">性別</span>
                <div className="col-span-2 text-center font-sans font-bold">{resume.gender || "無回答"}</div>
              </div>
            </div>

            {/* Right Box: Cropped Passport photograph bounding box */}
            <div className="col-span-3 flex items-center justify-center bg-slate-50 p-2.5 relative">
              {resume.photoUrl ? (
                <div className="w-[110px] h-[147px] overflow-hidden border border-slate-200 rounded relative">
                  <img 
                    src={resume.photoUrl} 
                    alt="CV Profile Crop"
                    className="absolute max-w-none origin-center"
                    style={{
                      width: '100%',
                      transform: `scale(${resume.photoScale ?? 1}) translate(${resume.photoOffsetX ?? 0}px, ${resume.photoOffsetY ?? 0}px)`,
                      filter: `brightness(${resume.photoBrightness ?? 100}%) contrast(${resume.photoContrast ?? 100}%)`,
                    }}
                  />
                </div>
              ) : (
                <div className="w-[110px] h-[147px] border border-dashed border-slate-350 text-center flex flex-col items-center justify-center text-[10px] text-zinc-400 p-2 font-sans select-none">
                  <span>Photo Area</span>
                  <span className="text-[8px] mt-1">(30mm x 40mm)</span>
                </div>
              )}
            </div>

            {/* Address Row spanning full grid */}
            <div className="col-span-12 grid grid-cols-12 border-t border-slate-900 divide-x divide-slate-900">
              <div className="col-span-9 p-3 space-y-1">
                <div className="flex space-x-4 text-[9px] font-sans text-slate-500">
                  <span>ふりがな</span>
                  <span className="font-medium tracking-wider">{resume.furigana ? `${resume.furigana}のじゅうしょ` : "じゅうしょ"}</span>
                </div>
                <div className="text-xs flex flex-col space-y-1">
                  <span className="font-mono text-[11px] font-bold">郵便番号: 〒 {resume.postalCode || "160-0022"}</span>
                  <span className="font-semibold text-xs leading-normal font-sans">{resume.address || "東京都新宿区 新宿ビル5F-2"}</span>
                </div>
              </div>
              <div className="col-span-3 p-3 flex flex-col justify-between text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-sans">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="text-[10px]">{resume.phone || "080-XXXX-YYYY"}</span>
                </div>
                <div className="flex items-center space-x-1.5 font-sans">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="text-[9px] break-all">{resume.email || "kenji@example.com"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Education and Career Grid list */}
          <div className="mt-6 border-2 border-slate-900 font-sans">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-center font-bold bg-slate-50">
                  <th className="w-16 border-r border-slate-900 py-1.5">年 (Year)</th>
                  <th className="w-12 border-r border-slate-900">月</th>
                  <th className="py-1.5 pl-3">学 歴 ・ 職 歴 (Education and Careers History)</th>
                </tr>
              </thead>
              <tbody>
                {/* Section Indicator row */}
                <tr className="border-b border-slate-400 font-bold text-center">
                  <td className="border-r border-slate-900 py-1 font-mono"></td>
                  <td className="border-r border-slate-900"></td>
                  <td className="text-center tracking-widest py-1 font-semibold text-slate-650 bg-slate-100/30">学 歴 (Education History)</td>
                </tr>

                {/* Print education items */}
                {resume.educationList.map((edu, idx) => (
                  <tr key={edu.id || idx} className="border-b border-slate-400 hover:bg-slate-50/40">
                    <td className="border-r border-slate-900 py-2.5 text-center font-mono font-bold">
                      {edu.admissionYear ? `${toJapaneseEra(parseInt(edu.admissionYear))}` : ""}
                    </td>
                    <td className="border-r border-slate-900 text-center font-mono">{edu.admissionMonth || "04"}</td>
                    <td className="pl-4 font-medium">{edu.schoolName} {edu.major}  入学</td>
                  </tr>
                ))}

                {resume.educationList.map((edu, idx) => (
                  <tr key={`g-${edu.id || idx}`} className="border-b border-slate-400 hover:bg-slate-50/40">
                    <td className="border-r border-slate-900 py-2.5 text-center font-mono font-bold">
                      {edu.graduationYear ? `${toJapaneseEra(parseInt(edu.graduationYear))}` : ""}
                    </td>
                    <td className="border-r border-slate-900 text-center font-mono">{edu.graduationMonth || "03"}</td>
                    <td className="pl-4 font-medium">{edu.schoolName} {edu.major}  卒業</td>
                  </tr>
                ))}

                {/* Section Work Indicator */}
                <tr className="border-b border-slate-450 font-bold text-center">
                  <td className="border-r border-slate-900 py-1.5 font-mono"></td>
                  <td className="border-r border-slate-900"></td>
                  <td className="text-center tracking-widest py-1.5 font-semibold text-slate-650 bg-slate-100/30">職 歴 (Work Experience)</td>
                </tr>

                {/* Print Corporate experience list */}
                {resume.workList.map((work, idx) => (
                  <tr key={work.id || idx} className="border-b border-slate-400 hover:bg-slate-50/40">
                    <td className="border-r border-slate-900 py-3 text-center font-mono font-bold">
                      {work.startYear ? `${toJapaneseEra(parseInt(work.startYear))}` : ""}
                    </td>
                    <td className="border-r border-slate-900 text-center font-mono">{work.startMonth || "04"}</td>
                    <td className="pl-4 leading-normal font-sans">
                      <div className="font-bold">{work.companyName} 入社</div>
                      <div className="text-[11px] text-slate-600 pl-2">職種：{work.position || "エンジニア"} ({work.description || "空欄"})</div>
                    </td>
                  </tr>
                ))}

                {/* End placeholder indicator */}
                <tr className="border-b border-slate-900">
                  <td className="border-r border-slate-900 py-2.5"></td>
                  <td className="border-r border-slate-900"></td>
                  <td className="text-right pr-12 font-bold tracking-widest italic text-zinc-400">以上</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Licenses & Certifications Grid */}
          <div className="mt-6 border-2 border-slate-900 font-sans">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-center font-bold bg-slate-50">
                  <th className="w-16 border-r border-slate-900 py-1.5">年 (Year)</th>
                  <th className="w-12 border-r border-slate-900">月</th>
                  <th className="py-1.5 pl-3">免 許 ・ 資 格 (Licences &amp; Certifications)</th>
                </tr>
              </thead>
              <tbody>
                {resume.certificationsList.length === 0 ? (
                  <tr>
                    <td className="border-r border-slate-900 py-2 text-center text-zinc-300 font-mono"></td>
                    <td className="border-r border-slate-900 text-center text-zinc-300 font-mono"></td>
                    <td className="pl-4 py-2 italic text-zinc-400 font-medium">特になし (No specific certificates)</td>
                  </tr>
                ) : (
                  resume.certificationsList.map((cert, index) => (
                    <tr key={cert.id || index} className="border-b border-slate-400 hover:bg-slate-50/40">
                      <td className="border-r border-slate-900 py-2.5 text-center font-mono font-bold">
                        {cert.year ? `${toJapaneseEra(parseInt(cert.year))}` : ""}
                      </td>
                      <td className="border-r border-slate-900 text-center font-mono">{cert.month || "10"}</td>
                      <td className="pl-4 font-medium">{cert.name} 取得</td>
                    </tr>
                  ))
                )}

                {/* Safe grid padding */}
                <tr className="border-b border-slate-900">
                  <td className="border-r border-slate-900 py-2.5"></td>
                  <td className="border-r border-slate-900"></td>
                  <td className="pr-4 py-2 text-right text-zinc-350">以上</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Shibou Douki Grid Block */}
          <div className="mt-6 border-2 border-slate-900 font-sans text-xs flex flex-col">
            <div className="border-b border-slate-900 font-bold bg-slate-50 p-2">
              志望動機、特技、自己PR、好きな学科など （Motivation Pitch）
            </div>
            <div className="p-4 leading-relaxed font-sans text-stone-850 min-h-[140px] text-[11.5px] text-justify whitespace-pre-wrap">
              {resume.motivation || "特筆事項なし。志望動機をAI機能などで自動生成するとここに標準敬語フォーマットで表示されます。"}
            </div>
          </div>

          {/* Bottom Candidate Request block */}
          <div className="mt-6 border-2 border-slate-900 font-sans text-xs flex flex-col">
            <div className="border-b border-slate-900 font-bold bg-slate-50 p-2">
              本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他について希望がある場合に記入）
            </div>
            <div className="p-3 leading-normal text-stone-600 min-h-[60px] text-[10.5px]">
              貴社規定に従います。
            </div>
          </div>

        </section>

        {/* SHEET 2: 職務経歴書 (Shokumu Keirekisho) */}
        <section className="printable-a4 font-sans text-slate-900 break-words border border-slate-200 shadow-md print-page-break bg-white">
          
          <div className="text-center font-bold tracking-widest text-2xl border-b-2 border-slate-900 pb-3 mb-6 font-sans">
            職 務 経 歴 書
          </div>

          {/* Meta metadata row */}
          <div className="flex justify-between text-xs font-semibold mb-6">
            <span>{currentJapaneseDate}</span>
            <span className="text-right">氏名：{resume.fullName || "田中 健二"}</span>
          </div>

          {/* Core Career Overviews */}
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-sm font-bold border-b border-slate-900 pb-1 mb-2">【職務要約】</h2>
              <p className="text-xs leading-relaxed text-justify indent-4">
                これまで、約5年間にわたり{resume.workList[0]?.companyName || "標準IT企業"}にて、{resume.workList[0]?.position || "ソフトウェア開発"}として従事してまいりました。
                フロントエンド開発を軸に置いたシステムの設計、SEO向上、SPAアーキテクチャのモジュール設計を得意とし、
                大規模なクラウド運用を支えるUI設計、コンポーネント開発を牽引した経験がございます。
              </p>
            </div>

            {/* Core Tech Stack Section */}
            <div>
              <h2 className="text-sm font-bold border-b border-slate-900 pb-1 mb-2">【活かせる技術・経験】</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-[11px] text-slate-700 block">■ 技術スキル（テクニカル）</span>
                  <p className="pl-2 leading-relaxed text-slate-600 font-semibold">{resume.technicalSkills || "React, TypeScript, Next.js, Redux, Node.js"}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[11px] text-slate-700 block">■ 外国語・資格</span>
                  <p className="pl-2 leading-relaxed text-slate-600 font-semibold">{resume.languageSkills || "JLPT N2 Level Certificate, English TOEIC 895"}</p>
                </div>
              </div>
            </div>

            {/* Structured Project Experiences */}
            <div>
              <h2 className="text-sm font-bold border-b border-slate-900 pb-1 mb-3">【職務詳細履歴】</h2>
              
              {resume.workList.map((work, index) => (
                <div key={work.id || index} className="mb-6 border-b border-dashed border-slate-300 pb-4 last:border-b-0 space-y-2.5">
                  <div className="flex justify-between bg-slate-50 p-2 rounded text-xs font-bold border border-slate-100">
                    <span className="text-blue-900">{work.companyName} ({work.position || "エンジニア"})</span>
                    <span className="text-stone-500 font-mono">
                      {work.startYear}年{work.startMonth}月 〜 {work.endYear}年{work.endMonth}月
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 pl-2 leading-relaxed">
                    <div>
                      <span className="font-bold text-[11px] text-slate-700 block mt-1">■ 業務内容：</span>
                      <p className="text-slate-600 pl-4">{work.description || "空欄"}</p>
                    </div>

                    <div>
                      <span className="font-bold text-[11px] text-slate-700 block mt-1">■ 取組実績・成果成果：</span>
                      <p className="text-slate-600 pl-4 font-semibold italic text-blue-950">✓ {work.achievement || "空欄"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Self-PR Section */}
            <div>
              <h2 className="text-sm font-bold border-b border-slate-900 pb-1 mb-2">【自己PR】</h2>
              <p className="text-xs leading-relaxed text-justify whitespace-pre-wrap">
                {resume.selfPR || "私の強みは、あらゆる課題に対して主体性を持ってアプローチし、論理的なデバッグ能力によりコードのバグを根本解決する点にあります。"}
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
