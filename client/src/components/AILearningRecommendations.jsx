import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';
import { AppContext } from '../context/AppContext';

const AILearningRecommendations = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const { backendUrl } = useContext(AppContext);

    const [recommendations, setRecommendations] = useState([]);
    const [missingSkills, setMissingSkills] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);

    const handleEnroll = async (batchId) => {
        if (!user) {
            toast.error('Please log in to enroll in a course.');
            return;
        }

        try {
            setEnrolling(batchId);
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/users/enroll`, { batchId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success('Successfully enrolled in the batch!');
                // Update local state to reflect enrollment immediately
                setRecommendations(prev => prev.map(rec => rec.batchId === batchId ? { ...rec, isEnrolled: true } : rec));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrolling(null);
        }
    };

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user || !isLoaded) return;
            try {
                const token = await getToken();
                const { data } = await axios.get(`${backendUrl}/api/users/career/market-recommendations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setRecommendations(data.recommendations || []);
                    setMissingSkills(data.missingSkills || []);
                    setMessage(data.message || '');
                }
            } catch (error) {
                console.error("Failed to fetch market recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, isLoaded]);

    if (!user) return <div className="p-4 text-center">Please log in to view AI recommendations.</div>;
    if (loading) return <div className="p-4 text-center">Loading AI Market Intelligence...</div>;
    if (recommendations.length === 0 && !message) return <div className="p-4 text-center">No AI alerts found.</div>;

    return (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 py-12 text-white relative overflow-hidden my-8 rounded-3xl mx-4 sm:mx-[10%]">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>

            <div className="relative z-10 px-8 lg:px-12">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                            <span>🚨</span> Urgent Market Upskilling
                        </h2>
                        <p className="text-indigo-200">
                            Our AI detected severe skill shortages in the market. You are missing these high-demand skills:
                            <span className="font-bold text-white ml-2 bg-white/10 px-2 py-1 rounded">
                                {missingSkills.join(', ')}
                            </span>
                        </p>
                    </div>
                </div>

                {message && recommendations.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                        <p className="font-bold text-lg">{message}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="bg-red-500/20 text-red-300 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                                            {rec.urgencyMessage}
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{rec.courseName}</h3>
                                        <p className="text-indigo-200 text-sm mt-1">{rec.instituteName} • {rec.districtName}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {rec.coveredSkills.map((skill, sIdx) => (
                                        <span key={sIdx} className="bg-indigo-500/30 border border-indigo-400/30 px-2 py-1 rounded text-xs font-medium">
                                            Covers: {skill}
                                        </span>
                                    ))}
                                </div>
                                <button 
                                    disabled={!rec.batchAvailable || enrolling === rec.batchId || rec.isEnrolled} 
                                    onClick={() => handleEnroll(rec.batchId)}
                                    className={`w-full py-2.5 rounded font-bold transition shadow ${
                                        rec.isEnrolled ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                                        : rec.batchAvailable ? 'bg-white text-indigo-900 hover:bg-indigo-50' 
                                        : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                                    }`}>
                                    {rec.isEnrolled ? 'Already Enrolled ✓' : enrolling === rec.batchId ? 'Enrolling...' : rec.batchAvailable ? 'Enroll Now' : 'No Batches Available'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AILearningRecommendations;
