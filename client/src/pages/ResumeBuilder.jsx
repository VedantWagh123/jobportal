import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import { 
    ArrowLeft, Save, Download, LayoutTemplate, CheckCircle, 
    Sparkles, Plus, Trash2, ChevronDown, ChevronUp, User,
    FileText, Briefcase, GraduationCap, Code, FolderGit2, Award, Medal, ListOrdered, GripVertical, Activity, CloudUpload, X,
    CheckCircle2, AlertCircle, Lightbulb, Maximize, Minimize
} from 'lucide-react';
import debounce from 'lodash.debounce';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ResumeCanvas from '../components/ResumeCanvas';
import Navbar from '../components/Navbar';

const initialData = {
    personalInfo: { fullName: '', professionalTitle: '', email: '', phone: '', location: '', linkedin: '', portfolioUrl: '' },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], programmingLanguages: [], frameworks: [], databases: [], tools: [], softSkills: [] },
    projects: [],
    certifications: [],
    achievements: [],
    sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements']
};

const ResumeBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, setUserData } = useContext(AppContext);
    const { getToken } = useAuth();
    
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [aiLoading, setAiLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const previewRef = useRef(null);
    
    // ATS & Sync State
    const [atsLoading, setAtsLoading] = useState(false);
    const [atsData, setAtsData] = useState(null);
    const [showAtsModal, setShowAtsModal] = useState(false);
    const [syncingProfile, setSyncingProfile] = useState(false);

    // Resizable Panels State
    const [leftWidth, setLeftWidth] = useState(40); // Initial width in %
    const [isDraggingDivider, setIsDraggingDivider] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingDivider) return;
            const newWidth = (e.clientX / window.innerWidth) * 100;
            // Constrain between 20% and 70%
            if (newWidth >= 20 && newWidth <= 70) {
                setLeftWidth(newWidth);
            }
        };
        const handleMouseUp = () => {
            setIsDraggingDivider(false);
        };
        if (isDraggingDivider) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingDivider]);

    // Fullscreen Toggle
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                toast.error("Failed to enter full screen");
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Fetch Resume
    useEffect(() => {
        const fetchResume = async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get(`${backendUrl}/api/resumes/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setResume({ ...initialData, ...data.resume });
                }
            } catch (error) {
                toast.error("Failed to load resume");
                navigate('/resumes');
            } finally {
                setLoading(false);
            }
        };
        fetchResume();
    }, [id]);

    // Autosave Debounced
    const debouncedSave = useCallback(
        debounce(async (dataToSave) => {
            try {
                setSaving(true);
                const token = await getToken();
                await axios.put(`${backendUrl}/api/resumes/${id}`, dataToSave, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Autosave failed");
            } finally {
                setSaving(false);
            }
        }, 1500),
        [id, backendUrl]
    );

    const updateResume = (updates) => {
        const newResume = { ...resume, ...updates };
        setResume(newResume);
        debouncedSave(newResume);
    };

    const handleDownloadPdf = async () => {
        try {
            const toastId = toast.loading("Generating PDF...");
            const token = await getToken();
            // Send current state for preview generation without waiting for db save
            const response = await axios.post(`${backendUrl}/api/resumes/${id}/pdf`, 
                { resumeData: resume },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${resume.resumeName || 'Resume'}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.update(toastId, { render: "PDF Downloaded Successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to generate PDF");
        }
    };

    const improveWithAI = async (section, content, context) => {
        if(!content || content.trim().length === 0) {
            toast.warning("Please write something first so Lumi can improve it.");
            return;
        }
        try {
            setAiLoading(true);
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/resumes/ai/improve`, { section, content, context }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                return data.result;
            }
        } catch (error) {
            toast.error("Lumi Improvement failed");
        } finally {
            setAiLoading(false);
        }
        return null;
    };

    const handleGenerateAtsScore = async () => {
        try {
            setAtsLoading(true);
            setShowAtsModal(true);
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/resumes/ai/ats-score`, { resumeData: resume }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success && data.result) {
                setAtsData(data.result);
            } else {
                toast.error(data.message || "Failed to parse ATS Score");
                setShowAtsModal(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "ATS Score Generation failed. Lumi servers might be busy.");
            setShowAtsModal(false);
        } finally {
            setAtsLoading(false);
        }
    };

    const handleSyncToProfile = async () => {
        try {
            setSyncingProfile(true);
            const toastId = toast.loading("Syncing to Profile...");
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/users/profile/sync-builder-resume`, { resumeData: resume }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                if (data.user) setUserData(data.user);
                toast.update(toastId, { render: "Saved to Profile Successfully!", type: "success", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(toastId, { render: "Failed to sync to profile", type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to sync resume to profile");
        } finally {
            setSyncingProfile(false);
        }
    };

    if (loading || !resume) return <Loading />;

    // Helper functions for Array states (Experience, Education, etc)
    const addArrayItem = (field, defaultItem) => {
        updateResume({ [field]: [...(resume[field] || []), defaultItem] });
    };
    
    const updateArrayItem = (field, index, key, value) => {
        const newArray = [...resume[field]];
        newArray[index] = { ...newArray[index], [key]: value };
        updateResume({ [field]: newArray });
    };
    
    const removeArrayItem = (field, index) => {
        const newArray = [...resume[field]];
        newArray.splice(index, 1);
        updateResume({ [field]: newArray });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round(height * (MAX_WIDTH / width));
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round(width * (MAX_HEIGHT / height));
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                updateResume({ personalInfo: { ...resume.personalInfo, profilePhoto: dataUrl }});
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // --- Renderers for Editor Tabs ---

    const renderPersonalInfo = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                        value={resume.personalInfo?.fullName || ''} 
                        onChange={e => updateResume({ personalInfo: { ...resume.personalInfo, fullName: e.target.value }})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Professional Title</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none" 
                        placeholder="e.g. Full Stack Developer"
                        value={resume.personalInfo?.professionalTitle || ''} 
                        onChange={e => updateResume({ personalInfo: { ...resume.personalInfo, professionalTitle: e.target.value }})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none" 
                        value={resume.personalInfo?.email || ''} 
                        onChange={e => updateResume({ personalInfo: { ...resume.personalInfo, email: e.target.value }})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none" 
                        value={resume.personalInfo?.phone || ''} 
                        onChange={e => updateResume({ personalInfo: { ...resume.personalInfo, phone: e.target.value }})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none" 
                        value={resume.personalInfo?.location || ''} 
                        onChange={e => updateResume({ personalInfo: { ...resume.personalInfo, location: e.target.value }})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn URL</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none" 
                        value={resume.personalInfo?.linkedin || ''} 
                        onChange={e => updateResume({ personalInfo: { ...resume.personalInfo, linkedin: e.target.value }})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Portfolio / GitHub</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none" 
                        value={resume.personalInfo?.portfolioUrl || ''} 
                        onChange={e => updateResume({ personalInfo: { ...resume.personalInfo, portfolioUrl: e.target.value }})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Profile Photo</label>
                    <div className="flex items-center gap-3">
                        {resume.personalInfo?.profilePhoto && (
                            <img src={resume.personalInfo.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-300" />
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSummary = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Professional Summary</h2>
                <button 
                    onClick={async () => {
                        const improved = await improveWithAI('summary', resume.summary, { title: resume.personalInfo.professionalTitle });
                        if(improved) updateResume({ summary: improved });
                    }}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Sparkles size={14} /> {aiLoading ? 'Enhancing...' : 'Improve with Lumi'}
                </button>
            </div>
            <textarea 
                rows={6}
                className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 outline-none custom-scrollbar"
                placeholder="Briefly describe your professional background, key skills, and career goals..."
                value={resume.summary || ''}
                onChange={e => updateResume({ summary: e.target.value })}
            />
        </div>
    );

    const renderExperience = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Work Experience</h2>
            
            {resume.experience?.map((exp, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative group">
                    <button onClick={() => removeArrayItem('experience', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Job Title</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={exp.jobTitle} onChange={e => updateArrayItem('experience', index, 'jobTitle', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Company Name</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={exp.company} onChange={e => updateArrayItem('experience', index, 'company', e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</label>
                                <input placeholder="MM/YYYY" className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={exp.startDate} onChange={e => updateArrayItem('experience', index, 'startDate', e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Date</label>
                                <input placeholder="MM/YYYY" disabled={exp.currentlyWorking} className="w-full border border-gray-300 rounded-md p-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400" value={exp.currentlyWorking ? 'Present' : exp.endDate} onChange={e => updateArrayItem('experience', index, 'endDate', e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <input type="checkbox" id={`current_${index}`} checked={exp.currentlyWorking} onChange={e => updateArrayItem('experience', index, 'currentlyWorking', e.target.checked)} />
                            <label htmlFor={`current_${index}`} className="text-sm font-medium text-gray-700">I currently work here</label>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Responsibilities & Achievements</label>
                            <button 
                                onClick={async () => {
                                    const improved = await improveWithAI('experience', exp.responsibilities, { jobTitle: exp.jobTitle, company: exp.company });
                                    if(improved) updateArrayItem('experience', index, 'responsibilities', improved);
                                }}
                                disabled={aiLoading}
                                className="text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-violet-200"
                            >
                                <Sparkles size={10} /> Lumi Improve
                            </button>
                        </div>
                        <textarea rows={4} placeholder="- Developed..." className="w-full border border-gray-300 rounded-md p-2 text-sm custom-scrollbar" value={exp.responsibilities} onChange={e => updateArrayItem('experience', index, 'responsibilities', e.target.value)} />
                    </div>
                </div>
            ))}
            
            <button 
                onClick={() => addArrayItem('experience', { jobTitle: '', company: '', location: '', startDate: '', endDate: '', currentlyWorking: false, responsibilities: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl flex justify-center items-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
                <Plus size={18} /> Add Experience
            </button>
        </div>
    );

    const renderEducation = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Education</h2>
            {resume.education?.map((edu, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative group">
                    <button onClick={() => removeArrayItem('education', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Degree / Course</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={edu.degree} onChange={e => updateArrayItem('education', index, 'degree', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Institution</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={edu.institution} onChange={e => updateArrayItem('education', index, 'institution', e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Year</label>
                                <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={edu.startYear} onChange={e => updateArrayItem('education', index, 'startYear', e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Year</label>
                                <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={edu.endYear} onChange={e => updateArrayItem('education', index, 'endYear', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Score (CGPA/%)</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={edu.score} onChange={e => updateArrayItem('education', index, 'score', e.target.value)} />
                        </div>
                    </div>
                </div>
            ))}
            <button 
                onClick={() => addArrayItem('education', { degree: '', institution: '', location: '', startYear: '', endYear: '', score: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl flex justify-center items-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
                <Plus size={18} /> Add Education
            </button>
        </div>
    );

    const renderProjects = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Projects</h2>
            {resume.projects?.map((proj, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative group">
                    <button onClick={() => removeArrayItem('projects', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Project Name</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={proj.projectName} onChange={e => updateArrayItem('projects', index, 'projectName', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Technologies (Comma separated)</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={proj.technologies?.join(', ')} onChange={e => updateArrayItem('projects', index, 'technologies', e.target.value.split(',').map(s=>s.trim()))} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Live Demo URL</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={proj.liveDemoUrl} onChange={e => updateArrayItem('projects', index, 'liveDemoUrl', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">GitHub URL</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={proj.githubUrl} onChange={e => updateArrayItem('projects', index, 'githubUrl', e.target.value)} />
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Project Description & Bullets</label>
                            <button 
                                onClick={async () => {
                                    const improved = await improveWithAI('projects', proj.description, { projectName: proj.projectName, tech: proj.technologies });
                                    if(improved) updateArrayItem('projects', index, 'description', improved);
                                }}
                                disabled={aiLoading}
                                className="text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-violet-200"
                            >
                                <Sparkles size={10} /> Lumi Improve
                            </button>
                        </div>
                        <textarea rows={4} placeholder="- Built..." className="w-full border border-gray-300 rounded-md p-2 text-sm custom-scrollbar" value={proj.description} onChange={e => updateArrayItem('projects', index, 'description', e.target.value)} />
                    </div>
                </div>
            ))}
            
            <button 
                onClick={() => addArrayItem('projects', { projectName: '', role: '', description: '', technologies: [], githubUrl: '', liveDemoUrl: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl flex justify-center items-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
                <Plus size={18} /> Add Project
            </button>
        </div>
    );

    const renderSkills = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Skills</h2>
            <p className="text-sm text-gray-500 mb-4">Type a skill and press <strong>Enter</strong> or <strong>Comma ( , )</strong> to add it.</p>
            
            {['technical', 'programmingLanguages', 'frameworks', 'databases', 'tools', 'softSkills'].map((category) => (
                <div key={category} className="mb-4">
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(resume.skills[category] || []).map((skill, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 border border-blue-100">
                                {skill}
                                <button 
                                    onClick={() => {
                                        const newArr = [...resume.skills[category]];
                                        newArr.splice(idx, 1);
                                        updateResume({ skills: { ...resume.skills, [category]: newArr } });
                                    }}
                                    className="hover:text-red-500 ml-1"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </span>
                        ))}
                    </div>

                    <input 
                        className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 outline-none text-sm" 
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (val) {
                                    const current = resume.skills[category] || [];
                                    if(!current.includes(val)) {
                                        updateResume({ skills: { ...resume.skills, [category]: [...current, val] } });
                                    }
                                }
                                e.currentTarget.value = '';
                            }
                        }}
                        onBlur={e => {
                            const val = e.currentTarget.value.trim();
                            if (val) {
                                const current = resume.skills[category] || [];
                                if(!current.includes(val)) {
                                    updateResume({ skills: { ...resume.skills, [category]: [...current, val] } });
                                }
                            }
                            e.currentTarget.value = '';
                        }}
                        placeholder={`Add ${category === 'frameworks' ? 'React, Node.js' : 'Skill'}...`}
                    />
                </div>
            ))}
        </div>
    );

    const renderCertifications = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Certifications</h2>
            {resume.certifications?.map((cert, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative group">
                    <button onClick={() => removeArrayItem('certifications', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Certification Name</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={cert.certificateName} onChange={e => updateArrayItem('certifications', index, 'certificateName', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Issuing Organization</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={cert.issuingOrganization} onChange={e => updateArrayItem('certifications', index, 'issuingOrganization', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Issue Date</label>
                            <input placeholder="MM/YYYY" className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={cert.issueDate} onChange={e => updateArrayItem('certifications', index, 'issueDate', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Credential ID (Optional)</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={cert.credentialId} onChange={e => updateArrayItem('certifications', index, 'credentialId', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Credential URL</label>
                            <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={cert.credentialUrl} onChange={e => updateArrayItem('certifications', index, 'credentialUrl', e.target.value)} />
                        </div>
                    </div>
                </div>
            ))}
            <button 
                onClick={() => addArrayItem('certifications', { certificateName: '', issuingOrganization: '', issueDate: '', credentialId: '', credentialUrl: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl flex justify-center items-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
                <Plus size={18} /> Add Certification
            </button>
        </div>
    );

    const renderAchievements = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Achievements</h2>
            {resume.achievements?.map((ach, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative group">
                    <button onClick={() => removeArrayItem('achievements', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 gap-4 mb-4 pr-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Achievement Title</label>
                                <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={ach.achievementName} onChange={e => updateArrayItem('achievements', index, 'achievementName', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Organization / Event</label>
                                <input className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={ach.organization} onChange={e => updateArrayItem('achievements', index, 'organization', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date</label>
                                <input placeholder="MM/YYYY" className="w-full border border-gray-300 rounded-md p-1.5 text-sm" value={ach.date} onChange={e => updateArrayItem('achievements', index, 'date', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Short Description</label>
                            <textarea rows={2} className="w-full border border-gray-300 rounded-md p-2 text-sm custom-scrollbar" value={ach.description} onChange={e => updateArrayItem('achievements', index, 'description', e.target.value)} />
                        </div>
                    </div>
                </div>
            ))}
            <button 
                onClick={() => addArrayItem('achievements', { achievementName: '', organization: '', date: '', description: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl flex justify-center items-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
                <Plus size={18} /> Add Achievement
            </button>
        </div>
    );

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(resume.sectionOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        updateResume({ sectionOrder: items });
    };

    const sectionNames = {
        summary: 'Professional Summary',
        experience: 'Work Experience',
        projects: 'Projects',
        skills: 'Skills',
        education: 'Education',
        certifications: 'Certifications',
        achievements: 'Achievements'
    };

    const renderLayout = () => (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Design Settings</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Typography (Font Family)</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-blue-500 outline-none text-sm bg-white"
                            value={resume.design?.fontFamily || 'Inter'}
                            onChange={(e) => updateResume({ design: { ...resume.design, fontFamily: e.target.value } })}
                        >
                            <option value="Inter">Inter (Clean & Modern)</option>
                            <option value="Roboto">Roboto (Professional)</option>
                            <option value="Merriweather">Merriweather (Classic Serif)</option>
                            <option value="Outfit">Outfit (Geometric & Bold)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Reorder Sections</h2>
                <p className="text-sm text-gray-500 mb-6">Drag and drop the sections below to change their order in the generated resume.</p>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="sections">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {resume.sectionOrder?.map((sectionId, index) => (
                                    <Draggable key={sectionId} draggableId={sectionId} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm transition-all ${snapshot.isDragging ? 'shadow-lg border-blue-500 scale-[1.02] z-50' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="text-gray-400"><GripVertical size={18} /></div>
                                                <span className="font-bold text-gray-700">{sectionNames[sectionId] || sectionId}</span>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );

    // --- Live Preview Frame ---
    // We build a simplified HTML string representing the selected template to inject into an iframe for pixel-perfect preview isolation.
    const generatePreviewHtml = () => {
        // Simple mapping to visual classes
        let templateClass = 'template-ats-classic';
        if(resume.template === 'Modern Professional') templateClass = 'template-modern-professional';
        if(resume.template === 'Tech Professional') templateClass = 'template-tech-professional';
        if(resume.template === 'Minimal Executive') templateClass = 'template-minimal-executive';

        const renderList = (text) => {
            if(!text) return '';
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            if(lines.length > 0 && lines[0].startsWith('-')) {
                return `<ul style="margin: 4px 0 0 0; padding-left: 20px;">${lines.map(l => `<li style="margin-bottom:3px;">${l.replace(/^-/, '').trim()}</li>`).join('')}</ul>`;
            }
            return `<div>${text}</div>`;
        }

        const renderSkillGroup = (name, arr) => {
            if(!arr || arr.length === 0) return '';
            return `<div style="margin-bottom: 4px;"><strong>${name}:</strong> <div style="display:inline-flex; flex-wrap:wrap; gap:4px;">${arr.map(s => `<span class="skill-badge" style="display:inline-block; font-size:10px; background:#f3f4f6; padding:2px 6px; border-radius:4px;">${s}</span>`).join('')}</div></div>`;
        }

        const renderSectionMap = {
            summary: resume.summary ? `
            <div style="margin-bottom:15px;">
                <div class="section-title">Professional Summary</div>
                <div style="text-align:justify;">${resume.summary}</div>
            </div>` : '',
            
            experience: resume.experience?.length > 0 ? `
            <div style="margin-bottom:15px;">
                <div class="section-title">Experience</div>
                ${resume.experience.map(exp => `
                    <div style="margin-bottom: 12px;">
                        <div class="job-header">
                            <div><strong style="font-size:12px;">${exp.jobTitle}</strong>${exp.company ? `, <i style="font-style:italic;">${exp.company}</i>` : ''}${exp.location ? `, ${exp.location}` : ''}</div>
                            <div style="font-size:10px; color:#4b5563;">${exp.startDate || '...'} - ${exp.currentlyWorking ? 'Present' : (exp.endDate || '...')}</div>
                        </div>
                        <div style="margin-top:4px;">${renderList(exp.responsibilities)}</div>
                    </div>
                `).join('')}
            </div>` : '',
            
            projects: resume.projects?.length > 0 ? `
            <div style="margin-bottom:15px;">
                <div class="section-title">Projects</div>
                ${resume.projects.map(proj => `
                    <div style="margin-bottom: 12px;">
                        <div class="job-header">
                            <div><strong style="font-size:12px;">${proj.projectName}</strong></div>
                            <div style="font-size:10px; color:#4b5563;">
                                ${proj.liveDemoUrl ? `<a class="link" href="${proj.liveDemoUrl}">Live Demo</a>` : ''}
                                ${proj.githubUrl ? `${proj.liveDemoUrl ? ' | ' : ''}<a class="link" href="${proj.githubUrl}">GitHub</a>` : ''}
                            </div>
                        </div>
                        ${proj.technologies?.length > 0 ? `<div style="font-size:10px; margin-bottom:4px; color:#4b5563;"><em>Tech: ${proj.technologies.join(', ')}</em></div>` : ''}
                        <div style="margin-top:4px;">${renderList(proj.description)}</div>
                    </div>
                `).join('')}
            </div>` : '',
            
            skills: (resume.skills?.technical?.length > 0 || resume.skills?.softSkills?.length > 0 || resume.skills?.programmingLanguages?.length > 0 || resume.skills?.frameworks?.length > 0 || resume.skills?.databases?.length > 0 || resume.skills?.tools?.length > 0) ? `
            <div style="margin-bottom:15px;">
                <div class="section-title">Skills</div>
                ${renderSkillGroup('Technical', resume.skills.technical)}
                ${renderSkillGroup('Languages', resume.skills.programmingLanguages)}
                ${renderSkillGroup('Frameworks', resume.skills.frameworks)}
                ${renderSkillGroup('Databases', resume.skills.databases)}
                ${renderSkillGroup('Tools', resume.skills.tools)}
                ${renderSkillGroup('Soft Skills', resume.skills.softSkills)}
            </div>` : '',
            
            education: resume.education?.length > 0 ? `
            <div style="margin-bottom:15px;">
                <div class="section-title">Education</div>
                ${resume.education.map(edu => `
                    <div style="margin-bottom: 12px;">
                        <div class="job-header">
                            <div><strong style="font-size:12px;">${edu.degree}</strong>${edu.institution ? `, ${edu.institution}` : ''}</div>
                            <div style="font-size:10px; color:#4b5563;">${edu.startYear || '...'} - ${edu.endYear || '...'}</div>
                        </div>
                        ${edu.score ? `<div style="margin-top:2px;"><strong>Score:</strong> ${edu.score}</div>` : ''}
                    </div>
                `).join('')}
            </div>` : '',

            certifications: resume.certifications?.length > 0 ? `
            <div style="margin-bottom:15px;">
                <div class="section-title">Certifications</div>
                ${resume.certifications.map(cert => `
                    <div style="margin-bottom: 8px;">
                        <div class="job-header">
                            <div><strong style="font-size:12px;">${cert.certificateName}</strong>${cert.issuingOrganization ? `, <i style="font-style:italic;">${cert.issuingOrganization}</i>` : ''}</div>
                            <div style="font-size:10px; color:#4b5563;">${cert.issueDate || '...'}</div>
                        </div>
                        ${cert.credentialId ? `<div style="font-size:10px; margin-top:2px;"><strong>Credential ID:</strong> ${cert.credentialId}</div>` : ''}
                        ${cert.credentialUrl ? `<div style="font-size:10px; margin-top:2px;"><a class="link" href="${cert.credentialUrl}">View Credential</a></div>` : ''}
                    </div>
                `).join('')}
            </div>` : '',

            achievements: resume.achievements?.length > 0 ? `
            <div style="margin-bottom:15px;">
                <div class="section-title">Achievements</div>
                ${resume.achievements.map(ach => `
                    <div style="margin-bottom: 8px;">
                        <div class="job-header">
                            <div><strong style="font-size:12px;">${ach.achievementName}</strong>${ach.organization ? `, ${ach.organization}` : ''}</div>
                            <div style="font-size:10px; color:#4b5563;">${ach.date || '...'}</div>
                        </div>
                        ${ach.description ? `<div style="margin-top:2px; text-align:justify;">${ach.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>` : ''
        };

        const defaultOrder = ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'];
        const activeOrder = resume.sectionOrder?.length > 0 ? resume.sectionOrder : defaultOrder;
        
        const dynamicContent = activeOrder.map(section => renderSectionMap[section] || '').join('');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; color: #1f2937; background: #ffffff; font-size: 11px; line-height: 1.5; }
                /* ----- ATS Classic Template ----- */
                body.template-ats-classic {
                    font-family: "Times New Roman", Times, serif;
                    color: #000;
                }
                .template-ats-classic h1 { font-size: 26px; font-weight: bold; text-transform: uppercase; text-align: center; margin: 0 0 2px 0; letter-spacing: 1px; }
                .template-ats-classic .contact-info { display: flex; flex-wrap: wrap; justify-content: center; margin-top: 5px; margin-bottom: 15px; font-size: 11px; }
                .template-ats-classic .section-title { 
                    font-size: 13px; border-bottom: 1px solid #000; margin: 12px 0 8px 0; font-weight: bold; padding-bottom: 2px;
                }
                .template-ats-classic .skill-badge { background: none !important; padding: 0 !important; font-size: 11px !important; }
                .template-ats-classic .skill-badge::after { content: ", "; }
                .template-ats-classic .skill-badge:last-child::after { content: ""; }
                
                /* Modern Professional */
                body.template-modern-professional { color: #333; }
                .template-modern-professional h1 { font-size: 28px; color: #2563eb; margin: 0 0 5px 0; }
                .template-modern-professional .contact-info { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; color: #4b5563; }
                .template-modern-professional .section-title { font-size: 14px; color: #2563eb; border-bottom: 2px solid #e5e7eb; margin: 20px 0 12px 0; font-weight: 600; text-transform: uppercase; padding-bottom: 4px; }
                
                /* Tech Professional */
                body.template-tech-professional { font-family: 'Inter', sans-serif; }
                .template-tech-professional h1 { font-size: 26px; font-weight: 800; margin: 0 0 5px 0; }
                .template-tech-professional .contact-info { display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
                .template-tech-professional .section-title { font-size: 12px; background: #f3f4f6; padding: 4px 8px; font-weight: bold; text-transform: uppercase; margin: 15px 0 10px 0; display: inline-block; }
                
                /* Minimal Executive */
                body.template-minimal-executive { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
                .template-minimal-executive h1 { font-size: 32px; font-weight: 300; letter-spacing: 1px; margin: 0 0 8px 0; }
                .template-minimal-executive .contact-info { margin-bottom: 25px; color: #6b7280; font-size: 10px; letter-spacing: 0.5px; }
                .template-minimal-executive .section-title { font-size: 12px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; margin: 25px 0 15px 0; color: #9ca3af; }

                .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
                .link { color: #2563eb !important; text-decoration: none; }
                .link:hover { text-decoration: underline; }

                .contact-item { display: inline-flex; align-items: center; gap: 4px; margin: 0 8px; }
                .contact-item svg { width: 11px; height: 11px; }
            </style>
        </head>
        <body class="${templateClass}">
            <div style="margin-bottom: 15px; text-align: center; width: 100%;">
                <h1 style="text-align: center; margin: 0 auto 2px auto;">${resume.personalInfo?.fullName || 'Your Name'}</h1>
                ${resume.personalInfo?.location ? `<div style="text-align: center; margin-bottom: 4px; font-size: 11px;">${resume.personalInfo.location}</div>` : ''}
                ${resume.personalInfo?.professionalTitle && templateClass !== 'template-ats-classic' ? `<div style="font-size:14px; margin-bottom:5px; text-transform:capitalize; font-weight:${templateClass === 'template-modern-professional' ? '600' : 'normal'}; color:${templateClass === 'template-modern-professional' ? '#2563eb' : 'inherit'};">${resume.personalInfo.professionalTitle}</div>` : ''}
                
                <div class="contact-info">
                    ${resume.personalInfo?.phone ? `<span class="contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${resume.personalInfo.phone}</span>` : ''}
                    ${resume.personalInfo?.email ? `<span class="contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> <a class="link" href="mailto:${resume.personalInfo.email}">${resume.personalInfo.email}</a></span>` : ''}
                    ${resume.personalInfo?.linkedin ? `<span class="contact-item"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> <a class="link" href="${resume.personalInfo.linkedin.startsWith('http') ? resume.personalInfo.linkedin : 'https://' + resume.personalInfo.linkedin}">${resume.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a></span>` : ''}
                    ${resume.personalInfo?.portfolioUrl || resume.personalInfo?.github ? `<span class="contact-item"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> <a class="link" href="${resume.personalInfo.portfolioUrl || resume.personalInfo.github}">${(resume.personalInfo.portfolioUrl || resume.personalInfo.github).replace(/^https?:\/\/(www\.)?/, '')}</a></span>` : ''}
                </div>
            </div>

            ${dynamicContent}
            
        </body>
        </html>
        `;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans relative text-sm">
            <div className="shrink-0 z-50 relative">
                <Navbar />
            </div>
            
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 relative z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/resumes')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <input 
                        type="text" 
                        value={resume.resumeName}
                        onChange={e => updateResume({ resumeName: e.target.value })}
                        className="text-lg font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-100 rounded px-2 w-48 sm:w-64"
                    />
                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                        {saving ? <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div> Saving...</span> : <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Saved</span>}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleGenerateAtsScore}
                        className="hidden md:flex bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg font-bold items-center gap-2 hover:bg-green-100 transition-colors shadow-sm text-sm"
                    >
                        <Activity size={16} /> Generate ATS Score
                    </button>
                    
                    <button 
                        onClick={handleSyncToProfile}
                        disabled={syncingProfile}
                        className="hidden md:flex bg-violet-50 text-violet-700 border border-violet-200 px-3 py-2 rounded-lg font-bold items-center gap-2 hover:bg-violet-100 transition-colors shadow-sm text-sm disabled:opacity-50"
                    >
                        {syncingProfile ? <span className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></span> : <CloudUpload size={16} />} Save to Profile
                    </button>

                    <div className="h-6 w-px bg-gray-300 hidden md:block mx-1"></div>

                    <select 
                        value={resume.template}
                        onChange={e => updateResume({ template: e.target.value })}
                        className="hidden md:block bg-gray-50 border border-gray-200 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-gray-700"
                    >
                        <option value="ATS Classic">ATS Classic</option>
                        <option value="Modern Professional">Modern Professional</option>
                        <option value="Tech Professional">Tech Professional</option>
                        <option value="Minimal Executive">Minimal Executive</option>
                    </select>

                    <button 
                        onClick={handleDownloadPdf}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm text-sm"
                    >
                        <Download size={16} /> <span className="hidden sm:inline">Download PDF</span>
                    </button>
                </div>
            </header>

            {/* Split Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                
                {/* Left Panel: Editor */}
                <div 
                    className="w-full bg-white flex flex-col h-full z-10 shadow-xl lg:shadow-none shrink-0"
                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${leftWidth}%` : '100%' }}
                >
                    
                    {/* Horizontal Nav for sections */}
                    <div className="flex overflow-x-auto border-b border-gray-100 custom-scrollbar shrink-0">
                        <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><User size={16} /> Personal</button>
                        <button onClick={() => setActiveTab('summary')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><FileText size={16} /> Summary</button>
                        <button onClick={() => setActiveTab('experience')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'experience' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Briefcase size={16} /> Experience</button>
                        <button onClick={() => setActiveTab('education')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'education' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><GraduationCap size={16} /> Education</button>
                        <button onClick={() => setActiveTab('skills')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'skills' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Code size={16} /> Skills</button>
                        <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'projects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><FolderGit2 size={16} /> Projects</button>
                        <button onClick={() => setActiveTab('certifications')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'certifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Award size={16} /> Certifications</button>
                        <button onClick={() => setActiveTab('achievements')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'achievements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Medal size={16} /> Achievements</button>
                        <button onClick={() => setActiveTab('layout')} className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'layout' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><ListOrdered size={16} /> Design & Layout</button>
                    </div>

                    {/* Form Area */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-32">
                        {activeTab === 'personal' && renderPersonalInfo()}
                        {activeTab === 'summary' && renderSummary()}
                        {activeTab === 'experience' && renderExperience()}
                        {activeTab === 'education' && renderEducation()}
                        {activeTab === 'projects' && renderProjects()}
                        {activeTab === 'skills' && renderSkills()}
                        {activeTab === 'certifications' && renderCertifications()}
                        {activeTab === 'achievements' && renderAchievements()}
                        {activeTab === 'layout' && renderLayout()}
                    </div>
                </div>

                {/* Draggable Divider (Desktop Only) */}
                <div 
                    className="hidden lg:block w-1.5 hover:w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize z-20 transition-all active:bg-blue-500 shrink-0"
                    onMouseDown={(e) => { e.preventDefault(); setIsDraggingDivider(true); }}
                ></div>

                {/* Right Panel: Live Preview */}
                <div 
                    ref={previewRef}
                    className="hidden lg:flex flex-col flex-1 bg-gray-100 overflow-hidden relative items-center justify-center"
                >
                    {/* Full Screen Toggle Button */}
                    <button 
                        onClick={toggleFullScreen}
                        className="absolute top-6 right-6 z-10 w-10 h-10 bg-white text-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                        title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                    >
                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>

                    {/* The A4 Canvas Container */}
                    <div className="flex-1 w-full overflow-y-auto flex justify-center custom-scrollbar">
                        <ResumeCanvas 
                            resume={resume} 
                            onUpdate={setResume} 
                            onFocusSection={setActiveTab} 
                        />
                    </div>
                </div>
            </div>
            
            {/* Mobile Preview Toggle (Visible only on small screens) */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <button 
                    onClick={handleGenerateAtsScore}
                    className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 active:scale-95 transition-all"
                >
                    <Activity size={20} />
                </button>
                <button 
                    onClick={handleDownloadPdf}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <Download size={24} />
                </button>
            </div>

            {/* ATS Score Modal */}
            {showAtsModal && (
                <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Activity className="text-green-600" /> Real-time ATS Score</h3>
                            <button onClick={() => setShowAtsModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {atsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="w-16 h-16 border-4 border-green-100 border-t-green-500 rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-medium">Scanning your resume with Lumi...</p>
                                </div>
                            ) : atsData ? (
                                <div className="flex flex-col items-center gap-8">
                                    <div className="relative w-36 h-36 flex items-center justify-center bg-gray-50 rounded-full border-[6px] shadow-inner" style={{ borderColor: atsData.score >= 80 ? '#22c55e' : atsData.score >= 60 ? '#f59e0b' : '#ef4444' }}>
                                        <div className="flex flex-col items-center mt-2">
                                            <span className="text-5xl font-black text-gray-900 leading-none">{atsData.score}</span>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Strengths */}
                                        <div className="w-full">
                                            <h4 className="font-bold text-emerald-800 mb-3 text-sm uppercase flex items-center gap-2 border-b border-emerald-100 pb-2"><CheckCircle2 size={16} /> Key Strengths</h4>
                                            <ul className="space-y-2.5">
                                                {atsData.feedback?.strengths?.map((fb, idx) => (
                                                    <li key={idx} className="flex gap-2.5 items-start bg-emerald-50/50 p-3 rounded-lg">
                                                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                                                        <span className="text-sm text-gray-700 font-medium leading-tight">{fb}</span>
                                                    </li>
                                                ))}
                                                {(!atsData.feedback?.strengths || atsData.feedback?.strengths.length === 0) && (
                                                    <p className="text-sm text-gray-500 italic">No significant strengths identified.</p>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Weaknesses / Unwanted */}
                                        <div className="w-full">
                                            <h4 className="font-bold text-red-800 mb-3 text-sm uppercase flex items-center gap-2 border-b border-red-100 pb-2"><AlertCircle size={16} /> Weaknesses / Issues</h4>
                                            <ul className="space-y-2.5">
                                                {atsData.feedback?.weaknesses?.map((fb, idx) => (
                                                    <li key={idx} className="flex gap-2.5 items-start bg-red-50/50 p-3 rounded-lg">
                                                        <span className="text-red-500 shrink-0 mt-0.5">•</span>
                                                        <span className="text-sm text-gray-700 font-medium leading-tight">{fb}</span>
                                                    </li>
                                                ))}
                                                {(!atsData.feedback?.weaknesses || atsData.feedback?.weaknesses.length === 0) && (
                                                    <p className="text-sm text-gray-500 italic">No major weaknesses found!</p>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Improvements */}
                                        <div className="w-full md:col-span-2 mt-2">
                                            <h4 className="font-bold text-blue-800 mb-3 text-sm uppercase flex items-center gap-2 border-b border-blue-100 pb-2"><Lightbulb size={16} /> Actionable Improvements</h4>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {atsData.feedback?.improvements?.map((fb, idx) => (
                                                    <li key={idx} className="flex gap-3 items-start bg-blue-50/50 p-3.5 rounded-lg border border-blue-100/50">
                                                        <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                                        <span className="text-sm text-gray-700 font-medium leading-tight">{fb}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeBuilder;
