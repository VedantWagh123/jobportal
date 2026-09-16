import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
    Briefcase, BookOpen, Users, AlertTriangle, 
    Building, MapPin, Calendar, Download, RefreshCw,
    BarChart3, LineChart as LineChartIcon, Lightbulb, ArrowRight, TrendingUp, X, Maximize2
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Legend, AreaChart, Area
} from 'recharts';
import maharashtraMapImg from '../assets/maharashtra_map.png';

/* ─────────────────────────────────────────────────────────
   REUSABLE COMPONENTS
───────────────────────────────────────────────────────── */
const Sparkline = ({ color, variant = 1 }) => {
    // Generate different smooth paths for visual variety
    const paths = {
        1: "M0,25 C20,20 30,28 50,15 C70,2 80,10 100,5",
        2: "M0,15 C20,25 40,5 60,18 C80,25 90,5 100,10",
        3: "M0,20 C30,10 40,25 60,5 C75,-5 85,20 100,15",
    };
    const d = paths[variant] || paths[1];
    
    return (
        <div className="h-10 w-full mt-3 -mx-1 -mb-1 opacity-80">
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${d} L100,30 L0,30 Z`} fill={`url(#grad-${color.replace('#', '')})`} />
                <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
            </svg>
        </div>
    );
};

const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-gray-50/50 rounded-xl border border-gray-100 border-dashed p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <Icon size={18} className="text-gray-400" />
        </div>
        <h4 className="text-[13px] font-bold text-gray-700">{title}</h4>
        <p className="text-[11px] text-gray-500 font-medium mt-1 max-w-[200px]">{message}</p>
    </div>
);

const TrendBadge = ({ value }) => {
    if (!value) return null;
    const isPositive = value.startsWith('+');
    return (
        <span className={`text-[11px] font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            <TrendingUp size={12} className={!isPositive ? 'rotate-180' : ''} /> {value}
        </span>
    );
};

const CustomGapTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const gapValue = data.gapValue !== undefined ? data.gapValue : (data.demand - data.supply);
        const isShortage = gapValue > 0;
        const action = data.action || (gapValue > 50 ? 'Increase training seats' : gapValue > 0 ? 'Start new batches' : 'Monitor situation');
        
        return (
            <div className={`bg-white p-3 rounded-xl border shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-[12px] min-w-[220px] z-50 relative ${isShortage ? 'border-red-100' : 'border-blue-100'}`}>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <AlertTriangle size={14} className={isShortage ? "text-red-500" : "text-blue-500"}/>
                    <p className="font-bold text-gray-900 uppercase tracking-wider">{data.skill || data.name}</p>
                </div>
                <div className="space-y-1.5 mb-2.5 text-gray-500 font-medium text-[11px]">
                    <p className="flex justify-between"><span>Market Demand (Jobs):</span> <span className="font-bold text-gray-800">{data.demand}</span></p>
                    <p className="flex justify-between"><span>Available Supply (Candidates):</span> <span className="font-bold text-gray-800">{data.supply}</span></p>
                    <div className="w-full h-px bg-gray-50 my-1"></div>
                    <p className={`flex justify-between ${isShortage ? 'text-red-600' : 'text-emerald-600'}`}>
                        <span>{isShortage ? 'Net Shortage (Gap):' : 'Net Surplus:'}</span> 
                        <span className="font-black text-[12px]">{isShortage ? `-${gapValue}` : `+${Math.abs(gapValue)}`}</span>
                    </p>
                </div>
                <div className={`${isShortage ? 'bg-red-50/80 border-red-100/50' : 'bg-emerald-50/80 border-emerald-100/50'} p-2 rounded-lg border`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isShortage ? 'text-red-400' : 'text-emerald-500'}`}>Solution</p>
                    <p className={`${isShortage ? 'text-red-700' : 'text-emerald-700'} font-bold leading-tight`}>{action}</p>
                </div>
            </div>
        );
    }
    return null;
};

