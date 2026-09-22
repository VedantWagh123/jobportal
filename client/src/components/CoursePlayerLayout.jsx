import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CompleteProfileModal from './CompleteProfileModal';
import ViewProfileModal from './ViewProfileModal';
import { AppContext } from '../context/AppContext';
import FloatingChatbot from './FloatingChatbot';

const CoursePlayerLayout = () => {
    const { isProfileModalOpen, setIsProfileModalOpen, isViewProfileModalOpen, setIsViewProfileModalOpen } = useContext(AppContext);
    
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
            {/* Top Navigation */}
            <div className="w-full shrink-0">
                <Navbar />
            </div>
            
            {/* Main Player Content */}
            <main className="flex-1 flex w-full h-full overflow-hidden">
                <Outlet />
            </main>

            <CompleteProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />

            <ViewProfileModal 
                isOpen={isViewProfileModalOpen} 
                onClose={() => setIsViewProfileModalOpen(false)} 
            />

            <FloatingChatbot />
        </div>
    );
};

export default CoursePlayerLayout;
