import { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'
import moment from 'moment'
import Footer from '../components/Footer'
import { AppContext } from '../context/AppContext'
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { 
  Briefcase, MapPin, Building, Calendar, CheckCircle2, Clock, 
  XCircle, ChevronRight, FileText, Upload, Check, Building2, 
  ArrowRight, X
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

  // Calculate KPIs
  const validApplications = userApplications.filter(job => job.jobId && job.companyId)
  const totalApplied = validApplications.length
  const pendingCount = validApplications.filter(job => job.status === 'Pending').length
  const acceptedCount = validApplications.filter(job => job.status === 'Accepted' || job.status.includes('Cleared')).length
  const rejectedCount = validApplications.filter(job => job.status === 'Rejected').length

  const getStatusVisuals = (status) => {
    if (status === 'Accepted' || status.includes('Cleared')) {
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'Accepted' }
    }
    if (status === 'Rejected') {
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'Rejected' }
    }
    return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'Pending Review' }
  }

  return (
    <div className="font-sans">
      <main className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 md:py-14">
        
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Candidate Dashboard</h1>
          <p className="text-gray-500 mt-2 font-medium">Track and manage your job applications in one place.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Applications List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Applied</p>
                <p className="text-3xl font-black text-blue-600">{totalApplied}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">In Progress</p>
                <p className="text-3xl font-black text-amber-500">{pendingCount}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Offers / Clear</p>
                <p className="text-3xl font-black text-emerald-500">{acceptedCount}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rejected</p>
                <p className="text-3xl font-black text-red-500">{rejectedCount}</p>
              </div>
            </div>

            {/* Application List */}
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" /> Recent Applications
            </h2>

            <div className="space-y-4">
              {[...validApplications]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((job, index) => {
                  const statusUi = getStatusVisuals(job.status);
                  const StatusIcon = statusUi.icon;
                  return (
                    <div 
                      key={index} 
                      onClick={() => setSelectedApplication(job)}
                      className="group bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors"></div>
                      
                      <div className="flex items-start sm:items-center gap-5">
                        <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-2.5 shadow-sm shrink-0">
                          <img className="max-h-full max-w-full object-contain" src={job.companyId.image} alt={job.companyId.name} />
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{job.jobId.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[13px] font-medium text-gray-500">
                            <span className="flex items-center gap-1"><Building2 size={14} className="text-gray-400" /> {job.companyId.name}</span>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {job.jobId.location}</span>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" /> {moment(job.date).format('MMM Do, YYYY')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-start sm:self-auto mt-2 sm:mt-0">
                        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border ${statusUi.bg} ${statusUi.border} ${statusUi.color} text-xs font-bold`}>
                          <StatusIcon size={14} strokeWidth={2.5} />
                          {job.status.replace('_', ' ')}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  )
              })}

              {validApplications.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Briefcase size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md">You haven't applied to any jobs yet. Start exploring opportunities to kickstart your career.</p>
                  <a href="/" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Browse Jobs</a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Resume Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" /> Resume Status
              </h2>

              <div className="mb-8">
                {userData.resume ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm mb-3 relative z-10">
                      <Check size={24} strokeWidth={3} />
                    </div>
                    <h3 className="font-bold text-emerald-900 text-lg relative z-10">Resume Uploaded</h3>
                    <p className="text-[13px] text-emerald-700 font-medium mt-1 mb-4 relative z-10">Your profile is ready for applications.</p>
                    <a target='_blank' href={userData.resume.replace('/upload/', '/upload/fl_attachment/')} rel="noreferrer" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors relative z-10">
                      View Resume
                    </a>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm mb-3">
                      <Upload size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-amber-900 text-lg">Action Required</h3>
                    <p className="text-[13px] text-amber-700 font-medium mt-1">Upload your resume to apply for jobs.</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-900 text-[14px] mb-4">Update Resume</h3>
                
                {isEdit || !userData.resume ? (
                  <div className="space-y-4">
                    <label className="border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-500 shadow-sm mb-3 transition-colors">
                        <Upload size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                        {resume ? resume.name : "Click to select file"}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-1 font-medium">PDF only (Max 5MB)</span>
                      <input onChange={e => setResume(e.target.files[0])} accept='application/pdf' type="file" hidden />
                    </label>
                    <div className="flex gap-3">
                      {userData.resume && (
                        <button onClick={() => { setIsEdit(false); setResume(null); }} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={updateResume} 
                        disabled={!resume}
                        className={`flex-1 font-bold py-2.5 rounded-xl transition-colors ${resume ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setIsEdit(true)} className="w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                    <Upload size={16} /> Replace Resume
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Application Details Slide-over / Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedApplication(null)}>
          <div 
            className="bg-white sm:rounded-3xl shadow-2xl w-full h-full sm:h-auto sm:max-h-[90vh] max-w-3xl overflow-hidden flex flex-col animate-[fade-in_0.2s_ease-out]" 
            onClick={e => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Application Details</h2>
              <button onClick={() => setSelectedApplication(null)} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              
              {/* Top Profile Area */}
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

              {/* Status Tracker */}
              <div className="mb-10">
                <h4 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-5">Application Timeline</h4>
                
                <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="relative">
                    {/* Background Line */}
                    <div className="absolute top-[15px] left-8 right-8 h-1 bg-gray-100 rounded-full hidden sm:block"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
                      
                      {/* Step 1: Applied */}
                      <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0 ring-4 ring-white">
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <div className="sm:text-center">
                          <p className="font-bold text-gray-900 text-[14px]">Applied</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">{moment(selectedApplication.date).format('MMM Do, YYYY')}</p>
                        </div>
                      </div>

                      {/* Step 2: Under Review */}
                      <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white ${selectedApplication.status === 'Pending' ? 'bg-amber-100 border-2 border-amber-500 text-amber-600' : 'bg-blue-600 text-white'}`}>
                          {selectedApplication.status === 'Pending' ? <Clock size={14} strokeWidth={2.5} /> : <Check size={16} strokeWidth={3} />}
                        </div>
                        <div className="sm:text-center">
                          <p className={`font-bold text-[14px] ${selectedApplication.status === 'Pending' ? 'text-amber-600' : 'text-gray-900'}`}>Under Review</p>
                          <p className="text-[11px] font-medium text-gray-500 mt-0.5">HR Screening</p>
                        </div>
                      </div>

                      {/* Step 3: Decision */}
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

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Job Info */}
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

                {/* Company Info */}
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