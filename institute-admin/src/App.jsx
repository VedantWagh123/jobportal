import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Batches from './pages/Batches';
import Enrollments from './pages/Enrollments';
import Settings from './pages/Settings';
import PlacementResults from './pages/PlacementResults';
import InstituteProfile from './pages/InstituteProfile';
import CurriculumGap from './pages/CurriculumGap';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="courses" element={<Courses />} />
                <Route path="batches" element={<Batches />} />
                <Route path="trainers" element={<div className="p-8 text-gray-500">Trainer planning coming soon...</div>} />
                <Route path="enrollments" element={<Enrollments />} />
                <Route path="placement" element={<PlacementResults />} />
                <Route path="profile" element={<InstituteProfile />} />
                <Route path="curriculum-gap" element={<CurriculumGap />} />
                <Route path="settings" element={<Settings />} />
                <Route path="equipment" element={<div className="p-8 text-gray-500">Equipment & Lab management coming soon...</div>} />
            </Route>
        </Routes>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
