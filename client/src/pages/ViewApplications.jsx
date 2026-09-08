import React, { useContext, useEffect, useState, useRef } from 'react'
import moment from 'moment'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { useLocation } from 'react-router-dom'
import {
  Search, Users, CheckCircle, XCircle, Clock,
  MoreVertical, ChevronLeft, ChevronRight, Filter, Download, Briefcase, FileText, MapPin, Eye, GraduationCap, Phone, Map, Mail
} from 'lucide-react'

// ─── ATS Logic ──────────────────────────────────────────────────────────────
const ATS_PIPELINE = [
  'Applied', 'Screening', 'Test_Cleared', 'GD_Cleared',
  'Interview_Scheduled', 'Interview_Completed', 'Hired', 'Rejected'
]

const getNextStage = (current) => {
  if (current === 'Pending') return 'Screening'
  const idx = ATS_PIPELINE.indexOf(current)
  if (idx === -1 || idx >= ATS_PIPELINE.length - 1) return null
  return ATS_PIPELINE[idx + 1]
}

const STAGE_STYLES = {
  Pending:              'bg-gray-100 text-gray-700 border-gray-200',
  Applied:              'bg-blue-50 text-blue-700 border-blue-100',
  Screening:            'bg-violet-50 text-violet-700 border-violet-100',
  Test_Cleared:         'bg-cyan-50 text-cyan-700 border-cyan-100',
  GD_Cleared:           'bg-indigo-50 text-indigo-700 border-indigo-100',
  Interview_Scheduled:  'bg-amber-50 text-amber-700 border-amber-100',
  Interview_Completed:  'bg-orange-50 text-orange-700 border-orange-100',
  Hired:                'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected:             'bg-red-50 text-red-700 border-red-100',
}

const calculateMatch = (userSkills, jobSkills) => {
  if (!jobSkills?.length || !userSkills?.length) return 0
  
  const uSkillsArray = Array.isArray(userSkills) ? userSkills : (typeof userSkills === 'string' ? userSkills.split(',') : [])
  const jSkillsArray = Array.isArray(jobSkills) ? jobSkills : (typeof jobSkills === 'string' ? jobSkills.split(',') : [])

  const validUserSkills = uSkillsArray.map(s => typeof s === 'string' ? s.trim().toLowerCase() : '').filter(Boolean)
  const validJobSkills = jSkillsArray.map(s => typeof s === 'string' ? s.trim().toLowerCase() : '').filter(Boolean)
  
  if (!validJobSkills.length || !validUserSkills.length) return 0

  const matchCount = validJobSkills.filter(js => validUserSkills.some(us => us === js || us.includes(js) || js.includes(us))).length
  return Math.round((matchCount / validJobSkills.length) * 100)
}

// ─── Subcomponents ─────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, bgTint }) => (
  <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between ${bgTint}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-sm shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
    <div>
      <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
    </div>
  </div>
)

