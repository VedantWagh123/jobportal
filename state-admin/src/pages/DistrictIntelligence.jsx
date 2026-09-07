import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Briefcase, Building2, Users, Target } from 'lucide-react';

const TARGET_DISTRICTS = ['Nagpur', 'Pune', 'Mumbai'];

const DistrictIntelligence = () => {
    const { user } = useContext(AuthContext);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const token = user?.token || localStorage.getItem('stateAdminToken');
                const { data } = await axios.get('/api/state-admin/intelligence/districts', {
                    headers: { token }
                });

                if (data.success) {
                    // Filter specifically for Nagpur, Pune, and Mumbai
                    const filtered = data.districts.filter(d => 
                        TARGET_DISTRICTS.some(td => 
                            d.districtName.toLowerCase().includes(td.toLowerCase()) || 
                            d.districtName.toLowerCase() === 'mumbai city' || 
                            d.districtName.toLowerCase() === 'mumbai suburban' 
                        )
                    );
                    
                    // Deduplicate or group if Mumbai has multiple
                    const cleanDistricts = TARGET_DISTRICTS.map(td => {
                        const found = filtered.filter(f => f.districtName.toLowerCase().includes(td.toLowerCase()));
                        if (found.length > 0) {
                            // Sum them up if there are multiple (like Mumbai City + Mumbai Suburban)
                            return {
                                districtName: td,
                                jobs: found.reduce((sum, f) => sum + f.jobs, 0),
                                institutes: found.reduce((sum, f) => sum + f.institutes, 0),
                                capacity: found.reduce((sum, f) => sum + f.capacity, 0),
                                enrollments: found.reduce((sum, f) => sum + f.enrollments, 0),
                            };
                        } else {
                            // Fallback if not found in DB
                            return {
                                districtName: td,
                                jobs: 0,
                                institutes: 0,
                                capacity: 0,
                                enrollments: 0
                            };
                        }
                    });

                    setDistricts(cleanDistricts);
                } else {
                    setError('Failed to fetch district data.');
                }
            } catch (err) {
                setError('Error fetching district intelligence.');
            } finally {
                setLoading(false);
            }
        };

        fetchDistricts();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Geographical Data...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const maxJobs = Math.max(...districts.map(d => d.jobs), 1);
    const maxCapacity = Math.max(...districts.map(d => d.capacity), 1);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <MapPin className="text-primary-600" size={32} />
                    Geographical Intelligence
                </h1>
                <p className="text-gray-500 mt-2">
                    Focus View: Demand & Supply analytics for Key Tier-1/Tier-2 Districts.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {districts.map((district, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                                <MapPin size={100} />
                            </div>
                            <h2 className="text-2xl font-bold relative z-10">{district.districtName}</h2>
                            <p className="text-slate-300 text-sm relative z-10">Maharashtra</p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                        <Briefcase size={14} className="text-indigo-500"/> Demand
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{district.jobs}</div>
                                    <p className="text-xs text-gray-400">Active Jobs</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                        <Target size={14} className="text-emerald-500"/> Supply
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{district.capacity}</div>
                                    <p className="text-xs text-gray-400">Total Seats</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Building2 size={16}/> {district.institutes} Institutes
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Users size={16}/> {district.enrollments} Enrolled
                                    </div>
                                </div>
                            </div>

                            {/* Visual Bars */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500 font-medium">Demand Intensity</span>
                                        <span className="text-indigo-600 font-bold">{Math.round((district.jobs / maxJobs) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-indigo-50 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.round((district.jobs / maxJobs) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500 font-medium">Supply Capacity</span>
                                        <span className="text-emerald-600 font-bold">{Math.round((district.capacity / maxCapacity) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-emerald-50 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.round((district.capacity / maxCapacity) * 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Insight Badge */}
                            <div className="mt-4">
                                {district.jobs > district.capacity ? (
                                    <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg font-medium border border-red-100">
                                        Skill Shortage Detected. Recommend starting new batches.
                                    </div>
                                ) : district.capacity > district.jobs && district.jobs > 0 ? (
                                    <div className="bg-emerald-50 text-emerald-700 text-xs px-3 py-2 rounded-lg font-medium border border-emerald-100">
                                        Sufficient Supply. Focus on placement assistance.
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 text-gray-600 text-xs px-3 py-2 rounded-lg font-medium border border-gray-200">
                                        No significant activity detected currently.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DistrictIntelligence;
