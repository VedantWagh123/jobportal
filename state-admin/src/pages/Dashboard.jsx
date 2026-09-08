import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Briefcase, BookOpen, Users, Activity, TrendingUp, AlertTriangle, 
    X, Building, MapPin, CheckCircle, ChevronRight, Calendar, Download, 
    RefreshCw, Filter, Search, BarChart3, LineChart as LineChartIcon, Lightbulb, Map,
    ChevronDown, ArrowUpRight
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';

/* ─────────────────────────────────────────────────────────
   SVGS & BRANDING
───────────────────────────────────────────────────────── */
const TricolorLine = () => (
    <div className="flex h-1 w-full opacity-90 rounded-full overflow-hidden mt-2 mb-1">
        <div className="flex-1 bg-[#f97316]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#10b981]"></div>
    </div>
);

const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[250px] bg-gray-50/50 rounded-xl border border-gray-100 border-dashed p-6 text-center animate-zoom-in">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Icon size={20} className="text-gray-400" />
        </div>
        <h4 className="text-[14px] font-bold text-gray-700">{title}</h4>
        <p className="text-[12px] text-gray-500 font-medium mt-1 max-w-[250px]">{message}</p>
    </div>
);

/* ─────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────── */
const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    
    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('All');

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            if (token) {
                const [dashRes, distRes] = await Promise.all([
                    axios.get('/api/state-admin/intelligence/dashboard', { headers: { token } }),
                    axios.get('/api/state-admin/intelligence/districts', { headers: { token } })
                ]);
                
                if (dashRes.data.success) {
                    setAnalytics(dashRes.data.analytics);
                }
                if (distRes.data.success) {
                    setDistricts(distRes.data.districts || []);
                }
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 text-[13px] font-bold tracking-widest uppercase animate-pulse">Loading State Intelligence...</p>
        </div>
    );
    if (!analytics) return <div className="text-center p-12 text-red-500">Failed to load analytics.</div>;

    // Data Extractions
    const kpis = analytics.kpis || {};
    const supplyVsDemandData = analytics.supplyVsDemand || [];
    const supplyGapTable = analytics.supplyGapTable || [];
    const topDistrictsByGap = analytics.topDistrictsByGap || [];
    const demandTrendData = analytics.demandTrend || [];
    const alerts = analytics.activeAlerts || [];

    // Processed Chart Data
    const demandRankedData = [...supplyVsDemandData].sort((a, b) => b.demand - a.demand).slice(0, 5);
    
    // Table Filtering
    const filteredDistricts = districts.filter(d => {
        if (regionFilter !== 'All' && d.districtName !== regionFilter) return false;
        if (searchQuery && !d.districtName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-slide-up">
            
            {/* ═══════════════════════════════════════════
                DASHBOARD HEADER
            ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none">
                    <img src="/ashoka_emblem.png" alt="" className="w-64 h-64 -mt-10 -mr-10" onError={e => e.target.style.display='none'}/>
                </div>
                
                <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex-1">
                        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
                            <span>Home</span> <ChevronRight size={12}/> <span className="text-[#1e40af]">National Dashboard</span>
                        </nav>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <BarChart3 size={28} className="text-[#1e40af]"/>
                            National Skill Intelligence Dashboard
                        </h1>
                        <p className="text-gray-500 text-[13px] font-medium mt-2 max-w-3xl leading-relaxed">
                            Real-time analysis of skill demand, supply, workforce gaps and training capacity across India.
                        </p>
                        <div className="w-48 mt-3"><TricolorLine/></div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 flex-1 xl:flex-none">
                            <Calendar size={14} className="text-gray-400" />
                            <select className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 cursor-pointer w-full">
                                <option>Apr 2024 - Mar 2025</option>
                                <option>Last 6 Months</option>
                                <option>Year to Date</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 flex-1 xl:flex-none">
                            <MapPin size={14} className="text-gray-400" />
                            <select className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 cursor-pointer w-full">
                                <option>All India</option>
                                <option>Maharashtra</option>
                                <option>Karnataka</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button onClick={fetchData} disabled={refreshing} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            </button>
                            <button className="flex-1 sm:flex-none bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl text-[12px] font-bold shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                                <Download size={14} /> Download Report
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 pt-5 border-t border-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[11px] font-bold text-gray-400 tracking-wide">
                        LAST UPDATED: {lastUpdated.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}, {lastUpdated.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}
                    </p>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                KPI INTELLIGENCE CARDS
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { title: 'Active Job Vacancies', val: (kpis.totalVacancies||0).toLocaleString(), sub: 'High Market Demand', icon: <Briefcase/>, c: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
                    { title: 'Total Enrollments', val: (kpis.totalEnrollments||0).toLocaleString(), sub: 'Candidate Supply', icon: <Users/>, c: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8%' },
                    { title: 'Critical Gaps', val: supplyGapTable.filter(g=>g.gap>0).length, sub: 'Skills needing attention', icon: <AlertTriangle/>, c: 'text-amber-600', bg: 'bg-amber-50', trend: '+25%' },
                    { title: 'Training Capacity', val: (kpis.trainingCapacity||0).toLocaleString(), sub: 'Across all institutes', icon: <BookOpen/>, c: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+10%' },
                    { title: 'Placement Rate', val: 'N/A', sub: 'Awaiting Integration', icon: <TrendingUp/>, c: 'text-gray-400', bg: 'bg-gray-100', trend: null },
                    { title: 'Active Institutes', val: (kpis.totalInstitutes||0).toLocaleString(), sub: 'Across India', icon: <Building/>, c: 'text-rose-600', bg: 'bg-rose-50', trend: '+14%' }
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.c} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                {kpi.icon}
                            </div>
                            {kpi.trend && (
                                <span className={`text-[11px] font-bold flex items-center gap-0.5 ${kpi.trend.includes('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                    <ArrowUpRight size={12}/> {kpi.trend}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider leading-tight">{kpi.title}</p>
                        <h3 className={`text-2xl font-black mt-1 ${kpi.val === 'N/A' ? 'text-gray-300' : 'text-gray-900'}`}>{kpi.val}</h3>
                        <p className={`text-[10px] font-bold mt-1 ${kpi.val === 'N/A' ? 'text-gray-400' : kpi.c}`}>{kpi.sub}</p>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${kpi.bg} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    </div>
                ))}
            </div>

            {/* ═══════════════════════════════════════════
                MAIN ANALYTICS GRID - ROW 1
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* A. Highest Demand Skills */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[15px] font-black text-gray-900">Highest Demand Skills</h3>
                            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Ranked by active job vacancies</p>
                        </div>
                        <button className="text-[11px] font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">View All</button>
                    </div>
                    <div className="flex-1 h-[250px]">
                        {demandRankedData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={demandRankedData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight:'bold' }}/>
                                    <Bar dataKey="demand" name="Active Vacancies" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                        {demandRankedData.map((e, index) => <Cell key={index} fill={index === 0 ? '#1e40af' : '#3b82f6'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState icon={BarChart3} title="No Demand Data" message="Job vacancy data is currently empty." />}
                    </div>
                </div>

                {/* B. Demand vs Supply */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col xl:col-span-1">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[15px] font-black text-gray-900">Demand vs Supply Comparison</h3>
                            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Market requirements vs Current candidates</p>
                        </div>
                        <button className="text-[11px] font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">View Details</button>
                    </div>
                    <div className="flex-1 h-[250px]">
                        {supplyVsDemandData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={supplyVsDemandData.slice(0, 5)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}/>
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                                    <Bar dataKey="demand" name="Market Demand" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={16} />
                                    <Bar dataKey="supply" name="Available Supply" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState icon={BarChart3} title="No Data" message="Insufficient data for comparison." />}
                    </div>
                </div>

                {/* C. Regional Demand (List View since we don't have SVG map installed) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[15px] font-black text-gray-900">Skill Demand Across Regions</h3>
                            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Top 5 districts by demand intensity</p>
                        </div>
                        <button className="text-[11px] font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">View All</button>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        {topDistrictsByGap.length > 0 ? (
                            <div className="space-y-3">
                                {topDistrictsByGap.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-[11px] font-black text-gray-400 group-hover:text-blue-600">{i+1}</span>
                                            <span className="text-[13px] font-bold text-gray-800">{d.name}</span>
                                        </div>
                                        <span className="text-[13px] font-black text-[#1e40af]">{d.gapValue.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={Map} title="Geospatial Data Pending" message="District mapping requires further integration." />
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                MAIN ANALYTICS GRID - ROW 2
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* D. Critical Skill Gaps */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col xl:col-span-1">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[15px] font-black text-gray-900">Critical Skill Gaps (Shortages)</h3>
                            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Where Market Demand &gt; Supply</p>
                        </div>
                        <button className="text-[11px] font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">View All</button>
                    </div>
                    <div className="flex-1 h-[250px]">
                        {supplyGapTable.filter(g=>g.gap>0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={supplyGapTable.filter(g=>g.gap>0).slice(0,5)} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                    <YAxis type="category" dataKey="skill" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} />
                                    <Tooltip cursor={{fill: '#fffbeb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight:'bold' }}/>
                                    <Bar dataKey="gap" name="Shortage Gap" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16}>
                                        {supplyGapTable.filter(g=>g.gap>0).map((e, index) => <Cell key={index} fill={e.gap > 50 ? '#ef4444' : '#f59e0b'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState icon={CheckCircle} title="No Shortages" message="Supply is meeting demand currently." />}
                    </div>
                </div>

                {/* E. Skill Demand Trend (Empty State as no time-series data exists) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col xl:col-span-1">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[15px] font-black text-gray-900">Skill Demand Trend</h3>
                            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Trend of job demand over time</p>
                        </div>
                        <select className="text-[11px] font-bold text-gray-500 border border-gray-200 px-2 py-1.5 rounded-lg outline-none">
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div className="flex-1 h-[250px]">
                        {demandTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={demandTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                                    <Line type="monotone" dataKey="demand" name="Total Demand" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState icon={LineChartIcon} title="Data Integration Pending" message="Time-series historical data is awaiting state nodal integration." />
                        )}
                    </div>
                </div>

                {/* F. Key Insights */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col xl:col-span-1">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[15px] font-black text-gray-900 flex items-center gap-2"><Lightbulb size={18} className="text-[#f97316]"/> Key Insights</h3>
                        </div>
                        <button className="text-[11px] font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">View All</button>
                    </div>
                    <div className="flex-1 space-y-4">
                        {[
                            { icon: <Briefcase size={14}/>, color: 'blue', text: `${demandRankedData[0]?.name || 'Data'} is the most in-demand skill nationwide.` },
                            { icon: <MapPin size={14}/>, color: 'indigo', text: `${topDistrictsByGap[0]?.name.split(' ')[0] || 'State'} has the highest job demand.` },
                            { icon: <AlertTriangle size={14}/>, color: 'red', text: `${supplyGapTable[0]?.skill || 'N/A'} shows the largest skill gap currently.` },
                            { icon: <Building size={14}/>, color: 'blue', text: `Training capacity needs expansion in Tier 2 states.` },
                            { icon: <TrendingUp size={14}/>, color: 'emerald', text: `Placement data tracking is pending integration.` },
                        ].map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3 group cursor-pointer">
                                <div className={`w-7 h-7 rounded-lg bg-${insight.color}-50 text-${insight.color}-600 flex items-center justify-center shrink-0 mt-0.5`}>
                                    {insight.icon}
                                </div>
                                <p className="text-[13px] font-medium text-gray-700 leading-snug flex-1 group-hover:text-blue-600 transition-colors">
                                    {insight.text}
                                </p>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-600 transition-colors mt-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                STATE-WISE INTELLIGENCE TABLE
            ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-[15px] font-black text-gray-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#1e40af] text-white flex items-center justify-center text-[12px]">D</span>
                            District-wise Skill Intelligence
                        </h3>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">Detailed view of demand, supply and capacity by district</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full md:w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Search size={14} className="text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search state or skill..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-[12px] font-medium w-full text-gray-800 placeholder-gray-400"
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-[12px] font-bold transition-colors">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">#</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">District (State)</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Active Job Vacancies</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Candidate Supply</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Training Capacity</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100">Placement Rate</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDistricts.length > 0 ? (
                                filteredDistricts.map((district, idx) => (
                                    <tr key={district.districtId} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 text-[13px] font-bold text-gray-400">{idx + 1}</td>
                                        <td className="px-6 py-4 text-[13px] font-bold text-gray-900">{district.districtName} <span className="text-gray-400 text-[11px] font-medium ml-1">({district.state})</span></td>
                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-700">{district.jobs.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-700">{district.enrollments.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-700">{district.capacity.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[13px] font-bold text-gray-400">N/A</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[12px] font-bold text-[#1e40af] hover:text-[#1e3a8a] hover:underline bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Map size={32} className="mb-3 opacity-50" />
                                            <p className="font-bold text-[14px] text-gray-700">No districts found</p>
                                            <p className="text-[12px] mt-1 text-gray-500">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
