import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    MapPin, Briefcase, GraduationCap, 
    AlertTriangle, Sparkles, Zap, Wrench, Building2,
    ArrowRight, TrendingUp, CheckCircle2, ShieldCheck,
    Calendar, Users, BookOpen, Target, Settings, ChevronRight, Activity, ArrowUpRight, ArrowDownRight, Check, BarChart3, ChevronDown, ChevronUp, BellRing, AlertCircle, Eye, X, BrainCircuit
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import SendRequirementModal from './SendRequirementModal';
import InstituteProfileModal from './InstituteProfileModal';

const TrendChart = ({ color, data }) => (
    <div className="h-8 w-16">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={`color-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${color.replace('#', '')})`} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const DistrictDigitalTwin = ({ twinData, onSelectDistrict, districtsList, selectedDistrictId }) => {
    if (!twinData) return null;

    const {
        districtName,
        state,
        totalVacancies,
        totalCapacity,
        totalInstitutes,
        trainersCount,
        equipmentCount,
        placementsCount,
        netGap,
        gapStatus,
        topIndustries,
        topSkills,
        institutesList
    } = twinData;

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTargetInst, setSelectedTargetInst] = useState(null);
    const [profileModalInstId, setProfileModalInstId] = useState(null);

    const defaultState = user?.scope?.state || state || 'Maharashtra';
    const [prefilledSkill, setPrefilledSkill] = useState('');
    const [openSkillGroup, setOpenSkillGroup] = useState('Technical Skill');
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    // --- Skill Intelligence States ---
    const [selectedIntelligenceSkill, setSelectedIntelligenceSkill] = useState(null);
    const [skillIntelligenceData, setSkillIntelligenceData] = useState(null);
    const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(false);
    const [activeIntelligenceTab, setActiveIntelligenceTab] = useState('companies');

    const handleSkillClick = async (skill) => {
        setSelectedIntelligenceSkill(skill);
        setIsIntelligenceLoading(true);
        setSkillIntelligenceData(null);
        setActiveIntelligenceTab('companies');
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const { data } = await axios.get(`/api/state-admin/intelligence/skill-intelligence/${selectedDistrictId || districtName}/${skill.name}`, {
                headers: { token }
            });
            if (data.success) {
                setSkillIntelligenceData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch skill intelligence:", error);
        } finally {
            setIsIntelligenceLoading(false);
        }
    };

    // Helper functions for small trend lines (fake data for visualization of the micro chart as per UI)
    const dummyTrendData = [ {value: 3}, {value: 4}, {value: 3}, {value: 5}, {value: 4}, {value: 6}, {value: 7} ];
    
    // Formatting Last Updated
    const lastUpdated = new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });

    return (
        <div className="w-full bg-[#f8fafc] p-4 md:p-6 lg:p-8 rounded-3xl space-y-6 md:space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.03)] border border-white">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center shrink-0">
                        <MapPin size={32} className="text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                SKILL DEMAND DIGITAL TWIN
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">• {state || 'Maharashtra'}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            {districtName} Workforce Ecosystem
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
                            Real-time insights for a skilled and future-ready workforce
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex flex-col items-end">
                        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                            <MapPin size={16} className="text-blue-600"/>
                            <select
                                value={selectedDistrictId || 'all'}
                                onChange={(e) => onSelectDistrict(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 cursor-pointer"
                            >
                                <option value="all">State Overall Overview</option>
                                {districtsList && districtsList.map((d, idx) => (
                                    <option key={idx} value={d.districtId || d._id || d.districtName || d.name}>
                                        {d.districtName || d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 bg-white/50 px-4 py-2.5 rounded-xl border border-slate-200/50">
                        <Calendar size={18} className="text-slate-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Updated</span>
                            <span className="text-xs font-bold text-slate-700">{lastUpdated}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200/50 mx-1"></div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors group cursor-pointer"
                            title="Refresh Data"
                        >
                            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Job Demand */}
                <div className="bg-white rounded-[20px] p-5 border border-blue-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start relative z-10 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Briefcase size={20} className="text-blue-600" />
                            </div>
                            <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Total Job Demand</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0%</span>
                            <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">vs last month</span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{totalVacancies}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">vacancies</p>
                        </div>
                        <TrendChart color="#2563eb" data={dummyTrendData} />
                    </div>
                </div>

                {/* Card 2: Training Capacity */}
                <div className="bg-white rounded-[20px] p-5 border border-emerald-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start relative z-10 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <GraduationCap size={20} className="text-emerald-600" />
                            </div>
                            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Training Capacity</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0%</span>
                            <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">vs last month</span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{totalCapacity}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">seats</p>
                        </div>
                        <TrendChart color="#059669" data={dummyTrendData} />
                    </div>
                </div>

                {/* Card 3: Staff & Equipment */}
                <div className="bg-white rounded-[20px] p-5 border border-orange-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start relative z-10 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Users size={20} className="text-orange-600" />
                            </div>
                            <span className="text-[11px] font-black text-orange-700 uppercase tracking-widest">Staff & Equipment</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0%</span>
                            <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">vs last month</span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{trainersCount} <span className="text-slate-300">/</span> {equipmentCount}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">trainers <span className="mx-1"></span> labs</p>
                        </div>
                        <TrendChart color="#ea580c" data={dummyTrendData} />
                    </div>
                </div>

                {/* Card 4: Gap Status */}
                <div className="bg-white rounded-[20px] p-5 border border-purple-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start relative z-10 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <AlertTriangle size={20} className="text-purple-600" />
                            </div>
                            <span className="text-[11px] font-black text-purple-700 uppercase tracking-widest">Gap Status</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${netGap > 0 ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'}`}>
                                {netGap > 0 ? <AlertTriangle size={16}/> : <Check size={16}/>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-none">{gapStatus || 'Balanced'}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">Supply meets demand</p>
                        </div>
                        <div className="flex flex-col items-center">
                             <span className={`text-[9px] font-black uppercase mt-2 ${netGap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {netGap > 0 ? 'Shortage' : 'Balanced'}
                             </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DIGITAL TWIN ECOSYSTEM FLOW --- */}
            <div className="pt-4">
                <div className="flex justify-between items-end mb-6">
                    <div className="flex items-start gap-3">
                        <Zap size={24} className="text-orange-500 mt-1" fill="currentColor" />
                        <div>
                            <h2 className="text-[15px] font-black text-slate-900 tracking-tight uppercase">Digital Twin Ecosystem Flow</h2>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">From demand to real-world impact</p>
                        </div>
                    </div>
                    <button className="hidden md:flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">
                        <Activity size={16} /> Live Ecosystem Chain <ArrowRight size={16} />
                    </button>
                </div>

                {/* The 5-stage Flow */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 w-full">
                    
                    {/* Stage 1 */}
                    <div 
                        className="w-full xl:w-[19%] bg-white border border-blue-100 rounded-2xl p-5 shadow-sm relative overflow-visible group flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow cursor-help"
                    >
                        {/* Custom Tooltip */}
                        <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[60] bg-white border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl p-3.5 w-[240px] scale-95 group-hover:scale-100 invisible group-hover:visible">
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed text-center">Stage 1 represents the specific geographical region (District) and the total number of active Government Training Centers available there.</p>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">01</div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Stage 1</span>
                            </div>
                            <MapPin size={16} className="text-blue-400" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[15px] font-black text-slate-900 leading-tight truncate">{districtName}</h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">{totalInstitutes} Active Centers</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-blue-600 relative z-10">
                            Realtime Sync <ArrowRight size={12} />
                        </div>
                    </div>

                    <ChevronRight size={24} className="hidden xl:block text-slate-300 shrink-0" />

                    {/* Stage 2 */}
                    <div 
                        className="w-full xl:w-[19%] bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm relative overflow-visible group flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow cursor-help"
                    >
                        {/* Custom Tooltip */}
                        <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[60] bg-white border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl p-3.5 w-[240px] scale-95 group-hover:scale-100 invisible group-hover:visible">
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed text-center">Stage 2 identifies the most demanded Industry Sector (e.g., IT, Manufacturing) in this district based on real-time corporate job postings.</p>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">02</div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Stage 2</span>
                            </div>
                            <Building2 size={16} className="text-emerald-400" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[15px] font-black text-slate-900 leading-tight truncate">
                                {topIndustries && topIndustries.length > 0 ? topIndustries[0].name : 'Sector'}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">{totalVacancies} Demanded Roles</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-600 relative z-10">
                            Corporate Demand <ArrowRight size={12} />
                        </div>
                    </div>

                    <ChevronRight size={24} className="hidden xl:block text-slate-300 shrink-0" />

                    {/* Stage 3 */}
                    <div 
                        className="w-full xl:w-[19%] bg-white border border-amber-100 rounded-2xl p-5 shadow-sm relative overflow-visible group flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow cursor-help"
                    >
                        {/* Custom Tooltip */}
                        <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[60] bg-white border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl p-3.5 w-[240px] scale-95 group-hover:scale-100 invisible group-hover:visible">
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed text-center">Stage 3 extracts the specific top Skill currently required by employers to fulfill the demand.</p>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">03</div>
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Stage 3</span>
                            </div>
                            <Target size={16} className="text-amber-400" />
                        </div>
                        <div className="relative z-10 w-full overflow-hidden">
                            {topSkills && topSkills.length > 1 ? (
                                <div className="whitespace-nowrap overflow-hidden relative w-full h-[20px]">
                                    <div className="animate-marquee inline-block whitespace-nowrap">
                                        <h4 className="text-[15px] font-black text-slate-900 leading-tight capitalize inline-block mr-6">
                                            {topSkills[0].name}
                                        </h4>
                                        <h4 className="text-[15px] font-black text-slate-900 leading-tight capitalize inline-block mr-6">
                                            {topSkills[1].name}
                                        </h4>
                                        {topSkills[2] && (
                                            <h4 className="text-[15px] font-black text-slate-900 leading-tight capitalize inline-block mr-6">
                                                {topSkills[2].name}
                                            </h4>
                                        )}
                                    </div>
                                    <div className="animate-marquee2 inline-block whitespace-nowrap absolute top-0">
                                        <h4 className="text-[15px] font-black text-slate-900 leading-tight capitalize inline-block mr-6">
                                            {topSkills[0].name}
                                        </h4>
                                        <h4 className="text-[15px] font-black text-slate-900 leading-tight capitalize inline-block mr-6">
                                            {topSkills[1].name}
                                        </h4>
                                        {topSkills[2] && (
                                            <h4 className="text-[15px] font-black text-slate-900 leading-tight capitalize inline-block mr-6">
                                                {topSkills[2].name}
                                            </h4>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <h4 className="text-[15px] font-black text-slate-900 leading-tight truncate capitalize">
                                    {topSkills && topSkills.length > 0 ? topSkills[0].name : 'Skill'}
                                </h4>
                            )}
                            <p className="text-[11px] text-slate-500 font-medium mt-1">{topSkills?.length || 0} Active Job Skills</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-amber-600 relative z-10">
                            AI Extracted Signal <ArrowRight size={12} />
                        </div>
                    </div>

                    <ChevronRight size={24} className="hidden xl:block text-slate-300 shrink-0" />

                    {/* Stage 4 */}
                    <div 
                        className="w-full xl:w-[19%] bg-white border border-purple-100 rounded-2xl p-5 shadow-sm relative overflow-visible group flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow cursor-help"
                    >
                        {/* Custom Tooltip */}
                        <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[60] bg-white border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl p-3.5 w-[240px] scale-95 group-hover:scale-100 invisible group-hover:visible">
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed text-center">Stage 4 shows the Government's response to the demand by providing training seats and qualified staff.</p>
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">04</div>
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Stage 4</span>
                            </div>
                            <BookOpen size={16} className="text-purple-400" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[15px] font-black text-slate-900 leading-tight">{totalCapacity} Seats</h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">{trainersCount} Qualified Staff</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-purple-600 relative z-10">
                            Govt Curriculum <ArrowRight size={12} />
                        </div>
                    </div>

                    <ChevronRight size={24} className="hidden xl:block text-slate-300 shrink-0" />

                    {/* Stage 5 */}
                    <div 
                        className="w-full xl:w-[19%] bg-white border border-teal-100 rounded-2xl p-5 shadow-sm relative overflow-visible group flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow cursor-help"
                    >
                        {/* Custom Tooltip */}
                        <div className="absolute top-[calc(100%+12px)] right-0 xl:left-1/2 xl:-translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[60] bg-white border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl p-3.5 w-[240px] scale-95 group-hover:scale-100 invisible group-hover:visible">
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed text-center">Stage 5 tracks the final outcome: The number of candidates successfully trained and placed in jobs, closing the loop.</p>
                            <div className="absolute -top-1.5 right-6 xl:left-1/2 xl:-translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-black">05</div>
                                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Stage 5</span>
                            </div>
                            <TrendingUp size={16} className="text-teal-400" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[15px] font-black text-slate-900 leading-tight">{placementsCount} Placed</h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">Verified Placements</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-teal-600 relative z-10">
                            Closed Loop <ArrowRight size={12} />
                        </div>
                    </div>

                </div>
            </div>

            {/* --- BOTTOM PANELS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                
                {/* Left Panel: Top Demanded Skills */}
                <div className={`bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col h-[420px] relative transition-all duration-300 ${openSkillGroup ? 'z-30' : 'z-10'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-orange-500" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Demanded Skills in {districtName}</h3>
                        </div>
                        <button className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                            View All <ArrowRight size={12}/>
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col w-full py-2 pr-2">
                        {topSkills && topSkills.length > 0 ? (
                            <div className="w-full space-y-4">
                                {/* Grouping logic dynamically from available categories */}
                                {Array.from(new Set(topSkills.map(s => s.category || 'Uncategorized'))).map(group => {
                                    const groupedSkills = topSkills.filter(s => (s.category || 'Uncategorized') === group);
                                    if (groupedSkills.length === 0) return null;
                                    const isOpen = openSkillGroup === group;

                                    return (
                                        <div key={group} className="relative z-10">
                                            <button 
                                                onClick={() => setOpenSkillGroup(isOpen ? '' : group)}
                                                className={`w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm rounded-2xl transition-all ${isOpen ? 'border-blue-200 shadow-md bg-white' : ''}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {group === 'Technical Skill' ? <Wrench size={16} className="text-blue-500"/> : <Users size={16} className="text-purple-500"/>}
                                                    <span className="text-sm font-black text-slate-800">{group}s ({groupedSkills.length})</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md transition-colors hover:bg-blue-200">
                                                    View Skills
                                                </span>
                                            </button>
                                            
                                            {isOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setOpenSkillGroup('')}></div>
                                                    <div className="absolute left-full top-0 ml-4 w-[280px] bg-white rounded-2xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[350px] animate-slide-up origin-top-left">
                                                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{group}s</span>
                                                            <button onClick={() => setOpenSkillGroup('')} className="text-slate-400 hover:text-slate-600 transition-colors bg-white hover:bg-slate-100 p-1 rounded-lg">
                                                                <X size={14}/>
                                                            </button>
                                                        </div>
                                                        <div className="p-2 overflow-y-auto flex-1 space-y-1">
                                                            {groupedSkills.map((skill, index) => (
                                                                <button key={index} onClick={() => handleSkillClick(skill)} className="w-full flex justify-between items-center p-2.5 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer text-left">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-7 h-7 rounded-lg ${group === 'Technical Skill' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'} flex items-center justify-center font-bold text-[10px]`}>{index + 1}</div>
                                                                        <span className="text-xs font-bold text-slate-700 capitalize truncate max-w-[120px] group-hover:text-blue-600 transition-colors">{skill.name}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors px-2.5 py-1 rounded-full whitespace-nowrap">{skill.count} Vacancies</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BarChart3 size={24} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">No specific skill extractions registered yet.</p>
                                <p className="text-xs text-slate-400 mt-1">Skill demand data will appear here once analyzed.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Government Training Centers */}
                <div className={`bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col h-[420px] relative transition-all duration-300 ${activeDropdownId ? 'z-30' : 'z-10'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2">
                            <Building2 size={18} className="text-blue-500" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Government Training Centers ({totalInstitutes})</h3>
                        </div>
                        <button className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                            View All <ArrowRight size={12}/>
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col w-full py-2 pr-2 overflow-y-auto">
                        {institutesList && institutesList.length > 0 ? (
                            <div className="w-full space-y-3">
                                {institutesList.slice(0, 5).map((inst, index) => (
                                    <div key={index} className="relative z-10">
                                        <div 
                                            onClick={() => setActiveDropdownId(activeDropdownId === inst._id ? null : inst._id)}
                                            className={`flex justify-between items-center p-4 border border-slate-100 hover:border-slate-200 hover:shadow-md bg-slate-50/30 hover:bg-white rounded-2xl transition-all duration-300 group cursor-pointer ${activeDropdownId === inst._id ? 'border-indigo-200 shadow-md bg-white' : ''}`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <Building2 size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-700">{inst.name}</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium">{inst.type || 'Government Center'}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md transition-colors group-hover:bg-indigo-100">
                                                View Actions
                                            </span>
                                        </div>

                                        {activeDropdownId === inst._id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdownId(null); }}></div>
                                                    <div className={`absolute right-0 ${index >= 3 ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'} w-52 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-1.5 z-50 animate-slide-up`}>
                                                        <div className="px-3 py-1.5 mb-1 border-b border-slate-50">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Action</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedTargetInst(inst);
                                                                setIsModalOpen(true);
                                                                setActiveDropdownId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
                                                        >
                                                            <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                                <BookOpen size={12} />
                                                            </div>
                                                            Request New Batch
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setActiveDropdownId(null);
                                                                alert("General Alert Feature Coming Soon!");
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-left"
                                                        >
                                                            <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                                <AlertCircle size={12} />
                                                            </div>
                                                            Send General Alert
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setActiveDropdownId(null);
                                                                setProfileModalInstId(inst._id);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                                        >
                                                            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                                                <Eye size={12} />
                                                            </div>
                                                            View Profile
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 size={24} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">No training centers integrated in this district yet.</p>
                                <p className="text-xs text-slate-400 mt-1">Training center data will appear here once available.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <SendRequirementModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                targetInstitute={selectedTargetInst}
                topSkills={topSkills}
                prefillSkill={prefilledSkill || (topSkills && topSkills.length > 0 ? topSkills[0].name : '')}
            />

            <InstituteProfileModal 
                isOpen={!!profileModalInstId}
                onClose={() => setProfileModalInstId(null)}
                instituteId={profileModalInstId}
            />

            {/* --- SKILL INTELLIGENCE MODAL --- */}
            {selectedIntelligenceSkill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 leading-tight capitalize">{selectedIntelligenceSkill.name}</h2>
                                    <p className="text-xs text-slate-500 font-medium">Skill Intelligence • {districtName}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedIntelligenceSkill(null)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
                            {isIntelligenceLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-sm font-bold text-slate-600">Analyzing Skill Ecosystem...</p>
                                </div>
                            ) : skillIntelligenceData ? (
                                <div className="space-y-6">
                                    {/* KPIs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                                <Target size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Demand</p>
                                                <p className="text-2xl font-black text-slate-900">{skillIntelligenceData.demand}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                <GraduationCap size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Available Supply</p>
                                                <p className="text-2xl font-black text-slate-900">{skillIntelligenceData.supply}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${skillIntelligenceData.gap > 0 ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'} flex items-center justify-center shrink-0`}>
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Skill Gap</p>
                                                <p className={`text-2xl font-black ${skillIntelligenceData.gap > 0 ? 'text-red-600' : 'text-teal-600'}`}>
                                                    {skillIntelligenceData.gap > 0 ? `+${skillIntelligenceData.gap} Shortage` : 'Balanced'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
                                        <div className="flex border-b border-slate-100">
                                            <button 
                                                onClick={() => setActiveIntelligenceTab('companies')}
                                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeIntelligenceTab === 'companies' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                Hiring Companies ({skillIntelligenceData.companies?.length || 0})
                                            </button>
                                            <button 
                                                onClick={() => setActiveIntelligenceTab('institutes')}
                                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeIntelligenceTab === 'institutes' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                Relevant Training Centers ({skillIntelligenceData.institutes?.length || 0})
                                            </button>
                                        </div>
                                        <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30">
                                            {activeIntelligenceTab === 'companies' && (
                                                <div className="space-y-3">
                                                    {skillIntelligenceData.companies?.length > 0 ? (
                                                        skillIntelligenceData.companies.map(company => (
                                                            <div key={company._id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                                                        {company.image ? <img src={company.image} alt={company.name} className="w-full h-full object-cover" /> : <Briefcase size={20} className="text-slate-400" />}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-slate-900">{company.name}</h4>
                                                                        <p className="text-xs text-slate-500 mt-0.5">{(company.roles || []).join(', ')}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-lg font-black text-blue-600">{company.vacancies}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Vacancies</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-10">
                                                            <p className="text-sm font-bold text-slate-500">No active companies hiring currently.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeIntelligenceTab === 'institutes' && (
                                                <div className="space-y-3">
                                                    {skillIntelligenceData.institutes?.length > 0 ? (
                                                        skillIntelligenceData.institutes.map(inst => (
                                                            <div key={inst._id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                                                        {inst.image ? <img src={inst.image} alt={inst.name} className="w-full h-full object-cover" /> : <Building2 size={20} className="text-slate-400" />}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-slate-900">{inst.name}</h4>
                                                                        <p className="text-xs text-slate-500 mt-0.5">{inst.type} • {inst.address}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-right">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-700">{inst.enrolledCount}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Enrolled</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-purple-600">{inst.totalCapacity}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Capacity</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-10">
                                                            <p className="text-sm font-bold text-slate-500">No active training centers teaching this skill.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-red-500 text-sm font-bold">Failed to load data.</div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                            <button onClick={() => setSelectedIntelligenceSkill(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                Close
                            </button>
                            <button 
                                onClick={() => navigate('/simulator', { state: { initialPrompt: `If I start 2 new batches of ${selectedIntelligenceSkill?.name} in ${districtName}, how much of the current skill demand gap could be reduced?` } })}
                                disabled={isIntelligenceLoading || !skillIntelligenceData}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                <BrainCircuit size={16} /> Simulate Solution
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistrictDigitalTwin;
