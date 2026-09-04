import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';

const AdminProtectedRoute = ({ children }) => {
    const { adminToken, isLoading } = useContext(AdminContext);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!adminToken) {
        return <Navigate to="/government-admin/login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
