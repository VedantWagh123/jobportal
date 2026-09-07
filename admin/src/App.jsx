import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SkillsManagement from './pages/SkillsManagement';
import StateAdmins from './pages/StateAdmins';
import InstituteManagement from './pages/InstituteManagement';
import EmployersManagement from './pages/EmployersManagement';

// Protect routes
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="skills" element={<SkillsManagement />} />
                <Route path="admins" element={<StateAdmins />} />
                <Route path="institutes" element={<InstituteManagement />} />
                <Route path="employers" element={<EmployersManagement />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
