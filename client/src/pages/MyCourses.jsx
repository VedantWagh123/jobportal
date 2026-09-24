import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Play, MessageSquare, BookOpen, Clock, Loader2, BookOpenCheck, BarChart2, ArrowRight, PlayCircle, Building2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
    const { myCourses, fetchMyCourses } = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch courses when component mounts to ensure data is fresh
        const load = async () => {
            setLoading(true);
            await fetchMyCourses();
            setLoading(false);
        };
        load();
    }, []);

    const filteredCourses = myCourses.filter(course =>
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instituteName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && myCourses.length === 0) {
        return (
            <div className="bg-slate-50 min-h-screen p-8 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (myCourses.length === 0) {
        return (
            <div className="bg-slate-50 min-h-screen p-8">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-20">
                    <BookOpenCheck size={48} className="text-slate-300 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">You haven't enrolled in any courses</h2>
                    <p className="text-slate-500 mb-6">Discover in-demand skills and upgrade your career.</p>
                    <button 
                        onClick={() => navigate('/upskilling')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                    >
                        Explore Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">
            {/* Custom Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%) skewX(-12deg); }
                }
                .animate-fade-in-up {
                    opacity: 0;
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-float {
                    animation: float 5s ease-in-out infinite;
                }
            `}</style>

            {/* Background Abstract Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-gradient-to-tr from-blue-200/40 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-gradient-to-tl from-indigo-200/40 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                
                {/* Dots pattern bottom left */}
                <div className="absolute bottom-10 left-10 opacity-20">
                    <div className="grid grid-cols-4 gap-2">
                        {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>)}
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 relative z-10">
                
                {/* ── Premium Hero Banner ── */}
                <div className="relative w-full rounded-[24px] mb-10 overflow-hidden shadow-sm border border-white/50 bg-gradient-to-r from-[#eef2ff] via-[#e0e7ff] to-[#f3e8ff] animate-fade-in-up">
                    {/* Abstract Banner Shapes */}
                    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
                        <div className="absolute top-0 right-[25%] w-64 h-64 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-2xl"></div>
                        <div className="absolute bottom-0 right-[15%] w-64 h-64 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-2xl"></div>
                        <div className="absolute top-1/2 left-[45%] w-32 h-32 bg-white/40 rounded-full mix-blend-overlay filter blur-xl"></div>
                        
                        {/* Decorative illustration elements (simulated with CSS/Lucide) */}
                        <div className="absolute right-[40%] top-1/2 -translate-y-1/2 flex items-center justify-center opacity-90 hidden lg:flex animate-float">
                            <div className="relative w-48 h-48">
                                <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                                <div className="absolute inset-4 bg-indigo-500/10 rounded-full"></div>
                                {/* Graduation Cap SVG */}
                                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 text-blue-900 drop-shadow-xl" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
                                </svg>
                                {/* Floating dots */}
                                <div className="absolute top-10 left-0 w-3 h-3 bg-amber-400 rounded-full shadow-sm animate-bounce" style={{ animationDuration: '2s' }}></div>
                                <div className="absolute bottom-10 right-10 w-2 h-2 bg-blue-500 rounded-full shadow-sm animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                                <div className="absolute top-1/4 right-0 w-4 h-4 bg-indigo-400 rounded-full shadow-sm opacity-50"></div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 px-8 py-10 md:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div className="flex-1">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">My Courses</p>
                            <h1 className="text-4xl md:text-[42px] font-black text-slate-900 mb-3 tracking-tight leading-tight">
                                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Courses</span>
                            </h1>
                            <p className="text-slate-600 font-medium text-[15px] max-w-md">
                                Access your enrolled courses, lectures and resources.
                            </p>
                        </div>

                        <div className="w-full lg:w-[400px] shrink-0 z-20">
                            <div className="relative w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Search size={18} className="text-blue-500 stroke-[2.5] group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search your courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 border-none rounded-full text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-100 bg-white/95 backdrop-blur-sm text-slate-700 placeholder-slate-400 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* ── Course List ── */}
                <div className="space-y-5 relative z-10">
                    {filteredCourses.map((course, index) => {
                        const isNotStarted = course.progressPercentage === 0;
                        const fallbackGradient = `linear-gradient(135deg, hsl(${(index * 50) % 360}, 70%, 50%), hsl(${((index + 1) * 70) % 360}, 60%, 40%))`;

                        return (
                            <div 
                                key={course.enrollmentId} 
                                className="group relative bg-white rounded-[28px] p-5 sm:p-6 flex flex-col xl:flex-row gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-1 animate-fade-in-up overflow-hidden"
                                style={{ animationDelay: `${(index + 1) * 100}ms` }}
                            >
                                {/* Background subtle glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                {/* Thumbnail (Left) */}
                                <div className="relative h-56 md:h-64 xl:h-[200px] xl:w-[320px] rounded-[20px] overflow-hidden shrink-0 bg-slate-100 cursor-pointer shadow-inner" onClick={() => navigate(`/course-player/${course.enrollmentId}`)}>
                                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                            <CheckCircle2 size={12} strokeWidth={3} /> Enrolled
                                        </span>
                                    </div>
                                    
                                    {course.courseImage ? (
                                        <img 
                                            src={course.courseImage} 
                                            alt={course.courseName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div 
                                            className="w-full h-full flex items-center justify-center text-white p-4 text-center group-hover:scale-110 transition-transform duration-700 ease-out"
                                            style={{ background: fallbackGradient }}
                                        >
                                            <span className="font-black text-4xl drop-shadow-lg">
                                                {course.courseName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300">
                                            <Play size={28} className="text-white fill-white ml-1.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content (Middle) */}
                                <div className="flex-1 flex flex-col justify-center relative z-10">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-3 bg-slate-50 w-fit px-3 py-1 rounded-lg border border-slate-100">
                                        <Building2 size={14} className="text-blue-500" />
                                        <span className="text-slate-600">{course.instituteName}</span>
                                    </div>
                                    
                                    <h2 className="text-[22px] md:text-2xl font-black text-slate-900 mb-4 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer pr-4" onClick={() => navigate(`/course-player/${course.enrollmentId}`)}>
                                        {course.courseName}
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-bold text-slate-600 mb-auto">
                                        <div className="flex items-center gap-2 bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-blue-100/50">
                                            <BookOpen size={16} className="text-blue-600" />
                                            <span>{course.totalLectures > 0 ? `${course.totalLectures} Lectures` : 'Modules Setup'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-purple-50/50 px-2.5 py-1.5 rounded-lg border border-purple-100/50">
                                            <Clock size={16} className="text-purple-600" />
                                            <span>{course.durationMonths} Months</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-amber-50/50 px-2.5 py-1.5 rounded-lg border border-amber-100/50">
                                            <BarChart2 size={16} className="text-amber-600" />
                                            <span>Beginner</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar Area */}
                                    <div className="flex items-center gap-4 mt-6 xl:mt-8 w-full bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Progress</span>
                                                <span className={`text-[13px] font-black ${isNotStarted ? 'text-slate-500' : 'text-blue-600'}`}>
                                                    {isNotStarted ? 'Not started' : `${course.progressPercentage}%`}
                                                </span>
                                            </div>
                                            <div className="bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${isNotStarted ? 'bg-transparent' : course.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                                    style={{ width: `${course.progressPercentage}%` }}
                                                >
                                                    {course.progressPercentage > 0 && course.progressPercentage < 100 && (
                                                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions (Right) */}
                                <div className="flex flex-col justify-center gap-3 shrink-0 xl:w-[240px] relative z-10 border-t xl:border-t-0 xl:border-l border-slate-100 pt-6 xl:pt-0 xl:pl-8">
                                    <button 
                                        onClick={() => navigate(`/course-player/${course.enrollmentId}`)}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 group/btn transform hover:-translate-y-0.5"
                                    >
                                        <PlayCircle size={18} className="fill-white/20 group-hover/btn:scale-110 transition-transform" />
                                        {isNotStarted ? 'Start Learning' : 'Continue Course'}
                                    </button>
                                    
                                    <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl border-2 border-slate-100 transition-colors flex items-center justify-center gap-2 group/btn2">
                                        <MessageSquare size={16} className="text-blue-500 group-hover/btn2:text-blue-600 transition-colors" />
                                        Ask a Doubt
                                    </button>

                                    <button 
                                        onClick={() => navigate('/course/' + (course.courseId || course._id), { state: { course } })}
                                        className="w-full text-slate-500 hover:text-blue-600 font-bold py-2 text-sm mt-1 flex items-center justify-center gap-1.5 transition-colors group/link"
                                    >
                                        View Details <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default MyCourses;
