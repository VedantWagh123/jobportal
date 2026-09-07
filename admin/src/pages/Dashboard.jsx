import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, BookOpen, Database, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
                {icon}
            </div>
        </div>
        <div className="mt-4">
            <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>
                {trend}
            </span>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('/api/super-admin/dashboard/stats', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) return <div className="text-gray-500">Loading dashboard...</div>;

    const stats = [
        { title: 'Total Canonical Skills', value: dashboardData?.totalSkills || 0, icon: <Database size={24} />, trend: 'Active' },
        { title: 'Unresolved AI Skills', value: dashboardData?.unresolvedSkills || 0, icon: <BookOpen size={24} />, trend: 'Pending Review' },
        { title: 'State Admins', value: dashboardData?.stateAdmins || 0, icon: <Users size={24} />, trend: 'Active Users' },
        { title: 'AI Process Rate', value: dashboardData?.aiProcessRate || '0%', icon: <Activity size={24} />, trend: 'Success' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Placeholder for charts/logs */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Audit Logs</h3>
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Activity size={48} className="mb-4 opacity-50" />
                        <p>No recent activity detected.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">Database Cluster</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">HEALTHY</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">AI Parsing Engine</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">ONLINE</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">Job Ingestion Queue</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">0 PENDING</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
