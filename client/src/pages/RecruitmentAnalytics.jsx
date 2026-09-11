import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LabelList,
  BarChart, Bar
} from 'recharts'
import {
  Briefcase, Users, CheckCircle, TrendingUp, ChevronDown,
  Clock, FileText, Calendar, User, Check, Zap, Activity
} from 'lucide-react'

const STATUS_MAP = {
  Applied:              { color: '#3B82F6', light: '#EFF6FF' },
  Screening:            { color: '#8B5CF6', light: '#F5F3FF' },
  Test_Cleared:         { color: '#06B6D4', light: '#ECFEFF' },
  GD_Cleared:           { color: '#F59E0B', light: '#FFFBEB' },
  Interview_Scheduled:  { color: '#F97316', light: '#FFF7ED' },
  Interview_Completed:  { color: '#10B981', light: '#ECFDF5' },
  Hired:                { color: '#22C55E', light: '#F0FDF4' },
  Rejected:             { color: '#EF4444', light: '#FEF2F2' },
  Pending:              { color: '#F59E0B', light: '#FFFBEB' },
}

const Spark = ({ data, color }) => {
  if (!data || !data.length) return null
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const w = 60, h = 24
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 2) - 1}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  )
}

const KPICard = ({ icon: Icon, label, value, trend, sparkData, iconBg, iconColor, sparkColor }) => (
  <div className="bg-white rounded-[16px] p-5 border border-[#E8ECF4] shadow-sm flex flex-col justify-between">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-[12px] ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-500">{label}</p>
          <p className="text-[28px] font-black text-gray-900 leading-tight">{value}</p>
        </div>
      </div>
      {trend !== undefined && (
        <div className="text-right">
          <span className={`text-[12px] font-bold ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ↑ {Math.abs(trend)}%
          </span>
          <p className="text-[10px] text-gray-400 font-medium">vs last month</p>
        </div>
      )}
    </div>
    <div className="flex justify-end mt-1">
      <Spark data={sparkData} color={sparkColor} />
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg">
      <p className="text-[12px] font-bold text-gray-500 mb-2">{label}</p>
      {payload.map((p, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }}></div>
          <span className="text-[13px] font-semibold text-gray-700">{p.name}:</span>
          <span className="text-[13px] font-black text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const formatRelativeTime = (ts) => {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'New_Application': return <FileText size={14} className="text-blue-500" />
    case 'Interview_Update': return <Calendar size={14} className="text-purple-500" />
    case 'Job_Status': return <User size={14} className="text-green-500" />
    default: return <Check size={14} className="text-orange-500" />
  }
}
const getActivityBg = (type) => {
  switch (type) {
    case 'New_Application': return 'bg-blue-50'
    case 'Interview_Update': return 'bg-purple-50'
    case 'Job_Status': return 'bg-green-50'
    default: return 'bg-orange-50'
  }
}

const RecruitmentAnalytics = () => {
  const { backendUrl, companyToken, companyData } = useContext(AppContext)
  const [applications, setApplications] = useState(false)
  const [jobs, setJobs] = useState([])
  const [activities, setActivities] = useState([])
  const [timeFilter, setTimeFilter] = useState('30')

  useEffect(() => {
    if (companyToken) fetchData()
  }, [companyToken])

  const fetchData = async () => {
    try {
      const [appRes, jobRes, notifRes] = await Promise.all([
        axios.get(backendUrl + '/api/company/applicants', { headers: { token: companyToken } }),
        axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } }),
        axios.get(backendUrl + '/api/company/notifications', { headers: { token: companyToken } }).catch(() => ({ data: { notifications: [] } }))
      ])
      if (appRes.data.success && jobRes.data.success) {
        setApplications(appRes.data.applications)
        setJobs(jobRes.data.jobsData)
        setActivities(notifRes.data?.notifications?.slice(0, 5) || [])
      } else {
        toast.error('Failed to load analytics data')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (applications === false) return <div className="h-64 flex items-center justify-center"><Loading /></div>

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const timeLimit = timeFilter === 'all' ? 0 : now - (parseInt(timeFilter) * dayMs)
  const filteredApps = applications.filter(a => a.date >= timeLimit || timeFilter === 'all')
  const filteredJobs = jobs.filter(j => j.date >= timeLimit || timeFilter === 'all')

  const getTrendAndSpark = (items, dateGetter = (i) => i.date) => {
    if (timeFilter === 'all') {
      const minDate = items.length ? Math.min(...items.map(dateGetter)) : now - 7*dayMs
      const range = Math.max(now - minDate, 7*dayMs)
      const bucketSize = range / 7
      const sparkData = Array(7).fill(0)
      items.forEach(item => {
        const diff = now - dateGetter(item)
        let idx = 6 - Math.floor(diff / bucketSize)
        sparkData[Math.max(0, Math.min(6, idx))]++
      })
      return { trend: 0, sparkData }
    } else {
      const days = parseInt(timeFilter)
      const prevLimit = now - (days * 2 * dayMs)
      
      const currentPeriod = items.filter(i => dateGetter(i) >= timeLimit).length
      const prevPeriod = items.filter(i => dateGetter(i) >= prevLimit && dateGetter(i) < timeLimit).length
      const trend = prevPeriod === 0 ? (currentPeriod > 0 ? 100 : 0) : Math.round(((currentPeriod - prevPeriod) / prevPeriod) * 100)
      
      const bucketSize = (days * dayMs) / 7
      const sparkData = Array(7).fill(0)
      items.filter(i => dateGetter(i) >= timeLimit).forEach(item => {
        const diff = now - dateGetter(item)
        let idx = 6 - Math.floor(diff / bucketSize)
        sparkData[Math.max(0, Math.min(6, idx))]++
      })
      return { trend, sparkData }
    }
  }

  const jobsKPI = getTrendAndSpark(jobs)
  const appsKPI = getTrendAndSpark(applications)
  const hiredAppsAll = applications.filter(a => a.status === 'Hired')
  const hiredKPI = getTrendAndSpark(hiredAppsAll)
  const hireRateSpark = appsKPI.sparkData.map((val, i) => val > 0 ? Number(((hiredKPI.sparkData[i] / val) * 100).toFixed(1)) : 0)
  
  const currentHiredApps = hiredAppsAll.filter(a => a.date >= timeLimit || timeFilter === 'all')
  const currentHireRate = filteredApps.length > 0 ? ((currentHiredApps.length / filteredApps.length) * 100).toFixed(1) : 0
  const prevApps = timeFilter !== 'all' ? applications.filter(a => a.date >= now - (parseInt(timeFilter) * 2 * dayMs) && a.date < timeLimit) : []
  const prevHired = prevApps.filter(a => a.status === 'Hired')
  const prevHireRate = prevApps.length > 0 ? ((prevHired.length / prevApps.length) * 100).toFixed(1) : 0
  const hireRateTrend = timeFilter === 'all' ? 0 : (prevHireRate == 0 ? (currentHireRate > 0 ? 100 : 0) : Number((currentHireRate - prevHireRate).toFixed(1)))

  const chartDataMap = {}
  filteredApps.forEach(app => {
    const dStr = new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!chartDataMap[dStr]) chartDataMap[dStr] = { date: dStr, Applications: 0, Hired: 0, ts: new Date(app.date).setHours(0,0,0,0) }
    chartDataMap[dStr].Applications += 1
    if (app.status === 'Hired') chartDataMap[dStr].Hired += 1
  })
  const areaChartData = Object.values(chartDataMap).sort((a,b) => a.ts - b.ts)

  const statusCounts = {}
  filteredApps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1 })
  const pieData = Object.entries(statusCounts).map(([key, val]) => ({
    name: key.replace(/_/g, ' '),
    value: val,
    color: STATUS_MAP[key]?.color || '#6B7280',
    pct: Math.round((val / filteredApps.length) * 100)
  })).sort((a,b) => b.value - a.value)

  const topJobs = filteredJobs.map(job => ({
    name: job.title,
    applicants: filteredApps.filter(a => a.jobId?._id === job._id).length
  })).sort((a, b) => b.applicants - a.applicants).slice(0, 5)
  const maxJobApps = Math.max(...topJobs.map(j => j.applicants), 1)

  return (
    <div className="w-full pb-12 space-y-5 bg-[#F7F9FC]">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#F0F4FF] to-[#F5F3FF] rounded-[16px] px-8 py-7 flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className="z-10 relative">
          <p className="text-[14px] font-bold text-blue-600 mb-1">Welcome back, {companyData?.name || 'Recruiter'} 👋</p>
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Find great talent. Build the future.</h1>
          <p className="text-[14px] text-gray-500 font-medium mt-1">Track your hiring progress and make data-driven decisions.</p>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center bg-white px-6 py-4 rounded-xl shadow-sm z-10 border border-indigo-50">
          <p className="text-[15px] italic font-semibold text-gray-700">"Better data, better hires."</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none"></div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={Briefcase} label="Total Jobs" value={filteredJobs.length} trend={jobsKPI.trend}
          sparkData={jobsKPI.sparkData} iconBg="bg-blue-50" iconColor="text-blue-500" sparkColor="#3B82F6" />
        <KPICard icon={Users} label="Total Applications" value={filteredApps.length} trend={appsKPI.trend}
          sparkData={appsKPI.sparkData} iconBg="bg-purple-50" iconColor="text-purple-500" sparkColor="#8B5CF6" />
        <KPICard icon={CheckCircle} label="Total Hired" value={currentHiredApps.length} trend={hiredKPI.trend}
          sparkData={hiredKPI.sparkData} iconBg="bg-green-50" iconColor="text-green-500" sparkColor="#10B981" />
        <KPICard icon={TrendingUp} label="Hire Rate" value={`${currentHireRate}%`} trend={hireRateTrend}
          sparkData={hireRateSpark} iconBg="bg-orange-50" iconColor="text-orange-500" sparkColor="#F97316" />
      </div>

      {/* Main Chart & Donut Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        
        {/* Area Chart */}
        <div className="bg-white rounded-[16px] p-6 border border-[#E8ECF4] shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-gray-900 flex items-center gap-2">
                <BarChart size={18} className="text-blue-500" /> Applications Overview
              </h2>
              <p className="text-[13px] text-gray-400 mt-0.5 font-medium">Track your applications and hires over time.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 mr-2 hidden sm:flex">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></div><span className="text-[12px] font-semibold text-gray-500">Applications</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div><span className="text-[12px] font-semibold text-gray-500">Hired</span></div>
              </div>
              <div className="relative">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="appearance-none flex items-center gap-2 bg-white border border-[#E8ECF4] text-gray-700 font-bold text-[13px] pl-4 pr-10 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="30">Last 30 Days</option>
                  <option value="180">Last 6 Months</option>
                  <option value="all">All Time</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[260px]">
            {areaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="Applications" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" activeDot={{ r: 6, strokeWidth: 0, fill: '#8B5CF6' }} />
                  <Area type="monotone" dataKey="Hired" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorHired)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <BarChart size={36} className="text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No timeline data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-[16px] p-6 border border-[#E8ECF4] shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-extrabold text-gray-900">Applications by Status</h2>
              <p className="text-[12px] text-gray-400 mt-0.5 font-medium">Where candidates are currently.</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {pieData.length > 0 ? (
              <>
                <div className="relative h-[160px] w-full flex items-center justify-center mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v}`, n]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12, fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[22px] font-black text-gray-900 leading-none">{filteredApps.length}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[140px] pr-2 custom-scrollbar">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }}></div>
                        <span className="text-[12px] text-gray-600 font-semibold">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-black text-gray-800">{item.value}</span>
                        <span className="text-[11px] text-gray-400 font-medium w-8 text-right">({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <PieChart size={36} className="text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No status data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Top Performing Jobs */}
        <div className="bg-white rounded-[16px] p-6 border border-[#E8ECF4] shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-500" /> Top Performing Jobs
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5 font-medium">Jobs with the highest number of applications.</p>
            </div>
            <button className="text-[12px] font-bold text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 rounded-lg px-3 py-1.5">
              View All
            </button>
          </div>
          
          {topJobs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {topJobs.map((job, idx) => {
                const widthPct = (job.applicants / maxJobApps) * 100
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-1/3 truncate text-[13px] font-bold text-gray-700">{job.name}</span>
                    <div className="flex-1 bg-blue-50/50 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${widthPct}%` }}></div>
                    </div>
                    <span className="w-8 text-right text-[13px] font-black text-gray-900">{job.applicants}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Briefcase size={36} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-400 font-medium">No job data yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[16px] p-6 border border-[#E8ECF4] shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
                <Activity size={16} className="text-orange-500" /> Recent Activity
              </h2>
            </div>
            <button className="text-[12px] font-bold text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 rounded-lg px-3 py-1.5">
              View All
            </button>
          </div>
          
          {activities.length > 0 ? (
            <div className="flex flex-col gap-5">
              {activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-[10px] ${getActivityBg(act.type)} flex items-center justify-center shrink-0`}>
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{act.title}</p>
                    <p className="text-[12px] font-medium text-gray-500 truncate mt-0.5">{act.message}</p>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 shrink-0 mt-0.5">
                    {formatRelativeTime(act.date)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity size={36} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-400 font-medium">No recent activity</p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

export default RecruitmentAnalytics
