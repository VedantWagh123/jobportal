import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from '@clerk/clerk-react';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { userId } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to the backend
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const newSocket = io(backendUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to real-time server');
        });

        // Global listeners for real-time notifications
        newSocket.on('notification', (data) => {
            toast.info(data.message, {
                position: "top-right",
                autoClose: 5000,
            });
        });

        newSocket.on('new_job', (data) => {
            toast.success(`New Job Posted: ${data.title}`, {
                position: "top-right",
                autoClose: 5000,
            });
        });

        newSocket.on('candidate_notification', (data) => {
            if (userId && data.userId === userId) {
                toast.success(data.message, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        });

        return () => newSocket.close();
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
