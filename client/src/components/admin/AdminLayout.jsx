import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <AdminSidebar />
            
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <AdminTopbar />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="w-full px-4 py-6 md:px-8 md:py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
