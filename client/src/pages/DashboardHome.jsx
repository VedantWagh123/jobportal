import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import {
  Briefcase, Users, UserCheck, CalendarDays, PlusCircle,
  LayoutList, ChevronRight, MoreVertical, MapPin,
  Brain, Database, Cloud, Cpu, ArrowUpRight, ArrowDownRight,
  Plus, Eye, BarChart2, Zap, Clock
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts'

// ─── Mock Chart Data (replace with real API later) ──────────────────────────
const mockChartData = [
  { date: '1 Sep', apps: 12 },
  { date: '2 Sep', apps: 20 },
  { date: '3 Sep', apps: 11 },
  { date: '4 Sep', apps: 24 },
  { date: '5 Sep', apps: 23 },
  { date: '6 Sep', apps: 23 },
  { date: '7 Sep', apps: 32 },
]

const STATUS_COLORS = {
  Applied: '#3B82F6',
  Shortlisted: '#10B981',
  Interviewed: '#F59E0B',
  Hired: '#8B5CF6',
  Rejected: '#EF4444',
  Pending: '#6B7280',
}

// ─── Sub Components ──────────────────────────────────────────────────────────

const TrendBadge = ({ value }) => {
  const positive = value >= 0
  return (
    <div className={`flex items-center gap-1 text-[12px] font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {positive ? '+' : ''}{value}%
      <span className="text-gray-400 font-normal ml-0.5">vs last month</span>
    </div>
  )
}

// Mini sparkline built from SVG (no extra libs)
const Sparkline = ({ data, color }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 36
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Stat Card
const StatCard = ({ icon: Icon, label, value, trend, sparkData, iconBg, iconColor, tintBg }) => (
  <div className={`${tintBg} rounded-2xl p-5 border border-white/80 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-3`}>
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
        <Icon size={20} className={iconColor} />
      </div>
      <TrendBadge value={trend} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-4xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
    <div className="flex items-end justify-end">
      <Sparkline data={sparkData} color={iconColor.replace('text-', '').includes('blue') ? '#3B82F6' : iconColor.includes('purple') ? '#8B5CF6' : iconColor.includes('emerald') ? '#10B981' : '#F59E0B'} />
    </div>
  </div>
)

// Custom Bar Tooltip
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-[12px] font-bold px-3 py-2 rounded-xl shadow-xl">
        {payload[0].value} Applications
        <div className="text-gray-400 font-normal text-[10px] mt-0.5">{label}</div>
      </div>
    )
  }
  return null
}

// Status badge colors
const statusStyle = (status) => {
  const s = status?.toLowerCase?.() || ''
  if (s.includes('hired')) return 'bg-purple-50 text-purple-700 border-purple-100'
  if (s.includes('shortlist') || s.includes('screen') || s.includes('cleared') || s.includes('interview')) return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (s.includes('reject')) return 'bg-red-50 text-red-600 border-red-100'
  if (s.includes('pending')) return 'bg-orange-50 text-orange-600 border-orange-100'
  return 'bg-blue-50 text-blue-700 border-blue-100'
}

const jobIcon = (title = '') => {
  const t = title.toLowerCase()
  if (t.includes('ai') || t.includes('ml') || t.includes('llm')) return <Brain size={20} className="text-violet-600" />
  if (t.includes('database') || t.includes('sql')) return <Database size={20} className="text-blue-600" />
  if (t.includes('cloud') || t.includes('devops')) return <Cloud size={20} className="text-cyan-600" />
  return <Cpu size={20} className="text-orange-500" />
}

const jobIconBg = (title = '') => {
  const t = title.toLowerCase()
  if (t.includes('ai') || t.includes('ml') || t.includes('llm')) return 'bg-violet-50'
  if (t.includes('database') || t.includes('sql')) return 'bg-blue-50'
  if (t.includes('cloud') || t.includes('devops')) return 'bg-cyan-50'
  return 'bg-orange-50'
}

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardHome = () => {
  const { backendUrl, companyToken, companyData } = useContext(AppContext)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [jobsRes, appsRes] = await Promise.all([
        axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } }),
        axios.get(backendUrl + '/api/company/applicants', { headers: { token: companyToken } })
      ])
      if (jobsRes.data.success) setJobs(jobsRes.data.jobsData.reverse())
      if (appsRes.data.success) setApplications(appsRes.data.applications.reverse())
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (companyToken) fetchDashboardData()
  }, [companyToken])

  if (loading) {
    return <div className="h-full flex items-center justify-center min-h-[400px]"><Loading /></div>
  }

  // ── Compute real metrics ──
  const activeJobsCount = jobs.filter(j => j.visible).length
  const totalApplicationsCount = applications.length
  const shortlistedCount = applications.filter(a =>
    ['Screening', 'Test_Cleared', 'GD_Cleared', 'Interview_Scheduled', 'Interview_Completed', 'Hired'].includes(a.status)
  ).length
  const interviewCount = applications.filter(a =>
    ['Interview_Scheduled', 'Interview_Completed'].includes(a.status)
  ).length
  const hiredCount = applications.filter(a => a.status === 'Hired').length
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length
  const pendingCount = applications.filter(a => a.status === 'Pending' || a.status === 'Applied').length

  const recentJobs = jobs.slice(0, 4)
  const recentApps = applications.slice(0, 4)

  // Donut data
  const donutData = [
    { name: 'Applied', value: pendingCount, color: STATUS_COLORS.Applied },
    { name: 'Shortlisted', value: shortlistedCount, color: STATUS_COLORS.Shortlisted },
    { name: 'Interviewed', value: interviewCount, color: STATUS_COLORS.Interviewed },
    { name: 'Hired', value: hiredCount, color: STATUS_COLORS.Hired },
    { name: 'Rejected', value: rejectedCount, color: STATUS_COLORS.Rejected },
  ].filter(d => d.value > 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const quickActions = [
    { label: 'Post New Job', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50', action: () => navigate('/dashboard/add-job') },
    { label: 'View All Jobs', icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => navigate('/dashboard/manage-jobs') },
    { label: 'Browse Candidates', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', action: () => navigate('/dashboard/candidates') },
    { label: 'Analytics Report', icon: BarChart2, color: 'text-orange-500', bg: 'bg-orange-50', action: () => navigate('/dashboard/analytics') },
  ]

  return (
    <div className="w-full pb-10 space-y-6">

      {/* ── Dashboard Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 tracking-tight">
            {greeting()}, {companyData?.name || 'Recruiter'}! 👋
          </h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">
            Here's what's happening with your job postings today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center gap-3">
            <CalendarDays size={18} className="text-blue-500" />
            <div>
              <p className="text-[13px] font-extrabold text-gray-800 leading-tight">
                {moment().format('dddd, D MMM YYYY')}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Keep hiring, keep growing!</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/add-job')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/30 whitespace-nowrap"
          >
            <PlusCircle size={18} /> Post New Job
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase} label="Active Jobs" value={activeJobsCount} trend={12}
          sparkData={[40, 55, 48, 62, 70, 68, 86]}
          iconBg="bg-blue-100" iconColor="text-blue-600" tintBg="bg-gradient-to-br from-blue-50/80 to-white"
        />
        <StatCard
          icon={Users} label="Total Applications" value={totalApplicationsCount} trend={28}
          sparkData={[5, 8, 6, 10, 12, 11, 13]}
          iconBg="bg-purple-100" iconColor="text-purple-600" tintBg="bg-gradient-to-br from-purple-50/80 to-white"
        />
        <StatCard
          icon={UserCheck} label="Shortlisted" value={shortlistedCount} trend={0}
          sparkData={[0, 1, 1, 1, 1, 1, 1]}
          iconBg="bg-emerald-100" iconColor="text-emerald-600" tintBg="bg-gradient-to-br from-emerald-50/80 to-white"
        />
        <StatCard
          icon={CalendarDays} label="Interviews" value={interviewCount} trend={-0}
          sparkData={[0, 0, 0, 0, 0, 0, 0]}
          iconBg="bg-orange-100" iconColor="text-orange-500" tintBg="bg-gradient-to-br from-orange-50/80 to-white"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px_240px] gap-4">

        {/* Applications Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-[16px] font-extrabold text-gray-900 flex items-center gap-2">
                <BarChart2 size={18} className="text-blue-500" /> Applications Overview
              </h2>
              <p className="text-[12px] text-gray-400 font-medium mt-0.5">Track your job application trends over time.</p>
            </div>
            <select className="text-[12px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockChartData} barSize={28} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(59,130,246,0.04)', radius: 8 }} />
              <Bar dataKey="apps" radius={[6, 6, 0, 0]}>
                {mockChartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={i === mockChartData.length - 1 ? '#3B82F6' : '#BFDBFE'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-[16px] font-extrabold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-purple-500" /> Application Status
            </h2>
          </div>
          {donutData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val}`, name]} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="space-y-1.5 mt-2">
                {[
                  { name: 'Applied', val: pendingCount, color: STATUS_COLORS.Applied },
                  { name: 'Shortlisted', val: shortlistedCount, color: STATUS_COLORS.Shortlisted },
                  { name: 'Interviewed', val: interviewCount, color: STATUS_COLORS.Interviewed },
                  { name: 'Hired', val: hiredCount, color: STATUS_COLORS.Hired },
                  { name: 'Rejected', val: rejectedCount, color: STATUS_COLORS.Rejected },
                  { name: 'Pending', val: 0, color: STATUS_COLORS.Pending },
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }}></div>
                      <span className="text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-gray-700">{item.val}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <Users size={36} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No applications yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-[16px] font-extrabold text-gray-900 flex items-center gap-2 mb-5">
            <Zap size={18} className="text-amber-500" /> Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            {quickActions.map((qa, i) => (
              <button
                key={i}
                onClick={qa.action}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all group text-left w-full"
              >
                <div className={`w-9 h-9 rounded-lg ${qa.bg} flex items-center justify-center shrink-0`}>
                  <qa.icon size={18} className={qa.color} />
                </div>
                <span className="text-[13px] font-semibold text-gray-700 flex-1 group-hover:text-gray-900 transition-colors">{qa.label}</span>
                <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Jobs & Applications ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recently Posted Jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-gray-900 flex items-center gap-2">
              <Briefcase size={17} className="text-blue-500" /> Recently Posted Jobs
            </h2>
            <button
              onClick={() => navigate('/dashboard/manage-jobs')}
              className="text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {recentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <LayoutList size={36} className="text-gray-200 mb-3" />
              <p className="text-gray-500 font-semibold text-sm">No jobs posted yet</p>
              <p className="text-[12px] text-gray-400 mt-1">Create your first job to start hiring.</p>
              <button onClick={() => navigate('/dashboard/add-job')} className="mt-4 bg-blue-600 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentJobs.map((job, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-50/70 transition-colors flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${jobIconBg(job.title)} flex items-center justify-center shrink-0`}>
                    {jobIcon(job.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-[14px] truncate">{job.title}</h4>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-400">
                      <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {moment(job.date).fromNow()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${job.visible ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {job.visible ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{job.applicants ?? 0} Applicants</span>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                    <MoreVertical size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-gray-900 flex items-center gap-2">
              <Users size={17} className="text-purple-500" /> Recent Applications
            </h2>
            <button
              onClick={() => navigate('/dashboard/view-applications')}
              className="text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {recentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <Users size={36} className="text-gray-200 mb-3" />
              <p className="text-gray-500 font-semibold text-sm">No applications yet</p>
              <p className="text-[12px] text-gray-400 mt-1">Applications will appear here once candidates apply.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentApps.map((app, idx) => {
                const statusLabel = (app.status || 'Applied').replace(/_/g, ' ')
                return (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50/70 transition-colors flex items-center gap-4">
                    {app.userId?.image ? (
                      <img src={app.userId.image} alt={app.userId.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 border-2 border-white shadow-sm">
                        {app.userId?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-[14px] truncate">{app.userId?.name || 'Candidate'}</h4>
                      <p className="text-[12px] text-gray-400 truncate mt-0.5">
                        Applied for <span className="font-semibold text-gray-600">{app.jobId?.title || 'Unknown Job'}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusStyle(app.status)}`}>
                        {statusLabel}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">{moment(app.date).fromNow()}</span>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                      <MoreVertical size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
