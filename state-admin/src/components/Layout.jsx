import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, Map, Activity, BarChart3, LogOut, Shield, 
    TrendingUp, Search, Bell, Maximize, ChevronDown, Menu, X
} from 'lucide-react';

const Layout = () => {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Add global ctrl+k listener for search focus
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('global-search')?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const navItems = [
        { path: '/', label: 'National Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/districts', label: 'State Intelligence', icon: <Map size={20} /> },
        { path: '/simulator', label: 'What-If Simulator', icon: <Activity size={20} /> },
        { path: '/placement-insights', label: 'Placement Intelligence', icon: <TrendingUp size={20} /> },
        { path: '/reports', label: 'Reports & Insights', icon: <BarChart3 size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[#F4F7FC] overflow-hidden font-sans text-gray-900">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                
                {/* Brand Area */}
                <div className="h-16 px-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-[#1e40af] text-white flex items-center justify-center shadow-md">
                            <Shield size={18} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-black text-gray-900 text-sm tracking-tight">SkillSet India</h1>
                            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">State Govt Portal</p>
                        </div>
                    </div>
                    <button className="lg:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 group relative overflow-hidden ${
                                    isActive
                                        ? 'text-blue-700 bg-blue-50/80 shadow-[inset_3px_0_0_0_#2563eb]'
                                        : 'text-gray-500 hover:bg-gray-50/80 hover:text-gray-900'
                                }`}
                            >
                                <div className={`${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 group-hover:text-gray-600'} transition-all duration-300`}>
                                    {item.icon}
                                </div>
                                <span className="relative z-10">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Logout Area */}
                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                    >
                        <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                        Secure Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* Global Topbar */}
                <header className="h-16 glass-header border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30">
                    
                    {/* Left: Mobile Toggle & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <button className="lg:hidden text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={20} />
                        </button>
                        
                        <div className="hidden sm:flex items-center w-full max-w-md relative group">
                            <Search size={16} className="absolute left-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                id="global-search"
                                type="text" 
                                placeholder="Search skills, states, industries, or insights..." 
                                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-blue-200 focus:ring-4 focus:ring-blue-50 pl-10 pr-16 py-2 rounded-xl text-[13px] font-medium text-gray-800 placeholder-gray-400 transition-all outline-none"
                            />
                            <div className="absolute right-3 flex items-center gap-1 opacity-60">
                                <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded shadow-sm">Ctrl</span>
                                <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded shadow-sm">K</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions & Profile */}
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                        
                        <div className="flex items-center gap-1 sm:gap-2 border-r border-gray-200 pr-3 sm:pr-5">
                            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                            </button>
                            <button onClick={toggleFullscreen} className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <Maximize size={18} />
                            </button>
                        </div>

                        {/* Profile Dropdown (Visual only for now) */}
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-9 h-9 rounded-full bg-[#1e40af] text-white flex items-center justify-center font-bold text-[14px] shadow-sm shadow-blue-200">
                                {user?.name?.charAt(0) || 'G'}
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-[13px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{user?.name || 'Government of Maharashtra'}</p>
                                <p className="text-[11px] font-medium text-gray-500 capitalize">{user?.scope || 'State'} Administrator</p>
                            </div>
                            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
