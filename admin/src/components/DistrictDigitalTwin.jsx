import React from 'react';
import { 
    MapPin, Briefcase, GraduationCap, 
    AlertTriangle, Sparkles, Zap, Wrench, Building2,
    ArrowRight, TrendingUp, CheckCircle2, ShieldCheck
} from 'lucide-react';

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

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)] p-6 lg:p-8 space-y-8 my-6">
            
            {/* 1. Header & District Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Skill Demand Digital Twin
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">• {state || 'Maharashtra'}</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                            {districtName} Workforce Ecosystem
                        </h2>
                    </div>
                </div>

                {/* District Selector Dropdown */}
                <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-2.5 w-full md:w-auto shadow-xs hover:border-slate-300 transition-colors">
                    <MapPin size={16} className="text-blue-600 shrink-0" />
                    <select
                        value={selectedDistrictId || 'all'}
                        onChange={(e) => onSelectDistrict(e.target.value)}
                        className="bg-transparent border-none outline-none text-[13px] font-bold text-slate-800 cursor-pointer w-full md:w-52"
                    >
                        <option value="all">State Overall Overview</option>
                        {districtsList && districtsList.map((d, idx) => {
                            const val = d.districtId || d._id || d.districtName || d.name;
                            const label = d.districtName || d.name;
                            return (
                                <option key={idx} value={val}>
                                    {label} ({d.jobs || 0} Vacancies)
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {/* 2. Key Metrics Cards Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-100/80 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-blue-500/5">
                    <div className="flex items-center gap-2 text-blue-700 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                        <Briefcase size={14} className="text-blue-600" /> Total Job Demand
                    </div>
                    <div className="text-2xl font-black text-slate-900">{totalVacancies} <span className="text-xs font-bold text-slate-500">vacancies</span></div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-100/80 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                        <GraduationCap size={14} className="text-emerald-600" /> Training Capacity
                    </div>
                    <div className="text-2xl font-black text-slate-900">{totalCapacity} <span className="text-xs font-bold text-slate-500">seats</span></div>
                </div>

                <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100/80 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-amber-500/5">
                    <div className="flex items-center gap-2 text-amber-700 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                        <Wrench size={14} className="text-amber-600" /> Staff & Equipment
                    </div>
                    <div className="text-2xl font-black text-slate-900">{trainersCount} <span className="text-xs font-bold text-slate-500">trainers</span> / {equipmentCount} <span className="text-xs font-bold text-slate-500">labs</span></div>
                </div>

                <div className={`border rounded-2xl p-4 transition-all hover:shadow-md ${netGap > 0 ? 'bg-gradient-to-br from-red-50/80 to-rose-50/40 border-red-100/80' : 'bg-gradient-to-br from-green-50/80 to-emerald-50/40 border-green-100/80'}`}>
                    <div className={`flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${netGap > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        <AlertTriangle size={14} /> Gap Status
                    </div>
                    <div className="text-xl font-black text-slate-900 flex items-center justify-between">
                        <span>{netGap > 0 ? `+${netGap} Shortage` : 'Balanced'}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${netGap > 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                            {gapStatus}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Visual Digital Twin Ecosystem Pipeline Graph (LIGHT THEME) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Zap size={16} className="text-amber-500 fill-amber-500" /> Digital Twin Ecosystem Flow
                    </h3>
                    <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full shadow-2xs">
                        Live Ecosystem Chain
                    </span>
                </div>

                {/* Light Theme Node Pipeline Card Container */}
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-6 lg:p-7 relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 lg:gap-4 relative z-10">
                        
                        {/* Node 1: District */}
                        <div className="bg-white border border-blue-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-blue-400 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">STAGE 1</span>
                                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <MapPin size={12} />
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1 mt-1 truncate">{districtName}</h4>
                                <p className="text-[11px] font-semibold text-slate-500 mt-1">{totalInstitutes} Active Centers</p>
                            </div>
                            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-blue-600">Realtime Sync</span>
                                <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>

                        {/* Node 2: Industry Sector */}
                        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-400 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">STAGE 2</span>
                                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Briefcase size={12} />
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 truncate mt-1">{topIndustries[0]?.name || 'Technology'}</h4>
                                <p className="text-[11px] font-semibold text-slate-500 mt-1">{topIndustries[0]?.count || totalVacancies} Demanded Roles</p>
                            </div>
                            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-emerald-600">Corporate Demand</span>
                                <ArrowRight size={12} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>

                        {/* Node 3: Required Skill */}
                        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-400 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">STAGE 3</span>
                                    <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Sparkles size={12} />
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 truncate mt-1">{topSkills[0]?.name || 'Full Stack'}</h4>
                                <p className="text-[11px] font-semibold text-slate-500 mt-1">{topSkills[0]?.count || 5} Active Job Skills</p>
                            </div>
                            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-amber-600">AI Extracted Signal</span>
                                <ArrowRight size={12} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>

                        {/* Node 4: Course Capacity */}
                        <div className="bg-white border border-purple-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-purple-400 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wider">STAGE 4</span>
                                    <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <GraduationCap size={12} />
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 mt-1">{totalCapacity} Seats</h4>
                                <p className="text-[11px] font-semibold text-slate-500 mt-1">{trainersCount} Qualified Staff</p>
                            </div>
                            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-purple-600">Govt Curriculum</span>
                                <ArrowRight size={12} className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>

                        {/* Node 5: Placement Outcome */}
                        <div className="bg-white border border-teal-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-teal-400 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider">STAGE 5</span>
                                    <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                                        <TrendingUp size={12} />
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 mt-1">{placementsCount} Placed</h4>
                                <p className="text-[11px] font-semibold text-slate-500 mt-1">Verified Placements</p>
                            </div>
                            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-teal-600">Closed Loop</span>
                                <CheckCircle2 size={12} className="text-teal-500" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 4. Top Skill Requirements & Training Centers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Left: Top Skills Extracted */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="flex items-center gap-2"><Sparkles size={14} className="text-amber-500" /> Top Demanded Skills in {districtName}</span>
                    </h4>
                    <div className="space-y-3">
                        {topSkills && topSkills.length > 0 ? (
                            topSkills.map((sk, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-50/70 p-3 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-700 font-black text-[11px] flex items-center justify-center">
                                            #{idx + 1}
                                        </div>
                                        <span className="text-[13px] font-bold text-slate-800">{sk.name}</span>
                                    </div>
                                    <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                                        {sk.count} Vacancies
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 font-medium py-4 text-center">No specific skill extractions registered yet.</p>
                        )}
                    </div>
                </div>

                {/* Right: Key Training Centers in District */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="flex items-center gap-2"><Building2 size={14} className="text-blue-600" /> Government Training Centers ({totalInstitutes})</span>
                    </h4>
                    <div className="space-y-3">
                        {institutesList && institutesList.length > 0 ? (
                            institutesList.map((inst, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-50/70 p-3 rounded-xl border border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Building2 size={16} className="text-slate-400" />
                                        <span className="text-[13px] font-bold text-slate-800 truncate max-w-[220px]">{inst.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                                        {inst.type || 'Government'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 font-medium py-4 text-center">No training centers integrated in this district yet.</p>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default DistrictDigitalTwin;
