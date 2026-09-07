import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import { MapPin, Globe, Building, Users, Calendar, ClipboardList, Phone, ExternalLink, Link } from 'lucide-react'

const CompanyDetails = () => {
    const { id } = useParams()
    const { jobs } = useContext(AppContext)
    
    const [companyData, setCompanyData] = useState(null)
    const [companyJobs, setCompanyJobs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (jobs && jobs.length > 0) {
            // Find all jobs posted by this company
            const cJobs = jobs.filter(job => job.companyId._id === id)
            setCompanyJobs(cJobs)
            
            // Extract company info from the first job (if any)
            if (cJobs.length > 0) {
                setCompanyData(cJobs[0].companyId)
            } else {
                // If there are no active jobs for this company, it won't be in the Context
                // but we handle it gracefully below.
                setCompanyData(null)
            }
            setLoading(false)
        }
    }, [id, jobs])

    if (loading) return <Loading />

    if (!companyData) {
        return (
            <div className='min-h-screen flex flex-col'>
                <div className='flex-1 flex flex-col items-center justify-center p-8'>
                    <Building size={64} className='text-gray-300 mb-4' />
                    <h2 className='text-2xl font-bold text-gray-800'>Company Not Found</h2>
                    <p className='text-gray-500 mt-2 text-center max-w-md'>
                        We couldn't find the details for this company. They might not have any active job postings right now.
                    </p>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className='min-h-screen flex flex-col bg-gray-50/50'>
            
            <div className='container mx-auto px-4 2xl:px-20 py-10 flex-1'>
                
                {/* Hero Section */}
                <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8'>
                    {/* Background decoration */}
                    <div className='absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2'></div>
                    
                    {/* Logo Container */}
                    <div className='w-32 h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-4 shrink-0 z-10'>
                        <img src={companyData.image} alt={companyData.name} className='max-w-full max-h-full object-contain' />
                    </div>
                    
                    {/* Hero Details */}
                    <div className='flex-1 text-center md:text-left z-10'>
                        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4'>
                            <div>
                                <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight'>{companyData.name}</h1>
                                <div className='flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-sm font-medium text-gray-600'>
                                    {companyData.location && (
                                        <span className='flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full'>
                                            <MapPin size={14} className='text-gray-500'/> {companyData.location}
                                        </span>
                                    )}
                                    {companyData.industry && (
                                        <span className='flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full'>
                                            <Building size={14} className='text-blue-500'/> {companyData.industry}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Website Button */}
                            {companyData.website && (
                                <a 
                                    href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className='inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all shrink-0'
                                >
                                    Visit Website <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                        
                        {companyData.description && (
                            <p className='text-gray-600 leading-relaxed text-sm sm:text-base max-w-3xl mt-4'>
                                {companyData.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    
                    {/* Left Column: Company Information */}
                    <div className='lg:col-span-1 space-y-6'>
                        
                        <div className='bg-white rounded-3xl p-6 shadow-sm border border-gray-100'>
                            <h3 className='text-lg font-bold text-gray-900 mb-5 flex items-center gap-2'>
                                <Building size={20} className='text-blue-500' /> Company Overview
                            </h3>
                            
                            <div className='space-y-4'>
                                {companyData.companySize && (
                                    <div className='flex items-start gap-3'>
                                        <div className='p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5'>
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5'>Company Size</p>
                                            <p className='text-sm font-medium text-gray-800'>{companyData.companySize} employees</p>
                                        </div>
                                    </div>
                                )}
                                
                                {companyData.foundedYear && (
                                    <div className='flex items-start gap-3'>
                                        <div className='p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5'>
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5'>Founded</p>
                                            <p className='text-sm font-medium text-gray-800'>{companyData.foundedYear}</p>
                                        </div>
                                    </div>
                                )}

                                {companyData.contactDetails && (
                                    <div className='flex items-start gap-3'>
                                        <div className='p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5'>
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5'>Contact</p>
                                            <p className='text-sm font-medium text-gray-800 break-words'>{companyData.contactDetails}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {companyData.linkedinUrl && (
                                    <div className='flex items-start gap-3'>
                                        <div className='p-2 bg-cyan-50 text-cyan-600 rounded-lg shrink-0 mt-0.5'>
                                            <Link size={16} />
                                        </div>
                                        <div>
                                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5'>LinkedIn</p>
                                            <a href={companyData.linkedinUrl.startsWith('http') ? companyData.linkedinUrl : `https://${companyData.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className='text-sm font-medium text-blue-600 hover:underline break-words'>
                                                View LinkedIn Profile
                                            </a>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Fallback if no specific stats exist */}
                                {!companyData.companySize && !companyData.foundedYear && !companyData.contactDetails && !companyData.linkedinUrl && (
                                    <p className='text-sm text-gray-500 italic'>No specific overview details provided by the company.</p>
                                )}
                            </div>
                        </div>

                        {companyData.keyResponsibilities && (
                            <div className='bg-white rounded-3xl p-6 shadow-sm border border-gray-100'>
                                <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                    <ClipboardList size={20} className='text-indigo-500' /> Core Offerings
                                </h3>
                                <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-wrap'>
                                    {companyData.keyResponsibilities}
                                </p>
                            </div>
                        )}
                        
                    </div>

                    {/* Right Column: Open Jobs */}
                    <div className='lg:col-span-2'>
                        <div className='flex items-center justify-between mb-6'>
                            <h3 className='text-xl font-bold text-gray-900'>Open Jobs at {companyData.name}</h3>
                            <span className='bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full'>
                                {companyJobs.length} Jobs
                            </span>
                        </div>
                        
                        {companyJobs.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                {companyJobs.map((job, index) => (
                                    <JobCard key={index} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className='bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center flex flex-col items-center'>
                                <ClipboardList size={48} className='text-gray-300 mb-4' />
                                <h4 className='text-lg font-bold text-gray-800'>No Open Jobs</h4>
                                <p className='text-gray-500 text-sm mt-2'>There are no active job openings available right now.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            <Footer />
        </div>
    )
}

export default CompanyDetails
