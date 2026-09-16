import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, X, Briefcase, Target, AlertTriangle, CheckCircle2, TrendingUp, Bell, ArrowRight, Loader2, BookOpen } from 'lucide-react';

const DistrictIntelligenceModal = ({ isOpen, onClose, districtId, onNotifyClick }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [isNotifying, setIsNotifying] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleDirectNotify = async () => {
        if (!data) return;
        setIsNotifying(true);
        try {
            const token = localStorage.getItem('stateAdminToken');
            const targetSkills = data.topSkills?.map(s => s.name).slice(0, 5).join(', ') || 'High Demand Skills';
            
            const response = await fetch('/api/state-admin/notifications/send-requirement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify({
                    districtId: data.districtId,
                    title: `Urgent Skill Demand Alert: ${data.districtName}`,
                    message: `Real-time intelligence shows high employer demand for the following skills in your district: ${targetSkills}. Please align your training batches to meet this demand.`,
                    skillTarget: targetSkills,
                    type: 'Requirement'
                })
            });
            const resData = await response.json();
            if (resData.success) {
                alert(`Direct Broadcast Successful! Notification sent to all institutes in ${data.districtName}.`);
                setIsSent(true);
            } else {
                alert(resData.message || 'Failed to send notification.');
            }
        } catch (error) {
            console.error('Error notifying', error);
            alert('Error sending notification.');
        } finally {
            setIsNotifying(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !districtId) return;

        const fetchData = async () => {
            setLoading(true);
            setError('');
            setIsSent(false);
            try {
                const token = localStorage.getItem('stateAdminToken');
                const res = await axios.get(`/api/state-admin/intelligence/district-twin/${districtId}`, {
                    headers: { token }
                });
                if (res.data.success) {
                    setData(res.data.digitalTwin);
                } else {
                    setError('Failed to fetch district intelligence');
                }
            } catch (err) {
                setError('Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, districtId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-slide-up relative border border-slate-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-slate-900 px-8 py-7 flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                            <MapPin size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">{data?.districtName || 'Loading...'}</h3>
                            <p className="text-blue-200 text-sm font-semibold mt-0.5">{data?.state || 'Maharashtra'} Intelligence Report</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/5 hover:scale-105 active:scale-95">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <p className="text-slate-500 font-medium">Scanning live employer demands...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={20} />
                            <p className="font-semibold">{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            
                            {/* Overview Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                                        <Briefcase size={16} className="text-indigo-500" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-900">{data.totalVacancies}</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Current Employer Demand</p>
                                </div>
                                
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                                        <Target size={16} className="text-emerald-500" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Total Supply</span>
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-900">{data.totalCapacity}</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Enrolled & Training</p>
                                </div>

                                <div className={`rounded-2xl p-5 border ${data.netGap > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {data.netGap > 0 ? (
                                            <AlertTriangle size={16} className="text-red-500" />
                                        ) : (
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        )}
                                        <span className={`text-xs font-bold uppercase tracking-wider ${data.netGap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Net Gap</span>
                                    </div>
                                    <h4 className={`text-3xl font-black ${data.netGap > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                        {Math.abs(data.netGap)}
                                    </h4>
                                    <p className={`text-xs font-medium mt-1 ${data.netGap > 0 ? 'text-red-400' : 'text-emerald-500'}`}>
                                        {data.netGap > 0 ? 'Seat Shortage' : 'Seat Surplus'}
                                    </p>
                                </div>
                            </div>

                            {/* Recommendations Section */}
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-blue-600" /> Actionable Insights & Recommendations
                                </h4>
                                
                                {data.topSkills && data.topSkills.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.topSkills.map((skill, idx) => (
                                            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-4 hover:border-blue-300 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                                                    <Briefcase size={18} />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-900 text-base">{skill.name}</h5>
                                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                                        High employer demand identified for <strong>{skill.name}</strong> roles ({skill.count} active vacancies). 
                                                        <span className="font-semibold text-blue-700"> Recommend starting urgent batches for this skill.</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-start gap-3">
                                        <Briefcase size={20} className="text-slate-400 shrink-0" />
                                        <div>
                                            <h5 className="font-bold text-slate-700">No specific role demand found</h5>
                                            <p className="text-sm text-slate-500 mt-1">There are currently no clear shortage patterns in this district based on employer data.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                {!loading && !error && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                        <p className="text-xs text-slate-500 font-medium">Data synced in real-time with Job Portal</p>
                        <button 
                            onClick={handleDirectNotify}
                            disabled={isNotifying || isSent || !data.topSkills || data.topSkills.length === 0}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                                (isNotifying || isSent || !data.topSkills || data.topSkills.length === 0)
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                        >
                            {isNotifying ? <Loader2 size={18} className="animate-spin" /> : isSent ? <CheckCircle2 size={18} /> : <Bell size={18} />}
                            {isNotifying ? 'Sending...' : isSent ? 'Notification Sent ✓' : 'Direct Broadcast (Notify)'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DistrictIntelligenceModal;
