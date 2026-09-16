import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Database, Users, Activity, ChevronRight, 
    Calendar, CheckCircle2, Cloud, FileText, Server, Clock, 
    PieChart as PieChartIcon, Map, TrendingUp, AlertTriangle,
    Download, RefreshCw, Briefcase, GraduationCap, Building2,
    BarChart3, Target, Home, Quote, ChevronDown, CheckCircle, MapPin
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import India from '@svg-maps/india';
import DistrictDigitalTwin from '../components/DistrictDigitalTwin';

// Custom SVG Map Renderer to avoid React 19 compatibility issues with 'react-svg-map'
const CustomSVGMap = ({ map, className = '' }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={map.viewBox} 
        className={`svg-map ${className}`} 
        aria-label={map.label}
    >
        {map.locations.map(location => (
            <path 
                key={location.id} 
                id={location.id} 
                name={location.name} 
                d={location.path} 
                className="svg-map__location" 
            />
        ))}
    </svg>
);

/* ─────────────────────────────────────────────────────────
   COLORS & THEME (Matched to target)
───────────────────────────────────────────────────────── */
const COLORS = {
    blue: '#2563EB',
    green: '#10B981',
    red: '#EF4444',
    purple: '#8B5CF6',
    orange: '#F97316',
    teal: '#14B8A6',
    pie: ['#2563EB', '#10B981', '#F97316', '#F43F5E', '#8B5CF6', '#64748B']
};

/* ─────────────────────────────────────────────────────────
   MINI SPARKLINE SVG (For KPI Cards)
───────────────────────────────────────────────────────── */
const Sparkline = ({ color, data }) => {
    // Generate a simple SVG line based on data array [1,3,2,5,4]
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 10);
    const min = Math.min(...data, 0);
    const range = max - min;
    const height = 24;
    const width = 100;
    const step = width / (data.length - 1);
    
    const points = data.map((d, i) => {
        const x = i * step;
        const y = height - ((d - min) / (range || 1)) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`-2 -2 ${width+4} ${height+4}`} className="w-full h-8 opacity-60 mt-2">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            {/* Adding dots on data points */}
            {data.map((d, i) => (
                <circle 
                    key={i} 
                    cx={i * step} 
                    cy={height - ((d - min) / (range || 1)) * height} 
                    r="2" 
                    fill={color} 
                    className="opacity-0 hover:opacity-100 transition-opacity" 
                />
            ))}
        </svg>
    );
};

