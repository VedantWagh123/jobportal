import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '@clerk/clerk-react'
import { Briefcase, MapPin, BarChart, Bookmark, Building, Users, Calendar, Link as LinkIcon, ClipboardList, CheckCircle2, ChevronRight, IndianRupee } from 'lucide-react'

const ApplyJob = () => {

  const { id } = useParams()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [JobData, setJobData] = useState(null)
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')

  const { jobs, backendUrl, userData, userApplications, fetchUserApplications } = useContext(AppContext)

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/jobs/${id}`)
      if (data.success) {
        setJobData(data.job)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const applyHandler = async () => {
    try {
      if (!userData) {
        return toast.error('Login to apply for jobs')
      }
      if (!userData.resume) {
        navigate('/applications')
        return toast.error('Upload resume to apply')
      }
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/users/apply',
        { jobId: JobData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchUserApplications()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const checkAlreadyApplied = () => {
    const hasApplied = userApplications.some(item => item.jobId._id === JobData._id)
    setIsAlreadyApplied(hasApplied)
  }

  useEffect(() => {
    fetchJob()
  }, [id])

  useEffect(() => {
    if (userApplications.length > 0 && JobData) {
      checkAlreadyApplied()
    }
  }, [JobData, userApplications, id])

  if (!JobData) return <Loading />

  const displaySkills = JobData.skills && JobData.skills.length > 0 ? JobData.skills : [JobData.category || 'Problem Solving']
  
  const similarJobs = jobs.filter(job => job._id !== JobData._id && job.companyId._id === JobData.companyId._id)
      .filter(job => {
        const appliedJobsIds = new Set(userApplications.map(app => app.jobId && app.jobId._id))
        return !appliedJobsIds.has(job._id)
      }).slice(0, 4)

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      
      {/* Premium Hero Section */}
      <div className='container px-4 2xl:px-20 mx-auto pt-8'>
        <div className='bg-gradient-to-br from-blue-50/80 to-blue-100/40 border border-blue-100/50 rounded-[32px] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]'>
          
          {/* Decorative graphic in background */}
          <div className='absolute right-0 bottom-0 opacity-10 pointer-events-none'>
            <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
          </div>

          <div className='flex-1 z-10'>
            <div className='flex items-start gap-6'>
              
              {/* Logo Card */}
              <div 
                className='w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-3 shrink-0 cursor-pointer hover:border-blue-300 transition-colors'
                onClick={() => navigate(`/company/${JobData.companyId._id}`)}
              >
                <img src={JobData.companyId.image} alt={JobData.companyId.name} className='max-w-full max-h-full object-contain' />
              </div>

              {/* Title & Meta */}
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='bg-orange-100 text-orange-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1'>
                    ⭐ Featured
                  </span>
                </div>
                <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4'>
                  {JobData.title}
                </h1>
                
                <div className='flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-gray-600 mb-6'>
                  <span className='flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors' onClick={() => navigate(`/company/${JobData.companyId._id}`)}>
                    <Briefcase size={16} className='text-gray-400' /> {JobData.companyId.name}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <MapPin size={16} className='text-gray-400' /> {JobData.location}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <BarChart size={16} className='text-gray-400' /> {JobData.level}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <IndianRupee size={16} className='text-gray-400' /> CTC: {kconvert.convertTo(JobData.salary)}
                  </span>
                </div>

                {/* Skills */}
                <div className='flex flex-wrap items-center gap-2'>
                  {displaySkills.slice(0,6).map((skill, index) => (
                    <span key={index} className='text-xs font-bold text-blue-700 bg-blue-100/60 px-3 py-1.5 rounded-full'>
                      {skill}
                    </span>
                  ))}
                  {displaySkills.length > 6 && (
                    <span className='text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-1.5 rounded-full'>
                      +{displaySkills.length - 6}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className='flex flex-col items-center md:items-end justify-center md:justify-start gap-3 z-10 md:w-64'>
            <button 
              onClick={applyHandler} 
              className={`w-full max-w-[240px] px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${isAlreadyApplied ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              {isAlreadyApplied ? <>Already Applied <CheckCircle2 size={16} /></> : 'Apply Now'}
            </button>
            <span className='text-xs font-medium text-gray-500 flex items-center gap-1'>
              <Calendar size={12} /> Posted {moment(JobData.date).fromNow()}
            </span>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className='container px-4 2xl:px-20 mx-auto mt-6 pb-20 flex-1'>
        
        {/* Tabs */}
        <div className='flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar'>
          {['Overview', 'About Company', 'Skills Required', 'Similar Jobs'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-all whitespace-nowrap relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {tab}
              {activeTab === tab && (
                <div className='absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full'></div>
              )}
            </button>
          ))}
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10'>
          
          {/* Left Column (Content) */}
          <div className='flex-1 w-full'>
            
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && (
              <div className='animate-fadeIn'>
                <h2 className='text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-2'>
                  <ClipboardList size={24} className='text-blue-500' /> Job description
                </h2>
                
                <div className='rich-text text-gray-600 leading-relaxed max-w-4xl bg-white p-8 rounded-3xl shadow-sm border border-gray-100' dangerouslySetInnerHTML={{ __html: JobData.description }}></div>

                {/* Summary Cards Grid */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-8'>
                  <div className='bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm'>
                    <div className='w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3'><Briefcase size={18}/></div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Job Type</p>
                    <p className='text-sm font-bold text-gray-900'>Full Time</p>
                  </div>
                  <div className='bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm'>
                    <div className='w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3'><BarChart size={18}/></div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Experience</p>
                    <p className='text-sm font-bold text-gray-900'>{JobData.level}</p>
                  </div>
                  <div className='bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm'>
                    <div className='w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3'><MapPin size={18}/></div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Location</p>
                    <p className='text-sm font-bold text-gray-900'>{JobData.location}</p>
                  </div>
                  <div className='bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm'>
                    <div className='w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-3'><IndianRupee size={18}/></div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>CTC</p>
                    <p className='text-sm font-bold text-gray-900'>₹{JobData.salary.toLocaleString()}</p>
                  </div>
                </div>

                <div className='flex items-center gap-4 mt-8'>
                  <button onClick={applyHandler} className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 ${isAlreadyApplied ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}`}>
                    {isAlreadyApplied ? <>Already Applied <CheckCircle2 size={16} /></> : 'Apply Now'}
                  </button>
                  <button className='px-6 py-3.5 rounded-xl font-bold text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-all'>
                    <Bookmark size={16} /> Save Job
                  </button>
                </div>
              </div>
            )}

            {/* ABOUT COMPANY TAB */}
            {activeTab === 'About Company' && (
              <div className='animate-fadeIn space-y-6'>
                <div className='bg-white rounded-3xl p-8 shadow-sm border border-gray-100'>
                  <h3 className='text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2'>
                    <Building size={22} className='text-blue-500' /> About {JobData.companyId.name}
                  </h3>
                  
                  {JobData.companyId.description ? (
                    <p className='text-gray-600 leading-relaxed mb-8'>
                      {JobData.companyId.description}
                    </p>
                  ) : (
                    <p className='text-gray-500 italic mb-8'>No company description provided.</p>
                  )}

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    {JobData.companyId.companySize && (
                        <div className='flex items-center gap-3'>
                            <div className='p-3 bg-gray-50 text-gray-600 rounded-xl'><Users size={18} /></div>
                            <div>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Company Size</p>
                                <p className='text-sm font-bold text-gray-900'>{JobData.companyId.companySize}</p>
                            </div>
                        </div>
                    )}
                    {JobData.companyId.foundedYear && (
                        <div className='flex items-center gap-3'>
                            <div className='p-3 bg-gray-50 text-gray-600 rounded-xl'><Calendar size={18} /></div>
                            <div>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Founded</p>
                                <p className='text-sm font-bold text-gray-900'>{JobData.companyId.foundedYear}</p>
                            </div>
                        </div>
                    )}
                    {JobData.companyId.website && (
                        <div className='flex items-center gap-3'>
                            <div className='p-3 bg-gray-50 text-gray-600 rounded-xl'><LinkIcon size={18} /></div>
                            <div>
                                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Website</p>
                                <a href={JobData.companyId.website.startsWith('http') ? JobData.companyId.website : `https://${JobData.companyId.website}`} target='_blank' rel='noreferrer' className='text-sm font-bold text-blue-600 hover:underline'>
                                  Visit Website
                                </a>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SKILLS REQUIRED TAB */}
            {activeTab === 'Skills Required' && (
              <div className='animate-fadeIn bg-white rounded-3xl p-8 shadow-sm border border-gray-100'>
                <h3 className='text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2'>
                  <Sparkles size={22} className='text-purple-500' /> Skills Required
                </h3>
                <div className='flex flex-wrap gap-3'>
                  {displaySkills.map((skill, index) => (
                    <div key={index} className='flex items-center gap-2 bg-purple-50 border border-purple-100 px-4 py-2.5 rounded-xl'>
                      <CheckCircle2 size={16} className='text-purple-500' />
                      <span className='font-bold text-purple-900 text-sm'>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SIMILAR JOBS TAB (Mobile Only, since Desktop has right column) */}
            {activeTab === 'Similar Jobs' && (
              <div className='animate-fadeIn lg:hidden'>
                <h3 className='text-xl font-extrabold text-gray-900 mb-6'>
                  More jobs from {JobData.companyId.name}
                </h3>
                <div className='flex flex-col gap-5'>
                  {similarJobs.length > 0 ? similarJobs.map((job, index) => (
                    <JobCard key={index} job={job} />
                  )) : (
                    <p className='text-gray-500 text-sm'>No other open jobs found for this company.</p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (Similar Jobs - Desktop) */}
          <div className='hidden lg:block w-[360px] shrink-0'>
            <div className='flex items-center justify-between mb-5'>
              <h3 className='font-bold text-gray-900'>More jobs from {JobData.companyId.name}</h3>
              {similarJobs.length > 0 && <span className='text-xs font-bold text-blue-600 cursor-pointer hover:underline'>View All &rarr;</span>}
            </div>
            
            <div className='flex flex-col gap-4'>
              {similarJobs.length > 0 ? similarJobs.map((job, index) => (
                <div key={index} className='scale-95 origin-top-left w-[105%]'>
                    <JobCard job={job} />
                </div>
              )) : (
                <div className='bg-white p-6 rounded-2xl border border-gray-100 text-center'>
                  <p className='text-gray-500 text-sm'>No other open jobs found.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default ApplyJob