import React from 'react';
import { assets } from '../assets/assets';
import { 
    Sparkles, Zap, Bell, MessageCircle, Search, 
    Bookmark, Home, Briefcase, MessageSquare, 
    User, FileText, Check, BarChart2, ChevronRight 
} from 'lucide-react';

const AppDownload = () => {
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
                    <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_25px_65px_-15px_rgba(0,0,0,0.15)] border-[10px] border-slate-100 overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-20 mx-auto">
                        
                        {/* iPhone Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 sm:h-7 bg-slate-100 rounded-b-2xl sm:rounded-b-3xl w-32 sm:w-36 mx-auto z-30 flex justify-center items-end pb-1.5 sm:pb-2">
                            <div className="w-12 sm:w-14 h-1.5 bg-slate-300 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full ml-1.5 sm:ml-2"></div>
                        </div>
                        
                        {/* App Screen Content */}
                        <div className="bg-[#F8FAFC] w-full h-full pt-10 sm:pt-12 flex flex-col relative overflow-hidden">
                            
                            {/* Header */}
                            <div className="px-5 flex items-center justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">in</div>
                                    <span className="font-extrabold text-slate-900 text-[15px] tracking-tight">InsiderJobs</span>
                                </div>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-blue-600">
                                    <Bell size={16} />
                                </button>
                            </div>
                            
                            {/* Search */}
                            <div className="px-5 mb-5 relative z-10">
                                <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                                    <Search size={16} className="text-slate-400" />
                                    <span className="text-slate-400 text-xs font-medium">Search jobs...</span>
                                </div>
                            </div>

                            {/* Filter Chips */}
                            <div className="px-5 flex items-center gap-2 mb-6 overflow-hidden relative z-10">
                                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] sm:text-xs font-extrabold border border-blue-100 whitespace-nowrap">1 Remote</span>
                                <span className="px-3 py-1.5 bg-white text-slate-600 rounded-full text-[10px] sm:text-xs font-bold border border-slate-200 whitespace-nowrap shadow-sm">Full Time</span>
                                <span className="px-3 py-1.5 bg-white text-slate-600 rounded-full text-[10px] sm:text-xs font-bold border border-slate-200 whitespace-nowrap shadow-sm">Internship</span>
                            </div>

                            {/* Recommended Label */}
                            <div className="px-5 flex items-center justify-between mb-3 relative z-10">
                                <h3 className="font-extrabold text-slate-900 text-sm">Recommended for you</h3>
                                <span className="text-[11px] font-bold text-blue-600">See all</span>
                            </div>

                            {/* Job Cards */}
                            <div className="px-5 flex flex-col gap-3.5 pb-24 overflow-y-auto no-scrollbar relative z-10">
                                
                                {/* Google */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group hover:border-blue-200 transition-colors">
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
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group hover:border-blue-200 transition-colors">
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
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group hover:border-blue-200 transition-colors">
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

                            {/* Bottom Navigation */}
                            <div className="absolute bottom-0 inset-x-0 h-[76px] bg-white border-t border-slate-100 flex items-center justify-around px-4 pb-3 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                                <div className="flex flex-col items-center gap-1.5 text-blue-600">
                                    <Home size={20} fill="currentColor" />
                                    <span className="text-[10px] font-extrabold">Home</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                    <Briefcase size={20} />
                                    <span className="text-[10px] font-bold">Jobs</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                    <MessageSquare size={20} />
                                    <span className="text-[10px] font-bold">Messages</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                    <User size={20} />
                                    <span className="text-[10px] font-bold">Profile</span>
                                </div>
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