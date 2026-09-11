import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, BookOpen, Users, BrainCircuit, UsersRound, Package, 
    LogOut, GraduationCap, ClipboardList, Settings as SettingsIcon, TrendingUp,
    Search, Bell, Calendar, ChevronRight, Menu, X, Sparkles, Building2,
    CheckCheck, Clock
} from 'lucide-react';

const Layout = () => {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/api/institute/notifications', {
                headers: { token: user.token }
            });
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put('/api/institute/notifications/read-all', {}, {
                headers: { token: user.token }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = async (id) => {
        try {
            await axios.put(`/api/institute/notifications/${id}/read`, {}, {
                headers: { token: user.token }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const navItems = [
        { path: '/', label: 'Operations Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/courses', label: 'Courses & Curriculum', icon: <BookOpen size={20} /> },
        { path: '/batches', label: 'Batches & Capacity', icon: <Users size={20} /> },
        { path: '/trainers', label: 'Trainers', icon: <UsersRound size={20} /> },
        { path: '/enrollments', label: 'Enrollments', icon: <ClipboardList size={20} /> },
        { path: '/placement', label: 'Placement Results', icon: <TrendingUp size={20} /> },
        { path: '/equipment', label: 'Equipment', icon: <Package size={20} /> },
        { path: '/curriculum-gap', label: 'AI Curriculum Gap', icon: <BrainCircuit size={20} /> },
        { path: '/profile', label: 'Institute Profile', icon: <Building2 size={20} /> },
        { path: '/settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity" 
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-[260px] bg-white border-r border-slate-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Brand */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between lg:justify-start gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                            <GraduationCap size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-slate-900 leading-tight text-lg tracking-tight">SkillSet India</h1>
                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Institute Portal</p>
                        </div>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <div className={`${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {item.icon}
                                </div>
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
                    {/* Premium Upgrade Card */}
                    <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 relative overflow-hidden group cursor-pointer hover:shadow-sm transition-all">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Sparkles size={40} />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-indigo-100 p-1 rounded-md text-indigo-600">
                                <Sparkles size={14} />
                            </div>
                            <h4 className="text-sm font-bold text-indigo-900">Upgrade to Premium</h4>
                        </div>
                        <p className="text-xs text-indigo-700/80 mb-2 leading-relaxed">Get advanced analytics and AI insights</p>
                        <div className="flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                            Learn more <ChevronRight size={14} />
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center justify-between mb-2 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {user?.image ? (
                                <img src={user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                    {user?.name?.charAt(0) || 'I'}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 truncate leading-tight">{user?.name}</p>
                                <p className="text-xs text-slate-500 capitalize truncate">{user?.type} Institute</p>
                            </div>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                            <Menu size={24} />
                        </button>
                        
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center relative w-full max-w-md">
                            <Search className="absolute left-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search courses, batches, trainers, or students..." 
                                className="w-full pl-10 pr-12 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm transition-all outline-none"
                            />
                            <div className="absolute right-3 flex items-center gap-1">
                                <span className="bg-white px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 border border-slate-200 shadow-sm">Ctrl</span>
                                <span className="bg-white px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 border border-slate-200 shadow-sm">K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm">
                            <Calendar size={16} />
                            <span className="font-medium">{todayDate}</span>
                        </div>
                        
                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                        
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[400px]">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            Notifications
                                            {unreadCount > 0 && (
                                                <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                            )}
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={handleMarkAllAsRead}
                                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                            >
                                                <CheckCheck size={14} /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-2">
                                        {notifications.length > 0 ? (
                                            notifications.map(notification => (
                                                <div 
                                                    key={notification._id} 
                                                    onClick={() => handleNotificationClick(notification._id)}
                                                    className={`p-3 rounded-xl mb-1 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            <Bell size={14} />
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                                                                <Clock size={10} />
                                                                {new Date(notification.date).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                                    <Bell size={20} className="text-slate-300" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                                                <p className="text-xs text-slate-400 mt-1">We'll let you know when something arrives</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="relative" ref={dropdownRef}>
                            <div 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                {user?.image ? (
                                    <img src={user.image} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-slate-200">
                                        {user?.name?.charAt(0) || 'I'}
                                    </div>
                                )}
                                <ChevronRight size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50">
                                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                                        {user?.image ? (
                                            <img src={user.image} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                                                {user?.name?.charAt(0) || 'I'}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="p-2 flex flex-col gap-1">
                                        <button 
                                            onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                                        >
                                            <Building2 size={16} /> View Profile
                                        </button>
                                        <button 
                                            onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <SettingsIcon size={16} /> Account Settings
                                        </button>
                                    </div>
                                    <div className="p-2 border-t border-slate-100">
                                        <button 
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
                    <div className="p-4 md:p-5 lg:p-6 w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
