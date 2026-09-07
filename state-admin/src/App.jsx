import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WhatIfSimulator from './pages/WhatIfSimulator';
import DistrictIntelligence from './pages/DistrictIntelligence';
import PlacementInsights from './pages/PlacementInsights';

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
                <Route path="districts" element={<DistrictIntelligence />} />
                <Route path="simulator" element={<WhatIfSimulator />} />
                <Route path="placement-insights" element={<PlacementInsights />} />
                <Route path="reports" element={<div className="p-8 text-gray-500">Reports module coming soon...</div>} />
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
