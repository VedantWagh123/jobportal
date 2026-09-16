import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, Map, Activity, BarChart3, LogOut, Shield, 
    TrendingUp, Search, Bell, Maximize, ChevronDown, Menu, X, Settings, CheckCheck, Clock
} from 'lucide-react';

const Layout = () => {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);
    
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

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/api/state-admin/notifications', {
                headers: { token: user.token }
            });
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {}
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post('/api/state-admin/notifications/read', {}, {
                headers: { token: user.token }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {}
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const navItems = [
        { path: '/', label: 'National Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/districts', label: 'State Intelligence', icon: <Map size={20} /> },
        { path: '/simulator', label: 'What-If Simulator', icon: <Activity size={20} /> },
        { path: '/placement-insights', label: 'Placement Intelligence', icon: <TrendingUp size={20} /> },
        { path: '/reports', label: 'Reports & Insights', icon: <BarChart3 size={20} />, locked: true },
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
                
                {/* Exact Replica of SkillSet India Logo */}
                <div className="pt-6 pb-2 px-6 flex flex-col justify-center items-start shrink-0 relative">
                    <div className="flex items-center gap-2">
                        {/* Logo Icon SVG */}
                        <svg viewBox="0 0 100 100" className="w-[45px] h-[45px] shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Book Bottom */}
                            <path d="M10 85 Q 25 75 50 85 Q 75 75 90 85 L 85 92 Q 75 80 50 90 Q 25 80 15 92 Z" fill="#0B42A4" />
                            <path d="M15 80 Q 30 70 50 82 Q 70 70 85 80 L 80 85 Q 70 75 50 86 Q 30 75 20 85 Z" fill="#2563EB" />
                            
                            {/* Gear */}
                            <path d="M15 50 A 15 15 0 0 1 35 40 L 35 35 L 42 35 L 42 40 A 15 15 0 0 1 45 45 L 50 42 L 55 48 L 50 50 A 15 15 0 0 1 45 65 L 45 70 L 38 70 L 38 65 A 15 15 0 0 1 25 60 L 20 62 L 15 57 L 20 52 Z" fill="#1D4ED8" />
                            <circle cx="30" cy="53" r="8" fill="white" />
                            
                            {/* Tricolor Swooshes */}
                            <path d="M35 80 Q 55 50 85 30 Q 75 50 55 75 Z" fill="#F97316" />
                            <path d="M40 82 Q 60 55 90 35 Q 80 55 60 78 Z" fill="#16A34A" />
                            
                            {/* Person Figure */}
                            <circle cx="50" cy="30" r="6" fill="#1D4ED8" />
                            <path d="M45 40 Q 60 35 75 20 L 70 25 Q 55 45 40 55 L 45 75 L 35 75 Q 30 55 35 45 Z" fill="#0F3381" />
                            <path d="M48 42 Q 62 38 78 22 L 73 27 Q 58 48 43 58 Z" fill="#2563EB" />
                            
                            {/* Star */}
                            <path d="M78 12 L 80 18 L 86 18 L 81 22 L 83 28 L 78 24 L 73 28 L 75 22 L 70 18 L 76 18 Z" fill="#F59E0B" />
                        </svg>

                        {/* Text Logo */}
                        <div className="flex flex-col">
                            <div className="flex items-baseline">
                                <span className="text-[20px] font-black text-[#0B2757] tracking-tight leading-none">SkillSet</span>
                                <span className="text-[20px] font-black text-[#1D4ED8] tracking-tight leading-none ml-1">India</span>
                            </div>
                            <div className="text-[9px] font-bold text-[#6B7280] tracking-wider uppercase mt-1 flex flex-col">
                                State Government
                                <div className="flex gap-1 mt-1">
                                    <div className="w-4 h-0.5 bg-[#F97316] rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-[#16A34A] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 ml-1">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white rounded-lg shadow-[0px_4px_12px_rgba(59,130,246,0.18)] border border-blue-50 group cursor-default transition-all duration-300 hover:shadow-[0px_6px_16px_rgba(59,130,246,0.25)] hover:-translate-y-0.5">
                            <Shield size={12} className="text-blue-600" fill="currentColor" />
                            <span className="text-[9px] font-black text-blue-700 uppercase tracking-[0.25em] pt-[1px]">
                                State Admin
                            </span>
                        </div>
                    </div>
                    {/* Mobile Close */}
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg absolute top-6 right-4">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Navigation */}
                <nav className="relative z-10 flex-1 px-4 mt-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-32">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        
                        if (item.locked) {
                            return (
                                <div
                                    key={item.label}
                                    className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 opacity-60 cursor-not-allowed group"
                                >
                                    <span className="relative z-10">{item.icon}</span>
                                    <span className="text-[13px] relative z-10">{item.label}</span>
                                    
                                    {/* Red Hover Tooltip */}
                                    <div className="absolute left-12 top-[90%] hidden group-hover:block bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                                        Feature in progress...
                                        <div className="absolute -top-1 left-4 -translate-x-1/2 border-4 border-transparent border-b-red-600"></div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={(e) => {
                                    if (item.disabled) e.preventDefault();
                                    else setIsMobileMenuOpen(false);
                                }}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 shadow-sm border border-blue-100/50 font-bold'
                                        : item.disabled 
                                            ? 'text-gray-400 cursor-not-allowed opacity-60' 
                                            : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 font-medium'
                                }`}
                            >
                                {/* Left Indicator Line for Active State */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full shadow-sm bg-blue-600 shadow-blue-500/50"></div>
                                )}
                                <span className={`${isActive ? 'text-blue-700' : item.disabled ? 'text-gray-400' : 'text-gray-500'} relative z-10 transition-colors duration-300`}>
                                    {item.icon}
                                </span>
                                <span className={`${isActive ? 'text-blue-700' : ''} text-[13px] relative z-10 transition-colors duration-300`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Maharashtra Map Watermark Graphic */}
                <div className="absolute bottom-[80px] left-0 right-0 pointer-events-none overflow-hidden mx-4 opacity-80 flex flex-col items-center justify-end pb-4 z-0">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] grayscale">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/India_Maharashtra_locator_map.svg/300px-India_Maharashtra_locator_map.svg.png" 
                            alt="Maharashtra Map" 
                            className="w-32 h-32 object-contain drop-shadow-xl"
                        />
                    </div>
                    
                    {/* Tricolor Swoosh */}
                    <div className="w-full h-10 relative opacity-60">
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                            <path d="M0,20 Q50,0 100,20 L100,25 Q50,5 0,25 Z" fill="#FF9933" />
                            <path d="M0,25 Q50,5 100,25 L100,28 Q50,8 0,28 Z" fill="#FFFFFF" />
                            <path d="M0,28 Q50,8 100,28 L100,30 Q50,10 0,30 Z" fill="#138808" />
                        </svg>
                    </div>

                    {/* Text */}
                    <div className="text-center mt-1 z-10">
                        <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest leading-tight">{user?.stateName || 'Maharashtra'}</p>
                        <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest leading-tight">Stronger Tomorrow</p>
                    </div>
                </div>

                {/* Bottom Logout Area */}
                <div className="relative z-10 p-4 shrink-0 mt-auto bg-white/50 backdrop-blur-sm border-t border-gray-50">
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
                <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm shadow-gray-100/50 h-16">
                    
                    {/* Left: Mobile Toggle & Branding */}
                    <div className="flex items-center gap-4 flex-1">
                        <button className="lg:hidden text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={20} />
                        </button>

                        {/* Brush Stroke Flag SVG / Branding (Hidden on mobile) */}
                        <div className="hidden sm:flex items-center cursor-pointer group">
                            {/* Brush Stroke Flag SVG */}
                            <svg viewBox="0 0 120 40" className="w-[85px] h-[34px] shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform" xmlns="http://www.w3.org/2000/svg">
                                {/* Orange Stroke */}
                                <path d="M10,22 Q30,5 70,8 T110,2 Q80,15 40,24 T10,22 Z" fill="#FF9933" />
                                {/* Green Stroke */}
                                <path d="M15,38 Q40,20 80,25 T115,18 Q80,35 45,42 T15,38 Z" fill="#138808" />
                                {/* Ashoka Chakra */}
                                <g transform="translate(60, 20) scale(0.65)">
                                    <circle cx="0" cy="0" r="8" fill="none" stroke="#000080" strokeWidth="1.5"/>
                                    <circle cx="0" cy="0" r="1.5" fill="#000080"/>
                                    {[...Array(12)].map((_, i) => (
                                        <line key={i} x1="0" y1="0" x2="0" y2="-8" stroke="#000080" strokeWidth="0.5" transform={`rotate(${i * 30})`} />
                                    ))}
                                </g>
                            </svg>
                            <div className="flex flex-col ml-3">
                                <span className="text-[14px] font-black text-[#0B2757] leading-tight tracking-tight">{user?.stateName || 'Maharashtra'}</span>
                                <span className="text-[14px] font-black text-[#0B2757] leading-tight tracking-tight">State Portal</span>
                            </div>
                        </div>
                        
                        
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
                            {/* Notifications */}
                            <div className="relative" ref={notifRef}>
                                <button 
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                                    )}
                                </button>
                                {isNotifOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 origin-top-right animate-in fade-in zoom-in duration-200">
                                        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={handleMarkAllAsRead} className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(notification => (
                                                    <div 
                                                        key={notification._id} 
                                                        className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                                notification.type === 'System_Alert' ? 'bg-amber-100 text-amber-600' :
                                                                notification.type === 'Placement_Update' ? 'bg-emerald-100 text-emerald-600' :
                                                                'bg-blue-100 text-blue-600'
                                                            }`}>
                                                                {notification.type === 'System_Alert' ? <Settings size={14} /> :
                                                                 notification.type === 'Placement_Update' ? <TrendingUp size={14} /> :
                                                                 <Bell size={14} />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start gap-2 mb-0.5">
                                                                    <p className="text-[13px] font-bold text-slate-900 truncate">{notification.title}</p>
                                                                    {!notification.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1"></span>}
                                                                </div>
                                                                <p className="text-[12px] text-slate-500 leading-tight line-clamp-2">{notification.message}</p>
                                                                <p className="text-[10px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {new Date(notification.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 px-4 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 mx-auto flex items-center justify-center mb-2">
                                                        <CheckCheck size={24} />
                                                    </div>
                                                    <p className="text-[13px] font-medium text-slate-500">All caught up!</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">No new notifications</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={toggleFullscreen} className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <Maximize size={18} />
                            </button>
                        </div>

                        {/* Profile Dropdown (Visual only for now) */}
                        <div className="flex items-center gap-3 cursor-pointer group">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover shadow-sm shadow-blue-200" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-[#1e40af] text-white flex items-center justify-center font-bold text-[14px] shadow-sm shadow-blue-200">
                                    {user?.name?.charAt(0) || 'G'}
                                </div>
                            )}
                            <div className="hidden md:block text-right">
                                <p className="text-[13px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{user?.name || `${user?.stateName || 'State'} Government`}</p>
                                <p className="text-[11px] font-medium text-gray-500 capitalize">{user?.scope || 'State'} Administrator</p>
                            </div>
                            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-[#F4F7FC]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
