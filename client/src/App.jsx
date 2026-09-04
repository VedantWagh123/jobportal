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
const AddJob = lazy(() => import('./pages/AddJob'))
const ManageJobs = lazy(() => import('./pages/ManageJobs'))
const ViewApplications = lazy(() => import('./pages/ViewApplications'))
const UserLayout = lazy(() => import('./components/UserLayout'))
const AdminProtectedRoute = lazy(() => import('./components/admin/AdminProtectedRoute'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const IntelligenceDashboard = lazy(() => import('./pages/admin/IntelligenceDashboard'))
const AdminDistricts = lazy(() => import('./pages/admin/AdminDistricts'))
const AdminInstitutes = lazy(() => import('./pages/admin/AdminInstitutes'))
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'))
const AdminCourseSkills = lazy(() => import('./pages/admin/AdminCourseSkills'))
const AdminBatches = lazy(() => import('./pages/admin/AdminBatches'))
const AdminEnrollments = lazy(() => import('./pages/admin/AdminEnrollments'))
const AdminUnresolvedSkills = lazy(() => import('./pages/admin/AdminUnresolvedSkills'))

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
            <Route path='/applications' element={<Applications />} />
          </Route>
          
          {/* Company Dashboard (Keeps its own layout) */}
          <Route path='/dashboard' element={<Dashboard />}>
            {
              companyToken ? <>
                <Route path='add-job' element={<AddJob />} />
                <Route path='manage-jobs' element={<ManageJobs />} />
                <Route path='view-applications' element={<ViewApplications />} />
              </> : null
            }
          </Route>
          
          {/* Government Admin Routes */}
          <Route path='/government-admin/login' element={<AdminLogin />} />
          <Route path='/government-admin' element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<IntelligenceDashboard />} />
            <Route path='districts' element={<AdminDistricts />} />
            <Route path='institutes' element={<AdminInstitutes />} />
            <Route path='courses' element={<AdminCourses />} />
            <Route path='course-skills' element={<AdminCourseSkills />} />
            <Route path='batches' element={<AdminBatches />} />
            <Route path='enrollments' element={<AdminEnrollments />} />
            <Route path='unresolved-skills' element={<AdminUnresolvedSkills />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App