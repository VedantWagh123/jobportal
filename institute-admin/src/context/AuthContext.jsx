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
            const token = localStorage.getItem('instituteToken');
            if (token) {
                try {
                    const { data } = await axios.get('/api/institute/auth/me', {
                        headers: { token }
                    });
                    if (data.success) {
                        setUser({ ...data.institute, token });
                    } else {
                        localStorage.removeItem('instituteToken');
                    }
                } catch (error) {
                    localStorage.removeItem('instituteToken');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/institute/auth/login', { email, password });
            if (data.success) {
                localStorage.setItem('instituteToken', data.token);
                setUser({ ...data.institute, token: data.token });
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
        localStorage.removeItem('instituteToken');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
