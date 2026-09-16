import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { X, Upload, Eye, EyeOff, Building2, Mail, Lock, MapPin, Globe, Phone, Briefcase, Users, Calendar, Link2, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, ClipboardList, TrendingUp } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { assets } from '../assets/assets'

const RecruiterLogin = () => {
    const navigate = useNavigate()
    const { backendUrl, setCompanyToken, setCompanyData } = useContext(AppContext)

    const [state, setState] = useState('Login') // 'Login' or 'Sign Up'
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { user } = useUser()
    const clerkEmail = user?.primaryEmailAddress?.emailAddress || ''

    // Form Fields
    const [formData, setFormData] = useState({
        name: '',
        email: clerkEmail,
        password: '',
        confirmPassword: '',
        description: '',
        location: '',
        website: '',
        contactDetails: '',
        industry: '',
        companySize: '',
        foundedYear: '',
        keyResponsibilities: '',
        linkedinUrl: ''
    })
    const [image, setImage] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            if (state === "Login") {
                const { data } = await axios.post(backendUrl + '/api/company/login', { 
                    email: formData.email, 
                    password: formData.password 
                })

                if (data.success) {
                    setCompanyData(data.company)
                    setCompanyToken(data.token)
                    localStorage.setItem('companyToken', data.token)
                    localStorage.setItem('lastClerkUserId', user?.id || 'guest')
                    navigate('/dashboard')
                } else {
                    toast.error(data.message)
                }
            } else {
                // Validation for Signup
                if (formData.password !== formData.confirmPassword) {
                    return toast.error("Passwords do not match!")
                }
                if (!image) {
                    return toast.error("Company Logo is required")
                }

                const submitData = new FormData()
                Object.keys(formData).forEach(key => {
                    if (key !== 'confirmPassword') {
                        submitData.append(key, formData[key])
                    }
                })
                submitData.append('image', image)

                const { data } = await axios.post(backendUrl + '/api/company/register', submitData)

                if (data.success) {
                    toast.success(data.message)
                    localStorage.setItem('lastClerkUserId', user?.id || 'guest')
                    setState('Login')
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F4F7FF] via-[#F8FAFC] to-[#EBF0FF] font-sans overflow-x-hidden flex flex-col relative">
            
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>

            {/* Top Navigation */}
            <header className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center relative z-20 shrink-0">
                <Link to="/">
                    <img src={assets.logo} alt="Logo" className="h-6 sm:h-7 lg:h-8 cursor-pointer" />
                </Link>
                <Link to="/" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    <span className="hidden sm:inline">Back to Home</span>
                    <span className="sm:hidden">Home</span>
                </Link>
            </header>

            {/* Main Content Layout */}
            <main className={`w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20 flex-1 flex flex-col justify-center relative z-10 grid gap-10 lg:gap-8 xl:gap-12 items-center ${
                state === 'Sign Up' 
                ? 'grid-cols-1 lg:grid-cols-12 max-w-6xl' 
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            }`}>
                
                {/* ─── LEFT COLUMN (Marketing Copy) ─── */}
                <div className={`flex flex-col justify-center order-1 ${
                    state === 'Sign Up' 
                    ? 'hidden lg:flex lg:col-span-5' 
                    : 'md:col-span-1 xl:col-span-1'
                }`}>
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-100 text-blue-700 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide w-max mb-5 sm:mb-6">
                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> For Employers
                    </div>
                    
                    <h1 className="text-[2rem] leading-tight sm:text-4xl lg:text-[2.5rem] xl:text-5xl 2xl:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6">
                        Find the Right <br className="hidden sm:block" /> Talent, <span className="text-blue-600 relative inline-block">Faster<svg className="absolute w-full h-2 sm:h-3 -bottom-0.5 sm:-bottom-1 left-0 text-blue-200" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" strokeLinecap="round" /></svg></span>
                    </h1>
                    
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 leading-relaxed max-w-md">
                        Connect with skilled professionals, post jobs, manage applications, and grow your team — all in one place.
                    </p>

                    <div className="flex flex-col gap-5 sm:gap-6 mb-10 sm:mb-12">
                        <div className="flex gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 shadow-sm text-blue-600">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Access Skilled Talent</h3>
                                <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">From freshers to experienced professionals</p>
                            </div>
                        </div>
                        <div className="flex gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm text-emerald-600">
                                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Smart Hiring Tools</h3>
                                <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">AI-powered candidate matching</p>
                            </div>
                        </div>
                        <div className="flex gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm text-indigo-600">
                                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Manage with Ease</h3>
                                <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">Track applications and schedule interviews</p>
                            </div>
                        </div>
                        <div className="flex gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 shadow-sm text-amber-600">
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Grow Your Business</h3>
                                <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">Hire the right people, build the future</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto relative">
                        <p className="text-2xl sm:text-3xl text-gray-400 opacity-60 font-medium" style={{ fontFamily: "'Caveat', 'Segoe Script', cursive", transform: 'rotate(-3deg)' }}>
                            Great Teams <br /> Build Great Things
                        </p>
                    </div>
                </div>

                {/* ─── MIDDLE COLUMN (Auth Form) ─── */}
                <div className={`w-full z-20 order-2 mx-auto transition-all duration-500 ${
                    state === 'Sign Up' 
                    ? 'lg:col-span-7 max-w-3xl' 
                    : 'md:col-span-1 xl:col-span-1 max-w-md xl:max-w-[480px]'
                }`}>
                    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[24px] sm:rounded-[32px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-6 sm:p-8 xl:p-10 relative overflow-hidden">
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 pointer-events-none hover:opacity-100 transition-opacity duration-1000"></div>

                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                    {state === 'Login' ? 'Employer Login' : 'Register Company'}
                                </h2>
                                <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm max-w-[280px] sm:max-w-none">
                                    {state === 'Login' ? 'Welcome back! Please sign in to access your dashboard.' : 'Join our platform to find top talent for your organization.'}
                                </p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl items-center justify-center shadow-inner hidden md:flex shrink-0">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                        </div>

                        <form onSubmit={onSubmitHandler} className="relative z-10">
                            
                            {/* REGISTER FORM SCROLLABLE AREA */}
                            {state === 'Sign Up' && (
                                <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar -mr-1 sm:-mr-2">
                                    
                                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                                        <label htmlFor="image" className="cursor-pointer group relative">
                                            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${image ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20' : 'border-gray-300 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50/50 group-hover:scale-105'}`}>
                                                {image ? (
                                                    <img className='w-full h-full object-cover' src={URL.createObjectURL(image)} alt="Logo Preview" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <Upload className="w-6 h-6 sm:w-7 sm:h-7 mb-1.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider group-hover:text-blue-500 transition-colors">Upload Logo</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input onChange={e => setImage(e.target.files[0])} type="file" id='image' hidden accept="image/*" />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pb-6">
                                        
                                        {/* Basic Details */}
                                        <div className="space-y-4 sm:space-y-5">
                                            <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1.5 sm:pb-2 flex items-center gap-1.5 sm:gap-2"><MapPin size={14}/> Basic Info</h3>
                                            
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className='relative group'>
                                                    <Building2 className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="name" onChange={handleChange} value={formData.name} type="text" placeholder='Company Name' required />
                                                </div>
                                                <div className='relative group'>
                                                    <MapPin className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="location" onChange={handleChange} value={formData.location} type="text" placeholder='Headquarters Location' required />
                                                </div>
                                                <div className='relative group'>
                                                    <Globe className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="website" onChange={handleChange} value={formData.website} type="url" placeholder='Website URL' />
                                                </div>
                                                <div className='relative group'>
                                                    <Phone className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="contactDetails" onChange={handleChange} value={formData.contactDetails} type="text" placeholder='Contact Number' />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Credentials */}
                                        <div className="space-y-4 sm:space-y-5">
                                            <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1.5 sm:pb-2 flex items-center gap-1.5 sm:gap-2"><Lock size={14}/> Account Credentials</h3>
                                            
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className='relative group'>
                                                    <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="email" onChange={handleChange} value={formData.email} type="email" placeholder='Corporate Email ID' required />
                                                </div>
                                                <div className='relative group'>
                                                    <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="password" onChange={handleChange} value={formData.password} type={showPassword ? "text" : "password"} placeholder='Password' required />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className='absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1'>
                                                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
                                                    </button>
                                                </div>
                                                <div className='relative group'>
                                                    <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="confirmPassword" onChange={handleChange} value={formData.confirmPassword} type={showConfirmPassword ? "text" : "password"} placeholder='Confirm Password' required />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1'>
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company Specifics */}
                                        <div className="space-y-4 sm:space-y-5 md:col-span-2 mt-2 sm:mt-4">
                                            <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-1.5 sm:pb-2 flex items-center gap-1.5 sm:gap-2"><Briefcase size={14}/> Company Details</h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div className='relative group'>
                                                    <Briefcase className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="industry" onChange={handleChange} value={formData.industry} type="text" placeholder='Industry (e.g. IT)' />
                                                </div>
                                                <div className='relative group'>
                                                    <Users className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="companySize" onChange={handleChange} value={formData.companySize} type="text" placeholder='Size (e.g. 50-200)' />
                                                </div>
                                                <div className='relative group'>
                                                    <Calendar className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="foundedYear" onChange={handleChange} value={formData.foundedYear} type="number" placeholder='Founded Year' />
                                                </div>
                                                <div className='relative group'>
                                                    <Link2 className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                    <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800' 
                                                        name="linkedinUrl" onChange={handleChange} value={formData.linkedinUrl} type="url" placeholder='LinkedIn URL' />
                                                </div>
                                            </div>

                                            <div className='relative group'>
                                                <textarea className='w-full p-4 sm:p-5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800 min-h-[100px] sm:min-h-[120px] resize-none' 
                                                    name="description" onChange={handleChange} value={formData.description} placeholder='Company Description & Vision...' required></textarea>
                                            </div>
                                            <div className='relative group'>
                                                <textarea className='w-full p-4 sm:p-5 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium text-gray-800 min-h-[80px] sm:min-h-[100px] resize-none' 
                                                    name="keyResponsibilities" onChange={handleChange} value={formData.keyResponsibilities} placeholder='What are you looking for in candidates? (Key Responsibilities)'></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LOGIN FORM (Not Scrollable) */}
                            {state === 'Login' && (
                                <div className="space-y-4 sm:space-y-5">
                                    <div className="space-y-1 sm:space-y-1.5">
                                        <label className="text-[11px] sm:text-xs font-bold text-gray-700 ml-1">Corporate Email ID</label>
                                        <div className='relative group'>
                                            <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                                            <input className='w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm sm:text-[15px] font-medium text-gray-800' 
                                                name="email" onChange={handleChange} value={formData.email} type="email" placeholder='name@company.com' required />
                                        </div>
                                    </div>

                                    <div className="space-y-1 sm:space-y-1.5">
                                        <label className="text-[11px] sm:text-xs font-bold text-gray-700 ml-1">Password</label>
                                        <div className='relative group'>
                                            <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                                            <input className='w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm sm:text-[15px] font-medium text-gray-800' 
                                                name="password" onChange={handleChange} value={formData.password} type={showPassword ? "text" : "password"} placeholder='Enter your password' required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-2'>
                                                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 sm:pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300 bg-white group-hover:border-blue-400 transition-colors">
                                                <input type="checkbox" className="peer opacity-0 absolute w-full h-full cursor-pointer" />
                                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-xs sm:text-sm font-medium text-gray-600 select-none">Remember me</span>
                                        </label>
                                        <p className='text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-bold cursor-pointer transition-colors'>Forgot password?</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button type='submit' className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base mt-6 sm:mt-8`}>
                                {state === 'Login' ? (
                                    <>Sign In to Dashboard <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /></>
                                ) : (
                                    <>Submit Registration <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /></>
                                )}
                            </button>

                            {/* Footer Toggle */}
                            <div className="mt-6 sm:mt-8 relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative px-3 sm:px-4 bg-white text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest bg-opacity-100">
                                    OR
                                </div>
                            </div>

                            <div className="mt-5 sm:mt-6 text-center bg-gray-50 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 border border-gray-100 px-2">
                                {state === 'Login' ? (
                                    <p className='text-gray-600 font-medium text-xs sm:text-sm'>
                                        New to our platform?{' '}
                                        <span className='text-blue-600 font-extrabold cursor-pointer hover:underline transition-all' onClick={() => setState("Sign Up")}>
                                            Register Company
                                        </span>
                                    </p>
                                ) : (
                                    <p className='text-gray-600 font-medium text-xs sm:text-sm'>
                                        Already registered?{' '}
                                        <span className='text-blue-600 font-extrabold cursor-pointer hover:underline transition-all' onClick={() => setState("Login")}>
                                            Sign In to Dashboard
                                        </span>
                                    </p>
                                )}
                            </div>

                        </form>
                    </div>
                </div>

                {/* ─── RIGHT COLUMN (Image & Floating Stats) ─── */}
                <div className={`order-3 relative w-full transition-all duration-700 ${
                    state === 'Sign Up' 
                    ? 'hidden' 
                    : 'md:col-span-2 xl:col-span-1 flex items-center justify-center mt-12 md:mt-8 xl:mt-0 max-w-sm md:max-w-md mx-auto'
                }`}>
                    <div className="relative w-full z-10">
                        {/* Soft Circular Background replacing the rigid box */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square bg-blue-200/30 rounded-full -z-10 blur-xl"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square bg-blue-100/50 rounded-full -z-10"></div>

                        <img 
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop" 
                            alt="Professional working" 
                            className="w-full h-auto object-cover rounded-3xl relative z-10"
                            style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
                        />
                        
                        {/* Floating Cards - Repositioned to float naturally around the person */}
                        <div className="absolute top-4 sm:top-8 -left-4 sm:-left-12 lg:-left-16 bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white flex items-center gap-3 sm:gap-4 hover:-translate-y-1 transition-transform cursor-default z-20">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 leading-tight text-sm sm:text-base">10K+</h4>
                                <p className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Active Candidates</p>
                            </div>
                        </div>

                        <div className="absolute top-28 sm:top-32 -right-4 sm:-right-8 bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white flex items-center gap-3 sm:gap-4 hover:-translate-y-1 transition-transform cursor-default z-20" style={{animationDelay: '0.2s'}}>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 leading-tight text-sm sm:text-base">500+</h4>
                                <p className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Hiring Companies</p>
                            </div>
                        </div>

                        <div className="absolute bottom-20 sm:bottom-24 -left-2 sm:-left-8 lg:-left-12 bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white flex items-center gap-3 sm:gap-4 hover:-translate-y-1 transition-transform cursor-default z-20" style={{animationDelay: '0.4s'}}>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 leading-tight text-sm sm:text-base">3x</h4>
                                <p className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Faster Hiring</p>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-11/12 sm:w-[120%] max-w-sm bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xl z-20 border border-white">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Build Your</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Dream Team</p>
                                </div>
                            </div>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>

                    </div>
                </div>

            </main>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                @media (min-width: 640px) {
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    )
}

export default RecruiterLogin