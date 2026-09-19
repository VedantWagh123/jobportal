import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('superAdminInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);

        const handleTokenRefresh = (e) => {
            const newToken = e.detail;
            setUser(prev => {
                if (prev) {
                    return { ...prev, token: newToken };
                }
                return prev;
            });
        };
        window.addEventListener('token_refreshed', handleTokenRefresh);
        return () => window.removeEventListener('token_refreshed', handleTokenRefresh);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/super-admin/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('superAdminInfo', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('superAdminInfo');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