/* ─────────────────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
───────────────────────────────────────────────────────── */
const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useSocket();
    const [analytics, setAnalytics] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [lockedTooltip, setLockedTooltip] = useState(null);
    const [showAllGaps, setShowAllGaps] = useState(false);
    const [showAllVacancies, setShowAllVacancies] = useState(false);
    const [showAllJobs, setShowAllJobs] = useState(false);
    const [showAllCapacity, setShowAllCapacity] = useState(false);
    const [showAllEnrollments, setShowAllEnrollments] = useState(false);
    const [showAllInstitutes, setShowAllInstitutes] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    
    const defaultState = user?.stateName || 'Maharashtra';
    const [selectedState, setSelectedState] = useState(defaultState);
    const [selectedDistrict, setSelectedDistrict] = useState('All Districts');

    const fetchData = async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            if (token) {
                let dashParams = [];
                if (selectedState && selectedState !== 'All India') dashParams.push(`state=${encodeURIComponent(selectedState)}`);
                if (selectedDistrict && selectedDistrict !== 'All Districts') dashParams.push(`district=${encodeURIComponent(selectedDistrict)}`);
                const dashQuery = dashParams.length > 0 ? `?${dashParams.join('&')}` : '';
                
                const stateParam = selectedState && selectedState !== 'All India' ? `?state=${encodeURIComponent(selectedState)}` : '';
                
                const [dashRes, distRes] = await Promise.all([
                    axios.get(`/api/state-admin/intelligence/dashboard${dashQuery}`, { headers: { token } }),
                    axios.get(`/api/state-admin/intelligence/districts${stateParam}`, { headers: { token } })
                ]);
                
                if (dashRes.data?.success) {
                    setAnalytics(dashRes.data.analytics);
                }
                if (distRes.data?.success) {
                    setDistricts(distRes.data.districts || []);
                }
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            if (!silent) setLoading(false);
            if (!silent) setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, [user, selectedState, selectedDistrict]);

    useEffect(() => {
        if (!socket) return;
        
        let timeoutId;
        const handleStaleData = () => {
            // Debounce silent fetch by 2 seconds to let DB operations finish and prevent rapid-fire fetches
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fetchData(true);
            }, 2000);
        };

        socket.on('dashboard_stale', handleStaleData);
        
        return () => {
            socket.off('dashboard_stale', handleStaleData);
            clearTimeout(timeoutId);
        };
    }, [socket, selectedState]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 text-[12px] font-bold tracking-widest uppercase animate-pulse">Scanning Intelligence...</p>
        </div>
    );

    // Data Processing
    const currentAnalytics = analytics || {};
    const kpis = currentAnalytics.kpis || { totalVacancies: 0, totalEnrollments: 0, trainingCapacity: 0, totalInstitutes: 0, totalJobs: 0 };
    const supplyVsDemandData = currentAnalytics.supplyVsDemand || [];
    const supplyGapTable = currentAnalytics.supplyGapTable || [];
    const topDistrictsByGap = currentAnalytics.topDistrictsByGap || [];
    const demandTrendData = currentAnalytics.demandTrend || [];
    const alerts = currentAnalytics.activeAlerts || [];

    // Formatted Data for Charts
    const demandRankedData = [...supplyVsDemandData].sort((a, b) => b.demand - a.demand).slice(0, 5);
    const shortagesData = supplyGapTable
        .map(g => ({ ...g, gapValue: parseInt(g.gap) || 0 }))
        .filter(g => g.gapValue > 0)
        .sort((a, b) => b.gapValue - a.gapValue)
        .slice(0, 5);
    
    // Prepare fake trend data ONLY if backend is completely empty for trend (to avoid empty chart looking broken)
    // Normally, backend should provide this. If demandTrendData is empty, we fallback to a safe empty array,
    // but area chart needs data to render the curve properly.
    const trendData = demandTrendData.length > 0 ? demandTrendData : [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full min-h-screen bg-[#F4F7FC]">
            
            {/* ═══════════════════════════════════════════
                HERO HEADER (With Gateway of India)
            ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                
                {/* Visual Background Element */}
                <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none overflow-hidden rounded-r-[24px] flex justify-end">
                    {/* Fallback to subtle gradient if image not fully loaded/placed */}
                    <div className="absolute inset-0 bg-gradient-to-l from-blue-50/80 via-transparent to-transparent z-10"></div>
                    <img 
                        src="/gateway_of_india.png" 
                        alt="Gateway of India" 
                        className="h-[140%] w-auto object-contain object-right opacity-70 translate-x-12 -translate-y-8 relative z-0 mix-blend-multiply grayscale contrast-125"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
                
                <div className="relative z-10 flex-1 w-full max-w-2xl">
                    <nav className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        <span>Home</span> <span className="text-gray-300">›</span> <span className="text-blue-600">{selectedState} Intelligence Dashboard</span>
                    </nav>
                    
                    <h1 className="text-2xl md:text-[28px] font-black text-gray-900 tracking-tight flex items-center gap-3 leading-tight">
                        <BarChart3 size={28} className="text-blue-600"/>
                        {selectedState} Skill Intelligence Dashboard
                    </h1>
                    
                    <p className="text-gray-500 text-[13px] font-medium mt-2 leading-relaxed">
                        Real-time analysis of skill demand, supply, workforce gaps and training capacity across India.
                    </p>
                    
                    <div className="mt-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <p className="text-[11px] font-bold text-gray-500 tracking-wide">
                            Last updated: {lastUpdated.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}, {lastUpdated.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12: true})}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-3 w-full xl:w-auto self-end">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <select className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 cursor-pointer pr-4">
                            <option>Apr 2024 - Mar 2025</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 shadow-sm text-blue-700">
                        <MapPin size={14} />
                        <span className="text-[12px] font-bold">{selectedState}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <MapPin size={14} className="text-gray-400" />
                        <select 
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 cursor-pointer pr-4"
                        >
                            <option value="All Districts">All Districts</option>
                            {districts.map((d, i) => (
                                <option key={i} value={d.districtName}>{d.districtName}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        onClick={() => fetchData()} 
                        disabled={refreshing} 
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    
                    <button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-5 py-2 rounded-lg text-[12px] font-bold shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition-all w-full sm:w-auto">
                        <Download size={14} /> Download Report
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                6 KPI CARDS
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { title: 'Total Job Postings', val: (kpis.totalJobs||0).toLocaleString(), sub: 'Active Corporate Posts', icon: <Briefcase size={20} strokeWidth={2.5} className="text-[#3b82f6]"/>, bg: 'bg-[#eff6ff]', color: '#3b82f6', v: 1 },
                    { title: 'Total Vacancies', val: (kpis.totalVacancies||0).toLocaleString(), sub: 'Total Hiring Demand', icon: <Briefcase size={20} strokeWidth={2.5} className="text-[#3b82f6]"/>, bg: 'bg-[#eff6ff]', color: '#3b82f6', v: 2 },
                    { title: 'Critical Gaps', val: (kpis.totalShortages||0).toLocaleString(), sub: 'Skills needing attention', icon: <AlertTriangle size={20} strokeWidth={2.5} className="text-[#f59e0b]"/>, bg: 'bg-[#fffbeb]', color: '#f59e0b', v: 3 },
                    { title: 'Training Capacity', val: (kpis.trainingCapacity||0).toLocaleString(), sub: 'Across all institutes', icon: <BookOpen size={20} strokeWidth={2.5} className="text-[#10b981]"/>, bg: 'bg-[#ecfdf5]', color: '#10b981', v: 1 },
                    { title: 'Total Enrollments', val: (kpis.totalEnrollments||0).toLocaleString(), sub: 'Candidate Supply', icon: <Users size={20} strokeWidth={2.5} className="text-[#a855f7]"/>, bg: 'bg-[#faf5ff]', color: '#a855f7', v: 2 },
                    { title: 'Active Institutes', val: (kpis.totalInstitutes||0).toLocaleString(), sub: `In ${selectedState}`, icon: <Building size={20} strokeWidth={2.5} className="text-[#f43f5e]"/>, bg: 'bg-[#fff1f2]', color: '#f43f5e', v: 3 }
                ].map((kpi, i) => (
                    <div key={i} onDoubleClick={() => setLockedTooltip(kpi.title)} className="bg-white rounded-[16px] pt-5 px-5 pb-0 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-lg transition-shadow group relative">
                        {/* Custom Tooltip for Critical Gaps */}
                        {kpi.title === 'Critical Gaps' && (
                            <div className={`absolute left-0 md:left-full md:ml-4 top-0 md:top-1/2 md:-translate-y-1/2 w-[280px] bg-white text-gray-900 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-4 border border-gray-200 transition-all duration-300 z-50 ${lockedTooltip === 'Critical Gaps' ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none'}`}>
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-black text-[13px] text-gray-900 flex items-center gap-2">
                                        <AlertTriangle size={15} className="text-orange-500" /> Critical Shortages
                                    </h4>
                                    {lockedTooltip === 'Critical Gaps' && (
                                        <button onClick={(e) => { e.stopPropagation(); setLockedTooltip(null); setShowAllGaps(false); }} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors pointer-events-auto">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-gray-500 mb-4 leading-relaxed border-b border-gray-100 pb-2">
                                    Demand exceeds supply for these skills. Focus on training programs.
                                </p>
                                <ul className={`text-[12px] space-y-2.5 overflow-y-auto pr-1 custom-scrollbar ${showAllGaps ? 'max-h-[250px]' : ''}`}>
                                    {supplyGapTable.filter(g => (parseInt(g.gap) || 0) > 0).slice(0, showAllGaps ? 100 : 5).map((g, idx) => (
                                        <li key={idx} className="flex flex-col gap-1 group/item py-0.5 border-b border-gray-50 last:border-0 pb-1.5 last:pb-0">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></div>
                                                    <span className="font-bold text-gray-700 truncate">{g.skill}</span> 
                                                </div>
                                                <span className="text-orange-600 font-black bg-orange-50 px-2 py-0.5 rounded shadow-sm text-[10px] whitespace-nowrap">{g.gap} Gap</span>
                                            </div>
                                            <div className="pl-3.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                                                <ArrowRight size={10} className="text-blue-500 shrink-0" /> 
                                                <span className="truncate">Action: <span className="font-semibold text-blue-600">{g.action}</span></span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {(kpis.totalShortages || 0) > 5 && !showAllGaps && (
                                    <div className="mt-3 text-center border-t border-gray-100 pt-2.5">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowAllGaps(true); setLockedTooltip('Critical Gaps'); }} 
                                            className="text-[10px] w-full font-bold text-blue-600 hover:text-white hover:bg-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-2 rounded-lg transition-colors pointer-events-auto cursor-pointer"
                                        >
                                            + {(kpis.totalShortages || 0) - 5} MORE SKILLS
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom Tooltip for Total Job Postings */}
                        {kpi.title === 'Total Job Postings' && (
                            <div className={`absolute left-0 md:left-full md:ml-4 top-0 md:top-1/2 md:-translate-y-1/2 w-[280px] bg-white text-gray-900 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-4 border border-gray-200 transition-all duration-300 z-50 ${lockedTooltip === 'Total Job Postings' ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none'}`}>
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-black text-[13px] text-gray-900 flex items-center gap-2">
                                        <Briefcase size={15} className="text-blue-500" /> Active Job Posts
                                    </h4>
                                    {lockedTooltip === 'Total Job Postings' && (
                                        <button onClick={(e) => { e.stopPropagation(); setLockedTooltip(null); setShowAllJobs(false); }} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors pointer-events-auto">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-gray-500 mb-4 leading-relaxed border-b border-gray-100 pb-2">
                                    Number of unique active job postings by employers per district.
                                </p>
                                <ul className={`text-[12px] space-y-2.5 overflow-y-auto pr-1 custom-scrollbar ${showAllJobs ? 'max-h-[250px]' : ''}`}>
                                    {(analytics?.districtDetails || []).filter(d => d.jobPosts > 0).sort((a, b) => b.jobPosts - a.jobPosts).slice(0, showAllJobs ? 100 : 5).map((d, idx) => (
                                        <li key={idx} className="flex justify-between items-center group/item">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                                <span className="font-bold text-gray-700 truncate">{d.districtName}</span> 
                                            </div>
                                            <span className="text-blue-600 font-black bg-blue-50 px-2 py-0.5 rounded shadow-sm text-[10px] whitespace-nowrap">{d.jobPosts} Posts</span>
                                        </li>
                                    ))}
                                    {(analytics?.districtDetails || []).filter(d => d.jobPosts > 0).length === 0 && (
                                        <li className="text-gray-400 text-center py-2 italic text-[11px]">No job postings found</li>
                                    )}
                                </ul>
                                {((analytics?.districtDetails || []).filter(d => d.jobPosts > 0).length) > 5 && !showAllJobs && (
                                    <div className="mt-3 text-center border-t border-gray-100 pt-2.5">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowAllJobs(true); setLockedTooltip('Total Job Postings'); }} 
                                            className="text-[10px] w-full font-bold text-blue-600 hover:text-white hover:bg-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-2 rounded-lg transition-colors pointer-events-auto cursor-pointer"
                                        >
                                            + {((analytics?.districtDetails || []).filter(d => d.jobPosts > 0).length) - 5} MORE DISTRICTS
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom Tooltip for Total Vacancies */}
                        {kpi.title === 'Total Vacancies' && (
                            <div className={`absolute left-0 md:left-full md:ml-4 top-0 md:top-1/2 md:-translate-y-1/2 w-[280px] bg-white text-gray-900 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-4 border border-gray-200 transition-all duration-300 z-50 ${lockedTooltip === 'Total Vacancies' ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none'}`}>
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-black text-[13px] text-gray-900 flex items-center gap-2">
                                        <Briefcase size={15} className="text-blue-500" /> Vacancies Breakdown
                                    </h4>
                                    {lockedTooltip === 'Total Vacancies' && (
                                        <button onClick={(e) => { e.stopPropagation(); setLockedTooltip(null); setShowAllVacancies(false); }} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors pointer-events-auto">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-gray-500 mb-4 leading-relaxed border-b border-gray-100 pb-2">
                                    Distribution of active job vacancies across top districts.
                                </p>
                                <ul className={`text-[12px] space-y-2.5 overflow-y-auto pr-1 custom-scrollbar ${showAllVacancies ? 'max-h-[250px]' : ''}`}>
                                    {(analytics?.districtDetails || []).filter(d => d.jobs > 0).sort((a, b) => b.jobs - a.jobs).slice(0, showAllVacancies ? 100 : 5).map((d, idx) => (
                                        <li key={idx} className="flex justify-between items-center group/item">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                                <span className="font-bold text-gray-700 truncate">{d.districtName}</span> 
                                            </div>
                                            <span className="text-blue-600 font-black bg-blue-50 px-2 py-0.5 rounded shadow-sm text-[10px] whitespace-nowrap">{d.jobs}</span>
                                        </li>
                                    ))}
                                    {(analytics?.districtDetails || []).filter(d => d.jobs > 0).length === 0 && (
                                        <li className="text-gray-400 text-center py-2 italic text-[11px]">No vacancies found</li>
                                    )}
                                </ul>
                                {((analytics?.districtDetails || []).filter(d => d.jobs > 0).length) > 5 && !showAllVacancies && (
                                    <div className="mt-3 text-center border-t border-gray-100 pt-2.5">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowAllVacancies(true); setLockedTooltip('Total Vacancies'); }} 
                                            className="text-[10px] w-full font-bold text-blue-600 hover:text-white hover:bg-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-2 rounded-lg transition-colors pointer-events-auto cursor-pointer"
                                        >
                                            + {((analytics?.districtDetails || []).filter(d => d.jobs > 0).length) - 5} MORE DISTRICTS
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom Tooltip for Training Capacity */}
                        {kpi.title === 'Training Capacity' && (
                            <div className={`absolute left-0 md:left-full md:ml-4 top-0 md:top-1/2 md:-translate-y-1/2 w-[280px] bg-white text-gray-900 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-4 border border-gray-200 transition-all duration-300 z-50 ${lockedTooltip === 'Training Capacity' ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none'}`}>
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-black text-[13px] text-gray-900 flex items-center gap-2">
                                        <BookOpen size={15} className="text-emerald-500" /> Capacity Breakdown
                                    </h4>
                                    {lockedTooltip === 'Training Capacity' && (
                                        <button onClick={(e) => { e.stopPropagation(); setLockedTooltip(null); setShowAllCapacity(false); }} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors pointer-events-auto">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-gray-500 mb-4 leading-relaxed border-b border-gray-100 pb-2">
                                    Number of available training seats per district.
                                </p>
                                <ul className={`text-[12px] space-y-2.5 overflow-y-auto pr-1 custom-scrollbar ${showAllCapacity ? 'max-h-[250px]' : ''}`}>
                                    {(analytics?.districtDetails || []).filter(d => d.capacity > 0).sort((a, b) => b.capacity - a.capacity).slice(0, showAllCapacity ? 100 : 5).map((d, idx) => (
                                        <li key={idx} className="flex justify-between items-center group/item">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                                <span className="font-bold text-gray-700 truncate">{d.districtName}</span> 
                                            </div>
                                            <span className="text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded shadow-sm text-[10px] whitespace-nowrap">{d.capacity} Seats</span>
                                        </li>
                                    ))}
                                    {(analytics?.districtDetails || []).filter(d => d.capacity > 0).length === 0 && (
                                        <li className="text-gray-400 text-center py-2 italic text-[11px]">No capacity found</li>
                                    )}
                                </ul>
                                {((analytics?.districtDetails || []).filter(d => d.capacity > 0).length) > 5 && !showAllCapacity && (
                                    <div className="mt-3 text-center border-t border-gray-100 pt-2.5">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowAllCapacity(true); setLockedTooltip('Training Capacity'); }} 
                                            className="text-[10px] w-full font-bold text-emerald-600 hover:text-white hover:bg-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-2 rounded-lg transition-colors pointer-events-auto cursor-pointer"
                                        >
                                            + {((analytics?.districtDetails || []).filter(d => d.capacity > 0).length) - 5} MORE DISTRICTS
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom Tooltip for Total Enrollments */}
                        {kpi.title === 'Total Enrollments' && (
                            <div className={`absolute left-0 md:left-full md:ml-4 top-0 md:top-1/2 md:-translate-y-1/2 w-[280px] bg-white text-gray-900 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-4 border border-gray-200 transition-all duration-300 z-50 ${lockedTooltip === 'Total Enrollments' ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none'}`}>
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-black text-[13px] text-gray-900 flex items-center gap-2">
                                        <Users size={15} className="text-purple-500" /> Enrollment Breakdown
                                    </h4>
                                    {lockedTooltip === 'Total Enrollments' && (
                                        <button onClick={(e) => { e.stopPropagation(); setLockedTooltip(null); setShowAllEnrollments(false); }} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors pointer-events-auto">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-gray-500 mb-4 leading-relaxed border-b border-gray-100 pb-2">
                                    Candidate supply currently enrolled across districts.
                                </p>
                                <ul className={`text-[12px] space-y-2.5 overflow-y-auto pr-1 custom-scrollbar ${showAllEnrollments ? 'max-h-[250px]' : ''}`}>
                                    {(analytics?.districtDetails || []).filter(d => d.enrollments > 0).sort((a, b) => b.enrollments - a.enrollments).slice(0, showAllEnrollments ? 100 : 5).map((d, idx) => (
                                        <li key={idx} className="flex justify-between items-center group/item">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></div>
                                                <span className="font-bold text-gray-700 truncate">{d.districtName}</span> 
                                            </div>
                                            <span className="text-purple-600 font-black bg-purple-50 px-2 py-0.5 rounded shadow-sm text-[10px] whitespace-nowrap">{d.enrollments} Enrolled</span>
                                        </li>
                                    ))}
                                    {(analytics?.districtDetails || []).filter(d => d.enrollments > 0).length === 0 && (
                                        <li className="text-gray-400 text-center py-2 italic text-[11px]">No enrollments found</li>
                                    )}
                                </ul>
                                {((analytics?.districtDetails || []).filter(d => d.enrollments > 0).length) > 5 && !showAllEnrollments && (
                                    <div className="mt-3 text-center border-t border-gray-100 pt-2.5">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowAllEnrollments(true); setLockedTooltip('Total Enrollments'); }} 
                                            className="text-[10px] w-full font-bold text-purple-600 hover:text-white hover:bg-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-2 rounded-lg transition-colors pointer-events-auto cursor-pointer"
                                        >
                                            + {((analytics?.districtDetails || []).filter(d => d.enrollments > 0).length) - 5} MORE DISTRICTS
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom Tooltip for Active Institutes */}
                        {kpi.title === 'Active Institutes' && (
                            <div className={`absolute right-0 top-[105%] w-[280px] bg-white text-gray-900 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-4 border border-gray-200 transition-all duration-300 z-50 ${lockedTooltip === 'Active Institutes' ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none'}`}>
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-black text-[13px] text-gray-900 flex items-center gap-2">
                                        <Building size={15} className="text-rose-500" /> Institutes Breakdown
                                    </h4>
                                    {lockedTooltip === 'Active Institutes' && (
                                        <button onClick={(e) => { e.stopPropagation(); setLockedTooltip(null); setShowAllInstitutes(false); }} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors pointer-events-auto">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-gray-500 mb-4 leading-relaxed border-b border-gray-100 pb-2">
                                    Number of registered training institutes per district.
                                </p>
                                <ul className={`text-[12px] space-y-2.5 overflow-y-auto pr-1 custom-scrollbar ${showAllInstitutes ? 'max-h-[250px]' : ''}`}>
                                    {(analytics?.districtDetails || []).filter(d => d.institutes > 0).sort((a, b) => b.institutes - a.institutes).slice(0, showAllInstitutes ? 100 : 5).map((d, idx) => (
                                        <li key={idx} className="flex justify-between items-center group/item">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></div>
                                                <span className="font-bold text-gray-700 truncate">{d.districtName}</span> 
                                            </div>
                                            <span className="text-rose-600 font-black bg-rose-50 px-2 py-0.5 rounded shadow-sm text-[10px] whitespace-nowrap">{d.institutes} Institutes</span>
                                        </li>
                                    ))}
                                    {(analytics?.districtDetails || []).filter(d => d.institutes > 0).length === 0 && (
                                        <li className="text-gray-400 text-center py-2 italic text-[11px]">No institutes found</li>
                                    )}
                                </ul>
                                {((analytics?.districtDetails || []).filter(d => d.institutes > 0).length) > 5 && !showAllInstitutes && (
                                    <div className="mt-3 text-center border-t border-gray-100 pt-2.5">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowAllInstitutes(true); setLockedTooltip('Active Institutes'); }} 
                                            className="text-[10px] w-full font-bold text-rose-600 hover:text-white hover:bg-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-2 rounded-lg transition-colors pointer-events-auto cursor-pointer"
                                        >
                                            + {((analytics?.districtDetails || []).filter(d => d.institutes > 0).length) - 5} MORE DISTRICTS
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${kpi.bg}`}>
                                    {kpi.icon}
                                </div>
                                <TrendBadge value={kpi.t} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.title}</p>
                                <h3 className="text-[26px] font-black text-gray-900 leading-none mt-1.5 mb-1">{kpi.val}</h3>
                                <p className="text-[11px] font-medium text-blue-600/70">{kpi.sub}</p>
                            </div>
                        </div>
                        <div className="rounded-b-[16px] overflow-hidden -mx-5">
                            <Sparkline color={kpi.color} variant={kpi.v} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════════════════════════════════
                ROW 1: CHARTS & LISTS
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Highest Demand Skills */}
                <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <div className="mt-1"><BarChart3 size={18} className="text-blue-600"/></div>
                            <div>
                                <h3 className="text-[15px] font-black text-gray-900">Highest Demand Skills</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Ranked by active job vacancies</p>
                            </div>
                        </div>
                        <button className="text-[11px] font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-[8px] hover:bg-gray-50">View All</button>
                    </div>
                    <div className="flex-1 min-h-[220px]">
                        {demandRankedData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={demandRankedData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} width={80} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight:'bold' }}/>
                                    <Bar dataKey="demand" name="Vacancies" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16}>
                                        {/* Optional custom labels at end of bars could go here */}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState icon={BarChart3} title="No Data" message="No active job vacancies found." />}
                    </div>
                </div>

                {/* 2. Demand vs Supply Comparison */}
                <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <div className="mt-1 w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full"><BookOpen size={14}/></div>
                            <div>
                                <h3 className="text-[15px] font-black text-gray-900">Demand vs Supply Comparison</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Market requirements vs Current candidates</p>
                            </div>
                        </div>
                        <button className="text-[11px] font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-[8px] hover:bg-gray-50">View Details</button>
                    </div>
                    <div className="flex-1 min-h-[220px]">
                        {supplyVsDemandData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={supplyVsDemandData.slice(0, 5)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                    <Tooltip content={<CustomGapTooltip />} cursor={{fill: '#f8fafc'}} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }} />
                                    <Bar dataKey="supply" name="Available Supply" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
                                    <Bar dataKey="demand" name="Market Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState icon={BarChart3} title="No Data" message="Insufficient data for comparison." />}
                    </div>
                </div>

                {/* 3. Skill Demand Across Regions */}
                <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <div className="mt-1"><MapPin size={18} className="text-blue-600"/></div>
                            <div>
                                <h3 className="text-[15px] font-black text-gray-900">Skill Demand Across Regions</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Top districts by demand intensity</p>
                            </div>
                        </div>
                        <button className="text-[11px] font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-[8px] hover:bg-gray-50">View All</button>
                    </div>
                    <div className="flex-1 flex flex-row gap-4 h-[220px]">
                        {/* Map Container - Left Side */}
                        <div 
                            className="w-1/2 relative bg-slate-50/50 rounded-xl flex items-center justify-center border border-slate-100 p-2 overflow-hidden cursor-pointer group hover:bg-slate-100/50 transition-colors"
                            onClick={() => setIsMapModalOpen(true)}
                        >
                            {/* Hover Icon */}
                            <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                <Maximize2 size={14} className="text-gray-600" />
                            </div>

                            {/* Blue themed map using inline CSS filters to ensure proper color conversion */}
                            <img 
                                src={maharashtraMapImg} 
                                alt="Maharashtra Map" 
                                className="w-[90%] h-[90%] object-contain opacity-70 group-hover:scale-105 transition-transform duration-500" 
                                style={{ filter: 'sepia(1) hue-rotate(190deg) saturate(300%) brightness(1.1)' }}
                            />
                            
                            {/* Dynamic Highlighting Markers based on Data */}
                            {topDistrictsByGap.find(d => d?.name?.toLowerCase().includes('mumbai')) && (
                                <div className="absolute top-[48%] left-[20%] flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20">
                                   <div className="bg-red-500 w-2.5 h-2.5 rounded-full animate-ping absolute"></div>
                                   <div className="bg-red-600 w-2.5 h-2.5 rounded-full relative z-10 border-2 border-white shadow-sm"></div>
                                   <div className="bg-white/95 px-1.5 py-0.5 rounded shadow-sm mt-1 border border-red-100 flex flex-col items-center">
                                      <span className="text-[8px] font-bold text-gray-700 leading-tight">Mumbai</span>
                                      <span className="text-[9px] font-black text-red-600 leading-tight">{topDistrictsByGap.find(d => d?.name?.toLowerCase().includes('mumbai')).gapValue}</span>
                                   </div>
                                </div>
                            )}

                            {topDistrictsByGap.find(d => d?.name?.toLowerCase().includes('pune')) && (
                                <div className="absolute top-[55%] left-[35%] flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20">
                                   <div className="bg-red-500 w-3 h-3 rounded-full animate-ping absolute"></div>
                                   <div className="bg-red-600 w-3 h-3 rounded-full relative z-10 border-2 border-white shadow-sm"></div>
                                   <div className="bg-white/95 px-2 py-0.5 rounded shadow-sm mt-1 border border-red-100 flex flex-col items-center">
                                      <span className="text-[9px] font-bold text-gray-700 leading-tight">Pune</span>
                                      <span className="text-[11px] font-black text-red-600 leading-tight">{topDistrictsByGap.find(d => d?.name?.toLowerCase().includes('pune')).gapValue}</span>
                                   </div>
                                </div>
                            )}
                            
                            {topDistrictsByGap.find(d => d?.name?.toLowerCase().includes('nagpur')) && (
                                <div className="absolute top-[35%] left-[75%] flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20">
                                   <div className="bg-red-500 w-3 h-3 rounded-full animate-ping absolute"></div>
                                   <div className="bg-red-600 w-3 h-3 rounded-full relative z-10 border-2 border-white shadow-sm"></div>
                                   <div className="bg-white/95 px-2 py-0.5 rounded shadow-sm mt-1 border border-red-100 flex flex-col items-center">
                                      <span className="text-[9px] font-bold text-gray-700 leading-tight">Nagpur</span>
                                      <span className="text-[11px] font-black text-red-600 leading-tight">{topDistrictsByGap.find(d => d?.name?.toLowerCase().includes('nagpur')).gapValue}</span>
                                   </div>
                                </div>
                            )}
                            
                            {/* Demand Legend */}
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-600"></div><span className="text-[8px] text-gray-500 font-medium">High Demand</span></div>
                            </div>
                        </div>

                        {/* List Side - Right Side */}
                        <div className="w-1/2 flex flex-col justify-start space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                            {topDistrictsByGap.length > 0 ? (
                                topDistrictsByGap.slice(0,3).map((d, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                                            {i+1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-1.5 truncate pr-2">
                                                    <span className="text-[11px] font-bold text-gray-800 truncate" title={d.name}>
                                                        {d.name}
                                                    </span>
                                                    {i === 0 && d.gapValue > 10 && (
                                                        <span className="flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 px-1 py-[1px] rounded text-[8px] uppercase tracking-wider font-black animate-pulse shrink-0">
                                                            <AlertTriangle size={8} strokeWidth={3} /> Red Alert
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[12px] font-black text-blue-700 shrink-0">{d.gapValue.toLocaleString()}</span>
                                            </div>
                                            {/* Bar */}
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full" 
                                                    style={{ width: `${Math.max(10, (d.gapValue / topDistrictsByGap[0].gapValue) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={MapPin} title="No Data" message="No data." />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                ROW 2: SHORTAGES & TRENDS
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 4. Critical Skill Gaps */}
                <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <div className="mt-1"><AlertTriangle size={18} className="text-red-500"/></div>
                            <div>
                                <h3 className="text-[15px] font-black text-gray-900">Critical Skill Gaps (Shortages)</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Where Market Demand &gt; Supply</p>
                            </div>
                        </div>
                        <button className="text-[11px] font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-[8px] hover:bg-gray-50">View All</button>
                    </div>
                    <div className="flex-1 min-h-[220px]">
                        {shortagesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={shortagesData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="skill" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} width={80} />
                                    <Tooltip content={<CustomGapTooltip />} cursor={{fill: '#fff1f2'}} />
                                    <Bar dataKey="gapValue" name="Shortage Gap" fill="#e11d48" radius={[0, 4, 4, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState icon={AlertTriangle} title="No Critical Gaps" message="Supply is currently meeting demand." />}
                    </div>
                </div>

                {/* 5. Skill Demand Trend */}
                <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <div className="mt-1"><LineChartIcon size={18} className="text-blue-600"/></div>
                            <div>
                                <h3 className="text-[15px] font-black text-gray-900">Skill Demand Trend</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Trend of job demand over time</p>
                            </div>
                        </div>
                        <select className="text-[11px] font-bold text-gray-600 border border-gray-200 px-2 py-1.5 rounded-[8px] outline-none">
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div className="flex-1 min-h-[220px]">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip cursor={{stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    <Area type="monotone" dataKey="demand" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" activeDot={{r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState icon={LineChartIcon} title="Trend Data Pending" message="Historical time-series not enough." />
                        )}
                    </div>
                </div>

                {/* 6. Key Insights */}
                <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <div className="mt-1"><Lightbulb size={18} className="text-[#f97316]"/></div>
                            <div>
                                <h3 className="text-[15px] font-black text-gray-900">Key Insights</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Automated system highlights</p>
                            </div>
                        </div>
                        <button className="text-[11px] font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-[8px] hover:bg-gray-50">View All</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {/* If real alerts exist, map them. Else show a fallback default insight list derived from actual data */}
                        {alerts.length > 0 ? (
                            alerts.map((a, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Lightbulb size={14} />
                                        </div>
                                        <p className="text-[12px] font-bold text-gray-700 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{a.message}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
                                </div>
                            ))
                        ) : (
                            <>
                                {demandRankedData[0] && (
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><BarChart3 size={14} /></div>
                                            <p className="text-[12px] font-bold text-gray-700 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                                                <span className="capitalize">{demandRankedData[0].name}</span> is the most in-demand skill nationwide.
                                            </p>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-300 shrink-0 ml-2" />
                                    </div>
                                )}
                                {topDistrictsByGap[0] && (
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><MapPin size={14} /></div>
                                            <p className="text-[12px] font-bold text-gray-700 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                                                {topDistrictsByGap[0].name} has the highest job demand intensity.
                                            </p>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-300 shrink-0 ml-2" />
                                    </div>
                                )}
                                {shortagesData[0] && (
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0"><AlertTriangle size={14} /></div>
                                            <p className="text-[12px] font-bold text-gray-700 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                                                <span className="capitalize">{shortagesData[0].skillName}</span> shows the largest skill gap currently.
                                            </p>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-300 shrink-0 ml-2" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                BOTTOM BANNER
            ═══════════════════════════════════════════ */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 rounded-[16px] p-5 border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 shrink-0">
                        <TrendingUp size={20} className="text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-black text-gray-900">Empowering {selectedState} with Future-Ready Skills</h4>
                        <p className="text-[12px] font-medium text-gray-600 mt-0.5">Bridging the gap between education and industry with data-driven insights</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-3 text-right">
                    <div className="text-[11px]">
                        <p className="font-bold text-gray-500">Skilled People</p>
                        <p className="font-black text-blue-900">Stronger {selectedState}</p>
                    </div>
                    <ArrowRight size={18} className="text-blue-600" />
                </div>
            </div>

            {/* MAP MODAL */}
            {isMapModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 md:p-8" onClick={() => setIsMapModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[80vh] flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg"><MapPin size={20} className="text-blue-600" /></div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Skill Demand Across {selectedState}</h2>
                                    <p className="text-sm text-gray-500 font-medium">Detailed district-wise demand mapping</p>
                                </div>
                            </div>
                            <button onClick={() => setIsMapModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body - Map View */}
                        <div className="flex-1 relative bg-slate-50 flex items-center justify-center p-8 overflow-hidden">
                            <img 
                                src={maharashtraMapImg} 
                                alt="Maharashtra Map Large" 
                                className="w-full h-full object-contain opacity-70" 
                                style={{ filter: 'sepia(1) hue-rotate(190deg) saturate(300%) brightness(1.1)' }}
                            />
                            
                            {/* Enlarged Dynamic Markers with Detailed Hover */}
                            {[
                                { id: 'mumbai', label: 'Mumbai', top: '48%', left: '20%' },
                                { id: 'pune', label: 'Pune', top: '55%', left: '35%' },
                                { id: 'nagpur', label: 'Nagpur', top: '35%', left: '75%' }
                            ].map((city, idx) => {
                                const d = topDistrictsByGap.find(dist => dist?.name?.toLowerCase().includes(city.id));
                                if (!d) return null;
                                const detail = supplyGapTable.find(s => s?.district?.toLowerCase().includes(city.id)) || {};
                                
                                return (
                                    <div key={idx} className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group z-20 cursor-default" style={{ top: city.top, left: city.left }}>
                                        <div className="bg-red-500 w-5 h-5 rounded-full animate-ping absolute"></div>
                                        <div className="bg-red-600 w-5 h-5 rounded-full relative z-10 border-[3px] border-white shadow-md"></div>
                                        <div className="bg-white/95 px-3 py-1.5 rounded-lg shadow-lg mt-2 border border-red-100 flex flex-col items-center relative transition-transform group-hover:scale-105">
                                            <span className="text-xs font-bold text-gray-700 leading-tight">{city.label}</span>
                                            <span className="text-sm font-black text-red-600 leading-tight">{d.gapValue.toLocaleString()}</span>
                                            
                                            {/* Detailed Hover Tooltip Container */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible flex-col bg-gray-900 text-white rounded-xl p-3 w-52 shadow-2xl z-50 pointer-events-none transition-all duration-300 border border-gray-700">
                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-2 tracking-wider flex items-center gap-1.5 border-b border-gray-700 pb-1.5">
                                                    <MapPin size={10} className="text-blue-400"/> {city.label} Insights
                                                </div>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[11px] text-gray-300">Total Vacancy</span>
                                                    <span className="text-[11px] font-bold text-white">{detail.demand?.toLocaleString() || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[11px] text-gray-300">Candidate Supply</span>
                                                    <span className="text-[11px] font-bold text-white">{detail.supply?.toLocaleString() || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-700 bg-gray-800/50 -mx-3 -mb-3 px-3 pb-3 rounded-b-xl">
                                                    <span className="text-xs text-red-400 font-bold">Demand Gap</span>
                                                    <span className="text-sm font-black text-red-400">+{d.gapValue.toLocaleString()}</span>
                                                </div>
                                                {/* Tooltip Triangle */}
                                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
