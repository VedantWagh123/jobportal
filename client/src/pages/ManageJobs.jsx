import React, { useContext, useEffect, useState, useRef } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import {
  Search, Plus, Briefcase, Eye, EyeOff, CheckCircle,
  Users, MapPin, Globe, Lock, MoreVertical, ChevronLeft, ChevronRight,
  Brain, Database, Cloud, Cpu, Code, Shield, Filter, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

// ─── Helper Functions ────────────────────────────────────────────────────────
const getJobIconInfo = (title = '') => {
  const t = title.toLowerCase()
  if (t.includes('ai') || t.includes('ml') || t.includes('llm')) {
    return { icon: Brain, color: 'text-violet-600', bg: 'bg-violet-100' }
  }
  if (t.includes('database') || t.includes('data') || t.includes('sql')) {
    return { icon: Database, color: 'text-red-500', bg: 'bg-red-50' }
  }
  if (t.includes('cloud') || t.includes('devops') || t.includes('azure') || t.includes('aws')) {
    return { icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-50' }
  }
  if (t.includes('backend') || t.includes('developer') || t.includes('engineer') || t.includes('code')) {
    return { icon: Code, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  }
  if (t.includes('python') || t.includes('node') || t.includes('java')) {
    return { icon: Cpu, color: 'text-amber-500', bg: 'bg-amber-50' }
  }
  if (t.includes('security') || t.includes('cyber')) {
    return { icon: Shield, color: 'text-slate-600', bg: 'bg-slate-100' }
  }
  return { icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' }
}

const TrendBadge = ({ value }) => {
  const positive = value >= 0
  return (
    <div className={`flex items-center gap-1 text-[11px] font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {positive ? '+' : ''}{value}%
      <span className="text-gray-400 font-normal ml-0.5 hidden sm:inline">vs last month</span>
    </div>
  )
}

// ─── Subcomponents ───────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, trend, iconBg, iconColor, bgTint }) => (
  <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between ${bgTint}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-sm shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      {trend !== undefined && <TrendBadge value={trend} />}
    </div>
    <div>
      <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
    </div>
  </div>
)

// ─── Main Component ─────────────────────────────────────────────────────────
const ManageJobs = () => {
  const navigate = useNavigate()
  const { backendUrl, companyToken } = useContext(AppContext)

  const [jobs, setJobs] = useState(false)
  const [filter, setFilter] = useState('All') // 'All', 'Active', 'Hidden'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [sortOrder, setSortOrder] = useState('Newest First')
  
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 8

  // Dropdown states for actions
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const dropdownRef = useRef(null)

  // Fetch Jobs
  const fetchCompanyJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } })
      if (data.success) {
        setJobs(data.jobsData.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Toggle Visibility
  const changeJobVisiblity = async (id) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/company/change-visiblity', { id }, { headers: { token: companyToken } })
      if (data.success) {
        toast.success('Job visibility updated successfully!')
        fetchCompanyJobs()
      } else {
        toast.error(data.message || 'Failed to update visibility')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (companyToken) fetchCompanyJobs()
  }, [companyToken])

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown-btn') && !event.target.closest('.action-dropdown-menu')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (jobs === false) return <div className="h-[60vh] flex items-center justify-center"><Loading /></div>

  // ─── Data Calculations ───────────────────────────────────────────────────
  const totalJobsCount = jobs.length
  const activeJobsCount = jobs.filter(j => j.visible).length
  const hiddenJobsCount = jobs.filter(j => !j.visible).length
  const totalApplicantsCount = jobs.reduce((acc, job) => acc + (job.applicants || 0), 0)

  const uniqueLocations = ['All Locations', ...new Set(jobs.map(j => j.location).filter(Boolean))]

  // Filtering & Sorting
  let processedJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTab = filter === 'All' ? true : filter === 'Active' ? job.visible : !job.visible
    const matchLocation = selectedLocation === 'All Locations' ? true : job.location === selectedLocation
    return matchSearch && matchTab && matchLocation
  })

  if (sortOrder === 'Oldest First') {
    processedJobs = [...processedJobs].reverse()
  }

  // Pagination
  const totalPages = Math.ceil(processedJobs.length / jobsPerPage)
  const currentJobs = processedJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage + 1
  const endIndex = Math.min(currentPage * jobsPerPage, processedJobs.length)

  return (
    <div className='w-full pb-10 space-y-6'>
      
      {/* ── Header ── */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm relative overflow-hidden'>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className='flex items-center gap-4 z-10'>
          <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shadow-sm'>
            <Briefcase size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className='text-2xl font-extrabold text-gray-900 tracking-tight'>Manage Jobs</h1>
            <p className='text-[13px] text-gray-500 font-medium mt-0.5'>Track and manage your company's job postings.</p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard/add-job')} className='z-10 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-[14px] w-full sm:w-auto shrink-0'>
          <Plus size={18} /> Add New Job
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value={totalJobsCount} icon={Briefcase} trend={20} iconBg="bg-blue-50" iconColor="text-blue-500" bgTint="hover:bg-blue-50/10" />
        <StatCard title="Active Jobs" value={activeJobsCount} icon={CheckCircle} trend={12} iconBg="bg-emerald-50" iconColor="text-emerald-500" bgTint="hover:bg-emerald-50/10" />
        <StatCard title="Hidden Jobs" value={hiddenJobsCount} icon={EyeOff} trend={0} iconBg="bg-orange-50" iconColor="text-orange-500" bgTint="hover:bg-orange-50/10" />
        <StatCard title="Total Applicants" value={totalApplicantsCount} icon={Users} trend={35} iconBg="bg-purple-50" iconColor="text-purple-500" bgTint="hover:bg-purple-50/10" />
      </div>

      {/* ── Main Content Area ── */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col'>
        
        {/* Filters & Search Toolbar */}
        <div className='p-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-gray-50/30'>
          
          {/* Tabs */}
          <div className='flex items-center gap-2'>
            {[
              { label: 'All', count: totalJobsCount },
              { label: 'Active', count: activeJobsCount },
              { label: 'Hidden', count: hiddenJobsCount }
            ].map(tab => (
              <button 
                key={tab.label}
                onClick={() => { setFilter(tab.label); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-1.5 ${filter === tab.label ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {tab.label} <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${filter === tab.label ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            {/* Search */}
            <div className='relative flex-1 sm:w-[260px]'>
              <Search size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
              <input 
                type="text" 
                placeholder="Search jobs by title, location..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className='w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm'
              />
            </div>

            {/* Location Dropdown */}
            {uniqueLocations.length > 1 && (
              <select 
                value={selectedLocation} 
                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                className='px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm'
              >
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            )}

            {/* Sort Dropdown */}
            <select 
              value={sortOrder} 
              onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
              className='px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm'
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
            </select>

            {/* Filter Button */}
            <button className='flex items-center justify-center gap-2 bg-white border border-gray-200 text-blue-600 px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-blue-50 transition-colors shadow-sm'>
              <Filter size={15} /> Filter
            </button>
          </div>
        </div>

        {/* Table / List Area */}
        <div className='flex-1 overflow-x-auto'>
          {processedJobs.length === 0 ? (
            <div className='p-16 flex flex-col items-center justify-center text-center'>
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100 shadow-sm">
                <Search size={24} />
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-1'>No jobs found</h3>
              <p className='text-sm text-gray-500 mb-5 max-w-sm'>We couldn't find any jobs matching your current search or filters. Try adjusting them.</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilter('All'); setSelectedLocation('All Locations'); }}
                className='text-blue-600 font-bold text-sm bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors'
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-gray-50/50 border-b border-gray-100'>
                  <th className='pl-6 pr-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider w-[40px]'><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider'>Job Title</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider hidden lg:table-cell'>Location</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider hidden md:table-cell'>Posted Date</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider text-center'>Applicants</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider text-center'>Status</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider text-center hidden sm:table-cell'>Visibility</th>
                  <th className='px-4 py-4 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider text-right pr-6'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {currentJobs.map((job, idx) => {
                  const jobIconInfo = getJobIconInfo(job.title)
                  const isVisible = job.visible
                  return (
                    <tr key={job._id || idx} className='hover:bg-blue-50/30 transition-colors group'>
                      <td className='pl-6 pr-4 py-4'><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" /></td>
                      
                      {/* Title & Mobile Merged Info */}
                      <td className='px-4 py-4 min-w-[280px]'>
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center shadow-sm ${jobIconInfo.bg}`}>
                            <jobIconInfo.icon size={20} className={jobIconInfo.color} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[14px] text-gray-900 leading-tight mb-0.5">{job.title}</h4>
                            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                              <span className="flex items-center gap-1 lg:hidden"><MapPin size={11} /> {job.location} •</span>
                              <span>Full-time</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Desktop Location */}
                      <td className='px-4 py-4 text-[13px] font-medium text-gray-600 hidden lg:table-cell'>
                        {job.location}
                      </td>

                      {/* Desktop Date */}
                      <td className='px-4 py-4 hidden md:table-cell'>
                        <p className="text-[13px] font-bold text-gray-700">{moment(job.date).format('MMM DD, YYYY')}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{moment(job.date).fromNow()}</p>
                      </td>

                      {/* Applicants */}
                      <td className='px-4 py-4 text-center'>
                        <button 
                          onClick={() => navigate('/dashboard/view-applications')} 
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[12px] transition-colors border border-blue-100"
                        >
                          <Users size={13} /> {job.applicants || 0}
                        </button>
                      </td>

                      {/* Status */}
                      <td className='px-4 py-4 text-center'>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide border ${isVisible ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {isVisible ? 'Active' : 'Hidden'}
                        </span>
                      </td>

                      {/* Visibility */}
                      <td className='px-4 py-4 text-center hidden sm:table-cell'>
                        <div className={`inline-flex items-center gap-1.5 text-[12px] font-bold ${isVisible ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {isVisible ? <Globe size={14} /> : <Lock size={14} />}
                          {isVisible ? 'Public' : 'Private'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className='px-4 py-4 text-right pr-6 relative'>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenDropdownId(openDropdownId === job._id ? null : job._id)
                          }}
                          className="action-dropdown-btn p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors inline-flex"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openDropdownId === job._id && (
                          <div className="action-dropdown-menu absolute right-8 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 text-left animate-in fade-in slide-in-from-top-2">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation();
                                navigate('/dashboard/view-applications', { state: { filterJob: job.title } }); 
                                setOpenDropdownId(null); 
                              }}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2"
                            >
                              <Users size={15} /> View Applicants
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                e.preventDefault();
                                changeJobVisiblity(job._id); 
                                setOpenDropdownId(null); 
                              }}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              {isVisible ? <EyeOff size={15} className="text-orange-500" /> : <Eye size={15} className="text-emerald-500" />}
                              {isVisible ? 'Hide Job Posting' : 'Make Public'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {processedJobs.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[13px] font-medium text-gray-500">
              Showing <span className="font-bold text-gray-900">{startIndex}</span> to <span className="font-bold text-gray-900">{endIndex}</span> of <span className="font-bold text-gray-900">{processedJobs.length}</span> jobs
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'}`}
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

    </div>
  )
}

export default ManageJobs