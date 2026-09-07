import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import Navbar from './Navbar';
import CompleteProfileModal from './CompleteProfileModal';
import ViewProfileModal from './ViewProfileModal';
import { AppContext } from '../context/AppContext';

const UserLayout = () => {
    const { isProfileModalOpen, setIsProfileModalOpen, isViewProfileModalOpen, setIsViewProfileModalOpen } = useContext(AppContext);
    
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Sidebar */}
            <UserSidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
                {/* Navbar now sits inside the main content area, next to the sidebar */}
                <Navbar />
                
                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>

            <CompleteProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />

            <ViewProfileModal 
                isOpen={isViewProfileModalOpen} 
                onClose={() => setIsViewProfileModalOpen(false)} 
            />
        </div>
    );
};

export default UserLayout;
