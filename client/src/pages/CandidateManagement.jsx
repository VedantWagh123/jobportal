import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { Search, MapPin, Mail, Phone, GraduationCap } from 'lucide-react'

const CandidateManagement = () => {
    const { backendUrl, companyToken } = useContext(AppContext)
    const [candidates, setCandidates] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [skillFilter, setSkillFilter] = useState('')

    useEffect(() => {
        if (companyToken) {
            fetchCandidates()
        }
    }, [companyToken])

    const fetchCandidates = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/company/applicants',
                { headers: { token: companyToken } }
            )
            if (data.success) {
                // Extract unique candidates
                const uniqueUsers = new Map()
                data.applications.forEach(app => {
                    if (app.userId && !uniqueUsers.has(app.userId._id)) {
                        uniqueUsers.set(app.userId._id, {
                            ...app.userId,
                            appliedJobs: [app.jobId],
                            status: app.status
                        })
                    } else if (app.userId) {
                        const existing = uniqueUsers.get(app.userId._id)
                        existing.appliedJobs.push(app.jobId)
                    }
                })
                setCandidates(Array.from(uniqueUsers.values()))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    if (candidates === false) return <Loading />

    const filteredCandidates = candidates.filter(cand => {
        const name = cand.name || '';
        const email = cand.email || '';
        const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchSkill = skillFilter === '' ? true : (cand.skills && Array.isArray(cand.skills) && cand.skills.some(s => typeof s === 'string' && s.toLowerCase().includes(skillFilter.toLowerCase())))
        return matchSearch && matchSkill
    })

    return (
        <div className='container mx-auto p-4 max-w-7xl pb-10'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>Candidate Pool</h2>
                    <p className='text-sm text-gray-500 mt-1'>Search and filter candidates who applied to your jobs.</p>
                </div>
            </div>

            <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Search size={18} className='text-gray-400' />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search candidates by name or email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm'
                    />
                </div>
                <div className='w-full sm:w-64'>
                    <input 
                        type="text" 
                        placeholder="Filter by Skill (e.g. React)" 
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        className='block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm'
                    />
                </div>
            </div>

            {filteredCandidates.length === 0 ? (
                <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center'>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>No Candidates Found</h3>
                    <p className='text-gray-500 max-w-md mx-auto'>Try adjusting your search or skill filter.</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredCandidates.map((cand, idx) => (
                        <div key={idx} className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col'>
                            <div className='flex items-start gap-4 mb-4'>
                                <img src={cand.image} alt={cand.name} className='w-14 h-14 rounded-full object-cover border-2 border-gray-50' />
                                <div>
                                    <h3 className='font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors'>{cand.name}</h3>
                                    <p className='text-xs text-gray-500 flex items-center gap-1 mt-1'><Mail size={12}/> {cand.email}</p>
                                </div>
                            </div>
                            
                            <div className='space-y-2 mb-4 flex-1'>
                                {cand.phone && <p className='text-sm text-gray-600 flex items-center gap-2'><Phone size={14} className='text-gray-400'/> {cand.phone}</p>}
                                {cand.city && <p className='text-sm text-gray-600 flex items-center gap-2'><MapPin size={14} className='text-gray-400'/> {cand.city}</p>}
                                {cand.college && <p className='text-sm text-gray-600 flex items-center gap-2'><GraduationCap size={14} className='text-gray-400'/> {cand.college}</p>}
                            </div>

                            <div className='mb-5'>
                                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Top Skills</p>
                                <div className='flex flex-wrap gap-1.5'>
                                    {cand.skills && cand.skills.length > 0 ? (
                                        cand.skills.slice(0, 4).map((skill, i) => (
                                            <span key={i} className='bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-100'>{skill}</span>
                                        ))
                                    ) : (
                                        <span className='text-xs text-gray-400 italic'>No skills listed</span>
                                    )}
                                    {cand.skills && cand.skills.length > 4 && (
                                        <span className='bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md font-medium'>+{cand.skills.length - 4} more</span>
                                    )}
                                </div>
                            </div>

                            <div className='mt-auto pt-4 border-t border-gray-100 flex justify-between items-center'>
                                <span className='text-xs text-gray-500 font-medium'>Applied to {cand.appliedJobs.length} job(s)</span>
                                {cand.resume && (
                                    <a href={cand.resume ? cand.resume : '#'} target='_blank' rel='noopener noreferrer' className='text-sm font-bold text-blue-600 hover:text-blue-700'>
                                        View Resume
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CandidateManagement
