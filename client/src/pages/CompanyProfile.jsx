import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { 
  Building, Briefcase, Users, Calendar, MapPin, Globe, Phone,
  CheckCircle2, Camera, FileText, Share2, Eye, Link as LinkIcon, 
  Settings, Save, Upload, Lightbulb, Check, Image as ImageIcon, Bold, Italic, List, Link2, ListOrdered
} from 'lucide-react'

const TABS = ['Company Information', 'About & Details', 'Social Links', 'Contact', 'Preferences']

const EditorToolbar = () => (
    <div className="flex items-center gap-1 border-b border-gray-100 bg-white p-1.5 rounded-t-xl text-gray-500">
        <button type="button" className="p-1.5 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors"><Bold size={15} /></button>
        <button type="button" className="p-1.5 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors"><Italic size={15} /></button>
        <button type="button" className="p-1.5 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors"><List size={15} /></button>
        <button type="button" className="p-1.5 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors"><ListOrdered size={15} /></button>
        <div className="w-px h-4 bg-gray-200 mx-1"></div>
        <button type="button" className="p-1.5 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors"><Link2 size={15} /></button>
    </div>
)

const CompanyProfile = () => {
    const { backendUrl, companyData, setCompanyData, companyToken } = useContext(AppContext)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState(TABS[0])
    
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [website, setWebsite] = useState('')
    const [contactDetails, setContactDetails] = useState('')
    const [industry, setIndustry] = useState('')
    const [companySize, setCompanySize] = useState('')
    const [foundedYear, setFoundedYear] = useState('')
    const [keyResponsibilities, setKeyResponsibilities] = useState('')
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [image, setImage] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)

    const [totalJobs, setTotalJobs] = useState(0)
    const [totalApplicants, setTotalApplicants] = useState(0)

    useEffect(() => {
        if (companyData) {
            setName(companyData.name || '')
            setDescription(companyData.description || '')
            setLocation(companyData.location || '')
            setWebsite(companyData.website || '')
            setContactDetails(companyData.contactDetails || '')
            setIndustry(companyData.industry || '')
            setCompanySize(companyData.companySize || '')
            setFoundedYear(companyData.foundedYear || '')
            setKeyResponsibilities(companyData.keyResponsibilities || '')
            setLinkedinUrl(companyData.linkedinUrl || '')
            setImagePreview(companyData.image || null)
        }
    }, [companyData])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } })
                if (data.success) {
                    setTotalJobs(data.jobsData.length)
                    const applicantsCount = data.jobsData.reduce((acc, job) => acc + (job.applicants || 0), 0)
                    setTotalApplicants(applicantsCount)
                }
            } catch (error) {
                console.error("Failed to fetch stats", error)
            }
        }
        if (companyToken) {
            fetchStats()
        }
    }, [companyToken, backendUrl])

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0])
            setImagePreview(URL.createObjectURL(e.target.files[0]))
        }
    }

    const handleReset = () => {
        if (companyData) {
            setName(companyData.name || '')
            setDescription(companyData.description || '')
            setLocation(companyData.location || '')
            setWebsite(companyData.website || '')
            setContactDetails(companyData.contactDetails || '')
            setIndustry(companyData.industry || '')
            setCompanySize(companyData.companySize || '')
            setFoundedYear(companyData.foundedYear || '')
            setKeyResponsibilities(companyData.keyResponsibilities || '')
            setLinkedinUrl(companyData.linkedinUrl || '')
            setImage(false)
            setImagePreview(companyData.image || null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            formData.append('location', location)
            formData.append('website', website)
            formData.append('contactDetails', contactDetails)
            formData.append('industry', industry)
            formData.append('companySize', companySize)
            formData.append('foundedYear', foundedYear)
            formData.append('keyResponsibilities', keyResponsibilities)
            formData.append('linkedinUrl', linkedinUrl)
            if (image) {
                formData.append('image', image)
            }

            const { data } = await axios.post(backendUrl + '/api/company/profile/update', formData, {
                headers: { token: companyToken, 'Content-Type': 'multipart/form-data' }
            })

            if (data.success) {
                toast.success('Profile updated successfully!')
                setCompanyData(data.company)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!companyData) return <Loading />

    return (
        <div className='bg-[#F8FAFC] min-h-screen w-full font-sans pb-20'>
            {/* Top Bar Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-8 py-6">
                <div>
                    <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Company Profile</h1>
                    <p className='text-[13px] text-gray-500 font-medium mt-0.5'>Manage your company identity and contact information.</p>
                </div>
                
                <div className="flex items-center gap-6 hidden lg:flex">
                    <div className="flex items-center gap-2 text-indigo-600 font-medium text-[13px] italic bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                        <Share2 size={14} /> Build a Stronger Employer Brand
                    </div>
                    <button className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-sm">
                        <Eye size={16} className="text-gray-500" /> Preview Company Profile
                        <LinkIcon size={12} className="text-gray-400 ml-1" />
                    </button>
                </div>
            </div>

            <div className="px-4 sm:px-8 max-w-[1600px] mx-auto">
                <form onSubmit={handleSubmit}>
                    
                    {/* Header Banner Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 relative overflow-visible">
                        {/* Banner Background */}
                        <div className="h-[120px] rounded-t-2xl bg-gradient-to-r from-[#E0F2FE] via-[#E0E7FF] to-[#F3E8FF] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/waves.png')] mix-blend-overlay"></div>
                            
                            <button type="button" className="absolute top-4 right-4 flex items-center gap-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-colors z-10">
                                <ImageIcon size={14} className="text-gray-500" /> Change Cover
                            </button>
                        </div>
                        
                        {/* Profile Info Block */}
                        <div className="px-6 sm:px-8 pb-6 relative z-10 flex flex-col sm:flex-row gap-6">
                            {/* Logo */}
                            <div className="-mt-10 relative shrink-0 group w-24 h-24">
                                <img src={imagePreview} alt="Logo" className="w-24 h-24 rounded-2xl object-cover bg-white border-4 border-white shadow-md" />
                                <label className='absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all border-4 border-white'>
                                    <Camera size={20} className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            
                            {/* Text Info */}
                            <div className="mt-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{companyData.name || 'Company Name'}</h2>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                        <CheckCircle2 size={12} className="fill-blue-600 text-white" /> Verified Company
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[13px] text-gray-600 mt-2 font-medium flex-wrap">
                                    <span>{industry || 'Industry'}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{companySize || 'Size'}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1"><MapPin size={13} className="text-gray-400"/> {location || 'Location'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-2 font-medium">
                                    <span>Technology</span> <span className="text-gray-300">•</span> 
                                    <span>People</span> <span className="text-gray-300">•</span> 
                                    <span>Innovation</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        
                        {/* LEFT COLUMN: Main Form */}
                        <div className="xl:col-span-2 space-y-6">
                            
                            {/* Tabs Navigation */}
                            <div className="flex overflow-x-auto border-b border-gray-200 gap-8 px-2 custom-scrollbar">
                                {TABS.map((tab, idx) => {
                                    const icons = [<FileText size={15}/>, <Settings size={15}/>, <Share2 size={15}/>, <Phone size={15}/>, <Settings size={15}/>]
                                    const isActive = activeTab === tab
                                    return (
                                        <button 
                                            key={tab} 
                                            type="button"
                                            onClick={()=>setActiveTab(tab)} 
                                            className={`pb-3 text-[13px] font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                                        >
                                            <span className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{icons[idx]}</span> {tab}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* TAB 1: Company Information */}
                            <div className={activeTab === TABS[0] ? 'block' : 'hidden'}>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                                    <p className="text-[13px] text-gray-500 mt-0.5">Update your company's basic details and industry information.</p>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className='block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5'>
                                            <Building size={14} className="text-gray-400"/> Company Name <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" value={name} onChange={(e) => setName(e.target.value)} required
                                            className='w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-gray-900 placeholder-gray-400 shadow-sm'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5'>
                                            <Briefcase size={14} className="text-gray-400"/> Industry <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} required
                                            className='w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-gray-900 placeholder-gray-400 shadow-sm'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5'>
                                            <Users size={14} className="text-gray-400"/> Company Size <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            value={companySize} onChange={(e) => setCompanySize(e.target.value)} required
                                            className='w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-gray-900 shadow-sm'
                                        >
                                            <option value="">Select Size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="501-1000">501-1000 employees</option>
                                            <option value="1000+">1000+ employees</option>
                                        </select>
                                    </div>
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className='block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5'>
                                            <Calendar size={14} className="text-gray-400"/> Founded Year
                                        </label>
                                        <input 
                                            type="number" value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)}
                                            min="1800" max={new Date().getFullYear()}
                                            className='w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-gray-900 placeholder-gray-400 shadow-sm'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* TAB 2: About & Details */}
                            <div className={activeTab === TABS[1] ? 'block' : 'hidden'}>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className='text-[15px] font-bold text-gray-900'>About Company</label>
                                            <span className="text-[12px] font-medium text-gray-500">{description.length}/1000</span>
                                        </div>
                                        <p className="text-[13px] text-gray-500 mb-3">Tell candidates about your company, culture, and vision.</p>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all bg-[#FAFAFA] shadow-sm">
                                            <EditorToolbar />
                                            <textarea 
                                                value={description} onChange={(e) => setDescription(e.target.value)}
                                                rows="6" maxLength="1000"
                                                className='w-full px-4 py-3 bg-white border-t border-gray-200 outline-none resize-none text-[14px] text-gray-700 leading-relaxed'
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className='text-[15px] font-bold text-gray-900'>Key Responsibilities & Core Offerings</label>
                                            <span className="text-[12px] font-medium text-gray-500">{keyResponsibilities.length}/1000</span>
                                        </div>
                                        <p className="text-[13px] text-gray-500 mb-3">Highlight your main services, technologies or areas of expertise.</p>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all bg-[#FAFAFA] shadow-sm">
                                            <EditorToolbar />
                                            <textarea 
                                                value={keyResponsibilities} onChange={(e) => setKeyResponsibilities(e.target.value)}
                                                rows="6" maxLength="1000"
                                                className='w-full px-4 py-3 bg-white border-t border-gray-200 outline-none resize-none text-[14px] text-gray-700 leading-relaxed'
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TAB 3: Social Links */}
                            <div className={activeTab === TABS[2] ? 'block' : 'hidden'}>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Social Links</h3>
                                    <p className="text-[13px] text-gray-500 mt-0.5">Manage your online presence.</p>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    <div>
                                        <label className='block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5'>
                                            <Globe size={14} className="text-gray-400"/> Company Website
                                        </label>
                                        <input 
                                            type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                                            className='w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-gray-900 shadow-sm'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5'>
                                            <LinkIcon size={14} className="text-gray-400"/> LinkedIn URL
                                        </label>
                                        <input 
                                            type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
                                            className='w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-gray-900 shadow-sm'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* TAB 4: Contact */}
                            <div className={activeTab === TABS[3] ? 'block' : 'hidden'}>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                                    <p className="text-[13px] text-gray-500 mt-0.5">Primary business location and contact.</p>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    <div>
                                        <label className='block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5'>
                                            <MapPin size={14} className="text-gray-400"/> Location
                                        </label>
                                        <input 
                                            type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                            className='w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-gray-900 shadow-sm'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5'>
                                            <Phone size={14} className="text-gray-400"/> Contact Details
                                        </label>
                                        <input 
                                            type="text" value={contactDetails} onChange={(e) => setContactDetails(e.target.value)}
                                            className='w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-gray-900 shadow-sm'
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Sticky Save Bar */}
                            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
                                <button 
                                    type="button" onClick={handleReset}
                                    className="px-6 py-2.5 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Reset
                                </button>
                                <button 
                                    type="submit" disabled={loading}
                                    className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Info Cards */}
                        <div className="xl:col-span-1 space-y-6">
                            
                            {/* Logo Upload Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                <h3 className="text-[14px] font-bold text-gray-900 mb-1">Company Logo & Cover</h3>
                                <p className="text-[12px] text-gray-500 mb-4">Update your company logo and cover image.</p>
                                
                                <label className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-[#F8FAFC] cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-3 group-hover:-translate-y-1 transition-transform">
                                        <Upload size={18} className="text-blue-600" />
                                    </div>
                                    <p className="text-[13px] font-semibold text-gray-900">Upload New Logo</p>
                                    <p className="text-[11px] text-gray-500 font-medium mt-1">JPG, PNG (Max 2MB)</p>
                                </label>

                                {imagePreview && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2">
                                            <img src={imagePreview} alt="Preview" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-semibold text-gray-700">Logo preview</span>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => {setImage(false); setImagePreview(companyData.image)}} className="text-[11px] font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 border border-red-100 px-2 py-1 rounded bg-red-50">
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Company Overview Stats Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                <h3 className="text-[14px] font-bold text-gray-900 mb-4">Company Overview</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <FileText size={16} className="text-gray-400 mb-1" />
                                        <p className="text-[11px] font-medium text-gray-500">Total Jobs</p>
                                        <p className="text-xl font-bold text-gray-900">{totalJobs}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <Users size={16} className="text-gray-400 mb-1" />
                                        <p className="text-[11px] font-medium text-gray-500">Total Applicants</p>
                                        <p className="text-xl font-bold text-gray-900">{totalApplicants}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <Users size={16} className="text-gray-400 mb-1" />
                                        <p className="text-[11px] font-medium text-gray-500">Team Members</p>
                                        <p className="text-xl font-bold text-gray-900">5</p>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <Eye size={16} className="text-gray-400 mb-1" />
                                        <p className="text-[11px] font-medium text-gray-500">Profile Views</p>
                                        <p className="text-xl font-bold text-gray-900">1.2K</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tips Card */}
                            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 relative overflow-hidden">
                                <h3 className="text-[14px] font-bold text-gray-900 mb-3 flex items-center gap-2 relative z-10">
                                    <Lightbulb size={16} className="text-amber-500" /> Tips for a Great Profile
                                </h3>
                                <ul className="space-y-3 relative z-10">
                                    <li className="flex items-start gap-2 text-[12px] font-medium text-gray-600">
                                        <Check size={14} className="text-green-500 mt-0.5 shrink-0" /> Add a clear company description
                                    </li>
                                    <li className="flex items-start gap-2 text-[12px] font-medium text-gray-600">
                                        <Check size={14} className="text-green-500 mt-0.5 shrink-0" /> Use a recognizable logo
                                    </li>
                                    <li className="flex items-start gap-2 text-[12px] font-medium text-gray-600">
                                        <Check size={14} className="text-green-500 mt-0.5 shrink-0" /> Keep contact information updated
                                    </li>
                                    <li className="flex items-start gap-2 text-[12px] font-medium text-gray-600">
                                        <Check size={14} className="text-green-500 mt-0.5 shrink-0" /> Highlight work culture and values
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CompanyProfile
