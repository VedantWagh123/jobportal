import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { TrendingDown, TrendingUp, Users, BarChart3, AlertTriangle } from 'lucide-react';

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

    if (loading) return <div className="flex justify-center p-12 text-gray-400">Loading placement intelligence...</div>;
    if (!data) return <div className="text-center p-12 text-red-500">Failed to load data.</div>;

    const hireRate = data.hireStats.total > 0
        ? Math.round((data.hireStats.hired / data.hireStats.total) * 100)
        : 0;

    const maxWeak = data.weakSkills.length > 0 ? data.weakSkills[0].count : 1;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Placement Intelligence</h1>
                <p className="text-gray-500 mt-1">
                    Real employer feedback aggregated across all training institutes in the state.
                </p>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                    <Users className="text-gray-400 mx-auto mb-2" size={28} />
                    <p className="text-4xl font-bold text-gray-900">{data.hireStats.total}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Interviews Completed</p>
                </div>
                <div className="bg-green-50 rounded-2xl border border-green-200 p-6 shadow-sm text-center">
                    <TrendingUp className="text-green-600 mx-auto mb-2" size={28} />
                    <p className="text-4xl font-bold text-green-700">{data.hireStats.hired}</p>
                    <p className="text-sm text-green-600 mt-1">Students Hired — {hireRate}% Rate</p>
                </div>
                <div className="bg-red-50 rounded-2xl border border-red-200 p-6 shadow-sm text-center">
                    <TrendingDown className="text-red-500 mx-auto mb-2" size={28} />
                    <p className="text-4xl font-bold text-red-600">{data.hireStats.rejected}</p>
                    <p className="text-sm text-red-500 mt-1">Not Selected</p>
                </div>
            </div>

            {/* State Hire Rate Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <BarChart3 size={18} className="text-indigo-500" /> State-wide Placement Rate
                    </p>
                    <span className="font-bold text-indigo-600 text-lg">{hireRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                        className={`h-4 rounded-full transition-all duration-700 ${hireRate >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' : hireRate >= 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                        style={{ width: `${hireRate}%` }}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {hireRate >= 70 ? '🟢 Excellent placement rate' : hireRate >= 40 ? '🟡 Moderate — improvement needed' : '🔴 Low — urgent skill gap intervention required'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weak Skills — most critical for govt action */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        <h2 className="font-bold text-red-800">Skills Needing Urgent Training</h2>
                    </div>
                    <div className="p-6 space-y-3">
                        {data.weakSkills.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">No weak skill data yet</p>
                        ) : data.weakSkills.map((skill, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">{skill._id}</span>
                                    <span className="text-xs font-bold text-red-500">{skill.count} reports</span>
                                </div>
                                <div className="w-full bg-red-50 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-2 rounded-full bg-red-400"
                                        style={{ width: `${(skill.count / maxWeak) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {data.weakSkills.length > 0 && (
                            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                                💡 These skills should be prioritized in next institute curriculum update.
                            </p>
                        )}
                    </div>
                </div>

                {/* Strong Skills */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-600" />
                        <h2 className="font-bold text-green-800">Skills Institutes Are Nailing ✅</h2>
                    </div>
                    <div className="p-6 space-y-3">
                        {data.strongSkills.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">No strong skill data yet</p>
                        ) : data.strongSkills.map((skill, i) => (
                            <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2">
                                <span className="text-sm font-medium text-green-800">{skill._id}</span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                    ✅ {skill.count}×
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Feedbacks */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-800">Recent Employer Feedback</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Last 10 interviews across all institutes</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {data.recentFeedbacks.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No feedback submitted yet</p>
                    ) : data.recentFeedbacks.map((fb, i) => (
                        <div key={i} className="px-6 py-4 flex items-start gap-4">
                            {fb.companyId?.image && (
                                <img src={fb.companyId.image} alt={fb.companyId.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-gray-800">{fb.companyId?.name || 'Company'}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${fb.finalStatus === 'Hired' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {fb.finalStatus === 'Hired' ? '✅ Hired' : '❌ Rejected'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{fb.jobId?.title} · {fb.jobId?.location}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {fb.skillRatings?.slice(0, 4).map((sr, j) => (
                                        <span key={j} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sr.rating === 'Strong' ? 'bg-green-100 text-green-700' : sr.rating === 'Weak' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                            {sr.skillName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 flex-shrink-0">
                                {new Date(fb.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlacementInsights;
