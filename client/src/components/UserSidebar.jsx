import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import {
    Home, BriefcaseBusiness, Compass, TrendingUp,
    Building2, GraduationCap, ArrowRight, Crown
} from 'lucide-react';

const UserSidebar = () => {
    const { user } = useUser();
    const { companyToken, instituteToken, userApplications } = useContext(AppContext);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

        const navItems = [
        { path: '/', label: 'Home', icon: Home, badge: null },
        ...(user ? [
            { path: '/applications', label: 'Applied Jobs', icon: BriefcaseBusiness, badge: userApplications ? userApplications.filter(job => job.jobId && job.companyId).length : 0, badgeType: 'count' },
            { path: '/upskilling', label: 'Upskilling', icon: Compass, badge: 'New', badgeType: 'new' },
            { path: '/career-gap', label: 'Career Gap', icon: TrendingUp, badge: null },
        ] : []),
    ];

    return (
        <div className='w-[220px] min-h-screen border-r border-gray-200 bg-white hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto'>

            {/* ── Logo ── */}
            <div className='px-5 py-5 border-b border-gray-100'>
                <img
                    onClick={() => window.location.href = '/'}
                    className='cursor-pointer h-8'
                    src={assets.logo}
                    alt='InsiderJobs'
                />
            </div>

            {/* ── Main Nav ── */}
            <div className='px-3 py-4 flex-1 overflow-y-auto'>
                <nav className='flex flex-col gap-1'>
                    {navItems.map(({ path, label, icon: Icon, badge, badgeType }) => {
                        const active = isActive(path);
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-all duration-200 group
                                    ${active
                                        ? 'bg-blue-50 text-blue-600 font-bold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className='flex items-center gap-3'>
                                    <Icon
                                        size={18}
                                        className={active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                                    />
                                    <span className='text-sm font-medium'>{label}</span>
                                </div>
                                {badge !== null && badge !== undefined && (
                                    badgeType === 'count' ? (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full leading-none
                                            ${active ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {badge}
                                        </span>
                                    ) : (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full leading-none
                                            ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {badge}
                                        </span>
                                    )
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Partner Portals ── */}
                <div className='mt-6'>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3'>
                        Partner Portals
                    </p>

                    <div className='flex flex-col gap-1.5'>
                        {/* Employer Portal */}
                        <button
                            onClick={() => {
                                if (companyToken) {
                                    window.open('/dashboard', '_blank');
                                } else {
                                    window.open('/employer-auth', '_blank');
                                }
                            }}
                            className='w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition group'
                        >
                            <div className='flex items-center gap-3'>
                                <Building2 size={18} className='text-gray-500 group-hover:text-gray-700' />
                                <span className='text-sm font-medium'>Employer</span>
                            </div>
                            <ArrowRight size={14} className='text-gray-400 group-hover:translate-x-0.5 transition-transform' />
                        </button>

                        {/* Institute Portal */}
                        {instituteToken ? (
                            <button
                                onClick={() => window.location.href = 'http://localhost:5175/'}
                                className='w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition group'
                            >
                                <div className='flex items-center gap-3'>
                                    <GraduationCap size={18} className='text-gray-500 group-hover:text-gray-700' />
                                    <span className='text-sm font-medium'>Teach Skills</span>
                                </div>
                                <ArrowRight size={14} className='text-gray-400 group-hover:translate-x-0.5 transition-transform' />
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.href = 'http://localhost:5175/login'}
                                className='w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition group'
                            >
                                <div className='flex items-center gap-3'>
                                    <GraduationCap size={18} className='text-gray-500 group-hover:text-gray-700' />
                                    <span className='text-sm font-medium'>Teach Skills</span>
                                </div>
                                <ArrowRight size={14} className='text-gray-400 group-hover:translate-x-0.5 transition-transform' />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Career Growth Widget ── */}
            <div className='p-4 mt-auto mb-2'>
                <div className='relative bg-[#F8FAFC] border border-gray-100 rounded-[20px] p-5 text-gray-800 flex flex-col items-center text-center'>
                    <div className='flex justify-center mb-4'>
                        <div className="w-12 h-12 bg-amber-100/80 rounded-full flex items-center justify-center">
                            <Crown size={22} className="text-amber-500" fill="currentColor" />
                        </div>
                    </div>

                    <h4 className='font-bold text-[14px] leading-snug mb-4 text-gray-900 px-2'>Upgrade Your Career Journey</h4>
                    
                    <ul className="flex flex-col gap-2.5 mb-5 w-full text-left">
                        <li className="flex items-start gap-2.5">
                            <div className="mt-0.5 w-[14px] h-[14px] shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span className="text-[11px] font-medium text-gray-600 leading-tight">Get personalized job matches</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <div className="mt-0.5 w-[14px] h-[14px] shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span className="text-[11px] font-medium text-gray-600 leading-tight">Track your career growth</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <div className="mt-0.5 w-[14px] h-[14px] shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span className="text-[11px] font-medium text-gray-600 leading-tight">Unlock expert insights</span>
                        </li>
                    </ul>

                    <button className='w-full bg-blue-600 text-white text-[12px] font-bold py-2.5 rounded-[12px] hover:bg-blue-700 transition-colors flex items-center justify-center gap-1'>
                        Explore More <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSidebar;
