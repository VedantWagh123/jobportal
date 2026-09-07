import { useContext, useRef } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { Rocket, Search, MapPin } from 'lucide-react'

const Hero = () => {

    const { setSearchFilter, setIsSearched } = useContext(AppContext)

    const titleRef = useRef(null)
    const locationRef = useRef(null)

    const onSearch = (e) => {
        e?.preventDefault();
        setSearchFilter({
            title: titleRef.current?.value || '',
            location: locationRef.current?.value || ''
        })
        setIsSearched(true)
    }

    const setPopularSearch = (title) => {
        setSearchFilter({ title, location: '' })
        setIsSearched(true)
    }

    return (
        <div className='px-6 lg:px-8 mx-auto my-6'>
            
            {/* Hero Main Card */}
            <div className='bg-gradient-to-br from-[#F5F8FF] to-[#E8F0FF] rounded-[2rem] p-6 md:p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-center border border-blue-50/50 shadow-sm'>
                
                {/* Left Content */}
                <div className="relative z-10 w-full md:w-[55%] lg:w-[50%] pt-4 md:pr-8">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-yellow-100/50 px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-200/50">
                        <span className="text-sm">🚀</span>
                        <span className="text-xs font-bold text-gray-800">Your Career Starts Here</span>
                    </div>

                    <h1 className='text-4xl md:text-5xl lg:text-[56px] xl:text-[64px] font-extrabold text-[#111827] mb-6 leading-[1.1] tracking-tight'>
                        Discover Your Next <br className="hidden lg:block"/>
                        <span className="text-[#2563EB] relative inline-block mt-2">
                            Big Opportunity
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#3B82F6]" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <path d="M2 9.5C45.5 -1.5 125 -1.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>
                    
                    <p className='text-base lg:text-[17px] text-gray-600 mb-10 max-w-lg leading-relaxed font-medium'>
                        Explore thousands of job listings from top companies and take the first step toward a fulfilling career.
                    </p>
                    
                    {/* Search Bar */}
                    <form onSubmit={onSearch} className='flex flex-col sm:flex-row items-center bg-white p-2.5 rounded-2xl sm:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-2xl gap-3 sm:gap-0 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'>
                        <div className='flex items-center flex-1 px-4 w-full'>
                            <Search size={18} className='text-blue-500 shrink-0' />
                            <input type="text"
                                placeholder='Search for jobs, skills, or roles'
                                className='bg-transparent text-gray-800 placeholder-gray-400 p-2 outline-none w-full ml-2 text-sm font-medium'
                                ref={titleRef}
                            />
                        </div>
                        <div className='w-px h-8 bg-gray-200 hidden sm:block'></div>
                        <div className='flex items-center flex-1 px-4 w-full border-t border-gray-100 sm:border-0 pt-3 sm:pt-0'>
                            <MapPin size={18} className='text-gray-400 shrink-0' />
                            <input type="text"
                                placeholder='City or Remote'
                                className='bg-transparent text-gray-800 placeholder-gray-400 p-2 outline-none w-full ml-2 text-sm font-medium'
                                ref={locationRef}
                            />
                        </div>
                        <button type="submit" className='w-full sm:w-auto bg-[#2563EB] text-white px-8 py-3 rounded-xl sm:rounded-full font-bold shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm'>
                            Search &rarr;
                        </button>
                    </form>

                    {/* Popular Searches */}
                    <div className="mt-8 flex items-center flex-wrap gap-3 text-sm">
                        <span className="font-bold text-gray-800 text-xs tracking-wide">Popular:</span>
                        {['Software Engineer', 'Data Science', 'Web Development', 'Cloud', 'UI/UX', 'DevOps'].map((term) => (
                            <button 
                                key={term}
                                type="button"
                                onClick={() => setPopularSearch(term)}
                                className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-semibold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Image Container */}
                <div className="hidden md:flex relative z-10 w-[45%] lg:w-[50%] h-[420px] items-end justify-center mt-10 md:mt-0">
                    
                    {/* Background Yellow Circle */}
                    <div className="absolute top-[45%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-[#FFF2B2]/60 rounded-full -z-10"></div>

                    {/* Decorative dashes */}
                    <div className="absolute top-20 right-10 flex flex-col gap-2 rotate-12 opacity-80">
                        <div className="w-8 h-2 bg-blue-500 rounded-full rotate-45"></div>
                        <div className="w-6 h-2 bg-yellow-400 rounded-full -rotate-12 ml-4"></div>
                    </div>

                    {/* Handwritten text */}
                    <div className="absolute top-10 left-16 -rotate-6 hidden xl:block">
                        <span className="font-serif italic text-blue-600 text-xl">Better Skills</span><br/>
                        <span className="font-serif italic text-gray-600 text-xl">Brighter Future</span>
                    </div>

                    <div className="absolute bottom-24 left-10 -rotate-12 hidden xl:block">
                        <span className="font-serif italic text-gray-600 text-[17px] leading-tight block">Opportunities<br/>Are Waiting</span>
                        {/* Curved Arrow SVG */}
                        <svg className="w-10 h-10 text-gray-400 absolute -top-12 left-10 rotate-[140deg]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M10 9l-6 6 6 6"/><path d="M4 15h9a5 5 0 0 0 5-5V4"/></svg>
                    </div>

                    {/* Statistic Cards Container */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
                        
                        {/* Card 1 */}
                        <div className="bg-white/95 backdrop-blur p-3.5 pr-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white flex items-center gap-3 hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div>
                            <div>
                                <p className="font-extrabold text-gray-900 text-[15px] leading-tight">10K+</p>
                                <p className="text-[11px] text-gray-500 font-medium">Job Opportunities</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white/95 backdrop-blur p-3.5 pr-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white flex items-center gap-3 hover:-translate-y-1 transition-transform ml-6">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            </div>
                            <div>
                                <p className="font-extrabold text-gray-900 text-[15px] leading-tight">500+</p>
                                <p className="text-[11px] text-gray-500 font-medium">Top Companies</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white/95 backdrop-blur p-3.5 pr-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white flex items-center gap-3 hover:-translate-y-1 transition-transform">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <div>
                                <p className="font-extrabold text-gray-900 text-[15px] leading-tight">100K+</p>
                                <p className="text-[11px] text-gray-500 font-medium">Successful Placements</p>
                            </div>
                        </div>
                    </div>

                    {/* The main character image */}
                    <img src={assets.app_main_img} alt="Career Professional" className="max-w-[340px] w-full h-[450px] object-cover object-top z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] absolute bottom-0 right-10" />

                    {/* Bottom Right Card */}
                    <div className="absolute bottom-12 -right-2 bg-white p-3 pr-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white flex items-center gap-3 z-30 hover:-translate-y-1 transition-transform">
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-500 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                        </div>
                        <div>
                            <p className="font-extrabold text-gray-900 text-[14px] leading-tight">Build</p>
                            <p className="text-[10px] text-gray-500 font-medium">A Better You</p>
                        </div>
                        <div className="w-6 h-6 bg-yellow-50 rounded-full flex items-center justify-center ml-2 text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </div>
                    </div>

                </div>
            </div>

            {/* Trusted Companies */}
            <div className='bg-white shadow-sm border border-gray-100 mt-8 p-6 rounded-2xl flex flex-col lg:flex-row items-center gap-8 overflow-hidden relative'>
                <div className='z-10 bg-white pr-6 shrink-0 flex items-center justify-center lg:justify-start shadow-[15px_0_15px_-10px_rgba(255,255,255,1)]'>
                    <p className='font-bold text-gray-400 text-xs tracking-widest uppercase'>Trusted by Industry Leaders</p>
                </div>
                
                <div className='flex-1 overflow-hidden relative group [mask-image:_linear-gradient(to_right,transparent_0,_black_60px,_black_calc(100%-60px),transparent_100%)]'>
                    <div className='animate-marquee flex opacity-90 transition-all duration-500 hover:[animation-play-state:paused]'>
                        
                        {/* First Set */}
                        <div className='flex items-center justify-center gap-12 md:gap-20 pr-12 md:pr-20 shrink-0'>
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.microsoft_logo} alt="Microsoft" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.walmart_logo} alt="Walmart" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.accenture_logo} alt="Accenture" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.samsung_logo} alt="Samsung" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.amazon_logo} alt="Amazon" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.adobe_logo} alt="Adobe" />
                            {/* 3 New Company Logos */}
                            <span className="font-extrabold text-2xl tracking-tighter text-gray-800 font-sans cursor-pointer hover:scale-110 transition-transform">Google</span>
                            <span className="font-black text-2xl tracking-tighter text-[#E50914] font-sans uppercase cursor-pointer hover:scale-110 transition-transform">Netflix</span>
                            <span className="font-bold text-2xl tracking-tighter text-[#0061FF] font-sans cursor-pointer hover:scale-110 transition-transform">Meta</span>
                        </div>

                        {/* Duplicate Set for Seamless Scrolling */}
                        <div className='flex items-center justify-center gap-12 md:gap-20 pr-12 md:pr-20 shrink-0'>
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.microsoft_logo} alt="Microsoft" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.walmart_logo} alt="Walmart" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.accenture_logo} alt="Accenture" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.samsung_logo} alt="Samsung" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.amazon_logo} alt="Amazon" />
                            <img className='h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.adobe_logo} alt="Adobe" />
                            {/* 3 New Company Logos */}
                            <span className="font-extrabold text-2xl tracking-tighter text-gray-800 font-sans cursor-pointer hover:scale-110 transition-transform">Google</span>
                            <span className="font-black text-2xl tracking-tighter text-[#E50914] font-sans uppercase cursor-pointer hover:scale-110 transition-transform">Netflix</span>
                            <span className="font-bold text-2xl tracking-tighter text-[#0061FF] font-sans cursor-pointer hover:scale-110 transition-transform">Meta</span>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default Hero