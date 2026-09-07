import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'

// ATS Pipeline — in order
const ATS_PIPELINE = [
  'Applied',
  'Screening',
  'Test_Cleared',
  'GD_Cleared',
  'Interview_Scheduled',
  'Interview_Completed',
  'Hired',
  'Rejected'
];

// Next stage in the pipeline (excludes Hired/Rejected as they need feedback)
const getNextStage = (current) => {
  const idx = ATS_PIPELINE.indexOf(current);
  if (idx === -1 || idx >= ATS_PIPELINE.length - 1) return null;
  return ATS_PIPELINE[idx + 1];
};

const STAGE_COLORS = {
  Applied:              'bg-gray-100 text-gray-700',
  Screening:            'bg-yellow-100 text-yellow-700',
  Test_Cleared:         'bg-blue-100 text-blue-700',
  GD_Cleared:           'bg-indigo-100 text-indigo-700',
  Interview_Scheduled:  'bg-purple-100 text-purple-700',
  Interview_Completed:  'bg-orange-100 text-orange-700',
  Hired:                'bg-green-100 text-green-700',
  Rejected:             'bg-red-100 text-red-700',
};

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext)
  const [applicants, setApplicants] = useState(false)

  // Feedback modal state
  const [feedbackTarget, setFeedbackTarget] = useState(null) // { application, finalStatus }
  const [jobSkills, setJobSkills] = useState([])
  const [skillRatings, setSkillRatings] = useState({}) // { skillName: 'Strong'|'Weak'|'Missing' }
  const [overallComment, setOverallComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const [jobFilter, setJobFilter] = useState('All')

  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/applicants',
        { headers: { token: companyToken } }
      )
      if (data.success) {
        setApplicants(data.applications.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Move application to next stage in the pipeline
  const advanceStage = async (applicant, newStatus) => {
    // If moving to Hired or Rejected, trigger feedback modal first
    if (newStatus === 'Hired' || newStatus === 'Rejected') {
      // Fetch the required skills for this job
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/company/job-skills/${applicant.jobId._id}`,
          { headers: { token: companyToken } }
        )
        const skills = data.success && data.skills.length > 0
          ? data.skills
          : ['Overall Performance'] // fallback if no skills mapped

        setJobSkills(skills)
        // Init all ratings as empty
        const initRatings = {};
        skills.forEach(s => initRatings[s] = null);
        setSkillRatings(initRatings)
        setOverallComment('')
        setFeedbackTarget({ application: applicant, finalStatus: newStatus })
      } catch {
        toast.error('Failed to load job skills for feedback.')
      }
      return;
    }

    // Otherwise just advance the stage directly
    try {
      const { data } = await axios.post(
        backendUrl + '/api/company/change-status',
        { id: applicant._id, status: newStatus },
        { headers: { token: companyToken } }
      )
      if (data.success) {
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
        fetchCompanyJobApplications()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Submit feedback (mandatory before Hired/Rejected is saved)
  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    // Validate all skills rated
    const missing = jobSkills.find(s => !skillRatings[s])
    if (missing) {
      toast.error(`Please rate "${missing}" before submitting.`)
      return;
    }

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

  useEffect(() => {
    if (companyToken) fetchCompanyJobApplications()
  }, [companyToken])

  const isFinalStage = (status) => status === 'Hired' || status === 'Rejected'

  // Extract unique jobs for the filter dropdown
  const uniqueJobs = applicants ? Array.from(new Set(applicants.filter(a => a.jobId).map(a => a.jobId.title))) : []

  // Filtered applicants
  const filteredApplicants = applicants ? applicants.filter(app => {
    if (jobFilter === 'All') return true;
    return app.jobId && app.jobId.title === jobFilter;
  }) : []

  // Calculate Match Percentage
  const calculateMatch = (userSkills, jobSkills) => {
    if (!jobSkills || !Array.isArray(jobSkills) || jobSkills.length === 0) return 0;
    if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) return 0;
    
    const validUserSkills = userSkills.filter(s => typeof s === 'string').map(s => s.toLowerCase());
    const validJobSkills = jobSkills.filter(s => typeof s === 'string');
    
    if (validJobSkills.length === 0 || validUserSkills.length === 0) return 0;

    const matchCount = validJobSkills.filter(js => validUserSkills.some(us => us.includes(js.toLowerCase()) || js.toLowerCase().includes(us))).length;
    return Math.round((matchCount / validJobSkills.length) * 100);
  }

  return applicants ? applicants.length === 0 ? (
    <div className='flex items-center justify-center h-[70vh]'>
      <p className='text-xl sm:text-2xl text-gray-400'>No Applications Available</p>
    </div>
  ) : (
    <div className='container mx-auto p-4 max-w-7xl pb-10'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>Job Applications</h2>
          <p className='text-sm text-gray-500 mt-1'>Manage candidate pipeline and reviews.</p>
        </div>
        
        {/* Job Filter */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-gray-600'>Filter by Job:</label>
          <select 
            value={jobFilter} 
            onChange={e => setJobFilter(e.target.value)}
            className='border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100'
          >
            <option value="All">All Jobs</option>
            {uniqueJobs.map((job, idx) => (
              <option key={idx} value={job}>{job}</option>
            ))}
          </select>
        </div>
      </div>

      <div className='overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm'>
        <table className='w-full text-sm text-left whitespace-nowrap'>
          <thead className='bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100'>
            <tr className='bg-gray-50 border-b text-left text-gray-600'>
              <th className='py-3.5 px-6 font-semibold'>#</th>
              <th className='py-3.5 px-6 font-semibold'>Candidate</th>
              <th className='py-3.5 px-6 font-semibold max-sm:hidden'>Job Role</th>
              <th className='py-3.5 px-6 font-semibold text-center'>Skill Match</th>
              <th className='py-3.5 px-6 font-semibold'>Resume</th>
              <th className='py-3.5 px-6 font-semibold'>Status</th>
              <th className='py-3.5 px-6 font-semibold'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {filteredApplicants.filter(item => item.jobId && item.userId).map((applicant, index) => {
              const next = getNextStage(applicant.status)
              const isFinal = isFinalStage(applicant.status)
              const match = calculateMatch(applicant.userId.skills, applicant.jobId.skills);
              
              return (
                <tr key={index} className='text-gray-700 hover:bg-gray-50/50 transition-colors group'>
                  <td className='py-4 px-6 text-gray-400 font-medium'>{index + 1}</td>
                  <td className='py-4 px-6'>
                    <div className='flex items-center gap-3'>
                      <img className='w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm max-sm:hidden' src={applicant.userId.image} alt='' />
                      <div>
                        <span className='font-bold text-gray-900 block'>{applicant.userId.name}</span>
                        <span className='text-xs text-gray-500 truncate w-32 block'>{applicant.userId.email || 'Candidate'}</span>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 px-6 max-sm:hidden'>
                    <span className='text-gray-800 font-medium block'>{applicant.jobId.title}</span>
                    <span className='text-xs text-gray-500 block'>{applicant.jobId.location}</span>
                  </td>
                  <td className='py-4 px-6 text-center'>
                    <div className='flex items-center justify-center gap-2'>
                        <div className='w-16 bg-gray-200 rounded-full h-1.5'>
                            <div className={`h-1.5 rounded-full ${match >= 75 ? 'bg-green-500' : match >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${match}%` }}></div>
                        </div>
                        <span className={`text-xs font-bold ${match >= 75 ? 'text-green-600' : match >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>{match}%</span>
                    </div>
                  </td>
                  <td className='py-4 px-6'>
                    <a href={applicant.userId.resume ? applicant.userId.resume.replace('/upload/', '/upload/fl_attachment/') : '#'} target='_blank' rel='noopener noreferrer'
                      className='bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex gap-1.5 items-center hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-200'
                    >
                      Resume <img src={assets.resume_download_icon} alt='' className='w-3 h-3' />
                    </a>
                  </td>
                  <td className='py-4 px-6'>
                    <span className={`inline-flex px-3 py-1 rounded-md text-xs font-bold border ${STAGE_COLORS[applicant.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {applicant.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className='py-4 px-6'>
                    {isFinal ? (
                      <span className='text-xs text-gray-400 italic'>
                        {applicant.feedbackSubmitted ? '✅ Feedback Done' : 'Closed'}
                      </span>
                    ) : next ? (
                      <div className='flex flex-col gap-1.5'>
                        {/* Advance to next stage */}
                        <button
                          onClick={() => advanceStage(applicant, next)}
                          className='text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap'
                        >
                          → {next.replace(/_/g, ' ')}
                        </button>
                        {/* If not yet Interview_Completed, also allow direct Reject */}
                        {applicant.status !== 'Interview_Completed' && (
                          <button
                            onClick={() => advanceStage(applicant, 'Rejected')}
                            className='text-xs bg-red-50 text-red-600 border border-transparent px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 hover:border-red-200 transition-colors'
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ===== Skill Feedback Modal ===== */}
      {feedbackTarget && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl'>
            {/* Header */}
            <div className='mb-5'>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${feedbackTarget.finalStatus === 'Hired' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {feedbackTarget.finalStatus === 'Hired' ? '🎉 Hired' : '❌ Rejected'}
              </span>
              <h3 className='text-lg font-bold text-gray-900'>Quick Skill Feedback</h3>
              <p className='text-sm text-gray-500 mt-0.5'>
                Rate <span className='font-semibold text-gray-800'>{feedbackTarget.application.userId.name}</span> on each skill for <span className='font-semibold'>{feedbackTarget.application.jobId.title}</span>.
                <br />
                <span className='text-xs text-indigo-600 font-medium'>This takes 30–60 seconds and helps AI improve training quality. 🚀</span>
              </p>
            </div>

            <form onSubmit={handleSubmitFeedback}>
              {/* Per-skill rating */}
              <div className='space-y-3 mb-5 max-h-52 overflow-y-auto pr-1'>
                {jobSkills.map(skill => (
                  <div key={skill} className='flex items-center justify-between gap-2'>
                    <span className='text-sm font-medium text-gray-700 min-w-0 truncate'>{skill}</span>
                    <div className='flex gap-1.5 flex-shrink-0'>
                      {['Strong', 'Weak', 'Missing'].map(rating => (
                        <button
                          key={rating}
                          type='button'
                          onClick={() => setSkillRatings(prev => ({ ...prev, [skill]: rating }))}
                          className={`text-xs px-3 py-1 rounded-full font-semibold border transition-all ${
                            skillRatings[skill] === rating
                              ? rating === 'Strong'
                                ? 'bg-green-500 text-white border-green-500'
                                : rating === 'Weak'
                                  ? 'bg-yellow-400 text-white border-yellow-400'
                                  : 'bg-red-500 text-white border-red-500'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {rating === 'Strong' ? '✅' : rating === 'Weak' ? '⚠️' : '❌'} {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional comment */}
              <div className='mb-5'>
                <label className='block text-xs font-medium text-gray-500 mb-1'>Overall Comment (optional)</label>
                <textarea
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  className='w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none resize-none'
                  rows='2'
                  placeholder='Any additional remarks about this candidate...'
                />
              </div>

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setFeedbackTarget(null)}
                  className='px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submittingFeedback}
                  className='px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {submittingFeedback ? 'Submitting...' : `Submit & Mark ${feedbackTarget.finalStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  ) : <Loading />
}

export default ViewApplications