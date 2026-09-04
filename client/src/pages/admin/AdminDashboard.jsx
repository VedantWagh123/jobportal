import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const { backendUrl, adminToken, adminData } = useContext(AdminContext);
    const [loading, setLoading] = useState(true);
    
    const [overview, setOverview] = useState(null);
    const [demand, setDemand] = useState(null);
    const [supply, setSupply] = useState(null);
    const [gap, setGap] = useState([]);
    const [districts, setDistricts] = useState([]);

    useEffect(() => {
        const fetchIntelligence = async () => {
            try {
                const headers = { headers: { token: adminToken } };
                
                const [ovRes, dRes, sRes, gRes, distRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/government-admin/intelligence/overview`, headers),
                    axios.get(`${backendUrl}/api/government-admin/intelligence/demand`, headers),
                    axios.get(`${backendUrl}/api/government-admin/intelligence/supply`, headers),
                    axios.get(`${backendUrl}/api/government-admin/intelligence/gap`, headers),
                    axios.get(`${backendUrl}/api/government-admin/intelligence/districts`, headers)
                ]);

                if (ovRes.data.success) setOverview(ovRes.data.stats);
                if (dRes.data.success) setDemand(dRes.data.demand);
                if (sRes.data.success) setSupply(sRes.data.supply);
                if (gRes.data.success) setGap(gRes.data.gap);
                if (distRes.data.success) setDistricts(distRes.data.districts);

            } catch (error) {
                toast.error('Failed to load intelligence data');
            } finally {
                setLoading(false);
            }
        };

        if (adminToken) fetchIntelligence();
    }, [adminToken, backendUrl]);

    if (loading) return <div className="text-center py-10">Loading Intelligence Engine...</div>;
    if (!overview) return <div className="text-center py-10">Failed to load.</div>;

    const StatCard = ({ title, count, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{count.toLocaleString()}</h3>
            <div className={`mt-2 h-1 w-full bg-${color}-100 rounded-full overflow-hidden`}>
                <div className={`h-full bg-${color}-500 w-full`}></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Intelligence Dashboard</h1>
                <p className="text-gray-500 mt-1">Real-time Labour Market & Training Analytics</p>
            </div>

            {/* 1. OVERVIEW */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Active Jobs" count={overview.totalJobs} color="blue" />
                <StatCard title="Districts" count={overview.totalDistricts} color="indigo" />
                <StatCard title="Institutes" count={overview.totalInstitutes} color="purple" />
                <StatCard title="Batches" count={overview.activeBatches} color="green" />
                <StatCard title="Capacity" count={overview.trainingCapacity} color="orange" />
                <StatCard title="Enrollments" count={overview.totalEnrollments} color="teal" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. DEMAND INTELLIGENCE */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Demanded Skills (Industry)</h3>
                    {demand?.topSkills?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No skill demand data available.</p>
                    ) : (
                        <div className="space-y-4">
                            {demand.topSkills.map((s, i) => {
                                const maxDemand = demand.topSkills[0].demandCount;
                                const width = Math.max((s.demandCount / maxDemand) * 100, 5);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{s.skillName}</span>
                                            <span className="text-blue-600 font-bold">{s.demandCount} Jobs</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full">
                                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${width}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 3. SUPPLY INTELLIGENCE */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Supplied Skills (Training Capacity)</h3>
                    {supply?.topSuppliedSkills?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No training supply data available.</p>
                    ) : (
                        <div className="space-y-4">
                            {supply.topSuppliedSkills.map((s, i) => {
                                const maxSupply = supply.topSuppliedSkills[0].supplyCapacity;
                                const width = Math.max((s.supplyCapacity / maxSupply) * 100, 5);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{s.skillName}</span>
                                            <span className="text-purple-600 font-bold">{s.supplyCapacity} Seats</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full">
                                            <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${width}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. TRAINING SUPPLY GAP */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Training Supply Gap Analysis</h3>
                        <p className="text-sm text-gray-500 mt-1">Comparing Active Job Requirements against Active Training Capacity</p>
                    </div>
                </div>

                {gap.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No gap data available.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="py-3 px-4">Skill</th>
                                    <th className="py-3 px-4 text-center">Industry Demand (Jobs)</th>
                                    <th className="py-3 px-4 text-center">Training Supply (Seats)</th>
                                    <th className="py-3 px-4 text-center">Calculated Gap</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {gap.map(g => (
                                    <tr key={g.skillId} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{g.skillName}</td>
                                        <td className="py-3 px-4 text-center font-mono">{g.demand}</td>
                                        <td className="py-3 px-4 text-center font-mono">{g.supply}</td>
                                        <td className="py-3 px-4 text-center font-mono font-bold">
                                            <span className={g.gap > 0 ? 'text-red-600' : g.gap < 0 ? 'text-blue-600' : 'text-gray-600'}>
                                                {g.gap > 0 ? `+${g.gap}` : g.gap}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                g.status === 'Shortage' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                g.status === 'Oversupply' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                'bg-green-100 text-green-700 border border-green-200'
                                            }`}>
                                                {g.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 5. DISTRICT OVERVIEW */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Geographic Intelligence</h3>
                {districts.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No district data available.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="py-3 px-4">District</th>
                                    <th className="py-3 px-4 text-center">Active Jobs</th>
                                    <th className="py-3 px-4 text-center">Institutes</th>
                                    <th className="py-3 px-4 text-center">Capacity</th>
                                    <th className="py-3 px-4 text-center">Enrollments</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {districts.map(d => (
                                    <tr key={d.districtId} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-gray-900">{d.districtName}</span>
                                            <span className="text-xs text-gray-500 ml-2">({d.state})</span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono text-blue-600">{d.jobs}</td>
                                        <td className="py-3 px-4 text-center font-mono">{d.institutes}</td>
                                        <td className="py-3 px-4 text-center font-mono text-purple-600">{d.capacity}</td>
                                        <td className="py-3 px-4 text-center font-mono text-teal-600">{d.enrollments}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default AdminDashboard;
