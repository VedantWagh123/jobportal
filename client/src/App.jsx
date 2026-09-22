import { useContext, Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import 'quill/dist/quill.snow.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Loading Component
import Loading from './components/Loading'
import ErrorBoundary from './components/ErrorBoundary'
import PremiumUnlockModal from './components/PremiumUnlockModal'

// Lazy Load Components
import InstallPrompt from './components/InstallPrompt'
const Home = lazy(() => import('./pages/Home'))
const ApplyJob = lazy(() => import('./pages/ApplyJob'))
const Applications = lazy(() => import('./pages/Applications'))
const RecruiterLogin = lazy(() => import('./components/RecruiterLogin'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DashboardHome = lazy(() => import('./pages/DashboardHome'))
const AddJob = lazy(() => import('./pages/AddJob'))
const ManageJobs = lazy(() => import('./pages/ManageJobs'))
const ViewApplications = lazy(() => import('./pages/ViewApplications'))
const CandidateManagement = lazy(() => import('./pages/CandidateManagement'))
const RecruitmentAnalytics = lazy(() => import('./pages/RecruitmentAnalytics'))
const Notifications = lazy(() => import('./pages/Notifications'))
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'))
const CompanyDetails = lazy(() => import('./pages/CompanyDetails'))
const UserLayout = lazy(() => import('./components/UserLayout'))
const CoursePlayerLayout = lazy(() => import('./components/CoursePlayerLayout'))
const Upskilling = lazy(() => import('./pages/Upskilling'))
const CourseDetails = lazy(() => import('./pages/CourseDetails'))
const LecturePlayer = lazy(() => import('./pages/LecturePlayer'))
const MyCourses = lazy(() => import('./pages/MyCourses'))
const CareerGap = lazy(() => import('./pages/CareerGap'))
const SavedJobs = lazy(() => import('./pages/SavedJobs'))
const ResumeDashboard = lazy(() => import('./pages/ResumeDashboard'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const SmartMatch = lazy(() => import('./pages/SmartMatch'))
const Pricing = lazy(() => import('./pages/Pricing'))

const App = () => {

  const { showRecruiterLogin, companyToken } = useContext(AppContext)

  return (
    <div>
      <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <ToastContainer />
        <InstallPrompt />
        <PremiumUnlockModal />
        <Routes>
          {/* User Portal Routes wrapped in UserLayout */}
          <Route element={<UserLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/apply-job/:id' element={<ApplyJob />} />
            <Route path='/company/:id' element={<CompanyDetails />} />
            <Route path='/applications' element={<Applications />} />
            <Route path='/upskilling' element={<Upskilling />} />
            <Route path='/course/:id' element={<CourseDetails />} />
            <Route path='/my-courses' element={<MyCourses />} />
            <Route path='/career-gap' element={<CareerGap />} />
            <Route path='/saved-jobs' element={<SavedJobs />} />
            <Route path='/resumes' element={<ResumeDashboard />} />
            <Route path='/smart-match' element={<SmartMatch />} />
            <Route path='/pricing' element={<Pricing />} />
          </Route>
          
          {/* Course Player Route wrapped in CoursePlayerLayout */}
          <Route element={<CoursePlayerLayout />}>
             <Route path='/course-player/:enrollmentId' element={<LecturePlayer />} />
          </Route>

          {/* Standalone Full-Screen Routes */}
          <Route path='/resumes/build/:id' element={<ResumeBuilder />} />

          <Route path='/employer-auth' element={<RecruiterLogin />} />

          {/* Company Dashboard (Keeps its own layout) */}
          <Route path='/dashboard' element={<Dashboard />}>
            {
              companyToken ? <>
                <Route index element={<DashboardHome />} />
                <Route path='add-job' element={<AddJob />} />
                <Route path='manage-jobs' element={<ManageJobs />} />
                <Route path='view-applications' element={<ViewApplications />} />
                <Route path='candidates' element={<CandidateManagement />} />
                <Route path='analytics' element={<RecruitmentAnalytics />} />
                <Route path='notifications' element={<Notifications />} />
                <Route path='profile' element={<CompanyProfile />} />
              </> : null
            }
          </Route>
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default App