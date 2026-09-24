import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import moment from 'moment'
import { 
  Briefcase, MapPin, Building2, Calendar, CheckCircle2, Clock, 
  XCircle, FileText, Upload, Check, ArrowRight, X, ArrowUpRight,
  TrendingUp, Lightbulb, Search, ChevronRight, User, AlertCircle
} from 'lucide-react'

const Applications = () => {

  const { user } = useUser()
  const { getToken } = useAuth()

  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)

  const { backendUrl, userData, userApplications, fetchUserData, fetchUserApplications } = useContext(AppContext)

  const updateResume = async () => {
    try {
      const formData = new FormData()
      formData.append('resume', resume)
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/users/update-resume',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        await fetchUserData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setIsEdit(false)
    setResume(null)
  }

  useEffect(() => {
    if (user) {
      fetchUserApplications()
    }
  }, [user])

  if (!userData) return <Loading />

  // Calculate Profile Completion
  const calculateProfileCompletion = () => {
    let score = 0;
    if (userData.name && userData.email) score += 20;
    if (userData.image) score += 10;
    if (userData.resume) score += 30;
    if (userData.skills && userData.skills.length > 0) score += 15;
    if (userData.phone) score += 10;
    if (userData.city || userData.address) score += 5;
    if (userData.college) score += 10;
    return score;
  }
  const profileCompletion = calculateProfileCompletion();

  // Calculate KPIs
  const validApplications = userApplications.filter(job => job.jobId && job.companyId)
  const totalApplied = validApplications.length
  const pendingCount = validApplications.filter(job => job.status === 'Pending').length
  const acceptedCount = validApplications.filter(job => job.status === 'Accepted' || job.status.includes('Cleared')).length
  const rejectedCount = validApplications.filter(job => job.status === 'Rejected').length

  const getStatusBadge = (status) => {
    if (status === 'Accepted' || status.includes('Cleared')) {
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'Accepted' }
    }
    if (status === 'Rejected') {
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'Rejected' }
    }
    return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'In Progress' }
  }

  const firstName = userData.name ? userData.name.split(' ')[0] : 'Candidate'

  return (
    <div className="font-sans bg-[#f8fafc] min-h-screen">
      <main className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 mx-auto py-8 md:py-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-gray-600 font-medium mb-1 flex items-center gap-2 text-sm">
              Good Morning, {firstName}! <span className="text-xl animate-bounce">👋</span>
            </p>
            <h1 className="text-3xl sm:text-[34px] font-extrabold text-gray-900 tracking-tight leading-tight">Candidate Dashboard</h1>
            <p className="text-gray-500 mt-1.5 font-medium text-[15px]">Track and manage your job applications in one place.</p>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-right relative bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <p className="text-[14px] font-bold text-gray-700">"A better career is a brighter you."</p>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">Keep going, you're making progress!</p>
            </div>
            <div className="w-24 h-16 relative">
              <svg viewBox="0 0 100 60" className="w-full h-full opacity-80" fill="none">
                <path d="M10,60 L40,20 L60,40 L90,10 L110,60 Z" fill="#dbeafe" />
                <path d="M40,20 L50,30 L30,40 Z" fill="#bfdbfe" />
                <path d="M90,10 L100,20 L80,30 Z" fill="#bfdbfe" />
                <path d="M90,10 L90,0 L98,4 L90,8" fill="#3b82f6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          
          {/* Main Content Column */}
          <div className="flex-1 space-y-6 overflow-hidden">
            
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[130px] hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <FileText size={18} strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Applied</p>
                    <h3 className="text-3xl sm:text-4xl font-black text-blue-600 leading-none">{totalApplied}</h3>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-[11px] font-medium text-gray-400">Keep exploring!</span>
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={12}/>+1</span>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[130px] hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Clock size={18} strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">In Progress</p>
                    <h3 className="text-3xl sm:text-4xl font-black text-amber-500 leading-none">{pendingCount}</h3>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-[11px] font-medium text-gray-400">No active process</span>
                  <span className="text-[11px] font-bold text-gray-300 flex items-center gap-0.5"><ArrowRight size={10}/> 0</span>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[130px] hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Offers / Clear</p>
                    <h3 className="text-3xl sm:text-4xl font-black text-emerald-500 leading-none">{acceptedCount}</h3>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-[11px] font-medium text-gray-400">Keep going!</span>
                  <span className="text-[11px] font-bold text-gray-300 flex items-center gap-0.5"><ArrowRight size={10}/> 0</span>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[130px] hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <XCircle size={18} strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rejected</p>
                    <h3 className="text-3xl sm:text-4xl font-black text-red-500 leading-none">{rejectedCount}</h3>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-[11px] font-medium text-gray-400">Don't lose hope!</span>
                  <span className="text-[11px] font-bold text-gray-300 flex items-center gap-0.5"><ArrowRight size={10}/> 0</span>
                </div>
              </div>
            </div>

            {/* Application List */}
            <div className="flex items-center justify-between mb-2 mt-6">
              <h2 className="text-[19px] font-extrabold text-gray-900 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" /> Recent Applications
              </h2>
              <button className="text-[13px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-5">
              {[...validApplications]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((job, index) => {
                  const statusUi = getStatusBadge(job.status);
                  const StatusIcon = statusUi.icon;
                  
                  // Timeline logic
                  const isRejected = job.status === 'Rejected';
                  const isApplied = true;
                  const isScreening = job.status === 'Accepted' || job.status === 'Pending' || isRejected;
                  const isInterview = job.status === 'Accepted';
                  const isOffer = job.status === 'Accepted';

                  return (
                    <div 
                      key={index} 
                      className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-8 hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Top Row */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-5 items-center">
                          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-3 shrink-0">
                             <img src={job.companyId.image} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-[18px] sm:text-[20px] font-extrabold text-gray-900 leading-tight mb-2">{job.jobId.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-medium text-gray-500">
                               <span className="flex items-center gap-1.5"><Building2 size={16} className="text-gray-400"/> {job.companyId.name}</span>
                               <span className="hidden sm:inline text-gray-300">•</span>
                               <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400"/> {job.jobId.location}</span>
                               <span className="hidden sm:inline text-gray-300">•</span>
                               <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400"/> {moment(job.date).format('MMM Do, YYYY')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-1.5 rounded-full border text-[13px] font-bold flex items-center gap-1.5 ${statusUi.color} ${statusUi.bg} ${statusUi.border}`}>
                            <StatusIcon size={16} strokeWidth={2.5} /> {statusUi.text}
                          </div>
                          <button className="text-gray-400 hover:text-gray-700 bg-white border border-gray-200 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors hover:bg-gray-50" onClick={() => setSelectedApplication(job)}>
                             <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row (Large Timeline) */}
                      <div className="flex items-end justify-between w-full">
                        <div className="w-[85%] max-w-[700px] pl-2 sm:pl-8">
                          <div className="relative flex justify-between group">
                             {/* Track Line */}
                             <div className="absolute top-[12px] left-[15px] right-[15px] h-[2px] bg-gray-200 -z-10 transition-colors duration-300"></div>
                             
                             {/* Steps */}
                             <div className="flex flex-col items-center group/item cursor-default hover:-translate-y-1 transition-transform duration-300">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-blue-600 ring-[6px] ring-blue-50 shadow-sm`}>
                                   <Check size={12} strokeWidth={4} className="text-white" />
                                </div>
                                <span className="text-[13px] font-extrabold mt-3.5 text-gray-900">Applied</span>
                                <span className="text-[11px] font-medium text-gray-400 mt-1">{moment(job.date).format('MMM DD')}</span>
                             </div>

                             <div className="flex flex-col items-center group/item cursor-default hover:-translate-y-1 transition-transform duration-300">
                                {isRejected ? (
                                    <div className="w-6 h-6 rounded-full bg-red-500 ring-[6px] ring-red-50 flex items-center justify-center text-white shadow-sm"><X size={12} strokeWidth={4} /></div>
                                ) : (
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isScreening ? (job.status === 'Pending' ? 'bg-amber-100 border-2 border-amber-500 text-amber-600' : 'bg-blue-600 ring-[6px] ring-blue-50 text-white') : 'bg-white border-[3px] border-gray-200'} shadow-sm`}>
                                       {isScreening && job.status === 'Pending' && <Clock size={12} strokeWidth={3} />}
                                       {isScreening && job.status !== 'Pending' && !isRejected && <Check size={12} strokeWidth={4} />}
                                    </div>
                                )}
                                <span className={`text-[13px] font-extrabold mt-3.5 ${isRejected ? 'text-red-500' : (isScreening ? (job.status === 'Pending' ? 'text-amber-600' : 'text-gray-900') : 'text-gray-400')}`}>
                                  {isRejected ? 'Rejected' : 'Screening'}
                                </span>
                             </div>

                             <div className="flex flex-col items-center group/item cursor-default hover:-translate-y-1 transition-transform duration-300">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isInterview ? 'bg-blue-600 ring-[6px] ring-blue-50 text-white' : 'bg-white border-[3px] border-gray-200'} shadow-sm`}>
                                   {isInterview && <Check size={12} strokeWidth={4} />}
                                </div>
                                <span className={`text-[13px] font-extrabold mt-3.5 ${isInterview ? 'text-gray-900' : 'text-gray-400'}`}>Interview</span>
                             </div>

                             <div className="flex flex-col items-center group/item cursor-default hover:-translate-y-1 transition-transform duration-300">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isOffer ? 'bg-emerald-500 ring-[6px] ring-emerald-50 text-white' : 'bg-white border-[3px] border-gray-200'} shadow-sm`}>
                                   {isOffer && <Check size={12} strokeWidth={4} />}
                                </div>
                                <span className={`text-[13px] font-extrabold mt-3.5 ${isOffer ? 'text-gray-900' : 'text-gray-400'}`}>Offer</span>
                             </div>
                          </div>
                        </div>
                        
                        <div className="shrink-0 mb-4 sm:mb-2">
                          <button onClick={() => setSelectedApplication(job)} className="border border-gray-200 text-blue-600 font-bold text-[13px] px-6 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm hover:shadow">
                            View Details <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
              })}

              {validApplications.length === 0 && (
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Briefcase size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md text-sm">You haven't applied to any jobs yet. Start exploring opportunities to kickstart your career.</p>
                  <a href="/" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm">Browse Jobs</a>
                </div>
              )}
            </div>

            {/* Bottom Promo Banner */}
            <div className="mt-8 bg-gradient-to-br from-[#f0f7ff] to-[#f8fafc] border border-blue-100 rounded-2xl p-8 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between shadow-sm">
              
              <div className="w-full sm:w-1/3 flex justify-center mb-8 sm:mb-0 relative z-10 shrink-0">
                <svg width="220" height="180" viewBox="0 0 200 160" fill="none" className="hover:scale-105 transition-transform duration-500">
                  <path d="M160 80C160 113.137 133.137 140 100 140C66.8629 140 40 113.137 40 80C40 46.8629 66.8629 20 100 20C133.137 20 160 46.8629 160 80Z" fill="#e0f2fe" opacity="0.6"/>
                  <path d="M60 140C60 110 80 90 100 90C120 90 140 110 140 140" fill="#3b82f6" />
                  <circle cx="100" cy="70" r="18" fill="#fde047" />
                  <path d="M92 68C94 68 94 68 96 68" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
                  <path d="M104 68C106 68 106 68 108 68" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
                  <path d="M95 76C98 78 102 78 105 76" stroke="#854d0e" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M30 140L170 140" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M70 140L130 140L125 105L75 105Z" fill="#1e293b" />
                  <path d="M77 108L123 108L127 138L73 138Z" fill="#334155" />
                  <rect x="85" y="115" width="30" height="15" fill="#f8fafc" opacity="0.15" rx="2" />
                  <circle cx="100" cy="122" r="3" fill="#60a5fa" opacity="0.5" />
                  <rect x="150" y="50" width="30" height="40" rx="4" fill="white" className="drop-shadow-sm" />
                  <rect x="155" y="70" width="6" height="15" rx="2" fill="#3b82f6" />
                  <rect x="163" y="60" width="6" height="25" rx="2" fill="#10b981" />
                  <rect x="171" y="75" width="6" height="10" rx="2" fill="#f59e0b" />
                  <path d="M45 45L48 55L58 55L50 61L53 71L45 65L37 71L40 61L32 55L42 55L45 45Z" fill="#fbbf24" className="animate-pulse" />
                </svg>
              </div>

              <div className="w-full sm:w-2/3 flex flex-col items-center sm:items-start text-center sm:text-left z-10 pl-0 sm:pl-8">
                <p className="text-[12px] font-bold text-blue-600 uppercase tracking-wider mb-2">Take the Next Step</p>
                <h3 className="text-[26px] font-extrabold text-gray-900 mb-2 leading-tight">Upgrade Your Career Journey</h3>
                <p className="text-gray-600 text-[14px] mb-6 max-w-md leading-relaxed font-medium">
                  Unlock personalized job matches, skill recommendations and expert insights to accelerate your career growth.
                </p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-3 mb-8">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Search size={12}/></div> 
                    Personalized matches
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><TrendingUp size={12}/></div> 
                    Track career growth
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Lightbulb size={12}/></div> 
                    Expert insights
                  </div>
                </div>
                
                <button className="bg-blue-600 text-white text-[14px] font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:shadow-lg transform hover:-translate-y-0.5">
                  Explore More →
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Profile Status & Pro Tip */}
          <div className="w-full xl:w-[350px] flex flex-col gap-6 shrink-0">
            
            {/* Profile Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[17px] font-extrabold text-gray-900 flex items-center gap-2">
                  <User size={20} className="text-blue-600" /> Profile Status
                </h2>
                <span className={`text-[12px] font-black px-2.5 py-1 rounded-lg ${profileCompletion === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {profileCompletion}%
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke={profileCompletion === 100 ? "#10b981" : "#f59e0b"} strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * profileCompletion) / 100} strokeLinecap="round" className="animate-[dash_1.5s_ease-out] transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-gray-900">{profileCompletion}%</span>
                  </div>
                </div>
                
                {/* AI Auto Match Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-8 relative overflow-hidden w-full shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-xl"></div>
                  <div className="flex gap-3 items-start">
                    <div className="text-blue-600 mt-0.5 shrink-0 bg-white p-1.5 rounded-lg shadow-sm border border-blue-50">
                      <Lightbulb size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-extrabold text-gray-900 mb-1 leading-tight">Auto Job Provisioning 🚀</h4>
                      <p className="text-[11px] font-medium text-gray-600 leading-relaxed pr-1">
                        {profileCompletion === 100 
                          ? "Your profile is fully complete. AI is actively finding and recommending the best roles for you!"
                          : "Once you provide full details & resume, our AI will automatically provide jobs tailored exclusively for you."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3 mb-8 text-[13px] font-medium text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${userData.name && userData.email ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}><Check size={12} strokeWidth={3}/></div>
                    Basic Information <span className="ml-auto text-[10px] text-gray-400">20%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${userData.resume ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}><Check size={12} strokeWidth={3}/></div>
                    Resume Uploaded <span className="ml-auto text-[10px] text-gray-400">30%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${userData.skills && userData.skills.length > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}><Check size={12} strokeWidth={3}/></div>
                    Skills Added <span className="ml-auto text-[10px] text-gray-400">15%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${userData.phone || userData.college || userData.city ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}><Check size={12} strokeWidth={3}/></div>
                    Additional Details <span className="ml-auto text-[10px] text-gray-400">25%</span>
                  </div>
                </div>

                {userData.resume ? (
                  <a target='_blank' href={userData.resume} rel="noreferrer" className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-[14px] shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-lg transform hover:-translate-y-0.5">
                    <FileText size={18} /> View Resume
                  </a>
                ) : (
                  <div className="w-full bg-amber-50 text-amber-700 font-bold py-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-amber-100 text-center px-4">
                    <span className="text-[13px]">Resume Missing</span>
                    <span className="text-[11px] font-medium opacity-80">Upload below to reach 100%</span>
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="font-extrabold text-gray-900 text-[15px] mb-4">Update Resume</h3>
                
                {isEdit || !userData.resume ? (
                  <div className="space-y-4">
                    <label className="border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <Upload size={20} className="text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                      <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600 transition-colors text-center line-clamp-1">
                        {resume ? resume.name : "Click to select file"}
                      </span>
                      <input onChange={e => setResume(e.target.files[0])} accept='application/pdf' type="file" hidden />
                    </label>
                    <div className="flex gap-3">
                      {userData.resume && (
                        <button onClick={() => { setIsEdit(false); setResume(null); }} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-[13px]">
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={updateResume} 
                        disabled={!resume}
                        className={`flex-1 font-bold py-3 rounded-xl transition-colors text-[13px] ${resume ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setIsEdit(true)} className="w-full bg-white border border-gray-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 text-gray-700 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-[14px]">
                    <Upload size={18} /> {userData.resume ? 'Replace Resume' : 'Add Resume'}
                  </button>
                )}
              </div>
            </div>

            {/* Pro Tip Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative hover:shadow-md transition-shadow">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={16}/></button>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h4 className="text-[14px] font-extrabold text-blue-600 mb-1.5">Pro Tip</h4>
                  <p className="text-[13px] font-medium text-gray-600 leading-relaxed pr-2">
                    A tailored resume can 3x your chances of getting shortlisted.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedApplication(null)}>
          <div 
            className="bg-white sm:rounded-3xl shadow-2xl w-full h-full sm:h-auto sm:max-h-[90vh] max-w-3xl overflow-hidden flex flex-col animate-[fade-in_0.2s_ease-out]" 
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Application Details</h2>
              <button onClick={() => setSelectedApplication(null)} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
                <div className="w-24 h-24 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center p-4 shrink-0">
                  <img className="max-h-full max-w-full object-contain" src={selectedApplication.companyId.image} alt={selectedApplication.companyId.name} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">{selectedApplication.jobId.title}</h3>
                  <p className="text-lg font-bold text-blue-600 mb-3">{selectedApplication.companyId.name}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><MapPin size={14} className="text-gray-400" /> {selectedApplication.jobId.location}</span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Briefcase size={14} className="text-gray-400" /> {selectedApplication.jobId.jobType || 'Full Time'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-5">Application Timeline</h4>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
                  <div className="relative">
                    <div className="absolute top-[15px] left-8 right-8 h-1 bg-gray-100 rounded-full hidden sm:block"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
                      <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0 ring-4 ring-white">
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <div className="sm:text-center">
                          <p className="font-bold text-gray-900 text-[14px]">Applied</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">{moment(selectedApplication.date).format('MMM Do, YYYY')}</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white ${selectedApplication.status === 'Pending' ? 'bg-amber-100 border-2 border-amber-500 text-amber-600' : 'bg-blue-600 text-white'}`}>
                          {selectedApplication.status === 'Pending' ? <Clock size={14} strokeWidth={2.5} /> : <Check size={16} strokeWidth={3} />}
                        </div>
                        <div className="sm:text-center">
                          <p className={`font-bold text-[14px] ${selectedApplication.status === 'Pending' ? 'text-amber-600' : 'text-gray-900'}`}>Under Review</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">HR Screening</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1">
                        {selectedApplication.status === 'Pending' ? (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 ring-4 ring-white">
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          </div>
                        ) : selectedApplication.status === 'Rejected' ? (
                          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-200 shrink-0 ring-4 ring-white">
                            <X size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0 ring-4 ring-white">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                        <div className="sm:text-center">
                          <p className={`font-bold text-[14px] ${
                            selectedApplication.status === 'Pending' ? 'text-gray-400' : 
                            selectedApplication.status === 'Rejected' ? 'text-red-600' : 'text-emerald-600'
                          }`}>Decision</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                            {selectedApplication.status === 'Pending' ? 'Awaiting' : selectedApplication.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase size={16} className="text-blue-500"/> Job Requirements</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Level</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedApplication.jobId.level || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Salary</p>
                      <p className="text-sm font-semibold text-gray-800">₹{selectedApplication.jobId.salary?.toLocaleString() || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 size={16} className="text-purple-500"/> About {selectedApplication.companyId.name}</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Industry</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedApplication.companyId.industry || 'Technology'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Size</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedApplication.companyId.companySize || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Applications