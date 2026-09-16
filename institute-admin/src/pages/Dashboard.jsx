import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    BookOpen, Users, BrainCircuit, Activity, Clock, CheckCircle, 
    X, Sparkles, Loader2, GripHorizontal, ArrowRight, TrendingUp, Lightbulb, Database, Code, UsersRound, ChevronRight, Target, AlertCircle, PlayCircle, Send, User, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Rnd } from 'react-rnd';

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

const StatCard = ({ title, value, icon, subtitle, colorClass, bgClass, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md transition-all duration-200' : ''}`}
    >
        <div className={`p-3.5 rounded-xl ${bgClass} ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-0.5">{title}</p>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight">{value}</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtitle}</p>
        </div>
    </div>
);

// Helper to assign colors to insights
const getInsightColor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('generative ai') || t.includes('genai')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: <Lightbulb size={18} /> };
    if (t.includes('machine learning') || t.includes('data')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: <Database size={18} /> };
    if (t.includes('python') || t.includes('code')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: <Code size={18} /> };
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: <Sparkles size={18} /> };
};

// ----------------------------------------------------------------------
// MAIN DASHBOARD PAGE
// ----------------------------------------------------------------------

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Live Data States
    const [alerts, setAlerts] = useState([]);
    const [metrics, setMetrics] = useState({ activeCourses: 0, totalStudents: 0, totalBatches: 0 });
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    
    // AI Panel State (with LocalStorage caching)
    const [isBotOpen, setIsBotOpen] = useState(false);
    const [botData, setBotData] = useState(() => {
        const saved = localStorage.getItem('institute_ai_panel_data');
        return saved ? JSON.parse(saved) : null;
    });
    
    // AI Chat Follow-up State
    const [chatHistory, setChatHistory] = useState(() => {
        const saved = localStorage.getItem('institute_ai_chat_followup');
        return saved ? JSON.parse(saved) : [];
    });
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef(null);
    
    const [isBotLoading, setIsBotLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [lastScannedData, setLastScannedData] = useState(() => localStorage.getItem('institute_ai_data_hash') || '');

    // Insight Modal State
    const [selectedInsight, setSelectedInsight] = useState(null);
    const [insightCoursePlan, setInsightCoursePlan] = useState(null);
    const [isCoursePlanLoading, setIsCoursePlanLoading] = useState(false);

    const handleInsightClick = async (insight, forceRefresh = false) => {
        setSelectedInsight(insight);
        setInsightCoursePlan(null);
        
        // 1. Check Frontend Cache first (15-min expiration)
        const cacheKey = `institute_ai_plan_${insight.skillName || insight.skill}`;
        if (!forceRefresh) {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { timestamp, plan } = JSON.parse(cachedData);
                const isExpired = Date.now() - timestamp > 15 * 60 * 1000; // 15 mins
                if (!isExpired) {
                    setInsightCoursePlan(plan);
                    return;
                }
            }
        }

        setIsCoursePlanLoading(true);
        
        try {
            const { data } = await axios.post('/api/institute/management/ai-course-plan', {
                insight,
                metrics
            }, { headers: { token: user.token } });
            
            if (data.success && data.coursePlan) {
                setInsightCoursePlan(data.coursePlan);
                // 2. Save to cache with timestamp
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    plan: data.coursePlan
                }));
            } else {
                setInsightCoursePlan({ error: data.message || 'Failed to generate course plan.' });
            }
        } catch (error) {
            setInsightCoursePlan({ error: 'Failed to connect to AI engine.' });
        } finally {
            setIsCoursePlanLoading(false);
        }
    };

    // Auto-scroll chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isChatLoading, botData]);

    // Fetch Live Data — stale-while-revalidate for instant load
    useEffect(() => {
        const CACHE_KEY = 'inst_dashboard_v1';
        const CACHE_TTL = 60 * 1000; // 60 seconds

        const fetchAlerts = async () => {
            // 1. Show cached data instantly (zero wait)
            try {
                const raw = sessionStorage.getItem(CACHE_KEY);
                if (raw) {
                    const { ts, data } = JSON.parse(raw);
                    if (Date.now() - ts < CACHE_TTL) {
                        setAlerts(data.alerts || []);
                        if (data.metrics) setMetrics(data.metrics);
                        return; // fresh enough — skip network
                    }
                    // stale: paint from cache immediately, then refresh below
                    setAlerts(data.alerts || []);
                    if (data.metrics) setMetrics(data.metrics);
                }
            } catch (_) {}

            // 2. Fetch fresh in background
            try {
                if (user?.token) {
                    const { data } = await axios.get('/api/institute/management/alerts', {
                        headers: { token: user.token }
                    });
                    if (data.success) {
                        setAlerts(data.alerts || []);
                        if (data.metrics) setMetrics(data.metrics);
                        // Save to cache
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                            ts: Date.now(),
                            data: { alerts: data.alerts, metrics: data.metrics }
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch alerts:", error);
            }
        };
        fetchAlerts();
    }, [user]);

    // Cache Invalidation for AI Bot
    useEffect(() => {
        if (alerts.length > 0 || metrics.activeCourses > 0) {
            const currentDataStr = JSON.stringify({ metrics, alerts });
            if (lastScannedData && lastScannedData !== currentDataStr) {
                setBotData(null);
                setChatHistory([]);
                localStorage.removeItem('institute_ai_panel_data');
                localStorage.removeItem('institute_ai_chat_followup');
            }
            setLastScannedData(currentDataStr);
            localStorage.setItem('institute_ai_data_hash', currentDataStr);
        }
    }, [alerts, metrics, lastScannedData]);

    const handleGenerateSummary = async () => {
        setIsBotOpen(true);
        if (botData) return;
        
        setIsBotLoading(true);
        try {
            const { data } = await axios.post('/api/institute/management/ai-summary', {
                metrics,
                alerts
            }, { headers: { token: user.token } });
            
            if (data.success && data.summary && typeof data.summary === 'object') {
                setBotData(data.summary);
                localStorage.setItem('institute_ai_panel_data', JSON.stringify(data.summary));
            } else {
                setBotData({ error: 'Failed to generate recommendations.' });
            }
        } catch (error) {
            setBotData({ error: 'Failed to connect to AI engine.' });
        } finally {
            setIsBotLoading(false);
        }
    };

    const handleSendMessage = async () => {
        const textToSend = chatInput.trim();
        if (!textToSend) return;

        const updatedHistory = [...chatHistory, { role: 'user', text: textToSend }];
        setChatHistory(updatedHistory);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const { data } = await axios.post('/api/institute/management/ai-summary', {
                metrics,
                alerts,
                messages: updatedHistory
            }, { headers: { token: user.token } });
            
            if (data.success && data.isChat) {
                const finalHistory = [...updatedHistory, { role: 'ai', text: data.summary }];
                setChatHistory(finalHistory);
                localStorage.setItem('institute_ai_chat_followup', JSON.stringify(finalHistory));
            }
        } catch (error) {
            setChatHistory([...updatedHistory, { role: 'ai', text: "❌ Sorry, I failed to generate a response. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Auto-trigger on first open
    useEffect(() => {
        if (isBotOpen && !botData && !isBotLoading) {
            handleGenerateSummary();
        }
    }, [isBotOpen]);
    
    // Using real placement data from backend
    const placementData = metrics.placementData || [];

    const criticalAlert = alerts.find(a => a.severity === 'Critical');

    return (
        <div className="space-y-6 pb-24">
            
            {/* Page Header */}
            <header className="mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Institute Operations</p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institute Operations</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Manage your courses, batches, and view AI curriculum insights.</p>
            </header>

            {/* AI Recommendation Banner */}
            {criticalAlert && (
                <div className="bg-red-50 border border-red-200/60 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                    <div className="bg-red-100 p-3 rounded-xl shrink-0 text-red-600 ml-2">
                        <BrainCircuit size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-red-900 text-lg flex items-center gap-2">
                            AI Recommendation: Action Required
                        </h3>
                        <p className="text-red-700/90 text-sm font-medium mt-0.5">
                            {criticalAlert.message}
                        </p>
                        <p className="text-red-900 text-[13px] font-semibold mt-2">
                            {criticalAlert.recommendedAction || 'Consider launching a new course batch to capture demand.'}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsAlertModalOpen(true)}
                        className="shrink-0 bg-white border border-red-200 text-red-700 hover:bg-red-50 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2"
                    >
                        View Details <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                    title="Active Courses" 
                    value={metrics.activeCourses} 
                    subtitle="Currently offered" 
                    bgClass="bg-blue-50" 
                    colorClass="text-blue-600" 
                    icon={<BookOpen size={22} />} 
                />
                <StatCard 
                    title="Total Students" 
                    value={metrics.totalStudents} 
                    subtitle={`Across ${metrics.totalBatches} batches`} 
                    bgClass="bg-emerald-50" 
                    colorClass="text-emerald-600" 
                    icon={<Users size={22} />} 
                />
                <StatCard 
                    title="Placement Rate" 
                    value={`${metrics.overallPlacementRate || 0}%`}
                    subtitle="Overall Placed" 
                    bgClass="bg-amber-50" 
                    colorClass="text-amber-600" 
                    icon={<Activity size={22} />} 
                />
                <StatCard 
                    title="Skill Gap Alerts" 
                    value={alerts.length} 
                    subtitle={alerts.length > 0 ? "Action required (Click)" : "All good"} 
                    bgClass={alerts.length > 0 ? "bg-red-50" : "bg-emerald-50"} 
                    colorClass={alerts.length > 0 ? "text-red-600" : "text-emerald-600"} 
                    icon={<BrainCircuit size={22} />} 
                    onClick={() => { if(alerts.length > 0) setIsAlertModalOpen(true); }}
                />
            </div>

            {/* Layout: Chart & AI Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Placement Performance Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] xl:col-span-2 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Placement Performance</h3>
                                <p className="text-xs font-medium text-slate-500">Compare placement rates across courses</p>
                            </div>
                        </div>
                        <select className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none">
                            <option>This Year</option>
                        </select>
                    </div>

                    <div className="h-[300px] w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={placementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#F8FAFC'}} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                                <Bar dataKey="enrolled" name="Total Students" fill="#93C5FD" radius={[6, 6, 0, 0]} barSize={32} />
                                <Bar dataKey="placed" name="Placed Students" fill="#22C55E" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Curriculum Insights */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} className="text-amber-500" />
                            <h3 className="text-lg font-bold text-slate-900">AI Curriculum Insights</h3>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-5">Based on industry trends and real-time demand</p>
                    
                    <div className="space-y-3 overflow-y-auto pr-1">
                        {alerts.length > 0 ? (
                            alerts.map((alert, idx) => {
                                const style = getInsightColor(alert.skill || alert.skillName || "");
                                const tooltipText = alert.recommendedAction
                                    ? alert.recommendedAction
                                    : `Launch a new course on ${alert.skill || alert.skillName} to fill this market gap.`;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleInsightClick(alert)}
                                        title={`⚠️ ${alert.skill || alert.skillName} Shortage — ${alert.severity || 'High'} Priority\n\n${alert.message}\n\n💡 Action: ${tooltipText}`}
                                        className={`p-4 rounded-xl border ${style.bg} ${style.border} flex items-start gap-3 group cursor-pointer hover:shadow-md transition-all relative`}
                                    >
                                        {/* Hover tooltip badge */}
                                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide ${alert.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'}`}>
                                                {alert.severity || 'Alert'}
                                            </span>
                                        </div>

                                        <div className={`p-2 rounded-lg bg-white shadow-sm shrink-0 ${style.text}`}>
                                            {style.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-[13px] mb-1 capitalize ${style.text}`}>
                                                {alert.skill || alert.skillName} Shortage
                                            </h4>
                                            <p className="text-[12px] text-slate-600 leading-snug line-clamp-2">
                                                {alert.message}
                                            </p>
                                            {/* Inline action hint on hover */}
                                            <p className="text-[11px] text-slate-400 italic mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-1">
                                                💡 {tooltipText}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors mt-2">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-sm text-slate-400 font-medium text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                No new AI insights available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Batches Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <UsersRound size={20} className="text-indigo-600" /> Current Running Batches
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Live batches and their operational status</p>
                    </div>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                        View All Batches <ArrowRight size={16} />
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Batch ID</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trainer</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Students</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[13px]">
                            {metrics.liveBatches && metrics.liveBatches.length > 0 ? (
                                metrics.liveBatches.map(batch => (
                                    <tr key={batch._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{batch.batchCode}</td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{batch.courseId?.name || 'Unknown Course'}</td>
                                        <td className="px-6 py-4 text-slate-600">{batch.trainerId?.name || 'Unassigned'}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{batch.enrolledCount} / {batch.capacity}</td>
                                        <td className="px-6 py-4">
                                            {batch.status === 'In Progress' || batch.status === 'Active' ? (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md text-xs border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Progress
                                                </span>
                                            ) : batch.status === 'Completed' ? (
                                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-xs border border-blue-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Completed
                                                </span>
                                            ) : batch.status === 'Cancelled' ? (
                                                <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-md text-xs border border-red-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Cancelled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-md text-xs border border-amber-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {batch.status || 'Upcoming'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                                        No active batches found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Alerts Modal */}
            {isAlertModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-50 p-2.5 rounded-xl text-red-600 border border-red-100">
                                    <BrainCircuit size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Skill Gap Action Plan</h2>
                                    <p className="text-sm text-slate-500 mt-0.5 font-medium">Review market-driven curriculum recommendations</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAlertModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50">
                            <div className="space-y-4">
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className={`p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow ${alert.severity === 'Critical' ? 'border-red-200/60' : 'border-amber-200/60'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className={`font-bold text-lg capitalize ${alert.severity === 'Critical' ? 'text-red-700' : 'text-amber-700'}`}>
                                                {alert.skill || alert.skillName} Shortage
                                            </h3>
                                            <span className={`text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wide border ${alert.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                        
                                        <p className="text-slate-600 mb-5 text-sm font-medium leading-relaxed">{alert.message}</p>
                                        
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                            <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2 uppercase tracking-wide">
                                                <Activity size={14} className="text-blue-600"/> Recommended Action
                                            </h4>
                                            <p className="text-[13px] font-medium text-blue-800 mb-4">{alert.recommendedAction}</p>
                                            <button 
                                                onClick={() => { setIsAlertModalOpen(false); navigate('/courses'); }}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm shadow-sm"
                                            >
                                                Update Curriculum
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button for Bot */}
            {!isBotOpen && (
                <button
                    onClick={handleGenerateSummary}
                    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(79,70,229,0.4)] transition-all duration-300 group"
                >
                    <Sparkles size={22} className="group-hover:animate-pulse text-indigo-200" />
                    <div className="flex flex-col items-start text-left">
                        <span className="font-bold text-sm leading-tight">AI Summary</span>
                        <span className="text-[10px] font-medium text-indigo-200 hidden sm:block">Get a quick overview</span>
                    </div>
                </button>
            )}

            {/* AI Bot Floating Chat Window (Draggable) */}
            {isBotOpen && (
                <Rnd
                    default={{ 
                        x: (window.innerWidth / 2) - 200, 
                        y: (window.innerHeight / 2) - 275, 
                        width: 400, 
                        height: 550 
                    }}
                    minWidth={300} minHeight={400}
                    bounds="window"
                    dragHandleClassName="drag-header"
                    className="z-50 bg-white rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden"
                    style={{ position: 'fixed' }}
                >
                    <div className="w-full h-full flex flex-col">
                    <div className="drag-header cursor-move bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white flex items-center justify-between z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-xl">
                                <Sparkles size={20} className="text-indigo-200" />
                            </div>
                            <div>
                                <h2 className="text-[15px] font-bold flex items-center gap-2 tracking-wide">
                                    AI Strategy Advisor
                                </h2>
                                <p className="text-indigo-200 text-[11px] font-medium flex items-center gap-1">
                                    <GripHorizontal size={12} /> Drag to move
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsBotOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-indigo-100">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col custom-scrollbar">
                        {isBotLoading && !botData && (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
                                <p className="font-medium">Analyzing dashboard data...</p>
                                <p className="text-xs mt-2">Generating premium recommendations</p>
                            </div>
                        )}

                        {botData && botData.error && (
                            <div className="p-5 text-center text-red-500 font-medium">
                                {botData.error}
                            </div>
                        )}

                        {botData && !botData.error && (
                            <div className="p-4 md:p-5 space-y-6">
                                {/* Section 1: Recommended Courses */}
                                {botData.courses && botData.courses.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Target size={18} className="text-indigo-600" />
                                            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Recommended Courses</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {botData.courses.map((course, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-slate-900">{course.name}</h4>
                                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                                                            course.demand === 'Critical' ? 'bg-red-100 text-red-700' : 
                                                            course.demand === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {course.demand} Demand
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{course.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Section 2: Recommended Batch Capacity */}
                                {botData.capacities && botData.capacities.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users size={18} className="text-emerald-600" />
                                            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Batch Capacity</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {botData.capacities.map((cap, idx) => (
                                                <div key={idx} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                                                    <h4 className="font-semibold text-emerald-900 text-[13px] mb-1">{cap.course}</h4>
                                                    <div className="text-2xl font-black text-emerald-600 my-1">{cap.capacity}</div>
                                                    <p className="text-[11px] text-emerald-700/80 font-medium mt-1 leading-snug">{cap.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Section 3: Priority Actions */}
                                {botData.priorities && botData.priorities.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <PlayCircle size={18} className="text-amber-600" />
                                            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Priority Actions</h3>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                            {botData.priorities.map((action, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${action.priority === 'HIGH' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                                                    <p className="text-[13px] text-slate-700 font-medium flex-1">{action.action}</p>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${action.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {action.priority}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Section 4: Performance Improvement */}
                                {botData.improvements && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <TrendingUp size={18} className="text-blue-600" />
                                            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Growth Strategy</h3>
                                        </div>
                                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                                            {botData.improvements.addSkills && (
                                                <div>
                                                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide block mb-1">Modules to Add</span>
                                                    <p className="text-[13px] text-blue-900/80 font-medium">{botData.improvements.addSkills}</p>
                                                </div>
                                            )}
                                            {botData.improvements.increaseEnrollments && (
                                                <div>
                                                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide block mb-1">Increase Enrollments</span>
                                                    <p className="text-[13px] text-blue-900/80 font-medium">{botData.improvements.increaseEnrollments}</p>
                                                </div>
                                            )}
                                            {botData.improvements.improvePlacements && (
                                                <div>
                                                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide block mb-1">Improve Placements</span>
                                                    <p className="text-[13px] text-blue-900/80 font-medium">{botData.improvements.improvePlacements}</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Section 5: AI Insight */}
                                {botData.insight && (
                                    <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 opacity-10">
                                            <Lightbulb size={100} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2 text-indigo-200">
                                                <Lightbulb size={16} />
                                                <h3 className="font-bold text-[11px] tracking-widest uppercase">AI Key Insight</h3>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed">"{botData.insight}"</p>
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                        
                        {/* Chat Follow-up Section */}
                        {botData && !botData.error && (
                            <div className="px-4 md:px-5 pb-4 space-y-4">
                                {chatHistory.length > 0 && <hr className="border-slate-200/60 my-2" />}
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'ai' && (
                                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mr-2 border border-indigo-200 mt-1">
                                                <Sparkles size={14} />
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] font-medium shadow-sm border ${
                                            msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-sm border-indigo-700' 
                                            : 'bg-white text-slate-800 rounded-tl-sm border-slate-200'
                                        }`}>
                                            {msg.role === 'user' ? (
                                                msg.text
                                            ) : (
                                                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:marker:text-indigo-600 prose-headings:text-indigo-900 font-medium">
                                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex w-full justify-start">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mr-2 border border-indigo-200 mt-1">
                                            <Sparkles size={14} />
                                        </div>
                                        <div className="bg-white border border-slate-200 py-3 px-5 rounded-2xl rounded-tl-sm text-[13px] shadow-sm flex items-center gap-3">
                                            <Loader2 size={16} className="animate-spin text-indigo-600" />
                                            <span className="text-slate-500 font-semibold">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                    
                    {botData && !botData.error && (
                        <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                className="flex items-center gap-2 mb-2"
                            >
                                <input 
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask a follow-up question..."
                                    className="flex-1 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={!chatInput.trim() || isChatLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-sm transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase text-center">
                                AI recommendations are generated based on current dashboard metrics.
                            </p>
                        </div>
                    )}
                    
                    {(!botData || botData.error) && (
                        <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                            <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase text-center">
                                AI recommendations are generated based on current dashboard metrics.
                            </p>
                        </div>
                    )}
                    </div>
                </Rnd>
            )}

            {/* AI Course Plan Modal */}
            {selectedInsight && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600">
                            <div className="flex items-center gap-2 text-white">
                                <Sparkles size={24} className="text-indigo-200" />
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">AI Course Strategy</h3>
                                    <p className="text-indigo-200 text-xs font-medium capitalize">{selectedInsight.skillName || selectedInsight.skill} Plan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleInsightClick(selectedInsight, true)}
                                    title="Regenerate Plan"
                                    className="text-indigo-200 hover:text-white bg-indigo-700/50 hover:bg-indigo-700 p-2 rounded-full transition-colors flex items-center justify-center group"
                                >
                                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                                <button 
                                    onClick={() => setSelectedInsight(null)}
                                    className="text-indigo-200 hover:text-white bg-indigo-700/50 hover:bg-indigo-700 p-2 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
                            {isCoursePlanLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                                    <p className="font-medium text-slate-600">AI is designing the curriculum...</p>
                                    <p className="text-xs mt-2">Analyzing market demand and building modules</p>
                                </div>
                            ) : insightCoursePlan && !insightCoursePlan.error ? (
                                <div className="space-y-6">
                                    {/* Header info */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <h2 className="text-xl font-black text-slate-800 mb-2">{insightCoursePlan.courseName}</h2>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{insightCoursePlan.demandReason}</p>
                                        
                                        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Clock size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</p>
                                                    <p className="font-bold text-slate-700">{insightCoursePlan.duration}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><Users size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Capacity</p>
                                                    <p className="font-bold text-slate-700">{insightCoursePlan.batchCapacity}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Target size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Audience</p>
                                                    <p className="font-bold text-slate-700">{insightCoursePlan.targetAudience}</p>
                                                </div>
                                            </div>
                                            {insightCoursePlan.prerequisites && (
                                                <div className="flex items-center gap-2 w-full mt-2 pt-3 border-t border-slate-50">
                                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><Code size={18} /></div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prerequisites</p>
                                                        <p className="font-bold text-slate-700">{insightCoursePlan.prerequisites}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Curriculum */}
                                    <div>
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <BookOpen size={18} className="text-indigo-600" />
                                            Recommended Curriculum
                                        </h3>
                                        <div className="space-y-3">
                                            {insightCoursePlan.curriculum?.map((mod, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                                    <h4 className="font-bold text-sm text-slate-900 mb-2">{mod.module}</h4>
                                                    <ul className="space-y-1">
                                                        {mod.topics?.map((topic, tidx) => (
                                                            <li key={tidx} className="flex items-start gap-2 text-[13px] text-slate-600">
                                                                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                                                <span>{topic}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-red-500 font-medium py-10">
                                    {insightCoursePlan?.error || "Failed to load plan."}
                                </div>
                            )}
                        </div>

                        <div className="p-5 bg-white border-t border-slate-200 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedInsight(null)}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedInsight(null);
                                    navigate('/courses');
                                }}
                                disabled={isCoursePlanLoading || (insightCoursePlan && insightCoursePlan.error)}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                            >
                                Go to Courses <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Dashboard;
