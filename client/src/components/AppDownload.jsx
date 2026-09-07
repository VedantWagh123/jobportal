import { assets } from '../assets/assets'
import { CheckCircle2, Star, Search } from 'lucide-react'

const AppDownload = () => {
    return (
        <div className='px-6 lg:px-8 mx-auto my-20'>
            <div className='relative bg-gradient-to-br from-blue-50 via-[#EBF4FF] to-[#F8FAFC] p-10 sm:p-16 lg:p-20 rounded-[2.5rem] shadow-sm border border-blue-100/50 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12'>
                
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl"></div>
                </div>

                <div className='relative z-10 lg:w-1/2'>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-blue-200/50 px-4 py-1.5 rounded-full mb-6 shadow-sm">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-700 tracking-wide">4.9/5 Rating on App Store</span>
                    </div>

                    <h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 text-[#1E293B] leading-[1.15] tracking-tight'>
                        Your Dream Job, <br className="hidden sm:block"/> <span className="text-blue-600">Now In Your Pocket.</span>
                    </h1>
                    
                    <p className="text-gray-600 mb-10 text-base sm:text-lg font-medium max-w-md leading-relaxed">
                        Download our mobile app to discover opportunities, track applications, and chat with employers on the go.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                        <a href="#" className='inline-block transform hover:scale-105 transition-all hover:shadow-lg rounded-xl hover:-translate-y-1 bg-white p-1.5 border border-gray-100'>
                            <img className='h-10 sm:h-12 object-contain' src={assets.play_store} alt="Get it on Google Play" />
                        </a>
                        <a href="#" className='inline-block transform hover:scale-105 transition-all hover:shadow-lg rounded-xl hover:-translate-y-1 bg-white p-1.5 border border-gray-100'>
                            <img className='h-10 sm:h-12 object-contain' src={assets.app_store} alt="Download on the App Store" />
                        </a>
                    </div>

                    <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-gray-600 text-sm font-bold">
                        <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-500" /> Fast Apply</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-500" /> Job Alerts</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-500" /> Chat Support</div>
                    </div>
                </div>

                {/* CSS Mobile Phone Mockup */}
                <div className='relative z-10 lg:w-1/2 flex justify-center lg:justify-end w-full mt-8 lg:mt-0'>
                    <div className="relative w-72 h-[480px] bg-white rounded-[3rem] shadow-2xl border-[10px] border-gray-200 overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-500 group">
                        
                        {/* iPhone Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 bg-gray-200 rounded-b-2xl w-32 mx-auto z-20 flex justify-center items-end pb-1">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>
                        
                        {/* App Screen Content */}
                        <div className="bg-[#F8FAFC] w-full h-full p-4 pt-12 flex flex-col gap-4 relative">
                            {/* App Header */}
                            <div className="flex items-center justify-between z-10 relative">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">J</div>
                                    <div className="font-bold text-gray-800 tracking-tight">JobPortal</div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="w-full h-full bg-blue-50 flex items-center justify-center"><UserIcon /></div>
                                </div>
                            </div>
                            
                            {/* Search Bar Skeleton */}
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 z-10 relative">
                                <Search size={16} className="text-blue-400" />
                                <div className="h-3 w-32 bg-gray-100 rounded-md"></div>
                            </div>

                            {/* Job Cards Skeletons */}
                            <div className="flex flex-col gap-3 z-10 relative overflow-y-auto pb-4 no-scrollbar">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50/50 border border-blue-50 shrink-0"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-3 w-28 bg-gray-700 rounded-md"></div>
                                                <div className="h-2 w-16 bg-gray-300 rounded-md"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-6 w-16 bg-blue-50 border border-blue-100 rounded-lg"></div>
                                            <div className="h-6 w-16 bg-green-50 border border-green-100 rounded-lg"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Navigation Bar Skeleton */}
                            <div className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-20">
                                <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
                                <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                                <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                                <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                            </div>
                        </div>

                        {/* Floating elements over the phone */}
                        <div className="absolute -right-4 top-32 bg-white py-2 px-3 rounded-xl shadow-lg border border-gray-100 animate-bounce z-30" style={{ animationDuration: '3s' }}>
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px]">
                                <CheckCircle2 size={14} className="fill-blue-100" /> Application Sent
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
)

export default AppDownload