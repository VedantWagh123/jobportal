import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    TrendingDown, TrendingUp, Users, BarChart3, AlertTriangle, 
    Calendar, MapPin, Download, ChevronRight, CheckCircle2, 
    Lightbulb, RefreshCcw, MoreHorizontal, ChevronDown, Check,
    X, BookOpen
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

    useEffect(() => {
        if (user) fetchInsights();
    }, [user]);

    const fetchInsights = async () => {
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const { data: res } = await axios.get('/api/state-admin/intelligence/placement-insights', {
                headers: { token }
            });
            if (res.success) setData(res);
        } catch (err) {
            console.error('Failed to fetch placement insights:', err);
        } finally {
            setLoading(false);
        }
    };

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
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                            <MapPin size={16} className="text-slate-400" />
                            Maharashtra
                            <ChevronDown size={14} className="text-slate-400 ml-1" />
                        </button>
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 md:p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="text-blue-600" size={24} />
                            <h2 className="text-xl font-black text-slate-800">State-wide Placement Rate</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-8">Overall placement percentage across all institutes</p>
                        
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
                        <h1 className="text-6xl md:text-7xl font-black text-blue-600 tracking-tighter leading-none">{hireRate}%</h1>
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

            {/* Recent Feedbacks Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <BookOpen size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Recent Employer Feedback</h2>
                            <p className="text-[11px] font-semibold text-slate-500">Last 10 interviews across all institutes</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center">
                        View All <ChevronRight size={14} />
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                                <th className="px-6 py-4 font-black">Company / Employer</th>
                                <th className="px-6 py-4 font-black">Status</th>
                                <th className="px-6 py-4 font-black">Skills Mentioned</th>
                                <th className="px-6 py-4 font-black">Feedback</th>
                                <th className="px-6 py-4 font-black">Date</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentFeedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-sm font-medium text-slate-400">
                                        No recent feedback submitted.
                                    </td>
                                </tr>
                            ) : recentFeedbacks.map((fb, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {fb.companyId?.image ? (
                                                <img src={fb.companyId.image} alt={fb.companyId.name} className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {(fb.companyId?.name || 'C').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-bold text-sm text-slate-800">{fb.companyId?.name || 'Company'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                            fb.finalStatus === 'Hired' 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-red-100 text-red-600'
                                        }`}>
                                            {fb.finalStatus === 'Hired' ? <Check size={12} strokeWidth={3}/> : <X size={12} strokeWidth={3}/>}
                                            {fb.finalStatus === 'Hired' ? 'Hired' : 'Rejected'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {fb.skillRatings?.length > 0 ? fb.skillRatings.slice(0, 4).map((sr, j) => (
                                                <span key={j} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSkillBadgeColor(sr.rating)}`}>
                                                    {sr.skillName}
                                                </span>
                                            )) : (
                                                <span className="text-[10px] font-medium text-slate-400 italic">No specific skills</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-slate-700 line-clamp-1 max-w-xs" title={fb.notes || "No detailed feedback provided."}>
                                            {fb.notes || "No detailed feedback provided."}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-500">
                                            {fb.submittedAt && !isNaN(new Date(fb.submittedAt)) 
                                                ? new Date(fb.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : 'N/A'
                                            }
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-slate-400 hover:text-slate-700 cursor-pointer text-center">
                                        <MoreHorizontal size={16} className="mx-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default PlacementInsights;
