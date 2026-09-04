import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
    Briefcase, MapPin, Building2, Users, GraduationCap, Target, 
    TrendingUp, TrendingDown, AlertTriangle, Lightbulb, CheckCircle2, ChevronRight, BarChart2,
    Sparkles, Loader2, Send
} from 'lucide-react';
import Loading from '../../components/Loading';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const PIE_COLORS_GAP = ['#EF4444', '#F59E0B', '#10B981'];

const IntelligenceDashboard = () => {
    const { backendUrl } = useContext(AppContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simulator State
    const [prompt, setPrompt] = useState("");
    const [simulating, setSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.get(`${backendUrl}/api/government-admin/intelligence/dashboard`, {
                    headers: { token }
                });
                
                if (response.data.success) {
                    setData(response.data.analytics);
                } else {
                    toast.error('Failed to load analytics');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error fetching analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [backendUrl]);

    const handleSimulate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setSimulating(true);
        setSimulationResult(null);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post(`${backendUrl}/api/government-admin/intelligence/simulate`, 
                { prompt },
                { headers: { token } }
            );

            if (response.data.success) {
                setSimulationResult(response.data);
            } else {
                toast.error(response.data.message || 'Simulation failed');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error running simulation');
        } finally {
            setSimulating(false);
        }
    };

    if (loading) return <Loading />;
    if (!data) return <div className="p-8 text-center text-gray-500">No data available</div>;

    // Use real data from backend
    const displayTopSkills = data.supplyVsDemand || [];
    const displayGapDistribution = data.gapDistribution || [];
    const displayIndustryDemand = data.industryWiseDemand || [];
    const displayTopDistricts = data.topDistrictsByGap || [];
    const displayTableData = data.supplyGapTable || [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-sm z-50">
                    <p className="font-bold text-gray-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="font-medium text-[13px]">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pt-2">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <BarChart2 className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-extrabold text-[#1a233a] tracking-tight">Intelligence Dashboard</h1>
                    </div>
                    <p className="text-gray-500 font-medium ml-11">Real-time Labour Market & Training Analytics</p>
                </div>
                
                <div className="hidden lg:flex items-center bg-white border border-blue-50/50 shadow-sm rounded-2xl px-6 py-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-20 h-full">
                        <svg viewBox="0 0 100 60" className="h-full">
                            <path d="M0,20 Q50,-10 100,20 L100,60 L0,60 Z" fill="#FF9933" />
                            <path d="M0,40 Q50,10 100,40 L100,60 L0,60 Z" fill="#138808" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-start gap-2">
                            <span className="text-3xl text-blue-400 font-serif leading-none">"</span>
                            <div>
                                <p className="text-[#1a233a] font-bold text-sm">Data-driven skilling for a stronger, self-reliant India.</p>
                                <p className="text-gray-500 text-xs text-right mt-0.5">— Skill India Mission</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-6">
                <KPICard icon={<Briefcase />} title="Active Jobs" value={data.kpis?.totalJobs || 0} trend="+12%" trendText="vs last month" trendUp={true} color="blue" sparklineData={[10, 25, 15, 30, 20, 45, 40]} />
                <KPICard icon={<MapPin />} title="Districts" value={data.kpis?.totalDistricts || 0} trend="+4" trendText="Total covered" trendUp={true} color="purple" sparklineData={[5, 10, 8, 15, 12, 20, 24]} />
                <KPICard icon={<Building2 />} title="Institutes" value={data.kpis?.totalInstitutes || 0} trend="+8" trendText="Registered" trendUp={true} color="emerald" sparklineData={[20, 30, 40, 35, 50, 65, 86]} />
                <KPICard icon={<Users />} title="Batches" value={data.kpis?.activeBatches || 0} trend="+18%" trendText="Running" trendUp={true} color="amber" sparklineData={[40, 50, 45, 80, 70, 110, 128]} />
                <KPICard icon={<GraduationCap />} title="Training Capacity" value={data.kpis?.trainingCapacity || 0} trend="+22%" trendText="Total seats" trendUp={true} color="red" sparklineData={[8000, 8500, 9000, 10000, 10500, 11500, 12500]} />
                <KPICard icon={<Target />} title="Enrollments" value={data.kpis?.totalEnrollments || 0} trend="+35%" trendText="Total students" trendUp={true} color="sky" sparklineData={[4000, 4500, 5200, 6000, 7500, 8000, 8432]} />
            </div>

            {/* Top Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
                {/* Top Demanded Skills */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-bold text-[#1a233a]">Top Demanded Skills (Industry)</h3>
                        <span className="text-xs font-bold text-blue-600 cursor-pointer">View All</span>
                    </div>
                    <div className="flex-1 space-y-5 mt-2">
                        {displayTopSkills.map((skill, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-8 flex justify-center text-gray-500">
                                    {idx === 0 ? <img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" className="w-5 h-5 opacity-80" alt="Python" /> :
                                     idx === 1 ? <div className="font-bold text-[#F7DF1E] bg-black text-[10px] px-1 py-0.5 rounded-sm">JS</div> :
                                     idx === 2 ? <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200"><div className="w-2 h-2 rounded-full bg-indigo-500"></div></div> :
                                     idx === 3 ? <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" className="w-5 h-5 opacity-80" alt="React" /> :
                                     <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200"><div className="w-3 h-2 bg-blue-500 rounded-sm"></div></div>}
                                </div>
                                <div className="w-24 text-xs font-bold text-gray-700">{skill.name}</div>
                                <div className="flex-1">
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${Math.min((skill.demand / Math.max(...displayTopSkills.map(s=>s.demand), 1)) * 100, 100)}%`, backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    </div>
                                </div>
                                <div className="w-16 text-right text-xs font-bold text-gray-700">{skill.demand} jobs</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Supply vs Demand */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-base font-bold text-[#1a233a] mb-2 text-center">Training Supply vs Demand (Top Skills)</h3>
                    
                    <div className="flex justify-center gap-6 mb-6">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div><span className="text-xs font-medium text-gray-600">Industry Demand (Jobs)</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10B981]"></div><span className="text-xs font-medium text-gray-600">Training Supply (Seats)</span></div>
                    </div>

                    <div className="flex-1 h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayTopSkills} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="demand" name="Industry Demand" fill="#3B82F6" radius={[2, 2, 0, 0]} maxBarSize={24} />
                                <Bar dataKey="supply" name="Training Supply" fill="#10B981" radius={[2, 2, 0, 0]} maxBarSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skill Gap Distribution */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-[#1a233a]">Skill Gap Distribution</h3>
                        <div className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-600">All Industries ▾</div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center flex-1 mt-2">
                        <div className="relative w-40 h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={displayGapDistribution} innerRadius={60} outerRadius={75} paddingAngle={0} dataKey="value" stroke="none">
                                        {displayGapDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-[#1a233a]">{displayGapDistribution[0]?.value || 0}%</span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase text-center leading-tight mt-1">Skills in<br/>Shortage</span>
                            </div>
                        </div>

                        <div className="w-full space-y-2 mt-6 pl-2">
                            {displayGapDistribution.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="font-bold text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="font-black text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
                {/* Geographic Demand */}
                <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-[#1a233a] mb-4">Geographic Demand vs Training Capacity</h3>
                    <div className="flex gap-4 items-center">
                        <div className="w-1/2 relative bg-[#f8fafc] rounded-xl border border-blue-50 p-4 h-64 flex items-center justify-center">
                            {/* Stylized SVG Map of India (Simplified blocky version for UI aesthetics) */}
                            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
                                <path d="M40,10 L50,0 L60,10 L70,20 L80,30 L90,40 L95,60 L80,80 L70,100 L60,110 L50,120 L40,110 L30,90 L20,70 L10,60 L5,40 L15,30 L25,20 Z" fill="#BFDBFE" stroke="#fff" strokeWidth="1" />
                                <path d="M45,20 L55,10 L65,20 L70,30 L60,50 L50,60 L40,50 L35,30 Z" fill="#60A5FA" stroke="#fff" strokeWidth="0.5" />
                                <path d="M30,50 L40,40 L50,50 L60,70 L50,90 L40,80 L25,60 Z" fill="#3B82F6" stroke="#fff" strokeWidth="0.5" />
                                <path d="M40,70 L50,60 L60,80 L50,100 L45,90 Z" fill="#2563EB" stroke="#fff" strokeWidth="0.5" />
                                
                                {/* Maharashtra Point */}
                                <circle cx="35" cy="65" r="3" fill="#fff" className="animate-pulse" />
                                <circle cx="35" cy="65" r="1.5" fill="#EF4444" />
                            </svg>
                            
                            {/* Tooltip Overlay */}
                            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-100 p-3 z-10 w-44">
                                <p className="font-bold text-gray-900 text-sm mb-2 border-b pb-1">Highest Gap District</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs"><span className="text-gray-500">District:</span><span className="font-bold">{displayTopDistricts[0]?.name || 'N/A'}</span></div>
                                    <div className="flex justify-between text-xs mt-1 pt-1 border-t"><span className="text-gray-500 font-bold">Gap:</span><span className="font-bold text-red-500">{displayTopDistricts[0]?.gap || '0'}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 flex flex-col h-64">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-[#1a233a]">Top Districts by Skill Gap</span>
                                <span className="text-xs font-bold text-blue-600 cursor-pointer">View All</span>
                            </div>
                            <div className="flex-1 space-y-3">
                                {displayTopDistricts.length > 0 ? displayTopDistricts.map((dist, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center">{idx + 1}</div>
                                            <span className="text-xs font-bold text-gray-700">{dist.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-red-500">{dist.gap}</span>
                                    </div>
                                )) : <div className="text-sm text-gray-500">No district gaps found.</div>}
                            </div>
                            
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[10px] font-medium text-gray-400">Lower Demand</span>
                                <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-600"></div>
                                <span className="text-[10px] font-medium text-gray-400">Higher Demand</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Industry-wise Demand */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-base font-bold text-[#1a233a]">Industry-wise Job Demand</h3>
                        <div className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-600">All India ▾</div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center flex-1 relative">
                         <div className="w-full flex justify-center mt-2">
                            <div className="w-40 h-40 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={displayIndustryDemand} cx="50%" cy="50%" innerRadius={55} outerRadius={75} stroke="none" dataKey="value" paddingAngle={2}>
                                            {displayIndustryDemand.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-[#1a233a]">{data.kpis?.totalJobs || 0}</span>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase">Total Jobs</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full mt-4 space-y-1.5 pl-6">
                            {displayIndustryDemand.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="font-bold text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900 pr-4">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-base font-bold text-[#1a233a]">AI Insights</h3>
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
                    </div>

                    <div className="flex flex-col gap-3 flex-1 justify-between">
                        <div className="p-3 bg-green-50/50 rounded-xl border border-green-100/50 flex gap-3">
                            <div className="mt-0.5"><TrendingUp className="w-4 h-4 text-green-500" /></div>
                            <div>
                                <h4 className="text-[11px] font-bold text-gray-900 mb-0.5">High demand for Python in Pune</h4>
                                <p className="text-[10px] text-gray-500 leading-tight">Job demand has increased by 40% in Pune over the last 3 months.</p>
                            </div>
                        </div>

                        <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/50 flex gap-3">
                            <div className="mt-0.5"><Lightbulb className="w-4 h-4 text-orange-500" /></div>
                            <div>
                                <h4 className="text-[11px] font-bold text-gray-900 mb-0.5">Low training supply for Cloud skills</h4>
                                <p className="text-[10px] text-gray-500 leading-tight">Only 15% of required training seats available across Maharashtra.</p>
                            </div>
                        </div>

                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/50 flex gap-3">
                            <div className="mt-0.5"><Target className="w-4 h-4 text-purple-500" /></div>
                            <div>
                                <h4 className="text-[11px] font-bold text-gray-900 mb-0.5">Opportunity in Tier-2 cities</h4>
                                <p className="text-[10px] text-gray-500 leading-tight">Nagpur, Indore and Coimbatore show high demand but low training supply.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="p-5 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-[#1a233a]">Training Supply Gap Analysis</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Comparing Active Job Requirements against Active Training Capacity</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 cursor-pointer">View All</span>
                </div>
                
                <table className="w-full text-xs text-left">
                    <thead className="text-[10px] text-gray-500 font-bold uppercase tracking-wider border-y border-gray-100 bg-gray-50/50">
                        <tr>
                            <th className="px-5 py-3 pl-6">SKILL</th>
                            <th className="px-5 py-3 text-center">INDUSTRY DEMAND (JOBS)</th>
                            <th className="px-5 py-3 text-center">TRAINING SUPPLY (SEATS)</th>
                            <th className="px-5 py-3 text-center">CALCULATED GAP</th>
                            <th className="px-5 py-3 text-center">STATUS</th>
                            <th className="px-5 py-3">RECOMMENDED ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayTableData.length > 0 ? displayTableData.map((row, idx) => (
                            <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-4 pl-6 font-bold text-[#1a233a]">{row.skill}</td>
                                <td className="px-5 py-4 text-center font-semibold text-gray-600">{row.demand}</td>
                                <td className="px-5 py-4 text-center font-semibold text-gray-600">{row.supply}</td>
                                <td className="px-5 py-4 text-center font-black text-red-500">{row.gap}</td>
                                <td className="px-5 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                        row.status === 'High Shortage' ? 'bg-red-50 text-red-600 border-red-100' : 
                                        row.status === 'Shortage' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4 font-semibold text-blue-600 text-[11px] cursor-pointer hover:underline">
                                    {row.action}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center py-4 text-gray-500">No gap data available</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* AI Policy Simulator (Step 10) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles className="w-48 h-48 text-indigo-500" />
                </div>
                
                <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-[#1a233a]">AI "What-If" Policy Simulator</h3>
                        <p className="text-xs text-gray-500 font-medium">Ask natural language questions to forecast placement outcomes before opening new training batches.</p>
                    </div>
                </div>

                <form onSubmit={handleSimulate} className="mt-6 relative z-10 flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. What if we open 5 new Python batches in Pune next month?"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 placeholder-gray-400 shadow-inner"
                            disabled={simulating}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={simulating || !prompt.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
                    >
                        {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {simulating ? 'Simulating...' : 'Simulate'}
                    </button>
                </form>

                {/* Simulation Output */}
                {simulationResult && (
                    <div className="mt-6 bg-[#f8fafc] border border-indigo-100 rounded-xl p-5 relative z-10 shadow-sm">
                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">Simulation Report</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Extracted Intent & Market Context */}
                            <div>
                                <div className="mb-4">
                                    <h5 className="text-[11px] font-bold text-gray-500 mb-2">EXTRACTED INTENT</h5>
                                    <div className="bg-white rounded-lg p-3 border border-gray-200 flex flex-wrap gap-2 text-xs">
                                        <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                                            <span className="font-semibold opacity-70 mr-1">Skill:</span>
                                            <span className="font-bold">{simulationResult.intent.skill}</span>
                                        </div>
                                        <div className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-100">
                                            <span className="font-semibold opacity-70 mr-1">Location:</span>
                                            <span className="font-bold">{simulationResult.intent.district}</span>
                                        </div>
                                        <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                                            <span className="font-semibold opacity-70 mr-1">Proposed Seats:</span>
                                            <span className="font-bold">{simulationResult.intent.estimatedSeats}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-[11px] font-bold text-gray-500 mb-2">LIVE MARKET CONTEXT (BEFORE)</h5>
                                    <div className="bg-white rounded-lg p-3 border border-gray-200 flex justify-between items-center text-xs">
                                        <div className="text-center">
                                            <p className="font-bold text-gray-400 mb-0.5">Active Jobs</p>
                                            <p className="font-black text-gray-800">{simulationResult.marketData.activeJobs}</p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-100"></div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-400 mb-0.5">Current Supply</p>
                                            <p className="font-black text-gray-800">{simulationResult.marketData.currentSupply}</p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-100"></div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-400 mb-0.5">Gap</p>
                                            <p className={`font-black ${simulationResult.marketData.gap > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                {simulationResult.marketData.gap > 0 ? '+' : ''}{simulationResult.marketData.gap}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: AI Prediction */}
                            <div className="flex flex-col">
                                <h5 className="text-[11px] font-bold text-gray-500 mb-2 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-indigo-500" /> AI PREDICTION & RECOMMENDATION
                                </h5>
                                <div className="bg-white rounded-lg p-4 border border-indigo-100 flex-1 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                    <p className="text-sm font-medium text-gray-700 leading-relaxed pl-2 whitespace-pre-wrap">
                                        {simulationResult.prediction}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

const KPICard = ({ icon, title, value, trend, trendText, trendUp, color, sparklineData }) => {
    const colorClasses = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', stroke: '#3B82F6' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', stroke: '#8B5CF6' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', stroke: '#10B981' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-100', stroke: '#F59E0B' },
        red: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', stroke: '#EF4444' },
        sky: { bg: 'bg-sky-50', text: 'text-sky-500', border: 'border-sky-100', stroke: '#0EA5E9' },
    };

    const theme = colorClasses[color];
    const chartData = sparklineData.map((val, i) => ({ val }));

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between relative z-10">
                <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center border ${theme.border}`}>
                    {React.cloneElement(icon, { className: "w-5 h-5" })}
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-500 mb-0.5">{title}</p>
                    <h3 className="text-xl font-black text-[#1a233a] leading-none">{value}</h3>
                </div>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 relative z-10">
                {trendUp ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                <span className={`text-[10px] font-bold ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>{trend}</span>
                <span className="text-[10px] font-medium text-gray-400">{trendText}</span>
            </div>

            <div className="absolute bottom-0 right-0 w-24 h-12 opacity-40 mix-blend-multiply pointer-events-none group-hover:opacity-60 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <Line type="monotone" dataKey="val" stroke={theme.stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default IntelligenceDashboard;
