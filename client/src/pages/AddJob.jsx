import { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddJob = () => {

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('Pune');
    const [category, setCategory] = useState('Programming');
    const [level, setLevel] = useState('Beginner level');
    const [jobType, setJobType] = useState('Full Time');
    const [salary, setSalary] = useState(0);
    const [vacancies, setVacancies] = useState(1);
    const [skillsString, setSkillsString] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const editorRef = useRef(null)
    const quillRef = useRef(null)
    const navigate = useNavigate()

    const { backendUrl, companyToken } = useContext(AppContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {

            const description = quillRef.current.root.innerHTML
            const skills = skillsString.split(',').map(s => s.trim()).filter(s => s);

            const { data } = await axios.post(backendUrl + '/api/company/post-job',
                { title, description, location, salary, category, level, jobType, vacancies, skills },
                { headers: { token: companyToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setTitle('')
                setSalary(0)
                setVacancies(1)
                setSkillsString('')
                quillRef.current.root.innerHTML = ""
                navigate('/dashboard/manage-jobs')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }

    }

    const handleExtractSkills = async () => {
        const descriptionHTML = quillRef.current?.root?.innerHTML;
        if (!descriptionHTML || descriptionHTML === '<p><br></p>') {
            return toast.warning("Please enter a job description first.");
        }
        setIsExtracting(true);
        try {
            const { data } = await axios.post(backendUrl + '/api/company/extract-skills', 
                { description: descriptionHTML },
                { headers: { token: companyToken } }
            );
            if (data.success && data.skills) {
                const existing = skillsString ? skillsString.split(',').map(s=>s.trim()).filter(s=>s) : [];
                const merged = [...new Set([...existing, ...data.skills])];
                setSkillsString(merged.join(', '));
                toast.success("Skills extracted!");
            }
        } catch (error) {
            toast.error("Failed to extract skills via AI.");
        } finally {
            setIsExtracting(false);
        }
    };


    useEffect(() => {
        // Initiate Qill only once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
            })
        }
    }, [])

    return (
        <form onSubmit={onSubmitHandler} className='container mx-auto p-4 flex flex-col w-full items-start gap-6 max-w-4xl pb-10'>

            <div className="w-full mb-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Job</h2>
                <p className="text-sm text-gray-500 mt-1">Create a new job posting to find the best candidates.</p>
            </div>

            {/* Job Basics Card */}
            <div className="w-full bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-5 border-b border-gray-100 pb-3">Job Basics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className='col-span-1 md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Job Title</label>
                        <input type="text" placeholder='e.g. Senior Frontend Developer'
                            onChange={e => setTitle(e.target.value)} value={title}
                            required
                            className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Job Category</label>
                        <select className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white' onChange={e => setCategory(e.target.value)} value={category}>
                            {JobCategories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Job Location</label>
                        <select className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white' onChange={e => setLocation(e.target.value)} value={location}>
                            {JobLocations.map((location, index) => (
                                <option key={index} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Job Level</label>
                        <select className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white' onChange={e => setLevel(e.target.value)} value={level}>
                            <option value="Beginner level">Beginner level</option>
                            <option value="Intermediate level">Intermediate level</option>
                            <option value="Senior level">Senior level</option>
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Job Type</label>
                        <select className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white' onChange={e => setJobType(e.target.value)} value={jobType}>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Job Description Card */}
            <div className="w-full bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-2xl p-6">
                <div className='flex justify-between items-center mb-5 border-b border-gray-100 pb-3'>
                    <h3 className="text-lg font-semibold text-gray-800">Job Description</h3>
                    <button type="button" onClick={handleExtractSkills} disabled={isExtracting} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 shadow-sm">
                        {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-yellow-500" />}
                        {isExtracting ? 'Extracting Skills...' : 'AI Auto-Extract Skills'}
                    </button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[200px]">
                    <div ref={editorRef}></div>
                </div>
            </div>

            {/* Skills & Compensation Card */}
            <div className="w-full bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-5 border-b border-gray-100 pb-3">Requirements & Compensation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className='col-span-1 md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Required Skills (comma separated)</label>
                        <input type="text" placeholder='e.g. React, Node.js, AWS'
                            onChange={e => setSkillsString(e.target.value)} value={skillsString}
                            required
                            className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>Job Salary (₹)</label>
                        <input min={0} className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all' onChange={e => setSalary(e.target.value)} value={salary} type="Number" placeholder='25000' />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>No. of Vacancies</label>
                        <input min={1} className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all' onChange={e => setVacancies(e.target.value)} value={vacancies} type="Number" placeholder='1' />
                    </div>
                </div>
            </div>

            <div className="w-full flex justify-end mt-4">
                <button type="submit" disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2'>
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isSubmitting ? 'Posting...' : 'Post Job'}
                </button>
            </div>
        </form>
    )
}

export default AddJob