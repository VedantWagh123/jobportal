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

const Applications = () => {

  const { user } = useUser()
  const { getToken } = useAuth()

  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)
  
  // AI Career & Skill Gap states
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [isUpdatingSkills, setIsUpdatingSkills] = useState(false)
  
  const [targetJobs, setTargetJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

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
  
  const updateSkills = async (updatedSkills) => {
    setIsUpdatingSkills(true)
    try {
        const token = await getToken()
        const { data } = await axios.post(backendUrl + '/api/users/update-skills',
            { skills: updatedSkills },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        if (data.success) {
            setSkills(data.skills)
            toast.success('Skills updated')
            if (selectedJobId) fetchAnalysis(selectedJobId, data.skills) // re-run analysis
        } else {
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
    setIsUpdatingSkills(false)
  }

  const handleAddSkill = () => {
      if (!newSkill.trim()) return;
      
      // Auto split by comma in case user pastes a comma-separated list
      const skillsToAdd = newSkill.split(',').map(s => s.trim()).filter(s => s);
      
      let updatedSkills = [...skills];
      let addedAny = false;
      
      for (const s of skillsToAdd) {
          if (!updatedSkills.includes(s)) {
              updatedSkills.push(s);
              addedAny = true;
          }
      }
      
      if (addedAny) {
          updateSkills(updatedSkills);
      }
      setNewSkill('');
  }
  
  const handleRemoveSkill = (skillToRemove) => {
      const updatedSkills = skills.filter(s => s !== skillToRemove)
      updateSkills(updatedSkills)
  }

  const fetchTargetJobs = async () => {
      try {
          const { data } = await axios.get(backendUrl + '/api/users/career/jobs');
          if (data.success) setTargetJobs(data.jobs)
      } catch (error) {
          console.error(error)
      }
  }

  const fetchAnalysis = async (jobId, currentSkills = skills) => {
      setAnalyzing(true)
      try {
          const token = await getToken()
          const { data } = await axios.get(`${backendUrl}/api/users/career/skill-gap/${jobId}`, {
              headers: { Authorization: `Bearer ${token}` }
          })
          if (data.success) {
              setAnalysis(data.analysis)
          }
      } catch (error) {
          toast.error('Failed to run career analysis')
      }
      setAnalyzing(false)
  }

  useEffect(() => {
    if (user) {
      fetchUserApplications()
      fetchTargetJobs()
    }
  }, [user])
  
  useEffect(() => {
      if (userData) {
          setSkills(userData.skills || [])
      }
  }, [userData])

  const handleJobSelect = (e) => {
      const jId = e.target.value;
      setSelectedJobId(jId);
      if (jId) {
          fetchAnalysis(jId);
      } else {
          setAnalysis(null);
      }
  }

  return userData ? (
    <>
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
        <h2 className='text-xl font-semibold'>Your Resume</h2>
        <div className='flex gap-2 mb-6 mt-3'>
          {
            isEdit || userData && userData.resume === ""
              ? <>
                <label className='flex items-center' htmlFor="resumeUpload">
                  <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>{resume ? resume.name : "Select Resume"}</p>
                  <input id='resumeUpload' onChange={e => setResume(e.target.files[0])} accept='application/pdf' type="file" hidden />
                  <img src={assets.profile_upload_icon} alt="" />
                </label>
                <button onClick={updateResume} className='bg-green-100 border border-green-400 rounded-lg px-4 py-2'>Save</button>
              </>
              : <div className='flex gap-2'>
                <a target='_blank' href={userData.resume ? userData.resume.replace('/upload/', '/upload/fl_attachment/') : '#'} className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg' rel="noreferrer">
                  Resume
                </a>
                <button onClick={() => setIsEdit(true)} className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2'>
                  Edit
                </button>
              </div>
          }
        </div>
        
        <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>
        <div className="overflow-x-auto">
            <table className='min-w-full bg-white border rounded-lg'>
            <thead>
                <tr>
                <th className='py-3 px-4 border-b text-left text-sm font-semibold'>Company</th>
                <th className='py-3 px-4 border-b text-left text-sm font-semibold'>Job Title</th>
                <th className='py-3 px-4 border-b text-left max-sm:hidden text-sm font-semibold'>Location</th>
                <th className='py-3 px-4 border-b text-left max-sm:hidden text-sm font-semibold'>Date</th>
                <th className='py-3 px-4 border-b text-left text-sm font-semibold'>Status</th>
                </tr>
            </thead>
            <tbody>
                {userApplications.map((job, index) => true ? (
                <tr key={index} className='hover:bg-gray-50'>
                    <td className='py-3 px-4 flex items-center gap-2 border-b text-sm'>
                    <img className='w-8 h-8 rounded' src={job.companyId.image} alt="" />
                    {job.companyId.name}
                    </td>
                    <td className='py-2 px-4 border-b text-sm'>{job.jobId.title}</td>
                    <td className='py-2 px-4 border-b max-sm:hidden text-sm'>{job.jobId.location}</td>
                    <td className='py-2 px-4 border-b max-sm:hidden text-sm'>{moment(job.date).format('ll')}</td>
                    <td className='py-2 px-4 border-b text-sm'>
                    <span className={`${job.status === 'Accepted' ? 'bg-green-100 text-green-800' : job.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} px-3 py-1 rounded-full text-xs font-medium`}>
                        {job.status}
                    </span>
                    </td>
                </tr>
                ) : (null))}
                {userApplications.length === 0 && (
                    <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-500">No applications found.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Skills Section - Moved closer to AI Career */}
        <h2 className='text-xl font-semibold mb-2 mt-12 pt-8 border-t'>Your Profile Skills</h2>
        <div className='mb-6'>
            <p className='text-sm text-gray-500 mb-3'>Add your current skills to calculate your skill gap against industry requirements.</p>
            <div className='flex flex-wrap gap-2 mb-3'>
                {skills.length === 0 ? <span className='text-gray-500 text-sm'>No skills added yet.</span> : null}
                {skills.map((s, idx) => (
                    <span key={idx} className='bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center'>
                        {s}
                        <button onClick={() => handleRemoveSkill(s)} className='ml-2 text-blue-400 hover:text-blue-700 font-bold'>×</button>
                    </span>
                ))}
            </div>
            <div className='flex gap-2 max-w-sm'>
                <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddSkill()} placeholder="e.g. React.js, Docker" className='border border-gray-300 rounded-lg px-3 py-2 w-full text-sm outline-none focus:ring-1 focus:ring-blue-500' />
                <button onClick={handleAddSkill} disabled={isUpdatingSkills} className='bg-blue-600 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50'>Add</button>
            </div>
        </div>

        {/* AI Career & Skill Gap Section */}
        <h2 className='text-2xl font-bold mb-4 mt-12 text-gray-900 border-t pt-8'>AI Career & Skill Gap</h2>
        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-12'>
            <div className='mb-6 max-w-xl'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Find Your Skill Gap: Choose a Target Job</label>
                <select value={selectedJobId} onChange={handleJobSelect} className='w-full border border-gray-300 rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500'>
                    <option value="">Select a target job...</option>
                    {targetJobs.map(job => (
                        <option key={job._id} value={job._id}>{job.title} at {job.companyId?.name} ({job.location})</option>
                    ))}
                </select>
            </div>

            {analyzing && <div className='py-12 text-center text-blue-600 font-medium'>Analyzing your profile against industry requirements...</div>}

            {!analyzing && analysis && (
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Left Column: Match Score & Skills */}
                    <div className='lg:col-span-1 space-y-6'>
                        <div className='bg-gray-50 p-6 rounded-xl border border-gray-100 text-center shadow-inner'>
                            <p className='text-sm text-gray-500 mb-2 font-bold uppercase tracking-wider'>Your Skill Match</p>
                            <div className='text-6xl font-black text-blue-600 mb-2'>{analysis.matchScore}%</div>
                            <p className='text-sm text-gray-600'>{analysis.matchedSkills.length} of {analysis.requiredSkills.length} required skills matched</p>
                        </div>
                        
                        <div>
                            <h3 className='font-bold text-gray-900 mb-3 border-b pb-2'>Your Matched Skills</h3>
                            <div className='flex flex-wrap gap-2'>
                                {analysis.matchedSkills.length === 0 ? <span className='text-gray-500 text-sm'>None matched</span> : null}
                                {analysis.matchedSkills.map(s => (
                                    <span key={s.id} className='bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm'>
                                        ✓ {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className='font-bold text-gray-900 mb-3 border-b pb-2'>Skills You Need (Missing)</h3>
                            <div className='flex flex-wrap gap-2'>
                                {analysis.missingSkills.length === 0 ? <span className='text-gray-500 text-sm'>You have all required skills!</span> : null}
                                {analysis.missingSkills.map(s => (
                                    <span key={s.id} className='bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm'>
                                        ✗ {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recommendations */}
                    <div className='lg:col-span-2'>
                        <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            Recommended Government Training
                        </h3>
                        {analysis.missingSkills.length === 0 && !analysis.message ? (
                            <div className='p-6 bg-green-50 border border-green-100 rounded-xl text-green-800 text-center shadow-sm'>
                                <p className='font-bold text-lg'>Great job! You meet the skill requirements for this position.</p>
                                <p className='mt-2 mb-4'>Consider applying immediately using the Job Portal.</p>
                                <button onClick={() => window.open(`/apply-job/${selectedJobId}`, '_blank')} className='bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm'>
                                    Apply for this Job Now
                                </button>
                            </div>
                        ) : analysis.recommendations.length === 0 && !analysis.message ? (
                            <div className='p-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-center text-sm shadow-sm'>
                                No government training course currently covers your specific missing skills.
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {analysis.recommendations.map(rec => (
                                    <div key={rec.courseId} className='border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition bg-white relative overflow-hidden'>
                                        {/* Status Ribbon */}
                                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg shadow-sm ${rec.batchAvailable ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {rec.batchAvailable ? 'Active Batch Available' : 'Course Available - No Upcoming Batch'}
                                        </div>
                                        
                                        <h4 className='font-bold text-lg text-blue-700 pr-48'>{rec.courseName}</h4>
                                        <p className='text-gray-700 text-sm font-medium mb-3'>{rec.instituteName} • {rec.districtName}</p>
                                        
                                        <div className='mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100'>
                                            <p className='text-xs text-gray-500 font-bold uppercase mb-2'>Fills these missing skills:</p>
                                            <div className='flex flex-wrap gap-1.5'>
                                                {rec.coveredSkills.map((skill, i) => (
                                                    <span key={i} className='bg-white border border-gray-200 text-gray-800 px-2.5 py-1 rounded text-xs font-medium shadow-sm'>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <button disabled={!rec.batchAvailable} className={`px-5 py-2 text-sm font-medium rounded-lg transition shadow-sm ${rec.batchAvailable ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}>
                                            View Course Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {analysis?.message && (
                            <div className='mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm shadow-sm font-medium'>
                                {analysis.message}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
      <Footer />
    </>
  ) : <Loading />
}

export default Applications