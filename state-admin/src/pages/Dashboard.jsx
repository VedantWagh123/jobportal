import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, BookOpen, Users, Activity, TrendingUp, AlertTriangle, X, Building, Mail, MapPin, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const StatCard = ({ title, value, icon, trend, colorClass, trendText }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex items-center gap-5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-50">
        <div className={`p-4 rounded-xl flex-shrink-0 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
            {trendText && <p className={`text-sm mt-1.5 font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-amber-600' : 'text-blue-600'}`}>{trendText}</p>}
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI States for Drill-down modals
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [selectedInstituteId, setSelectedInstituteId] = useState(null);
    const [instituteDetails, setInstituteDetails] = useState(null);
    const [loadingInstitute, setLoadingInstitute] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = user?.token || localStorage.getItem('stateAdminToken');
                if (token) {
                    const { data } = await axios.get('/api/state-admin/intelligence/dashboard', {
                        headers: { token }
                    });
                    if (data.success && data.analytics) {
                        setAnalytics(data.analytics);
                        setAlerts(data.analytics.activeAlerts || []);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return <div className="flex justify-center p-12 text-gray-400">Loading intelligence data...</div>;
    if (!analytics) return <div className="text-center p-12 text-red-500">Failed to load analytics.</div>;

    const kpis = analytics.kpis || {};
    const supplyVsDemandData = analytics.supplyVsDemand || [];
    const pieData = analytics.gapDistribution || [];
    
    const fetchInstituteDetails = async (id) => {
        setLoadingInstitute(true);
        setSelectedInstituteId(id);
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const { data } = await axios.get(`/api/state-admin/intelligence/institute/${id}`, {
                headers: { token }
            });
            if (data.success) {
                setInstituteDetails(data.institute);
            }
        } catch (error) {
            console.error("Failed to fetch institute details", error);
        } finally {
            setLoadingInstitute(false);
        }
    };

    // Calculate total for pie chart center
    const totalSkillsEvaluated = pieData.reduce((acc, curr) => acc + (curr.value || 0), 0);

    // Process Data for New Charts
    const demandRankedData = [...supplyVsDemandData].sort((a, b) => b.demand - a.demand).slice(0, 8);
    const gapData = supplyVsDemandData.map(item => ({
        name: item.name,
        gap: item.demand - item.supply > 0 ? item.demand - item.supply : 0,
        demand: item.demand,
        supply: item.supply
    })).sort((a, b) => b.gap - a.gap).filter(item => item.gap > 0).slice(0, 5);

    return (
        <div className="space-y-8 bg-gray-50/30 min-h-screen pb-12">
            <header className="mb-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">State Intelligence Dashboard</h1>
                <p className="text-gray-500 mt-2 text-sm font-medium">Real-time analysis of skill demand, supply, and critical gaps.</p>
            </header>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Job Vacancies" 
                    value={(kpis.totalVacancies || 0).toLocaleString()} 
                    trend="up" 
                    trendText="High Market Demand"
                    colorClass="bg-blue-50 text-blue-600 border border-blue-100" 
                    icon={<Briefcase size={24} />} 
                />
                <StatCard 
                    title="Total Enrollments" 
                    value={(kpis.totalEnrollments || 0).toLocaleString()} 
                    trend="neutral" 
                    trendText="Candidate Supply"
                    colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    icon={<Users size={24} />} 
                />
                <StatCard 
                    title="Critical Gaps" 
                    value={gapData.length.toLocaleString()} 
                    trend="down"
                    trendText="Skills needing attention"
                    colorClass="bg-amber-50 text-amber-600 border border-amber-100" 
                    icon={<AlertTriangle size={24} />} 
                />
                <StatCard 
                    title="Training Capacity" 
                    value={(kpis.trainingCapacity || 0).toLocaleString()} 
                    trend="neutral"
                    trendText="Across all institutes"
                    colorClass="bg-indigo-50 text-indigo-600 border border-indigo-100" 
                    icon={<BookOpen size={24} />} 
                />
            </div>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. SKILL DEMAND (Ranked Bar Chart) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Highest Demand Skills</h3>
                        <p className="text-sm text-gray-500 mt-1">Ranked by active job vacancies</p>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demandRankedData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 13, fontWeight: 500}} />
                                <Tooltip 
                                    cursor={{fill: '#f9fafb'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                />
                                <Bar dataKey="demand" name="Active Vacancies" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                                    {demandRankedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 2 ? '#2563eb' : '#60a5fa'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. DEMAND vs SUPPLY */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Demand vs Supply Comparison</h3>
                        <p className="text-sm text-gray-500 mt-1">Market requirements vs Current candidates</p>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={supplyVsDemandData.slice(0, 6)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f9fafb'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                                <Bar dataKey="demand" name="Market Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar 
                                    dataKey="supply" 
                                    name="Available Supply" 
                                    fill="#10b981" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={20}
                                    onClick={(data) => {
                                        if (data && data.payload) setSelectedSkill(data.payload);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. SKILL GAP (High Demand, Low Supply) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Critical Skill Gaps (Shortages)</h3>
                        <p className="text-sm text-gray-500 mt-1">Skills where Market Demand significantly exceeds Available Supply</p>
                    </div>
                    <div className="h-[350px]">
                        {gapData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 13, fontWeight: 500}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: '#fffbeb'}}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #fef3c7', boxShadow: '0 10px 25px -5px rgba(217, 119, 6, 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                                    <Bar dataKey="demand" name="Required (Demand)" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={24} />
                                    <Bar dataKey="supply" name="Available (Supply)" fill="#6ee7b7" radius={[4, 4, 0, 0]} barSize={24} />
                                    {/* The Gap itself represented as a distinct warning bar over the same axis might be complex in standard Recharts without ComposedChart, so we just use the gap value visually */}
                                    <Bar dataKey="gap" name="Shortage (Gap)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <CheckCircle size={48} className="text-emerald-400 mb-3" />
                                <p className="font-medium text-gray-900">No Critical Shortages</p>
                                <p className="text-sm">Supply is currently meeting or exceeding demand across all tracked skills.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            {/* Low Supply - High Demand Skills Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-amber-500" />
                        Critical Skill Shortages (Action Required)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Skill Gap Identified (AI Analysis)</th>
                                <th className="px-6 py-3">Severity</th>
                                <th className="px-6 py-3">AI Message</th>
                                <th className="px-6 py-3">Action Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {alerts.length > 0 ? (
                                alerts.map((alert, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{alert.skill}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${alert.severity === 'Critical' ? 'bg-red-100 text-red-700' : alert.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {alert.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{alert.message}</td>
                                        <td className="px-6 py-4 text-blue-600 font-medium">{alert.recommendedAction || 'Review required'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="bg-gray-100 p-3 rounded-full text-gray-400 mb-2">
                                                <Activity size={24} />
                                            </div>
                                            <p className="font-medium text-gray-900">No Critical Shortages Detected</p>
                                            <p className="text-sm">The AI engine hasn't identified any severe skill gaps in the market right now.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Supply Breakdown Modal */}
            {selectedSkill && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Supply Breakdown: <span className="text-blue-600">{selectedSkill.name}</span></h2>
                                <p className="text-sm text-gray-500 mt-1">Total Demand: {selectedSkill.demand} | Total Supply: {selectedSkill.supply}</p>
                            </div>
                            <button onClick={() => setSelectedSkill(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {selectedSkill.providers && selectedSkill.providers.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900 mb-4">Training Institutes providing this skill:</h3>
                                    {selectedSkill.providers.map((provider, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => { setSelectedSkill(null); fetchInstituteDetails(provider.instituteId); }}
                                            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition bg-white group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
                                                    <Building size={20} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{provider.instituteName}</h4>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                        <Users size={14}/> Capacity: {provider.capacity} seats
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition">
                                                View Details &rarr;
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle size={24} className="text-amber-500" />
                                    </div>
                                    <p className="font-medium text-gray-900">No active supply found.</p>
                                    <p className="text-sm mt-1">Currently no institutes are providing training for this skill.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Institute Details Modal */}
            {selectedInstituteId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        {loadingInstitute ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : instituteDetails ? (
                            <>
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex justify-between items-start text-white">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                                                {instituteDetails.type || 'Institute'}
                                            </span>
                                            {instituteDetails.isApproved && (
                                                <span className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md flex items-center gap-1">
                                                    <CheckCircle size={12}/> Verified
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-3xl font-bold">{instituteDetails.name}</h2>
                                        <p className="text-blue-100 mt-2 flex items-center gap-2">
                                            <MapPin size={16}/> {instituteDetails.districtId?.name}, {instituteDetails.districtId?.state}
                                        </p>
                                    </div>
                                    <button onClick={() => { setSelectedInstituteId(null); setInstituteDetails(null); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-8 overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <Mail size={18} className="text-blue-500"/>
                                                    <span className="font-medium">{instituteDetails.email}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Accreditation</h3>
                                                <div className="flex items-center gap-3 text-gray-700 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                                    <CheckCircle size={18} className="text-emerald-600"/>
                                                    <span className="font-medium text-emerald-900">{instituteDetails.accreditation || 'Not Specified'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Registration Details</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Joined Date</p>
                                                    <p className="font-medium text-gray-900">{new Date(instituteDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">System ID</p>
                                                    <p className="font-mono text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded inline-block mt-1">{instituteDetails._id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center text-red-500 flex flex-col items-center">
                                <AlertTriangle size={32} className="mb-2" />
                                <p>Failed to load institute details.</p>
                                <button onClick={() => setSelectedInstituteId(null)} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Close</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
