import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SkillsManagement = lazy(() => import('./pages/SkillsManagement'));
const StateAdmins = lazy(() => import('./pages/StateAdmins'));
const InstituteManagement = lazy(() => import('./pages/InstituteManagement'));
const EmployersManagement = lazy(() => import('./pages/EmployersManagement'));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const Settings = lazy(() => import('./pages/Settings'));
const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));
const AiCommandCenter = lazy(() => import('./pages/AiCommandCenter'));

// Protect routes
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    
    return children;
};

function AppRoutes() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="skills" element={<SkillsManagement />} />
                    <Route path="admins" element={<StateAdmins />} />
                    <Route path="institutes" element={<InstituteManagement />} />
                    <Route path="employers" element={<EmployersManagement />} />
                    <Route path="users" element={<UsersManagement />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="reports" element={<ReportsAnalytics />} />
                    <Route path="ai-command-center" element={<AiCommandCenter />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

function App() {
    return (
        <SocketProvider>
            <AuthProvider>
                <Router>
                    <ToastContainer />
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </SocketProvider>
    );
}

export default App;
