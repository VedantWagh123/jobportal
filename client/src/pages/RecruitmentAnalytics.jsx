import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LabelList,
  FunnelChart, Funnel
} from 'recharts'
import {
  Briefcase, Users, CheckCircle, TrendingUp, ArrowUpRight,
  ArrowDownRight, Filter, ChevronDown, BarChart2, Clock, Quote
} from 'lucide-react'

// ── Status Color Map ─────────────────────────────────────────────────────────
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

const getStatusColor = (name) => {
  const key = Object.keys(STATUS_MAP).find(k => k.toLowerCase() === name?.toLowerCase()?.replace(/ /g, '_'))
  return key ? STATUS_MAP[key].color : '#6B7280'
}

// ── Sparkline SVG ────────────────────────────────────────────────────────────
const Spark = ({ data, color }) => {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 32
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )
}

// ── Trend Badge ───────────────────────────────────────────────────────────────
const Trend = ({ v }) => {
  const pos = v >= 0
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-bold ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {pos ? '+' : ''}{v}%
      <span className="text-gray-400 font-normal ml-0.5">vs last month</span>
    </span>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ icon: Icon, label, value, trend, sparkData, iconBg, iconColor, tint }) => (
  <div className={`${tint} rounded-2xl p-5 border border-white/70 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_24px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
        <Icon size={18} className={iconColor} />
      </div>
      <Trend v={trend} />
    </div>
    <p className="text-[12px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">{label}</p>
    <p className="text-[36px] font-black text-gray-900 leading-none tracking-tight">{value}</p>
    <div className="flex justify-end mt-2">
      <Spark data={sparkData} color={iconBg.includes('blue') ? '#3B82F6' : iconBg.includes('purple') ? '#8B5CF6' : iconBg.includes('green') ? '#22C55E' : '#F59E0B'} />
    </div>
  </div>
)

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 text-white text-[12px] font-bold px-3 py-2 rounded-xl shadow-xl">
      {payload[0].value}
      {label && <div className="text-gray-400 font-normal text-[10px] mt-0.5">{label}</div>}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
const RecruitmentAnalytics = () => {
  const { backendUrl, companyToken, companyData } = useContext(AppContext)
  const [applications, setApplications] = useState(false)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    if (companyToken) fetchData()
  }, [companyToken])

  const fetchData = async () => {
    try {
      const [appRes, jobRes] = await Promise.all([
        axios.get(backendUrl + '/api/company/applicants', { headers: { token: companyToken } }),
        axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } })
      ])
      if (appRes.data.success && jobRes.data.success) {
        setApplications(appRes.data.applications)
        setJobs(jobRes.data.jobsData)
      } else {
        toast.error('Failed to load analytics data')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (applications === false) return <div className="h-64 flex items-center justify-center"><Loading /></div>

  // ── Metrics ──
  const totalJobs = jobs.length
  const totalApplications = applications.length
  const hired = applications.filter(a => a.status === 'Hired').length
  const hireRate = totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : 0

  // ── Funnel ──
  const STAGES = ['Applied', 'Screening', 'Test_Cleared', 'GD_Cleared', 'Interview_Scheduled', 'Interview_Completed', 'Hired']
  const funnelData = STAGES.map(stage => ({
    name: stage.replace(/_/g, ' '),
    count: applications.filter(a => STAGES.indexOf(a.status) >= STAGES.indexOf(stage)).length,
    fill: STATUS_MAP[stage]?.color || '#6B7280'
  }))

  // ── Status Pie ──
  const statusCounts = {}
  applications.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1 })
  const pieData = Object.entries(statusCounts).map(([key, val]) => ({
    name: key.replace(/_/g, ' '),
    value: val,
    color: STATUS_MAP[key]?.color || '#6B7280',
    pct: Math.round((val / totalApplications) * 100)
  }))

  // ── Top Jobs ──
  const topJobs = jobs.map(job => ({
    name: job.title?.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
    fullName: job.title,
    applicants: applications.filter(a => a.jobId?._id === job._id).length
  })).sort((a, b) => b.applicants - a.applicants).slice(0, 5)

  return (
    <div className="w-full pb-12 space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BarChart2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Recruitment <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Analytics</span>
            </h1>
            <p className="text-[13px] text-gray-500 font-medium mt-0.5">Data-driven insights into your hiring pipeline.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 flex-wrap">
          <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 font-semibold text-[13px] px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Clock size={15} /> Last 30 Days <ChevronDown size={14} />
          </button>
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow shadow-violet-500/20">
              <TrendingUp size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[12px] font-extrabold text-gray-900 leading-tight">Keep Hiring!</p>
              <p className="text-[10px] text-gray-500">Insights today for a better tomorrow.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={Briefcase} label="Total Jobs" value={totalJobs} trend={12}
          sparkData={[40,55,48,62,70,68,87]} iconBg="bg-blue-100" iconColor="text-blue-600" tint="bg-gradient-to-br from-blue-50/80 to-white" />
        <KPICard icon={Users} label="Total Applications" value={totalApplications} trend={28}
          sparkData={[5,8,6,10,12,11,13]} iconBg="bg-purple-100" iconColor="text-purple-600" tint="bg-gradient-to-br from-purple-50/80 to-white" />
        <KPICard icon={CheckCircle} label="Total Hired" value={hired} trend={100}
          sparkData={[0,0,0,0,0,0,1]} iconBg="bg-green-100" iconColor="text-green-600" tint="bg-gradient-to-br from-green-50/80 to-white" />
        <KPICard icon={TrendingUp} label="Hire Rate" value={`${hireRate}%`} trend={2.4}
          sparkData={[5,6,5,7,6,7,7.7]} iconBg="bg-orange-100" iconColor="text-orange-500" tint="bg-gradient-to-br from-orange-50/80 to-white" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px_200px] gap-4">

        {/* Hiring Funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
                <Filter size={16} className="text-blue-500" /> Hiring Funnel
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">Track candidates at each stage of your hiring process.</p>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              All Jobs <ChevronDown size={13} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip 
                content={<ChartTip />} 
                cursor={{ fill: 'transparent' }} 
              />
              <Funnel
                dataKey="count"
                data={funnelData}
                isAnimationActive
                labelLine={true}
              >
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList position="right" fill="#374151" stroke="none" dataKey="name" style={{ fontSize: 11, fontWeight: 600 }} />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="count" style={{ fontSize: 13, fontWeight: 800 }} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Status Donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-violet-500" /> Application Status Distribution
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">Overview of applications across different stages.</p>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              All Jobs <ChevronDown size={13} />
            </button>
          </div>

          {pieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Donut */}
              <div className="shrink-0 relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}`, n]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-900">{totalApplications}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }}></div>
                      <span className="text-[12px] text-gray-600 font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] font-extrabold text-gray-800">{item.value}</span>
                      <span className="text-[11px] text-gray-400 font-medium w-8 text-right">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Users size={36} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No application data yet</p>
            </div>
          )}
        </div>

        {/* Motivational Quote Card */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-violet-500/20 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 z-10 shrink-0">
            <Quote size={20} className="text-white" />
          </div>
          <div className="z-10">
            <p className="text-[15px] font-extrabold text-white leading-snug mb-3">
              "Great hires build great companies."
            </p>
            <p className="text-[12px] text-violet-200 font-medium leading-relaxed">
              Keep analyzing, Keep growing.
            </p>
          </div>
        </div>
      </div>

      {/* ── Top Performing Jobs ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
              <BarChart2 size={16} className="text-emerald-500" /> Top Performing Jobs
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Jobs with the highest number of applications.</p>
          </div>
          <button className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
            By Applications <ChevronDown size={13} />
          </button>
        </div>

        {topJobs.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topJobs} barSize={44} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F7" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="bg-gray-900 text-white text-[12px] font-bold px-3 py-2 rounded-xl shadow-xl">
                      {payload[0].payload.fullName}
                      <div className="text-gray-400 font-normal">{payload[0].value} Applicants</div>
                    </div>
                  )
                }}
                cursor={{ fill: 'rgba(16,185,129,0.05)', radius: 8 }}
              />
              <Bar dataKey="applicants" fill="#10B981" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="applicants" position="top" style={{ fontSize: 11, fontWeight: 800, fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Briefcase size={36} className="text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No job performance data yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecruitmentAnalytics
