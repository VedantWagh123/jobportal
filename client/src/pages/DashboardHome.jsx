import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { Briefcase, Users, UserCheck, CalendarDays, PlusCircle, LayoutList, ChevronRight } from 'lucide-react'

const DashboardHome = () => {
    const { backendUrl, companyToken } = useContext(AppContext)
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [jobs, setJobs] = useState([])
    const [applications, setApplications] = useState([])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            // Fetch jobs and applications concurrently
            const [jobsRes, appsRes] = await Promise.all([
                axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } }),
                axios.get(backendUrl + '/api/company/applicants', { headers: { token: companyToken } })
            ])

            if (jobsRes.data.success) {
                setJobs(jobsRes.data.jobsData.reverse())
            }
            if (appsRes.data.success) {
                setApplications(appsRes.data.applications.reverse())
            }
        } catch (error) {
            toast.error("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (companyToken) {
            fetchDashboardData()
        }
    }, [companyToken])

    if (loading) {
        return <div className="h-full flex items-center justify-center"><Loading /></div>
    }

    // Calculate Metrics safely
    const activeJobsCount = jobs.filter(job => job.visible).length
    const totalApplicationsCount = applications.length
    const shortlistedCount = applications.filter(app => ['Screening', 'Test_Cleared', 'GD_Cleared', 'Interview_Scheduled', 'Interview_Completed', 'Hired'].includes(app.status)).length
    const interviewCount = applications.filter(app => ['Interview_Scheduled', 'Interview_Completed'].includes(app.status)).length

    const recentJobs = jobs.slice(0, 4)
    const recentApps = applications.slice(0, 4)

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Here is what's happening with your job postings.</p>
                </div>
                <button onClick={() => navigate('/dashboard/add-job')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2 text-sm w-fit">
                    <PlusCircle size={18} />
                    Post New Job
                </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Active Jobs</p>
                            <h3 className="text-3xl font-bold text-gray-900">{activeJobsCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Briefcase size={20} />
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Applications</p>
                            <h3 className="text-3xl font-bold text-gray-900">{totalApplicationsCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Shortlisted</p>
                            <h3 className="text-3xl font-bold text-gray-900">{shortlistedCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <UserCheck size={20} />
                        </div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Interviews</p>
                            <h3 className="text-3xl font-bold text-gray-900">{interviewCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <CalendarDays size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Grid for Recent Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recent Jobs Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Recently Posted Jobs</h2>
                        <button onClick={() => navigate('/dashboard/manage-jobs')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View all <ChevronRight size={16} />
                        </button>
                    </div>
                    
                    <div className="flex-1 p-2">
                        {recentJobs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                <LayoutList size={40} className="text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No jobs posted yet</p>
                                <p className="text-sm text-gray-400 mt-1">Create your first job to start hiring.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {recentJobs.map((job, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors rounded-xl mx-2 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{job.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span>{job.location}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{moment(job.date).fromNow()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold mb-1 ${job.visible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {job.visible ? 'Active' : 'Hidden'}
                                            </span>
                                            <p className="text-xs text-gray-500 font-medium">{job.applicants} Applicants</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Applications Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                        <button onClick={() => navigate('/dashboard/view-applications')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View all <ChevronRight size={16} />
                        </button>
                    </div>
                    
                    <div className="flex-1 p-2">
                        {recentApps.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                <Users size={40} className="text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No applications yet</p>
                                <p className="text-sm text-gray-400 mt-1">Applications will appear here once candidates apply.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {recentApps.map((app, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors rounded-xl mx-2 flex items-center gap-4">
                                        <img src={app.userId.image} alt={app.userId.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">{app.userId.name}</h4>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">Applied for <span className="font-medium text-gray-700">{app.jobId?.title || 'Unknown Job'}</span></p>
                                        </div>
                                        <div>
                                            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                                                {app.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardHome
