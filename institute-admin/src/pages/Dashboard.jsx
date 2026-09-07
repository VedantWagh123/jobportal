import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Users, BrainCircuit, Activity, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon, subtitle, colorClass }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className={`p-4 rounded-xl ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [alerts, setAlerts] = useState([]);
    const [metrics, setMetrics] = useState({ activeCourses: 0, totalStudents: 0, totalBatches: 0 });

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                if (user?.token) {
                    const { data } = await axios.get('/api/institute/management/alerts', {
                        headers: { token: user.token }
                    });
                    if (data.success) {
                        setAlerts(data.alerts || []);
                        if (data.metrics) setMetrics(data.metrics);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch alerts:", error);
            }
        };
        fetchAlerts();
    }, [user]);
    
    // Static placement data for MVP visualization
    const placementData = [
        { name: 'Full Stack', placed: 85, enrolled: 100 },
        { name: 'Data Science', placed: 60, enrolled: 80 },
        { name: 'Cloud Ops', placed: 95, enrolled: 110 },
        { name: 'UI/UX Design', placed: 40, enrolled: 50 },
        { name: 'Cybersecurity', placed: 75, enrolled: 90 },
    ];

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Institute Operations</h1>
                <p className="text-gray-500 mt-1">Manage your courses, batches, and view AI curriculum insights.</p>
            </header>

            {/* AI Critical Banner */}
            {alerts.some(a => a.severity === 'Critical') && (
                <div className="bg-red-600 text-white p-4 rounded-xl shadow-md flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                    <div className="bg-white/20 p-2 rounded-lg shrink-0">
                        <BrainCircuit size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">AI Recommendation: Action Required</h3>
                        <p className="text-red-50 text-sm">
                            {alerts.find(a => a.severity === 'Critical').message}
                        </p>
                        <button className="mt-3 bg-white text-red-700 hover:bg-red-50 font-bold px-4 py-2 rounded shadow-sm transition-colors text-sm">
                            {alerts.find(a => a.severity === 'Critical').recommendedAction || 'Start New Course'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Courses" value={metrics.activeCourses} subtitle="Currently offered" colorClass="bg-blue-100 text-blue-600" icon={<BookOpen size={24} />} />
                <StatCard title="Total Students" value={metrics.totalStudents} subtitle={`Across ${metrics.totalBatches} batches`} colorClass="bg-emerald-100 text-emerald-600" icon={<Users size={24} />} />
                <StatCard title="Placement Rate" value="78%" subtitle="Static placeholder" colorClass="bg-orange-100 text-orange-600" icon={<Activity size={24} />} />
                <StatCard title="Skill Gap Alerts" value={alerts.length} subtitle={alerts.length > 0 ? "Action required" : "All good"} colorClass={alerts.length > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"} icon={<BrainCircuit size={24} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Placement Performance Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Placement Performance by Course</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={placementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="enrolled" name="Total Enrolled" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="placed" name="Successfully Placed" fill="#16a34a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Curriculum Alerts */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BrainCircuit size={20} className="text-primary-600" />
                        AI Curriculum Insights
                    </h3>
                    <div className="space-y-4">
                        {alerts.length > 0 ? (
                            alerts.map((alert, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${alert.severity === 'Critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <h4 className={`font-semibold text-sm mb-1 ${alert.severity === 'Critical' ? 'text-red-800' : 'text-amber-800'}`}>{alert.skill || alert.skillName} Shortage</h4>
                                    <p className={`text-xs mb-2 ${alert.severity === 'Critical' ? 'text-red-600' : 'text-amber-700'}`}>{alert.message}</p>
                                    <button className={`text-xs font-semibold bg-white px-3 py-1.5 rounded shadow-sm border ${alert.severity === 'Critical' ? 'text-red-700 border-red-200 hover:bg-red-50' : 'text-amber-700 border-amber-200 hover:bg-amber-50'}`}>
                                        {alert.recommendedAction || 'View Recommendation'}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center p-4">No new AI insights available.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Batches Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Current Running Batches</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Batch ID</th>
                                <th className="px-6 py-3">Course</th>
                                <th className="px-6 py-3">Trainer</th>
                                <th className="px-6 py-3">Students</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">BTH-2026-A1</td>
                                <td className="px-6 py-4">Full Stack Web Development</td>
                                <td className="px-6 py-4">Rahul Sharma</td>
                                <td className="px-6 py-4">42 / 50</td>
                                <td className="px-6 py-4 flex items-center gap-1.5 text-emerald-600"><CheckCircle size={16}/> In Progress</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">BTH-2026-B2</td>
                                <td className="px-6 py-4">Data Science & ML</td>
                                <td className="px-6 py-4">Priya Patel</td>
                                <td className="px-6 py-4">28 / 30</td>
                                <td className="px-6 py-4 flex items-center gap-1.5 text-emerald-600"><CheckCircle size={16}/> In Progress</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">BTH-2026-C1</td>
                                <td className="px-6 py-4">Cloud Computing Fundamentals</td>
                                <td className="px-6 py-4">Amit Kumar</td>
                                <td className="px-6 py-4">0 / 40</td>
                                <td className="px-6 py-4 flex items-center gap-1.5 text-amber-600"><Clock size={16}/> Starts next week</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
