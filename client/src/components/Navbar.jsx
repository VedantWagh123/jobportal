import { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Bell, ChevronDown, User as UserIcon, Settings, HelpCircle, LogOut, Search, MapPin, Bookmark } from 'lucide-react'

const Navbar = () => {
    const { openSignIn, signOut } = useClerk()
    const { user } = useUser()
    const navigate = useNavigate()
    const { userData, setIsProfileModalOpen, setIsViewProfileModalOpen, searchFilter, setSearchFilter, setIsSearched, savedJobs } = useContext(AppContext)
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const [localSearch, setLocalSearch] = useState({ title: searchFilter.title || '', location: searchFilter.location || '' })

    useEffect(() => {
        setLocalSearch({ title: searchFilter.title || '', location: searchFilter.location || '' })
    }, [searchFilter])

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchFilter(localSearch)
        setIsSearched(true)
        if (window.location.pathname !== '/') {
            navigate('/')
        }
    }
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className='bg-white shadow-sm border-b border-gray-100 py-4 sticky top-0 z-40'>
            <div className='px-6 lg:px-8 flex justify-between items-center gap-8'>
                
                {/* Auth Area */}
                <div className='ml-auto'>
                    {
                        user
                            ? <div className='flex items-center gap-4 relative'>
                                {/* Saved Jobs / Wishlist */}
                                <button 
                                    onClick={() => navigate('/saved-jobs')}
                                    className="relative p-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-full transition"
                                    title="Saved Jobs"
                                >
                                    <Bookmark size={20} />
                                    {savedJobs && savedJobs.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white rounded-full">
                                            {savedJobs.length}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Bell */}
                                <button className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition">
                                    <Bell size={20} />
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                                </button>
                                
                                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                                {/* Profile Trigger */}
                                <div 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 rounded-full transition hover:bg-gray-50"
                                >
                                    {userData?.image || user.imageUrl ? (
                                        <img src={userData?.image || user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                            <UserIcon size={20} />
                                        </div>
                                    )}
                                    
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-bold text-gray-800 leading-tight">{user.fullName}</p>
                                        <p className="text-[11px] font-medium text-gray-500">{userData?.city || 'Candidate'}</p>
                                    </div>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform hidden md:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Custom Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div ref={dropdownRef} className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                                        {/* Header */}
                                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                                            {userData?.image || user.imageUrl ? (
                                                <img src={userData?.image || user.imageUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                                    <UserIcon size={24} />
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-800 truncate">{user.fullName}</p>
                                                <p className="text-xs font-medium text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Links */}
                                        <div className="p-2 flex flex-col gap-1">
                                            <button 
                                                onClick={() => { setIsViewProfileModalOpen(true); setIsDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                            >
                                                <UserIcon size={18} className="text-gray-400" />
                                                View Profile
                                            </button>
                                            <button 
                                                onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                            >
                                                <Settings size={18} className="text-gray-400" />
                                                Account Settings
                                            </button>
                                            <button 
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                            >
                                                <HelpCircle size={18} className="text-gray-400" />
                                                Help & Support
                                            </button>
                                        </div>
                                        
                                        {/* Logout */}
                                        <div className="p-2 border-t border-gray-100">
                                            <button 
                                                onClick={() => signOut()}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition"
                                            >
                                                <LogOut size={18} className="text-red-500" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            : <div>
                                <button onClick={e => openSignIn()} className='bg-blue-600 text-white px-6 py-2 text-sm font-medium rounded-full hover:bg-blue-700 transition shadow-sm hover:shadow-md'>
                                    Candidate Login
                                </button>
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Navbar