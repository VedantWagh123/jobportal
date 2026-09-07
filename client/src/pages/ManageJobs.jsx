import { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { Search, Plus, Briefcase, Eye, EyeOff } from 'lucide-react'

const ManageJobs = () => {

  const navigate = useNavigate()

  const [jobs, setJobs] = useState(false)
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const { backendUrl, companyToken } = useContext(AppContext)

  // Function to fetch company Job Applications data 
  const fetchCompanyJobs = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/company/list-jobs',
        { headers: { token: companyToken } }
      )

      if (data.success) {
        setJobs(data.jobsData.reverse())
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  // Function to change Job Visibility 
  const changeJobVisiblity = async (id) => {

    try {

      const { data } = await axios.post(backendUrl + '/api/company/change-visiblity',
        { id },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchCompanyJobs()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs()
    }
  }, [companyToken])

  if (jobs === false) return <Loading />

  // Filter and Search Logic
  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = filter === 'All' ? true : filter === 'Active' ? job.visible : !job.visible
    return matchSearch && matchFilter
  })

  return (
    <div className='container mx-auto p-4 max-w-6xl pb-10'>
      {/* Top Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>Manage Jobs</h2>
          <p className='text-sm text-gray-500 mt-1'>Track and manage your company's job postings.</p>
        </div>
        <button onClick={() => navigate('/dashboard/add-job')} className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2 text-sm w-fit'>
          <Plus size={18} />
          Add New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        // Global Empty State (No jobs posted ever)
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center'>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <Briefcase size={28} />
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-2'>No jobs posted yet</h3>
          <p className='text-gray-500 max-w-md mx-auto mb-6'>Get started by creating your first job posting to attract top talent.</p>
          <button onClick={() => navigate('/dashboard/add-job')} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2'>
            <Plus size={18} />
            Create your first job
          </button>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          
          {/* Filters & Search Bar */}
          <div className='p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50'>
            <div className='flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-fit'>
              {['All', 'Active', 'Hidden'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className='relative max-w-xs w-full'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search size={16} className='text-gray-400' />
              </div>
              <input 
                type="text" 
                placeholder="Search jobs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 sm:text-sm transition-all'
              />
            </div>
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm text-left whitespace-nowrap'>
              <thead className='bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100'>
                <tr>
                  <th className='py-3.5 px-6 font-semibold'>Job Title</th>
                  <th className='py-3.5 px-6 font-semibold'>Location</th>
                  <th className='py-3.5 px-6 font-semibold'>Posted Date</th>
                  <th className='py-3.5 px-6 font-semibold'>Applicants</th>
                  <th className='py-3.5 px-6 font-semibold'>Status</th>
                  <th className='py-3.5 px-6 font-semibold text-right'>Visibility</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className='py-12 text-center text-gray-500'>
                      No jobs match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr key={index} className='hover:bg-gray-50/50 transition-colors group'>
                      <td className='py-4 px-6 font-semibold text-gray-900'>{job.title}</td>
                      <td className='py-4 px-6 text-gray-500'>{job.location}</td>
                      <td className='py-4 px-6 text-gray-500'>{moment(job.date).format('MMM DD, YYYY')}</td>
                      <td className='py-4 px-6'>
                        <button onClick={() => navigate('/dashboard/view-applications')} className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium text-xs hover:bg-blue-100 transition-colors'>
                          <UsersIcon className="w-3.5 h-3.5" />
                          {job.applicants}
                        </button>
                      </td>
                      <td className='py-4 px-6'>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${job.visible ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                          {job.visible ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className='py-4 px-6 text-right'>
                        <button 
                          onClick={() => changeJobVisiblity(job._id)}
                          title={job.visible ? "Hide Job" : "Show Job"}
                          className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors border ${job.visible ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-100' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-100'}`}
                        >
                          {job.visible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple icon for applicants
const UsersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
)

export default ManageJobs