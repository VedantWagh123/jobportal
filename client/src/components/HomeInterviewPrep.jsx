import React, { useState, useEffect } from 'react'
import { GraduationCap, ArrowRight, Mic, Code2, TrendingUp, FileCheck2, BookOpen, Award, CheckCircle2, Lightbulb, Check, PlayCircle, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import hero_girl from '../assets/hero_girl.png'

const BASE_TEXT = "Learn. Practice. ";
const ROTATING_WORDS = ["Grow.", "Excel.", "Succeed."];

const HomeInterviewPrep = () => {
  const navigate = useNavigate();
  
  // Continuous Typewriter Effect State
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBaseTyped, setIsBaseTyped] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    let timeout;
    
    if (!isBaseTyped) {
      if (displayedText.length < BASE_TEXT.length) {
        timeout = setTimeout(() => {
          setDisplayedText(BASE_TEXT.slice(0, displayedText.length + 1));
        }, 90);
      } else {
        timeout = setTimeout(() => setIsBaseTyped(true), 200);
      }
      return () => clearTimeout(timeout);
    }

    const currentWord = ROTATING_WORDS[wordIndex];
    const currentFullText = BASE_TEXT + currentWord;

    if (isDeleting) {
      if (displayedText.length > BASE_TEXT.length) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50); // fast deletion
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      }
    } else {
      if (displayedText.length < currentFullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, 120); // normal typing
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2500); // pause at end of word
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, isBaseTyped, wordIndex]);

  const part1 = displayedText.slice(0, 16); // "Learn. Practice."
  const showBr = displayedText.length >= 17; // After the space
  const part2 = displayedText.length > 17 ? displayedText.slice(17) : ''; // Rotating word

  return (
    <section className="relative w-full bg-white py-12 md:py-16 overflow-hidden border-b border-gray-100 z-0 group/section">
      
      {/* Background Decorative Abstract Waves & Patterns matching the reference */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Soft yellow glow on the far left */}
        <div className="absolute -left-[10%] top-[0%] w-[45%] h-[80%] rounded-full bg-gradient-to-r from-[#fffbeb] to-transparent blur-[100px]"></div>
        {/* Subtle dot pattern on the left */}
        <div className="absolute top-20 left-20 w-40 h-40 opacity-40" style={{ backgroundImage: 'radial-gradient(#e5e7eb 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
      </div>

      <div className="w-full max-w-[1550px] px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
        
        {/* Floating Decorative Elements Top Right */}
        <div className="absolute -top-4 right-8 lg:right-16 hidden lg:flex flex-col items-end rotate-1 z-10 opacity-90 animate-[float_4s_ease-in-out_infinite]">
          <p className="text-[14px] font-black text-gray-500 leading-tight tracking-tight">Better Skills</p>
          <p className="text-[14px] font-black text-gray-500 leading-tight tracking-tight">Brighter Futures</p>
          <svg className="mt-1" width="60" height="10" viewBox="0 0 60 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 8C15 2.5 35 1 58 4" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Main Flex Layout */}
        <div className="flex flex-col xl:flex-row items-center gap-10 xl:gap-14 w-full">
          
          {/* Left Column - Intro */}
          <div className="w-full xl:w-[350px] flex flex-col items-start shrink-0 relative">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] text-amber-700 font-bold text-[11px] mb-6 shadow-sm border border-amber-200/50">
              <GraduationCap size={13} strokeWidth={2.5} /> Interview Prep & Upskilling
            </div>

            {/* Heading with Typewriter and Squiggly lines */}
            <div className="relative">
              {/* Floating yellow sparks (left of Grow) */}
              <div className="absolute bottom-8 -left-8 text-yellow-400 opacity-80 pointer-events-none hidden sm:block animate-[pulse_3s_infinite]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 12h-2M19 12h2M12 5v-2M12 19v2M7.5 7.5l-1.5-1.5M16.5 16.5l1.5 1.5M7.5 16.5l-1.5 1.5M16.5 7.5l1.5-1.5" className="scale-50 origin-center"/>
                </svg>
              </div>

              <h2 className="text-[42px] lg:text-[56px] font-black text-[#0f172a] leading-[1.05] mb-5 tracking-[-0.03em] min-h-[95px] lg:min-h-[120px] relative z-10">
                {part1}
                {showBr && <br/>}
                <span className="relative inline-block">
                  <span className="text-[#d97706] relative z-10">{part2}</span>
                  {part2 && (
                    <svg className="absolute -bottom-1 lg:-bottom-2 left-0 w-full h-3 z-0 text-[#facc15] animate-[dash_1s_ease-out_forwards]" viewBox="0 0 100 20" preserveAspectRatio="none" strokeDasharray="100" strokeDashoffset="0">
                      <path d="M0 15 Q 25 5, 50 15 T 100 15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className="inline-block w-[3px] h-[34px] lg:h-[48px] bg-[#d97706] animate-pulse align-middle ml-1 -mt-2"></span>
              </h2>
            </div>
            
            <p className="text-[14px] lg:text-[15px] font-medium text-gray-500 mb-8 leading-relaxed max-w-[310px]">
              Get job-ready with expert resources, mock interviews and in-demand skills.
            </p>

            <button onClick={() => navigate('/resources')} className="bg-[#facc15] hover:bg-[#eab308] text-gray-900 font-extrabold text-[15px] px-8 py-3.5 rounded-full shadow-[0_4px_14px_rgba(250,204,21,0.4)] transition-all flex items-center justify-center gap-2 mb-10 transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(250,204,21,0.5)]">
              Explore All Resources <ArrowRight size={18} strokeWidth={3} />
            </button>

            {/* Compact Stats Grid matching image exactly */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-6 w-full mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0 shadow-sm">
                  <BookOpen size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[15px] font-black text-gray-900 leading-none mb-1">50+</p>
                  <p className="text-[11px] font-semibold text-gray-500 leading-none">Courses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e0e7ff] text-[#4f46e5] flex items-center justify-center shrink-0 shadow-sm">
                  <PlayCircle size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[15px] font-black text-gray-900 leading-none mb-1">1000+</p>
                  <p className="text-[11px] font-semibold text-gray-500 leading-none">Practice Qs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0 shadow-sm">
                  <Award size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[15px] font-black text-gray-900 leading-none mb-1">Expert</p>
                  <p className="text-[11px] font-semibold text-gray-500 leading-none">Guidance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[15px] font-black text-gray-900 leading-none mb-1">Career</p>
                  <p className="text-[11px] font-semibold text-gray-500 leading-none">Growth</p>
                </div>
              </div>
            </div>

            {/* Quote with accent line */}
            <div className="flex items-start gap-2 pt-2 w-full border-t border-gray-100/50">
              <span className="text-amber-400 text-[28px] font-serif font-black leading-none mt-1">"</span>
              <div className="flex items-center gap-3 pt-1">
                <p className="text-[13px] font-bold text-gray-500 italic">Skills today. A brighter tomorrow.</p>
                <div className="w-8 h-[1.5px] bg-amber-200 mt-1"></div>
              </div>
            </div>

          </div>

          {/* Right Column - 4 Cards Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 xl:gap-5 perspective-1000">
            
            {/* Card 1: Mock Interviews */}
            <div className="bg-white rounded-[28px] p-4 xl:p-5 border border-gray-100 flex flex-col group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer" onClick={() => navigate('/mock-interviews')}>
              <div className="w-full h-[140px] bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] rounded-[20px] mb-5 flex items-end justify-center relative overflow-hidden">
                <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm z-10 group-hover:rotate-12 transition-transform duration-300"><Mic size={16} strokeWidth={2.5}/></div>
                <img src={hero_girl} className="w-[85%] h-auto object-contain object-bottom group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 ease-out" alt="Mock Interviews" />
                <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-[9px] font-extrabold text-gray-900 shadow-sm z-10 group-hover:-translate-y-1 transition-transform duration-300">Practice with AI</div>
              </div>
              <h3 className="text-[16px] font-black text-gray-900 mb-2 leading-tight">Mock Interviews</h3>
              <p className="text-[12px] font-semibold text-gray-500 mb-6 leading-snug">Practice real interview questions with AI and get instant feedback.</p>
              
              <div className="space-y-2.5 mb-8 flex-1">
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-red-500 shrink-0"/> AI-powered interviews</p>
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-red-500 shrink-0"/> Real-time feedback</p>
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-red-500 shrink-0"/> Industry-specific Qs</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="text-[13px] font-black text-red-500">Start Practicing</span>
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <ArrowRight size={14} strokeWidth={3}/>
                </div>
              </div>
            </div>

            {/* Card 2: Technical Q&A */}
            <div className="bg-white rounded-[28px] p-4 xl:p-5 border border-gray-100 flex flex-col group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer" onClick={() => navigate('/qa')}>
              <div className="w-full h-[140px] bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff] rounded-[20px] mb-5 flex items-end justify-center relative overflow-hidden">
                {/* Floating decor */}
                <div className="absolute top-10 right-4 text-blue-400 group-hover:animate-ping opacity-60"><Sparkles size={12}/></div>
                <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm z-10 group-hover:rotate-12 transition-transform duration-300"><Code2 size={16} strokeWidth={2.5}/></div>
                <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=400" className="w-[100%] h-[150%] object-cover object-top mix-blend-multiply opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 ease-out" alt="Technical Q&A" />
                <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-[9px] font-extrabold text-gray-900 shadow-sm z-10 group-hover:-translate-y-1 transition-transform duration-300">Ask Anything</div>
              </div>
              <h3 className="text-[16px] font-black text-gray-900 mb-2 leading-tight">Technical Q&A</h3>
              <p className="text-[12px] font-semibold text-gray-500 mb-6 leading-snug">Explore company-wise and role-wise technical questions.</p>
              
              <div className="space-y-2.5 mb-8 flex-1">
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-blue-500 shrink-0"/> Company-wise questions</p>
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-blue-500 shrink-0"/> Role-based preparation</p>
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-blue-500 shrink-0"/> Detailed explanations</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="text-[13px] font-black text-blue-600">Browse Questions</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <ArrowRight size={14} strokeWidth={3}/>
                </div>
              </div>
            </div>

            {/* Card 3: Skill Development */}
            <div className="bg-white rounded-[28px] p-4 xl:p-5 border border-gray-100 flex flex-col group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer" onClick={() => navigate('/courses')}>
              <div className="w-full h-[140px] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] rounded-[20px] mb-5 flex items-center justify-center relative overflow-hidden">
                 {/* Floating decor */}
                 <div className="absolute bottom-6 right-6 text-green-500 group-hover:rotate-180 transition-transform duration-700 opacity-60"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5v14"/></svg></div>
                <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm z-10 group-hover:rotate-12 transition-transform duration-300"><TrendingUp size={16} strokeWidth={2.5}/></div>
                
                {/* CSS Stack of Books with fanning out animation */}
                <div className="relative flex flex-col gap-[3px] transform rotate-[-12deg] group-hover:rotate-[-5deg] transition-all duration-500 ease-out z-0 ml-2 mt-2">
                  <div className="w-[100px] h-[22px] bg-[#1f2937] rounded-md shadow-md border-l-4 border-[#facc15] flex items-center px-2 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-500">
                    <span className="text-[9px] font-extrabold text-white">Python Mastery</span>
                  </div>
                  <div className="w-[105px] h-[22px] bg-[#374151] rounded-md shadow-md border-l-4 border-[#60a5fa] flex items-center px-2 -translate-x-1 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-500 delay-75">
                    <span className="text-[9px] font-extrabold text-white">Data Science</span>
                  </div>
                  <div className="w-[110px] h-[22px] bg-[#111827] rounded-md shadow-md border-l-4 border-[#34d399] flex items-center px-2 -translate-x-2 transition-transform duration-500 delay-100">
                    <span className="text-[9px] font-extrabold text-white">Web Development</span>
                  </div>
                  <div className="w-[95px] h-[22px] bg-[#4b5563] rounded-md shadow-md border-l-4 border-[#fb923c] flex items-center px-2 translate-x-1 group-hover:translate-y-1 group-hover:-translate-x-1 transition-transform duration-500 delay-150">
                    <span className="text-[9px] font-extrabold text-white">Cloud (AWS)</span>
                  </div>
                </div>
                
                <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-[9px] font-extrabold text-gray-900 shadow-sm z-10 group-hover:-translate-y-1 transition-transform duration-300">In-Demand Skills</div>
              </div>
              <h3 className="text-[16px] font-black text-gray-900 mb-2 leading-tight">Skill Development</h3>
              <p className="text-[12px] font-semibold text-gray-500 mb-6 leading-snug">Learn industry-relevant skills with curated top courses.</p>
              
              <div className="space-y-2.5 mb-8 flex-1">
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> Curated learning paths</p>
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> Top-rated courses</p>
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> Certificates & practice</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="text-[13px] font-black text-emerald-600">View Courses</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <ArrowRight size={14} strokeWidth={3}/>
                </div>
              </div>
            </div>

            {/* Card 4: Resume Tips */}
            <div className="bg-white rounded-[28px] p-4 xl:p-5 border border-gray-100 flex flex-col group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer" onClick={() => navigate('/tips')}>
              <div className="w-full h-[140px] bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff] rounded-[20px] mb-5 flex items-center justify-center relative overflow-hidden">
                 {/* Floating decor */}
                 <div className="absolute top-12 right-8 text-purple-400 opacity-50 group-hover:-translate-y-2 group-hover:opacity-100 transition-all duration-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L15 9l7 1-5 5 1.5 7.5L12 19l-6.5 3.5L7 15l-5-5 7-1z" strokeLinejoin="round"/></svg></div>
                <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm z-10 group-hover:rotate-12 transition-transform duration-300"><FileCheck2 size={16} strokeWidth={2.5}/></div>
                
                {/* CSS Resume Document with levitation */}
                <div className="relative group-hover:-translate-y-3 transition-transform duration-500 ease-out mt-2">
                  <div className="w-[75px] h-[105px] bg-white rounded-xl shadow-md border border-gray-100 flex flex-col p-3 gap-2 transform rotate-2 relative z-0">
                    <div className="w-6 h-6 bg-gray-100 rounded-full mb-1"></div>
                    <div className="w-full h-[3px] bg-gray-100 rounded-sm"></div>
                    <div className="w-[85%] h-[3px] bg-gray-100 rounded-sm"></div>
                    <div className="w-[90%] h-[3px] bg-gray-100 rounded-sm mt-1.5"></div>
                    <div className="w-[65%] h-[3px] bg-gray-100 rounded-sm"></div>
                  </div>
                  <div className="absolute -bottom-2 -right-3 w-8 h-8 bg-emerald-500 rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-md z-10 group-hover:scale-110 transition-transform duration-300 delay-100">
                    <Check size={16} strokeWidth={3}/>
                  </div>
                </div>

                <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-[9px] font-extrabold text-gray-900 shadow-sm z-10 group-hover:-translate-y-1 transition-transform duration-300">Get Hired Faster</div>
              </div>
              <h3 className="text-[16px] font-black text-gray-900 mb-2 leading-tight">Resume & Career Tips</h3>
              <p className="text-[12px] font-semibold text-gray-500 mb-6 leading-snug">Get expert tips to build a strong profile and crack interviews.</p>
              
              <div className="space-y-2.5 mb-8 flex-1">
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-purple-500 shrink-0"/> ATS-friendly resume tips</p>
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-purple-500 shrink-0"/> Career guidance</p>
                <p className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600"><CheckCircle2 size={16} className="text-purple-500 shrink-0"/> Interview success strategies</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="text-[13px] font-black text-purple-600">Read Tips</span>
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                  <ArrowRight size={14} strokeWidth={3}/>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 bg-[#fffdf0] border border-amber-200/60 rounded-2xl p-4 lg:py-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm group/banner relative overflow-hidden">
          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/banner:animate-[shimmer_1.5s_infinite]"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
              <Lightbulb size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[14px] text-gray-900 flex flex-col md:flex-row md:items-center md:gap-2 leading-snug">
                <span className="font-black">Invest in your skills. Invest in your future.</span>
                <span className="hidden md:inline text-gray-300 font-bold">|</span>
                <span className="text-[12px] font-bold text-gray-500 mt-0.5 md:mt-0">Access top-rated courses, earn certificates, and get closer to your dream job.</span>
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/resources')} className="shrink-0 w-full md:w-auto bg-white border-2 border-amber-200 hover:border-amber-400 text-amber-700 font-black text-[13px] px-6 py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm relative z-10">
            Explore Learning Paths <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>

      </div>
    </section>
  )
}

export default HomeInterviewPrep
