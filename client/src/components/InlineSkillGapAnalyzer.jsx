import React, { useState, useEffect, useContext } from 'react';
import {
    AlertTriangle, BookOpen, Clock, Target, ArrowRight, Loader2,
    Sparkles, GraduationCap, X, CheckCircle2, TrendingUp, Lightbulb,
    Eye, Diamond
} from 'lucide-react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TABS = [
    { id: 'missing_skills', label: 'Skills Analysis' },
    { id: 'roadmap',        label: 'Learning Roadmap',    icon: <BookOpen size={13} /> },
    { id: 'courses',        label: 'Recommended Courses', icon: <GraduationCap size={13} /> },
    { id: 'insights',       label: 'Insights',            icon: <Eye size={13} /> },
];

// Cache to avoid re-fetching the same analysisId+jobId within 5 minutes
const gapCache = {};

const InlineSkillGapAnalyzer = ({ matchScore, job, missingSkills = [], matchedSkills = [], analysisId, onClose }) => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [loading, setLoading]       = useState(true);
    const [gapData, setGapData]       = useState(null);
    const [activeTab, setActiveTab]   = useState('missing_skills');

    const cacheKey = `${analysisId}_${job?._id}`;

    useEffect(() => {
        if (analysisId && job) {
            if (gapCache[cacheKey] && Date.now() - gapCache[cacheKey].ts < 5 * 60 * 1000) {
                setGapData(gapCache[cacheKey].data);
                setLoading(false);
            } else {
                fetchGapAnalysis();
            }
        }
    }, [analysisId, job?._id]);

    const fetchGapAnalysis = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/smartmatch/analyze-gap`, {
                analysisId,
                jobId: job._id,
            });
            if (data.success) {
                gapCache[cacheKey] = { data, ts: Date.now() };
                setGapData(data);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to analyze skill gap.');
        } finally {
            setLoading(false);
        }
    };

    /* ─── LOADING STATE ──────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                <Loader2 size={36} className="animate-spin text-purple-500" />
                <p className="text-sm font-semibold text-gray-600">Analyzing skills & generating learning path…</p>
            </div>
        );
    }

    /* ─── ERROR STATE ────────────────────────────────────────────── */
    if (!gapData) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <p className="text-gray-500 text-sm">Failed to load analysis. Please try again.</p>
            </div>
        );
    }

    const skillCount = gapData.missingSkills?.length || 0;

    /* ─── SKILL PRIORITY helper ──────────────────────────────────── */
    const getPriority = (idx) => {
        // First third = High, second third = Medium, rest = Low
        if (idx < Math.ceil(skillCount / 3)) return 'HIGH';
        if (idx < Math.ceil((skillCount * 2) / 3)) return 'MEDIUM';
        return 'LOW';
    };

    const priorityStyle = {
        HIGH:   'bg-red-50 text-red-500 border border-red-100',
        MEDIUM: 'bg-amber-50 text-amber-500 border border-amber-100',
        LOW:    'bg-gray-50 text-gray-400 border border-gray-100',
    };

    /* ─── RENDER ─────────────────────────────────────────────────── */
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* ── HEADER ─────────────────────────────────────────── */}
            <div className="px-7 pt-7 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                    {/* Left */}
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <Target size={22} className="text-purple-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">Skill Gap Analysis</h2>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-wide">
                                    <AlertTriangle size={11} /> Needs Improvement
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Develop the missing skills to increase your match score and be job-ready.
                            </p>
                        </div>
                    </div>

                    {/* Right – Focus Area badge & Match Score */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                        {/* Interactive Score Badges */}
                        <div className="flex items-center gap-2">
                            {/* Match Score */}
                            <div className="relative group cursor-help">
                                <div className="flex flex-col items-center bg-gradient-to-b from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl px-4 py-2.5 shadow-[0_2px_10px_rgba(16,185,129,0.1)] transition-all group-hover:shadow-[0_4px_16px_rgba(16,185,129,0.2)] group-hover:-translate-y-0.5">
                                    <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mb-1">Match Score</p>
                                    <p className="text-2xl font-black text-emerald-700 leading-none">{matchScore}%</p>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute top-full right-1/2 translate-x-1/2 mt-3 w-48 bg-gray-900 text-white text-xs font-medium p-3 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl pointer-events-none text-center">
                                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 rounded-sm"></div>
                                    <p className="relative z-10">How well your current skills align with the job requirements.</p>
                                </div>
                            </div>
                            
                            {/* Gap to Fill */}
                            <div className="relative group cursor-help">
                                <div className="flex flex-col items-center bg-gradient-to-b from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl px-4 py-2.5 shadow-[0_2px_10px_rgba(59,130,246,0.1)] transition-all group-hover:shadow-[0_4px_16px_rgba(59,130,246,0.2)] group-hover:-translate-y-0.5">
                                    <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1">Gap to Fill</p>
                                    <p className="text-2xl font-black text-blue-700 leading-none">{100 - matchScore}%</p>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute top-full right-1/2 translate-x-1/2 mt-3 w-48 bg-gray-900 text-white text-xs font-medium p-3 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl pointer-events-none text-center">
                                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 rounded-sm"></div>
                                    <p className="relative z-10">Percentage of required skills you are missing. Focus here!</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                            <TrendingUp size={20} className="text-emerald-500" />
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Focus Area</p>
                                <p className="text-sm font-extrabold text-gray-900">{skillCount} Skills to Develop</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ── TABS ───────────────────────────────────────── */}
                <div className="flex items-center gap-6 mt-6 border-b border-gray-100 overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 pb-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                                activeTab === tab.id
                                    ? 'text-blue-600'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TAB CONTENT ────────────────────────────────────── */}
            <div className="p-7">

                {/* ════ 1. SKILLS ANALYSIS ════════════════════════════ */}
                {activeTab === 'missing_skills' && (
                    <div className="flex flex-col gap-8">
                        
                        {/* ── Matched Skills (Your Skills) ── */}
                        {matchedSkills.length > 0 && (
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-600" /> 
                                    Your Skills ({matchedSkills.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {matchedSkills.map((skill, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 bg-white border border-emerald-100/50 rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                <CheckCircle2 size={16} className="text-emerald-600" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{skill}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Missing Skills (Skills to Develop) ── */}
                        <div>
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Target size={18} className="text-purple-600" /> 
                                Skills to Develop ({skillCount})
                            </h3>

                            {skillCount === 0 ? (
                                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex items-center gap-3">
                                    <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                                    <p className="text-sm font-semibold text-emerald-800">
                                        Great news! Your profile covers the listed requirements.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {gapData.missingSkills.map((skill, idx) => {
                                        const pr = getPriority(idx);
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-purple-100 transition-colors"
                                            >
                                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                                    <Target size={16} className="text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{skill}</p>
                                                    <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityStyle[pr]}`}>
                                                        {pr === 'HIGH' ? 'High Priority' : pr === 'MEDIUM' ? 'Medium' : 'Low'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Upskill CTA */}
                        {skillCount > 0 && (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-inner">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <GraduationCap size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Ready to upskill?</h4>
                                        <p className="text-[11px] text-gray-500 font-medium">Explore personalized courses and learning resources to build these skills.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('courses')}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap shadow-sm flex items-center justify-center gap-2"
                                >
                                    View Recommended Courses <ArrowRight size={14} />
                                </button>
                            </div>
                        )}

                        {/* Right – Why These Skills Matter */}
                        <div className="w-full lg:w-[280px] shrink-0">
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                        <Lightbulb size={16} className="text-amber-500" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">Why These Skills Matter?</h4>
                                </div>
                                <ul className="space-y-3 mb-5">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            These skills are required in the job description for the <strong>{job.title}</strong> role.
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Learning these skills can significantly improve your match score and chances of selection.
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Recommended based on your current profile and missing areas.
                                        </p>
                                    </li>
                                </ul>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <p className="text-xs text-blue-700 font-semibold italic leading-relaxed">
                                        "Bridging these skill gaps can open up better opportunities and faster career growth."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ 2. LEARNING ROADMAP ══════════════════════════ */}
                {activeTab === 'roadmap' && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-base font-bold text-gray-900">Your Learning Roadmap</h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full border border-purple-100 uppercase tracking-wide">
                                <Sparkles size={11} /> AI Generated
                            </span>
                        </div>

                        {!gapData.roadmap?.roadmap ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-sm text-gray-400 font-medium">Learning roadmap is currently unavailable.</p>
                            </div>
                        ) : (
                            <div className="max-w-3xl">
                                <div className="relative border-l-2 border-purple-100 ml-5 space-y-6 py-2">
                                    {gapData.roadmap.roadmap.map((step, idx) => (
                                        <div key={idx} className="relative pl-8">
                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-purple-500 border-[3px] border-white shadow-sm" />
                                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                    <h4 className="font-bold text-gray-900 text-sm">
                                                        <span className="text-purple-400 mr-2 font-extrabold">0{step.stepNumber}</span>
                                                        {step.skillName}
                                                    </h4>
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg w-fit">
                                                        <Clock size={12} /> {step.estimatedDuration}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed mb-2">{step.actionableAdvice}</p>
                                                <p className="text-xs text-gray-400 italic">{step.whyItMatters}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {gapData.roadmap.encouragementMessage && (
                                    <div className="mt-8 text-center">
                                        <p className="text-sm font-semibold text-purple-600 italic bg-purple-50 inline-block px-5 py-3 rounded-2xl border border-purple-100">
                                            "{gapData.roadmap.encouragementMessage}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ════ 3. RECOMMENDED COURSES ═══════════════════════ */}
                {activeTab === 'courses' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                                <GraduationCap size={22} className="text-blue-600" /> Recommended Courses
                            </h3>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full inline-block w-max">
                                {gapData.recommendedCourses?.length || 0} Curated Courses
                            </span>
                        </div>

                        {!gapData.recommendedCourses || gapData.recommendedCourses.length === 0 ? (
                            <div className="bg-white border border-gray-100 rounded-[24px] p-12 text-center shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <GraduationCap size={40} className="text-gray-300" />
                                </div>
                                <p className="font-extrabold text-gray-900 text-lg mb-2">No matching courses found</p>
                                <p className="text-sm text-gray-500 max-w-md mx-auto">Check back later as our AI continuously curates new courses to match your skill gaps.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {gapData.recommendedCourses.map((course, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-blue-300 hover:shadow-md transition-all duration-300 group relative"
                                    >
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                                    <Diamond size={10} className="fill-current" />
                                                </div>
                                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider line-clamp-1 flex-1">
                                                    {course.instituteName || 'Partner Institute'}
                                                </p>
                                                {course.durationMonths && (
                                                    <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Clock size={10} className="text-gray-400" /> {course.durationMonths} Mos
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {course.courseName}
                                            </h4>
                                            {course.courseDescription && (
                                                <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                                    {course.courseDescription}
                                                </p>
                                            )}
                                            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">Covers Skills</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/company/${course.instituteId}`)}
                                                    className="bg-gray-900 hover:bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded transition-all flex items-center justify-center gap-1"
                                                >
                                                    View <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ════ 4. INSIGHTS ══════════════════════════════════ */}
                {activeTab === 'insights' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-50">Strengths</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Your profile matches <strong>{matchScore}%</strong> of the core requirements for this role.
                                    </p>
                                </li>
                                {job.experience && (
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Analyzed against the <strong>{job.experience}</strong> experience level required.
                                        </p>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-50">Areas for Growth</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        <strong>{skillCount}</strong> skills extracted from the job description are missing from your profile.
                                    </p>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Following the generated learning roadmap will directly address these requirements.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InlineSkillGapAnalyzer;
