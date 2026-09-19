import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Users, ShieldCheck, 
    Calendar, Building2, AlertTriangle, GraduationCap, Briefcase, ChevronDown, MoreVertical
} from 'lucide-react';
import { 
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import India from '@svg-maps/india';
import { useNavigate, Link } from 'react-router-dom';

const CustomSVGMap = ({ map, className = '', onLocationMouseOver, onLocationMouseOut }) => (
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
                onMouseOver={(e) => onLocationMouseOver && onLocationMouseOver(e, location)}
                onMouseMove={(e) => onLocationMouseOver && onLocationMouseOver(e, location)}
                onMouseOut={onLocationMouseOut}
            />
        ))}
    </svg>
);

const COLORS = {
    blue: '#3B82F6',
    green: '#10B981',
    red: '#EF4444',
    purple: '#8B5CF6',
    orange: '#F97316',
    teal: '#14B8A6',
    gray: '#64748B'
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F43F5E', '#F59E0B', '#64748B'];

const Sparkline = ({ color, data }) => {
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
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
    );
};

const GlobalStyles = ({ activeStates = [] }) => (
    <style>{`
        .premium-card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .premium-card:hover {
            box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 10px 20px rgba(0,0,0,0.04);
        }
        
        .svg-map { width: 100%; height: auto; stroke: #ffffff; stroke-width: 0.5px; stroke-linecap: round; stroke-linejoin: round; }
        .svg-map__location { fill: #E0F2FE; transition: fill 0.2s ease-in-out; cursor: pointer; }
        .svg-map__location:hover { fill: #BAE6FD; }
        
        ${activeStates.map(code => `
            #${code} { fill: #3B82F6 !important; stroke: #fff !important; }
        `).join('\n')}

        /* Highlight Maharashtra (Primary Hub) */
        #in-mh { fill: #1D4ED8 !important; stroke: #fff !important; }
    `}</style>
);

const SkeletonBox = ({ w = 'w-full', h = 'h-4', rounded = 'rounded' }) => (
    <div className={`${w} ${h} ${rounded} bg-gray-100 animate-pulse`} />
);

