import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { TrendingUp, UserCheck, UserX, Clock, ChevronDown, ChevronUp, Award } from 'lucide-react';

const STATUS_COLORS = {
    Hired: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
    'Not Interviewed': 'bg-gray-100 text-gray-500 border-gray-200'
};

const RATING_COLORS = {
    Strong: 'bg-green-100 text-green-700',
    Weak: 'bg-yellow-100 text-yellow-700',
    Missing: 'bg-red-100 text-red-600'
};

const RATING_ICONS = { Strong: '✅', Weak: '⚠️', Missing: '❌' };

const PlacementResults = () => {
    const { user } = useContext(AuthContext);
    const [results, setResults] = useState([]);
    const [summary, setSummary] = useState({ hired: 0, rejected: 0, pending: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (user) fetchResults();
    }, [user]);

    const fetchResults = async () => {
        try {
            const { data } = await axios.get('/api/institute/management/placement-results', {
                headers: { token: user.token }
            });
            if (data.success) {
                setResults(data.results);
                setSummary(data.summary);
            }
        } catch (err) {
            console.error('Failed to fetch placement results:', err);
        } finally {
            setLoading(false);
        }
    };

    const hireRate = summary.total > 0
        ? Math.round((summary.hired / summary.total) * 100)
        : 0;

    if (loading) return <div className="flex justify-center p-12 text-gray-400">Loading placement data...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Placement Results</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Real employer feedback on your students' skill performance after interviews.
                </p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm text-center">
                    <UserCheck size={20} className="text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-green-700 font-medium mb-1">Hired</p>
                    <p className="text-3xl font-bold text-green-700">{summary.hired}</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-4 shadow-sm text-center">
                    <UserX size={20} className="text-red-500 mx-auto mb-1" />
                    <p className="text-xs text-red-600 font-medium mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{summary.rejected}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 shadow-sm text-center">
                    <Award size={20} className="text-indigo-600 mx-auto mb-1" />
                    <p className="text-xs text-indigo-700 font-medium mb-1">Hire Rate</p>
                    <p className="text-3xl font-bold text-indigo-700">{hireRate}%</p>
                </div>
            </div>

            {/* Hire Rate Bar */}
            {summary.total > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <TrendingUp size={16} className="text-indigo-500" /> Placement Rate
                        </p>
                        <span className="text-sm font-bold text-indigo-600">{hireRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all duration-700"
                            style={{ width: `${hireRate}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{summary.hired} hired out of {summary.total} students who appeared for interviews</p>
                </div>
            )}

            {/* Student Results List */}
            <div className="space-y-3">
                {results.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                        <Clock size={40} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No placement data yet</p>
                        <p className="text-sm mt-1">Employers will submit feedback after interviewing your students.</p>
                    </div>
                ) : results.map((r, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Student Row */}
                        <div
                            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                        >
                            {r.studentImage ? (
                                <img src={r.studentImage} alt={r.studentName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                                    {r.studentName?.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm">{r.studentName}</p>
                                <p className="text-xs text-gray-400">{r.courseName} · Batch {r.batchCode}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[r.placementStatus]}`}>
                                    {r.placementStatus === 'Hired' ? '✅ Hired' : r.placementStatus === 'Rejected' ? '❌ Rejected' : '⏳ Pending'}
                                </span>
                                {r.skillRatings.length > 0 && (
                                    expandedId === idx ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />
                                )}
                            </div>
                        </div>

                        {/* Expanded Skill Feedback */}
                        {expandedId === idx && r.skillRatings.length > 0 && (
                            <div className="border-t border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                    Employer Skill Feedback {r.jobTitle && `— for "${r.jobTitle}"`}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {r.skillRatings.map((sr, i) => (
                                        <span key={i} className={`text-xs font-semibold px-3 py-1 rounded-full ${RATING_COLORS[sr.rating]}`}>
                                            {RATING_ICONS[sr.rating]} {sr.skillName}: {sr.rating}
                                        </span>
                                    ))}
                                </div>
                                {r.overallComment && (
                                    <p className="text-sm text-gray-600 italic border-l-2 border-indigo-200 pl-3">
                                        "{r.overallComment}"
                                    </p>
                                )}
                                {r.feedbackDate && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Feedback received: {new Date(r.feedbackDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlacementResults;
