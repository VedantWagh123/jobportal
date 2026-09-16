import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, BookOpen, Users, Calendar, ChevronDown, Wrench, Plus } from 'lucide-react';

const SendRequirementModal = ({ isOpen, onClose, targetInstitute, prefillSkill, topSkills }) => {
    const [formData, setFormData] = useState({
        skillTargets: [], // Array for multiple skills
        capacity: 50,
        deadline: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Sync prefill if it changes
    useEffect(() => {
        if (isOpen && prefillSkill) {
            setFormData(prev => ({ ...prev, skillTargets: [prefillSkill] }));
        }
    }, [isOpen, prefillSkill]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.skillTargets.length === 0) {
            alert("Please select at least one skill.");
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('stateAdminToken');
            const { data } = await axios.post('/api/state-admin/notifications/send-requirement', {
                instituteId: targetInstitute?._id,
                districtId: targetInstitute?.districtId,
                ...formData,
                skillTarget: formData.skillTargets.join(', ')
            }, {
                headers: { token }
            });
            if (data.success) {
                alert('Requirement Sent Successfully to ' + targetInstitute.name);
                onClose();
            } else {
                alert(data.message || 'Failed to send requirement.');
            }
        } catch (error) {
            console.error('Failed to send req', error);
            alert('Error sending requirement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addSkill = (skillName) => {
        if (!formData.skillTargets.includes(skillName)) {
            setFormData(prev => ({ ...prev, skillTargets: [...prev.skillTargets, skillName] }));
        }
    };

    const addGroup = (groupName) => {
        const groupSkills = (topSkills || []).filter(s => s.category === groupName).map(s => s.name);
        const newSkills = groupSkills.filter(s => !formData.skillTargets.includes(s));
        setFormData(prev => ({ ...prev, skillTargets: [...prev.skillTargets, ...newSkills] }));
    };

    const removeSkill = (skillName) => {
        setFormData(prev => ({
            ...prev,
            skillTargets: prev.skillTargets.filter(s => s !== skillName)
        }));
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-slide-up relative border border-slate-100">
                
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-7 py-6 flex justify-between items-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-20 w-24 h-24 bg-blue-400/20 rounded-full blur-xl transform translate-y-10"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                                <Send size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Send Requirement</h3>
                                <p className="text-blue-100 text-xs font-semibold mt-0.5 flex items-center gap-1.5 opacity-90">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    {targetInstitute?.name || 'Broadcast to District'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/5 hover:scale-105 active:scale-95">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-7 space-y-6">
                    <div ref={dropdownRef} className="relative">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2.5">
                            <BookOpen size={14} className="text-blue-500"/> Target Skills 
                            <span className="text-slate-300 ml-auto font-normal normal-case tracking-normal">Grouped Selection</span>
                        </label>
                        
                        <div 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-full min-h-[52px] bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center gap-2 cursor-pointer focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all shadow-sm"
                        >
                            {formData.skillTargets.length === 0 && (
                                <span className="text-sm font-medium text-slate-400 ml-1">Select demanded skills...</span>
                            )}
                            {formData.skillTargets.map(skill => (
                                <div key={skill} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold capitalize shadow-sm">
                                    {skill}
                                    <button 
                                        type="button" 
                                        onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
                                        className="hover:bg-blue-200/60 rounded-full p-0.5 transition-colors text-blue-500 hover:text-blue-700"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <div className="ml-auto text-slate-400 shrink-0 bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                                <ChevronDown size={16} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl max-h-[280px] overflow-y-auto z-50 p-2.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                {['Technical Skill', 'Soft Skill'].map(group => {
                                    const groupedSkills = (topSkills || []).filter(s => s.category === group);
                                    if (groupedSkills.length === 0) return null;
                                    return (
                                        <div key={group} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-slate-50/80 px-3.5 py-2.5 flex justify-between items-center border-b border-slate-100">
                                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                                    {group === 'Technical Skill' ? <Wrench size={12} className="text-blue-500"/> : <Users size={12} className="text-purple-500"/>}
                                                    {group}s
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={() => addGroup(group)}
                                                    className="text-[10px] font-bold text-blue-600 bg-white border border-blue-100 shadow-sm hover:bg-blue-50 hover:border-blue-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition-all active:scale-95"
                                                >
                                                    <Plus size={10} /> Add All
                                                </button>
                                            </div>
                                            <div className="p-1.5 grid grid-cols-1 gap-0.5">
                                                {groupedSkills.map((skill, idx) => {
                                                    const isSelected = formData.skillTargets.includes(skill.name);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => isSelected ? removeSkill(skill.name) : addSkill(skill.name)}
                                                            className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-between items-center capitalize group ${
                                                                isSelected 
                                                                    ? 'bg-blue-50 text-blue-700' 
                                                                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-slate-200 group-hover:bg-slate-300'} transition-colors`}></div>
                                                                {skill.name}
                                                            </span>
                                                            {isSelected && <span className="text-[9px] uppercase tracking-widest font-black bg-blue-100/50 px-2 py-0.5 rounded-md text-blue-500">Added</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2.5">
                                <Users size={14} className="text-emerald-500"/> Capacity
                            </label>
                            <input 
                                type="number" 
                                required
                                value={formData.capacity}
                                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                                className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all shadow-sm"
                                min="10"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2.5">
                                <Calendar size={14} className="text-orange-500"/> Target Deadline
                            </label>
                            <input 
                                type="date" 
                                required
                                value={formData.deadline}
                                onChange={e => setFormData({...formData, deadline: e.target.value})}
                                className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2.5">
                            Additional Instructions
                            <span className="text-slate-300 font-normal tracking-normal normal-case ml-auto">Optional</span>
                        </label>
                        <textarea 
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all min-h-[110px] resize-none shadow-sm leading-relaxed"
                            placeholder="Add specific requirements for trainers, curriculum alignment, or placement tie-ups..."
                        />
                    </div>

                    <div className="pt-4 pb-2 flex justify-end gap-3 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-7 py-3 rounded-xl text-sm font-bold shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] flex items-center gap-2.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Send size={16} />
                            )}
                            {isSubmitting ? 'Dispatching...' : 'Dispatch Requirement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendRequirementModal;
