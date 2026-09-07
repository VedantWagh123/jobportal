import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Briefcase, Users, CheckCircle, TrendingUp } from 'lucide-react'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f43f5e', '#8b5cf6', '#14b8a6'];

const RecruitmentAnalytics = () => {
    const { backendUrl, companyToken } = useContext(AppContext)
    const [applications, setApplications] = useState(false)
    const [jobs, setJobs] = useState([])

    useEffect(() => {
        if (companyToken) {
            fetchData()
        }
    }, [companyToken])

    const fetchData = async () => {
        try {
            const [appRes, jobRes] = await Promise.all([
                axios.get(backendUrl + '/api/company/applicants', { headers: { token: companyToken } }),
                axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } })
            ]);

            if (appRes.data.success && jobRes.data.success) {
                setApplications(appRes.data.applications)
                setJobs(jobRes.data.jobsData)
            } else {
                toast.error("Failed to load analytics data")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    if (applications === false) return <Loading />

    // Metrics
    const totalJobs = jobs.length;
    const totalApplications = applications.length;
    const hired = applications.filter(a => a.status === 'Hired').length;
    const hireRate = totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : 0;

    // ATS Funnel Data
    const pipelineStages = ['Applied', 'Screening', 'Test_Cleared', 'GD_Cleared', 'Interview_Scheduled', 'Interview_Completed', 'Hired'];
    const funnelData = pipelineStages.map(stage => ({
        name: stage.replace(/_/g, ' '),
        count: applications.filter(a => a.status === stage || pipelineStages.indexOf(a.status) > pipelineStages.indexOf(stage)).length
    }));

    // Status Distribution
    const statusCounts = {};
    applications.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    const pieData = Object.keys(statusCounts).map(key => ({
        name: key.replace(/_/g, ' '),
        value: statusCounts[key]
    }));

    // Job Performance (Top 5 jobs by applicants)
    const jobPerformance = jobs.map(job => {
        const apps = applications.filter(a => a.jobId && a.jobId._id === job._id).length;
        return { name: job.title, applicants: apps }
    }).sort((a, b) => b.applicants - a.applicants).slice(0, 5);

    return (
        <div className='container mx-auto p-4 max-w-7xl pb-10'>
            <div className='mb-8'>
                <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>Recruitment Analytics</h2>
                <p className='text-sm text-gray-500 mt-1'>Data-driven insights into your hiring pipeline.</p>
            </div>

            {/* KPI Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center'><Briefcase size={24}/></div>
                    <div>
                        <p className='text-sm font-medium text-gray-500'>Total Jobs</p>
                        <h4 className='text-2xl font-bold text-gray-900'>{totalJobs}</h4>
                    </div>
                </div>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center'><Users size={24}/></div>
                    <div>
                        <p className='text-sm font-medium text-gray-500'>Total Applications</p>
                        <h4 className='text-2xl font-bold text-gray-900'>{totalApplications}</h4>
                    </div>
                </div>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center'><CheckCircle size={24}/></div>
                    <div>
                        <p className='text-sm font-medium text-gray-500'>Total Hired</p>
                        <h4 className='text-2xl font-bold text-gray-900'>{hired}</h4>
                    </div>
                </div>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center'><TrendingUp size={24}/></div>
                    <div>
                        <p className='text-sm font-medium text-gray-500'>Hire Rate</p>
                        <h4 className='text-2xl font-bold text-gray-900'>{hireRate}%</h4>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Hiring Funnel */}
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                    <h3 className='text-lg font-bold text-gray-900 mb-6'>Hiring Funnel</h3>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                    <h3 className='text-lg font-bold text-gray-900 mb-6'>Application Status Distribution</h3>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                <Legend verticalAlign="bottom" height={36} iconType='circle'/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                    <h3 className='text-lg font-bold text-gray-900 mb-6'>Top Performing Jobs</h3>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={jobPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}} tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value} />
                                <YAxis />
                                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                                <Bar dataKey="applicants" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecruitmentAnalytics
