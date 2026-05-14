import React, { useState } from 'react';
import { 
  Sparkles, Plus, Trash2, Calendar, Award, GraduationCap, 
  Briefcase, CheckCircle, AlertCircle, FileText, ChevronRight, 
  ChevronLeft, Loader2, Info, ArrowUpRight
} from 'lucide-react';
import { ResumeData, EducationEntry, WorkEntry, CertificationEntry } from '../types';
import { translations, LanguageType } from '../utils/translations';
import { toJapaneseEra, calculateJapaneseAge } from '../utils/eraConverter';
import { 
  translateAndImproveToJapanese, 
  generateSelfPRWithAI, 
  generateMotivationWithAI 
} from '../services/geminiService';
import PhotoEditor from './PhotoEditor';

interface ResumeBuilderProps {
  language: LanguageType;
  resume: ResumeData;
  onChange: (update: ResumeData) => void;
  onSave: () => void;
}

export default function ResumeBuilder({
  language,
  resume,
  onChange,
  onSave
}: ResumeBuilderProps) {
  const t = translations[language];
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLFPending, setIsLFPending] = useState<string | null>(null); // tracks active AI loading state for fields

  // Generator tool states
  const [genMotivation, setGenMotivation] = useState({
    company: "",
    role: "",
    why: ""
  });
  const [genPR, setGenPR] = useState({
    theme: ""
  });

  const steps = [
    { label: language === 'ja' ? "基本情報" : "Basic Profile", select: 0 },
    { label: language === 'ja' ? "学歴・職歴" : "Education & Work", select: 1 },
    { label: language === 'ja' ? "資格・スキル" : "Skills & Certs", select: 2 },
    { label: language === 'ja' ? "志望動機・PR" : "Motivation & PR", select: 3 },
    { label: language === 'ja' ? "履歴書写真" : "Photo Manager", select: 4 }
  ];

  const updateField = (field: keyof ResumeData, value: any) => {
    onChange({
      ...resume,
      [field]: value,
      updatedAt: new Date().toISOString()
    });
  };

  const handleEducationChange = (id: string, field: keyof EducationEntry, value: string) => {
    const updated = resume.educationList.map(edu => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    updateField('educationList', updated);
  };

  const addEducation = () => {
    const newEntry: EducationEntry = {
      id: Math.random().toString(36).substr(2, 9),
      schoolName: "",
      major: "",
      admissionYear: "2015",
      admissionMonth: "04",
      graduationYear: "2019",
      graduationMonth: "03"
    };
    updateField('educationList', [...resume.educationList, newEntry]);
  };

  const removeEducation = (id: string) => {
    updateField('educationList', resume.educationList.filter(edu => edu.id !== id));
  };

  const handleWorkChange = (id: string, field: keyof WorkEntry, value: string) => {
    const updated = resume.workList.map(work => {
      if (work.id === id) {
        return { ...work, [field]: value };
      }
      return work;
    });
    updateField('workList', updated);
  };

  const addWork = () => {
    const newEntry: WorkEntry = {
      id: Math.random().toString(36).substr(2, 9),
      companyName: "",
      position: "",
      startYear: "2019",
      startMonth: "04",
      endYear: "2024",
      endMonth: "12",
      description: "",
      achievement: ""
    };
    updateField('workList', [...resume.workList, newEntry]);
  };

  const removeWork = (id: string) => {
    updateField('workList', resume.workList.filter(work => work.id !== id));
  };

  const handleCertChange = (id: string, field: keyof CertificationEntry, value: string) => {
    const updated = resume.certificationsList.map(cert => {
      if (cert.id === id) {
        return { ...cert, [field]: value };
      }
      return cert;
    });
    updateField('certificationsList', updated);
  };

  const addCert = () => {
    const newEntry: CertificationEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      year: "2020",
      month: "10"
    };
    updateField('certificationsList', [...resume.certificationsList, newEntry]);
  };

  const removeCert = (id: string) => {
    updateField('certificationsList', resume.certificationsList.filter(cert => cert.id !== id));
  };

  // AI Polisher/Translator
  const runAIPolish = async (field: 'motivation' | 'selfPR', textVal: string) => {
    if (!textVal.trim()) {
      alert(language === 'ja' ? "先に内容を入力してください。" : "Please input some draft text first.");
      return;
    }
    setIsLFPending(field);
    try {
      const polished = await translateAndImproveToJapanese(
        textVal,
        field === 'motivation' ? 'motivation' : 'self_pr'
      );
      updateField(field, polished);
    } catch (e) {
      console.error(e);
      alert("AI Service is loading. Please check your GEMINI_API_KEY.");
    } finally {
      setIsLFPending(null);
    }
  };

  const runWorkAIPolish = async (id: string, field: 'description' | 'achievement', textVal: string) => {
    if (!textVal.trim()) return;
    setIsLFPending(`${id}-${field}`);
    try {
      const polished = await translateAndImproveToJapanese(textVal, 'experience');
      handleWorkChange(id, field, polished);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLFPending(null);
    }
  };

  // AI Motivation Creator Widget
  const handleAIGenerateMotivation = async () => {
    if (!genMotivation.company || !genMotivation.role) {
      alert(language === 'ja' ? "会社名と職種を入力してください。" : "Company name and Target role are required.");
      return;
    }
    setIsLFPending("motivation-gen");
    try {
      const careerSummary = resume.workList.map(w => `${w.companyName} (${w.position})`).join(", ");
      const generated = await generateMotivationWithAI(
        genMotivation.company,
        genMotivation.role,
        careerSummary || "No experience listed",
        genMotivation.why || "Want to grow software skills in high scale"
      );
      updateField('motivation', generated);
      // Clean up generator modal
      setGenMotivation({ company: "", role: "", why: "" });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLFPending(null);
    }
  };

  // AI SelfPR Creator Widget
  const handleAIGeneratePR = async () => {
    setIsLFPending("selfPR-gen");
    try {
      const skillsArray = [
        resume.technicalSkills,
        resume.languageSkills
      ].filter(Boolean);
      
      const mainAchievements = resume.workList.map(w => w.achievement).filter(Boolean).join("; ");
      
      const generated = await generateSelfPRWithAI(
        skillsArray,
        mainAchievements || "Consistently delivering code on time",
        genPR.theme || "Problem solving and teamwork"
      );
      updateField('selfPR', generated);
      setGenPR({ theme: "" });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLFPending(null);
    }
  };

  const ageCalculated = calculateJapaneseAge(resume.birthYear, resume.birthMonth, resume.birthDay);

  return (
    <div id="resume-builder-container" className="space-y-6">
      
      {/* Step Indicators */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-xs">
        <div className="flex space-x-1 overflow-x-auto w-full no-scrollbar">
          {steps.map((st) => (
            <button
              key={st.select}
              onClick={() => setActiveStep(st.select)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                activeStep === st.select 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{st.select + 1}. {st.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs text-left">
        {/* Step 1: Basic Information */}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="font-bold text-sm tracking-widest text-slate-800 dark:text-zinc-200 uppercase">{t.basicInfo}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">{t.fullName}</label>
                <input 
                  type="text" 
                  value={resume.fullName}
                  placeholder={t.sampleName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">{t.furigana}</label>
                <input 
                  type="text" 
                  value={resume.furigana}
                  placeholder={t.sampleFurigana}
                  onChange={(e) => updateField('furigana', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">{t.gender}</label>
                <select
                  value={resume.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 focus:border-blue-500"
                >
                  <option value="男">男 (Male)</option>
                  <option value="女">女 (Female)</option>
                  <option value="無回答">無回答 (Prefer not to state)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase">{t.birthDate}</label>
                  {resume.birthYear && (
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                      {toJapaneseEra(parseInt(resume.birthYear))} ({ageCalculated} {language === 'ja' ? '歳' : 'y.o.'})
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="YYYY"
                    value={resume.birthYear}
                    onChange={(e) => updateField('birthYear', e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 text-center"
                  />
                  <input
                    type="number"
                    placeholder="MM"
                    value={resume.birthMonth}
                    onChange={(e) => updateField('birthMonth', e.target.value.padStart(2, '0'))}
                    className="w-full px-2.5 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 text-center"
                  />
                  <input
                    type="number"
                    placeholder="DD"
                    value={resume.birthDay}
                    onChange={(e) => updateField('birthDay', e.target.value.padStart(2, '0'))}
                    className="w-full px-2.5 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">{t.email}</label>
                <input 
                  type="email" 
                  value={resume.email}
                  placeholder="name@example.com"
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">{t.phone}</label>
                <input 
                  type="text" 
                  value={resume.phone}
                  placeholder="+81-80-XXXX-XXXX"
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">{t.postalCode}</label>
                <input 
                  type="text" 
                  value={resume.postalCode}
                  placeholder="〒 160-0022"
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">{t.address}</label>
                <input 
                  type="text" 
                  value={resume.address}
                  placeholder={t.sampleAddress}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Education & Work History */}
        {activeStep === 1 && (
          <div className="space-y-8">
            {/* Education Sublist */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase">{t.education}</span>
                </div>
                <button
                  onClick={addEducation}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-semibold text-blue-600 dark:text-blue-400 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ja' ? '追加' : 'Add'}</span>
                </button>
              </div>

              {resume.educationList.length === 0 ? (
                <p className="text-zinc-400 text-xs italic">No education entries added yet.</p>
              ) : (
                <div className="space-y-4">
                  {resume.educationList.map((edu, idx) => (
                    <div key={edu.id} className="p-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 rounded-xl space-y-3 relative group">
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 p-1.5 hover:bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete education entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-0.5">School Name</label>
                          <input
                            type="text"
                            value={edu.schoolName}
                            placeholder={t.sampleSchool}
                            onChange={(e) => handleEducationChange(edu.id, 'schoolName', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-0.5">Major / Faculty degree</label>
                          <input
                            type="text"
                            value={edu.major}
                            placeholder={t.sampleMajor}
                            onChange={(e) => handleEducationChange(edu.id, 'major', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>

                        {/* Dates with Era Conversions */}
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase">Admission Date</label>
                            {edu.admissionYear && (
                              <span className="text-[9px] text-zinc-400 font-mono font-medium">{toJapaneseEra(parseInt(edu.admissionYear))}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Year (e.g. 2015)"
                              value={edu.admissionYear}
                              onChange={(e) => handleEducationChange(edu.id, 'admissionYear', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center"
                            />
                            <input
                              type="text"
                              placeholder="Month (e.g. 04)"
                              value={edu.admissionMonth}
                              onChange={(e) => handleEducationChange(edu.id, 'admissionMonth', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="block text-[10px] font-mono text-zinc-500 uppercase">Graduation Date</label>
                            {edu.graduationYear && (
                              <span className="text-[9px] text-zinc-400 font-mono font-medium">{toJapaneseEra(parseInt(edu.graduationYear))}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Year (e.g. 2019)"
                              value={edu.graduationYear}
                              onChange={(e) => handleEducationChange(edu.id, 'graduationYear', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center"
                            />
                            <input
                              type="text"
                              placeholder="Month (e.g. 03)"
                              value={edu.graduationMonth}
                              onChange={(e) => handleEducationChange(edu.id, 'graduationMonth', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Work History Sublist */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase">{t.workExperience}</span>
                </div>
                <button
                  onClick={addWork}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-semibold text-blue-600 dark:text-blue-400 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ja' ? '追加' : 'Add'}</span>
                </button>
              </div>

              {resume.workList.length === 0 ? (
                <p className="text-zinc-400 text-xs italic">No corporate work experience details provided yet.</p>
              ) : (
                <div className="space-y-5">
                  {resume.workList.map((work) => (
                    <div key={work.id} className="p-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 rounded-xl space-y-4 relative group">
                      <button
                        onClick={() => removeWork(work.id)}
                        className="absolute top-4 right-4 p-1.5 hover:bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete job experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-500 mb-0.5">Company Name</label>
                          <input
                            type="text"
                            value={work.companyName}
                            placeholder={t.sampleCompany}
                            onChange={(e) => handleWorkChange(work.id, 'companyName', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-500 mb-0.5">Role / Division Position</label>
                          <input
                            type="text"
                            value={work.position}
                            placeholder={t.samplePosition}
                            onChange={(e) => handleWorkChange(work.id, 'position', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                          />
                        </div>

                        {/* Employment Entrance Dates */}
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="block text-[10px] font-mono text-zinc-500">Employment Start</label>
                            {work.startYear && (
                              <span className="text-[9px] text-zinc-400 font-mono font-medium">{toJapaneseEra(parseInt(work.startYear))}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Year (e.g. 2019)"
                              value={work.startYear}
                              onChange={(e) => handleWorkChange(work.id, 'startYear', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center"
                            />
                            <input
                              type="text"
                              placeholder="Month (e.g. 04)"
                              value={work.startMonth}
                              onChange={(e) => handleWorkChange(work.id, 'startMonth', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="block text-[10px] font-mono text-zinc-500">Employment End</label>
                            {work.endYear && (
                              <span className="text-[9px] text-zinc-400 font-mono font-medium">{toJapaneseEra(parseInt(work.endYear))}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Year (e.g. 2024)"
                              value={work.endYear}
                              onChange={(e) => handleWorkChange(work.id, 'endYear', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center"
                            />
                            <input
                              type="text"
                              placeholder="Month (e.g. 12)"
                              value={work.endMonth}
                              onChange={(e) => handleWorkChange(work.id, 'endMonth', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Job description & Polisher button */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase">{t.description}</label>
                          <button
                            onClick={() => runWorkAIPolish(work.id, 'description', work.description)}
                            disabled={isLFPending === `${work.id}-description`}
                            className="inline-flex items-center space-x-1.5 text-[9px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                          >
                            {isLFPending === `${work.id}-description` ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{t.generating}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-blue-500" />
                                <span>{t.aiTranslateButton}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={work.description}
                          placeholder={t.sampleDesc}
                          onChange={(e) => handleWorkChange(work.id, 'description', e.target.value)}
                          className="w-full p-2.5 border border-slate-250 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>

                      {/* Achievements/Project outcome & Polisher */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase">{t.achievement}</label>
                          <button
                            onClick={() => runWorkAIPolish(work.id, 'achievement', work.achievement)}
                            disabled={isLFPending === `${work.id}-achievement`}
                            className="inline-flex items-center space-x-1.5 text-[9px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                          >
                            {isLFPending === `${work.id}-achievement` ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{t.generating}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-blue-600" />
                                <span>{t.aiTranslateButton}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={work.achievement}
                          placeholder={t.sampleAch}
                          onChange={(e) => handleWorkChange(work.id, 'achievement', e.target.value)}
                          className="w-full p-2.5 border border-slate-250 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Skills & Licences certifications */}
        {activeStep === 2 && (
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase">{t.skills}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">{t.technicalSkills}</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. React, TypeScript, Node.js, Next.js, Docker, PostgreSQL, Flutter"
                    value={resume.technicalSkills}
                    onChange={(e) => updateField('technicalSkills', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">{t.languageSkills}</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Indonesian (Native), English (TOEIC 895), Japanese (JLPT N2 - Certificate current)"
                    value={resume.languageSkills}
                    onChange={(e) => updateField('languageSkills', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950"
                  />
                </div>
              </div>
            </div>

            {/* Certifications Sublist */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase">{t.certifications}</span>
                </div>
                <button
                  onClick={addCert}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-semibold text-blue-600 dark:text-blue-400 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ja' ? '追加' : 'Add'}</span>
                </button>
              </div>

              {resume.certificationsList.length === 0 ? (
                <p className="text-zinc-400 text-xs italic">No professional certificates or licences added yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {resume.certificationsList.map((cert) => (
                    <div key={cert.id} className="p-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between relative group">
                      <button
                        onClick={() => removeCert(cert.id)}
                        className="absolute top-2.5 right-2 px-1.5 py-1 hover:bg-red-50 text-red-500 rounded border border-transparent hover:border-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove licence"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex-1 space-y-1.5">
                        <label className="block text-[10px] font-mono text-zinc-500">Licence / Certificate Official Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          placeholder="e.g. 日本語能力試験 N2 合格"
                          onChange={(e) => handleCertChange(cert.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>

                      <div className="w-full sm:w-48 space-y-1.5">
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="block text-[10px] font-mono text-zinc-500">Acquisition Date</label>
                          {cert.year && (
                            <span className="text-[9px] text-zinc-400 font-mono">{toJapaneseEra(parseInt(cert.year))}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="YYYY"
                            value={cert.year}
                            onChange={(e) => handleCertChange(cert.id, 'year', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center font-mono"
                          />
                          <input
                            type="text"
                            placeholder="MM"
                            value={cert.month}
                            onChange={(e) => handleCertChange(cert.id, 'month', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Shibou Douki (Motivation) & Self-PR */}
        {activeStep === 3 && (
          <div className="space-y-8">
            
            {/* Shibou Douki Component with AI Generator Widget */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase">{t.motivation}</span>
                <button
                  onClick={() => runAIPolish('motivation', resume.motivation)}
                  disabled={isLFPending === 'motivation'}
                  className="px-2.5 py-1 border border-blue-200 hover:bg-blue-50 dark:border-zinc-700/80 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-1"
                >
                  {isLFPending === 'motivation' ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{t.generating}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                      <span>{t.aiTranslateButton}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instant Motivation generation Form widget */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl space-y-3.5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-950 dark:text-blue-300">Generate 志望動機 utilizing AI</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <input
                    type="text"
                    placeholder="Target Company (e.g. Line Fukuoka)"
                    value={genMotivation.company}
                    onChange={(e) => setGenMotivation({ ...genMotivation, company: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-205 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Target Position (e.g. Frontend Engineer)"
                    value={genMotivation.role}
                    onChange={(e) => setGenMotivation({ ...genMotivation, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-205 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Key Reason (e.g. Attracted by globally friendly engineering collaboration scale)"
                  value={genMotivation.why}
                  onChange={(e) => setGenMotivation({ ...genMotivation, why: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-205 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                />
                
                <button
                  onClick={handleAIGenerateMotivation}
                  disabled={isLFPending === "motivation-gen"}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {isLFPending === "motivation-gen" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI is formatting formal Shibou Douki...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto Generate 志望動機</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={5}
                value={resume.motivation}
                onChange={(e) => updateField('motivation', e.target.value)}
                placeholder="日本の履歴書基準：簡潔かつ熱意を持った敬語文脈で約300字。"
                className="w-full p-3 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 leading-relaxed font-sans"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Recommended: 300 - 400 characters</span>
                <span>Current count: {resume.motivation.length} chars</span>
              </div>
            </div>

            {/* Self-PR Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 uppercase">{t.selfPR}</span>
                <button
                  onClick={() => runAIPolish('selfPR', resume.selfPR)}
                  disabled={isLFPending === 'selfPR'}
                  className="px-2.5 py-1 border border-blue-200 hover:bg-blue-50 dark:border-zinc-700/80 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-1"
                >
                  {isLFPending === 'selfPR' ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{t.generating}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                      <span>{t.aiTranslateButton}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instant Self-PR constructor */}
              <div className="p-4 bg-orange-50/50 dark:bg-orange-950/15 border border-orange-100/50 dark:border-orange-900/20 rounded-xl space-y-3.5">
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-orange-950 dark:text-orange-300">Generate Perfect Self-PR using AI</span>
                </div>
                <input
                  type="text"
                  placeholder="Key strength pitch (e.g. Proactive engineering, High adaptability to dynamic environments, logical bug hunting)"
                  value={genPR.theme}
                  onChange={(e) => setGenPR({ theme: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-205 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                />
                <button
                  onClick={handleAIGeneratePR}
                  disabled={isLFPending === "selfPR-gen"}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {isLFPending === "selfPR-gen" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI is mapping achievements into Self-PR structure...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto Generate 自己PR</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={5}
                value={resume.selfPR}
                onChange={(e) => updateField('selfPR', e.target.value)}
                placeholder="日本の履歴書基準：私の強みは〜という点です。といった定型構文に当てはめると高評価が期待できます。"
                className="w-full p-3 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 leading-relaxed font-sans"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Recommended: 300 - 450 characters</span>
                <span>Current count: {resume.selfPR.length} chars</span>
              </div>
            </div>

          </div>
        )}

        {/* Step 5: ID Photo Management */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start space-x-2.5">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 text-slate-800 dark:text-zinc-300">
                <p className="font-bold">Standard Japanese Photo Protocol (履歴書写真ルール)</p>
                <p className="leading-relaxed font-sans text-[11px]">
                  Japanese recruiters are extremely protocol-oriented. Photos are mandatory to verify formal presentation.
                  Always ensure a neat collar shirt, high-contrast, face-forward setup, and pure white background. Select standard 30x40mm (Rirekisho dimension) below.
                </p>
              </div>
            </div>

            <PhotoEditor
              language={language}
              photoUrl={resume.photoUrl}
              setPhotoUrl={(url) => updateField('photoUrl', url)}
              photoSize={resume.photoSize}
              setPhotoSize={(size) => updateField('photoSize', size)}
              scale={resume.photoScale ?? 1}
              setScale={(val) => updateField('photoScale', val)}
              offsetX={resume.photoOffsetX ?? 0}
              setOffsetX={(val) => updateField('photoOffsetX', val)}
              offsetY={resume.photoOffsetY ?? 0}
              setOffsetY={(val) => updateField('photoOffsetY', val)}
              brightness={resume.photoBrightness ?? 100}
              setBrightness={(val) => updateField('photoBrightness', val)}
              contrast={resume.photoContrast ?? 100}
              setContrast={(val) => updateField('photoContrast', val)}
            />
          </div>
        )}
      </div>

      {/* Save & step helpers */}
      <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-100 dark:border-zinc-800/80">
        <button
          disabled={activeStep === 0}
          onClick={() => setActiveStep(prev => prev - 1)}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-semibold rounded-xl flex items-center space-x-1 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onSave}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 font-bold text-white rounded-xl shadow-md shadow-green-500/10 text-xs"
        >
          Save Progress
        </button>

        {activeStep < steps.length - 1 ? (
          <button
            onClick={() => setActiveStep(prev => prev + 1)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              onSave();
              alert(language === 'ja' ? "保存が完了しました。プレビュータブにて最終エクスポートを確認してください！" : "Save completed! Please proceed to the Realtime Preview tab to download your files.");
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
          >
            Finish & Verify
          </button>
        )}
      </div>

    </div>
  );
}
