import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    X, Building2, MapPin, Mail, Phone, BookOpen, 
    Award, Shield, Calendar, Users, GraduationCap, CheckCircle2
} from 'lucide-react';

const InstituteProfileModal = ({ isOpen, onClose, instituteId }) => {
    const { user } = useContext(AuthContext);
    const [institute, setInstitute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && instituteId) {
            fetchInstituteProfile();
        } else {
            setInstitute(null);
        }
    }, [isOpen, instituteId]);

    const fetchInstituteProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const { data } = await axios.get(`/api/state-admin/intelligence/institute/${instituteId}`, {
                headers: { token }
            });
            if (data.success) {
                setInstitute(data.institute);
            } else {
                setError(data.message || 'Failed to load profile');
            }
        } catch (err) {
            setError('Error fetching institute details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Panel */}
            <div className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border border-slate-100">
                
                {/* Header Banner with Content */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 relative shrink-0 px-8 py-8">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-full flex items-center justify-center transition-colors"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>

                    {institute && !loading && !error && (
                        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-5 mt-2">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                                <Building2 size={36} className="text-indigo-600" />
                            </div>
                            <div className="text-center sm:text-left text-white flex-1">
                                <h2 className="text-2xl font-black leading-tight">{institute.name}</h2>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 text-white text-xs font-bold border border-white/10">
                                        <Shield size={12} /> {institute.type || 'Government Center'}
                                    </span>
                                    {institute.accreditation && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/30 text-emerald-50 text-xs font-bold border border-emerald-400/30">
                                            <Award size={12} /> {institute.accreditation}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Container */}
                <div className="px-8 py-8 flex-1 overflow-y-auto custom-scrollbar">
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 text-xs font-bold mt-4 uppercase tracking-widest animate-pulse">Loading Profile...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-48 text-red-500">
                            <p className="font-bold">{error}</p>
                        </div>
                    ) : institute ? (
                        <>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Mail size={16} className="text-blue-500" /> Contact Details
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 text-slate-400"><Mail size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                                                <p className="text-sm font-semibold text-slate-700">{institute.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 text-slate-400"><MapPin size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {institute.districtId?.name || 'Unknown District'} 
                                                    <span className="text-slate-400 font-medium ml-1">({institute.districtId?.state || 'Maharashtra'})</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 text-slate-400"><Calendar size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Joined On</p>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {new Date(institute.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats (Placeholder layout for future data) */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <BookOpen size={16} className="text-orange-500" /> Institute Highlights
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl text-center">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 mx-auto flex items-center justify-center mb-2">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700">Verified Center</p>
                                        </div>
                                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2">
                                                <Users size={16} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700">Active Batches</p>
                                        </div>
                                        <div className="col-span-2 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                <GraduationCap size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Placement Status</p>
                                                <p className="text-sm font-bold text-slate-800">Connected to State Pipeline</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default InstituteProfileModal;
