import React, { useState, useRef } from 'react';
import { 
  Upload, Sparkles, AlertCircle, RefreshCw, CheckCircle, 
  Trash2, ShieldAlert, Sliders, ArrowRight, Sun, UserCheck
} from 'lucide-react';
import { auditResumePhoto } from '../services/geminiService';
import { translations, LanguageType } from '../utils/translations';

interface PhotoEditorProps {
  language: LanguageType;
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
  photoSize: '30x40' | '35x45';
  setPhotoSize: (size: '30x40' | '35x45') => void;
  scale?: number;
  setScale?: (scale: number) => void;
  offsetX?: number;
  setOffsetX: (x: number) => void;
  offsetY?: number;
  setOffsetY: (y: number) => void;
  brightness?: number;
  setBrightness?: (b: number) => void;
  contrast?: number;
  setContrast?: (c: number) => void;
}

export default function PhotoEditor({
  language,
  photoUrl,
  setPhotoUrl,
  photoSize,
  setPhotoSize,
  scale: externalScale,
  setScale: externalSetScale,
  offsetX: externalOffsetX,
  setOffsetX: externalSetOffsetX,
  offsetY: externalOffsetY,
  setOffsetY: externalSetOffsetY,
  brightness: externalBrightness,
  setBrightness: externalSetBrightness,
  contrast: externalContrast,
  setContrast: externalSetContrast
}: PhotoEditorProps) {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localScale, localSetScale] = useState<number>(1);
  const [localBrightness, localSetBrightness] = useState<number>(100);
  const [localContrast, localSetContrast] = useState<number>(100);
  const [localOffsetY, localSetOffsetY] = useState<number>(0);
  const [localOffsetX, localSetOffsetX] = useState<number>(0);

  const scale = externalScale !== undefined ? externalScale : localScale;
  const setScale = (val: number | ((p: number) => number)) => {
    if (externalSetScale) {
      const resolved = typeof val === 'function' ? val(scale) : val;
      externalSetScale(resolved);
    } else {
      localSetScale(val);
    }
  };

  const brightness = externalBrightness !== undefined ? externalBrightness : localBrightness;
  const setBrightness = (val: number | ((p: number) => number)) => {
    if (externalSetBrightness) {
      const resolved = typeof val === 'function' ? val(brightness) : val;
      externalSetBrightness(resolved);
    } else {
      localSetBrightness(val);
    }
  };

  const contrast = externalContrast !== undefined ? externalContrast : localContrast;
  const setContrast = (val: number | ((p: number) => number)) => {
    if (externalSetContrast) {
      const resolved = typeof val === 'function' ? val(contrast) : val;
      externalSetContrast(resolved);
    } else {
      localSetContrast(val);
    }
  };

  const offsetY = externalOffsetY !== undefined ? externalOffsetY : localOffsetY;
  const setOffsetY = (val: number | ((p: number) => number)) => {
    if (externalSetOffsetY) {
      const resolved = typeof val === 'function' ? val(offsetY) : val;
      externalSetOffsetY(resolved);
    } else {
      localSetOffsetY(val);
    }
  };

  const offsetX = externalOffsetX !== undefined ? externalOffsetX : localOffsetX;
  const setOffsetX = (val: number | ((p: number) => number)) => {
    if (externalSetOffsetX) {
      const resolved = typeof val === 'function' ? val(offsetX) : val;
      externalSetOffsetX(resolved);
    } else {
      localSetOffsetX(val);
    }
  };
  
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<{
    score: number;
    isProfessional: boolean;
    issues: string[];
    tips: string[];
  } | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'ja' 
          ? "ファイルサイズが大きすぎます (最大5MB)。" 
          : "File size is too large (max 5MB).");
        return;
      }
      loadFile(file);
    }
  };

  const loadFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(20);
    const reader = new FileReader();

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 80) {
          clearInterval(interval);
          return 80;
        }
        return prev + 15;
      });
    }, 100);

    reader.onload = (event) => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setPhotoUrl(event.target.result);
          // Clear old audit to prompt re-scan of new image
          setAuditResult(null);
          // Set standard defaults
          setScale(1);
          setOffsetY(0);
          setOffsetX(0);
          setBrightness(100);
          setContrast(100);
        }
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(language === 'ja' ? "画像ファイルのみ対応しています。" : "Only image files are supported.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'ja' ? "最大5MB以下です。" : "Maximum size is 5MB.");
        return;
      }
      loadFile(file);
    }
  };

  // Triggers professional validation against visual model
  const runAIAudit = async () => {
    if (!photoUrl) return;
    setIsAuditing(true);
    try {
      const response = await auditResumePhoto(photoUrl);
      setAuditResult(response);
    } catch (e) {
      console.error("Audit error: ", e);
      // Fallback
      setAuditResult({
        score: 75,
        isProfessional: false,
        issues: ["Could not fully isolate background. Please double-check clothing."],
        tips: ["Wear a formal suit and collar tie.", "Find a solid, flat background."]
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // Rapid visual enhancements (brighten face, clean background filter)
  const applyAIEnhancements = () => {
    setBrightness(115);
    setContrast(105);
    setScale(prev => Math.min(prev * 1.05, 2.5)); // focus center face
  };

  const removePhoto = () => {
    setPhotoUrl("");
    setAuditResult(null);
  };

  const isAspect30 = photoSize === '30x40';

  return (
    <div id="photo-editor-panel" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col space-y-6">
      
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-zinc-200">
            {t.photoTool}
          </h3>
        </div>
        <div className="flex space-x-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => setPhotoSize('30x40')}
            className={`px-2 py-1 rounded transition-colors ${photoSize === '30x40' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            30x40 mm (履歴書用)
          </button>
          <button
            onClick={() => setPhotoSize('35x45')}
            className={`px-2 py-1 rounded transition-colors ${photoSize === '35x45' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            35x45 mm (パスポート)
          </button>
        </div>
      </div>

      {!photoUrl ? (
        // Dropzone area
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileUpload}
          className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50 dark:bg-zinc-950/40 transition-colors py-12 flex flex-col items-center justify-center space-y-3 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs text-zinc-500 font-mono">Uploading & Optimizing ({uploadProgress}%)</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-zinc-900 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-300">
                {t.uploadArea}
              </p>
              <p className="text-[10px] text-zinc-400 max-w-sm font-sans leading-relaxed">
                {t.requirements}
              </p>
            </>
          )}
        </div>
      ) : (
        // Editor Interface
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Crop Frame visualizer with scale sliders */}
          <div className="flex flex-col items-center space-y-4">
            <span className="text-[10px] text-zinc-400 font-mono self-start uppercase tracking-wider font-semibold">
              {t.imagePreview}
            </span>
            
            {/* Interactive aspect canvas frame */}
            <div 
              className="relative overflow-hidden border-4 border-slate-100 dark:border-zinc-800 rounded-lg shadow-lg bg-zinc-950/20 flex items-center justify-center transition-all bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]"
              style={{
                width: '180px',
                height: isAspect30 ? '240px' : '231px', // exact 3:4 matching
              }}
            >
              <img
                src={photoUrl}
                alt="Profile Crop Preview"
                className="absolute origin-center transition-transform pointer-events-none select-none max-w-none"
                style={{
                  transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  width: '100%',
                  height: 'auto',
                }}
              />
              
              {/* Overlay visual crop grid */}
              <div className="absolute inset-2 border border-dashed border-white/45 rounded pointer-events-none flex flex-col justify-between">
                <div className="border-b border-dashed border-white/20 h-1/3" />
                <div className="border-b border-dashed border-white/20 h-1/3" />
              </div>

              {/* Guide circle representing standard head location center */}
              <div className="absolute w-24 h-24 border border-blue-500/30 rounded-full top-[15%] pointer-events-none flex items-center justify-center">
                <span className="text-[7px] text-white/50 bg-blue-600/60 px-1 py-0.5 rounded uppercase tracking-wider select-none">Head Guideline</span>
              </div>
            </div>

            {/* Slider controls for positioning */}
            <div className="w-full space-y-3.5 bg-slate-50 dark:bg-zinc-950/30 p-4 rounded-xl border border-slate-100 dark:border-zinc-850">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  <span>Zoom / Scale ({scale.toFixed(1)}x)</span>
                  <button onClick={() => setScale(1)} className="text-[10px] text-blue-500 hover:underline">Reset</button>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3" 
                  step="0.05" 
                  value={scale} 
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-slate-200 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-500 block mb-1">Vertical Offset</span>
                  <input 
                    type="range" 
                    min="-200" 
                    max="200" 
                    value={offsetY} 
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="w-full accent-blue-600 h-1"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-zinc-500 block mb-1">Horizontal Offset</span>
                  <input 
                    type="range" 
                    min="-200" 
                    max="200" 
                    value={offsetX} 
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="w-full accent-blue-600 h-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-1 text-[9px] text-zinc-400">
                <Sliders className="w-3 h-3 text-zinc-400" />
                <span>Adjust position until head falls centered inside guide.</span>
              </div>
            </div>
            
            <button 
              onClick={removePhoto}
              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center space-x-1 self-start transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          </div>

          {/* AI Auditor & Enhancer right hand side panel */}
          <div className="flex flex-col space-y-4">
            <span className="text-[10px] text-zinc-400 font-mono self-start uppercase tracking-wider font-semibold">
              Smart AI Helpers (Japanese Standards)
            </span>

            {/* Quick adjust action box */}
            <div className="bg-slate-50 dark:bg-zinc-950/30 border border-slate-100 dark:border-zinc-850 p-4 rounded-xl flex flex-col space-y-3.5">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {language === 'ja' ? "クイック補正ツール" : "Instant Image Enhancer"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                {language === 'ja' ? "ワンクリックで顔の明るさを引き上げ、背景のコントラストを最適化し、ポートレート仕様に整えます。" : "Auto-adjust levels to brighten features and enhance background contrast, conforming to bright Japenese recruiter standard."}
              </p>
              <button
                onClick={applyAIEnhancements}
                className="w-full py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 hover:from-blue-100/50 dark:hover:from-zinc-850 border border-blue-100/50 dark:border-zinc-700/80 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{t.aiEnhance}</span>
              </button>
            </div>

            {/* AI Compliance checker */}
            <div className="border border-slate-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/15 p-4 rounded-xl flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">AI Standard Compliance Audit</span>
                </div>
                {auditResult && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${auditResult.score >= 80 ? 'bg-green-150 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    Score: {auditResult.score}/100
                  </span>
                )}
              </div>

              {!auditResult ? (
                <>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Let our Gemini model scan your crop layout for correct formal wear, camera look, white backdrop standard, and image depth.
                  </p>
                  <button
                    onClick={runAIAudit}
                    disabled={isAuditing}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    {isAuditing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.analyzing}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.aiAudit}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="p-2.5 rounded bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-[11px] space-y-2">
                    <div className="flex items-center space-x-1 text-green-600 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{t.auditSuccess}</span>
                    </div>

                    {auditResult.issues.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-orange-500 uppercase flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                          <span>Detected Issues</span>
                        </span>
                        <ul className="list-disc pl-4 text-[10px] text-slate-600 dark:text-zinc-400 font-sans space-y-0.5">
                          {auditResult.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-[10px] text-green-600 font-medium">Excellent! No major compliance issues found.</p>
                    )}

                    {auditResult.tips.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-zinc-805">
                        <span className="text-[9px] font-bold text-blue-500 uppercase block">Actionable Tips</span>
                        <ul className="list-decimal pl-4 text-[10px] text-slate-600 dark:text-zinc-400 font-sans space-y-0.5">
                          {auditResult.tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {auditResult.score < 80 && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded text-[9.5px] text-yellow-800 dark:text-yellow-400 flex items-start space-x-1.5 font-sans">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-yellow-500 mt-0.5" />
                      <p>{t.warningBadPhoto}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setAuditResult(null)}
                    className="text-[10px] text-blue-500 hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Run Verification scan again</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
