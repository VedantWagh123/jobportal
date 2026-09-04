import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { AppContext } from '../context/AppContext';

const UserSidebar = () => {
    const { user } = useUser();
    const { setShowRecruiterLogin, companyToken } = useContext(AppContext);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50';
    };

    return (
        <div className="w-64 min-h-screen border-r border-gray-200 bg-white hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
            <div className="p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Main Menu</h3>
                <nav className="flex flex-col gap-2">
                    <Link to="/" className={`px-4 py-3 rounded-l-lg transition ${isActive('/')}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🏠</span>
                            <span>Home</span>
                        </div>
                    </Link>

                    {user && (
                        <Link to="/applications" className={`px-4 py-3 rounded-l-lg transition ${isActive('/applications')}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-lg">💼</span>
                                <span>Applied Jobs</span>
                            </div>
                        </Link>
                    )}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Portals</h3>
                <nav className="flex flex-col gap-2">
                    <Link to="/government-admin" target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🏛️</span>
                            <span>Govt Admin</span>
                        </div>
                    </Link>
                    
                    {companyToken ? (
                        <Link to="/dashboard" target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🏢</span>
                                <span>Employer Dashboard</span>
                            </div>
                        </Link>
                    ) : (
                        <button onClick={() => setShowRecruiterLogin(true)} className="px-4 py-3 w-full text-left rounded-lg text-gray-600 hover:bg-gray-50 transition">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🏢</span>
                                <span>Employer Login</span>
                            </div>
                        </button>
                    )}
                </nav>
            </div>
        </div>
    );
};

export default UserSidebar;
