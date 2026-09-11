import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit, AlertTriangle, CheckCircle2, Loader2, Sparkles, X, Plus, BookOpen, Info, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CurriculumGap = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [gapData, setGapData] = useState(null);
    
    // AI Modal State
    const [aiLoading, setAiLoading] = useState(false);
    const [coursePlan, setCoursePlan] = useState(null);
    const [selectedSkill, setSelectedSkill] = useState(null);

    const [savingCourse, setSavingCourse] = useState(false);

    useEffect(() => {
        if (user) {
            fetchGapData();
        }
    }, [user]);

    const fetchGapData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/institute/management/curriculum-gap', {
                headers: { token: user.token }
            });
            if (data.success) {
                setGapData(data.gapData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCourse = async (skill) => {
        setSelectedSkill(skill);
        setAiLoading(true);
        setCoursePlan(null);
        try {
            const { data } = await axios.post('/api/institute/management/ai-course-plan', {
                insight: {
                    skillName: skill.name,
                    message: `Critical market shortage for ${skill.name}. Employers are actively hiring.`
                },
                metrics: {
                    marketDemand: skill.demandCount
                }
            }, { headers: { token: user.token } });
            
            if (data.success && data.coursePlan) {
                setCoursePlan(data.coursePlan);
            } else {
                alert(data.message || 'Failed to generate course plan.');
                setSelectedSkill(null);
            }
        } catch (error) {
            alert('Error generating course plan.');
            setSelectedSkill(null);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddCourse = async () => {
        if (!coursePlan) return;
        setSavingCourse(true);
        try {
            // Flatten curriculum modules into description
            const descriptionText = coursePlan.curriculum 
                ? coursePlan.curriculum.map(m => `${m.module}:\n- ${m.topics.join('\n- ')}`).join('\n\n')
                : coursePlan.demandReason;

            // Extract numeric duration
            let duration = 3;
            if (coursePlan.duration) {
                const match = coursePlan.duration.match(/\d+/);
                if (match) duration = parseInt(match[0], 10);
            }

            const { data } = await axios.post('/api/institute/management/courses', {
                name: coursePlan.courseName,
                description: `Target Audience: ${coursePlan.targetAudience}\n\nPrerequisites: ${coursePlan.prerequisites}\n\nCurriculum:\n${descriptionText}`,
                durationMonths: duration,
                location: user?.districtId?.name || 'Online',
                skills: [selectedSkill.name]
            }, { headers: { token: user.token } });

            if (data.success) {
                alert("Course added successfully!");
                navigate('/courses');
            }
        } catch (error) {
            alert("Failed to save course.");
        } finally {
            setSavingCourse(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-green-600" size={40} /></div>;

    if (!gapData) return <div className="p-8 text-slate-500 text-center">Failed to load gap data.</div>;

    const totalDemand = gapData.marketDemand.length;
    const coveredCount = gapData.coveredSkills.length;
    const missingCount = gapData.missingSkills.length;
    const alignmentScore = totalDemand > 0 ? Math.round((coveredCount / totalDemand) * 100) : 100;

    return (
        <div className="w-full max-w-7xl mx-auto pb-12 text-slate-800 font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <BrainCircuit className="text-purple-600" size={32} />
                    AI Curriculum Gap
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Analyze the gap between your institute's courses and real-time market employer demand.
                </p>
            </div>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Market Alignment */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center relative group">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            Market Alignment
                            <div className="relative">
                                <Info size={14} className="text-slate-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                    Shows what percentage of the local job market demand is covered by the courses you currently teach.
                                </div>
                            </div>
                        </p>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className={`text-4xl font-extrabold ${alignmentScore < 50 ? 'text-red-500' : alignmentScore < 80 ? 'text-orange-500' : 'text-green-500'}`}>
                            {alignmentScore}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${alignmentScore < 50 ? 'bg-red-500' : alignmentScore < 80 ? 'bg-orange-500' : 'bg-green-500'}`} 
                            style={{ width: `${alignmentScore}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 font-medium">
                        You cover {coveredCount} out of the top {totalDemand} in-demand skills.
                    </p>
                </div>

                {/* Critical Gaps */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 shadow-sm p-6 flex flex-col justify-center relative group">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5">
                            Critical Gaps
                            <div className="relative">
                                <Info size={14} className="text-red-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                    High-demand skills that employers want right now, but are completely missing from your current curriculum.
                                </div>
                            </div>
                        </p>
                        <div className="bg-red-100 text-red-600 p-1.5 rounded-lg"><AlertTriangle size={18}/></div>
                    </div>
                    <span className="text-4xl font-extrabold text-red-600 mb-2">{missingCount}</span>
                    <p className="text-xs text-red-700 font-medium">
                        High-demand skills missing from your curriculum.
                    </p>
                </div>

                {/* Covered Skills */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 shadow-sm p-6 flex flex-col justify-center relative group">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-green-800 uppercase tracking-wide flex items-center gap-1.5">
                            Covered Skills
                            <div className="relative">
                                <Info size={14} className="text-green-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                    The skills you are currently teaching that successfully match what employers are actively hiring for.
                                </div>
                            </div>
                        </p>
                        <div className="bg-green-100 text-green-600 p-1.5 rounded-lg"><CheckCircle2 size={18}/></div>
                    </div>
                    <span className="text-4xl font-extrabold text-green-600 mb-2">{coveredCount}</span>
                    <p className="text-xs text-green-700 font-medium">
                        Skills you are successfully teaching right now.
                    </p>
                </div>
            </div>

            {/* Missing Skills Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="border-b border-slate-200 p-6 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="text-orange-500" size={20} />
                        Missing High-Demand Skills
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Employers are looking for these skills, but you don't have courses for them. Use AI to create a course instantly.
                    </p>
                </div>
                
                <div className="p-6">
                    {gapData.missingSkills.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">You're fully aligned!</h3>
                            <p className="text-slate-500">Your institute covers all top industry skills.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gapData.missingSkills.map((skill, idx) => (
                                <div key={idx} className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition-all group">
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-slate-900">{skill.name}</h3>
                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">High Demand</span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            <span className="font-bold text-slate-700">{skill.demandCount} active jobs</span> require this skill right now.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleGenerateCourse(skill)}
                                        className="w-full bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                    >
                                        <Sparkles size={16} className={aiLoading && selectedSkill?.name === skill.name ? "animate-pulse" : ""} />
                                        {aiLoading && selectedSkill?.name === skill.name ? "Generating..." : "Generate AI Course Plan"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Covered Skills */}
            {gapData.coveredSkills.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Skills You Already Teach</h3>
                    <div className="flex flex-wrap gap-2 px-2">
                        {gapData.coveredSkills.map((skill, idx) => (
                            <div key={idx} className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm">
                                <CheckCircle2 size={14} />
                                {skill.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* NEW: MOCK UI FOR ENHANCEMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Mock Skill Trends */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 opacity-70">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="text-blue-500" size={20} />
                            Industry Skill Trends (Demo)
                        </h3>
                        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Coming Soon</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-6">Preview of how skills are trending in the market over the last 6 months.</p>
                    
                    <div className="relative h-40 flex items-end justify-between px-2 pb-4 border-b border-l border-slate-200">
                        {/* Mock Chart Bars */}
                        <div className="w-10 bg-blue-200 rounded-t-sm h-[30%]"></div>
                        <div className="w-10 bg-blue-300 rounded-t-sm h-[45%]"></div>
                        <div className="w-10 bg-blue-400 rounded-t-sm h-[60%]"></div>
                        <div className="w-10 bg-blue-500 rounded-t-sm h-[85%] relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded">React: High</div>
                        </div>
                        <div className="w-10 bg-blue-600 rounded-t-sm h-[100%] relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded">AI: Peak</div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold px-2">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
                    </div>
                </div>

                {/* Mock Competitor Analysis */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 opacity-70">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users className="text-indigo-500" size={20} />
                            Local Competitor Analysis (Demo)
                        </h3>
                        <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Coming Soon</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-6">See what highly-rated institutes in your district are teaching.</p>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Advanced Prompt Engineering</p>
                                <p className="text-[10px] text-slate-500">Taught by 3 nearby institutes</p>
                            </div>
                            <span className="text-xs font-bold text-indigo-600">Missed Opportunity</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Cloud Architecture (AWS)</p>
                                <p className="text-[10px] text-slate-500">Taught by 5 nearby institutes</p>
                            </div>
                            <span className="text-xs font-bold text-indigo-600">High Local Demand</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Course Plan Modal */}
            {(aiLoading || coursePlan) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
                        {aiLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 border-4 border-purple-300 rounded-full border-t-purple-600 animate-spin"></div>
                                    <Sparkles className="text-purple-600" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">AI is Designing Your Course...</h2>
                                <p className="text-slate-500">Analyzing market requirements for {selectedSkill?.name} and generating an optimal curriculum.</p>
                            </div>
                        ) : coursePlan ? (
                            <>
                                {/* Modal Header */}
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 text-purple-600 p-2 rounded-xl">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">AI Curriculum Proposal</h2>
                                            <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">For {selectedSkill?.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => {setCoursePlan(null); setSelectedSkill(null);}} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                {/* Modal Body (Scrollable) */}
                                <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                                        <h3 className="text-2xl font-extrabold text-slate-900 mb-4">{coursePlan.courseName}</h3>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration</p>
                                                <p className="font-bold text-slate-800">{coursePlan.duration}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Recommended Batch</p>
                                                <p className="font-bold text-slate-800">{coursePlan.batchCapacity}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <p className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                <AlertTriangle size={16} className="text-orange-500"/> Why Start This Course?
                                            </p>
                                            <p className="text-sm text-slate-600 bg-orange-50/50 p-3 rounded-lg border border-orange-100 leading-relaxed">
                                                {coursePlan.demandReason}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                <BookOpen size={16} className="text-blue-500"/> Curriculum Modules
                                            </p>
                                            <div className="space-y-3">
                                                {coursePlan.curriculum && coursePlan.curriculum.map((mod, i) => (
                                                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                                                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                                            <p className="text-sm font-bold text-slate-800">{mod.module}</p>
                                                        </div>
                                                        <div className="p-4 bg-white">
                                                            <ul className="list-disc pl-5 space-y-1">
                                                                {mod.topics.map((t, j) => (
                                                                    <li key={j} className="text-sm text-slate-600">{t}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
                                    <button 
                                        onClick={() => {setCoursePlan(null); setSelectedSkill(null);}}
                                        className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        onClick={handleAddCourse}
                                        disabled={savingCourse}
                                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm shadow-green-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-70"
                                    >
                                        {savingCourse ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        {savingCourse ? 'Saving...' : 'Add to My Courses'}
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumGap;
