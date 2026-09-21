import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
    Briefcase, Users, Search, FileText, BarChart2, 
    ArrowRight, CheckCircle2, ChevronRight, Zap, 
    Check, ArrowRight as ArrowRightIcon, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmployerCTA = () => {
    const { companyToken } = useContext(AppContext);
    const navigate = useNavigate();
    const handleStartHiring = () => {
        if (companyToken) {
            navigate('/dashboard');
        } else {
            navigate('/employer-auth');
        }
    };

    // Animation variants for typing arm
    const typingAnimation = {
        animate: {
            rotate: [-12, -8, -12, -15, -12],
            transition: {
                repeat: Infinity,
                duration: 0.6,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section className="w-full relative overflow-hidden bg-white pb-20 pt-10 font-sans">
            
            {/* Top Main Section Container - Increased width to leave very little space on sides */}
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto">
                <div className="relative bg-[#f8fafc] rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-100 shadow-[0_4px_40px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col lg:flex-row items-center p-8 sm:p-12 lg:p-16 mb-16">
                    
                    {/* Handwritten Texts & Arrows */}
                    <div className="absolute top-10 left-[40%] hidden xl:flex flex-col items-center opacity-80 pointer-events-none z-20">
                        <p className="text-[#3b82f6] text-sm font-medium transform -rotate-6 mb-1" style={{fontFamily: 'cursive'}}>Great teams<br/>build better tomorrows</p>
                        <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="transform -scale-x-100 rotate-12">
                            <path d="M10 35 Q 30 10 55 5" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none"/>
                            <path d="M48 2 L 57 4 L 52 12" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                    </div>
                    
                    <div className="absolute top-16 right-16 hidden xl:flex flex-col items-center opacity-80 pointer-events-none z-20">
                        <p className="text-[#3b82f6] text-sm font-medium transform -rotate-6 mb-1" style={{fontFamily: 'cursive'}}>The right people<br/>create the biggest impact.</p>
                        <svg width="40" height="30" viewBox="0 0 40 30" fill="none" className="ml-10">
                            <path d="M5 5 Q 20 15 35 25" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" fill="none"/>
                            <path d="M28 26 L 37 26 L 34 18" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                    </div>

                    {/* Left Content */}
                    <div className="relative z-20 w-full lg:w-[50%] flex flex-col items-start pr-0 lg:pr-8">
                        
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-[#1d4ed8] mb-8 font-bold text-xs tracking-wide">
                            <Briefcase size={14} />
                            FOR EMPLOYERS
                        </div>
                        
                        {/* Heading */}
                        <h2 className="text-[36px] sm:text-[46px] lg:text-[54px] font-extrabold text-[#0f172a] leading-[1.1] tracking-tight mb-5">
                            Hire the right talent. <br className="hidden sm:block" />
                            Build your next <span className="text-[#2563eb]">great team.</span>
                        </h2>
                        
                        {/* Subtitle */}
                        <p className="text-[#475569] text-base sm:text-lg font-medium mb-10 max-w-lg leading-relaxed">
                            Connect with skilled candidates, discover relevant talent faster, and manage your hiring journey from one place.
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6 mb-10">
                            {/* Feature 1 */}
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <Users size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-[#0f172a] font-bold text-[13px] mb-1">AI-powered candidate matching</h4>
                                    <p className="text-[#64748b] text-[11px] font-medium leading-relaxed">Find the best talent with intelligent recommendations.</p>
                                </div>
                            </div>
                            {/* Feature 2 */}
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <Search size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-[#0f172a] font-bold text-[13px] mb-1">Search & discover relevant talent</h4>
                                    <p className="text-[#64748b] text-[11px] font-medium leading-relaxed">Use advanced filters to find the right fit, faster.</p>
                                </div>
                            </div>
                            {/* Feature 3 */}
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                                    <FileText size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-[#0f172a] font-bold text-[13px] mb-1">Post and manage job openings</h4>
                                    <p className="text-[#64748b] text-[11px] font-medium leading-relaxed">Create job listings and reach qualified candidates.</p>
                                </div>
                            </div>
                            {/* Feature 4 */}
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <BarChart2 size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="text-[#0f172a] font-bold text-[13px] mb-1">Track applications from one dashboard</h4>
                                    <p className="text-[#64748b] text-[11px] font-medium leading-relaxed">Manage candidates, interviews and hiring progress easily.</p>
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6">
                            <button 
                                onClick={handleStartHiring}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1d4ed8] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-[#1e40af] transition-all"
                            >
                                Start Hiring <ArrowRight size={16} />
                            </button>
                            <button 
                                onClick={handleStartHiring}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent border-2 border-blue-200 text-[#1d4ed8] rounded-xl text-sm font-bold hover:bg-blue-50 transition-all"
                            >
                                Explore Employer Portal
                            </button>
                        </div>
                        
                        {/* Trust Text */}
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <div className="bg-emerald-500 rounded-full text-white p-0.5"><CheckCircle2 size={12} strokeWidth={3} /></div>
                            <span className="text-[#64748b] font-medium">Trusted by growing businesses to build high-performing teams.</span>
                        </div>
                    </div>

                    {/* Right Visual (Advanced Animated CSS Illustration) */}
                    <div className="relative z-10 w-full lg:w-[50%] h-[450px] lg:h-[550px] mt-16 lg:mt-0 flex justify-center items-center">
                        
                        {/* Dotted curve decoration behind */}
                        <svg className="absolute -left-10 top-20 w-32 h-32 opacity-30" viewBox="0 0 100 100">
                            <path d="M10,90 Q10,10 90,10" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 6"/>
                            <polygon points="85,5 95,10 85,15" fill="#3b82f6" />
                        </svg>

                        {/* LAPTOP AND PERSON GROUP */}
                        <div className="group relative w-full max-w-[450px] h-[350px] flex items-end justify-center">
                            
                            {/* Person Silhouette (Back view) */}
                            <div className="absolute right-0 bottom-4 w-[200px] h-[250px] z-30 pointer-events-none drop-shadow-2xl flex flex-col items-center">
                                <style>{`
                                    .anim-head {
                                        animation: headAnim 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                                    }
                                    @keyframes headAnim {
                                        0%, 3% { transform: rotate(0deg); }
                                        6%, 15% { transform: rotate(-2deg); }
                                        17%, 32% { transform: rotate(-4deg); }
                                        35%, 44% { transform: rotate(2deg); }
                                        47%, 52% { transform: rotate(-5deg); }
                                        55%, 63% { transform: rotate(-1deg); }
                                        65%, 69% { transform: rotate(-3deg); }
                                        73%, 78% { transform: rotate(0deg); }
                                        83%, 91% { transform: rotate(-6deg); }
                                        95%, 100% { transform: rotate(0deg); }
                                    }
                                    .anim-arm {
                                        animation: armAnim 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                                        transform-origin: right center;
                                    }
                                    @keyframes armAnim {
                                        0%, 3% { transform: rotate(-5deg); }
                                        6%, 9% { transform: rotate(-15deg); }
                                        10% { transform: rotate(-17deg); }
                                        12%, 15% { transform: rotate(-15deg); }
                                        17%, 20% { transform: rotate(-18deg); }
                                        23%, 26% { transform: rotate(-18deg); }
                                        27% { transform: rotate(-20deg); }
                                        29%, 32% { transform: rotate(-18deg); }
                                        35%, 38% { transform: rotate(-8deg); }
                                        39% { transform: rotate(-10deg); }
                                        41%, 44% { transform: rotate(-8deg); }
                                        47%, 49% { transform: rotate(-20deg); }
                                        50% { transform: rotate(-22deg); }
                                        51%, 52% { transform: rotate(-20deg); }
                                        55%, 58% { transform: rotate(-12deg); }
                                        59% { transform: rotate(-14deg); }
                                        61%, 63% { transform: rotate(-12deg); }
                                        65%, 66% { transform: rotate(-15deg); }
                                        67% { transform: rotate(-17deg); }
                                        68%, 69% { transform: rotate(-15deg); }
                                        73%, 78% { transform: rotate(-12deg); }
                                        83%, 86% { transform: rotate(-22deg); }
                                        87% { transform: rotate(-24deg); }
                                        88%, 91% { transform: rotate(-22deg); }
                                        95%, 100% { transform: rotate(-5deg); }
                                    }
                                    .anim-body {
                                        animation: bodyAnim 15s ease-in-out infinite;
                                        transform-origin: bottom center;
                                    }
                                    @keyframes bodyAnim {
                                        0%, 15% { transform: scaleY(1) rotate(0deg); }
                                        20%, 35% { transform: scaleY(1.02) scaleX(0.99) rotate(1deg); }
                                        40%, 60% { transform: scaleY(0.98) scaleX(1.01) rotate(-1deg); }
                                        65%, 85% { transform: scaleY(1.01) scaleX(0.99) rotate(0.5deg); }
                                        95%, 100% { transform: scaleY(1) rotate(0deg); }
                                    }
                                    .anim-head:hover {
                                        animation: shakeNo 0.4s ease-in-out infinite !important;
                                    }
                                    @keyframes shakeNo {
                                        0%, 100% { transform: rotate(0deg); }
                                        25% { transform: rotate(-12deg); }
                                        75% { transform: rotate(12deg); }
                                    }
                                    
                                    /* Smooth Focused Hover Effects */
                                    .group:hover .anim-arm {
                                        animation: armFocus 2s infinite ease-in-out !important;
                                    }
                                    @keyframes armFocus {
                                        0% { transform: rotate(-10deg); }
                                        25% { transform: rotate(-16deg) scaleY(0.98); }
                                        50% { transform: rotate(-12deg); }
                                        75% { transform: rotate(-18deg) scaleY(0.98); }
                                        100% { transform: rotate(-10deg); }
                                    }
                                    
                                    /* Speed up the 15s loops to 7.5s when hovered */
                                    .group:hover .anim-head:not(:hover),
                                    .group:hover .anim-body,
                                    .group:hover .anim-cursor,
                                    .group:hover .anim-click-ripple,
                                    .group:hover .anim-screen0,
                                    .group:hover .anim-screen1,
                                    .group:hover .anim-screen2,
                                    .group:hover .anim-screen3,
                                    .group:hover .anim-screen4,
                                    .group:hover .nav-overview,
                                    .group:hover .nav-pipeline,
                                    .group:hover .nav-analytics,
                                    .group:hover .nav-indicator,
                                    .group:hover .prof-skel-1,
                                    .group:hover .prof-skel-2,
                                    .group:hover .prof-skel-3,
                                    .group:hover .pipe-skel,
                                    .group:hover .chart-bar-1,
                                    .group:hover .chart-bar-2,
                                    .group:hover .chart-bar-3,
                                    .group:hover .chart-bar-4,
                                    .group:hover .chart-tooltip {
                                        animation-duration: 7.5s !important;
                                    }
                                    
                                    .sweat-drop {
                                        opacity: 0;
                                        transition: opacity 0.5s;
                                    }
                                    .group:hover .sweat-drop {
                                        opacity: 1;
                                    }
                                    .group:hover .sweat-1 { animation: sweatAnim 1.2s infinite ease-in; }
                                    .group:hover .sweat-2 { animation: sweatAnim 1s infinite ease-in 0.4s; }
                                    
                                    @keyframes sweatAnim {
                                        0% { transform: translateY(0) scale(0.5) rotate(-45deg); opacity: 0; }
                                        20% { transform: translateY(8px) scale(1) rotate(-45deg); opacity: 1; }
                                        80% { transform: translateY(25px) scale(1) rotate(-45deg); opacity: 1; }
                                        100% { transform: translateY(30px) scale(0.5) rotate(-45deg); opacity: 0; }
                                    }
                                `}</style>
                                {/* Head/Hair */}
                                <div className="w-[85px] h-[95px] bg-[#1e293b] rounded-t-[40px] rounded-b-[30px] relative z-20 shadow-inner origin-bottom anim-head pointer-events-auto cursor-pointer">
                                    <div className="absolute top-2 -left-1 w-4 h-4 bg-[#1e293b] rounded-full"></div>
                                    <div className="absolute top-1 -right-1 w-6 h-6 bg-[#1e293b] rounded-full"></div>
                                    <div className="absolute top-5 -right-3 w-4 h-6 bg-amber-100 rounded-l-none rounded-r-lg"></div> {/* Ear */}
                                    
                                    {/* Sweat Drops */}
                                    <div className="absolute top-2 -right-5 w-2 h-3 bg-cyan-300 rounded-b-full rounded-tl-full sweat-drop sweat-1 z-30 drop-shadow-sm"></div>
                                    <div className="absolute top-8 -right-7 w-1.5 h-2.5 bg-cyan-300 rounded-b-full rounded-tl-full sweat-drop sweat-2 z-30 drop-shadow-sm"></div>
                                </div>
                                {/* Neck */}
                                <div className="w-10 h-10 bg-amber-100 -mt-4 z-10 shadow-inner"></div>
                                {/* Body/Shirt */}
                                <div className="w-[180px] h-[150px] bg-[#2563eb] rounded-t-[60px] -mt-2 z-20 flex justify-between shadow-xl anim-body">
                                    <div className="w-16 h-full bg-[#1d4ed8] rounded-tl-[60px]"></div> {/* Arm shading */}
                                    {/* Animated Arm reaching to laptop */}
                                    <div className="absolute bottom-4 left-[-20px] w-24 h-12 bg-[#2563eb] rounded-l-full z-30 anim-arm">
                                        {/* Hand */}
                                        <div className="absolute top-2 -left-6 w-8 h-8 bg-amber-100 rounded-full"></div>
                                    </div>
                                </div>
                                {/* Chair back */}
                                <div className="absolute -bottom-4 right-8 w-[140px] h-[120px] bg-[#334155] rounded-t-[40px] z-10 shadow-lg"></div>
                            </div>

                            {/* The Laptop */}
                            <div className="absolute bottom-4 left-4 w-[280px] sm:w-[340px] h-[200px] bg-[#1e293b] rounded-t-2xl p-2 shadow-2xl z-20 overflow-hidden">
                                {/* Screen */}
                                <div className="w-full h-full bg-white rounded-xl overflow-hidden flex flex-col border-2 border-[#cbd5e1] relative">
                                    {/* Browser Bar */}
                                    <div className="absolute top-0 left-0 w-full h-5 bg-[#f1f5f9] flex items-center px-3 gap-1 border-b border-[#e2e8f0] shrink-0 z-20">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    </div>
                                    {/* App Content */}
                                    <div className="flex-1 bg-[#f8fafc] overflow-hidden relative mt-5" style={{ perspective: '800px' }}>
                                        <style>{`
                                          .anim-cursor {
                                            animation: cursorAnim 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                                            pointer-events: none;
                                            z-index: 100;
                                          }
                                          @keyframes cursorAnim {
                                            0%, 3% { transform: translate(250px, 150px); }
                                            6%, 9% { transform: translate(140px, 70px); }
                                            10% { transform: translate(140px, 70px) scale(0.85); }
                                            12%, 15% { transform: translate(140px, 70px) scale(1); }
                                            
                                            17%, 20% { transform: translate(120px, 55px); }
                                            23%, 26% { transform: translate(120px, 90px); }
                                            27% { transform: translate(120px, 90px) scale(0.85); }
                                            29%, 32% { transform: translate(120px, 90px) scale(1); }
                                            
                                            35%, 38% { transform: translate(250px, 60px); }
                                            39% { transform: translate(250px, 60px) scale(0.85); }
                                            41%, 44% { transform: translate(250px, 60px) scale(1); }
                                            
                                            47%, 49% { transform: translate(100px, 10px); }
                                            50% { transform: translate(100px, 10px) scale(0.85); }
                                            51%, 52% { transform: translate(100px, 10px) scale(1); }
                                            
                                            55%, 58% { transform: translate(180px, 80px); }
                                            59% { transform: translate(180px, 80px) scale(0.85); }
                                            61%, 63% { transform: translate(180px, 80px) scale(1); }
                                            
                                            65%, 66% { transform: translate(150px, 10px); }
                                            67% { transform: translate(150px, 10px) scale(0.85); }
                                            68%, 69% { transform: translate(150px, 10px) scale(1); }
                                            
                                            73%, 78% { transform: translate(160px, 85px); }
                                            
                                            83%, 86% { transform: translate(45px, 10px); }
                                            87% { transform: translate(45px, 10px) scale(0.85); }
                                            88%, 91% { transform: translate(45px, 10px) scale(1); }
                                            
                                            95%, 100% { transform: translate(250px, 150px); }
                                          }
                                          
                                          .anim-click-ripple { animation: clickRipple 15s infinite; opacity: 0; }
                                          @keyframes clickRipple {
                                            0%, 9.5% { opacity: 0; transform: scale(0.5); }
                                            10% { opacity: 0.5; transform: scale(1); }
                                            11.5%, 26.5% { opacity: 0; transform: scale(2.5); }
                                            27% { opacity: 0.5; transform: scale(1); }
                                            28.5%, 38.5% { opacity: 0; transform: scale(2.5); }
                                            39% { opacity: 0.5; transform: scale(1); }
                                            40.5%, 49.5% { opacity: 0; transform: scale(2.5); }
                                            50% { opacity: 0.5; transform: scale(1); }
                                            51.5%, 58.5% { opacity: 0; transform: scale(2.5); }
                                            59% { opacity: 0.5; transform: scale(1); }
                                            60.5%, 66.5% { opacity: 0; transform: scale(2.5); }
                                            67% { opacity: 0.5; transform: scale(1); }
                                            68.5%, 86.5% { opacity: 0; transform: scale(2.5); }
                                            87% { opacity: 0.5; transform: scale(1); }
                                            88.5%, 100% { opacity: 0; transform: scale(2.5); }
                                          }

                                          .anim-screen0 { animation: screen0 15s infinite; }
                                          @keyframes screen0 { 
                                            0%, 11.5% { opacity: 1; visibility: visible; }
                                            12.5%, 88.5% { opacity: 0; visibility: hidden; }
                                            89.5%, 100% { opacity: 1; visibility: visible; }
                                          }
                                          .anim-screen1 { animation: screen1 15s infinite; opacity: 0; visibility: hidden; }
                                          @keyframes screen1 {
                                            0%, 11.5% { opacity: 0; visibility: hidden; }
                                            12.5%, 28.5% { opacity: 1; visibility: visible; }
                                            29.5%, 100% { opacity: 0; visibility: hidden; }
                                          }
                                          .anim-screen2 { animation: screen2 15s infinite; opacity: 0; visibility: hidden; }
                                          @keyframes screen2 {
                                            0%, 28.5% { opacity: 0; visibility: hidden; }
                                            29.5%, 49.5% { opacity: 1; visibility: visible; }
                                            50.5%, 100% { opacity: 0; visibility: hidden; }
                                          }
                                          .anim-screen3 { animation: screen3 15s infinite; opacity: 0; visibility: hidden; }
                                          @keyframes screen3 {
                                            0%, 49.5% { opacity: 0; visibility: hidden; }
                                            50.5%, 66.5% { opacity: 1; visibility: visible; }
                                            67.5%, 100% { opacity: 0; visibility: hidden; }
                                          }
                                          .anim-screen4 { animation: screen4 15s infinite; opacity: 0; visibility: hidden; }
                                          @keyframes screen4 {
                                            0%, 66.5% { opacity: 0; visibility: hidden; }
                                            67.5%, 88.5% { opacity: 1; visibility: visible; }
                                            89.5%, 100% { opacity: 0; visibility: hidden; }
                                          }

                                          .nav-overview { animation: navOverview 15s infinite; }
                                          @keyframes navOverview { 
                                            0%, 12.5% { color: #0f172a; font-weight: 700; }
                                            13.5%, 88.5% { color: #64748b; font-weight: 500; }
                                            89.5%, 100% { color: #0f172a; font-weight: 700; }
                                          }
                                          .nav-pipeline { animation: navPipeline 15s infinite; }
                                          @keyframes navPipeline { 
                                            0%, 49.5% { color: #64748b; font-weight: 500; }
                                            50.5%, 66.5% { color: #0f172a; font-weight: 700; }
                                            67.5%, 100% { color: #64748b; font-weight: 500; }
                                          }
                                          .nav-analytics { animation: navAnalytics 15s infinite; }
                                          @keyframes navAnalytics { 
                                            0%, 66.5% { color: #64748b; font-weight: 500; }
                                            67.5%, 88.5% { color: #0f172a; font-weight: 700; }
                                            89.5%, 100% { color: #64748b; font-weight: 500; }
                                          }

                                          .anim-job-card { animation: jobCardHover 15s infinite; }
                                          @keyframes jobCardHover {
                                            0%, 5% { background-color: #fff; transform: translateY(0); }
                                            6%, 11% { background-color: #f8fafc; transform: translateY(-1px); border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                                            12%, 100% { background-color: #fff; transform: translateY(0); }
                                          }

                                          .anim-cand-card { animation: candCardHover 15s infinite; }
                                          @keyframes candCardHover {
                                            0%, 22% { background-color: #fff; transform: translateX(0); }
                                            23%, 28% { background-color: #f8fafc; transform: translateX(2px); border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                                            29%, 100% { background-color: #fff; transform: translateX(0); }
                                          }

                                          .anim-hire-btn { animation: hireBtnHover 15s infinite; }
                                          @keyframes hireBtnHover {
                                            0%, 34% { background-color: #2563eb; transform: scale(1); }
                                            35%, 40% { background-color: #1d4ed8; transform: scale(1.05); }
                                            41%, 100% { background-color: #2563eb; transform: scale(1); }
                                          }

                                          .anim-draw-bar1 { animation: drawBar1 15s infinite ease-out; }
                                          @keyframes drawBar1 { 0%, 67% { height: 0%; } 72%, 100% { height: 40%; } }
                                          .anim-draw-bar2 { animation: drawBar2 15s infinite ease-out; }
                                          @keyframes drawBar2 { 0%, 67% { height: 0%; } 73%, 100% { height: 65%; } }
                                          .anim-draw-bar3 { animation: drawBar3 15s infinite ease-out; }
                                          @keyframes drawBar3 { 0%, 67% { height: 0%; } 74%, 100% { height: 90%; } }
                                          .anim-draw-bar4 { animation: drawBar4 15s infinite ease-out; }
                                          @keyframes drawBar4 { 0%, 67% { height: 0%; } 75%, 100% { height: 50%; } }
                                          .anim-draw-bar5 { animation: drawBar5 15s infinite ease-out; }
                                          @keyframes drawBar5 { 0%, 67% { height: 0%; } 76%, 100% { height: 80%; } }

                                          .anim-chart-tooltip { animation: chartTooltip 15s infinite; opacity: 0; }
                                          @keyframes chartTooltip {
                                            0%, 73% { opacity: 0; transform: translateY(5px); }
                                            74%, 78% { opacity: 1; transform: translateY(0); }
                                            79%, 100% { opacity: 0; transform: translateY(5px); }
                                          }
                                        `}</style>
                                        
                                        {/* Cursor */}
                                        <div className="absolute top-0 left-0 anim-cursor" style={{ width: '16px', height: '16px' }}>
                                            <div className="absolute top-[2px] left-[2px] w-6 h-6 bg-black/15 rounded-full anim-click-ripple -translate-x-1/2 -translate-y-1/2 origin-center"></div>
                                            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-4 h-4 drop-shadow-md text-slate-800">
                                                <path d="M1 1L6.5 15L8.5 9.5L14 7.5L1 1Z" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                                            </svg>
                                        </div>

                                        {/* Fake App Top Nav */}
                                        <div className="absolute top-0 left-0 w-full h-[22px] bg-white border-b border-slate-200 flex items-center px-3 gap-4 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                            <div className="text-[7px] text-slate-400 nav-overview transition-colors">Overview</div>
                                            <div className="text-[7px] text-slate-400 nav-pipeline transition-colors">Pipeline</div>
                                            <div className="text-[7px] text-slate-400 nav-analytics transition-colors">Analytics</div>
                                            <div className="ml-auto w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 text-indigo-700 text-[6px] font-bold">HR</div>
                                        </div>

                                        {/* SCREEN 0: Overview/Dashboard */}
                                        <div className="absolute inset-0 pt-7 px-3 pb-2 w-full h-full anim-screen0 bg-[#f8fafc]">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-[8px] font-bold text-slate-700">Active Jobs</h3>
                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[6px] font-bold rounded">12 Active</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="bg-white p-2 rounded border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] anim-job-card transition-all">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-[8px] font-bold text-slate-800">Senior Frontend Dev</h4>
                                                        <span className="text-[6px] text-emerald-600 bg-emerald-50 px-1 rounded font-medium">New Apps</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="flex -space-x-1"><div className="w-3 h-3 bg-slate-200 rounded-full border border-white"></div><div className="w-3 h-3 bg-slate-300 rounded-full border border-white"></div></div>
                                                        <span className="text-[6px] text-slate-400">+14 candidates</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-[8px] font-bold text-slate-800">Product Manager</h4>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="flex -space-x-1"><div className="w-3 h-3 bg-slate-200 rounded-full border border-white"></div></div>
                                                        <span className="text-[6px] text-slate-400">+5 candidates</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SCREEN 1: Candidates List */}
                                        <div className="absolute inset-0 pt-7 px-3 pb-2 w-full h-full anim-screen1 bg-[#f8fafc]">
                                            <div className="flex items-center gap-1 mb-2">
                                                <ChevronRight size={8} className="rotate-180 text-slate-400"/>
                                                <h3 className="text-[8px] font-bold text-slate-700">Sr Frontend Dev <span className="text-slate-400 font-normal">/ Candidates</span></h3>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="bg-white p-1.5 rounded flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <img src="https://i.pravatar.cc/100?img=11" className="w-5 h-5 rounded-full object-cover" alt="cand" />
                                                        <div>
                                                            <div className="w-16 h-1.5 bg-slate-300 rounded mb-0.5"></div>
                                                            <div className="w-10 h-1 bg-slate-200 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[6px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">Match 95%</span>
                                                </div>
                                                <div className="bg-white p-1.5 rounded flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100 anim-cand-card transition-all">
                                                    <div className="flex items-center gap-1.5">
                                                        <img src="https://i.pravatar.cc/100?img=12" className="w-5 h-5 rounded-full object-cover" alt="cand" />
                                                        <div>
                                                            <div className="w-14 h-1.5 bg-slate-700 rounded mb-0.5"></div>
                                                            <div className="w-12 h-1 bg-slate-300 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[6px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">Match 88%</span>
                                                </div>
                                                <div className="bg-white p-1.5 rounded flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100 opacity-50">
                                                    <div className="flex items-center gap-1.5">
                                                        <img src="https://i.pravatar.cc/100?img=13" className="w-5 h-5 rounded-full object-cover" alt="cand" />
                                                        <div>
                                                            <div className="w-16 h-1.5 bg-slate-300 rounded mb-0.5"></div>
                                                            <div className="w-8 h-1 bg-slate-200 rounded"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SCREEN 2: Candidate Profile */}
                                        <div className="absolute inset-0 pt-7 px-3 pb-2 w-full h-full anim-screen2 bg-[#f8fafc]">
                                            <div className="bg-white w-full h-full rounded shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100 p-2.5 flex flex-col">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <img src="https://i.pravatar.cc/100?img=12" className="w-8 h-8 rounded-full object-cover border-2 border-emerald-100" alt="cand" />
                                                    <div>
                                                        <div className="w-20 h-2 bg-slate-800 rounded mb-1"></div>
                                                        <div className="w-12 h-1.5 bg-slate-400 rounded"></div>
                                                    </div>
                                                    <div className="ml-auto px-2 py-1 bg-blue-600 rounded text-white flex items-center justify-center text-[7px] font-bold anim-hire-btn shadow-sm transition-all">
                                                        Hire Now
                                                    </div>
                                                </div>
                                                <div className="w-full h-px bg-slate-100 mb-2"></div>
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[6px] rounded">React</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[6px] rounded">Node.js</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[6px] rounded">TypeScript</span>
                                                </div>
                                                <div className="space-y-1.5 flex-1 mt-1">
                                                    <div className="w-full h-1.5 bg-slate-100 rounded"></div>
                                                    <div className="w-5/6 h-1.5 bg-slate-100 rounded"></div>
                                                    <div className="w-4/6 h-1.5 bg-slate-100 rounded"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SCREEN 3: Hiring Pipeline */}
                                        <div className="absolute inset-0 pt-7 px-3 pb-2 w-full h-full anim-screen3 bg-[#f8fafc]">
                                            <h3 className="text-[8px] font-bold text-slate-700 mb-2 mt-1">Pipeline Progress</h3>
                                            <div className="flex gap-1.5 h-[90%] pb-2">
                                                <div className="flex-1 bg-slate-50/50 rounded border border-slate-100 p-1 flex flex-col gap-1">
                                                    <div className="text-[6px] font-bold text-slate-500 uppercase">Applied</div>
                                                    <div className="w-full h-3 bg-white rounded shadow-sm border border-slate-100"></div>
                                                    <div className="w-full h-3 bg-white rounded shadow-sm border border-slate-100"></div>
                                                </div>
                                                <div className="flex-1 bg-slate-50/50 rounded border border-slate-100 p-1 flex flex-col gap-1">
                                                    <div className="text-[6px] font-bold text-slate-500 uppercase">Interview</div>
                                                    <div className="w-full h-3 bg-white rounded shadow-sm border border-slate-100 border-l-[1.5px] border-l-blue-500"></div>
                                                </div>
                                                <div className="flex-1 bg-slate-50/50 rounded border border-slate-100 p-1 flex flex-col gap-1 relative overflow-visible">
                                                    <div className="text-[6px] font-bold text-slate-500 uppercase">Offer</div>
                                                    <div className="w-full h-3 bg-emerald-50 rounded shadow-sm border border-emerald-200 border-l-[1.5px] border-l-emerald-500 relative z-10 transition-transform hover:-translate-y-0.5"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SCREEN 4: Analytics */}
                                        <div className="absolute inset-0 pt-7 px-3 pb-2 w-full h-full anim-screen4 bg-[#f8fafc]">
                                            <h3 className="text-[8px] font-bold text-slate-700 mb-2 mt-1">Performance Analytics</h3>
                                            <div className="bg-white p-2 rounded shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100 h-[calc(100%-20px)] flex flex-col justify-end relative">
                                                
                                                <div className="absolute top-2 left-2 flex items-center gap-1">
                                                    <div className="text-[12px] font-black text-slate-800">84%</div>
                                                    <div className="text-[6px] text-emerald-500 font-bold bg-emerald-50 px-1 rounded">↑ 12%</div>
                                                </div>

                                                <div className="absolute top-3 right-4 bg-slate-800 text-white text-[6px] px-1.5 py-0.5 rounded anim-chart-tooltip shadow-lg z-20 transition-all">
                                                    24 Hires
                                                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-800 rotate-45"></div>
                                                </div>
                                                
                                                <div className="flex items-end h-14 gap-1.5 px-1 relative z-10">
                                                    <div className="w-full bg-indigo-100 rounded-t anim-draw-bar1"></div>
                                                    <div className="w-full bg-indigo-200 rounded-t anim-draw-bar2"></div>
                                                    <div className="w-full bg-indigo-400 rounded-t anim-draw-bar3"></div>
                                                    <div className="w-full bg-emerald-400 rounded-t anim-draw-bar4"></div>
                                                    <div className="w-full bg-indigo-600 rounded-t anim-draw-bar5"></div>
                                                </div>
                                                <div className="flex justify-between mt-1 border-t border-slate-100 pt-1 px-1">
                                                    <span className="text-[5px] font-medium text-slate-400">Mon</span>
                                                    <span className="text-[5px] font-medium text-slate-400">Tue</span>
                                                    <span className="text-[5px] font-medium text-slate-400">Wed</span>
                                                    <span className="text-[5px] font-medium text-slate-400">Thu</span>
                                                    <span className="text-[5px] font-medium text-slate-400">Fri</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Base */}
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[110%] h-3 bg-[#94a3b8] rounded-b-lg shadow-lg flex justify-center z-10">
                                    <div className="w-1/4 h-1 bg-[#475569] rounded-b-md"></div>
                                </div>
                            </div>

                        </div>

                        {/* Floating Candidate Card (Top Left) */}
                        <motion.div 
                            animate={{ y: [0, -12, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute top-5 sm:top-10 left-0 sm:left-4 bg-white p-3.5 rounded-xl shadow-[0_10px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center gap-3 z-40"
                        >
                            <img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="profile" />
                            <div>
                                <h4 className="text-[#0f172a] text-xs font-bold leading-tight">Product Designer</h4>
                                <p className="text-[#64748b] text-[10px] font-medium mb-1">UI/UX • Figma • React</p>
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-bold rounded">
                                    <Zap size={8} fill="currentColor" /> Top Match
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Action 1: Post a Job */}
                        <motion.div 
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.2 }}
                            className="absolute top-1/3 -left-4 sm:left-0 bg-white p-3 rounded-xl shadow-[0_10px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center gap-3 z-40 w-44"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Briefcase size={14} /></div>
                            <div className="flex-1">
                                <h4 className="text-[#0f172a] text-[11px] font-bold leading-tight mb-0.5">Post a Job</h4>
                                <p className="text-[#64748b] text-[9px] font-medium leading-tight">Reach qualified candidates in minutes.</p>
                            </div>
                            <ArrowRight size={12} className="text-blue-500" />
                        </motion.div>

                        {/* Floating Action 2: Smart Hiring */}
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 0.5 }}
                            className="absolute bottom-32 -left-2 sm:left-4 bg-white p-3 rounded-xl shadow-[0_10px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center gap-3 z-40 w-48"
                        >
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0"><Zap size={14} fill="currentColor" /></div>
                            <div className="flex-1">
                                <h4 className="text-[#0f172a] text-[11px] font-bold leading-tight mb-0.5">Smart Hiring</h4>
                                <p className="text-[#64748b] text-[9px] font-medium leading-tight">AI-powered matching for better decisions.</p>
                            </div>
                        </motion.div>

                        {/* Candidates Column (Right Top) */}
                        <div className="absolute top-16 right-0 sm:-right-4 flex flex-col gap-2.5 z-40">
                            {/* Cand 1 */}
                            <motion.div animate={{ x: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0 }} className="bg-white pl-1.5 pr-3 py-1.5 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-slate-50 flex items-center gap-2">
                                <img src="https://i.pravatar.cc/100?img=8" className="w-6 h-6 rounded-full object-cover" alt="cand" />
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[9px] font-bold text-slate-600">Available</span>
                                </div>
                            </motion.div>
                            {/* Cand 2 */}
                            <motion.div animate={{ x: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }} className="bg-white pl-1.5 pr-3 py-1.5 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-slate-50 flex items-center gap-2 ml-4">
                                <img src="https://i.pravatar.cc/100?img=9" className="w-6 h-6 rounded-full object-cover" alt="cand" />
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[9px] font-bold text-slate-600">Open to Work</span>
                                </div>
                            </motion.div>
                            {/* Cand 3 */}
                            <motion.div animate={{ x: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="bg-white pl-1.5 pr-3 py-1.5 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-slate-50 flex items-center gap-2">
                                <img src="https://i.pravatar.cc/100?img=11" className="w-6 h-6 rounded-full object-cover" alt="cand" />
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[9px] font-bold text-slate-600">Actively Looking</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sticky Note */}
                        <motion.div 
                            animate={{ rotate: [12, 16, 12], y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute bottom-20 right-0 sm:-right-8 w-24 h-24 bg-[#fef08a] shadow-[0_4px_20px_rgb(0,0,0,0.1)] flex flex-col justify-center items-center text-center p-2 z-40 transform rotate-12"
                            style={{ borderRadius: '2px 2px 15px 2px' }}
                        >
                            <p className="text-[#92400e] font-bold text-xs leading-tight" style={{fontFamily: 'cursive'}}>Good<br/>People<br/>Great<br/>Results</p>
                            <Check size={12} strokeWidth={3} className="text-[#92400e] mt-1 ml-6" />
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* Bottom Steps Section */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                    visible: { transition: { staggerChildren: 0.15 } },
                    hidden: {}
                }}
                className="relative w-full flex flex-col items-center justify-center text-center mt-12 mb-8"
            >
                
                {/* Background Wave Shapes mimicking the image */}
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-tr-full opacity-50 z-0 transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 rounded-tr-full opacity-60 z-0 pointer-events-none"></div>
                
                <div className="absolute top-10 right-0 w-48 h-48 bg-blue-50 rounded-l-full opacity-70 z-0 transform translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <motion.h3 
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                        className="text-[28px] sm:text-[32px] font-bold text-[#0f172a] mb-2 tracking-tight"
                    >
                        A simpler way to hire
                    </motion.h3>
                    
                    <motion.p 
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                        className="text-[#64748b] text-[15px] font-medium mb-12"
                    >
                        From posting a job to making the right hire - all in one place.
                    </motion.p>
                    
                    <div className="w-full max-w-[1100px] flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        
                        {/* Step 1 */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, x: -30 },
                                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                            }}
                            className="flex flex-row md:flex-row items-center gap-4 text-left w-full md:w-auto"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <FileText size={20} />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                                    <h4 className="text-[#0f172a] text-[13px] font-bold">Post a Job</h4>
                                </div>
                                <p className="text-[#64748b] text-[11px] font-medium leading-tight">Create a job listing<br/>in minutes</p>
                            </div>
                        </motion.div>

                        {/* Arrow Right */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { duration: 0.5 } }
                            }}
                            className="hidden md:block text-slate-300 mx-2"
                        >
                            <ArrowRightIcon size={20} />
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, x: -30 },
                                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                            }}
                            className="flex flex-row md:flex-row items-center gap-4 text-left w-full md:w-auto"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <Search size={20} />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                                    <h4 className="text-[#0f172a] text-[13px] font-bold">Discover Talent</h4>
                                </div>
                                <p className="text-[#64748b] text-[11px] font-medium leading-tight">Get AI-powered<br/>candidate matches</p>
                            </div>
                        </motion.div>

                        {/* Arrow Right */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { duration: 0.5 } }
                            }}
                            className="hidden md:block text-slate-300 mx-2"
                        >
                            <ArrowRightIcon size={20} />
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, x: -30 },
                                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                            }}
                            className="flex flex-row md:flex-row items-center gap-4 text-left w-full md:w-auto"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <Users size={20} />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                                    <h4 className="text-[#0f172a] text-[13px] font-bold">Review & Connect</h4>
                                </div>
                                <p className="text-[#64748b] text-[11px] font-medium leading-tight">Shortlist and interview<br/>top candidates</p>
                            </div>
                        </motion.div>

                        {/* Arrow Right */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { duration: 0.5 } }
                            }}
                            className="hidden md:block text-slate-300 mx-2"
                        >
                            <ArrowRightIcon size={20} />
                        </motion.div>

                        {/* Step 4 */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, x: -30 },
                                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                            }}
                            className="flex flex-row md:flex-row items-center gap-4 text-left w-full md:w-auto"
                        >
                            <div className="relative w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <Briefcase size={20} />
                                {/* Small star/sparkle decoration */}
                                <div className="absolute -top-1 -right-1 text-amber-400">
                                    <Zap size={10} fill="currentColor" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                                    <h4 className="text-[#0f172a] text-[13px] font-bold">Hire & Grow</h4>
                                </div>
                                <p className="text-[#64748b] text-[11px] font-medium leading-tight">Build a stronger<br/>team for the future</p>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </motion.div>

        </section>
    );
};

export default EmployerCTA;
