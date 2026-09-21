import { useContext, useRef, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { Rocket, Search, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

const Hero = () => {

    const { setSearchFilter, setIsSearched } = useContext(AppContext)

    const titleRef = useRef(null)
    const locationRef = useRef(null)
    
    // Typing animation state
    const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
    const [isInteracting, setIsInteracting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [hasText, setHasText] = useState(false);

    const searchExamples = [
        "Software Developer", 
        "Full Stack Developer", 
        "AI Engineer", 
        "Data Analyst", 
        "Frontend Developer", 
        "Cloud Engineer", 
        "Cybersecurity Engineer"
    ];

    useEffect(() => {
        if (isInteracting) return;
        
        let i = 0; // example index
        let j = 0; // character index
        let isDeleting = false;
        let timeoutId;
        
        const type = () => {
            if (isInteracting) return;
            
            const currentExample = searchExamples[i];
            
            if (isDeleting) {
                setAnimatedPlaceholder(currentExample.substring(0, j - 1));
                j--;
                if (j === 0) {
                    isDeleting = false;
                    i = (i + 1) % searchExamples.length;
                    timeoutId = setTimeout(type, 500);
                } else {
                    timeoutId = setTimeout(type, 40);
                }
            } else {
                setAnimatedPlaceholder(currentExample.substring(0, j + 1));
                j++;
                if (j === currentExample.length) {
                    isDeleting = true;
                    timeoutId = setTimeout(type, 1800);
                } else {
                    timeoutId = setTimeout(type, 80);
                }
            }
        };
        
        timeoutId = setTimeout(type, 800);
        
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 530);
        
        return () => {
            clearTimeout(timeoutId);
            clearInterval(cursorInterval);
        };
    }, [isInteracting]);

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
        <div className='px-1 sm:px-6 lg:px-8 mx-auto my-4 md:my-10 w-full overflow-hidden'>
            
            {/* Hero Main Card */}
            <div className='bg-gradient-to-br from-[#F5F8FF] to-[#E8F0FF] rounded-xl md:rounded-[2rem] px-2 py-4 sm:px-4 sm:py-8 md:px-10 md:py-16 lg:px-12 lg:py-20 relative overflow-hidden flex flex-row items-center border border-blue-50/50 shadow-sm'>
                
                {/* Left Content */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 w-[55%] lg:w-[50%] pt-1 md:pt-4 pr-2 md:pr-8"
                >
                    
                    {/* Top Row: Mascot & Badge */}
                    <div className="flex items-end gap-2 mb-2 md:mb-6">
                        {/* Cartoon Mascot Image */}
                        <div className="relative z-30 scale-[0.8] md:scale-100 origin-bottom-left group cursor-pointer md:mr-4 ml-2">
                            <style>{`
                                .mascot-float { animation: floatMascot 4s ease-in-out infinite alternate; }
                                .mascot-hi-bubble { opacity: 0; transform: translateY(10px) scale(0.8); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: bottom left; }
                                .group:hover .mascot-hi-bubble { opacity: 1; transform: translateY(0) scale(1); animation: bounceHi 1s infinite alternate; }
                                .group:hover .mascot-img { transform: scale(1.05) rotate(2deg); }
                                
                                @keyframes floatMascot {
                                    0% { transform: translateY(0px) rotate(0deg); }
                                    100% { transform: translateY(-6px) rotate(-1deg); }
                                }
                                @keyframes bounceHi {
                                    0% { transform: translateY(0); }
                                    100% { transform: translateY(-4px); }
                                }
                            `}</style>
                            
                            {/* "Hi!" Speech Bubble */}
                            <div className="absolute -top-6 -right-10 md:-top-8 md:-right-12 bg-white text-blue-600 font-black text-sm px-3.5 py-1.5 rounded-2xl rounded-bl-none shadow-[0_10px_25px_rgba(37,99,235,0.2)] border-2 border-blue-100 mascot-hi-bubble flex items-center gap-1 z-40">
                                Hi! 👋
                            </div>

                            {/* Mascot Image Container */}
                            <div className="relative w-[70px] h-[70px] md:w-[90px] md:h-[90px] mascot-float rounded-full bg-blue-50/50 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                <img src={assets.cartoon_mascot} alt="Cartoon Mascot" className="w-full h-full object-cover mascot-img transition-transform duration-300" />
                            </div>
                        </div>

                        {/* Badge */}
                        <div className="inline-flex items-center gap-1 md:gap-2 bg-yellow-100/50 px-2 md:px-4 py-1 md:py-1.5 rounded-full mb-1 shadow-sm border border-yellow-200/50">
                            <span className="text-[8px] md:text-sm">🚀</span>
                            <span className="text-[7px] sm:text-[9px] md:text-xs font-bold text-gray-800">Your Career Starts Here</span>
                        </div>
                    </div>

                    <h1 className='text-lg sm:text-xl md:text-5xl lg:text-[56px] xl:text-[64px] font-extrabold text-[#111827] mb-2 md:mb-6 leading-[1.1] tracking-tight'>
                        Discover Your Next <br className="hidden lg:block"/>
                        <span className="text-[#2563EB] relative inline-block mt-0.5 md:mt-2">
                            Big Opportunity
                            <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-1 md:h-3 text-[#3B82F6]" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <path d="M2 9.5C45.5 -1.5 125 -1.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>
                    
                    <p className='text-[8px] sm:text-[10px] md:text-base lg:text-[17px] text-gray-600 mb-4 md:mb-10 max-w-lg leading-relaxed font-medium'>
                        Explore thousands of job listings from top companies and take the first step toward a fulfilling career.
                    </p>
                    
                    {/* Search Bar */}
                    <form onSubmit={onSearch} className='flex flex-row items-center bg-white p-0.5 md:p-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-2xl gap-0 md:gap-0 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'>
                        <div className='flex items-center flex-1 px-1 md:px-4 w-full'>
                            <Search className='text-blue-500 shrink-0 w-2.5 h-2.5 md:w-[18px] md:h-[18px]' />
                            <div className="relative w-full ml-1 md:ml-2 flex items-center overflow-hidden">
                                {/* Animated Visual Layer */}
                                {!isInteracting && !hasText && (
                                    <div className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-gray-800 text-[6px] sm:text-[8px] md:text-sm font-medium z-0 whitespace-nowrap">
                                        {animatedPlaceholder}
                                        <span className={`inline-block w-[1px] md:w-[1.5px] h-[8px] md:h-[18px] bg-blue-600 ml-[1px] transition-opacity duration-75 ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                                    </div>
                                )}
                                <input type="text"
                                    placeholder={isInteracting ? 'Search jobs...' : ''}
                                    className='bg-transparent text-gray-800 placeholder-gray-400 p-0 md:p-2 outline-none w-full text-[6px] sm:text-[8px] md:text-sm font-medium relative z-10 h-4 md:h-auto'
                                    ref={titleRef}
                                    onFocus={() => setIsInteracting(true)}
                                    onBlur={(e) => {
                                        if (!e.target.value) setIsInteracting(false);
                                    }}
                                    onChange={(e) => {
                                        setHasText(!!e.target.value);
                                        if (e.target.value) setIsInteracting(true);
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-px h-3 md:h-8 bg-gray-200 block'></div>
                        <div className='flex items-center flex-1 px-1 md:px-4 w-full border-0 pt-0'>
                            <MapPin className='text-gray-400 shrink-0 w-2.5 h-2.5 md:w-[18px] md:h-[18px]' />
                            <input type="text"
                                placeholder='City or Remote'
                                className='bg-transparent text-gray-800 placeholder-gray-400 p-0 md:p-2 outline-none w-full ml-0.5 md:ml-2 text-[6px] sm:text-[8px] md:text-sm font-medium h-4 md:h-auto'
                                ref={locationRef}
                            />
                        </div>
                        <button type="submit" className='w-auto bg-[#2563EB] text-white px-1.5 py-0.5 sm:px-3 sm:py-1 md:px-8 md:py-3 rounded-full font-bold shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-0.5 md:gap-2 text-[6px] sm:text-[8px] md:text-sm shrink-0'>
                            Search <span className="hidden md:inline">&rarr;</span>
                        </button>
                    </form>

                    {/* Popular Searches */}
                    <div className="mt-2 md:mt-8 flex items-center flex-wrap gap-0.5 md:gap-3 text-sm">
                        <span className="font-bold text-gray-800 text-[5px] sm:text-[6px] md:text-xs tracking-wide">Popular:</span>
                        {['Software Engineer', 'Data Science', 'Web Development', 'Cloud'].map((term) => (
                            <button 
                                key={term}
                                type="button"
                                onClick={() => setPopularSearch(term)}
                                className="bg-white border border-gray-200 text-gray-600 px-1 md:px-4 py-0 md:py-1.5 rounded-full text-[5px] sm:text-[6px] md:text-xs font-semibold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Right Image Container */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="flex relative z-10 w-[45%] lg:w-[50%] h-[140px] sm:h-[180px] md:h-[500px] xl:h-[550px] items-end justify-center mt-0 overflow-visible"
                >
                    
                    {/* Background Yellow Circle */}
                    <div className="absolute top-[50%] right-[10%] -translate-y-1/2 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[380px] md:h-[380px] xl:w-[420px] xl:h-[420px] bg-gradient-to-tr from-[#FFF2B2] to-[#FFE24B] rounded-full -z-10 opacity-60"></div>

                    {/* Decorative dashes */}
                    <div className="absolute top-2 md:top-12 right-1 md:right-12 flex flex-col gap-1 md:gap-2 rotate-12 opacity-80 animate-float-delayed scale-[0.35] md:scale-100">
                        <div className="w-8 h-2.5 bg-blue-500 rounded-full rotate-45 shadow-sm"></div>
                        <div className="w-6 h-2.5 bg-yellow-400 rounded-full -rotate-12 ml-4 shadow-sm"></div>
                    </div>



                    {/* Handwritten text */}
                    <div className="absolute -top-2 md:top-2 left-0 md:left-[5%] -rotate-6 block animate-float scale-[0.3] md:scale-100 origin-top-left">
                        <span className="font-serif italic text-blue-600 text-[22px] tracking-wide drop-shadow-sm whitespace-nowrap">Better Skills</span><br/>
                        <span className="font-serif italic text-gray-700 text-[22px] tracking-wide drop-shadow-sm ml-4 whitespace-nowrap">Brighter Future</span>
                    </div>

                    <div className="absolute bottom-12 md:bottom-32 left-0 md:-left-4 -rotate-[15deg] hidden md:block opacity-70">
                        <svg className="w-12 h-12 text-blue-400/60 rotate-[100deg]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M10 9l-6 6 6 6"/><path d="M4 15h9a5 5 0 0 0 5-5V4"/></svg>
                    </div>

                    {/* Statistic Cards Container */}
                    <div className="absolute left-[-20px] md:left-0 top-[48%] md:top-[52%] -translate-y-1/2 flex flex-col gap-0 md:gap-4 z-20 scale-[0.25] sm:scale-[0.35] md:scale-100 origin-left">
                        
                        {/* Card 1 */}
                        <div className="bg-white/90 backdrop-blur-md p-3.5 pr-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 flex items-center gap-4 hover:-translate-y-1.5 transition-transform duration-300 animate-float">
                            <div className="w-11 h-11 bg-blue-50/80 rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div>
                            <div>
                                <p className="font-extrabold text-gray-900 text-[16px] leading-tight">10K+</p>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Job Opportunities</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white/90 backdrop-blur-md p-3.5 pr-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 flex items-center gap-4 hover:-translate-y-1.5 transition-transform duration-300 ml-8 animate-float-delayed">
                            <div className="w-11 h-11 bg-emerald-50/80 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            </div>
                            <div>
                                <p className="font-extrabold text-gray-900 text-[16px] leading-tight">500+</p>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Top Companies</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white/90 backdrop-blur-md p-3.5 pr-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 flex items-center gap-4 hover:-translate-y-1.5 transition-transform duration-300 animate-float">
                            <div className="w-11 h-11 bg-purple-50/80 rounded-xl flex items-center justify-center text-purple-600 shrink-0 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <div>
                                <p className="font-extrabold text-gray-900 text-[16px] leading-tight">100K+</p>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Successful Placements</p>
                            </div>
                        </div>
                    </div>

                    {/* The main character image */}
                    <img src={assets.app_main_img} alt="Career Professional" className="max-w-[110px] sm:max-w-[150px] md:max-w-[380px] xl:max-w-[420px] w-full h-[140px] sm:h-[180px] md:h-[530px] xl:h-[580px] object-cover object-top z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.2)] absolute bottom-0 right-0 md:right-6" />

                    {/* Bottom Right Card */}
                    <div className="absolute bottom-2 md:bottom-10 right-[-10px] md:-right-6 bg-white/95 backdrop-blur-sm p-1.5 md:p-3.5 pr-2.5 md:pr-6 rounded-lg md:rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.08)] md:shadow-[0_12px_30px_rgb(0,0,0,0.12)] border border-white flex items-center gap-1.5 md:gap-3 z-30 hover:-translate-y-1 md:hover:-translate-y-1.5 transition-transform duration-300 animate-float-delayed">
                        <div className="w-5 h-5 md:w-11 md:h-11 bg-yellow-50 rounded-md md:rounded-xl flex items-center justify-center text-yellow-500 shrink-0 shadow-inner">
                            <svg className="w-3 h-3 md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                        </div>
                        <div>
                            <p className="font-extrabold text-gray-900 text-[7px] md:text-[15px] leading-tight">Build</p>
                            <p className="text-[5px] md:text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0 md:mt-0.5">A Better You</p>
                        </div>
                        <div className="w-3 h-3 md:w-6 md:h-6 bg-yellow-100 rounded-full flex items-center justify-center ml-0.5 md:ml-2 text-yellow-600 shadow-sm">
                            <svg className="w-1.5 h-1.5 md:w-3 md:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </div>
                    </div>

                </motion.div>
            </div>

            {/* Trusted Companies */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                className='bg-white shadow-sm border border-gray-100 mt-4 md:mt-8 p-3 md:p-6 rounded-lg md:rounded-2xl flex flex-col lg:flex-row items-center gap-4 md:gap-8 overflow-hidden relative mx-2 md:mx-0'
            >
                <div className='z-10 bg-white pr-2 md:pr-6 shrink-0 flex items-center justify-center lg:justify-start shadow-[15px_0_15px_-10px_rgba(255,255,255,1)]'>
                    <p className='font-bold text-gray-400 text-[8px] md:text-xs tracking-widest uppercase'>Trusted by Industry Leaders</p>
                </div>
                
                <div className='flex-1 overflow-hidden relative group [mask-image:_linear-gradient(to_right,transparent_0,_black_60px,_black_calc(100%-60px),transparent_100%)]'>
                    <div className='animate-marquee flex opacity-90 transition-all duration-500 hover:[animation-play-state:paused]'>
                        
                        {/* First Set */}
                        <div className='flex items-center justify-center gap-6 md:gap-20 pr-6 md:pr-20 shrink-0'>
                            <img className='h-4 md:h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.microsoft_logo} alt="Microsoft" />
                            <img className='h-4 md:h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.walmart_logo} alt="Walmart" />
                            <img className='h-4 md:h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.accenture_logo} alt="Accenture" />
                            <img className='h-4 md:h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.samsung_logo} alt="Samsung" />
                            <img className='h-4 md:h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.amazon_logo} alt="Amazon" />
                            <img className='h-4 md:h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.adobe_logo} alt="Adobe" />
                            {/* 3 New Company Logos */}
                            <span className="font-extrabold text-base md:text-2xl tracking-tighter text-gray-800 font-sans cursor-pointer hover:scale-110 transition-transform">Google</span>
                            <span className="font-black text-base md:text-2xl tracking-tighter text-[#E50914] font-sans uppercase cursor-pointer hover:scale-110 transition-transform">Netflix</span>
                            <span className="font-bold text-base md:text-2xl tracking-tighter text-[#0061FF] font-sans cursor-pointer hover:scale-110 transition-transform">Meta</span>
                        </div>

                        {/* Duplicate Set for Seamless Scrolling */}
                        <div className='flex items-center justify-center gap-6 md:gap-20 pr-6 md:pr-20 shrink-0'>
                            <img className='h-4 md:h-7 object-contain hover:scale-110 transition-transform cursor-pointer' src={assets.microsoft_logo} alt="Microsoft" />
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
            </motion.div>

        </div>
    )
}

export default Hero