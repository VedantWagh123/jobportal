import React, { useContext, useRef, useState, useEffect } from 'react'
import { Sparkles, CheckCircle2, AlertCircle, Lock, ArrowRight, FileText, Check, ShieldCheck, Target, Zap, Loader2, XCircle, Award, TrendingUp, X, Mail, Phone, Link } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useUser, useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'

const HomeResumeAnalyzer = () => {
  const navigate = useNavigate();
  const { backendUrl, userData, setIsProfileModalOpen, setShowPremiumPopup, isPremium, checkLumiAccess, consumeLumiCredit } = useContext(AppContext);
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const fileInputRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploadedFileType, setUploadedFileType] = useState(null);
  
  // Persist state to local storage so refresh doesn't lose data
  const [atsResult, setAtsResult] = useState(() => {
    const saved = localStorage.getItem('savedAtsResult');
    return saved ? JSON.parse(saved) : null;
  });
  const [extractedResume, setExtractedResume] = useState(() => {
    const saved = localStorage.getItem('savedExtractedResume');
    return saved ? JSON.parse(saved) : null;
  });

  // Auto-clear data after 1 minute for privacy
  useEffect(() => {
    let timeoutId;
    if (atsResult || extractedResume) {
      timeoutId = setTimeout(() => {
        setAtsResult(null);
        setExtractedResume(null);
        setUploadedFileUrl(null);
        setUploadedFileType(null);
        setIsResumeModalOpen(false);
        localStorage.removeItem('savedAtsResult');
        localStorage.removeItem('savedExtractedResume');
      }, 60000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [atsResult, extractedResume]);

  const handleUploadClick = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to use the AI Resume Analyzer.");
      navigate('/applications');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast.error('Please upload a PDF or DOCX file.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const token = await getToken();
      
      const fileUrl = URL.createObjectURL(file);
      setUploadedFileUrl(fileUrl);
      setUploadedFileType(file.type);

      const formData = new FormData();
      formData.append('resumeFile', file);

      toast.info('Extracting text from resume...', { autoClose: 2000 });
      const uploadRes = await axios.post(`${backendUrl}/api/resumes/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!uploadRes.data.success) {
        throw new Error(uploadRes.data.message || 'Extraction failed');
      }

      setExtractedResume(uploadRes.data.extractedData);
      localStorage.setItem('savedExtractedResume', JSON.stringify(uploadRes.data.extractedData));

      toast.info('AI is generating your ATS score...', { autoClose: 3000 });
      
      consumeLumiCredit(async () => {
        try {
            const scoreRes = await axios.post(`${backendUrl}/api/resumes/ai/ats-score`, {
              resumeData: uploadRes.data.extractedData
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (!scoreRes.data.success) {
              throw new Error(scoreRes.data.message || 'Score generation failed');
            }

            setAtsResult(scoreRes.data.result);
            localStorage.setItem('savedAtsResult', JSON.stringify(scoreRes.data.result));
            toast.success("✨ Your ATS Score is ready! Double click the resume card to view full details.");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || 'ATS generation failed');
        }
      });
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Something went wrong during analysis');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const displayScore = atsResult?.score || 78;
  const circleOffset = 264 - (264 * displayScore) / 100;

  return (
    <section id="ats-section" className="w-full max-w-[1900px] mx-auto mt-12 md:mt-16 mb-6 px-2 md:px-6">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
      <div className="bg-gradient-to-r from-[#f0f7ff] via-[#f8fafc] to-[#f0f7ff] border border-blue-100/70 rounded-[32px] p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-10 shadow-[0_8px_40px_rgba(37,99,235,0.04)]">
        
        {/* Decorative Background Blurs */}
        <div className="absolute top-[-20%] left-[40%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-amber-50/60 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Left Content */}
        <div className="w-full xl:w-[42%] relative z-10 flex flex-col items-start text-left shrink-0">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e6f0ff] text-blue-600 font-extrabold text-[12px] mb-6 shadow-sm">
            <Sparkles size={16} strokeWidth={2.5}/> AI Resume Analyzer
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-black text-[#0f172a] leading-[1.1] mb-5 tracking-tight">
            Is your resume <br className="hidden sm:block" />
            passing the <span className="text-blue-600">ATS test?</span>
          </h2>
          
          <p className="text-[18px] sm:text-[20px] font-bold text-gray-700 mb-3">Check your score in 30 seconds.</p>
          <p className="text-[14px] sm:text-[15px] font-medium text-gray-500 mb-10 max-w-[450px] leading-relaxed">
            Get instant Lumi-powered feedback, fix issues, and improve your chances of getting shortlisted.
          </p>

          {/* 4 Feature Icons Row */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-8 mb-10 w-full">
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <ShieldCheck size={16} strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-black text-gray-800 leading-tight">ATS Compatibility<br/>Score</p>
            </div>
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Zap size={16} strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-black text-gray-800 leading-tight">Detailed<br/>Suggestions</p>
            </div>
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Target size={16} strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-black text-gray-800 leading-tight">Skill Gap<br/>Analysis</p>
            </div>
            <div className="flex items-center gap-2.5 group cursor-default">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <FileText size={16} strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-black text-gray-800 leading-tight">Industry-wise<br/>Recommendations</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6">
            <button disabled={isAnalyzing} onClick={handleUploadClick} className="w-full sm:w-auto bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-blue-400 text-white font-extrabold text-[14px] px-8 py-3.5 rounded-xl shadow-[0_4px_15px_rgba(29,78,216,0.3)] hover:shadow-[0_6px_20px_rgba(29,78,216,0.4)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <UploadIcon size={16} />} 
              {isAnalyzing ? 'Analyzing...' : atsResult ? 'Re-upload Resume' : 'Upload Resume'} 
              {!isAnalyzing && <ArrowRight size={16} strokeWidth={2.5}/>}
            </button>
            <button 
              onClick={() => {
                if (!isSignedIn) {
                  toast.error("Please sign in first.");
                  return;
                }
                checkLumiAccess(() => navigate('/resume-builder'))
              }}
              className="w-full sm:w-auto bg-white border border-blue-200 text-blue-600 font-extrabold text-[14px] px-8 py-3.5 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center shadow-sm"
            >
              Build a New Resume
            </button>
          </div>

          <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
            <Lock size={14} strokeWidth={2.5}/> Your data is 100% secure and private.
          </div>

          {/* AI Match CTA (Shows when ATS result is available) */}
          {atsResult && (
            <div 
              onClick={() => {
                if (!isSignedIn) {
                  toast.error("Please sign in first.");
                  return;
                }
                checkLumiAccess(() => navigate('/smart-match'))
              }}
              className="mt-8 xl:mt-10 w-full max-w-[420px] bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80 rounded-[20px] p-4 flex items-center gap-4 cursor-pointer hover:shadow-[0_10px_40px_rgba(79,70,229,0.12)] hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Target size={22} className="text-indigo-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[14px] font-black text-gray-900 leading-none">Try Lumi Job Match</h4>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider animate-pulse">New</span>
                </div>
                <p className="text-[12px] font-bold text-gray-500 leading-tight">
                  Find jobs that perfectly match this resume.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 text-indigo-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors shadow-sm">
                <ArrowRight size={14} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        {/* Right Content - Scalable Pure CSS Visual Composition */}
        <div className="w-full xl:w-[58%] flex justify-center xl:justify-end relative z-10 pointer-events-none">
          
          {/* Fixed Size Canvas for exact positioning without breaking, increased width to 850px to prevent overlap */}
          <div className="relative w-[850px] h-[460px] shrink-0 scale-[0.55] sm:scale-75 md:scale-90 lg:scale-[0.85] xl:scale-100 origin-center xl:origin-right flex items-center transition-transform pointer-events-auto">

            {/* Decorative Text Elements */}
            <div className="absolute top-[10px] right-[40px] transform rotate-[-5deg] z-0 pointer-events-none">
              <p className="text-blue-500 font-caveat text-[26px] opacity-80 leading-tight text-center">Better Resume<br/>Brighter Opportunities</p>
            </div>
            <div className="absolute bottom-[0px] right-[40px] transform rotate-[5deg] z-0 pointer-events-none">
              <p className="text-gray-500 font-caveat text-[22px] opacity-80 leading-tight text-center">Small Changes<br/>Big Opportunities</p>
            </div>

            {/* Main Resume Card (Interactive Expandable Hover) */}
            <div 
              onDoubleClick={() => { if(extractedResume) setIsResumeModalOpen(true) }}
              title="Double click to expand full resume"
              className={`group absolute left-[0px] top-[50px] w-[280px] h-[380px] hover:w-[350px] hover:h-[460px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-blue-50/80 p-6 transform -rotate-6 hover:rotate-0 flex flex-col z-10 transition-all duration-500 overflow-hidden group-hover:overflow-y-auto cursor-pointer custom-scrollbar ${isAnalyzing ? 'blur-sm scale-95 opacity-50' : 'hover:z-50 hover:-translate-y-8 hover:-translate-x-6 blur-0 opacity-100 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)]'}`}
            >
              
              <div className="border-b border-gray-100 pb-3 mb-3 transition-all shrink-0">
                <h3 className="font-black text-[18px] text-gray-900 leading-none mb-1.5 transition-all">
                  {extractedResume?.personalInfo?.fullName || user?.fullName || 'John Doe'}
                </h3>
                <p className="text-[11px] font-bold text-blue-600 mb-2 leading-tight line-clamp-1 group-hover:line-clamp-none transition-all">
                  {extractedResume?.personalInfo?.professionalTitle || user?.primaryEmailAddress?.emailAddress || 'Software Developer'}
                </p>
                
                {!extractedResume && (
                  <div className="space-y-2 mt-2">
                    <div className="w-[140px] h-2 bg-gray-200 rounded-full transition-all"></div>
                    <div className="w-[100px] h-2 bg-gray-200 rounded-full transition-all"></div>
                  </div>
                )}
                {extractedResume && (
                    <p className="text-[9px] text-gray-500 font-medium leading-tight line-clamp-2 group-hover:line-clamp-none transition-all">
                        {extractedResume.summary || "No summary provided."}
                    </p>
                )}
              </div>

              <div className="mb-3 flex-1 shrink-0 transition-all">
                <h4 className="text-[12px] font-black text-gray-800 mb-1.5 transition-all">Experience</h4>
                {!extractedResume ? (
                  <div className="space-y-1.5 transition-all">
                    <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-[85%] h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-[40%] h-2 bg-gray-100 rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-2 transition-all">
                    {/* Show only 2 when normal, show up to 5 when hovered */}
                    {extractedResume.experience?.slice(0, 5).map((exp, i) => (
                      <div key={i} className={`${i >= 2 ? 'hidden group-hover:block' : 'block'}`}>
                        <p className="text-[10px] font-bold text-gray-700 truncate group-hover:whitespace-normal transition-all">{exp.jobTitle}</p>
                        <p className="text-[8px] text-gray-500 truncate group-hover:whitespace-normal transition-all">{exp.company} • {exp.startDate} - {exp.endDate}</p>
                      </div>
                    ))}
                    {(!extractedResume.experience || extractedResume.experience.length === 0) && (
                        <p className="text-[9px] text-gray-400">No experience listed.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-3 shrink-0 transition-all">
                <h4 className="text-[12px] font-black text-gray-800 mb-1.5 transition-all">Education</h4>
                {!extractedResume ? (
                  <div className="space-y-1.5 transition-all">
                    <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-[60%] h-2 bg-gray-100 rounded-full"></div>
                  </div>
                ) : (
                   <div className="space-y-1.5">
                     {extractedResume.education?.map((edu, i) => (
                        <div key={i} className={`${i >= 1 ? 'hidden group-hover:block' : 'block'}`}>
                          <p className="text-[9px] font-bold text-gray-700 truncate group-hover:whitespace-normal transition-all">{edu.degree || "Degree not listed"}</p>
                          <p className="text-[8px] text-gray-500 truncate group-hover:whitespace-normal transition-all">{edu.institution}</p>
                        </div>
                     ))}
                   </div>
                )}
              </div>

              <div className="shrink-0 transition-all">
                <h4 className="text-[12px] font-black text-gray-800 mb-1.5 transition-all">Skills</h4>
                {!extractedResume ? (
                  <div className="space-y-1.5 transition-all">
                    <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-[70%] h-2 bg-gray-100 rounded-full"></div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 transition-all">
                    {extractedResume.skills?.technical?.map((skill, i) => (
                      <span key={i} className={`px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-[4px] text-[8px] font-bold transition-all ${i >= 6 ? 'hidden group-hover:inline-flex' : 'inline-flex'}`}>{skill}</span>
                    ))}
                    {(!extractedResume.skills?.technical || extractedResume.skills?.technical?.length === 0) && (
                        <span className="text-[8px] text-gray-400">No technical skills parsed.</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI Loader Card (Between Resume and Score) */}
            <div className={`absolute top-[140px] left-[230px] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-gray-100 p-4 w-[130px] flex flex-col items-center z-30 transition-all duration-300 pointer-events-none ${isAnalyzing ? 'opacity-100 scale-110 shadow-blue-500/20 shadow-xl' : 'opacity-0 scale-90'}`}>
              <Loader2 className={`text-blue-500 mb-2 ${isAnalyzing ? 'animate-spin' : ''}`} size={26} />
              <p className="text-[12px] font-black text-gray-900 leading-tight">AI Analyzing...</p>
              <p className="text-[9px] font-bold text-gray-400">Scanning profile...</p>
            </div>

            {/* Main Score Card (Center-Right spaced) */}
            <div className={`absolute left-[330px] top-[20px] w-[270px] bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.12)] border border-blue-50/80 p-6 z-20 transition-all duration-700 ${isAnalyzing ? 'blur-sm scale-95 opacity-50 pointer-events-none' : 'blur-0 scale-100 opacity-100 pointer-events-auto'}`}>
              <div className="flex flex-col items-center mb-5">
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={displayScore >= 75 ? "#10b981" : displayScore >= 50 ? "#f59e0b" : "#ef4444"} strokeWidth="12" strokeDasharray="264" strokeDashoffset={circleOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-[28px] font-black text-gray-900 leading-none tracking-tighter">{displayScore}<span className="text-[11px] text-gray-400 font-bold">/100</span></span>
                  </div>
                </div>
                <h4 className={`text-[16px] font-black mb-1.5 ${displayScore >= 75 ? 'text-[#059669]' : displayScore >= 50 ? 'text-[#d97706]' : 'text-[#dc2626]'}`}>
                  {displayScore >= 75 ? 'Good Score!' : displayScore >= 50 ? 'Needs Work' : 'Poor Score'}
                </h4>
                <p className="text-[11px] text-gray-500 font-bold text-center leading-tight px-2">
                  {displayScore >= 75 ? 'Your resume is ATS friendly, but can be improved.' : 'Your resume lacks critical ATS elements. Consider rewriting.'}
                </p>
              </div>
              
              {atsResult ? (
                <div className="space-y-3 mb-6 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                  {atsResult.feedback?.strengths?.map((str, i) => (
                    <div key={`s-${i}`} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-[1px]" strokeWidth={2.5}/>
                      <p className="text-[11px] font-bold text-gray-600 leading-tight">{str}</p>
                    </div>
                  ))}
                  {atsResult.feedback?.weaknesses?.map((wk, i) => (
                    <div key={`w-${i}`} className="flex items-start gap-2">
                      <XCircle size={16} className="text-[#ef4444] shrink-0 mt-[1px]" strokeWidth={2.5}/>
                      <p className="text-[11px] font-bold text-gray-600 leading-tight">{wk}</p>
                    </div>
                  ))}
                  {atsResult.feedback?.improvements?.map((imp, i) => (
                    <div key={`i-${i}`} className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-[#f59e0b] shrink-0 mt-[1px]" strokeWidth={2.5}/>
                      <p className="text-[11px] font-bold text-gray-600 leading-tight">{imp}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-[1px]" strokeWidth={2.5}/>
                    <p className="text-[11px] font-bold text-gray-600 leading-tight">Clear professional summary</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-[1px]" strokeWidth={2.5}/>
                    <p className="text-[11px] font-bold text-gray-600 leading-tight">Good use of keywords</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-[#f59e0b] shrink-0 mt-[1px]" strokeWidth={2.5}/>
                    <p className="text-[11px] font-bold text-gray-600 leading-tight">Add more quantifiable results</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle size={16} className="text-[#ef4444] shrink-0 mt-[1px]" strokeWidth={2.5}/>
                    <p className="text-[11px] font-bold text-gray-600 leading-tight">Include relevant skills</p>
                  </div>
                </div>
              )}

              <button 
                className="w-full pointer-events-auto cursor-pointer bg-[#eff6ff] text-blue-600 hover:bg-blue-100 transition-colors font-extrabold text-[12px] py-3 rounded-xl flex items-center justify-center gap-1.5" 
                onClick={() => {
                  if (!isSignedIn) {
                    toast.error("Please sign in first.");
                    return;
                  }
                  checkLumiAccess(() => navigate('/resume-builder'))
                }}
              >
                Build Resume Now <ArrowRight size={12} strokeWidth={2.5}/>
              </button>
            </div>

            {/* Right Side Stacked Chips (Fully right aligned) */}
            <div className={`absolute right-[0px] top-[100px] flex flex-col gap-4 z-10 transition-all duration-700 pointer-events-none ${isAnalyzing ? 'translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}`}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-3.5 flex items-center gap-3 w-[190px]">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Award size={18} className="text-blue-600" strokeWidth={2.5}/></div>
                <div>
                  <p className="text-[12px] font-black text-gray-900 leading-tight">Get Noticed</p>
                  <p className="text-[9px] font-bold text-gray-500">by Top Employers</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-3.5 flex items-center gap-3 w-[190px]">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0"><TrendingUp size={18} className="text-teal-600" strokeWidth={2.5}/></div>
                <div>
                  <p className="text-[12px] font-black text-gray-900 leading-tight">Improve Your</p>
                  <p className="text-[9px] font-bold text-gray-500">Shortlisting Chances</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-3.5 flex items-center gap-3 w-[190px]">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><Sparkles size={18} className="text-amber-500" strokeWidth={2.5}/></div>
                <div>
                  <p className="text-[12px] font-black text-gray-900 leading-tight">Stand Out</p>
                  <p className="text-[9px] font-bold text-gray-500">from the Competition</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Full Resume Modal - Original Uploaded File Preview */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300" onClick={() => setIsResumeModalOpen(false)}>
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Your Original Resume</h2>
              <button onClick={() => setIsResumeModalOpen(false)} className="w-10 h-10 bg-white border border-gray-200 hover:bg-gray-100 hover:text-red-500 rounded-full flex items-center justify-center text-gray-500 transition-colors shadow-sm">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Content - File Preview */}
            <div className="flex-1 bg-gray-100/50 relative overflow-hidden rounded-b-3xl">
              {uploadedFileUrl ? (
                uploadedFileType === 'application/pdf' ? (
                  <iframe src={`${uploadedFileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="w-full h-full border-none rounded-b-3xl" title="Resume Preview" style={{ scrollBehavior: 'smooth' }} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                     <FileText size={64} className="mb-4 text-blue-300" />
                     <p className="text-lg font-bold text-gray-700">DOCX preview is not supported directly in the browser.</p>
                     <p className="text-sm font-medium text-gray-500 mt-2">Please upload a PDF if you want a live preview of your original file.</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText size={64} className="mb-4 text-gray-300" />
                  <p className="text-lg font-bold text-gray-700">Original file not found in current session.</p>
                  <p className="text-sm font-medium text-gray-500 mt-2">Please re-upload your resume to view the original file preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

function UploadIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
  );
}

export default HomeResumeAnalyzer
