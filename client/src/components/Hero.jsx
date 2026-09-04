import { useContext, useRef } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Hero = () => {

    const { setSearchFilter, setIsSearched } = useContext(AppContext)

    const titleRef = useRef(null)
    const locationRef = useRef(null)

    const onSearch = () => {
        setSearchFilter({
            title: titleRef.current.value,
            location: locationRef.current.value
        })
        setIsSearched(true)
    }

    return (
        <div className='px-4 lg:px-8 mx-auto my-8'>
            <div className='bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white py-20 text-center rounded-2xl shadow-lg relative overflow-hidden'>
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-blue-300 blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight'>Discover Your Next Big Opportunity</h2>
                    <p className='mb-10 max-w-2xl mx-auto text-base text-blue-100 font-light px-5'>Explore thousands of job listings from top companies and take the first step toward a fulfilling career.</p>
                    
                    <div className='flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full max-w-2xl mx-4 sm:mx-auto shadow-xl transition-all hover:bg-white/20'>
                        <div className='flex items-center flex-1 px-4'>
                            <img className='h-5 opacity-70' src={assets.search_icon} alt="Search" style={{ filter: 'brightness(0) invert(1)' }} />
                            <input type="text"
                                placeholder='Search for jobs, skills, or roles'
                                className='bg-transparent text-white placeholder-blue-100 max-sm:text-sm p-2 outline-none w-full ml-2'
                                ref={titleRef}
                            />
                        </div>
                        <div className='w-px h-8 bg-white/20 hidden sm:block'></div>
                        <div className='flex items-center flex-1 px-4 hidden sm:flex'>
                            <img className='h-5 opacity-70' src={assets.location_icon} alt="Location" style={{ filter: 'brightness(0) invert(1)' }} />
                            <input type="text"
                                placeholder='City or Remote'
                                className='bg-transparent text-white placeholder-blue-100 p-2 outline-none w-full ml-2'
                                ref={locationRef}
                            />
                        </div>
                        <button onClick={onSearch} className='bg-white text-blue-700 px-8 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-50 transition'>Search</button>
                    </div>
                </div>
            </div>

            <div className='border border-gray-100 bg-white shadow-sm mt-8 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-8'>
                <p className='font-semibold text-gray-400 text-sm tracking-wider uppercase'>Trusted by Industry Leaders</p>
                <div className='flex justify-center gap-8 flex-wrap'>
                    <img className='h-6 object-contain' src={assets.microsoft_logo} alt="Microsoft" />
                    <img className='h-6 object-contain' src={assets.walmart_logo} alt="Walmart" />
                    <img className='h-6 object-contain' src={assets.accenture_logo} alt="Accenture" />
                    <img className='h-6 object-contain' src={assets.samsung_logo} alt="Samsung" />
                    <img className='h-6 object-contain' src={assets.amazon_logo} alt="Amazon" />
                    <img className='h-6 object-contain' src={assets.adobe_logo} alt="Adobe" />
                </div>
            </div>

        </div>
    )
}

export default Hero