const DraggableBox = ({ title, dataList, initialX, initialY, onClose }) => {
    const [pos, setPos] = useState({ 
        x: Math.min(initialX + 15, window.innerWidth - 260), 
        y: Math.min(initialY + 15, window.innerHeight - 200) 
    });
    const [dragging, setDragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 });

    const onMouseDown = (e) => {
        if (e.target.closest('.no-drag')) return;
        setDragging(true);
        setRel({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!dragging) return;
            setPos({ x: e.clientX - rel.x, y: e.clientY - rel.y });
        };
        const onMouseUp = () => setDragging(false);
        if (dragging) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, rel]);

    return (
        <div 
            className="fixed z-[100] bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden w-72 select-none flex flex-col backdrop-blur-xl"
            style={{ left: pos.x, top: pos.y, cursor: dragging ? 'grabbing' : 'grab' }}
            onMouseDown={onMouseDown}
        >
            {/* Header */}
            <div className="bg-white px-5 py-3.5 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[13px] font-black tracking-wide text-gray-900">{title} Detail</span>
                </div>
                <button className="no-drag text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center" onClick={onClose}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            
            {/* Content */}
            <div className="p-4 max-h-[250px] overflow-y-auto no-drag cursor-default bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recent Registered</h4>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{dataList?.length || 0} Total</span>
                </div>
                
                {dataList && dataList.length > 0 ? (
                    <div className="space-y-2">
                        {dataList.map((name, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-[12px] group-hover:scale-110 transition-transform">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{name}</span>
                                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                                        {title.includes('Employer') ? 'Registered Company' : title.includes('Candidate') ? 'Registered Candidate' : 'Verified Entity'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                        </div>
                        <p className="text-[11px] font-bold text-gray-500">No data available yet.</p>
                        <p className="text-[9px] font-medium text-gray-400 mt-1">Please refresh the dashboard</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    // Start with NO loading state — show UI immediately with placeholders
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(true);
    const [mapTooltip, setMapTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
    const [kpiHover, setKpiHover] = useState({ show: false, kpi: null, x: 0, y: 0, pinned: false });

    const getKpiDataList = (label) => {
        if (!label) return [];
        if (label === 'Pending Employers') return stats?.recentNames?.pendingEmployers || [];
        if (label === 'Pending Institutes') return stats?.recentNames?.pendingInstitutes || [];
        if (label === 'Total Employers') return stats?.recentNames?.employers || [];
        if (label === 'Total Candidates') return stats?.recentNames?.candidates || [];
        if (label === 'Total Institutes') return stats?.recentNames?.institutes || [];
        if (label.includes('Admins')) return ['Maharashtra Nodal', 'Delhi Central Node', 'Karnataka Tech Admin']; 
        return [];
    }

    const handleMapMouseOver = (e, location) => {
        if (location.id === 'in-mh') {
            setMapTooltip({ show: true, x: e.clientX, y: e.clientY, content: 'Active Districts: Nagpur, Pune, Mumbai' });
        } else if (stats?.networkPresence?.activeStates?.includes(location.id)) {
            setMapTooltip({ show: true, x: e.clientX, y: e.clientY, content: `${location.name} (Active Node)` });
        } else {
            setMapTooltip({ show: true, x: e.clientX, y: e.clientY, content: location.name });
        }
    };

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout
            const statsRes = await axios.get('/api/super-admin/dashboard/stats', {
                headers: { token: user.token },
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (statsRes.data.success) {
                setStats(statsRes.data);
            }
        } catch (err) {
            if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                console.error('[Dashboard] fetch error:', err?.response?.data || err.message);
            }
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    const formatNumber = (num) => {
        if (num === null || num === undefined) return '—';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Prepare Pie Chart Data
    let pieData = stats?.skillDomains || [];
    if (pieData.length === 0) {
        pieData = [{ name: 'No Data Yet', value: 1 }];
    }

    return (
        <div className="space-y-6 pb-12 relative">
            <GlobalStyles activeStates={stats?.networkPresence?.activeStates || []} />
            
            {/* Floating Map Tooltip */}
            {mapTooltip.show && (
                <div 
                    className="fixed z-50 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                    style={{ left: mapTooltip.x, top: mapTooltip.y }}
                >
                    {mapTooltip.content}
                    <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900/95"></div>
                </div>
            )}

            {/* KPI Floating Hover Box (Unpinned) */}
            {kpiHover.show && !kpiHover.pinned && kpiHover.kpi && (
                <div 
                    className="fixed z-50 p-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl pointer-events-none transform translate-x-4 w-64 flex flex-col"
                    style={{ left: kpiHover.x, top: kpiHover.y }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[13px] font-black text-gray-900">{kpiHover.kpi.label}</span>
                    </div>
                    
                    <span className="text-[9px] font-bold text-blue-600 mb-3 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded inline-block w-max border border-blue-100">
                        Double-click to pin details
                    </span>
                    
                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Recent Additions:</h4>
                        <ul className="space-y-2">
                            {getKpiDataList(kpiHover.kpi.label).slice(0, 3).length > 0 ? getKpiDataList(kpiHover.kpi.label).slice(0, 3).map((name, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 shadow-sm">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-800 truncate flex-1">{name}</span>
                                </li>
                            )) : (
                                <div className="text-center py-2 flex flex-col items-center justify-center">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="mb-1"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                                    <span className="text-[10px] font-medium text-gray-400">Loading fast...</span>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            )}
            
            {/* Pinned Draggable Box */}
            {kpiHover.show && kpiHover.pinned && kpiHover.kpi && (
                <DraggableBox 
                    title={kpiHover.kpi.label}
                    dataList={getKpiDataList(kpiHover.kpi.label)}
                    initialX={kpiHover.x}
                    initialY={kpiHover.y}
                    onClose={() => setKpiHover({ show: false, kpi: null, x: 0, y: 0, pinned: false })}
                />
            )}
            
            {/* HERO HEADER */}
            <div className="premium-card p-6 flex flex-col md:flex-row justify-between items-center relative overflow-hidden bg-white">
                {/* Background Illustration Overlay (Mimicking the reference image) */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none" 
                     style={{ 
                         backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                         backgroundPosition: 'right center',
                         backgroundRepeat: 'no-repeat',
                         backgroundSize: 'cover'
                     }}>
                </div>
                
                <div className="flex items-center gap-4 z-10 w-full">
                    <div className="w-12 h-14 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                        {/* Govt Emblem Placeholder */}
                        <img src="/ashoka_emblem.png" alt="Emblem" className="w-8 h-8 object-contain filter invert" onError={(e)=>{e.target.style.display='none'}}/>
                    </div>
                    <div className="flex-1">
                        <nav className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                            <span>National Portal</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-blue-600">System Command Center</span>
                        </nav>
                        <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-none mb-1.5">System Command Center</h1>
                        <p className="text-gray-500 text-[12px] font-medium leading-relaxed max-w-lg mb-3">
                            Centralized operations control. Monitor system health, background AI queues, pending approvals, and total platform metrics.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full border border-green-100">
                                <span className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
                                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">{refreshing ? 'Syncing...' : 'System Online'}</span>
                            </div>
                            <span className="text-[11px] font-medium text-gray-400">Last updated: {new Date().toLocaleTimeString()} | All systems operational</span>
                        </div>
                    </div>
                    
                    {/* Optional Right Side Text from Reference */}
                    <div className="hidden lg:block text-right z-10 pr-8">
                        <h2 className="text-[20px] font-black text-blue-900/20 leading-none">Viksit Bharat</h2>
                        <h2 className="text-[20px] font-black text-blue-900/20 leading-none">Skilled Bharat</h2>
                    </div>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Pending Employers',  val: stats?.pendingEmployers,  icon: Briefcase,     color: COLORS.orange, spark: [1,2,5,3,4],      desc: 'Requires admin approval' },
                    { label: 'Pending Institutes', val: stats?.pendingInstitutes, icon: GraduationCap, color: COLORS.red,    spark: [2,1,4,2,3],      desc: 'Requires admin approval' },
                    { label: 'Total Candidates',   val: stats?.totalCandidates,   icon: Users,         color: COLORS.blue,   spark: [10,25,45,30,60], desc: 'Registered job seekers' },
                    { label: 'Total Employers',    val: stats?.totalEmployers,    icon: Building2,     color: COLORS.teal,   spark: [5,10,12,15,18],  desc: 'Total registered companies' },
                    { label: 'Total Institutes',   val: stats?.totalInstitutes,   icon: GraduationCap, color: COLORS.purple, spark: [1,2,3,4,4],      desc: 'Total training centers' },
                    { label: 'Active Admins',      val: stats?.activeAdmins,      icon: ShieldCheck,   color: COLORS.green,  spark: [1,1,1,1,1],      desc: 'State government nodes' }
                ].map((kpi, i) => (
                    <div key={i} 
                         className="premium-card p-4 relative overflow-hidden flex flex-col justify-between group cursor-pointer border border-transparent hover:border-blue-100 transition-colors"
                         onMouseEnter={(e) => {
                             if (!kpiHover.pinned) setKpiHover({ show: true, kpi, x: e.clientX, y: e.clientY, pinned: false });
                         }}
                         onMouseMove={(e) => {
                             if (!kpiHover.pinned && kpiHover.show) setKpiHover(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
                         }}
                         onMouseLeave={() => {
                             if (!kpiHover.pinned) setKpiHover({ show: false, kpi: null, x: 0, y: 0, pinned: false });
                         }}
                         onDoubleClick={(e) => {
                             setKpiHover({ show: true, kpi, x: e.clientX, y: e.clientY, pinned: true });
                         }}
                    >
                        <div className="absolute left-0 top-0 right-0 h-1 z-10" style={{ backgroundColor: kpi.color }}></div>
                        <div className="flex justify-between items-start mb-2 mt-1 z-10 relative pointer-events-none">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                                    <kpi.icon size={14} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{kpi.label}</h3>
                            </div>
                            <button className="text-gray-300 hover:text-gray-500 pointer-events-auto"><ChevronDown size={14} /></button>
                        </div>
                        <div className="flex items-end gap-2 mt-1 z-10 relative pointer-events-none">
                            {refreshing && kpi.val === undefined
                                ? <SkeletonBox w="w-16" h="h-7" rounded="rounded-md" />
                                : <p className="text-2xl font-black text-gray-900 leading-none">{formatNumber(kpi.val)}</p>
                            }
                            {!refreshing && <span className="text-[10px] font-bold text-green-500 mb-0.5">↑+5%</span>}
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 mt-1 z-10 relative pointer-events-none">{kpi.desc}</p>
                        <div className="mt-2 -mx-1 z-10 relative pointer-events-none"><Sparkline color={kpi.color} data={kpi.spark} /></div>
                    </div>
                ))}
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Registrations Overview */}
                <div className="premium-card p-5 lg:col-span-5 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <BarChart size={16} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900">Registrations Overview</h3>
                                <p className="text-[11px] text-gray-500 font-medium">Monthly trend of platform registrations</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 border border-gray-200 rounded-md text-[11px] font-bold text-gray-600 flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                            Last 6 Months <ChevronDown size={12} />
                        </div>
                    </div>
                    <div className="flex-1 w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.registrationsOverview || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} />
                                <RechartsTooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} iconType="circle" iconSize={8} />
                                <Bar dataKey="Candidates" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={12} />
                                <Bar dataKey="Employers" fill={COLORS.teal} radius={[2, 2, 0, 0]} barSize={12} />
                                <Bar dataKey="Institutes" fill={COLORS.purple} radius={[2, 2, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skill Domains Distribution */}
                <div className="premium-card p-5 lg:col-span-4 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                <PieChart size={16} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900">Skill Domains Distribution</h3>
                                <p className="text-[11px] text-gray-500 font-medium">Registered candidates by domain</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 border border-gray-200 rounded-md text-[11px] font-bold text-gray-600 flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                            All India <ChevronDown size={12} />
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[18px] font-black text-gray-900 leading-none">{formatNumber(stats?.totalCandidates)}</span>
                            <span className="text-[10px] font-bold text-gray-500 mt-1">Candidates</span>
                        </div>
                        
                        {/* Custom Legend to match image */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                            {pieData.slice(0,6).map((entry, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: PIE_COLORS[i % PIE_COLORS.length]}}></span>
                                        <span className="text-[11px] font-bold text-gray-600 w-24 truncate">{entry.name}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-gray-900">{entry.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Network Presence */}
                <div className="premium-card p-5 lg:col-span-3 flex flex-col relative">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Building2 size={16} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900">Network Presence</h3>
                                <p className="text-[11px] text-gray-500 font-medium">Training institutes across India</p>
                            </div>
                        </div>
                        <button className="text-[10px] font-bold text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-50 transition-colors">
                            View Full Map →
                        </button>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center relative mt-4">
                        <div className="w-full max-w-[180px] opacity-80 pl-4">
                            <CustomSVGMap 
                                map={India} 
                                onLocationMouseOver={handleMapMouseOver}
                                onLocationMouseOut={() => setMapTooltip({ show: false, x: 0, y: 0, content: '' })}
                            />
                        </div>
                        
                        {/* Overlay Stats */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                            <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm flex items-center gap-3 w-32 hover:border-blue-200 transition-colors cursor-default">
                                <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0"><Building2 size={14}/></div>
                                <div>
                                    <p className="text-[13px] font-black text-gray-900 leading-none">{formatNumber(stats?.networkPresence?.totalInstitutes)}</p>
                                    <p className="text-[9px] font-bold text-gray-500">Total Institutes</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm flex items-center gap-3 w-32 hover:border-green-200 transition-colors cursor-default">
                                <div className="w-7 h-7 bg-green-50 text-green-600 rounded flex items-center justify-center shrink-0"><AlertTriangle size={14}/></div>
                                <div>
                                    <p className="text-[13px] font-black text-gray-900 leading-none">3</p>
                                    <p className="text-[9px] font-bold text-gray-500">Active Districts</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm flex items-center gap-3 w-32 hover:border-blue-200 transition-colors cursor-default">
                                <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0"><Users size={14}/></div>
                                <div>
                                    <p className="text-[13px] font-black text-gray-900 leading-none">{formatNumber(stats?.networkPresence?.statesUTs)}</p>
                                    <p className="text-[9px] font-bold text-gray-500">States / UTs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-4 border-t border-gray-50 pt-3">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#1D4ED8]"></div><span className="text-[9px] text-gray-600 font-bold">Primary Hub (Maharashtra)</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#3B82F6]"></div><span className="text-[9px] text-gray-600 font-bold">Active Institutes</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#E0F2FE]"></div><span className="text-[9px] text-gray-600 font-bold">Upcoming Hubs</span></div>
                    </div>
                </div>

            </div>

            {/* BOTTOM ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Pending Approvals Queue */}
                <div className="premium-card p-5 lg:col-span-5 flex flex-col">
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                <AlertTriangle size={16} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900">Pending Approvals Queue</h3>
                                <p className="text-[11px] text-gray-500 font-medium">Recent registrations requiring super admin verification</p>
                            </div>
                        </div>
                        <button className="text-[10px] font-bold text-blue-600 px-3 py-1.5 rounded-md border border-blue-100 hover:bg-blue-50 transition-colors">
                            View All
                        </button>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-2 text-[9px] font-black text-gray-400 uppercase tracking-wider">Entity Name</th>
                                    <th className="pb-2 text-[9px] font-black text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="pb-2 text-[9px] font-black text-gray-400 uppercase tracking-wider">Location</th>
                                    <th className="pb-2 text-[9px] font-black text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="pb-2 text-[9px] font-black text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats?.pendingApprovalsQueue && stats.pendingApprovalsQueue.length > 0 ? (
                                    stats.pendingApprovalsQueue.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${item.accountType === 'Employer' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {item.accountType === 'Employer' ? <Briefcase size={12}/> : <GraduationCap size={12}/>}
                                                    </div>
                                                    <span className="text-[11px] font-bold text-gray-800 truncate max-w-[120px]">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5">
                                                <span className={`text-[9px] font-bold ${item.accountType === 'Employer' ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    {item.accountType}
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-[10px] font-medium text-gray-600 truncate max-w-[80px]">{item.location || 'India'}</td>
                                            <td className="py-2.5 text-[10px] font-medium text-gray-500">
                                                {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => navigate(`/admin/${item.accountType === 'Employer' ? 'employers' : 'institutes'}`)}
                                                        className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                                                    >
                                                        Review
                                                    </button>
                                                    <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={14}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-[11px] font-medium text-gray-500">
                                            No pending approvals in the queue.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Background Task Queue */}
                <div className="premium-card p-5 lg:col-span-4 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900">AI Background Task Queue</h3>
                                <p className="text-[11px] text-gray-500 font-medium">System background processing status</p>
                            </div>
                        </div>
                        <div className="px-2 py-1 bg-green-50 border border-green-100 rounded flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-green-600"/>
                            <span className="text-[9px] font-black text-green-700 uppercase">Success Rate: {stats?.aiProcessRate || '100%'}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 flex-1 justify-center">
                        {(stats?.aiQueue || []).map((task, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                                    {i === 0 ? <Users size={12}/> : i === 1 ? <Briefcase size={12}/> : i === 2 ? <BarChart size={12}/> : i===3 ? <Building2 size={12}/> : <Calendar size={12}/>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[11px] font-bold text-gray-700">{task.name}</span>
                                        <span className="text-[11px] font-black text-gray-900">{task.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${task.progress}%`, backgroundColor: task.color }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="premium-card p-5 lg:col-span-3 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900">Recent Activities</h3>
                                <p className="text-[11px] text-gray-500 font-medium">Live system activity feed</p>
                            </div>
                        </div>
                        <button className="text-[10px] font-bold text-blue-600 hover:underline">
                            View All
                        </button>
                    </div>

                    <div className="flex-1 relative mt-2">
                        {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {stats.recentActivities.map((act, i) => {
                                    // Determine color based on activity type or index
                                    const dotColor = act.type === 'New_Employer' ? COLORS.blue : act.type === 'New_Institute' ? COLORS.purple : act.type === 'System_Alert' ? COLORS.red : COLORS.green;
                                    
                                    // Calc time ago
                                    const diff = Math.floor((new Date() - new Date(act.date)) / 60000);
                                    let timeAgo = `${diff} mins ago`;
                                    if (diff > 60) timeAgo = `${Math.floor(diff/60)} hours ago`;
                                    if (diff > 1440) timeAgo = `${Math.floor(diff/1440)} days ago`;

                                    return (
                                        <div key={i} className="relative flex gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all duration-300 group cursor-default">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${dotColor}10`, border: `1px solid ${dotColor}30` }}>
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}80` }}></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[13px] font-black text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{act.title}</p>
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">{timeAgo}</span>
                                                </div>
                                                <p className="text-[11px] font-medium text-gray-500 leading-relaxed line-clamp-2">{act.subtitle}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-4">
                                <p className="text-[11px] font-medium text-gray-500">No recent activities.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
