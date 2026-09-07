import React, { useContext, useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobListing from '../components/JobListing'
import AppDownload from '../components/AppDownload'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { AppContext } from '../context/AppContext'
import CompleteProfileModal from '../components/CompleteProfileModal'
import { AlertCircle } from 'lucide-react'
import FloatingChatbot from '../components/FloatingChatbot'

const Home = () => {
  const { userData, isProfileModalOpen, setIsProfileModalOpen } = useContext(AppContext);

  // Check if profile is incomplete (missing resume or college)
  const isProfileIncomplete = userData && (!userData.resume || !userData.college);

  return (
    <div className='bg-gray-50/30 min-h-screen pb-12'>
      <SEO title="Home" description="Find thousands of job opportunities across India, powered by the Government Skill Intelligence Platform." />
      
      {/* Profile Completion Alert / Banner */}
      {isProfileIncomplete ? (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="container px-4 2xl:px-20 mx-auto py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-blue-800">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">Your profile is incomplete. Complete your profile to get 3x more recruiter views and personalized course recommendations.</p>
            </div>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="whitespace-nowrap px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Complete Profile Now
            </button>
          </div>
        </div>
      ) : null}

      <Hero />
      <JobListing />
      <AppDownload />
      <FloatingChatbot />
      <Footer />
      
    </div>
  )
}

export default Home