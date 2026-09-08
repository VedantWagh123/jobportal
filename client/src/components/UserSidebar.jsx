import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { Home, BriefcaseBusiness, Compass, Building2, GraduationCap, TrendingUp } from 'lucide-react';

const UserSidebar = () => {
    const { user } = useUser();
    const { setShowRecruiterLogin, companyToken, instituteToken } = useContext(AppContext);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50';
    };

    return (
        <div className="w-64 min-h-screen border-r border-gray-200 bg-white hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
            <div className="p-6 pb-2 border-b border-gray-100 flex items-center justify-center lg:justify-start">
                <img onClick={() => window.location.href = '/'} className='cursor-pointer h-8' src={assets.logo} alt="Logo" />
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Main Menu</h3>
                <nav className="flex flex-col gap-2">
                    <Link to="/" className={`px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/' ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <div className="flex items-center gap-3">
                            <Home size={20} className={location.pathname === '/' ? "text-white" : "text-gray-500"} />
                            <span>Home</span>
                        </div>
                    </Link>

                    {user && (
                        <>
                            <Link to="/applications" className={`px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/applications' ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                    <BriefcaseBusiness size={20} className={location.pathname === '/applications' ? "text-white" : "text-gray-500"} />
                                    <span>Applied Jobs</span>
                                </div>
                            </Link>
                            <Link to="/upskilling" className={`px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/upskilling' ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                    <Compass size={20} className={location.pathname === '/upskilling' ? "text-white" : "text-gray-500"} />
                                    <span>Upskilling</span>
                                </div>
                            </Link>
                            <Link to="/career-gap" className={`px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === '/career-gap' ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={20} className={location.pathname === '/career-gap' ? "text-white" : "text-gray-500"} />
                                    <span>Career Gap</span>
                                </div>
                            </Link>
                        </>
                    )}
                </nav>

                <div className="mt-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Partner Portals</h3>
                    <div className="flex flex-col gap-3">
                        
                        {/* Employer Portal */}
                        {companyToken ? (
                            <Link to="/dashboard" target="_blank" rel="noopener noreferrer" className="block w-full p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                                        <Building2 size={20} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">Employer</p>
                                        <p className="text-[11px] font-medium text-gray-500 mt-0.5">Go to Dashboard &rarr;</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <button onClick={() => setShowRecruiterLogin(true)} className="block w-full p-4 text-left rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                                        <Building2 size={20} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">Hire Talent</p>
                                        <p className="text-[11px] font-medium text-gray-500 mt-0.5">Become an Employer</p>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Institute Portal */}
                        {instituteToken ? (
                            <a href="http://localhost:5176/" target="_blank" rel="noopener noreferrer" className="block w-full p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                                        <GraduationCap size={20} className="text-green-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 leading-tight group-hover:text-green-600 transition-colors">Institute</p>
                                        <p className="text-[11px] font-medium text-gray-500 mt-0.5">Go to Dashboard &rarr;</p>
                                    </div>
                                </div>
                            </a>
                        ) : (
                            <a href="http://localhost:5176/login" target="_blank" rel="noopener noreferrer" className="block w-full p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                                        <GraduationCap size={20} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 leading-tight group-hover:text-green-600 transition-colors">Teach Skills</p>
                                        <p className="text-[11px] font-medium text-gray-500 mt-0.5">Become an Institute</p>
                                    </div>
                                </div>
                            </a>
                        )}

                    </div>
                </div>
            </div>

            {/* Bottom Promo Section */}
            <div className="p-6 mt-auto">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm transition-all duration-500 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center">
                    {/* Background Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 group-hover:bg-blue-200 transition-all duration-500"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 group-hover:bg-indigo-200 transition-all duration-500"></div>
                    
                    {/* Icon */}
                    <div className="relative z-10 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-white/80 flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                        <Compass size={26} strokeWidth={2.5} />
                    </div>
                    
                    {/* Text */}
                    <h4 className="relative z-10 font-bold text-base text-gray-800 tracking-tight group-hover:text-blue-700 transition-colors duration-300">Build Your Future</h4>
                    <p className="relative z-10 text-xs text-gray-500 mt-2 mb-5 font-medium leading-relaxed group-hover:text-gray-600 transition-colors duration-300">Better Skills, Brighter Opportunities.</p>
                    
                    {/* Action Button */}
                    <button className="relative z-10 w-10 h-10 rounded-full bg-white text-blue-600 shadow-sm border border-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md transition-all duration-300 overflow-hidden">
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSidebar;
