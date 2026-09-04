import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import Navbar from './Navbar';

const UserLayout = () => {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Sidebar */}
            <UserSidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar now sits inside the main content area, next to the sidebar */}
                <Navbar />
                
                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
