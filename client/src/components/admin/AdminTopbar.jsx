import React, { useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { Search, Calendar, Bell, X } from 'lucide-react';

const AdminTopbar = () => {
    const { adminData, logoutAdmin } = useContext(AdminContext);

    return (
        <header className="bg-white border-b border-gray-100 h-[72px] flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center md:hidden">
                <span className="font-bold text-[#1a233a] text-lg">GOV-ADMIN</span>
            </div>
            
            <div className="hidden md:flex flex-1 items-center max-w-md">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search districts, skills, or industry..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 bg-white shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">01 Jan 2025 - 04 Sep 2026</span>
                </div>

                <div className="relative cursor-pointer">
                    <Bell className="w-5 h-5 text-gray-500 hover:text-gray-700 transition" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </div>

                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
                        A
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">Active Admin</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">NATIONAL SCOPE</p>
                    </div>
                    <button 
                        onClick={logoutAdmin}
                        className="ml-2 w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors shadow-md"
                        title="Logout"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;
