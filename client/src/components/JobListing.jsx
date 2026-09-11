import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets, JobCategories, JobLocations } from '../assets/assets'
import JobCard from './JobCard'
import { Code, Database, PenTool, Wifi, Briefcase, Megaphone, ShieldCheck, Layers, MapPin, Sparkles, ArrowRight } from 'lucide-react'

const JobListing = () => {

    const { 
        isSearched, searchFilter, setSearchFilter, 
        jobs, 
        selectedCategories, setSelectedCategories, 
        selectedLocations, setSelectedLocations,
        fetchNextPage, hasNextPage, isFetchingNextPage, jobsStatus
    } = useContext(AppContext)

    const [showFilter, setShowFilter] = useState(false)

    const handleCategoryChange = (category) => {
        setSelectedCategories(
            prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        )
    }

    const handleLocationChange = (location) => {
        setSelectedLocations(
            prev => prev.includes(location) ? prev.filter(c => c !== location) : [...prev, location]
        )
    }

    const clearAllFilters = () => {
        setSearchFilter({ title: '', location: '' })
        setSelectedCategories([])
        setSelectedLocations([])
        document.getElementById('job-list')?.scrollIntoView({ behavior: 'smooth' })
    }

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Programming': return <Code size={18} />;
            case 'Data Science': return <Database size={18} />;
            case 'Designing': return <PenTool size={18} />;
            case 'Networking': return <Wifi size={18} />;
            case 'Management': return <Briefcase size={18} />;
            case 'Marketing': return <Megaphone size={18} />;
            case 'Cybersecurity': return <ShieldCheck size={18} />;
            default: return <Layers size={18} />;
        }
    }

    return (
        <div className='px-6 lg:px-8 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8 gap-8'>

            {/* Sidebar Filters */}
            <div className='w-full lg:w-1/4'>
                <div className='bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm sticky top-24'>

                    {/* Current Search */}
                    {
                        isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <h3 className='font-bold text-gray-800 text-sm tracking-wide uppercase mb-4'>Current Search</h3>
                                <div className='flex flex-wrap gap-2'>
                                    {searchFilter.title && (
                                        <span className='inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium'>
                                            {searchFilter.title}
                                            <img onClick={e => setSearchFilter(prev => ({ ...prev, title: "" }))} className='cursor-pointer w-3 h-3' src={assets.cross_icon} alt="" style={{ filter: 'brightness(0) saturate(100%) invert(20%) sepia(98%) saturate(2335%) hue-rotate(212deg) brightness(98%) contrast(98%)' }} />
                                        </span>
                                    )}
                                    {searchFilter.location && (
                                        <span className='inline-flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium'>
                                            {searchFilter.location}
                                            <img onClick={e => setSearchFilter(prev => ({ ...prev, location: "" }))} className='cursor-pointer w-3 h-3' src={assets.cross_icon} alt="" style={{ filter: 'brightness(0) saturate(100%) invert(20%) sepia(98%) saturate(3335%) hue-rotate(350deg) brightness(98%) contrast(98%)' }} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    <button onClick={e => setShowFilter(prev => !prev)} className='w-full px-6 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-medium lg:hidden mb-4'>
                        {showFilter ? "Close Filters" : "Show Filters"}
                    </button>

                    {/* Category Filter */}
                    <div className={showFilter ? "" : "max-lg:hidden"}>
                        <h4 className='font-bold text-lg text-gray-800 flex items-center gap-2 mb-4'>
                            <Layers size={20} className="text-blue-600" />
                            Search by Categories
                        </h4>
                        <ul className='space-y-3'>
                            {JobCategories.map((category, index) => (
                                <li key={index}>
                                    <label className='flex gap-3 items-center cursor-pointer group'>
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className='peer sr-only'
                                                onChange={() => handleCategoryChange(category)}
                                                checked={selectedCategories.includes(category)}
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className={`flex items-center gap-2 flex-1 text-sm font-medium transition-colors ${selectedCategories.includes(category) ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            <span className={`${selectedCategories.includes(category) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`}>
                                                {getCategoryIcon(category)}
                                            </span>
                                            {category}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Location Filter */}
                    <div className={`mt-8 pt-8 border-t border-gray-100 ${showFilter ? "" : "max-lg:hidden"}`}>
                        <h4 className='font-bold text-lg text-gray-800 flex items-center gap-2 mb-4'>
                            <MapPin size={20} className="text-blue-600" />
                            Search by Location
                        </h4>
                        <ul className='space-y-3'>
                            {JobLocations.map((location, index) => (
                                <li key={index}>
                                    <label className='flex gap-3 items-center cursor-pointer group'>
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className='peer sr-only'
                                                onChange={() => handleLocationChange(location)}
                                                checked={selectedLocations.includes(location)}
                                            />
                                            <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className={`text-sm font-medium transition-colors ${selectedLocations.includes(location) ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {location}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Job listings */}
            <section className='w-full lg:w-3/4' id='job-list'>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h3 className='font-bold text-2xl lg:text-3xl text-gray-900 flex items-center gap-2'>
                            Latest jobs <Sparkles size={24} className="text-blue-500" />
                        </h3>
                        <p className='text-gray-500 mt-1 font-medium'>Get your desired job from top companies</p>
                    </div>
                    <button 
                        onClick={clearAllFilters}
                        className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-5 py-2.5 rounded-full font-semibold hover:bg-blue-100 transition-colors self-start sm:self-auto"
                    >
                        View All Jobs <ArrowRight size={18} />
                    </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                    {jobs.map((job, index) => (
                        <JobCard key={index} job={job} />
                    ))}
                </div>

                {/* Status and Load More */}
                {jobsStatus === 'pending' && jobs.length === 0 && (
                    <div className="flex justify-center mt-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
                
                {jobsStatus === 'success' && jobs.length === 0 && (
                    <div className="text-center mt-12 py-12 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500 font-medium">No jobs found matching your filters.</p>
                        <button onClick={clearAllFilters} className="mt-4 text-blue-600 font-bold hover:underline">Clear Filters</button>
                    </div>
                )}
                
                {jobsStatus === 'error' && (
                    <div className="text-center mt-12 py-12 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-red-500 font-medium">Failed to fetch jobs. The server might be unreachable or an error occurred.</p>
                        <button onClick={() => window.location.reload()} className="mt-4 text-red-600 font-bold hover:underline">Reload Page</button>
                    </div>
                )}

                {hasNextPage && (
                    <div className='flex items-center justify-center mt-12'>
                        <button 
                            onClick={() => fetchNextPage()} 
                            disabled={isFetchingNextPage}
                            className="inline-flex items-center gap-2 bg-white border-2 border-blue-100 text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isFetchingNextPage ? 'Loading...' : 'Load More Jobs'} 
                            {!isFetchingNextPage && <ArrowRight size={18} />}
                        </button>
                    </div>
                )}
            </section>

        </div>
    )
}

export default JobListing