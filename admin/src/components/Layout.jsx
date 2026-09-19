import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, BookOpen, LogOut, Settings, Users, 
    Building, Shield, Search, Bell, Maximize, ChevronDown, BarChart2, Menu, X, CheckCheck, Clock
} from 'lucide-react';
import SmartAssistantModal from './SmartAssistantModal';

const Layout = () => {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);
    
    // Dynamic Theme Logic
    const [themeIndex, setThemeIndex] = useState(0);
    const [currentPath, setCurrentPath] = useState(location.pathname);

    useEffect(() => {
        if (location.pathname !== currentPath) {
            setThemeIndex(prev => (prev + 1) % 3);
            setCurrentPath(location.pathname);
        }
    }, [location.pathname, currentPath]);

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/api/super-admin/notifications', {
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
            await axios.post('/api/super-admin/notifications/read', {}, {
                headers: { token: user.token }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {}
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const activeThemes = [
        {
            // 0: Light Orange
            container: 'bg-gradient-to-r from-orange-50 to-amber-50/50 shadow-sm border border-orange-200/50 font-bold',
            indicator: 'bg-orange-500 shadow-orange-500/50',
            text: 'text-orange-600'
        },
        {
            // 1: Light White with Shadow
            container: 'bg-white shadow-md border border-gray-100 font-bold',
            indicator: 'bg-blue-600 shadow-blue-600/50',
            text: 'text-blue-700'
        },
        {
            // 2: Green
            container: 'bg-gradient-to-r from-emerald-50 to-green-50/50 shadow-sm border border-emerald-200/50 font-bold',
            indicator: 'bg-emerald-500 shadow-emerald-500/50',
            text: 'text-emerald-700'
        }
    ];

    const currentTheme = activeThemes[themeIndex];

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/institutes', label: 'Institute Management', icon: <Building size={18} /> },
        { path: '/employers', label: 'Employer Management', icon: <Building size={18} /> },
        { path: '/users', label: 'Candidates / Users', icon: <Users size={18} /> },
        { path: '/skills', label: 'AI Skills Queue', icon: <BookOpen size={18} /> },
        { path: '/admins', label: 'Government Admins', icon: <Users size={18} /> },
        { path: '/reports', label: 'Reports & Analytics', icon: <BarChart2 size={18} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
    ];

    return (
        <div className="flex h-screen bg-[#F4F7FE] font-sans text-gray-900 overflow-hidden">
            
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static top-0 left-0 h-full w-[260px] bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
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
                                Building India's Workforce
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
                                Super Admin
                            </span>
                        </div>
                    </div>
                    {/* Mobile Close */}
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Navigation */}
                <nav className="relative z-10 flex-1 px-4 mt-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-32">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={(e) => {
                                    if (item.disabled) e.preventDefault();
                                    else setSidebarOpen(false);
                                }}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? currentTheme.container
                                        : item.disabled 
                                            ? 'text-gray-400 cursor-not-allowed opacity-60' 
                                            : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 font-medium'
                                }`}
                            >
                                {/* Left Indicator Line for Active State */}
                                {isActive && (
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full shadow-sm ${currentTheme.indicator}`}></div>
                                )}
                                <span className={`${isActive ? currentTheme.text : item.disabled ? 'text-gray-400' : 'text-gray-500'} relative z-10 transition-colors duration-300`}>
                                    {item.icon}
                                </span>
                                <span className={`${isActive ? currentTheme.text : ''} text-[13px] relative z-10 transition-colors duration-300`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* India Map Watermark Graphic (Absolute Positioned so it doesn't push Settings out) */}
                <div className="absolute bottom-[150px] left-0 right-0 pointer-events-none overflow-hidden mx-4 opacity-80 flex flex-col items-center justify-end pb-4 z-0">
                    {/* SVG Map of India */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] grayscale">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/India_blank_map.svg/200px-India_blank_map.svg.png" 
                            alt="India Map" 
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
                        <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest leading-tight">Skilled India</p>
                        <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest leading-tight">Stronger Tomorrow</p>
                    </div>
                </div>

                {/* Bottom Profile Area */}
                <div className="relative z-10 p-4 shrink-0 mt-auto bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0 overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || 'S'
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[13px] font-bold text-gray-900 truncate leading-tight">{user?.name || 'System Administrator'}</p>
                            <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">{user?.email || 'admin@platform.gov'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={16} className="text-gray-400" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F7FE]">
                
                {/* Top Header */}
                <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm shadow-gray-100/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Menu size={20} />
                        </button>
                        
                        {/* Logo / Title Area (Matches Reference) */}
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
                                <span className="text-[14px] font-black text-[#0B2757] leading-tight tracking-tight">Skilled India</span>
                                <span className="text-[14px] font-black text-[#0B2757] leading-tight tracking-tight">Stronger Tomorrow</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 lg:gap-5 pr-2">
                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2 text-[#7f8ba3] hover:text-[#0B2757] hover:bg-gray-50 rounded-full relative transition-all"
                            >
                                <Bell size={20} strokeWidth={2.2} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-[15px] h-[15px] bg-[#f43f5e] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-[2px] border-white leading-none">{unreadCount}</span>
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
                                                            'bg-blue-100 text-blue-600'
                                                        }`}>
                                                            {notification.type === 'System_Alert' ? <Settings size={14} /> :
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
                        <button className="hidden sm:block p-2 text-[#7f8ba3] hover:text-[#0B2757] hover:bg-gray-50 rounded-full transition-all">
                            <Maximize size={20} strokeWidth={2.2} />
                        </button>
                        
                        {/* Divider */}
                        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>
                        
                        {/* Profile Area */}
                        <div className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shadow-sm relative overflow-visible">
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="https://ui-avatars.com/api/?name=govt+admin&background=000&color=fff&bold=true" alt="Avatar" className="w-full h-full object-cover"/>
                                    )}
                                </div>
                                {/* Active Green Dot */}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-[2px] border-white rounded-full z-10 translate-x-[1px] translate-y-[1px]"></span>
                            </div>
                            <div className="hidden lg:flex flex-col justify-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-black text-[#0B2757] leading-none tracking-tight">govt admin</span>
                                    <ChevronDown size={14} className="text-[#a1aabf] group-hover:text-[#0B2757] transition-colors" strokeWidth={2.5} />
                                </div>
                                <span className="text-[12px] font-semibold text-[#8b98b4] leading-tight mt-1">National Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <Outlet />
                </div>
            </main>

            {/* Smart AI Assistant Modal */}
            <SmartAssistantModal />
        </div>
    );
};

export default Layout;
