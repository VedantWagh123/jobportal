import React, { useContext, useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobListing from '../components/JobListing'
import AppDownload from '../components/AppDownload'
import FeaturesSection from '../components/FeaturesSection'
import EmployerCTA from '../components/EmployerCTA'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { AppContext } from '../context/AppContext'
import CompleteProfileModal from '../components/CompleteProfileModal'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import HomeResumeAnalyzer from '../components/HomeResumeAnalyzer'
import HomeInterviewPrep from '../components/HomeInterviewPrep'

const Home = () => {
  const { userData, isProfileModalOpen, setIsProfileModalOpen } = useContext(AppContext);
  const [showResumeAlert, setShowResumeAlert] = useState(() => {
    return localStorage.getItem('hideResumeAlert') !== 'true';
  });

  // Check if profile is incomplete (missing resume)
  const isProfileIncomplete = userData && !userData.resume;

  return (
    <div className='bg-[#F8FAFC] min-h-screen pb-12'>
      <SEO title="Home" description="Find thousands of job opportunities across India, powered by the Government Skill Intelligence Platform." />
      
      {/* Profile Update Banner (Inline above Hero) */}
      <AnimatePresence>
        {isProfileIncomplete && showResumeAlert && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 relative z-20"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-white text-blue-600 p-2.5 rounded-full shadow-sm shrink-0">
                        <Sparkles size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-extrabold text-gray-900 leading-tight mb-0.5">Complete Your Profile</h4>
                        <p className="text-[13px] font-medium text-gray-600 leading-snug max-w-xl">
                            Upload your resume to let our AI automatically find and recommend the best jobs tailored for you.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
                    <button 
                      onClick={() => {
                        setShowResumeAlert(false);
                        localStorage.setItem('hideResumeAlert', 'true');
                        setTimeout(() => setIsProfileModalOpen(true), 150);
                      }}
                      className="w-full sm:w-auto text-[13px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 flex items-center justify-center whitespace-nowrap"
                    >
                        Update Profile
                    </button>
                    <button 
                      onClick={() => {
                        setShowResumeAlert(false);
                        localStorage.setItem('hideResumeAlert', 'true');
                      }} 
                      className="text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 p-2.5 rounded-xl transition-colors shrink-0"
                      title="Dismiss"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Hero />
      <JobListing />
      <HomeResumeAnalyzer />
      <HomeInterviewPrep />
      <FeaturesSection />
      <EmployerCTA />
      <AppDownload />
      <Footer />
      
    </div>
  )
}

export default Home