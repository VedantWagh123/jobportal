import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('stateAdminToken');
            if (token) {
                try {
                    const { data } = await axios.get('/api/state-admin/auth/me', {
                        headers: { token }
                    });
                    if (data.success) {
                        setUser({ ...data.admin, token });
                    } else {
                        localStorage.removeItem('stateAdminToken');
                    }
                } catch (error) {
                    localStorage.removeItem('stateAdminToken');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/state-admin/auth/login', { email, password });
            if (data.success) {
                localStorage.setItem('stateAdminToken', data.token);
                setUser({ ...data.admin, token: data.token });
                navigate('/');
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('stateAdminToken');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
