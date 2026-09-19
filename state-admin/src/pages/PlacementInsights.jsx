import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    TrendingDown, TrendingUp, Users, BarChart3, AlertTriangle, 
    Calendar, MapPin, Download, ChevronRight, CheckCircle2, 
    Lightbulb, RefreshCcw, MoreHorizontal, ChevronDown, Check,
    X, BookOpen, MessageSquare, Search, Building2, BarChart2,
    ListFilter, Grid, CalendarDays
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Dummy data for sparklines to match the UI look
const dummySparklineData = [
    { value: 10 }, { value: 15 }, { value: 8 }, { value: 25 }, 
    { value: 20 }, { value: 35 }, { value: 30 }, { value: 45 }
];

const PlacementInsights = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [expandedSubGroups, setExpandedSubGroups] = useState({});
    
    // Feedback Search & Filter State
    const [feedbackSearch, setFeedbackSearch] = useState('');
    const [feedbackFilter, setFeedbackFilter] = useState('All Feedback');
    
    // Tooltip State
    const [tooltipState, setTooltipState] = useState({
        visible: false,
        pinned: false,
        x: 0,
        y: 0
    });

    useEffect(() => {
        if (user) {
            fetchDistricts();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchInsights();
        }
    }, [user, selectedDistrict]);

    const fetchDistricts = async () => {
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const { data: res } = await axios.get('/api/state-admin/intelligence/active-districts', {
                headers: { token }
            });
            if (res.success) setDistricts(res.districts);
        } catch (err) {
            console.error('Failed to fetch active districts:', err);
        }
    };

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const { data: res } = await axios.get(`/api/state-admin/intelligence/placement-insights${selectedDistrict ? `?districtId=${selectedDistrict}` : ''}`, {
                headers: { token }
            });
            if (res.success) setData(res);
        } catch (err) {
            console.error('Failed to fetch placement insights:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (companyName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [companyName]: !prev[companyName]
        }));
    };

    const toggleSubGroup = (key) => {
        setExpandedSubGroups(prev => ({
            ...prev,
            [key]: prev[key] === undefined ? false : !prev[key]
        }));
    };

    const isSubGroupExpanded = (key) => expandedSubGroups[key] !== false;

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium mt-4">Loading Placement Intelligence...</p>
        </div>
    );
    
    if (!data) return <div className="text-center p-12 text-red-500 font-bold">Failed to load data.</div>;

    const hireRate = (data.hireStats?.total || 0) > 0
        ? Math.round((data.hireStats.hired / data.hireStats.total) * 100)
        : 0;

    const weakSkills = data.weakSkills || [];
    const strongSkills = data.strongSkills || [];
    const recentFeedbacks = data.recentFeedbacks || [];

    const maxWeak = weakSkills.length > 0 ? weakSkills[0].count : 1;

    // Helper for skill pill colors
    const getSkillBadgeColor = (rating) => {
        if (rating === 'Strong' || rating === 'Excellent') return 'bg-emerald-100 text-emerald-700';
        if (rating === 'Weak' || rating === 'Poor') return 'bg-red-100 text-red-600';
        return 'bg-amber-100 text-amber-700';
    };

    const getGroupedInstituteRates = () => {
        if (!data?.institutePlacementRates) return [];
        
        const groups = {};
        data.institutePlacementRates.forEach(inst => {
            const dName = districts.find(d => d._id === inst.districtId)?.name || 'Other District';
            if (!groups[dName]) {
                groups[dName] = {
                    districtName: dName,
                    institutes: [],
                    totalHired: 0,
                    totalCount: 0
                };
            }
            groups[dName].institutes.push(inst);
            groups[dName].totalHired += inst.hired;
            groups[dName].totalCount += inst.total;
        });

        return Object.values(groups).map(g => ({
            ...g,
            districtRate: Math.round((g.totalHired / g.totalCount) * 100) || 0
        })).sort((a, b) => b.districtRate - a.districtRate);
    };

    const groupedRates = getGroupedInstituteRates();
    
    const bannerTitle = selectedDistrict 
        ? `${districts.find(d => d._id === selectedDistrict)?.name || 'District'} Placement Rate`
        : 'State-wide Placement Rate';
        
    const bannerDesc = selectedDistrict
        ? `Hover to view placement breakdown across institutes in this district.`
        : `Hover to view state-wide placement breakdown grouped by districts.`;
        
    const handleMouseMove = (e) => {
        if (!tooltipState.pinned) {
            setTooltipState(prev => ({
                ...prev,
                visible: true,
                x: e.clientX,
                y: e.clientY
            }));
        }
    };

    const handleMouseLeave = () => {
        if (!tooltipState.pinned) {
            setTooltipState(prev => ({ ...prev, visible: false }));
        }
    };

    const handleBannerClick = () => {
        if (!tooltipState.pinned) {
            setTooltipState(prev => ({ ...prev, pinned: true }));
        }
    };

    const handleCloseTooltip = (e) => {
        e.stopPropagation();
        setTooltipState({ visible: false, pinned: false, x: 0, y: 0 });
    };

    // Calculate Feedback KPIs
    let totalFeedbackHired = 0;
    let totalFeedbackRejected = 0;
    let totalFeedbackCount = 0;
    const totalCompaniesCount = data?.groupedRecentFeedbacks?.length || 0;

    data?.groupedRecentFeedbacks?.forEach(group => {
        group.feedbacks?.forEach(fb => {
            totalFeedbackCount++;
            if (fb.finalStatus === 'Hired') totalFeedbackHired++;
            if (fb.finalStatus === 'Rejected') totalFeedbackRejected++;
        });
    });

    // Filter Feedbacks
    const filteredFeedbackGroups = data?.groupedRecentFeedbacks?.map(group => {
        const filteredFbs = (group.feedbacks || []).filter(fb => {
            const matchesStatus = feedbackFilter === 'All Feedback' || fb.finalStatus === feedbackFilter;
            const searchLower = feedbackSearch.toLowerCase();
            const matchesSearch = !feedbackSearch || 
                fb.studentName?.toLowerCase().includes(searchLower) ||
                fb.jobTitle?.toLowerCase().includes(searchLower) ||
                fb.instituteName?.toLowerCase().includes(searchLower) ||
                fb.overallComment?.toLowerCase().includes(searchLower) ||
                group.companyName?.toLowerCase().includes(searchLower) ||
                fb.skillRatings?.some(sr => sr.skillName?.toLowerCase().includes(searchLower));
            return matchesStatus && matchesSearch;
        });
        return { ...group, feedbacks: filteredFbs };
    }).filter(group => group.feedbacks && group.feedbacks.length > 0) || [];

    return (
        <div className="w-full px-6 py-6 pb-24 space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 relative overflow-hidden">
                {/* Background Graphics */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-50 to-transparent z-0"></div>
                <img src="/gateway-of-india.png" alt="Gateway" className="absolute right-20 bottom-0 h-full object-contain opacity-20 grayscale z-0 mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
                
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
                        <span className="hover:text-blue-600 cursor-pointer">Home</span>
                        <ChevronRight size={14} />
                        <span className="text-slate-800 font-bold">Placement Intelligence</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-1">
                        <TrendingUp className="text-blue-600" size={28} strokeWidth={2.5} />
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Placement Intelligence</h1>
                    </div>
                    
                    <p className="text-slate-500 text-sm mb-4">
                        Real employer feedback aggregated across all training institutes in the state.
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Last updated: {new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }).toLowerCase()}
                    </div>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                        <Calendar size={16} className="text-slate-400" />
                        Apr 2024 - Mar 2025
                        <ChevronDown size={14} className="text-slate-400 ml-1" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <select 
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 outline-none cursor-pointer"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                        >
                            <option value="">All Districts</option>
                            {districts.map(d => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                        </select>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm hover:bg-slate-50 transition-colors" title="Refresh">
                            <RefreshCcw size={16} />
                        </button>
                    </div>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5">
                        <Download size={16} />
                        Download Report
                        <ChevronDown size={14} className="opacity-70 ml-1" />
                    </button>
                </div>
            </div>

            {/* Quote Card (Optional based on image, combining it neatly) */}
            <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-sm font-medium text-slate-600 italic">"Connecting talent with opportunities for a better tomorrow."</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Government of Maharashtra</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-blue-500" size={20} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Interviews */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative flex flex-col group hover:border-blue-300 transition-colors">
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Users size={24} strokeWidth={2} />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                <TrendingUp size={14} /> +0%
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Total Interviews Completed</p>
                        <h3 className="text-4xl font-black text-slate-900">{data.hireStats?.total || 0}</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1">Across all institutes</p>
                    </div>
                    <div className="h-16 w-full absolute bottom-0 left-0 opacity-40 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dummySparklineData}>
                                <defs>
                                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorBlue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Students Hired */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative flex flex-col group hover:border-emerald-300 transition-colors">
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <TrendingUp size={24} strokeWidth={2.5} />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                <TrendingUp size={14} /> +{hireRate}%
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Students Hired</p>
                        <h3 className="text-4xl font-black text-slate-900">{data.hireStats?.hired || 0}</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1">Placement success rate</p>
                    </div>
                    <div className="h-16 w-full absolute bottom-0 left-0 opacity-40 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dummySparklineData}>
                                <defs>
                                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGreen)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Not Selected */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative flex flex-col group hover:border-red-300 transition-colors">
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                <TrendingDown size={24} strokeWidth={2.5} />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                                <TrendingDown size={14} /> -{100 - hireRate}%
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Not Selected</p>
                        <h3 className="text-4xl font-black text-slate-900">{data.hireStats?.rejected || 0}</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1">Needs attention</p>
                    </div>
                    <div className="h-16 w-full absolute bottom-0 left-0 opacity-40 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dummySparklineData}>
                                <defs>
                                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRed)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* State-wide Placement Rate Banner */}
            <div 
                className={`bg-white rounded-2xl border ${tooltipState.pinned ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'} shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 md:p-8 relative overflow-visible z-20 cursor-pointer transition-all`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleBannerClick}
            >
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="text-blue-600" size={24} />
                            <h2 className="text-xl font-black text-slate-800">{bannerTitle}</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-8">{bannerDesc}</p>
                        
                        <div className="w-full bg-slate-100 rounded-full h-3.5 mb-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${hireRate >= 70 ? 'bg-emerald-500' : hireRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${hireRate}%` }}
                            />
                        </div>
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${hireRate >= 70 ? 'bg-emerald-500' : hireRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                            {hireRate >= 70 ? 'Excellent placement rate' : hireRate >= 40 ? 'Moderate — improvement needed' : 'Low — urgent skill gap intervention required'}
                        </p>
                    </div>
                    
                    <div className="text-right shrink-0">
                        <h1 className="text-6xl md:text-7xl font-black text-blue-600 tracking-tighter leading-none hover:text-blue-700 transition-colors">{hireRate}%</h1>
                    </div>
                </div>
            </div>

            {/* Flexible React-State Tooltip that follows cursor */}
            <div 
                className={`fixed z-[9999] transition-opacity duration-150 ${tooltipState.visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{
                    left: tooltipState.x > window.innerWidth - 420 ? tooltipState.x - 420 : tooltipState.x + 20,
                    top: tooltipState.y > window.innerHeight - 300 ? tooltipState.y - 300 : tooltipState.y + 20,
                    width: tooltipState.pinned ? '420px' : '360px',
                }}
            >
                <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-5 relative">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="text-blue-600" size={18} />
                            <h4 className="text-slate-800 font-black text-sm uppercase tracking-wide">Placement Breakdown</h4>
                        </div>
                        {tooltipState.pinned && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">PINNED</span>
                                <button 
                                    onClick={handleCloseTooltip} 
                                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"
                                    title="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar text-left">
                        {groupedRates.length === 0 ? (
                            <p className="text-slate-500 text-sm font-medium text-center py-4">No placement data available.</p>
                        ) : groupedRates.map((group, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                                <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-800 text-xs font-black uppercase tracking-wider">{group.districtName}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${group.districtRate >= 70 ? 'bg-emerald-100 text-emerald-700' : group.districtRate >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                        {group.districtRate}% Rate
                                    </span>
                                </div>
                                <div className="space-y-1 pl-2 border-l-2 border-slate-100 ml-1">
                                    {group.institutes.map((inst, iIdx) => (
                                        <div key={iIdx} className="flex justify-between items-center hover:bg-slate-50/80 p-1.5 -mx-1.5 rounded-lg transition-colors">
                                            <div className="flex flex-col overflow-hidden mr-2">
                                                <span className="text-slate-700 text-xs font-bold truncate" title={inst.instituteName}>{inst.instituteName}</span>
                                                <span className="text-slate-400 text-[10px] font-medium mt-0.5">{inst.hired} hired out of {inst.total}</span>
                                            </div>
                                            <span className={`shrink-0 text-[10px] font-bold ${inst.placementRate >= 70 ? 'text-emerald-600' : inst.placementRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {inst.placementRate}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Two Column Section: Weak vs Strong Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Weak Skills */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-red-50/30 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                <AlertTriangle size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="font-bold text-red-900">Skills Needing Urgent Training</h2>
                                <p className="text-[11px] font-semibold text-red-600/70">Based on employer feedback and rejection reasons</p>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center">
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col space-y-5">
                        {weakSkills.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">No critical weaknesses identified.</div>
                        ) : weakSkills.slice(0,5).map((skill, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-28 shrink-0">
                                    <span className="text-sm font-bold text-slate-700 capitalize">{skill._id}</span>
                                </div>
                                <div className="flex-1 relative">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full">
                                        <div
                                            className="h-1.5 rounded-full bg-red-500 group-hover:bg-red-600 transition-colors"
                                            style={{ width: `${(skill.count / maxWeak) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-20 text-right shrink-0">
                                    <span className="text-xs font-bold text-red-600">{skill.count} reports</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {weakSkills.length > 0 && (
                        <div className="p-4 mx-4 mb-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                            <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-amber-800">These skills should be prioritized in next institute curriculum update.</p>
                        </div>
                    )}
                </div>

                {/* Strong Skills */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <TrendingUp size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="font-bold text-emerald-900">Skills Institutes Are Nailing</h2>
                                <p className="text-[11px] font-semibold text-emerald-600/70">Skills with high employer satisfaction</p>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center">
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col space-y-3">
                        {strongSkills.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">No strong skill data yet.</div>
                        ) : strongSkills.slice(0, 5).map((skill, i) => (
                            <div key={i} className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-xl px-5 py-3.5 hover:bg-emerald-50 transition-colors">
                                <span className="text-sm font-bold text-slate-800 capitalize">{skill._id}</span>
                                <div className="flex items-center gap-1.5 bg-emerald-100 px-2 py-1 rounded-md">
                                    <Check size={14} className="text-emerald-700" strokeWidth={3} />
                                    <span className="text-xs font-black text-emerald-700">{skill.count}x</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
            </div>

            {/* Enhanced Recent Employer Feedback Section */}
            <div className="flex flex-col gap-6 w-full">
                {/* Header & KPIs Container */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
                    {/* Top Header Row */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                <MessageSquare size={26} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Employer Feedback</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">Grouped by hiring company</span>
                                    <span className="text-[11px] font-medium text-slate-500">Insights from employers to help you grow and perform better.</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full xl:w-auto">
                            <div className="relative flex-1 xl:w-80">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by role, company, skill or feedback..." 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors placeholder:text-slate-400"
                                    value={feedbackSearch}
                                    onChange={(e) => setFeedbackSearch(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <select 
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm outline-none cursor-pointer hover:bg-slate-50 transition-colors"
                                    value={feedbackFilter}
                                    onChange={(e) => setFeedbackFilter(e.target.value)}
                                >
                                    <option value="All Feedback">All Feedback</option>
                                    <option value="Hired">Hired</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Hired Card */}
                        <div className="bg-white border border-emerald-100/50 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-black text-xl text-slate-800 leading-tight flex items-baseline gap-1.5">
                                    {totalFeedbackHired} <span className="text-sm font-bold text-emerald-600">Hired</span>
                                </h3>
                                <p className="text-[11px] font-bold text-slate-500 mt-0.5">Great job! Keep it up.</p>
                            </div>
                        </div>

                        {/* Rejected Card */}
                        <div className="bg-white border border-red-100/50 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.1)] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                                <X size={24} strokeWidth={3} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-black text-xl text-slate-800 leading-tight flex items-baseline gap-1.5">
                                    {totalFeedbackRejected} <span className="text-sm font-bold text-red-500">Rejected</span>
                                </h3>
                                <p className="text-[11px] font-bold text-slate-500 mt-0.5">Keep learning and try again.</p>
                            </div>
                        </div>

                        {/* Companies Card */}
                        <div className="bg-white border border-blue-100/50 shadow-[0_2px_10px_-3px_rgba(59,130,246,0.1)] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Building2 size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-black text-xl text-slate-800 leading-tight flex items-baseline gap-1.5">
                                    {totalCompaniesCount} <span className="text-sm font-bold text-slate-700">Companies</span>
                                </h3>
                                <p className="text-[11px] font-bold text-slate-500 mt-0.5">Provided feedback</p>
                            </div>
                        </div>

                        {/* Total Feedbacks Card */}
                        <div className="bg-white border border-indigo-100/50 shadow-[0_2px_10px_-3px_rgba(99,102,241,0.1)] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                <BarChart2 size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-black text-xl text-slate-800 leading-tight flex items-baseline gap-1.5">
                                    {totalFeedbackCount} <span className="text-sm font-bold text-slate-700">Total Feedbacks</span>
                                </h3>
                                <p className="text-[11px] font-bold text-slate-500 mt-0.5">Your growth journey</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Tables by Company */}
                {filteredFeedbackGroups.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Search size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No feedback found</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    filteredFeedbackGroups.map((group, idx) => (
                        <div key={idx} className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                            {/* Company Table Header */}
                            <div 
                                className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white cursor-pointer hover:bg-slate-50 transition-colors select-none"
                                onClick={() => toggleGroup(group.companyName)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-6 flex justify-center">
                                        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-200 ${expandedGroups[group.companyName] ? '-rotate-90' : 'rotate-0'}`} />
                                    </div>
                                    {group.companyImage ? (
                                        <img src={group.companyImage} alt={group.companyName} className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-black shadow-sm shrink-0">
                                            {(group.companyName || 'C').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <h3 className="font-black text-slate-900 text-lg leading-none">{group.companyName}</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[11px] font-bold text-slate-500">{group.feedbacks.length} feedbacks</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-[11px] font-medium text-slate-400 truncate max-w-[200px]" title={group.feedbacks[0]?.instituteName}>
                                                {group.feedbacks[0]?.instituteName || 'Multiple Institutes'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                        <ListFilter size={14} className="text-slate-400" /> Latest First <ChevronDown size={14} className="text-slate-400 ml-1" />
                                    </button>
                                    <button className="p-2 border border-blue-200 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm" title="Grid View">
                                        <Grid size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Table Data */}
                            {!expandedGroups[group.companyName] && (
                                <div className="overflow-x-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-xs font-black text-slate-600 w-[25%]">Candidate</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-600 w-[12%]">Status</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-600 w-[20%]">Skills / Tags</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-600 w-[23%]">Feedback</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-600 w-[10%]">Date</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-600 w-[10%] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(() => {
                                            const hired = group.feedbacks.filter(fb => fb.finalStatus === 'Hired');
                                            const rejected = group.feedbacks.filter(fb => fb.finalStatus === 'Rejected');
                                            
                                            const renderRow = (fb, rowKey) => (
                                                <tr key={rowKey} className="hover:bg-slate-50/60 transition-colors group/row">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-base shrink-0 border ${fb.finalStatus === 'Hired' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                                {(fb.studentName || 'S').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col justify-center">
                                                                <span className="font-bold text-sm text-slate-800 leading-tight">{fb.studentName || 'Unknown Student'}</span>
                                                                <span className="text-[11px] font-bold text-blue-600 mt-1">{fb.jobTitle}</span>
                                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">{fb.instituteName}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top pt-5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm ${
                                                            fb.finalStatus === 'Hired' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-red-50 text-red-500 border border-red-100/50'
                                                        }`}>
                                                            {fb.finalStatus === 'Hired' ? <Check size={12} strokeWidth={3}/> : <X size={12} strokeWidth={3}/>}
                                                            {fb.finalStatus === 'Hired' ? 'Hired' : 'Rejected'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 align-top pt-5">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {fb.skillRatings?.length > 0 ? fb.skillRatings.map((sr, k) => (
                                                                <span key={k} className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${getSkillBadgeColor(sr.rating)}`}>
                                                                    {sr.skillName}
                                                                </span>
                                                            )) : (
                                                                <span className="text-[10px] font-medium text-slate-400 italic">No specific skills</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top pt-5">
                                                        <div className="flex items-start gap-1">
                                                            <span className="text-slate-400 font-serif font-black text-lg leading-none">"</span>
                                                            <p className="text-xs font-semibold text-slate-600 italic leading-relaxed line-clamp-2 mt-0.5" title={fb.overallComment || "No comments"}>
                                                                {fb.overallComment || "No detailed feedback provided."}
                                                            </p>
                                                            <span className="text-slate-400 font-serif font-black text-lg leading-none self-end ml-0.5">"</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top pt-5">
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                                            <CalendarDays size={12} className="text-slate-400" />
                                                            {fb.submittedAt ? new Date(fb.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top pt-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-[10px] font-black hover:bg-blue-50 transition-colors shadow-sm">
                                                                View Details <ChevronRight size={12} strokeWidth={3} />
                                                            </button>
                                                            <button className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors">
                                                                <MoreHorizontal size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                            
                                            const hiredKey = `${group.companyName}-hired`;
                                            const rejectedKey = `${group.companyName}-rejected`;
                                            
                                            return (
                                                <>
                                                    {hired.length > 0 && (
                                                        <>
                                                            <tr 
                                                                className="bg-emerald-50/50 border-y border-emerald-100/50 cursor-pointer hover:bg-emerald-100/40 transition-colors select-none"
                                                                onClick={() => toggleSubGroup(hiredKey)}
                                                            >
                                                                <td colSpan="6" className="px-6 py-2.5 text-xs font-black text-emerald-700 tracking-wide uppercase">
                                                                    <div className="flex items-center gap-2">
                                                                        <ChevronDown size={14} className={`transition-transform duration-200 ${isSubGroupExpanded(hiredKey) ? 'rotate-0' : '-rotate-90'}`} />
                                                                        Selected Candidates ({hired.length})
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {isSubGroupExpanded(hiredKey) && hired.map((fb, j) => renderRow(fb, `hired-${j}`))}
                                                        </>
                                                    )}
                                                    {rejected.length > 0 && (
                                                        <>
                                                            <tr 
                                                                className="bg-red-50/50 border-y border-red-100/50 cursor-pointer hover:bg-red-100/40 transition-colors select-none"
                                                                onClick={() => toggleSubGroup(rejectedKey)}
                                                            >
                                                                <td colSpan="6" className="px-6 py-2.5 text-xs font-black text-red-600 tracking-wide uppercase">
                                                                    <div className="flex items-center gap-2">
                                                                        <ChevronDown size={14} className={`transition-transform duration-200 ${isSubGroupExpanded(rejectedKey) ? 'rotate-0' : '-rotate-90'}`} />
                                                                        Rejected Candidates ({rejected.length})
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {isSubGroupExpanded(rejectedKey) && rejected.map((fb, j) => renderRow(fb, `rejected-${j}`))}
                                                        </>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default PlacementInsights;
