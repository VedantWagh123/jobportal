import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { Camera, Save, MapPin, Globe, Phone, Building, Briefcase, Users, Calendar, ClipboardList, Link } from 'lucide-react'

const CompanyProfile = () => {
    const { backendUrl, companyData, setCompanyData, companyToken } = useContext(AppContext)
    const [loading, setLoading] = useState(false)
    
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

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0])
            setImagePreview(URL.createObjectURL(e.target.files[0]))
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
                toast.success(data.message)
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
        <div className='container mx-auto p-4 max-w-4xl pb-10'>
            <div className='mb-8'>
                <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>Company Profile</h2>
                <p className='text-sm text-gray-500 mt-1'>Manage your company identity and contact information.</p>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                {/* Header Cover */}
                <div className='h-32 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 relative'>
                    <div className='absolute -bottom-12 left-8'>
                        <div className='relative group'>
                            <img src={imagePreview} alt="Company Logo" className='w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white' />
                            <label htmlFor="logo-upload" className='absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm'>
                                <Camera className="text-white" size={24} />
                            </label>
                            <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                    </div>
                </div>

                <div className='pt-16 p-8'>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='col-span-1 md:col-span-2'>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><Building size={16} className='text-gray-400'/> Company Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm'
                                />
                            </div>

                            <div className='col-span-1 md:col-span-2'>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>About Company</label>
                                <textarea 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="4"
                                    placeholder="Briefly describe what your company does..."
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none text-sm'
                                ></textarea>
                            </div>

                            <div className='col-span-1 md:col-span-2'>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><ClipboardList size={16} className='text-gray-400'/> Key Responsibilities & Core Offerings</label>
                                <textarea 
                                    value={keyResponsibilities} 
                                    onChange={(e) => setKeyResponsibilities(e.target.value)}
                                    rows="3"
                                    placeholder="List the key roles, services, or responsibilities your company is known for..."
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none text-sm'
                                ></textarea>
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><Briefcase size={16} className='text-gray-400'/> Industry</label>
                                <input 
                                    type="text" 
                                    value={industry} 
                                    onChange={(e) => setIndustry(e.target.value)}
                                    placeholder="e.g. Information Technology"
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><Users size={16} className='text-gray-400'/> Company Size</label>
                                <select 
                                    value={companySize}
                                    onChange={(e) => setCompanySize(e.target.value)}
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm bg-white'
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

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><Calendar size={16} className='text-gray-400'/> Founded Year</label>
                                <input 
                                    type="number" 
                                    value={foundedYear} 
                                    onChange={(e) => setFoundedYear(e.target.value)}
                                    placeholder="e.g. 2010"
                                    min="1800" max={new Date().getFullYear()}
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><Globe size={16} className='text-gray-400'/> Website</label>
                                <input 
                                    type="text" 
                                    value={website} 
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://example.com"
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><MapPin size={16} className='text-gray-400'/> Location</label>
                                <input 
                                    type="text" 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City, Country"
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><Phone size={16} className='text-gray-400'/> Contact Details</label>
                                <input 
                                    type="text" 
                                    value={contactDetails} 
                                    onChange={(e) => setContactDetails(e.target.value)}
                                    placeholder="Phone or alternative email"
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'><Link size={16} className='text-gray-400'/> LinkedIn URL</label>
                                <input 
                                    type="url" 
                                    value={linkedinUrl} 
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    placeholder="https://linkedin.com/company/..."
                                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm'
                                />
                            </div>
                        </div>

                        <div className='flex justify-end border-t border-gray-100 pt-6 mt-2'>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm'
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CompanyProfile
