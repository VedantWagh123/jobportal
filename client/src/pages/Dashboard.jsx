import { useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { Bell, User, Users, BarChart2, Briefcase, FileText, Settings, LogOut, Home } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {

    const navigate = useNavigate()

    const { companyData, setCompanyData, setCompanyToken, backendUrl, companyToken } = useContext(AppContext)
    const [unreadCount, setUnreadCount] = useState(0)

    // Fetch Notifications to get unread count
    useEffect(() => {
        if (companyToken) {
            axios.get(backendUrl + '/api/company/notifications', { headers: { token: companyToken } })
                .then(res => {
                    if (res.data.success) {
                        const unread = res.data.notifications.filter(n => !n.isRead).length;
                        setUnreadCount(unread);
                    }
                }).catch(err => console.log(err));
        }
    }, [companyToken, backendUrl])

    // Function to logout for company
    const logout = () => {
        setCompanyToken(null)
        localStorage.removeItem('companyToken')
        setCompanyData(null)
        navigate('/')
    }

    return (
        <div className='min-h-screen bg-gray-50/50'>

            {/* Navbar for Recuriter Panel */}
            <div className='bg-white shadow-sm border-b border-gray-100 py-3 sticky top-0 z-40'>
                <div className='px-5 flex justify-between items-center max-w-7xl mx-auto'>
                    <img onClick={e => navigate('/')} className='max-sm:w-32 cursor-pointer' src={assets.logo} alt="Logo" />
                    {companyData && (
                        <div className='flex items-center gap-5'>
                            <button onClick={() => navigate('/dashboard/notifications')} className='relative text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50'>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                            </button>
                            <div className='h-8 w-px bg-gray-200'></div>
                            <div className='flex items-center gap-3 relative group cursor-pointer'>
                                <div className='flex flex-col items-end max-sm:hidden'>
                                    <p className='text-sm font-semibold text-gray-800'>{companyData.name}</p>
                                    <p className='text-xs text-gray-500'>Recruiter</p>
                                </div>
                                <img className='w-10 h-10 border-2 border-white shadow-sm rounded-full object-cover' src={companyData.image} alt="Profile" />
                                
                                {/* Dropdown Profile Menu */}
                                <div className='absolute hidden group-hover:block top-full right-0 pt-2 z-50 w-48'>
                                    <div className='bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden'>
                                        <div className='px-4 py-2 border-b border-gray-50 mb-1 max-sm:block hidden'>
                                            <p className='text-sm font-semibold text-gray-800 truncate'>{companyData.name}</p>
                                        </div>
                                        <div onClick={() => navigate('/dashboard/profile')} className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors'>
                                            <Settings size={16} /> Company Profile
                                        </div>
                                        <div onClick={logout} className='flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors mt-1 border-t border-gray-50'>
                                            <LogOut size={16} /> Logout
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='flex items-start max-w-7xl mx-auto'>

                {/* Left Sidebar */}
                <div className='inline-block min-h-[calc(100vh-73px)] w-64 border-r border-gray-200 bg-white shadow-sm z-30 max-md:w-16 transition-all duration-300'>
                    <ul className='flex flex-col items-start pt-6 text-gray-600 font-medium pb-8 gap-1 px-3'>
                        
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-3 max-md:hidden mt-2'>Main Menu</p>
                        
                        <NavLink className={({ isActive }) => `flex items-center p-3 sm:px-4 gap-3 w-full rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold [&>svg]:text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900 [&>svg]:text-gray-400'}`} to={'/dashboard'} end>
                            <Home size={20} />
                            <p className='max-md:hidden'>Overview</p>
                        </NavLink>
                        
                        <NavLink className={({ isActive }) => `flex items-center p-3 sm:px-4 gap-3 w-full rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold [&>svg]:text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900 [&>svg]:text-gray-400'}`} to={'/dashboard/manage-jobs'}>
                            <Briefcase size={20} />
                            <p className='max-md:hidden'>Manage Jobs</p>
                        </NavLink>

                        <NavLink className={({ isActive }) => `flex items-center p-3 sm:px-4 gap-3 w-full rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold [&>svg]:text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900 [&>svg]:text-gray-400'}`} to={'/dashboard/view-applications'}>
                            <FileText size={20} />
                            <p className='max-md:hidden'>Applications</p>
                        </NavLink>

                        <NavLink className={({ isActive }) => `flex items-center p-3 sm:px-4 gap-3 w-full rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold [&>svg]:text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900 [&>svg]:text-gray-400'}`} to={'/dashboard/candidates'}>
                            <Users size={20} />
                            <p className='max-md:hidden'>Candidates</p>
                        </NavLink>

                        <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-3 max-md:hidden mt-6'>Insights</p>

                        <NavLink className={({ isActive }) => `flex items-center p-3 sm:px-4 gap-3 w-full rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold [&>svg]:text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900 [&>svg]:text-gray-400'}`} to={'/dashboard/analytics'}>
                            <BarChart2 size={20} />
                            <p className='max-md:hidden'>Analytics</p>
                        </NavLink>

                        <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-3 max-md:hidden mt-6'>Settings</p>

                        <NavLink className={({ isActive }) => `flex items-center p-3 sm:px-4 gap-3 w-full rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold [&>svg]:text-blue-600' : 'hover:bg-gray-50 hover:text-gray-900 [&>svg]:text-gray-400'}`} to={'/dashboard/profile'}>
                            <Settings size={20} />
                            <p className='max-md:hidden'>Company Profile</p>
                        </NavLink>

                    </ul>
                </div>

                <div className='flex-1 h-full p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-73px)] w-full overflow-hidden'>
                    <Outlet />
                </div>

            </div>

        </div>
    )
}

export default Dashboard