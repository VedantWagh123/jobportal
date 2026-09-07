import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import { Bookmark, ArrowLeft } from 'lucide-react'

const SavedJobs = () => {
  const { jobs, savedJobs } = useContext(AppContext)
  const navigate = useNavigate()

  // Filter jobs based on savedJobs array
  const savedJobsData = jobs.filter(job => savedJobs.includes(job._id))

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <div className='container px-4 2xl:px-20 mx-auto pt-8 flex-1 pb-20'>
        
        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <button 
            onClick={() => navigate(-1)}
            className='p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition'
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2'>
              <Bookmark className='text-blue-600' fill='currentColor' size={28} />
              Saved Jobs
            </h1>
            <p className='text-sm text-gray-500 mt-1 font-medium'>
              You have {savedJobs.length} saved {savedJobs.length === 1 ? 'job' : 'jobs'} in your wishlist
            </p>
          </div>
        </div>

        {/* Content */}
        {savedJobsData.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {savedJobsData.map((job, index) => (
              <JobCard key={index} job={job} />
            ))}
          </div>
        ) : (
          <div className='bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[40vh]'>
            <div className='w-20 h-20 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4'>
              <Bookmark size={40} />
            </div>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Your wishlist is empty</h2>
            <p className='text-gray-500 max-w-sm mx-auto mb-6'>
              When you see a job you like, click the save button to keep it here and apply later.
            </p>
            <button 
              onClick={() => navigate('/')}
              className='bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 transition-all'
            >
              Browse Jobs
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default SavedJobs
