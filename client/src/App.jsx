import { useContext, Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import 'quill/dist/quill.snow.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Loading Component
import Loading from './components/Loading'

// Lazy Load Components
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
const Upskilling = lazy(() => import('./pages/Upskilling'))

const App = () => {

  const { showRecruiterLogin, companyToken } = useContext(AppContext)

  return (
    <div>
      <Suspense fallback={<Loading />}>
        {showRecruiterLogin && <RecruiterLogin />}
        <ToastContainer />
        <Routes>
          {/* User Portal Routes wrapped in UserLayout */}
          <Route element={<UserLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/apply-job/:id' element={<ApplyJob />} />
            <Route path='/company/:id' element={<CompanyDetails />} />
            <Route path='/applications' element={<Applications />} />
            <Route path='/upskilling' element={<Upskilling />} />
          </Route>
          
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
    </div>
  )
}

export default App