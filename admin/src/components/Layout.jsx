import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, LogOut, Settings, Users, Building, Shield } from 'lucide-react';

const Layout = () => {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/institutes', label: 'Institute Management', icon: <Building size={20} /> },
        { path: '/employers', label: 'Employer Management', icon: <Building size={20} /> },
        { path: '/skills', label: 'AI Skills Queue', icon: <BookOpen size={20} /> },
        { path: '/admins', label: 'Government Admins', icon: <Users size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-900 text-white flex flex-col">
                <div className="p-6 border-b border-dark-800 flex items-center gap-3">
                    <div className="bg-purple-600/20 p-2 rounded-lg text-purple-400 border border-purple-500/30">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-white leading-tight text-lg">SkillSet India</h1>
                        <p className="text-[10px] font-bold text-purple-400 bg-purple-900/50 px-2 py-0.5 rounded inline-block mt-1 tracking-widest border border-purple-500/30">SUPER ADMIN</p>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 mt-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                location.pathname === item.path
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-300 hover:bg-dark-800 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg bg-dark-800">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {navItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                    </h2>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <Settings size={20} />
                    </button>
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