/* ─────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────── */
const GlobalStyles = () => (
    <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        .au { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .premium-shadow { box-shadow: 0 4px 15px -3px rgba(0,0,0,0.05), 0 2px 6px -2px rgba(0,0,0,0.02); }
        .gov-bg { background-color: #F8FAFC; }
        .card-radius { border-radius: 16px; }
        .recharts-tooltip-wrapper { outline: none !important; }
        
        /* Custom Scrollbar for small lists */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }

        /* SVG Map Styling */
        .svg-map { width: 100%; height: auto; stroke: #ffffff; stroke-width: 1px; stroke-linecap: round; stroke-linejoin: round; }
        .svg-map__location { fill: #93C5FD; cursor: pointer; transition: fill 0.2s ease-in-out; }
        .svg-map__location:hover, .svg-map__location[aria-checked="true"] { fill: #2563EB; }
        
        /* Shaded States for Realism */
        #in-mh, #in-tn, #in-gj, #in-ka { fill: #3B82F6; }
        #in-up, #in-br, #in-rj { fill: #60A5FA; }
        #in-kl, #in-tg, #in-ap { fill: #93C5FD; }
        
        .hero-map .svg-map__location { fill: #EFF6FF; stroke: #DBEAFE; }
    `}</style>
);

/* ─────────────────────────────────────────────────────────
   EMPTY STATE COMPONENT
───────────────────────────────────────────────────────── */
const PremiumEmptyState = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center p-6 bg-gray-50/50 rounded-[12px] border border-gray-100 border-dashed">
        <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-3 text-gray-400">
            <Icon size={20} />
        </div>
        <h4 className="text-[14px] font-bold text-gray-800">{title}</h4>
        <p className="text-[12px] text-gray-500 font-medium mt-1 max-w-[240px] leading-relaxed">{message}</p>
    </div>
);

/* ─────────────────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
───────────────────────────────────────────────────────── */
const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Data states
    const [stats, setStats] = useState(null);
    const [masterSkills, setMasterSkills] = useState([]);
    const [employers, setEmployers] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [selectedDistrictId, setSelectedDistrictId] = useState('all');
    const [digitalTwinData, setDigitalTwinData] = useState(null);

    const fetchDigitalTwin = async (distId = 'all') => {
        try {
            const token = user?.token;
            const res = await axios.get(`/api/state-admin/intelligence/district-twin/${distId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDigitalTwinData(res.data.digitalTwin);
            }
        } catch (e) {
            console.error("Failed to fetch digital twin", e);
        }
    };

    const fetchDistrictsList = async () => {
        try {
            const token = user?.token;
            const res = await axios.get('/api/state-admin/intelligence/districts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDistrictsList(res.data.districts || []);
            }
        } catch (e) {
            console.error("Failed to fetch districts list", e);
        }
    };

    const handleSelectDistrict = (distId) => {
        setSelectedDistrictId(distId);
        fetchDigitalTwin(distId);
    };

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [statsRes, skillsRes, empRes, instRes] = await Promise.all([
                axios.get('/api/super-admin/dashboard/stats', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('/api/super-admin/skills/master', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('/api/super-admin/employers', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('/api/super-admin/institutes', { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setStats(statsRes.data);
            setMasterSkills(skillsRes.data);
            setEmployers(empRes.data.employers || []);
            setInstitutes(instRes.data.institutes || []);
            fetchDistrictsList().catch(e => console.error(e));
            fetchDigitalTwin('all').catch(e => console.error(e));
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch dashboard intelligence", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    // ─── DATA CALCULATIONS ───
    const totalJobs = stats?.totalVacancies || 0;
    const activeInstitutes = useMemo(() => institutes.filter(i => i.isApproved).length, [institutes]);
    const supplyGapTable = stats?.supplyGapTable || [];
    const criticalGaps = supplyGapTable.filter(g => g.gap > 0 || (typeof g.gap === 'string' && g.gap.includes('+'))).length;
    
    // Extracted Real Data from Backend
    const availableSupply = stats?.availableSupply || 0;
    const placementRate = stats?.placementRate || '0%';
    const trainingCapacity = stats?.trainingCapacity || 0;

    // Sample sparkline data (Mocked for visual presentation as backend doesn't send time-series for all KPIs yet)
    const sparklines = {
        jobs: [10, 25, 45, 30, 60, totalJobs || 80],
        supply: [0, Math.floor(availableSupply/4), Math.floor(availableSupply/2), Math.floor(availableSupply/1.5), availableSupply],
        gaps: [2, 3, 1, 4, 3, criticalGaps || 5],
        training: [0, Math.floor(trainingCapacity/3), Math.floor(trainingCapacity/2), trainingCapacity],
        placement: [0, 10, 25, 40, parseInt(placementRate) || 0],
        institutes: [1, 1, 1, 1, 1, activeInstitutes || 1]
    };

    // Supply Vs Demand
    const supplyVsDemandData = stats?.supplyVsDemand || [];

    // Sector Distribution Pie
    const pieData = stats?.industryWiseDemand || [];
    const totalPieSkills = pieData.reduce((acc, curr) => acc + curr.value, 0);

    // AI Processing Trend (Demand Trend mapped to UI)
    const processingTrendData = (stats?.demandTrend || []).map(m => ({ name: m.name, processed: m.demand }));

    // Geographical Analytics
    const topStates = stats?.geographicalAnalytics || [];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <div className="w-12 h-12 rounded-full border-[3px] border-gray-100 border-t-blue-600 animate-spin"/>
        </div>
    );

    return (
        <div className="space-y-6 pb-12 -mx-4 lg:-mx-8 px-4 lg:px-5">
            <GlobalStyles />
            
            {/* ═══════════════════════════════════════════
                1. HERO HEADER (Exact Reference Match)
            ═══════════════════════════════════════════ */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-white border border-blue-100 premium-shadow p-6 lg:p-8 au">
                
                {/* Decorative Map Background */}
                <div className="absolute right-[20%] top-0 bottom-0 opacity-40 pointer-events-none w-64 hidden xl:flex items-center hero-map">
                    <CustomSVGMap map={India} />
                </div>
                
                {/* Header Content */}
                <div className="relative flex flex-col xl:flex-row justify-between items-start gap-8 z-10">
                    
                    {/* Left: Titles & Badges */}
                    <div className="flex-1 max-w-2xl">
                        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-widest">
                            <Home size={12}/>
                            <span className="hover:text-blue-600 cursor-pointer">National Portal</span>
                            <ChevronRight size={12}/>
                            <span className="text-blue-600">Command Center</span>
                        </nav>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center p-2 shrink-0">
                                <img src="/ashoka_emblem.png" alt="Emblem" className="w-full h-full object-contain" onError={(e)=>{e.target.style.display='none'}}/>
                            </div>
                            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">National Skill Intelligence</h1>
                        </div>
                        <p className="text-gray-600 text-[13px] font-medium mt-3 leading-relaxed max-w-[500px]">
                            A comprehensive overview of India's workforce readiness. Monitor real-time analytics on skill demands, training supply, and regional capability gaps.
                        </p>
                        
                        <div className="flex items-center gap-4 mt-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                                </span>
                                <span className="text-[10px] font-black text-[#047857] uppercase tracking-widest">LIVE SYNC ACTIVE</span>
                            </div>
                            <span className="text-[11px] font-semibold text-gray-400">Last updated: {lastUpdated.toLocaleTimeString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Right: Actions & Quote */}
                    <div className="flex flex-col items-end gap-5 w-full xl:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
                                <Calendar size={14} className="text-gray-500" />
                                <select className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 cursor-pointer">
                                    <option>Last 12 Months</option>
                                    <option>Current Quarter (Q3)</option>
                                    <option>Year to Date</option>
                                </select>
                            </div>
                            <button onClick={fetchData} disabled={refreshing} className="bg-white border border-gray-200 hover:bg-gray-50 text-blue-600 p-2 rounded-lg shadow-sm transition-colors disabled:opacity-50">
                                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[12px] font-bold shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all">
                                <Download size={14} /> Export Report
                            </button>
                        </div>

                        {/* Government Quote Block */}
                        <div className="bg-white/80 backdrop-blur-md border border-white p-5 rounded-2xl premium-shadow max-w-[320px] relative overflow-hidden hidden md:block">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <Quote size={80} className="text-blue-900" />
                            </div>
                            <Quote size={20} className="text-blue-600 mb-2" />
                            <p className="text-[13px] font-bold text-gray-800 leading-snug">Empowering Talent. Enabling Opportunities. Building a Viksit Bharat.</p>
                            <p className="text-[10px] text-gray-500 font-bold mt-2 text-right">— Government of India</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                2. KPI CARDS (6-Grid left-bordered)
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 au delay-100">
                {[
                    { label: 'Job Vacancies', val: totalJobs, sub: 'Verified demands from industries', icon: Briefcase, color: COLORS.blue, spark: sparklines.jobs, trend: '+12%', isUp: true },
                    { label: 'Available Supply', val: availableSupply, sub: 'Total registered candidates', icon: Users, color: COLORS.green, spark: sparklines.supply, trend: '+5%', isUp: true },
                    { label: 'Skill Shortages', val: criticalGaps, sub: 'Emerging gaps to address', icon: AlertTriangle, color: COLORS.red, spark: sparklines.gaps, trend: '+25%', isUp: true },
                    { label: 'Training Capacity', val: trainingCapacity, sub: 'Seats across all active batches', icon: GraduationCap, color: COLORS.purple, spark: sparklines.training, trend: '+8%', isUp: true },
                    { label: 'Placement Rate', val: placementRate, sub: 'Based on employer feedback', icon: TrendingUp, color: COLORS.orange, spark: sparklines.placement, trend: '+2%', isUp: true },
                    { label: 'Active Institutes', val: activeInstitutes, sub: 'Approved centers', icon: Building2, color: COLORS.teal, spark: sparklines.institutes, trend: '0%', isUp: true }
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-[12px] premium-shadow border border-gray-100 p-4 relative overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow group">
                        {/* Left Color Border */}
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: kpi.color }}></div>
                        
                        <div className="flex justify-between items-start pl-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                                    <kpi.icon size={16} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[12px] font-black text-gray-800 leading-tight">{kpi.label}</h3>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-end pl-2">
                            <div>
                                <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">{kpi.val}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${kpi.trend === '0%' ? 'text-gray-400' : kpi.isUp ? 'text-green-600' : 'text-red-500'}`}>
                                    {kpi.trend !== '0%' && (kpi.isUp ? <TrendingUp size={12}/> : <TrendingUp size={12} className="rotate-180"/>)}
                                    {kpi.trend}
                                </div>
                                <span className="text-[9px] font-semibold text-gray-400">vs last month</span>
                            </div>
                        </div>
                        
                        <p className="text-[10px] font-medium text-gray-500 mt-2 pl-2 truncate">{kpi.sub}</p>
                        
                        {/* Mini Sparkline at bottom */}
                        <div className="mt-1 pl-2">
                            <Sparkline color={kpi.color} data={kpi.spark} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════════════════════════════════════════
                2.5 DISTRICT SKILL DEMAND DIGITAL TWIN
            ═══════════════════════════════════════════ */}
            <DistrictDigitalTwin 
                twinData={digitalTwinData} 
                onSelectDistrict={handleSelectDistrict} 
                districtsList={districtsList} 
                selectedDistrictId={selectedDistrictId} 
            />

            {/* ═══════════════════════════════════════════
                3. MAIN ANALYTICS ROW 1 (Demand vs Supply & Sector Donut)
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 au delay-200">
                
                {/* 3A. Market Demand vs Supply */}
                <div className="bg-white rounded-[16px] border border-gray-100 premium-shadow p-6 flex flex-col xl:col-span-2">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-black text-[#0F172A]">Market Demand vs Supply</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Comparative analysis of required skills vs available workforce</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-50">
                            <span className="text-[12px] font-bold text-gray-700">All Sectors</span>
                            <ChevronDown size={14} className="text-gray-400"/>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-6 mb-4 mt-2">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600"/><span className="text-[11px] font-bold text-gray-600">Market Demand</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"/><span className="text-[11px] font-bold text-gray-600">Available Supply</span></div>
                    </div>
                    
                    <div className="flex-1 h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={supplyVsDemandData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barGap={0}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 700}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} />
                                <RechartsTooltip 
                                    cursor={{fill: '#F1F5F9'}} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
                                />
                                <Bar dataKey="demand" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={24} >
                                    {/* Adding labels to bars as in the reference */}
                                    {supplyVsDemandData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#2563EB" />
                                    ))}
                                </Bar>
                                <Bar dataKey="supply" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3B. Sector Distribution (Side Legend) */}
                <div className="bg-white rounded-[16px] border border-gray-100 premium-shadow p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <PieChartIcon size={20} />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-black text-[#0F172A]">Sector Distribution</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Taxonomy breakdown by industry domain</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-50">
                            <span className="text-[11px] font-bold text-gray-700">All Sectors</span>
                            <ChevronDown size={14} className="text-gray-400"/>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-48 h-48 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={pieData} innerRadius={60} outerRadius={85} paddingAngle={3} 
                                        dataKey="value" stroke="none"
                                    >
                                        {pieData.map((e, i) => <Cell key={i} fill={COLORS.pie[i % COLORS.pie.length]} />)}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-gray-900 leading-none">{totalPieSkills}</span>
                                <span className="text-[11px] font-bold text-gray-500 mt-1">Skills</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 w-full flex flex-col gap-3">
                            {pieData.map((e, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.pie[i % COLORS.pie.length] }}></div>
                                        <span className="text-[12px] font-bold text-gray-700">{e.name}</span>
                                    </div>
                                    <span className="text-[12px] font-black text-gray-900">{e.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                4. MAIN ANALYTICS ROW 2 (Trend & Map)
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 au delay-300">
                
                {/* 4A. AI Processing Volume (Area Chart) */}
                <div className="bg-white rounded-[16px] border border-gray-100 premium-shadow p-6 flex flex-col xl:col-span-2">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-black text-[#0F172A]">AI Processing Volume</h3>
                                <p className="text-[12px] text-gray-500 font-medium">Historical rate of AI taxonomy extraction and normalization</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                            <CheckCircle size={14} className="text-amber-500"/>
                            <span className="text-[11px] font-extrabold text-amber-700">Accuracy: 94.0%</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={processingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
                                    labelStyle={{ fontWeight: 'black', color: '#0F172A', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="processed" name="Skills Processed" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" activeDot={{r: 6, fill: '#2563EB', stroke: '#fff', strokeWidth: 2}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4B. Geographical Analytics */}
                <div className="bg-white rounded-[16px] border border-gray-100 premium-shadow p-6 flex flex-col">
                    <div className="flex gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Map size={20} />
                        </div>
                        <div>
                            <h3 className="text-[16px] font-black text-[#0F172A]">Geographical Analytics</h3>
                            <p className="text-[12px] text-gray-500 font-medium">Regional workforce readiness distribution</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex gap-4">
                        {/* Map visual area */}
                        <div className="w-[140px] shrink-0 flex flex-col justify-between">
                            <div className="flex-1 rounded-lg flex items-center justify-center relative overflow-hidden py-2">
                                <CustomSVGMap map={India} />
                            </div>
                            <div className="mt-3 space-y-1.5">
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]"></div><span className="text-[10px] text-gray-600 font-bold">High Readiness</span></div>
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]"></div><span className="text-[10px] text-gray-600 font-bold">Medium Readiness</span></div>
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#60A5FA]"></div><span className="text-[10px] text-gray-600 font-bold">Low Readiness</span></div>
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#93C5FD]"></div><span className="text-[10px] text-gray-600 font-bold">Needs Attention</span></div>
                            </div>
                        </div>

                        {/* Top States List */}
                        <div className="flex-1 flex flex-col">
                            <h4 className="text-[12px] font-black text-gray-800 mb-3">Top States by Readiness</h4>
                            <div className="space-y-3 flex-1">
                                {topStates.length > 0 ? topStates.map((state, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-gray-400 w-3">{i+1}</span>
                                            <span className="text-[12px] font-bold text-gray-700">{state.name}</span>
                                        </div>
                                        <span className="text-[12px] font-black text-gray-900">{state.val}</span>
                                    </div>
                                )) : <div className="text-[12px] text-gray-500 font-medium py-4 text-center">No geographical data available</div>}
                            </div>
                            <button className="mt-4 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 justify-end w-full transition-colors">
                                View Full Report <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;
