import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AdminContext = createContext();

export const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
    const [adminData, setAdminData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAdminProfile = async () => {
        try {
            if (!adminToken) {
                setIsLoading(false);
                return;
            }
            const { data } = await axios.get(backendUrl + '/api/government-admin/auth/me', {
                headers: { token: adminToken }
            });
            if (data.success) {
                setAdminData(data.admin);
            } else {
                setAdminToken(null);
                localStorage.removeItem('adminToken');
            }
        } catch (error) {
            console.error("Admin Auth Error:", error);
            setAdminToken(null);
            localStorage.removeItem('adminToken');
        } finally {
            setIsLoading(false);
        }
    };

    const loginAdmin = async (email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/government-admin/auth/login', { email, password });
            if (data.success) {
                setAdminToken(data.token);
                setAdminData(data.admin);
                localStorage.setItem('adminToken', data.token);
                toast.success('Logged in successfully');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const logoutAdmin = () => {
        setAdminToken(null);
        setAdminData(null);
        localStorage.removeItem('adminToken');
        toast.success('Logged out');
    };

    useEffect(() => {
        fetchAdminProfile();
    }, [adminToken]);

    const value = {
        backendUrl,
        adminToken,
        adminData,
        isLoading,
        loginAdmin,
        logoutAdmin,
        setAdminToken // in case needed directly
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};
