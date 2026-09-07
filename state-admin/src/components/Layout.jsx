import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Map, Activity, BarChart3, LogOut, Shield, TrendingUp } from 'lucide-react';

const Layout = () => {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'National Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/districts', label: 'District Intelligence', icon: <Map size={20} /> },
        { path: '/simulator', label: 'What-If Simulator', icon: <Activity size={20} /> },
        { path: '/placement-insights', label: 'Placement Intelligence', icon: <TrendingUp size={20} /> },
        { path: '/reports', label: 'Reports & Insights', icon: <BarChart3 size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 relative">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 border border-blue-200">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">SkillSet India</h1>
                        <p className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1 tracking-widest border border-blue-200">STATE GOVT PORTAL</p>
                    </div>
                </div>
                
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                location.pathname === item.path
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.scope} Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
