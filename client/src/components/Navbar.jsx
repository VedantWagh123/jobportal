import { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useSocket } from '../context/SocketContext'
import axios from 'axios'
import {
    Bell, ChevronDown, User as UserIcon, Settings,
    HelpCircle, LogOut, Search, Bookmark, Sun, Briefcase,
    Building2, GraduationCap, TrendingUp, LayoutGrid, Lightbulb,
    Command, CheckCircle2
} from 'lucide-react'



const Navbar = () => {
    const { openSignIn, signOut } = useClerk()
    const { user, isLoaded } = useUser()
    const navigate = useNavigate()
    const location = useLocation()
    const { userData, setIsProfileModalOpen, setIsViewProfileModalOpen, searchFilter, setSearchFilter, setIsSearched, savedJobs } = useContext(AppContext)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [localSearch, setLocalSearch] = useState('')
    const dropdownRef = useRef(null)
    const notifRef = useRef(null)
    const searchRef = useRef(null)
    const { getToken } = useAuth()
    const { backendUrl } = useContext(AppContext)
    const { socket } = useSocket()

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/users/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }

    const markNotificationsAsRead = async () => {
        try {
            const token = await getToken();
            await axios.put(`${backendUrl}/api/users/notifications/mark-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    }

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user])

    useEffect(() => {
        if (socket && user) {
            const handleNotif = (data) => {
                if (data.userId === user.id) {
                    fetchNotifications();
                }
            };
            socket.on('candidate_notification', handleNotif);
            return () => socket.off('candidate_notification', handleNotif);
        }
    }, [socket, user])

    useEffect(() => {
        setLocalSearch(searchFilter.title || '')
    }, [searchFilter.title])

    const handleSearch = (e) => {
        e.preventDefault()
        setSearchFilter({ title: localSearch, location: searchFilter.location || '' })
        setIsSearched(true)
        if (location.pathname !== '/') navigate('/')
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotificationsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Keyboard shortcut: Ctrl/Cmd + K opens search
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                searchRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    return (
        <div className='bg-white border-b border-gray-100 py-3 sticky top-0 z-40 shadow-[0_1px_10px_rgba(0,0,0,0.05)]'>
            <div className='px-4 lg:px-6 flex items-center gap-3'>

                {/* ── Dynamic Greeting ── */}
                <div className="hidden lg:flex items-center flex-1">
                    <div className="flex items-center gap-3 pl-4 border-l-[3px] border-blue-600/20 rounded-sm py-0.5">
                        <p className="text-sm font-medium text-gray-500">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold tracking-tight">
                                {user ? `Welcome back, ${user.firstName || user.fullName?.split(' ')[0]}!` : 'Ready for your next big move?'}
                            </span> 
                        </p>
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-px">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions Navigation (Center) ── */}
                <div className="hidden md:flex items-center justify-center flex-1 gap-2 xl:gap-4 mx-2">
                    
                    {/* Action: Find Jobs */}
                    <Link to="/" className="group flex items-center gap-2.5 px-2 lg:px-3 py-1.5 bg-white border border-gray-100 rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)] hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer" title="Find Jobs">
                        <div className="p-1.5 rounded-[8px] bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-200">
                            <Search size={16} strokeWidth={2.5} />
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <span className="text-[13px] font-bold text-gray-700 leading-tight group-hover:text-blue-700">Find Jobs</span>
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide leading-none mt-0.5">Explore</span>
                        </div>
                    </Link>

                    {/* Action: Upskill */}
                    <Link to="/upskilling" className="group flex items-center gap-2.5 px-2 lg:px-3 py-1.5 bg-white border border-gray-100 rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(16,185,129,0.08)] hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer" title="Upskill">
                        <div className="p-1.5 rounded-[8px] bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                            <GraduationCap size={16} strokeWidth={2.5} />
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <span className="text-[13px] font-bold text-gray-700 leading-tight group-hover:text-emerald-700">Upskill</span>
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide leading-none mt-0.5">Learn</span>
                        </div>
                    </Link>

                    {/* Action: Career Tools */}
                    <div className="group flex items-center gap-2.5 px-2 lg:px-3 py-1.5 bg-white border border-gray-100 rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(139,92,246,0.08)] hover:border-violet-100 hover:bg-violet-50/30 transition-all duration-200 cursor-pointer" title="Career Tools">
                        <div className="p-1.5 rounded-[8px] bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform duration-200">
                            <Briefcase size={16} strokeWidth={2.5} />
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <span className="text-[13px] font-bold text-gray-700 leading-tight group-hover:text-violet-700">Career Tools</span>
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide leading-none mt-0.5">Grow</span>
                        </div>
                    </div>

                    {/* Action: Insights */}
                    <div className="group flex items-center gap-2.5 px-2 lg:px-3 py-1.5 bg-white border border-gray-100 rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.08)] hover:border-amber-100 hover:bg-amber-50/30 transition-all duration-200 cursor-pointer" title="Insights">
                        <div className="p-1.5 rounded-[8px] bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform duration-200">
                            <TrendingUp size={16} strokeWidth={2.5} />
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <span className="text-[13px] font-bold text-gray-700 leading-tight group-hover:text-amber-700">Insights</span>
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide leading-none mt-0.5">Analyze</span>
                        </div>
                    </div>

                </div>

                {/* ── Right Side Auth ── */}
                <div className='ml-auto flex items-center gap-2'>
                    {user ? (
                        <div className='flex items-center gap-2 relative' ref={dropdownRef}>

                            {/* Wishlist / Saved Jobs */}
                            <button 
                                onClick={() => navigate('/saved-jobs')}
                                className='relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition' 
                                title='Saved Jobs'
                            >
                                <Bookmark size={18} />
                                {savedJobs && savedJobs.length > 0 && (
                                    <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 border-2 border-white rounded-full'></span>
                                )}
                            </button>

                            {/* Bell */}
                            <div className='relative' ref={notifRef}>
                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(!isNotificationsOpen)
                                        if (!isNotificationsOpen) {
                                            markNotificationsAsRead();
                                        }
                                    }}
                                    className='relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition'
                                    title='Notifications'
                                >
                                    <Bell size={18} />
                                    {notifications.some(n => !n.isRead) && (
                                        <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full'></span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {isNotificationsOpen && (
                                    <div className='absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[400px]'>
                                        <div className='p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center'>
                                            <h3 className='font-bold text-gray-800 text-sm'>Notifications</h3>
                                        </div>
                                        <div className='overflow-y-auto flex-1'>
                                            {notifications.length === 0 ? (
                                                <div className='p-8 text-center text-gray-500 text-sm'>No new notifications</div>
                                            ) : (
                                                notifications.map((notif, index) => (
                                                    <div key={index} onClick={() => { if(notif.link) navigate(notif.link); setIsNotificationsOpen(false); }} className={`p-4 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition ${notif.isRead ? 'opacity-75' : 'bg-white'}`}>
                                                        <div className='flex items-start gap-3'>
                                                            <div className={`p-2 rounded-full mt-1 ${notif.type === 'Job_Status' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                <Bell size={14} />
                                                            </div>
                                                            <div>
                                                                <p className='text-sm font-semibold text-gray-800 leading-tight'>{notif.title}</p>
                                                                <p className='text-xs text-gray-600 mt-1 leading-relaxed'>{notif.message}</p>
                                                                <p className='text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider'>{new Date(notif.date).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='w-px h-6 bg-gray-200'></div>

                            {/* Profile Trigger */}
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className='flex items-center gap-2.5 cursor-pointer py-1.5 px-2 pr-3 rounded-xl hover:bg-gray-50 transition'
                            >
                                {userData?.image || user.imageUrl ? (
                                    <img src={userData?.image || user.imageUrl} alt='Profile' className='w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-200' />
                                ) : (
                                    <div className='w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm'>
                                        {user.fullName?.[0] || <UserIcon size={16} />}
                                    </div>
                                )}
                                <div className='hidden md:block text-left'>
                                    <p className='text-sm font-bold text-gray-800 leading-tight'>{user.fullName}</p>
                                    <p className='text-[11px] font-medium text-gray-500'>Candidate</p>
                                </div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform hidden md:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown */}
                            {isDropdownOpen && (
                                <div className='absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50'>
                                    <div className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-3'>
                                        {userData?.image || user.imageUrl ? (
                                            <img src={userData?.image || user.imageUrl} alt='Profile' className='w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm' />
                                        ) : (
                                            <div className='w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0'>
                                                {user.fullName?.[0] || <UserIcon size={20} />}
                                            </div>
                                        )}
                                        <div className='overflow-hidden'>
                                            <p className='text-sm font-bold text-gray-800 truncate'>{user.fullName}</p>
                                            <p className='text-xs text-gray-500 truncate'>{user.primaryEmailAddress?.emailAddress}</p>
                                        </div>
                                    </div>

                                    <div className='p-2 flex flex-col gap-0.5'>
                                        <button onClick={() => { setIsViewProfileModalOpen(true); setIsDropdownOpen(false) }} className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition'>
                                            <UserIcon size={16} className='text-gray-400' /> View Profile
                                        </button>
                                        <button onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false) }} className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition'>
                                            <Settings size={16} className='text-gray-400' /> Account Settings
                                        </button>
                                        <button className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition'>
                                            <HelpCircle size={16} className='text-gray-400' /> Help &amp; Support
                                        </button>
                                    </div>

                                    <div className='p-2 border-t border-gray-100'>
                                        <button onClick={() => signOut()} className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition'>
                                            <LogOut size={16} className='text-red-500' /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : isLoaded ? (
                        <button onClick={() => openSignIn()} className='bg-blue-600 text-white px-5 py-2 text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md'>
                            Candidate Login
                        </button>
                    ) : (
                        <div className='flex items-center gap-3 animate-pulse'>
                            <div className='w-9 h-9 rounded-full bg-gray-200'></div>
                            <div className='hidden md:flex flex-col gap-1.5'>
                                <div className='w-24 h-3 bg-gray-200 rounded-full'></div>
                                <div className='w-16 h-2.5 bg-gray-100 rounded-full'></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Navbar