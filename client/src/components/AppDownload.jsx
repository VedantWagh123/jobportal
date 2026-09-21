import React, { useState, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { 
    Sparkles, Zap, Bell, MessageCircle, Search, 
    Bookmark, Home, Briefcase, MessageSquare, 
    User, FileText, Check, BarChart2, ChevronRight,
    MapPin, Clock, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppDownload = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [cursorState, setCursorState] = useState({ x: '50%', y: '110%', scale: 1, opacity: 0 });
    const [messageBadge, setMessageBadge] = useState(false);
    
    const scrollContainerRef = useRef(null);
    const resumeTimeoutRef = useRef(null);
    const stepRef = useRef(0);
    const isMounted = useRef(true);

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Handle manual interactions to pause automation
    const handleInteraction = () => {
        setIsAutoPlaying(false);
        setCursorState(p => ({ ...p, opacity: 0 }));
        
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        
        resumeTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
                // Resume from home to avoid glitchy mid-states
                setActiveTab('home');
                setSelectedJob(null);
                setSearchQuery('');
                stepRef.current = 0;
                setIsAutoPlaying(true);
            }
        }, 4000);
    };

    // Auto-Sequence Orchestrator
    useEffect(() => {
        isMounted.current = true;
        let isCancelled = false;
        
        const runSequence = async () => {
            while (!isCancelled) {
                if (!isAutoPlaying) {
                    await delay(500);
                    continue;
                }

                const step = stepRef.current;
                
                try {
                    switch (step) {
                        case 0:
                            // Start Home
                            setActiveTab('home');
                            setSelectedJob(null);
                            setSearchQuery('');
                            setMessageBadge(false);
                            if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                            setCursorState({ x: '50%', y: '90%', scale: 1, opacity: 0 });
                            await delay(1500);
                            if (!isAutoPlaying) break;
                            
                            // Show cursor
                            setCursorState({ x: '50%', y: '70%', scale: 1, opacity: 1 });
                            await delay(1000);
                            break;
                            
                        case 1:
                            // Scroll down jobs
                            setCursorState({ x: '50%', y: '60%', scale: 1, opacity: 1 });
                            if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollTo({ top: 180, behavior: 'smooth' });
                            }
                            await delay(1500);
                            if (!isAutoPlaying) break;
                            
                            // Scroll back up
                            setCursorState({ x: '50%', y: '70%', scale: 1, opacity: 1 });
                            if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                            await delay(1200);
                            break;

                        case 2:
                            // Click Search
                            setCursorState({ x: '50%', y: '20%', scale: 1, opacity: 1 });
                            await delay(800);
                            if (!isAutoPlaying) break;
                            setCursorState(p => ({ ...p, scale: 0.8 })); // Press
                            await delay(200);
                            setCursorState(p => ({ ...p, scale: 1 }));
                            
                            // Type realistic query
                            const text = "Designer";
                            for (let i=1; i<=text.length; i++) {
                                if (!isAutoPlaying || isCancelled) break;
                                setSearchQuery(text.substring(0, i));
                                await delay(150);
                            }
                            await delay(1000);
                            // Clear
                            setSearchQuery('');
                            break;
                            
                        case 3:
                            // Switch to Jobs Tab
                            setCursorState({ x: '38%', y: '92%', scale: 1, opacity: 1 });
                            await delay(800);
                            if (!isAutoPlaying) break;
                            setCursorState(p => ({ ...p, scale: 0.8 }));
                            await delay(200);
                            setCursorState(p => ({ ...p, scale: 1 }));
                            setActiveTab('jobs');
                            await delay(1200);
                            break;
                            
                        case 4:
                            // Open Job Details
                            setCursorState({ x: '50%', y: '28%', scale: 1, opacity: 1 });
                            await delay(800);
                            if (!isAutoPlaying) break;
                            setCursorState(p => ({ ...p, scale: 0.8 }));
                            await delay(200);
                            setCursorState(p => ({ ...p, scale: 1 }));
                            setSelectedJob({ 
                                title: "UI Designer", 
                                company: "Spotify", 
                                location: "New York",
                                salary: "$110k - $140k"
                            });
                            await delay(2000); // Let user read details
                            break;
                            
                        case 5:
                            // Close Job Details
                            setCursorState({ x: '10%', y: '6%', scale: 1, opacity: 1 });
                            await delay(800);
                            if (!isAutoPlaying) break;
                            setCursorState(p => ({ ...p, scale: 0.8 }));
                            await delay(200);
                            setCursorState(p => ({ ...p, scale: 1 }));
                            setSelectedJob(null);
                            await delay(1000);
                            break;
                            
                        case 6:
                            // Show Message Badge & Switch to Messages
                            setMessageBadge(true);
                            setCursorState({ x: '62%', y: '92%', scale: 1, opacity: 1 });
                            await delay(1000);
                            if (!isAutoPlaying) break;
                            setCursorState(p => ({ ...p, scale: 0.8 }));
                            await delay(200);
                            setCursorState(p => ({ ...p, scale: 1 }));
                            setActiveTab('messages');
                            setMessageBadge(false);
                            await delay(1500);
                            break;

                        case 7:
                            // Switch to Profile
                            setCursorState({ x: '85%', y: '92%', scale: 1, opacity: 1 });
                            await delay(800);
                            if (!isAutoPlaying) break;
                            setCursorState(p => ({ ...p, scale: 0.8 }));
                            await delay(200);
                            setCursorState(p => ({ ...p, scale: 1 }));
                            setActiveTab('profile');
                            await delay(2000);
                            break;
                            
                        case 8:
                            // Reset and fade out cursor
                            setCursorState(p => ({ ...p, opacity: 0 }));
                            await delay(600);
                            stepRef.current = -1;
                            break;
                    }
                } catch (e) {
                    // ignore delays if unmounted
                }
                
                if (isAutoPlaying && !isCancelled) {
                    stepRef.current = (stepRef.current + 1) % 9;
                }
            }
        };
        
        runSequence();
        
        return () => {
            isCancelled = true;
            isMounted.current = false;
            if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        };
    }, [isAutoPlaying]);

    const tabVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } }
    };

    return (
        <div className='px-6 lg:px-8 mx-auto my-10'>
            {/* Global Keyframes for floating animation */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-16px); }
                }
                .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className='relative bg-gradient-to-br from-[#EBF4FF] via-[#EEF2FF] to-[#F8FAFC] px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-20 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-white overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8'>
                
                {/* Decorative background gradients & elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-3xl"></div>
                    <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-200/20 blur-3xl"></div>
                    <div className="absolute top-1/4 right-1/3 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
                    <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]"></div>
                </div>

                {/* --- LEFT CONTENT --- */}
                <div className='relative z-10 lg:w-[55%] flex flex-col items-start'>
                    {/* Top Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-amber-200/60 px-4 py-2 rounded-full mb-8 shadow-sm">
                        <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                        <span className="text-[12px] font-bold text-slate-800 tracking-wide">4.5M+ thriving careers with InsiderJobs</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-[#14213D] leading-[1.1] tracking-tight'>
                        Your Dream Job, <br className="hidden sm:block"/>
                        <span className="text-blue-600">Now In Your Pocket.</span>
                    </h1>
                    
                    {/* Sub Heading */}
                    <p className="text-slate-600 mb-10 text-base sm:text-[17px] font-medium max-w-[480px] leading-relaxed">
                        Download our mobile app to discover opportunities, track applications, and chat with employers on the go.
                    </p>

                    {/* Download Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                        <a href="#" className='inline-block transform hover:scale-105 transition-all hover:shadow-lg rounded-xl hover:-translate-y-1 bg-black p-0 border border-black'>
                            <img className='h-[48px] sm:h-[52px] object-contain px-2' src={assets.play_store} alt="Get it on Google Play" />
                        </a>
                        <a href="#" className='inline-block transform hover:scale-105 transition-all hover:shadow-lg rounded-xl hover:-translate-y-1 bg-black p-0 border border-black'>
                            <img className='h-[48px] sm:h-[52px] object-contain px-2' src={assets.app_store} alt="Download on the App Store" />
                        </a>
                    </div>

                    {/* Features Row */}
                    <div className="flex items-center flex-wrap gap-6 sm:gap-8 text-slate-600 text-sm font-bold">
                        <div className="flex items-center gap-2.5">
                            <Zap size={18} className="text-blue-500" /> Fast Apply
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Bell size={18} className="text-blue-500" /> Job Alerts
                        </div>
                        <div className="flex items-center gap-2.5">
                            <MessageCircle size={18} className="text-blue-500" /> Chat Support
                        </div>
                    </div>
                </div>

                {/* --- RIGHT CONTENT (PHONE MOCKUP) --- */}
                <div className='relative z-10 lg:w-[45%] flex justify-center w-full mt-10 lg:mt-0'>
                    
                    {/* Center Phone */}
                    <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_25px_65px_-15px_rgba(0,0,0,0.15)] border-[10px] border-slate-100 overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-20 mx-auto group">
                        
                        {/* iPhone Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 sm:h-7 bg-slate-100 rounded-b-2xl sm:rounded-b-3xl w-32 sm:w-36 mx-auto z-30 flex justify-center items-end pb-1.5 sm:pb-2">
                            <div className="w-12 sm:w-14 h-1.5 bg-slate-300 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full ml-1.5 sm:ml-2"></div>
                        </div>
                        
                        {/* Interactive App Screen Container */}
                        <div 
                            className="bg-[#F8FAFC] w-full h-full pt-10 sm:pt-12 flex flex-col relative overflow-hidden"
                            onPointerDown={handleInteraction}
                            onTouchStart={handleInteraction}
                            onWheel={handleInteraction}
                        >
                            
                            {/* The Interactive Cursor */}
                            <div 
                                className="absolute z-50 pointer-events-none transition-all duration-[1200ms] ease-in-out origin-top-left"
                                style={{ 
                                    left: cursorState.x, 
                                    top: cursorState.y,
                                    transform: `translate(0, 0) scale(${cursorState.scale})`,
                                    opacity: cursorState.opacity 
                                }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
                                    <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.86c-.31-.31-.85-.09-.85.35Z" fill="#111827" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                                </svg>
                            </div>

                            {/* Main Content Area (Animated Tab Switcher) */}
                            <div className="flex-1 relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    
                                    {activeTab === 'home' && (
                                        <motion.div 
                                            key="home"
                                            variants={tabVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="absolute inset-0 flex flex-col h-full"
                                        >
                                            {/* Header */}
                                            <div className="px-5 flex items-center justify-between mb-5 relative z-10 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">in</div>
                                                    <span className="font-extrabold text-slate-900 text-[15px] tracking-tight">InsiderJobs</span>
                                                </div>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-500">
                                                    <Bell size={16} />
                                                </button>
                                            </div>
                                            
                                            {/* Search */}
                                            <div className="px-5 mb-5 relative z-10 shrink-0">
                                                <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                                                    <Search size={16} className="text-slate-400" />
                                                    <span className="text-slate-800 text-xs font-bold">
                                                        {searchQuery || <span className="text-slate-400 font-medium">Search jobs...</span>}
                                                        {searchQuery && <motion.span animate={{opacity:[0,1,0]}} transition={{repeat:Infinity, duration:1}} className="ml-[1px]">|</motion.span>}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Filter Chips */}
                                            <div className="px-5 flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar relative z-10 shrink-0">
                                                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] sm:text-xs font-extrabold border border-blue-100 whitespace-nowrap">1 Remote</span>
                                                <span className="px-3 py-1.5 bg-white text-slate-600 rounded-full text-[10px] sm:text-xs font-bold border border-slate-200 whitespace-nowrap shadow-sm">Full Time</span>
                                                <span className="px-3 py-1.5 bg-white text-slate-600 rounded-full text-[10px] sm:text-xs font-bold border border-slate-200 whitespace-nowrap shadow-sm">Internship</span>
                                            </div>

                                            {/* Recommended Label */}
                                            <div className="px-5 flex items-center justify-between mb-3 relative z-10 shrink-0">
                                                <h3 className="font-extrabold text-slate-900 text-sm">Recommended for you</h3>
                                                <span className="text-[11px] font-bold text-blue-600">See all</span>
                                            </div>

                                            {/* Job Cards - Scrollable */}
                                            <div 
                                                ref={scrollContainerRef}
                                                className="px-5 flex flex-col gap-3.5 pb-24 overflow-y-auto no-scrollbar relative z-10 flex-1 overscroll-contain"
                                            >
                                                {/* Google */}
                                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative">
                                                    <div className="flex gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 p-1.5">
                                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png" className="w-full h-full object-contain" alt="Google" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-tight mb-1">Software Engineer</h4>
                                                            <p className="text-slate-500 text-[10px] sm:text-[11px] font-medium mb-2.5">Google • Bengaluru, India</p>
                                                            <div className="flex gap-2">
                                                                <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded border border-slate-100">Full Time</span>
                                                                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded border border-green-100">Remote</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Bookmark size={16} className="text-slate-300 absolute top-4 right-4" />
                                                </div>

                                                {/* Airbnb */}
                                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative">
                                                    <div className="flex gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 shadow-sm flex items-center justify-center shrink-0 p-2 text-red-500">
                                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.969 1.13c-.947 0-1.884.281-2.736.837C7.457 3.129 4.609 6.84 2.898 10.871c-.752 1.777-.96 3.655-.63 5.432.329 1.777 1.258 3.393 2.656 4.618C6.31 22.133 8.322 22.87 10.387 22.87c.755 0 1.516-.094 2.277-.282 3.65-1.01 6.551-3.921 7.643-7.587.329-1.127.5-2.316.5-3.524 0-2.34-.84-4.57-2.327-6.315C16.892 3.14 14.523 1.13 11.97 1.13zm.006 1.942c1.996 0 3.861 1.624 5.097 3.238 1.155 1.488 1.808 3.337 1.808 5.176 0 .93-.13 1.848-.378 2.723-.83 2.825-3.082 5.056-5.882 5.827-.584.154-1.168.225-1.745.225-1.543 0-3.037-.53-4.184-1.53-.984-.863-1.637-2.023-1.89-3.26-.25-1.229-.095-2.528.455-3.791C6.671 8.232 9.115 5.08 10.596 4.093c.421-.284.887-.417 1.378-.417zm-3.064 7.643c-1.391 0-2.52 1.128-2.52 2.52 0 1.392 1.129 2.52 2.52 2.52 1.392 0 2.52-1.128 2.52-2.52 0-1.392-1.128-2.52-2.52-2.52zm0 1.258c.698 0 1.262.564 1.262 1.262 0 .698-.564 1.262-1.262 1.262-.698 0-1.262-.564-1.262-1.262 0-.698.564-1.262 1.262-1.262z"/></svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-tight mb-1">Product Designer</h4>
                                                            <p className="text-slate-500 text-[10px] sm:text-[11px] font-medium mb-2.5">Airbnb • Remote</p>
                                                            <div className="flex gap-2">
                                                                <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded border border-slate-100">Full Time</span>
                                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded border border-blue-100">Hybrid</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Bookmark size={16} className="text-slate-300 absolute top-4 right-4" />
                                                </div>

                                                {/* Microsoft */}
                                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative">
                                                    <div className="flex gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 p-1.5">
                                                            <svg viewBox="0 0 24 24" fill="currentColor"><path fill="#f35325" d="M11 11H0V0h11v11z"/><path fill="#81bc06" d="M24 11H13V0h11v11z"/><path fill="#05a6f0" d="M11 24H0V13h11v11z"/><path fill="#ffba08" d="M24 24H13V13h11v11z"/></svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-tight mb-1">Data Analyst</h4>
                                                            <p className="text-slate-500 text-[10px] sm:text-[11px] font-medium mb-2.5">Microsoft • Hyderabad, India</p>
                                                            <div className="flex gap-2">
                                                                <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded border border-slate-100">Full Time</span>
                                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded border border-amber-100">On-site</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Bookmark size={16} className="text-slate-300 absolute top-4 right-4" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'jobs' && (
                                        <motion.div 
                                            key="jobs"
                                            variants={tabVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="absolute inset-0 px-5 pt-5 pb-24 overflow-y-auto no-scrollbar flex flex-col gap-4 overscroll-contain"
                                        >
                                            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Saved Jobs</h3>
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-200 relative ring-1 ring-blue-100">
                                                <h4 className="font-extrabold text-slate-900 text-[13px] mb-1">UI Designer</h4>
                                                <p className="text-slate-500 text-[11px] mb-2">Spotify • New York</p>
                                                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded border border-green-100">Applied</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                                <h4 className="font-extrabold text-slate-900 text-[13px] mb-1">Frontend Dev</h4>
                                                <p className="text-slate-500 text-[11px] mb-2">Amazon • Remote</p>
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded border border-blue-100">Saved</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                                <h4 className="font-extrabold text-slate-900 text-[13px] mb-1">Data Scientist</h4>
                                                <p className="text-slate-500 text-[11px] mb-2">Meta • London</p>
                                                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-bold rounded border border-purple-100">Interviewing</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'messages' && (
                                        <motion.div 
                                            key="messages"
                                            variants={tabVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="absolute inset-0 px-5 pt-5 pb-24 overflow-y-auto no-scrollbar flex flex-col gap-3 overscroll-contain"
                                        >
                                            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Messages</h3>
                                            <div className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-blue-100 items-center">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 shrink-0 relative">
                                                    S
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-slate-900 text-[12px]">Sarah (HR)</h4>
                                                    <p className="text-slate-800 font-medium text-[10px] truncate max-w-[180px]">Your interview is scheduled for tomorrow.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 items-center">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600 shrink-0">M</div>
                                                <div>
                                                    <h4 className="font-extrabold text-slate-900 text-[12px]">Mike (Tech Lead)</h4>
                                                    <p className="text-slate-500 text-[10px] truncate max-w-[180px]">Great job on the assignment!</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'profile' && (
                                        <motion.div 
                                            key="profile"
                                            variants={tabVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="absolute inset-0 px-5 pt-5 pb-24 overflow-y-auto no-scrollbar flex flex-col items-center overscroll-contain"
                                        >
                                            <div className="w-20 h-20 bg-slate-200 rounded-full mb-3 border-4 border-white shadow-sm flex items-center justify-center shrink-0">
                                                <User size={32} className="text-slate-400" />
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-lg">Alex Doe</h3>
                                            <p className="text-blue-600 text-[12px] font-bold mb-5">Product Designer</p>
                                            
                                            <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                                                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500 text-[11px] font-medium">Experience</span>
                                                    <span className="font-extrabold text-slate-800 text-[11px]">4 Years</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500 text-[11px] font-medium">Applications</span>
                                                    <span className="font-extrabold text-slate-800 text-[11px]">12</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500 text-[11px] font-medium">Interviews</span>
                                                    <span className="font-extrabold text-slate-800 text-[11px]">3</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {/* Job Details Slide-Up Panel */}
                                <AnimatePresence>
                                    {selectedJob && (
                                        <motion.div 
                                            initial={{ y: '100%' }}
                                            animate={{ y: 0 }}
                                            exit={{ y: '100%' }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="absolute inset-0 z-40 bg-[#F8FAFC] flex flex-col"
                                        >
                                            {/* Details Header */}
                                            <div className="px-4 py-3 flex items-center border-b border-slate-200/60 bg-white shrink-0 shadow-sm relative z-10">
                                                <button onClick={() => setSelectedJob(null)} className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors">
                                                    <ChevronRight size={20} className="rotate-180" />
                                                </button>
                                                <span className="font-extrabold text-slate-900 text-[14px] ml-2">Job Details</span>
                                            </div>
                                            
                                            {/* Details Content */}
                                            <div className="flex-1 overflow-y-auto no-scrollbar p-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2 mb-4">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1024px-Spotify_logo_without_text.svg.png" className="w-full h-full object-contain" alt="Logo" />
                                                </div>
                                                <h3 className="font-extrabold text-slate-900 text-xl leading-tight mb-1">{selectedJob.title}</h3>
                                                <p className="text-slate-500 font-medium text-xs mb-5">{selectedJob.company} • {selectedJob.location}</p>
                                                
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-blue-100"><DollarSign size={12}/>{selectedJob.salary}</div>
                                                    <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"><MapPin size={12}/>Remote</div>
                                                    <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"><Clock size={12}/>Full-time</div>
                                                </div>
                                                
                                                <h4 className="font-extrabold text-slate-900 text-[13px] mb-2">Description</h4>
                                                <div className="space-y-2">
                                                    <div className="w-full h-2.5 bg-slate-200 rounded-full"></div>
                                                    <div className="w-[90%] h-2.5 bg-slate-200 rounded-full"></div>
                                                    <div className="w-[95%] h-2.5 bg-slate-200 rounded-full"></div>
                                                    <div className="w-[70%] h-2.5 bg-slate-200 rounded-full"></div>
                                                </div>
                                            </div>
                                            
                                            {/* Apply Button */}
                                            <div className="p-4 border-t border-slate-200/60 bg-white shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] z-10">
                                                <button className="w-full bg-blue-600 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                                                    Apply Now
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Bottom Navigation */}
                            <div className="absolute bottom-0 inset-x-0 h-[76px] bg-white border-t border-slate-200/60 flex items-center justify-around px-2 pb-3 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
                                <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-14 h-full gap-1.5 transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}>
                                    <Home size={20} strokeWidth={2.5} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
                                    <span className="text-[10px] font-extrabold">Home</span>
                                </button>
                                <button onClick={() => setActiveTab('jobs')} className={`flex flex-col items-center justify-center w-14 h-full gap-1.5 transition-colors ${activeTab === 'jobs' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}>
                                    <Briefcase size={20} strokeWidth={2.5} fill={activeTab === 'jobs' ? 'currentColor' : 'none'} />
                                    <span className="text-[10px] font-extrabold">Jobs</span>
                                </button>
                                <button onClick={() => setActiveTab('messages')} className={`relative flex flex-col items-center justify-center w-14 h-full gap-1.5 transition-colors ${activeTab === 'messages' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}>
                                    <MessageSquare size={20} strokeWidth={2.5} fill={activeTab === 'messages' ? 'currentColor' : 'none'} />
                                    <span className="text-[10px] font-extrabold">Messages</span>
                                    {messageBadge && <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                                </button>
                                <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center justify-center w-14 h-full gap-1.5 transition-colors ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}>
                                    <User size={20} strokeWidth={2.5} fill={activeTab === 'profile' ? 'currentColor' : 'none'} />
                                    <span className="text-[10px] font-extrabold">Profile</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- FLOATING UI CARDS --- */}
                    
                    {/* New Job Alert */}
                    <div className="hidden lg:flex absolute -left-12 xl:-left-20 top-20 bg-white p-3.5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(37,99,235,0.12)] border border-slate-100 items-center gap-3.5 z-30 animate-float-slow">
                        <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 relative">
                            <Bell size={20} fill="currentColor" />
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="pr-2">
                            <h4 className="font-extrabold text-slate-900 text-[13px] leading-tight mb-0.5">New Job Alert!</h4>
                            <p className="text-[11px] text-slate-500 font-medium">10 new jobs match<br/>your profile</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                    </div>

                    {/* Application Sent */}
                    <div className="hidden lg:flex absolute -left-8 xl:-left-12 bottom-32 bg-white p-3.5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(37,99,235,0.12)] border border-slate-100 items-center gap-3.5 z-30 animate-float-medium">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                            <FileText size={20} />
                        </div>
                        <div className="pr-4">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-extrabold text-slate-900 text-[13px] leading-tight">Application Sent</h4>
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white"><Check size={10} strokeWidth={4} /></div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">You're one step closer!</p>
                        </div>
                    </div>

                    {/* Grow Your Career */}
                    <div className="hidden lg:flex absolute -right-16 xl:-right-24 top-48 bg-white p-4.5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(37,99,235,0.12)] border border-slate-100 flex-col gap-2.5 z-30 animate-float-fast w-44">
                        <div className="flex items-start justify-between gap-4">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-end justify-center p-1.5 shrink-0">
                                <BarChart2 size={20} strokeWidth={3} />
                            </div>
                            <ChevronRight size={16} className="text-slate-300 mt-1" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 text-[14px] leading-tight">Grow Your<br/>Career</h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-snug">Better skills.<br/>Brighter future.</p>
                        </div>
                    </div>

                    {/* Join seekers */}
                    <div className="hidden lg:flex absolute -right-8 xl:-right-12 bottom-20 bg-white p-3 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(37,99,235,0.12)] border border-slate-100 items-center gap-3 z-30 animate-float-slow">
                        <div className="flex -space-x-2.5 shrink-0 pl-1">
                            <img src="https://i.pravatar.cc/100?img=1" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm relative z-30" alt="user" />
                            <img src="https://i.pravatar.cc/100?img=2" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm relative z-20" alt="user" />
                            <img src="https://i.pravatar.cc/100?img=3" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm relative z-10" alt="user" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 text-[12px] leading-tight pr-3">Join 4.5M+<br/><span className="text-slate-500 font-medium">job seekers</span></h4>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mr-1"><ChevronRight size={14} className="text-slate-400" /></div>
                    </div>

                    {/* Decorative Arrows & Text */}
                    <div className="hidden xl:block absolute -left-10 bottom-8 opacity-70 pointer-events-none">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="transform -rotate-12 mb-1">
                            <path d="M10 50 Q 30 20, 55 15" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeDasharray="4 4" />
                            <path d="M45 10 L 58 13 L 53 25" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                        <p className="text-blue-600 font-bold text-sm transform -rotate-12 whitespace-nowrap" style={{fontFamily: 'cursive', letterSpacing: '0.5px'}}>Same Dreams<br/>New Opportunities</p>
                    </div>

                    <div className="hidden xl:block absolute -right-24 top-16 opacity-70 pointer-events-none text-right">
                        <p className="text-blue-600 font-bold text-sm transform rotate-6 whitespace-nowrap mb-2" style={{fontFamily: 'cursive', letterSpacing: '0.5px'}}>Opportunities<br/>Anywhere</p>
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="transform rotate-[70deg] ml-auto mr-4">
                            <path d="M10 50 Q 30 20, 55 15" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeDasharray="4 4" />
                            <path d="M45 10 L 58 13 L 53 25" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AppDownload;