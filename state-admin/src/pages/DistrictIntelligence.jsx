import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
    MapPin, Briefcase, Building2, Users, Target, ArrowUpRight, 
    Download, ChevronDown, MoreVertical, TrendingUp, AlertTriangle, Lightbulb,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import DistrictDigitalTwin from '../components/DistrictDigitalTwin';
import DistrictIntelligenceModal from '../components/DistrictIntelligenceModal';
import SendRequirementModal from '../components/SendRequirementModal';

const DistrictIntelligence = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useSocket();
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedDistrictId, setSelectedDistrictId] = useState('all');
    const [digitalTwinData, setDigitalTwinData] = useState(null);

    // Modal states
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    
    // Notification Modal states
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [notifyTarget, setNotifyTarget] = useState(null);

    const fetchDigitalTwin = async (distId = 'all') => {
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const { data } = await axios.get(`/api/state-admin/intelligence/district-twin/${distId}`, {
                headers: { token }
            });
            if (data.success) {
                setDigitalTwinData(data.digitalTwin);
            }
        } catch (e) {
            console.error("Failed to fetch digital twin", e);
        }
    };

    const handleSelectDistrict = (distId) => {
        setSelectedDistrictId(distId);
        fetchDigitalTwin(distId);
    };

    const fetchDistricts = async (silent = false) => {
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            await fetchDigitalTwin(selectedDistrictId || 'all');
            
            const stateParam = user?.scope?.state ? `?state=${encodeURIComponent(user.scope.state)}` : '';
            const { data } = await axios.get(`/api/state-admin/intelligence/districts${stateParam}`, {
                headers: { token }
            });

            if (data.success) {
                setDistricts(data.districts || []);
            } else {
                if (!silent) setError('Failed to fetch district data.');
            }
        } catch (err) {
            if (!silent) setError('Error fetching district intelligence.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchDistricts();
    }, [user]);

    useEffect(() => {
        if (!socket) return;
        
        let timeoutId;
        const handleStaleData = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fetchDistricts(true); // silent refresh
            }, 2000);
        };

        socket.on('dashboard_stale', handleStaleData);
        
        return () => {
            socket.off('dashboard_stale', handleStaleData);
            clearTimeout(timeoutId);
        };
    }, [socket, selectedDistrictId, user]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
    if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

    const maxJobs = Math.max(...districts.map(d => d.jobs || 0), 1);
    const maxCapacity = Math.max(...districts.map(d => d.capacity || 0), 1);
    const maxScale = Math.max(maxJobs, maxCapacity);

    // KPI Calculations
    const totalJobs = districts.reduce((sum, d) => sum + d.jobs, 0);
    const totalCandidates = districts.reduce((sum, d) => sum + d.enrollments, 0);
    const totalInstitutes = districts.reduce((sum, d) => sum + d.institutes, 0);
    const placementReadiness = 78; // Dummy visual metric as requested

    // Recharts Data Prep
    const chartData = districts.map(d => ({
        name: d.districtName,
        Demand: d.jobs,
        Supply: d.capacity
    }));

    return (
        <div className="min-h-full bg-[#F6F8FC] p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full mx-auto space-y-6">
                
                {/* Breadcrumbs */}
                <div className="flex items-center text-[13px] text-gray-500 font-medium tracking-wide">
                    <span>Home</span>
                    <span className="mx-2">›</span>
                    <span>State Intelligence</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 font-semibold">Geographical Intelligence</span>
                </div>

                {/* Header Controls */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                <MapPin size={22} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                Geographical Intelligence
                            </h1>
                        </div>
                        <p className="text-[14px] text-gray-500 font-medium pl-14">
                            Focus View: Demand & Supply analytics for Key Tier-1/Tier-2 Districts.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-200 text-gray-700 text-[13px] font-bold py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
                                <option>Maharashtra</option>
                            </select>
                            <MapPin size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        
                        <div className="relative">
                            <select className="appearance-none bg-white border border-gray-200 text-gray-700 text-[13px] font-bold py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
                                <option>Last 6 Months</option>
                                <option>Last 12 Months</option>
                                <option>All Time</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md flex items-center gap-2 transition-all">
                            <Download size={14} /> Export Report
                        </button>
                    </div>
                </div>

                {/* District Digital Twin Section */}
                <DistrictDigitalTwin 
                    twinData={digitalTwinData} 
                    onSelectDistrict={handleSelectDistrict} 
                    districtsList={districts} 
                    selectedDistrictId={selectedDistrictId} 
                />

                {/* KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Briefcase size={20} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight size={12} /> +12%
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1 font-medium">vs last month</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{totalJobs.toLocaleString()}</h3>
                        <p className="text-[13px] text-gray-500 font-medium">Total Active Jobs</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight size={12} /> +8%
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1 font-medium">vs last month</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{totalCandidates >= 1000 ? (totalCandidates/1000).toFixed(1) + 'K' : totalCandidates}</h3>
                        <p className="text-[13px] text-gray-500 font-medium">Total Candidates</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Building2 size={20} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight size={12} /> +5%
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1 font-medium">vs last month</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{totalInstitutes}</h3>
                        <p className="text-[13px] text-gray-500 font-medium">Training Institutes</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight size={12} /> +14%
                                </span>
                                <span className="text-[10px] text-gray-400 mt-1 font-medium">vs last month</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{placementReadiness}%</h3>
                        <p className="text-[13px] text-gray-500 font-medium">Placement Readiness</p>
                    </div>
                </div>

                {/* District Intelligence Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {districts.map((district, idx) => {
                        const demandPercent = maxScale > 0 ? Math.round((district.jobs / maxScale) * 100) : 0;
                        const supplyPercent = maxScale > 0 ? Math.round((district.capacity / maxScale) * 100) : 0;
                        
                        // Logic for Pune or High Demand
                        const isHighDemand = demandPercent > 80 && demandPercent > supplyPercent;

                        return (
                            <div 
                                key={idx} 
                                onClick={() => {
                                    setSelectedDistrictId(district.districtId);
                                    setIsInsightModalOpen(true);
                                }}
                                className="bg-white rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer"
                            >
                                
                                {/* Card Header with subtle visual */}
                                <div className="bg-[#101828] p-5 relative overflow-hidden shrink-0">
                                    {/* Abstract Map visual background */}
                                    <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48cGF0aCBkPSJNMTAgMTBoNjB2NjBIMTB6IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] bg-repeat"></div>
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full"></div>
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                                <MapPin size={18} className="text-blue-300" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white tracking-wide">{district.districtName}</h2>
                                                <p className="text-[11px] text-blue-200 font-medium">Maharashtra</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-white transition-colors p-1">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-5 right-5 z-10">
                                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            Tier-{idx === 2 ? '1' : idx === 1 ? '1' : '2'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Card Body */}
                                <div className="p-5 flex-1 flex flex-col space-y-5">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">
                                                <Briefcase size={12} className="text-indigo-500"/> Demand
                                            </div>
                                            <div className="text-[22px] font-black text-gray-900 leading-none">{district.jobs}</div>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1">Active Jobs</p>
                                        </div>
                                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">
                                                <Target size={12} className="text-emerald-500"/> Supply
                                            </div>
                                            <div className="text-[22px] font-black text-gray-900 leading-none">{district.capacity}</div>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1">Total Seats</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-600">
                                            <Building2 size={14} className="text-gray-400"/> {district.institutes} Institutes
                                        </div>
                                        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-600">
                                            <Users size={14} className="text-gray-400"/> {district.enrollments} Enrolled
                                        </div>
                                    </div>

                                    {/* Progress Bars */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <div className="flex justify-between text-[11px] mb-1.5">
                                                <span className="text-gray-500 font-medium">Demand Intensity</span>
                                                <span className="text-indigo-600 font-bold">{demandPercent}%</span>
                                            </div>
                                            <div className="w-full bg-indigo-50 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-indigo-500 h-full rounded-full relative group transition-all duration-1000 ease-out" style={{ width: `${demandPercent}%` }}>
                                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[11px] mb-1.5">
                                                <span className="text-gray-500 font-medium">Supply Capacity</span>
                                                <span className="text-emerald-600 font-bold">{supplyPercent}%</span>
                                            </div>
                                            <div className="w-full bg-emerald-50 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${supplyPercent}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Contextual Status */}
                                    <div className="mt-auto pt-2">
                                        {isHighDemand ? (
                                            <div className="bg-red-50/80 text-red-700 text-[12px] px-3.5 py-3 rounded-xl font-medium border border-red-100 flex items-start gap-2">
                                                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-500" />
                                                <span><strong className="font-bold">Skill Shortage Detected.</strong> Recommend starting new batches.</span>
                                            </div>
                                        ) : district.capacity > district.jobs && district.jobs > 0 ? (
                                            <div className="bg-emerald-50/80 text-emerald-700 text-[12px] px-3.5 py-3 rounded-xl font-medium border border-emerald-100 flex items-start gap-2">
                                                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                                                <span><strong className="font-bold">Sufficient Supply.</strong> Focus on placement assistance.</span>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50/80 text-gray-600 text-[12px] px-3.5 py-3 rounded-xl font-medium border border-gray-200 flex items-start gap-2">
                                                <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-500" />
                                                <span>No significant activity detected currently.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* Main Chart */}
                    <div className="bg-white p-5 lg:p-6 rounded-[20px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] border border-gray-100 lg:col-span-1 xl:col-span-2 flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart size={18} className="text-blue-600" />
                            <h3 className="font-bold text-gray-900">Demand vs Supply Overview</h3>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 11 }} 
                                    />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend 
                                        iconType="circle" 
                                        wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '20px' }}
                                    />
                                    <Bar dataKey="Demand" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="Supply" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Side Stack */}
                    <div className="space-y-5 flex flex-col">
                        
                        {/* District Skill Gaps */}
                        <div className="bg-white p-5 lg:p-6 rounded-[20px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] border border-gray-100">
                            <div className="flex items-center gap-2 mb-5">
                                <Target size={18} className="text-blue-600" />
                                <h3 className="font-bold text-gray-900 text-[14px]">District-wise Skill Gaps</h3>
                            </div>
                            <div className="space-y-4">
                                {districts.map((d, i) => {
                                    // Gap Calculation
                                    const demand = d.jobs;
                                    const supply = d.capacity;
                                    const gap = demand > supply && supply > 0 ? ((demand - supply) / demand) * 100 : (demand > 0 && supply === 0 ? 100 : 0);
                                    const gapRounded = Math.round(gap);
                                    
                                    let barColor = 'bg-gray-200';
                                    let progressColor = 'bg-gray-400';
                                    if (gapRounded > 50) { barColor = 'bg-red-50'; progressColor = 'bg-red-500'; }
                                    else if (gapRounded > 0) { barColor = 'bg-amber-50'; progressColor = 'bg-amber-500'; }

                                    return (
                                        <div key={i} className="relative group cursor-pointer pb-1">
                                            <div className="flex justify-between text-[12px] mb-1.5 font-medium">
                                                <span className="text-gray-700">{d.districtName}</span>
                                                <span className={gapRounded > 50 ? 'text-red-600 font-bold' : gapRounded > 0 ? 'text-amber-600 font-bold' : 'text-gray-500 font-bold'}>{gapRounded}%</span>
                                            </div>
                                            <div className={`w-full ${barColor} rounded-full h-1.5`}>
                                                <div className={`${progressColor} h-1.5 rounded-full`} style={{ width: `${gapRounded}%` }}></div>
                                            </div>

                                            {/* Custom Hover Tooltip */}
                                            <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                                <div className={`bg-white p-3 rounded-xl border shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-[12px] min-w-[220px] relative ${gapRounded > 0 ? 'border-red-100' : 'border-blue-100'}`}>
                                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                                        <AlertTriangle size={14} className={gapRounded > 0 ? "text-red-500" : "text-blue-500"}/>
                                                        <p className="font-bold text-gray-900 uppercase tracking-wider">{d.districtName}</p>
                                                    </div>
                                                    <div className="space-y-1.5 mb-2.5 text-gray-500 font-medium text-[11px]">
                                                        <p className="flex justify-between"><span>Market Demand (Jobs):</span> <span className="font-bold text-gray-800">{demand}</span></p>
                                                        <p className="flex justify-between"><span>Available Supply (Seats):</span> <span className="font-bold text-gray-800">{supply}</span></p>
                                                        <div className="w-full h-px bg-gray-50 my-1"></div>
                                                        <p className={`flex justify-between ${gapRounded > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            <span>{gapRounded > 0 ? 'Shortage (Gap):' : 'Surplus:'}</span> 
                                                            <span className="font-black text-[12px]">{gapRounded > 0 ? `-${demand - supply}` : `+${supply - demand}`}</span>
                                                        </p>
                                                    </div>
                                                    <div className={`${gapRounded > 0 ? 'bg-red-50/80 border-red-100/50' : 'bg-emerald-50/80 border-emerald-100/50'} p-2 rounded-lg border`}>
                                                        <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${gapRounded > 0 ? 'text-red-400' : 'text-emerald-500'}`}>Solution</p>
                                                        <p className={`${gapRounded > 0 ? 'text-red-700' : 'text-emerald-700'} font-bold leading-tight`}>{gapRounded > 50 ? 'Increase Training Capacity' : gapRounded > 0 ? 'Start New Batches' : 'Monitor Situation'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Key Insights Panel */}
                        <div className="bg-white p-5 lg:p-6 rounded-[20px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] border border-gray-100 flex-1">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Lightbulb size={18} className="text-amber-500" />
                                    <h3 className="font-bold text-gray-900 text-[14px]">Key Insights</h3>
                                </div>
                                <span className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">View All &rarr;</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <TrendingUp size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-900 leading-snug mb-0.5">High demand for IT & Software roles in Pune</p>
                                        <p className="text-[11px] text-gray-500">Consider increasing training capacity.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Users size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-900 leading-snug mb-0.5">Low enrollment across all districts</p>
                                        <p className="text-[11px] text-gray-500">Awareness campaigns can help.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <Building2 size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-900 leading-snug mb-0.5">Infrastructure expansion needed</p>
                                        <p className="text-[11px] text-gray-500">Focus on Tier-2 districts for balanced growth.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Modals */}
            <DistrictIntelligenceModal 
                isOpen={isInsightModalOpen}
                onClose={() => setIsInsightModalOpen(false)}
                districtId={selectedDistrictId}
                onNotifyClick={(districtData) => {
                    setIsInsightModalOpen(false);
                    // Open Send Requirement Modal and pass district name as target
                    setNotifyTarget({ name: `All Institutes in ${districtData.districtName}`, districtId: districtData.districtId, topSkills: districtData.topShortages });
                    setIsNotifyModalOpen(true);
                }}
            />

            {isNotifyModalOpen && (
                <SendRequirementModal 
                    isOpen={isNotifyModalOpen}
                    onClose={() => setIsNotifyModalOpen(false)}
                    targetInstitute={notifyTarget}
                    topSkills={notifyTarget?.topSkills}
                />
            )}
        </div>
    );
};

export default DistrictIntelligence;
