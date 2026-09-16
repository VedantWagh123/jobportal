import { useContext, useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import {
  Bell, Settings, LogOut, Home, Briefcase, FileText, Users,
  BarChart2, MessageSquare, CreditCard, HelpCircle, Search,
  ChevronDown, Menu, X, Zap, Star, UserCircle, ChevronRight,
  Globe, Link2, ExternalLink, Share2, Crown, CheckCircle2, Clock
} from 'lucide-react'

const navMain = [
  { label: 'Overview', icon: Home, to: '/dashboard', end: true },
  { label: 'Manage Jobs', icon: Briefcase, to: '/dashboard/manage-jobs' },
  { label: 'Applications', icon: FileText, to: '/dashboard/view-applications', badge: 'apps' },
  { label: 'Candidates', icon: Users, to: '/dashboard/candidates' },
]
const navInsights = [
  { label: 'Analytics', icon: BarChart2, to: '/dashboard/analytics' },
  { label: 'Messages', icon: MessageSquare, to: '#', badge: 3 },
]
const navSettings = [
  { label: 'Company Profile', icon: Settings, to: '/dashboard/profile' },
  { label: 'Team Members', icon: Users, to: '#' },
  { label: 'Billing', icon: CreditCard, to: '#' },
  { label: 'Help & Support', icon: HelpCircle, to: '#' },
]

const SidebarLink = ({ item, onClick }) => {
  const isDummy = item.to === '#'
  const baseClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group w-full'
  
  if (isDummy) {
    return (
      <div 
        title="Feature Not Available Yet"
        className={`${baseClass} text-gray-500 hover:bg-red-50 hover:text-red-600 cursor-not-allowed`}
      >
        <item.icon size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
        <span className="flex-1">{item.label}</span>
        {typeof item.badge === 'number' && (
          <span className="bg-gray-300 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 group-hover:bg-red-400 transition-colors">
            {item.badge}
          </span>
        )}
      </div>
    )
  }

  const activeClass = 'bg-[#EFF4FF] text-blue-600 font-bold'
  const inactiveClass = 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
    >
      {({ isActive }) => (
        <>
          <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
          <span className="flex-1">{item.label}</span>
          {typeof item.badge === 'number' && (
            <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

const SidebarContent = ({ companyData, unreadCount, logout, onClose }) => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo & Tagline */}
      <div className="px-5 py-6 flex flex-col shrink-0 relative border-b border-gray-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img className="h-7 hover:opacity-90 transition-opacity" src={assets.logo} alt="InsiderJobs" />
        </div>
        <p className="text-[10.5px] font-bold text-gray-400 mt-1.5 pl-1">Hire Smarter. Grow Faster.</p>
        
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-3">Main Menu</p>
          <div className="space-y-0.5">
            {navMain.map(item => (
              <SidebarLink key={item.label} item={item} onClick={onClose} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-3">Insights</p>
          <div className="space-y-0.5">
            {navInsights.map(item => (
              <SidebarLink key={item.label} item={item} onClick={onClose} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-3">Settings</p>
          <div className="space-y-0.5">
            {navSettings.map(item => (
              <SidebarLink key={item.label} item={item} onClick={onClose} />
            ))}
            <button
              onClick={() => { logout(); onClose?.(); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={18} className="text-red-400" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Card */}
      <div className="px-3 pb-5 shrink-0 mt-auto">
        <div className="bg-[#F7F9FC] border border-[#E8ECF4] rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Crown size={14} className="text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-sm">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] font-medium text-gray-500 leading-relaxed mb-3">
            Get advanced analytics and more features.
          </p>
          <button className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[12px] font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5">
            Upgrade Now <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { companyData, setCompanyData, setCompanyToken, backendUrl, companyToken } = useContext(AppContext)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  
  // Search state & refs
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (companyToken) {
      axios.get(backendUrl + '/api/company/notifications', { headers: { token: companyToken } })
        .then(res => {
          if (res.data.success) {
            setNotifications(res.data.notifications)
            setUnreadCount(res.data.notifications.filter(n => !n.isRead).length)
          }
        }).catch(() => {})
    }
  }, [companyToken, backendUrl])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle Ctrl+K shortcut for Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/dashboard/manage-jobs?search=${encodeURIComponent(searchQuery.trim())}`)
      searchInputRef.current?.blur()
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post(backendUrl + '/api/company/notifications/read', {}, { headers: { token: companyToken } })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {}
  }

  const logout = () => {
    setCompanyToken(null)
    localStorage.removeItem('companyToken')
    setCompanyData(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col">

      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-4 px-4 lg:px-6 h-[60px]">

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden sm:flex items-center ml-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search jobs, candidates, or anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border border-[#E8ECF4] rounded-full text-[13px] text-gray-700 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all shadow-sm"
              />
            </form>
          </div>

          {/* Right Side */}
          <div className="ml-auto flex items-center gap-2">
            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Bell size={20} />
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
                                          notification.type === 'New_Application' ? 'bg-emerald-100 text-emerald-600' :
                                          notification.type === 'System_Alert' ? 'bg-amber-100 text-amber-600' :
                                          'bg-blue-100 text-blue-600'
                                      }`}>
                                          {notification.type === 'System_Alert' ? <Settings size={14} /> :
                                           notification.type === 'New_Application' ? <FileText size={14} /> :
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
                                  <CheckCircle2 size={24} />
                              </div>
                              <p className="text-[13px] font-medium text-slate-500">All caught up!</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">No new notifications</p>
                          </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Company Profile */}
            {companyData && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <img
                    src={companyData.image}
                    alt={companyData.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-bold text-gray-800">{companyData.name}</span>
                    <span className="text-[11px] text-gray-400 font-medium">Recruiter</span>
                  </div>
                  <ChevronDown size={15} className={`text-gray-400 transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                      <img src={companyData.image} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div>
                        <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">{companyData.name}</p>
                        <p className="text-[11px] text-gray-400">Recruiter</p>
                      </div>
                    </div>
                    <button onClick={() => { navigate('/dashboard/profile'); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      <Settings size={16} className="text-gray-400" /> Company Profile
                    </button>
                    <div className="border-t border-gray-50 mt-1">
                      <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} className="text-red-400" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[220px] xl:w-[240px] shrink-0 bg-white border-r border-gray-100 flex-col sticky top-[60px] h-[calc(100vh-60px)] overflow-hidden shadow-sm">
          <SidebarContent companyData={companyData} unreadCount={unreadCount} logout={logout} />
        </aside>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
            <div className="relative w-[260px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-left z-50">
              <SidebarContent
                companyData={companyData}
                unreadCount={unreadCount}
                logout={logout}
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 p-3 sm:p-5 lg:p-6 overflow-auto">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 px-6 py-4 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={assets.logo} alt="InsiderJobs" className="h-6 opacity-80" />
                <span className="text-[12px] text-gray-400 font-medium">Connecting Talent with Opportunities</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="flex items-center gap-4 text-[12px] text-gray-400">
                  <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
                  <span className="text-gray-200">|</span>
                  <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
                  <span className="text-gray-200">|</span>
                  <a href="#" className="hover:text-gray-600 transition-colors">Contact</a>
                </div>
                <div className="flex items-center gap-2">
                  {[Globe, Link2, Share2, ExternalLink].map((Icon, i) => (
                    <a key={i} href="#" className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-400 flex items-center justify-center transition-colors border border-gray-100">
                      <Icon size={13} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-lg font-bold z-50 transition-all hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40">
        ?
      </button>

      <style>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 0.25s ease-out; }
      `}</style>
    </div>
  )
}

export default Dashboard