// ─── Main Component ────────────────────────────────────────────────────────
const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext)
  const location = useLocation()
  
  // Data State
  const [applicants, setApplicants] = useState(false)
  
  // Filter & Pagination State
  const [jobFilter, setJobFilter] = useState(location.state?.filterJob || 'All Jobs')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Action Dropdown & View Profile State
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [viewCandidate, setViewCandidate] = useState(null)
  const dropdownRef = useRef(null)

  // Feedback Modal State
  const [feedbackTarget, setFeedbackTarget] = useState(null)
  const [jobSkills, setJobSkills] = useState([])
  const [skillRatings, setSkillRatings] = useState({})
  const [overallComment, setOverallComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/applicants', { headers: { token: companyToken } })
      if (data.success) {
        setApplicants(data.applications.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (companyToken) fetchCompanyJobApplications()
  }, [companyToken])

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpenDropdownId(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Action Handlers
  const advanceStage = async (applicant, newStatus) => {
    setOpenDropdownId(null)
    
    // Trigger feedback for Hired/Rejected
    if (newStatus === 'Hired' || newStatus === 'Rejected') {
      try {
        const { data } = await axios.get(`${backendUrl}/api/company/job-skills/${applicant.jobId._id}`, { headers: { token: companyToken } })
        const skills = data.success && data.skills.length > 0 ? data.skills : ['Overall Performance']
        setJobSkills(skills)
        const initRatings = {}
        skills.forEach(s => initRatings[s] = null)
        setSkillRatings(initRatings)
        setOverallComment('')
        setFeedbackTarget({ application: applicant, finalStatus: newStatus })
      } catch {
        toast.error('Failed to load job skills for feedback.')
      }
      return
    }

    // Direct advance
    try {
      const { data } = await axios.post(backendUrl + '/api/company/change-status', { id: applicant._id, status: newStatus }, { headers: { token: companyToken } })
      if (data.success) {
        toast.success(`Moved to ${newStatus.replace(/_/g, ' ')}`)
        fetchCompanyJobApplications()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    const missing = jobSkills.find(s => !skillRatings[s])
    if (missing) return toast.error(`Please rate "${missing}" before submitting.`)

    setSubmittingFeedback(true)
    try {
      const ratingsArray = jobSkills.map(s => ({ skillName: s, rating: skillRatings[s] }))
      const { data } = await axios.post(
        backendUrl + '/api/company/feedback',
        {
          applicationId: feedbackTarget.application._id,
          finalStatus: feedbackTarget.finalStatus,
          skillRatings: ratingsArray,
          overallComment
        },
        { headers: { token: companyToken } }
      )
      if (data.success) {
        toast.success(`Feedback submitted! Candidate marked as ${feedbackTarget.finalStatus}.`)
        setFeedbackTarget(null)
        fetchCompanyJobApplications()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (applicants === false) return <div className="h-[60vh] flex items-center justify-center"><Loading /></div>

  // ─── Data Preparation ────────────────────────────────────────────────────
  const validApplicants = applicants.filter(a => a.jobId && a.userId)
  
  const totalApps = validApplicants.length
  const hiredApps = validApplicants.filter(a => a.status === 'Hired').length
  const rejectedApps = validApplicants.filter(a => a.status === 'Rejected').length
  const pendingApps = totalApps - hiredApps - rejectedApps

  const uniqueJobs = ['All Jobs', ...new Set(validApplicants.map(a => a.jobId.title))]

  let processedApps = validApplicants.filter(app => {
    const searchStr = searchQuery.toLowerCase()
    const matchSearch = app.userId.name?.toLowerCase().includes(searchStr) || app.userId.email?.toLowerCase().includes(searchStr)
    const matchFilter = jobFilter === 'All Jobs' ? true : app.jobId.title === jobFilter
    return matchSearch && matchFilter
  })

  // Pagination
  const totalPages = Math.ceil(processedApps.length / itemsPerPage)
  const currentApps = processedApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, processedApps.length)

  return (
    <div className='w-full pb-10 space-y-6'>
      
      {/* ── Header ── */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm relative overflow-hidden'>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className='flex items-center gap-4 z-10'>
          <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center shadow-sm'>
            <FileText size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className='text-2xl font-extrabold text-gray-900 tracking-tight'>Applications</h1>
            <p className='text-[13px] text-gray-500 font-medium mt-0.5'>Review candidates and manage your recruitment pipeline.</p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={totalApps} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-500" bgTint="hover:bg-blue-50/10" />
        <StatCard title="In Pipeline" value={pendingApps} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-500" bgTint="hover:bg-amber-50/10" />
        <StatCard title="Candidates Hired" value={hiredApps} icon={CheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-500" bgTint="hover:bg-emerald-50/10" />
        <StatCard title="Rejected" value={rejectedApps} icon={XCircle} iconBg="bg-red-50" iconColor="text-red-500" bgTint="hover:bg-red-50/10" />
      </div>

      {/* ── Main Content Area ── */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col'>
        
        {/* Filters & Search Toolbar */}
        <div className='p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-gray-50/30'>
          
          <div className='relative flex-1 max-w-sm'>
            <Search size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
            <input 
              type="text" 
              placeholder="Search candidate name or email..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className='w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all shadow-sm'
            />
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={jobFilter} 
              onChange={(e) => { setJobFilter(e.target.value); setCurrentPage(1); }}
              className='px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-100 cursor-pointer shadow-sm w-full sm:w-auto max-w-[200px] truncate'
            >
              {uniqueJobs.map(job => <option key={job} value={job}>{job}</option>)}
            </select>

            <button className='flex items-center justify-center gap-2 bg-white border border-gray-200 text-purple-600 px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-purple-50 transition-colors shadow-sm shrink-0'>
              <Filter size={15} /> Filter
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className='flex-1 overflow-x-auto min-h-[300px]'>
          {processedApps.length === 0 ? (
            <div className='p-16 flex flex-col items-center justify-center text-center h-full'>
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100 shadow-sm">
                <Users size={24} />
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-1'>No applications found</h3>
              <p className='text-sm text-gray-500 mb-5 max-w-sm'>There are currently no candidates matching your filters.</p>
              <button 
                onClick={() => { setSearchQuery(''); setJobFilter('All Jobs'); }}
                className='text-purple-600 font-bold text-sm bg-purple-50 px-5 py-2.5 rounded-xl hover:bg-purple-100 transition-colors'
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-gray-50/50 border-b border-gray-100'>
                  <th className='pl-6 pr-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider w-[40px]'>#</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider'>Candidate</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider hidden md:table-cell'>Job Role</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider text-center'>Match</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider text-center'>Resume</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider text-right pr-6'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {currentApps.map((app, idx) => {
                  const next = getNextStage(app.status)
                  const isFinal = app.status === 'Hired' || app.status === 'Rejected'
                  const jSkills = app.jobId.skills?.length ? app.jobId.skills : [app.jobId.category || 'Problem Solving']
                  const match = calculateMatch(app.userId.skills, jSkills)
                  
                  return (
                    <tr key={app._id} className='hover:bg-purple-50/30 transition-colors group'>
                      <td className='pl-6 pr-4 py-4 text-[13px] font-semibold text-gray-400'>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      
                      {/* Candidate */}
                      <td className='px-4 py-4 min-w-[240px]'>
                        <div className="flex items-center gap-3.5">
                          {app.userId.image ? (
                            <img className='w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0' src={app.userId.image} alt='' />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold shrink-0">
                              {app.userId.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-[14px] text-gray-900 leading-tight mb-0.5 truncate max-w-[160px]">{app.userId.name}</h4>
                            <p className="text-[12px] text-gray-500 truncate max-w-[160px]">{app.userId.email}</p>
                            {/* Mobile Job Info */}
                            <p className="text-[11px] text-purple-600 font-semibold mt-1 md:hidden truncate max-w-[160px]">{app.jobId.title}</p>
                          </div>
                        </div>
                      </td>

                      {/* Job Role */}
                      <td className='px-4 py-4 hidden md:table-cell max-w-[200px]'>
                        <p className="font-bold text-[13px] text-gray-800 truncate">{app.jobId.title}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400">
                          <MapPin size={11} /> {app.jobId.location}
                        </div>
                      </td>

                      {/* Skill Match */}
                      <td className='px-4 py-4 text-center'>
                        <div className='flex flex-col items-center justify-center gap-1.5'>
                          <div className='w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden'>
                            <div className={`h-full rounded-full ${match >= 75 ? 'bg-emerald-500' : match >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${match}%` }}></div>
                          </div>
                          <span className={`text-[11px] font-extrabold ${match >= 75 ? 'text-emerald-600' : match >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{match}% Match</span>
                        </div>
                      </td>

                      {/* Resume */}
                      <td className='px-4 py-4 text-center'>
                        <a 
                          href={app.userId.resume ? app.userId.resume.replace('/upload/', '/upload/fl_attachment/') : '#'} 
                          target='_blank' 
                          rel='noopener noreferrer'
                          className='inline-flex items-center justify-center gap-1.5 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm'
                          title="Download Resume"
                        >
                          <Download size={14} />
                        </a>
                      </td>

                      {/* Status */}
                      <td className='px-4 py-4'>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide border ${STAGE_STYLES[app.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className='px-4 py-4 text-right pr-6'>
                        <div className='flex flex-col items-end gap-2'>
                          <button 
                            onClick={() => setViewCandidate(app)}
                            className="text-[11px] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors whitespace-nowrap w-fit flex items-center gap-1"
                          >
                            <Eye size={13} /> View Full Profile
                          </button>

                          {isFinal ? (
                            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100 inline-block text-center w-full max-w-[120px]">
                              {app.feedbackSubmitted ? '✅ Reviewed' : 'Closed'}
                            </span>
                          ) : (
                            <>
                              {!(next === 'Screening' && match < 50) && next && (
                                <button 
                                  onClick={() => advanceStage(app, next)}
                                  className="text-[11px] bg-purple-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-md shadow-purple-500/20 hover:bg-purple-700 hover:-translate-y-0.5 transition-all whitespace-nowrap w-fit flex items-center gap-1"
                                >
                                  Move to {next.replace(/_/g, ' ')} <ChevronRight size={13} />
                                </button>
                              )}
                              {app.status !== 'Interview_Completed' && (
                                <button 
                                  onClick={() => advanceStage(app, 'Rejected')}
                                  className="text-[11px] text-red-600 bg-red-50 px-3 py-1 rounded-lg font-bold hover:bg-red-100 transition-colors whitespace-nowrap w-fit flex items-center gap-1"
                                >
                                  <XCircle size={12} /> Reject
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {processedApps.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[13px] font-medium text-gray-500">
              Showing <span className="font-bold text-gray-900">{startIndex}</span> to <span className="font-bold text-gray-900">{endIndex}</span> of <span className="font-bold text-gray-900">{processedApps.length}</span> candidates
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all ${currentPage === i + 1 ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Feedback Modal (Glassmorphism) ── */}
      {feedbackTarget && (
        <div className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 opacity-100 animate-in fade-in duration-200'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100'>
            
            <div className='mb-5 border-b border-gray-100 pb-4'>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${feedbackTarget.finalStatus === 'Hired' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {feedbackTarget.finalStatus === 'Hired' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </div>
                <div>
                  <h3 className='text-[16px] font-extrabold text-gray-900'>Candidate Feedback</h3>
                  <p className='text-[12px] text-gray-500 font-medium'>
                    Finalize review for <span className="font-bold text-gray-800">{feedbackTarget.application.userId.name}</span>
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitFeedback}>
              <div className='space-y-4 mb-5 max-h-60 overflow-y-auto pr-2 custom-scrollbar'>
                {jobSkills.map(skill => (
                  <div key={skill} className='flex flex-col gap-2'>
                    <span className='text-[13px] font-extrabold text-gray-700'>{skill}</span>
                    <div className='grid grid-cols-3 gap-2'>
                      {['Strong', 'Weak', 'Missing'].map(rating => (
                        <button
                          key={rating}
                          type='button'
                          onClick={() => setSkillRatings(prev => ({ ...prev, [skill]: rating }))}
                          className={`text-[12px] py-1.5 rounded-lg font-bold border transition-all ${
                            skillRatings[skill] === rating
                              ? rating === 'Strong'
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                : rating === 'Weak'
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                                  : 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className='mb-6'>
                <label className='block text-[12px] font-extrabold text-gray-700 mb-2'>Overall Remarks (Optional)</label>
                <textarea
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  className='w-full border border-gray-200 rounded-xl p-3 text-[13px] focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none resize-none bg-gray-50/50'
                  rows='2'
                  placeholder='Add any internal notes about this candidate...'
                />
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={() => setFeedbackTarget(null)}
                  className='px-5 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submittingFeedback}
                  className={`px-5 py-2.5 text-[13px] font-bold text-white rounded-xl shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${feedbackTarget.finalStatus === 'Hired' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'}`}
                >
                  {submittingFeedback ? 'Saving...' : `Mark as ${feedbackTarget.finalStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Candidate Full Profile Modal ── */}
      {viewCandidate && (
        <div className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 opacity-100 animate-in fade-in duration-200' onClick={() => setViewCandidate(null)}>
          <div className='bg-white rounded-2xl w-full max-w-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]' onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className='bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden shrink-0'>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <button onClick={() => setViewCandidate(null)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                <XCircle size={20} />
              </button>
              
              <div className="flex items-center gap-5 relative z-10">
                {viewCandidate.userId.image ? (
                  <img className='w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-lg' src={viewCandidate.userId.image} alt='' />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white/20">
                    {viewCandidate.userId.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className='text-2xl font-black text-white tracking-tight leading-tight mb-1'>{viewCandidate.userId.name}</h2>
                  <p className='text-blue-100 font-medium flex items-center gap-1.5'><Briefcase size={14} /> Applied for {viewCandidate.jobId.title}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className='p-6 overflow-y-auto flex-1 custom-scrollbar'>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Contact Info */}
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Mail size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Email Address</p>
                        <p className="text-[13px] font-semibold text-gray-900">{viewCandidate.userId.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0"><Phone size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</p>
                        <p className="text-[13px] font-semibold text-gray-900">{viewCandidate.userId.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><Map size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Location</p>
                        <p className="text-[13px] font-semibold text-gray-900">{viewCandidate.userId.city || 'Not provided'} {viewCandidate.userId.address ? `, ${viewCandidate.userId.address}` : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education & Status */}
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">Application Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><GraduationCap size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">College / University</p>
                        <p className="text-[13px] font-semibold text-gray-900 truncate max-w-[200px]">{viewCandidate.userId.college || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0"><Clock size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Applied On</p>
                        <p className="text-[13px] font-semibold text-gray-900">{moment(viewCandidate.date).format('MMMM DD, YYYY')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center shrink-0"><CheckCircle size={14} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Current Status</p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-extrabold uppercase mt-0.5 border ${STAGE_STYLES[viewCandidate.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {viewCandidate.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h4 className="text-[12px] font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                  Candidate Skills
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${calculateMatch(viewCandidate.userId.skills, viewCandidate.jobId.skills) >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {calculateMatch(viewCandidate.userId.skills, viewCandidate.jobId.skills)}% Match with Job
                  </span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewCandidate.userId.skills && viewCandidate.userId.skills.length > 0 ? (
                    viewCandidate.userId.skills.map((skill, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-[12px] font-semibold">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-[13px] text-gray-500">No skills provided.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className='p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0'>
              <a 
                href={viewCandidate.userId.resume ? viewCandidate.userId.resume.replace('/upload/', '/upload/fl_attachment/') : '#'} 
                target='_blank' 
                rel='noopener noreferrer'
                className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2'
              >
                <Download size={16} /> Download Full Resume
              </a>
              <button
                onClick={() => setViewCandidate(null)}
                className='w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors'
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default ViewApplications