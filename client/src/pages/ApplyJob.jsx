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
import { Briefcase, MapPin, BarChart, Bookmark, Building, Users, Calendar, Link as LinkIcon, ClipboardList, CheckCircle2, IndianRupee, Sparkles, Share2, ArrowRight, CheckCircle, Zap, Lightbulb, Layers, Trash2, X, Plus, Search } from 'lucide-react'

const ApplyJob = () => {

  const { id } = useParams()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [JobData, setJobData] = useState(null)
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [newSkill, setNewSkill] = useState('')

  const { jobs, backendUrl, userData, setUserData, userApplications, fetchUserApplications, savedJobs, toggleSaveJob } = useContext(AppContext)

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
    const hasApplied = userApplications.some(item => item.jobId?._id === JobData._id)
    setIsAlreadyApplied(hasApplied)
  }

  const calculateMatch = (userSkills, jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) return 0;
    if (!userSkills || userSkills.length === 0) return 0;
    
    const uSkillsArray = Array.isArray(userSkills) ? userSkills : (typeof userSkills === 'string' ? userSkills.split(',') : []);
    const jSkillsArray = Array.isArray(jobSkills) ? jobSkills : (typeof jobSkills === 'string' ? jobSkills.split(',') : []);

    const validUserSkills = uSkillsArray.map(s => typeof s === 'string' ? s.trim().toLowerCase() : '').filter(s => s !== '');
    const validJobSkills = jSkillsArray.map(s => typeof s === 'string' ? s.trim().toLowerCase() : '').filter(s => s !== '');
    
    if (validJobSkills.length === 0 || validUserSkills.length === 0) return 0;

    const matchCount = validJobSkills.filter(js => validUserSkills.some(us => us === js || us.includes(js) || js.includes(us))).length;
    return Math.round((matchCount / validJobSkills.length) * 100);
  }

  const isSkillMatched = (skill, jobSkills) => {
    if (!skill || !jobSkills || jobSkills.length === 0) return false;
    const s = String(skill).trim().toLowerCase();
    if (!s) return false;
    return jobSkills.some(js => {
      const j = String(js).trim().toLowerCase();
      return j === s || j.includes(s) || s.includes(j);
    });
  }

  const handleAddSkill = async (e) => {
    if (e.key !== 'Enter' || !newSkill.trim()) return;
    try {
      const token = await getToken();
      const currentSkills = Array.isArray(userData.skills) ? userData.skills : (typeof userData.skills === 'string' && userData.skills ? userData.skills.split(',').map(s=>s.trim()) : []);
      const updatedSkills = [...new Set([...currentSkills, newSkill.trim()])];
      const { data } = await axios.post(backendUrl + '/api/users/update-skills', 
        { skills: updatedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setUserData({ ...userData, skills: data.skills });
        setNewSkill('');
        toast.success('Skill added to your profile!');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  }

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      const token = await getToken();
      const currentSkills = Array.isArray(userData.skills) ? userData.skills : (typeof userData.skills === 'string' && userData.skills ? userData.skills.split(',').map(s=>s.trim()) : []);
      const updatedSkills = currentSkills.filter(s => s !== skillToRemove);
      const { data } = await axios.post(backendUrl + '/api/users/update-skills', 
        { skills: updatedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setUserData({ ...userData, skills: data.skills });
        toast.success(`Removed ${skillToRemove}`);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  }

  const handleClearAllSkills = async () => {
    if(!window.confirm("Are you sure you want to clear all your skills?")) return;
    try {
      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/users/update-skills', 
        { skills: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setUserData({ ...userData, skills: data.skills });
        toast.success(`Cleared all skills`);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
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
  // Guard: if companyId not populated yet, show loading
  if (!JobData.companyId || typeof JobData.companyId !== 'object') return <Loading />

  const displaySkills = JobData.skills && JobData.skills.length > 0 ? JobData.skills : [JobData.category || 'Problem Solving']
  
  const similarJobs = jobs.filter(job => 
      job._id !== JobData._id && 
      job.companyId && 
      JobData.companyId && 
      job.companyId._id?.toString() === JobData.companyId._id?.toString()
    ).filter(job => {
        const appliedJobsIds = new Set(userApplications.map(app => app.jobId?._id))
        return !appliedJobsIds.has(job._id)
      }).slice(0, 4)

  const matchPercentage = userData ? calculateMatch(userData.skills, displaySkills) : 0;

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-sans'>
      
      {/* Premium Hero Section */}
      <div className='w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-6 md:pt-10'>
        <div className='bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'>
          
          {/* Subtle gradient background */}
          <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 pointer-events-none'></div>

          {/* Left Content */}
          <div className='flex-1 z-10 flex flex-col md:flex-row gap-8 items-start'>
            {/* Logo */}
            <div className='w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-3 shrink-0 cursor-pointer hover:border-blue-300 transition-colors' onClick={() => navigate(`/company/${JobData.companyId._id}`)}>
              <img src={JobData.companyId.image} alt={JobData.companyId.name} className='max-w-full max-h-full object-contain' />
            </div>

            <div className='flex-1 w-full'>
              <div className='flex items-center gap-2 mb-2 md:mb-3'>
                <h2 className='text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors' onClick={() => navigate(`/company/${JobData.companyId._id}`)}>
                  {JobData.companyId.name}
                  <CheckCircle2 size={18} className='text-blue-500 fill-blue-50' />
                </h2>
                <span className='hidden sm:inline text-sm text-gray-500'>• {JobData.companyId.industry || 'Innovating Today for a Smarter Tomorrow'}</span>
              </div>
              
              <h1 className='text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight leading-tight mb-5'>
                {JobData.title}
              </h1>

              <div className='flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-gray-600 mb-8'>
                <span className='flex items-center gap-1.5'><Building size={16} className='text-gray-400' /> {JobData.companyId.name}</span>
                <span className='flex items-center gap-1.5'><MapPin size={16} className='text-gray-400' /> {JobData.location}</span>
                <span className='flex items-center gap-1.5'><BarChart size={16} className='text-gray-400' /> {JobData.level}</span>
                <span className='flex items-center gap-1.5'><IndianRupee size={16} className='text-gray-400' /> CTC: {kconvert.convertTo(JobData.salary)}</span>
                <span className='flex items-center gap-1.5'><Calendar size={16} className='text-gray-400' /> Posted {moment(JobData.date).fromNow()}</span>
              </div>

              {/* Skills */}
              <div className='flex flex-wrap items-center gap-2.5'>
                {displaySkills.slice(0, 6).map((skill, index) => (
                  <span key={index} className='text-[13px] font-bold text-blue-700 bg-blue-50/80 border border-blue-100 px-3.5 py-1.5 rounded-full'>
                    {skill}
                  </span>
                ))}
                {displaySkills.length > 6 && (
                  <span className='text-[13px] font-bold text-blue-700 bg-blue-50/80 border border-blue-100 px-2.5 py-1.5 rounded-full'>
                    +{displaySkills.length - 6}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - AI Visual */}
          <div className='hidden lg:flex w-[380px] shrink-0 relative items-center justify-center z-10'>
            {/* Soft Glow */}
            <div className='absolute w-48 h-48 bg-blue-400/20 blur-3xl rounded-full mix-blend-multiply'></div>
            <div className='absolute w-40 h-40 bg-purple-400/20 blur-3xl rounded-full mix-blend-multiply right-10 top-10'></div>
            
            {/* Floating Badges */}
            <div className='absolute top-6 right-8 bg-white/90 backdrop-blur-md border border-blue-50 text-blue-600 text-[13px] font-bold px-4 py-2 rounded-full shadow-sm shadow-blue-500/10 animate-[bounce_4s_infinite_ease-in-out]'>LLMs</div>
            <div className='absolute bottom-10 right-14 bg-white/90 backdrop-blur-md border border-purple-50 text-purple-600 text-[13px] font-bold px-4 py-2 rounded-full shadow-sm shadow-purple-500/10 animate-[bounce_5s_infinite_ease-in-out]'>Agents</div>
            <div className='absolute bottom-16 left-6 bg-white/90 backdrop-blur-md border border-indigo-50 text-indigo-600 text-[13px] font-bold px-4 py-2 rounded-full shadow-sm shadow-indigo-500/10 animate-[bounce_3.5s_infinite_ease-in-out]'>RAG</div>
            <Sparkles size={28} className='absolute top-12 left-12 text-purple-400 animate-pulse' />
            
            {/* Main AI Glass Card */}
            <div className='relative w-36 h-36 rounded-[32px] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] shadow-2xl shadow-indigo-500/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-500 hover:rotate-2'>
              <div className='absolute inset-0 bg-white/10 rounded-[32px] backdrop-blur-md border border-white/30'></div>
              <div className='absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-[32px] pointer-events-none'></div>
              <span className='relative text-6xl font-black text-white italic tracking-tighter drop-shadow-md pr-1'>AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout 2-Column */}
      <div className='w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mt-8 pb-20 flex flex-col lg:flex-row gap-8 xl:gap-10 flex-1'>
        
        {/* LEFT COLUMN (70%) */}
        <div className='flex-1 w-full flex flex-col gap-8'>
          
          {/* Tabs */}
          <div className='flex items-center gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar'>
            {['Overview', 'About Company', 'Similar Jobs'].map((tab) => (
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

          {activeTab === 'Overview' && (
            <div className='animate-fadeIn space-y-8'>
              
              {/* Job Description Card */}
              <div className='bg-white rounded-[24px] p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-xl font-extrabold text-gray-900 flex items-center gap-2.5'>
                    <ClipboardList size={22} className='text-blue-600' /> Job description
                  </h2>
                  <button className='text-gray-500 hover:text-gray-800 flex items-center gap-1.5 text-sm font-bold transition-colors'>
                    <Share2 size={16} /> <span className='hidden sm:inline'>Share</span>
                  </button>
                </div>
                <div className='rich-text text-gray-600 leading-relaxed text-[15px]' dangerouslySetInnerHTML={{ __html: JobData.description }}></div>
              </div>

              {/* Stats Card */}
              <div className='bg-white rounded-[24px] p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x divide-gray-100'>
                  <div className='flex flex-col items-center text-center px-4'>
                    <div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3'><Briefcase size={20}/></div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Job Type</p>
                    <p className='text-[15px] font-extrabold text-gray-900'>{JobData.jobType || 'Full Time'}</p>
                  </div>
                  <div className='flex flex-col items-center text-center px-4'>
                    <div className='w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-3'><BarChart size={20}/></div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Experience</p>
                    <p className='text-[15px] font-extrabold text-gray-900'>{JobData.level}</p>
                  </div>
                  <div className='flex flex-col items-center text-center px-4'>
                    <div className='w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-3'><MapPin size={20}/></div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Location</p>
                    <p className='text-[15px] font-extrabold text-gray-900'>{JobData.location}</p>
                  </div>
                  <div className='flex flex-col items-center text-center px-4'>
                    <div className='w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-3'><IndianRupee size={20}/></div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>CTC</p>
                    <p className='text-[15px] font-extrabold text-gray-900'>₹{JobData.salary.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Key Responsibilities */}
              <div className='bg-white rounded-[24px] p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100'>
                <h2 className='text-xl font-extrabold text-gray-900 flex items-center gap-2.5 mb-6'>
                  <CheckCircle size={22} className='text-blue-600' /> Key Responsibilities
                </h2>
                <ul className='space-y-4'>
                  {[
                    "Build and integrate LLM-based applications and AI-powered features.",
                    "Design and implement RAG (Retrieval Augmented Generation) pipelines.",
                    "Develop chatbots, AI agents and automate workflows using LLM APIs.",
                    "Work with vector databases, embeddings and prompt engineering.",
                    "Collaborate with product, design and engineering teams.",
                    "Optimize performance, scalability and reliability of AI solutions.",
                    "Stay updated with latest GenAI tools and research."
                  ].map((resp, i) => (
                    <li key={i} className='flex items-start gap-3.5 text-gray-600 text-[15px]'>
                      <CheckCircle2 size={18} className='text-blue-500 shrink-0 mt-0.5 fill-blue-50' />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium AI Skill Match Analyzer */}
              {userData && (
                <div className='animate-fadeIn flex flex-col gap-6 mt-10'>
                  
                  {/* Header / Hero Section */}
                  <div className='bg-white rounded-[24px] p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8'>
                    {/* Background decorations */}
                    <div className='absolute -top-24 -left-24 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none'></div>
                    <div className='absolute -bottom-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none'></div>
                    
                    <div className='flex items-start gap-5 z-10 w-full md:w-auto'>
                      <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20'>
                        <Sparkles size={28} className='text-white' />
                      </div>
                      <div>
                        <h2 className='text-2xl font-extrabold text-gray-900 tracking-tight'>
                          AI Skill Match <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'>Analyzer</span>
                        </h2>
                        <p className='text-[15px] text-gray-500 mt-1.5 font-medium'>
                          Compare your profile skills with this job's requirements and find your match.
                        </p>
                        
                        <div className='flex flex-wrap items-center gap-3 mt-5'>
                          <span className='flex items-center gap-1.5 text-[13px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm'><Zap size={14} className='text-purple-500' /> Get instant analysis</span>
                          <span className='flex items-center gap-1.5 text-[13px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm'><BarChart size={14} className='text-blue-500' /> Identify skill gaps</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Circular Progress */}
                    <div className='flex flex-col items-center justify-center z-10 shrink-0 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-gray-50 shadow-sm'>
                      <div className='relative w-32 h-32 flex items-center justify-center'>
                        {/* Background Circle */}
                        <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 36 36">
                          <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path 
                            className={`${matchPercentage >= 80 ? 'text-green-500' : matchPercentage >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                            strokeDasharray={`${matchPercentage}, 100`} 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="none" 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          />
                        </svg>
                        <div className='flex flex-col items-center justify-center bg-white rounded-full w-[104px] h-[104px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-50 z-10'>
                          <span className='text-3xl font-black text-gray-900 tracking-tight'>{matchPercentage}%</span>
                          <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5'>Match</span>
                        </div>
                      </div>
                      
                      <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm
                        ${matchPercentage >= 80 ? 'bg-green-50 text-green-700 border border-green-100' : 
                          matchPercentage >= 50 ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 
                          'bg-red-50 text-red-700 border border-red-100'}`}
                      >
                        <Lightbulb size={14} className={matchPercentage >= 80 ? 'text-green-500' : matchPercentage >= 50 ? 'text-yellow-500' : 'text-red-500'} />
                        {matchPercentage >= 80 ? 'Excellent Match!' : matchPercentage >= 50 ? 'You\'re halfway there!' : 'Skill Gap Detected'}
                      </div>
                    </div>
                  </div>

                  {/* 75%+ Match — Apply Banner */}
                  {matchPercentage >= 75 && (
                    <div className='relative overflow-hidden rounded-[24px] p-6 sm:p-8 border-2 border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.25)] flex flex-col sm:flex-row items-center justify-between gap-5'>
                      <div className='absolute -top-12 -left-12 w-48 h-48 bg-green-300/20 rounded-full blur-3xl pointer-events-none'></div>
                      <div className='absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none'></div>
                      <div className='flex items-center gap-5 z-10'>
                        <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30'>
                          <CheckCircle2 size={32} className='text-white' />
                        </div>
                        <div>
                          <span className='text-[11px] font-extrabold text-green-700 uppercase tracking-widest bg-green-100 border border-green-200 px-2.5 py-0.5 rounded-full'>
                            🎯 {matchPercentage}% Match
                          </span>
                          <h3 className='text-xl sm:text-2xl font-extrabold text-gray-900 mt-2 leading-snug'>
                            You're a <span className='text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600'>great fit</span> for this job!
                          </h3>
                          <p className='text-[14px] text-gray-600 font-medium mt-1'>
                            Your skill set strongly matches what the employer is looking for. Don't miss this opportunity!
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full sm:w-auto'>
                        <button
                          onClick={applyHandler}
                          disabled={isAlreadyApplied}
                          className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-extrabold text-[15px] shadow-lg transition-all
                            ${isAlreadyApplied
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:-translate-y-0.5 hover:shadow-green-500/30'
                            }`}
                        >
                          {isAlreadyApplied ? <><CheckCircle2 size={18} /> Already Applied</> : <><ArrowRight size={18} /> Apply Now</>}
                        </button>
                        <p className='text-[12px] font-medium text-green-700/70 text-center sm:text-left sm:max-w-[100px] leading-tight'>
                          Be among the first to apply!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Skills Card */}

                  <div className='bg-white rounded-[24px] p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-100'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-5'>
                      <div className='flex items-start gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5'>
                          <Layers size={20} />
                        </div>
                        <div>
                          <h3 className='text-[15px] font-extrabold text-gray-900 uppercase tracking-wide'>Your Current Skills</h3>
                          <p className='text-[13px] text-gray-500 font-medium mt-0.5'>These skills are used to match with job requirements.</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3 shrink-0'>
                        <span className='text-[13px] font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2'>
                          <Layers size={14} /> {((Array.isArray(userData.skills) ? userData.skills : typeof userData.skills === 'string' && userData.skills ? userData.skills.split(',') : []).length)} Skills Added
                        </span>
                        {((Array.isArray(userData.skills) ? userData.skills : typeof userData.skills === 'string' && userData.skills ? userData.skills.split(',') : []).length > 0) && (
                          <button 
                            onClick={handleClearAllSkills}
                            className='text-[13px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors'
                          >
                            <Trash2 size={14} /> Clear All
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Skill Chips Container */}
                    <div className='flex flex-wrap gap-3 mb-10 min-h-[100px]'>
                      {userData.skills && (Array.isArray(userData.skills) ? userData.skills : typeof userData.skills === 'string' && userData.skills ? userData.skills.split(',') : []).length > 0 ? (
                        (Array.isArray(userData.skills) ? userData.skills : typeof userData.skills === 'string' ? userData.skills.split(',').map(s=>s.trim()) : []).map((skill, idx) => {
                          const isMatched = isSkillMatched(skill, displaySkills);
                          return (
                            <div 
                              key={idx} 
                              className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-[14px] font-bold transition-all shadow-sm
                                ${isMatched 
                                  ? 'bg-green-50 border-green-200 text-green-800' 
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:shadow-[0_2px_8px_rgba(168,85,247,0.15)]'}`}
                            >
                              {/* Left Icon */}
                              {isMatched ? (
                                <CheckCircle2 size={16} className='text-green-500 fill-green-100 shrink-0' />
                              ) : (
                                <div className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-400 transition-colors'></div>
                              )}
                              
                              <span>{skill}</span>
                              
                              {/* Remove Button */}
                              <button 
                                onClick={() => handleRemoveSkill(skill)}
                                className={`ml-1 flex items-center justify-center rounded-full w-5 h-5 transition-colors
                                  ${isMatched 
                                    ? 'text-green-600 hover:bg-green-200/50' 
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'}`}
                                aria-label={`Remove ${skill}`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )
                        })
                      ) : (
                        <div className='w-full flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200'>
                          <Layers size={32} className='text-gray-300 mb-3' />
                          <p className='text-sm font-bold text-gray-600'>No skills added yet</p>
                          <p className='text-[13px] text-gray-400 mt-1'>Add your skills below to see how well you match with this job.</p>
                        </div>
                      )}
                    </div>

                    {/* Add New Skill Section */}
                    <div className='bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
                      <div className='flex items-start gap-4 flex-1'>
                        <div className='w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 text-blue-500 flex items-center justify-center shrink-0'>
                          <Plus size={20} />
                        </div>
                        <div className='flex-1 max-w-lg'>
                          <h4 className='text-[13px] font-extrabold text-gray-900 uppercase tracking-wider mb-1'>Add a new skill</h4>
                          <p className='text-[13px] text-gray-500 mb-3'>Type a skill and press Enter or click Add to add it to your profile.</p>
                          
                          <div className='flex items-center gap-3 relative'>
                            <div className='relative flex-1'>
                              <Search size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
                              <input 
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={handleAddSkill}
                                placeholder="e.g. Docker, Kubernetes, Machine Learning..."
                                className='w-full pl-10 pr-4 py-3 text-[14px] font-medium bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all shadow-sm'
                              />
                            </div>
                            <button 
                              onClick={() => handleAddSkill({ key: 'Enter' })}
                              disabled={!newSkill.trim()}
                              className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap'
                            >
                              <Plus size={16} /> Add Skill
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Pro Tip */}
                      <div className='lg:w-64 bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 flex items-start gap-3 shrink-0'>
                        <Lightbulb size={18} className='text-yellow-500 shrink-0 mt-0.5' />
                        <div>
                          <h5 className='text-[13px] font-bold text-yellow-800 mb-0.5'>Pro Tip:</h5>
                          <p className='text-[12px] text-yellow-700/80 leading-relaxed'>Add relevant skills to get a higher match score and better job recommendations.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ABOUT COMPANY TAB */}
          {activeTab === 'About Company' && (
            <div className='animate-fadeIn space-y-6'>
              <div className='bg-white rounded-[24px] p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100'>
                <h3 className='text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2.5'>
                  <Building size={22} className='text-blue-500' /> About {JobData.companyId.name}
                </h3>
                
                {JobData.companyId.description ? (
                  <p className='text-gray-600 leading-relaxed text-[15px] mb-8'>
                    {JobData.companyId.description}
                  </p>
                ) : (
                  <p className='text-gray-500 italic mb-8'>No company description provided.</p>
                )}

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                  {JobData.companyId.companySize && (
                      <div className='flex items-center gap-4'>
                          <div className='p-3.5 bg-gray-50 text-gray-600 rounded-2xl'><Users size={20} /></div>
                          <div>
                              <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5'>Company Size</p>
                              <p className='text-[15px] font-extrabold text-gray-900'>{JobData.companyId.companySize}</p>
                          </div>
                      </div>
                  )}
                  {JobData.companyId.foundedYear && (
                      <div className='flex items-center gap-4'>
                          <div className='p-3.5 bg-gray-50 text-gray-600 rounded-2xl'><Calendar size={20} /></div>
                          <div>
                              <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5'>Founded</p>
                              <p className='text-[15px] font-extrabold text-gray-900'>{JobData.companyId.foundedYear}</p>
                          </div>
                      </div>
                  )}
                  {JobData.companyId.website && (
                      <div className='flex items-center gap-4'>
                          <div className='p-3.5 bg-gray-50 text-gray-600 rounded-2xl'><LinkIcon size={20} /></div>
                          <div>
                              <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5'>Website</p>
                              <a href={JobData.companyId.website.startsWith('http') ? JobData.companyId.website : `https://${JobData.companyId.website}`} target='_blank' rel='noreferrer' className='text-[15px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline transition-colors'>
                                Visit Website
                              </a>
                          </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIMILAR JOBS TAB (Mobile Only) */}
          {activeTab === 'Similar Jobs' && (
            <div className='animate-fadeIn lg:hidden'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-extrabold text-gray-900'>
                  More jobs from {JobData.companyId.name}
                </h3>
                {similarJobs.length > 0 && <span onClick={() => navigate(`/company/${JobData.companyId._id}`)} className='text-[13px] font-bold text-blue-600 cursor-pointer hover:underline'>View All</span>}
              </div>
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

        {/* RIGHT COLUMN (30%) */}
        <div className='w-full lg:w-[360px] xl:w-[380px] shrink-0 flex flex-col gap-6'>
          
          {/* Application Card */}
          <div className='bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100'>
            <div className='bg-green-50/80 border border-green-100 rounded-2xl p-4 flex items-start gap-3.5 mb-6'>
              <div className='w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-green-600'>
                <Zap size={18} />
              </div>
              <div>
                <h4 className='font-extrabold text-green-900 text-[15px]'>Actively Hiring</h4>
                <p className='text-[13px] font-medium text-green-700 mt-0.5'>Be among the first 50 applicants!</p>
              </div>
            </div>

            <button 
              onClick={applyHandler} 
              className={`w-full py-3.5 rounded-xl font-extrabold text-[15px] shadow-sm transition-all flex items-center justify-center gap-2 mb-3 ${isAlreadyApplied ? 'bg-[#3b82f6] text-white shadow-blue-500/20' : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5'}`}
            >
              {isAlreadyApplied ? <>Already Applied <CheckCircle2 size={18} /></> : <>Apply Now <ArrowRight size={18} /></>}
            </button>
            
            <div className='flex items-center gap-3'>
              <button 
                onClick={() => toggleSaveJob(JobData._id)}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${savedJobs?.includes(JobData._id) ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                <Bookmark size={16} fill={savedJobs?.includes(JobData._id) ? 'currentColor' : 'none'} /> 
                {savedJobs?.includes(JobData._id) ? 'Saved' : 'Save Job'}
              </button>
              <button className='flex-1 py-3.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all'>
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>

          {/* Company Overview */}
          <div className='bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100'>
            <h3 className='font-extrabold text-gray-900 text-lg mb-5'>Company Overview</h3>
            
            <div className='flex items-center gap-4 mb-5 cursor-pointer' onClick={() => navigate(`/company/${JobData.companyId._id}`)}>
              <div className='w-14 h-14 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shrink-0'>
                <img src={JobData.companyId.image} alt={JobData.companyId.name} className='max-w-full max-h-full object-contain' />
              </div>
              <div>
                <h4 className='font-extrabold text-gray-900 flex items-center gap-1.5 text-[15px]'>
                  {JobData.companyId.name} <CheckCircle2 size={16} className='text-blue-500 fill-blue-50' />
                </h4>
                <p className='text-[13px] font-medium text-gray-500 mt-0.5'>{JobData.companyId.industry || 'IT Services & Consulting'}</p>
              </div>
            </div>

            <p className='text-[14px] text-gray-600 leading-relaxed mb-6 line-clamp-4'>
              {JobData.companyId.description || `${JobData.companyId.name} is a technology-driven company focused on developing modern software, web and mobile applications for businesses. We combine innovative technology and user-friendly design to build scalable digital solutions.`}
            </p>

            <div className='grid grid-cols-3 gap-3 mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100'>
              <div className='flex flex-col items-center text-center'>
                <Users size={16} className='text-blue-500 mb-1.5' />
                <p className='text-[13px] font-extrabold text-gray-900'>{JobData.companyId.companySize || '11-50'}</p>
                <p className='text-[10px] text-gray-400 font-bold uppercase mt-0.5'>Employees</p>
              </div>
              <div className='flex flex-col items-center text-center'>
                <Calendar size={16} className='text-blue-500 mb-1.5' />
                <p className='text-[13px] font-extrabold text-gray-900'>{JobData.companyId.foundedYear || '2020'}</p>
                <p className='text-[10px] text-gray-400 font-bold uppercase mt-0.5'>Founded</p>
              </div>
              <div className='flex flex-col items-center text-center'>
                <MapPin size={16} className='text-blue-500 mb-1.5' />
                <p className='text-[13px] font-extrabold text-gray-900 truncate w-full px-1'>{JobData.location.split(',')[0]}</p>
                <p className='text-[10px] text-gray-400 font-bold uppercase mt-0.5'>Location</p>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/company/${JobData.companyId._id}`)}
              className='w-full py-2.5 text-[14px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors'>
              View Company Profile <ArrowRight size={16} />
            </button>
          </div>

          {/* Similar Jobs */}
          <div className='bg-white rounded-[24px] p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100 hidden lg:block'>
            <div className='flex items-center justify-between mb-5'>
              <h3 className='font-extrabold text-gray-900 text-lg'>Similar Jobs</h3>
              {similarJobs.length > 0 && <span onClick={() => navigate(`/company/${JobData.companyId._id}`)} className='text-[13px] font-bold text-blue-600 cursor-pointer hover:underline'>View All</span>}
            </div>
            
            <div className='flex flex-col gap-4'>
              {similarJobs.length > 0 ? similarJobs.map((job, index) => (
                <div key={index} className='group cursor-pointer' onClick={() => { navigate(`/apply-job/${job._id}`); window.scrollTo(0,0); }}>
                  <div className='flex items-start gap-3.5 mb-2'>
                    <div className='w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shrink-0 group-hover:border-blue-200 transition-colors'>
                      <img src={job.companyId.image} alt={job.companyId.name} className='max-w-full max-h-full object-contain' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-bold text-gray-900 text-[14.5px] group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug'>{job.title}</h4>
                      <p className='text-[13px] font-medium text-gray-500 mt-0.5'>{job.companyId.name} • {job.location}</p>
                    </div>
                    <span className='text-[11px] font-bold text-gray-400 whitespace-nowrap mt-0.5'>{moment(job.date).fromNow(true).replace(' ', '').replace('a', '1')}</span>
                  </div>
                  <div className='flex flex-wrap gap-2 pl-[62px]'>
                    {job.skills && job.skills.slice(0, 2).map((s, i) => (
                      <span key={i} className='text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md'>{s}</span>
                    ))}
                    {job.skills && job.skills.length > 2 && (
                      <span className='text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md'>+{job.skills.length - 2}</span>
                    )}
                  </div>
                  {index < similarJobs.length - 1 && <hr className='mt-5 border-gray-100' />}
                </div>
              )) : (
                <div className='text-center py-6'>
                  <p className='text-gray-500 text-sm font-medium'>No other open jobs found.</p>
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
