import { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { Sparkles, Loader2, ChevronLeft, Lightbulb, CheckCircle2, Star, ArrowRight, X, Plus } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const AddJob = () => {

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('Pune');
    const [category, setCategory] = useState('Programming');
    const [level, setLevel] = useState('Beginner level');
    const [jobType, setJobType] = useState('Full Time');
    const [salary, setSalary] = useState(0);
    const [vacancies, setVacancies] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');

    const [searchParams] = useSearchParams();
    const editJobId = searchParams.get('edit');

    const descriptionEditorRef = useRef(null)
    const descriptionQuillRef = useRef(null)

    const responsibilitiesEditorRef = useRef(null)
    const responsibilitiesQuillRef = useRef(null)

    const requirementsEditorRef = useRef(null)
    const requirementsQuillRef = useRef(null)

    const navigate = useNavigate()

    const { backendUrl, companyToken } = useContext(AppContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {

            const description = descriptionQuillRef.current.root.innerHTML
            const responsibilities = responsibilitiesQuillRef.current.root.innerHTML
            const requirements = requirementsQuillRef.current.root.innerHTML

            let data;
            if (editJobId) {
                const response = await axios.put(backendUrl + `/api/company/edit-job/${editJobId}`,
                    { title, description, responsibilities, requirements, location, salary, category, level, jobType, vacancies, skills },
                    { headers: { token: companyToken } }
                );
                data = response.data;
            } else {
                const response = await axios.post(backendUrl + '/api/company/post-job',
                    { title, description, responsibilities, requirements, location, salary, category, level, jobType, vacancies, skills },
                    { headers: { token: companyToken } }
                );
                data = response.data;
            }

            if (data.success) {
                toast.success(data.message)
                setTitle('')
                setSalary(0)
                setVacancies(1)
                descriptionQuillRef.current.root.innerHTML = ""
                responsibilitiesQuillRef.current.root.innerHTML = ""
                requirementsQuillRef.current.root.innerHTML = ""
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



    useEffect(() => {
        // Initiate Quill only once
        if (!descriptionQuillRef.current && descriptionEditorRef.current) {
            descriptionQuillRef.current = new Quill(descriptionEditorRef.current, { theme: 'snow' })
        }
        if (!responsibilitiesQuillRef.current && responsibilitiesEditorRef.current) {
            responsibilitiesQuillRef.current = new Quill(responsibilitiesEditorRef.current, { theme: 'snow' })
        }
        if (!requirementsQuillRef.current && requirementsEditorRef.current) {
            requirementsQuillRef.current = new Quill(requirementsEditorRef.current, { theme: 'snow' })
        }
    }, [])

    useEffect(() => {
        const fetchJobForEdit = async () => {
            if (editJobId && companyToken) {
                try {
                    const { data } = await axios.get(backendUrl + `/api/jobs/${editJobId}`);
                    if (data.success) {
                        const job = data.job;
                        setTitle(job.title || '');
                        setLocation(job.location || 'Pune');
                        setCategory(job.category || 'Programming');
                        setLevel(job.level || 'Beginner level');
                        setJobType(job.jobType || 'Full Time');
                        setSalary(job.salary || 0);
                        setVacancies(job.vacancies || 1);
                        setSkills(job.skills || []);

                        if (descriptionQuillRef.current) descriptionQuillRef.current.root.innerHTML = job.description || '';
                        if (responsibilitiesQuillRef.current) responsibilitiesQuillRef.current.root.innerHTML = job.responsibilities || '';
                        if (requirementsQuillRef.current) requirementsQuillRef.current.root.innerHTML = job.requirements || '';
                    }
                } catch (error) {
                    console.error("Failed to fetch job for editing", error);
                }
            }
        };
        fetchJobForEdit();
    }, [editJobId, companyToken]);

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-col xl:flex-row gap-8 items-start">
                
                {/* ─── LEFT COLUMN (Form) ─── */}
                <form onSubmit={onSubmitHandler} className='flex-1 w-full flex flex-col gap-6 min-w-0'>
                    
                    {/* Header */}
                    <div className="w-full mb-2 flex items-center justify-between">
                        <div>
                            <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors mb-4 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg w-fit">
                                <ChevronLeft size={14} /> Back to Jobs
                            </button>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                {editJobId ? 'Edit Job' : 'Add New Job'}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 mt-2">
                                {editJobId ? 'Update the details for this job posting.' : 'Create a new job posting to find the best candidates.'}
                            </p>
                        </div>
                        {/* Decorative Graphic (hidden on small screens) */}
                        <div className="hidden md:flex items-center gap-4 bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0 relative z-10 rotate-3">
                                <Sparkles size={24} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-lg font-black text-blue-900 leading-tight" style={{ fontFamily: 'Caveat, cursive', transform: 'rotate(-2deg)' }}>Find<br/>Great Talent</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Job Basics */}
                    <div className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-[1.5rem] p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">1</div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-none">Job Basics</h3>
                                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Basic information about the job position.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <div className='col-span-1 md:col-span-2'>
                                <label className='block text-[13px] font-bold text-gray-700 mb-2'>Job Title <span className="text-red-500">*</span></label>
                                <input type="text" placeholder='e.g. Senior Frontend Developer'
                                    onChange={e => setTitle(e.target.value)} value={title}
                                    required
                                    className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all'
                                />
                            </div>
                            <div>
                                <label className='block text-[13px] font-bold text-gray-700 mb-2'>Job Category <span className="text-red-500">*</span></label>
                                <select className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer' onChange={e => setCategory(e.target.value)} value={category}>
                                    {JobCategories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className='block text-[13px] font-bold text-gray-700 mb-2'>Job Location <span className="text-red-500">*</span></label>
                                <select className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer' onChange={e => setLocation(e.target.value)} value={location}>
                                    {JobLocations.map((location, index) => (
                                        <option key={index} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className='block text-[13px] font-bold text-gray-700 mb-2'>Job Level <span className="text-red-500">*</span></label>
                                <select className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer' onChange={e => setLevel(e.target.value)} value={level}>
                                    <option value="Beginner level">Beginner level</option>
                                    <option value="Intermediate level">Intermediate level</option>
                                    <option value="Senior level">Senior level</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-[13px] font-bold text-gray-700 mb-2'>Job Type <span className="text-red-500">*</span></label>
                                <select className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer' onChange={e => setJobType(e.target.value)} value={jobType}>
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

                    {/* Step 2: Job Description */}
                    <div className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-[1.5rem] p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">2</div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-none">Job Description</h3>
                                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Describe the overall role and purpose.</p>
                            </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50/80 [&_.ql-toolbar]:p-3 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[160px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700">
                            <div ref={descriptionEditorRef}></div>
                        </div>
                    </div>

                    {/* Step 3: Responsibilities */}
                    <div className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-[1.5rem] p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">3</div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-none">Key Responsibilities</h3>
                                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">What will the candidate do on a daily basis?</p>
                            </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50/80 [&_.ql-toolbar]:p-3 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[160px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700">
                            <div ref={responsibilitiesEditorRef}></div>
                        </div>
                    </div>

                    {/* Step 4: Requirements */}
                    <div className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-[1.5rem] p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">4</div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-none">Requirements & Skills</h3>
                                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Must-have skills and qualifications.</p>
                            </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50/80 [&_.ql-toolbar]:p-3 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[160px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700">
                            <div ref={requirementsEditorRef}></div>
                        </div>
                    </div>

                    {/* Step 5: Compensation */}
                    <div className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-[1.5rem] p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">5</div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-none">Compensation</h3>
                                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Set the salary range and number of openings.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label className='block text-[13px] font-bold text-gray-700 mb-2'>Job Salary (₹) <span className="text-red-500">*</span></label>
                                <input min={0} type="number" placeholder='e.g. 25000'
                                    className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all' 
                                    onChange={e => setSalary(e.target.value)} value={salary} required 
                                />
                                <p className="text-[11px] font-medium text-gray-400 mt-1.5">Enter the expected salary (per annum or per month)</p>
                            </div>
                            <div>
                                <label className='block text-[13px] font-bold text-gray-700 mb-2'>No. of Vacancies <span className="text-red-500">*</span></label>
                                <input min={1} type="number" placeholder='e.g. 1'
                                    className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all' 
                                    onChange={e => setVacancies(e.target.value)} value={vacancies} required 
                                />
                                <p className="text-[11px] font-medium text-gray-400 mt-1.5">Number of positions you want to hire for.</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 6: Skills */}
                    <div className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-[1.5rem] p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">6</div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-none">Job Skills</h3>
                                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">Enter required skills for Lumi matching.</p>
                            </div>
                        </div>
                        
                        <div>
                            <label className='block text-[13px] font-bold text-gray-700 mb-2'>Skills Required</label>
                            <div className='flex items-center gap-3 mb-4'>
                                <input 
                                    type="text" 
                                    placeholder='e.g. React, Node.js, Python'
                                    className='flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all' 
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddSkill}
                                    className='bg-blue-50 text-blue-600 font-bold px-5 py-3 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2'
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {skills.map((skill, index) => (
                                    <span key={index} className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[13px] font-bold rounded-lg'>
                                        {skill}
                                        <X size={14} className='cursor-pointer hover:text-red-500' onClick={() => removeSkill(skill)} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-end mt-2">
                        <button type="submit" disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 px-12 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 text-sm'>
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {editJobId ? (isSubmitting ? 'Updating Job...' : 'Update Job') : (isSubmitting ? 'Posting Job...' : 'Publish Job')}
                        </button>
                    </div>
                </form>

                {/* ─── RIGHT COLUMN (Sidebar) ─── */}
                <div className="hidden xl:flex flex-col w-[320px] shrink-0 gap-6 sticky top-24">
                    
                    {/* Tips Widget */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                <Lightbulb size={20} className="fill-amber-500"/>
                            </div>
                            <h4 className="font-extrabold text-gray-900">Tips for a Great Job Post</h4>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                "Use a clear and specific job title",
                                "Provide detailed job description",
                                "Mention key skills and requirements",
                                "Set a competitive salary range",
                                "Be clear about job type and location"
                            ].map((tip, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-[13px] font-medium text-gray-600 leading-tight">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Need Help Widget */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 rounded-2xl shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-200/40 rounded-full blur-2xl" />
                        
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                                <Star size={20} className="fill-amber-500"/>
                            </div>
                            <h4 className="font-extrabold text-gray-900">Need Help?</h4>
                        </div>
                        
                        <p className="text-[13px] font-medium text-amber-900/70 mb-5 relative z-10 leading-relaxed">
                            Check our guide on writing effective job descriptions to attract top talent.
                        </p>
                        
                        <Link to="/help" className="w-full py-3 bg-white hover:bg-gray-50 text-amber-600 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm relative z-10 group">
                            View Guide <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default AddJob