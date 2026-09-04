import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { 
    LayoutDashboard, Map, Briefcase, BarChart2, TrendingUp, 
    Building2, BookOpen, Users, UserCheck, FileText, Sparkles 
} from 'lucide-react';

const AdminSidebar = () => {
    return (
        <div className="w-[260px] bg-[#1a233a] text-white flex-shrink-0 hidden md:flex flex-col h-full border-r border-[#263148]">
            <div className="p-6 flex items-center gap-3">
                {/* Simulated Indian Emblem Logo */}
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="w-6 h-auto opacity-90 brightness-0 invert" />
                </div>
                <div>
                    <h2 className="text-[15px] font-bold tracking-widest text-white leading-tight">GOV-ADMIN</h2>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide">INTELLIGENCE PLATFORM</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                <nav className="space-y-1 px-4">
                    <NavLink to="/government-admin" end className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <LayoutDashboard className="w-5 h-5 mr-4 opacity-90" />
                        Dashboard
                    </NavLink>
                    
                    <NavLink to="/government-admin/districts" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <Map className="w-5 h-5 mr-4 opacity-90" />
                        Geographic Analysis
                    </NavLink>
                    
                    <NavLink to="/government-admin/job-market" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <Briefcase className="w-5 h-5 mr-4 opacity-90" />
                        Job Market
                    </NavLink>

                    <NavLink to="/government-admin/course-skills" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <BarChart2 className="w-5 h-5 mr-4 opacity-90" />
                        Skills Analysis
                    </NavLink>

                    <NavLink to="/government-admin/training-supply" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <TrendingUp className="w-5 h-5 mr-4 opacity-90" />
                        Training Supply
                    </NavLink>
                    
                    <NavLink to="/government-admin/institutes" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <Building2 className="w-5 h-5 mr-4 opacity-90" />
                        Institutes
                    </NavLink>

                    <NavLink to="/government-admin/courses" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <BookOpen className="w-5 h-5 mr-4 opacity-90" />
                        Courses
                    </NavLink>

                    <NavLink to="/government-admin/batches" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <Users className="w-5 h-5 mr-4 opacity-90" />
                        Batches
                    </NavLink>

                    <NavLink to="/government-admin/enrollments" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <UserCheck className="w-5 h-5 mr-4 opacity-90" />
                        Enrollments
                    </NavLink>

                    <NavLink to="/government-admin/reports" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <FileText className="w-5 h-5 mr-4 opacity-90" />
                        Reports
                    </NavLink>
                    
                    <NavLink to="/government-admin/unresolved-skills" className={({isActive}) => `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:bg-white/5'}`}>
                        <div className="flex items-center">
                            <Sparkles className="w-5 h-5 mr-4 opacity-90" />
                            AI Insights
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">New</span>
                    </NavLink>
                </nav>
            </div>
            
            <div className="p-6 relative overflow-hidden mt-auto">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                   <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                </div>
                <div className="relative z-10">
                    <p className="text-[13px] italic font-serif text-gray-300 leading-snug">"Skilled India<br/>Stronger Tomorrow"</p>
                </div>
                <div className="text-[10px] text-gray-500 mt-6 relative z-10">Gov Platform v1.0</div>
            </div>
        </div>
    );
};

export default AdminSidebar;
