import { useContext, useEffect, useState, useRef } from 'react'
console.log("HMR Bust");
import { AppContext } from '../context/AppContext'
import { defaultResumeData } from '../assets/defaultResumeData'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { 
  FileText, Plus, Copy, Trash2, Edit3, Download, Clock,
  Upload, ChevronRight, Zap, FileCheck, ShieldCheck,
  Home, Briefcase, ChevronRight as BreadcrumbArrow,
  Star, Clock as TimeIcon, Layout, FileType, CheckCircle2, Sparkles, User, X, Wand2, ChevronDown, TrendingUp
} from 'lucide-react'
import moment from 'moment'

const TemplateThumbnail = ({ type, className = "" }) => {
    // ATS Classic
    if (type === 'ATS Classic') {
        return (
            <div className={`w-full h-full bg-white p-[8%] flex flex-col gap-[3%] shadow-sm ${className}`}>
                <div className="flex flex-col items-center gap-[4%] mb-[2%]">
                    <div className="w-[60%] h-[4%] bg-slate-800 font-serif"></div>
                    <div className="flex gap-[3%] mt-[2%] justify-center w-full">
                        <div className="w-[15%] h-[1.5%] bg-slate-400"></div>
                        <div className="w-[20%] h-[1.5%] bg-slate-400"></div>
                        <div className="w-[15%] h-[1.5%] bg-slate-400"></div>
                    </div>
                </div>
                
                <div className="w-full h-[1px] bg-slate-800 my-[2%]"></div>
                <div className="w-[25%] h-[2.5%] bg-slate-800 mb-[2%] uppercase"></div>
                
                <div className="flex justify-between mb-[1%]">
                    <div className="w-[40%] h-[2%] bg-slate-700 font-bold"></div>
                    <div className="w-[20%] h-[1.5%] bg-slate-400"></div>
                </div>
                <div className="w-[30%] h-[1.5%] bg-slate-500 mb-[2%] italic"></div>
                <div className="flex flex-col gap-[1.5%] pl-[3%] mb-[3%]">
                    <div className="w-[95%] h-[1.2%] bg-slate-300"></div>
                    <div className="w-[90%] h-[1.2%] bg-slate-300"></div>
                    <div className="w-[85%] h-[1.2%] bg-slate-300"></div>
                </div>

                <div className="w-full h-[1px] bg-slate-800 my-[2%]"></div>
                <div className="w-[25%] h-[2.5%] bg-slate-800 mb-[2%] uppercase"></div>
                
                <div className="flex justify-between mb-[1%]">
                    <div className="w-[35%] h-[2%] bg-slate-700 font-bold"></div>
                    <div className="w-[15%] h-[1.5%] bg-slate-400"></div>
                </div>
                <div className="w-[25%] h-[1.5%] bg-slate-500 mb-[2%] italic"></div>
            </div>
        );
    }
    
    // Modern Professional
    if (type === 'Modern Professional') {
        return (
            <div className={`w-full h-full bg-white flex ${className}`}>
                {/* Left Column */}
                <div className="w-[35%] h-full bg-slate-800 p-[6%] flex flex-col gap-[3%]">
                    <div className="w-[80%] aspect-square rounded-full bg-slate-600 mx-auto mb-[6%]"></div>
                    
                    <div className="w-[80%] h-[2%] bg-slate-400 mb-[1%] uppercase"></div>
                    <div className="w-full h-[1px] bg-slate-600 mb-[2%]"></div>
                    <div className="w-[90%] h-[1.5%] bg-slate-300 mb-[1%]"></div>
                    <div className="w-[85%] h-[1.5%] bg-slate-300 mb-[1%]"></div>
                    <div className="w-[95%] h-[1.5%] bg-slate-300 mb-[4%]"></div>
                    
                    <div className="w-[80%] h-[2%] bg-slate-400 mb-[1%] uppercase mt-[4%]"></div>
                    <div className="w-full h-[1px] bg-slate-600 mb-[2%]"></div>
                    <div className="flex flex-wrap gap-[4%] mt-[2%]">
                        <div className="w-[45%] h-[1.5%] bg-slate-300 mb-[4%]"></div>
                        <div className="w-[45%] h-[1.5%] bg-slate-300 mb-[4%]"></div>
                        <div className="w-[45%] h-[1.5%] bg-slate-300 mb-[4%]"></div>
                        <div className="w-[45%] h-[1.5%] bg-slate-300 mb-[4%]"></div>
                    </div>
                </div>
                {/* Right Column */}
                <div className="w-[65%] h-full bg-white p-[6%] flex flex-col gap-[2%]">
                    <div className="w-[80%] h-[5%] bg-blue-600 font-bold mb-[2%]"></div>
                    <div className="w-[50%] h-[2%] bg-blue-400 mb-[4%] tracking-widest"></div>
                    
                    <div className="w-[100%] h-[1.2%] bg-slate-300 mb-[1%]"></div>
                    <div className="w-[95%] h-[1.2%] bg-slate-300 mb-[1%]"></div>
                    <div className="w-[85%] h-[1.2%] bg-slate-300 mb-[6%]"></div>
                    
                    <div className="w-[40%] h-[2.5%] bg-slate-800 mb-[2%] uppercase flex items-center gap-[4%]">
                        <div className="w-[8%] aspect-square bg-blue-500 rounded-sm"></div>
                    </div>
                    
                    <div className="flex justify-between mb-[1%] mt-[1%]">
                        <div className="w-[45%] h-[2%] bg-slate-700 font-bold"></div>
                        <div className="w-[20%] h-[1.5%] bg-slate-400"></div>
                    </div>
                    <div className="w-[35%] h-[1.5%] bg-slate-500 mb-[2%]"></div>
                    <div className="flex flex-col gap-[1.5%] pl-[3%] mb-[3%]">
                        <div className="w-[95%] h-[1.2%] bg-slate-300"></div>
                        <div className="w-[90%] h-[1.2%] bg-slate-300"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Tech Professional
    if (type === 'Tech Professional') {
        return (
            <div className={`w-full h-full bg-white flex flex-col ${className}`}>
                {/* Header block */}
                <div className="w-full h-[22%] bg-indigo-900 p-[6%] flex flex-col justify-center gap-[6%]">
                    <div className="w-[50%] h-[25%] bg-white font-bold rounded-sm"></div>
                    <div className="w-[30%] h-[10%] bg-indigo-300 rounded-sm"></div>
                    <div className="flex gap-[4%] mt-[2%]">
                        <div className="w-[15%] h-[8%] bg-indigo-400/50 rounded-sm"></div>
                        <div className="w-[20%] h-[8%] bg-indigo-400/50 rounded-sm"></div>
                        <div className="w-[15%] h-[8%] bg-indigo-400/50 rounded-sm"></div>
                    </div>
                </div>
                
                <div className="flex-1 p-[8%] flex flex-col gap-[2%]">
                    <div className="w-[35%] h-[2.5%] bg-indigo-800 uppercase mb-[2%] border-l-[3px] border-indigo-500 pl-[4%]"></div>
                    
                    <div className="flex gap-[3%] flex-wrap mb-[6%]">
                        <div className="px-[3%] py-[1.5%] w-[18%] h-[2%] bg-indigo-50 border border-indigo-100 rounded-sm"></div>
                        <div className="px-[3%] py-[1.5%] w-[22%] h-[2%] bg-indigo-50 border border-indigo-100 rounded-sm"></div>
                        <div className="px-[3%] py-[1.5%] w-[15%] h-[2%] bg-indigo-50 border border-indigo-100 rounded-sm"></div>
                        <div className="px-[3%] py-[1.5%] w-[25%] h-[2%] bg-indigo-50 border border-indigo-100 rounded-sm mt-[2%]"></div>
                        <div className="px-[3%] py-[1.5%] w-[20%] h-[2%] bg-indigo-50 border border-indigo-100 rounded-sm mt-[2%]"></div>
                    </div>

                    <div className="w-[30%] h-[2.5%] bg-indigo-800 uppercase mb-[2%] border-l-[3px] border-indigo-500 pl-[4%]"></div>
                    
                    <div className="flex justify-between mb-[1%]">
                        <div className="w-[45%] h-[2%] bg-slate-800 font-bold"></div>
                        <div className="w-[20%] h-[1.5%] bg-slate-400"></div>
                    </div>
                    <div className="w-[100%] h-[1.2%] bg-slate-300 mt-[1%]"></div>
                    <div className="w-[95%] h-[1.2%] bg-slate-300 mt-[1.5%]"></div>
                    <div className="w-[85%] h-[1.2%] bg-slate-300 mt-[1.5%] mb-[4%]"></div>
                </div>
            </div>
        );
    }

    // Minimal Executive
    return (
        <div className={`w-full h-full bg-white p-[8%] flex flex-col ${className}`}>
            <div className="flex justify-between items-end mb-[4%]">
                <div className="w-[55%] h-[4.5%] bg-slate-900 tracking-tight"></div>
                <div className="flex flex-col items-end gap-[8%] w-[40%]">
                    <div className="w-[45%] h-[1.2%] bg-slate-400"></div>
                    <div className="w-[60%] h-[1.2%] bg-slate-400 mt-[3%]"></div>
                    <div className="w-[50%] h-[1.2%] bg-slate-400 mt-[3%]"></div>
                </div>
            </div>
            
            <div className="w-full h-[1.5px] bg-slate-200 mb-[6%]"></div>
            
            <div className="flex gap-[6%] mb-[6%]">
                <div className="w-[20%] h-[2%] bg-slate-800 uppercase text-right tracking-widest shrink-0 mt-[1%]"></div>
                <div className="flex-1 flex flex-col gap-[2%]">
                    <div className="w-full h-[1.2%] bg-slate-400"></div>
                    <div className="w-[95%] h-[1.2%] bg-slate-400 mt-[1.5%]"></div>
                    <div className="w-[85%] h-[1.2%] bg-slate-400 mt-[1.5%]"></div>
                </div>
            </div>

            <div className="flex gap-[6%]">
                <div className="w-[20%] h-[2%] bg-slate-800 uppercase text-right tracking-widest shrink-0 mt-[1%]"></div>
                <div className="flex-1 flex flex-col gap-[2%]">
                    <div className="flex justify-between mb-[1%]">
                        <div className="w-[50%] h-[2%] bg-slate-800 font-semibold"></div>
                        <div className="w-[25%] h-[1.5%] bg-slate-400"></div>
                    </div>
                    <div className="w-[40%] h-[1.5%] bg-slate-500 mb-[2%] italic"></div>
                    
                    <div className="flex items-start gap-[3%] mt-[1%]">
                        <div className="w-[2%] aspect-square bg-slate-400 rounded-full mt-[1.5%]"></div>
                        <div className="w-[95%] h-[1.2%] bg-slate-400"></div>
                    </div>
                    <div className="flex items-start gap-[3%] mt-[1.5%]">
                        <div className="w-[2%] aspect-square bg-slate-400 rounded-full mt-[1.5%]"></div>
                        <div className="w-[85%] h-[1.2%] bg-slate-400"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResumeDashboard = () => {
    const { user } = useUser()
    const { getToken } = useAuth()
    const navigate = useNavigate()
    const { backendUrl, userData } = useContext(AppContext)
    
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const [resumeToDelete, setResumeToDelete] = useState(null)
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false)
    const [isResumesScrollable, setIsResumesScrollable] = useState(false)
    
    // Upload State
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedFileName, setUploadedFileName] = useState("")
    const [extractedData, setExtractedData] = useState(null)
    const [showVideo, setShowVideo] = useState(false)
    
    // Draggable Video State
    const [videoPos, setVideoPos] = useState({ x: window.innerWidth / 2 - 350, y: window.innerHeight / 2 - 200 })
    const [isDragging, setIsDragging] = useState(false)
    const dragOffset = useRef({ x: 0, y: 0 })
    
    const fileInputRef = useRef(null)

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            setVideoPos({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            });
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid PDF or DOCX file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit.");
            return;
        }

        setUploadedFileName(file.name);
        setIsUploading(true);
        const toastId = toast.loading("Analyzing and extracting your resume...");

        try {
            const formData = new FormData();
            formData.append('resumeFile', file);

            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/resumes/upload`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success && data.extractedData) {
                toast.update(toastId, { render: "Extraction successful!", type: "success", isLoading: false, autoClose: 2000 });
                setIsCreationModalOpen(false);
                // Instead of showing the modal, directly proceed to the editor
                await handleContinueEditing(data.extractedData);
            } else {
                toast.update(toastId, { render: data.message || "Extraction failed.", type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            console.error(error);
            toast.update(toastId, { render: error.response?.data?.message || "An error occurred during upload.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleContinueEditing = async (directData = null) => {
        const dataToProcess = directData || extractedData;
        if (!dataToProcess) return;
        
        try {
            const toastId = toast.loading("Preparing your workspace...");
            const token = await getToken();
            
            // Create a new resume with the extracted data immediately
            const { data } = await axios.post(`${backendUrl}/api/resumes`, {
                ...dataToProcess,
                isImport: true,
                resumeName: dataToProcess.personalInfo?.fullName ? `${dataToProcess.personalInfo.fullName} Resume` : "Imported Resume",
                template: "ATS Classic"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.update(toastId, { render: "Workspace ready!", type: "success", isLoading: false, autoClose: 2000 });
                setExtractedData(null);
                navigate(`/resumes/build/${data.resume._id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to prepare workspace.");
        }
    };

    const fetchResumes = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await axios.get(backendUrl + '/api/resumes', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setResumes(data.resumes)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load resumes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchResumes()
        }
    }, [user])

    const createNewResume = async () => {
        try {
            const toastId = toast.loading("Creating new resume...")
            const token = await getToken()
            const { data } = await axios.post(backendUrl + '/api/resumes', {
                ...defaultResumeData,
                isImport: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.dismiss(toastId)
                navigate(`/resumes/build/${data.resume._id}`)
            }
        } catch (error) {
            toast.dismiss()
            toast.error("Failed to create resume")
        }
    }

    const handleDelete = async () => {
        if (!resumeToDelete) return;
        try {
            const token = await getToken()
            const { data } = await axios.delete(backendUrl + `/api/resumes/${resumeToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success("Resume deleted")
                fetchResumes()
            }
        } catch (error) {
            toast.error("Failed to delete resume")
        } finally {
            setResumeToDelete(null)
        }
    }

    const duplicateResume = async (id, e) => {
        e.stopPropagation();
        try {
            const token = await getToken()
            const { data } = await axios.post(backendUrl + `/api/resumes/${id}/duplicate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success("Resume duplicated")
                fetchResumes()
            }
        } catch (error) {
            toast.error("Failed to duplicate resume")
        }
    }

    const downloadPdf = async (id, name, e) => {
        e.stopPropagation();
        try {
            const toastId = toast.loading("Generating PDF...")
            const token = await getToken()
            const response = await axios.post(backendUrl + `/api/resumes/${id}/pdf`, {}, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.update(toastId, { render: "PDF Downloaded", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.dismiss()
            toast.error("Failed to generate PDF. Make sure all content is valid.")
        }
    }

    if (loading && resumes.length === 0) return <Loading />

    return (
        <div className="flex-1 bg-gray-50 min-h-screen w-full">
            {/* Top Navigation removed as requested */}
            <div className="w-full px-4 lg:px-6 py-6 lg:py-8">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-10 bg-gradient-to-br from-[#F0F5FF] via-[#FFFFFF] to-[#FFFBF2] p-10 lg:p-16 min-h-[400px] lg:min-h-[460px] rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden group/hero">
                    
                    {/* Background decoration orbs / subtle particles (Optimized) */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-200/20 via-purple-100/10 to-transparent rounded-full opacity-40 -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-yellow-100/30 rounded-full mix-blend-multiply"></div>
                    <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-emerald-50/40 rounded-full mix-blend-multiply"></div>

                    <div className="flex-1 relative z-10 lg:pr-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100/80 text-blue-600 text-xs font-bold mb-6 shadow-sm hover:shadow-md transition-shadow cursor-default">
                            <Sparkles size={14} /> Build Your Future
                        </div>
                        <h1 className="text-4xl lg:text-[46px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5">
                            AI Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-indigo-500 drop-shadow-[0_2px_12px_rgba(37,99,235,0.2)]">Builder</span>
                        </h1>
                        <p className="text-gray-600 text-lg font-medium max-w-xl mb-10 leading-relaxed">
                            Create, manage, and tailor your professional resumes with the power of AI.
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 flex-wrap mb-10" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center gap-3 group cursor-default">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
                                    <Zap size={18} fill="currentColor" strokeWidth={0} />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-bold text-gray-900">AI-Powered Suggestions</h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Get smart content recommendations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 group cursor-default">
                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300">
                                    <FileCheck size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-bold text-gray-900">ATS-Friendly Templates</h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Increase your interview chances</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 group cursor-default">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-300">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-bold text-gray-900">Professional & Modern</h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Stand out from the crowd</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 z-20 relative" style={{ animationDelay: '0.2s' }}>
                            <button onClick={() => setIsCreationModalOpen(true)} className="bg-gradient-to-r from-[#2563EB] to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 transition-all hover:-translate-y-1 w-full sm:w-auto text-[15px]">
                                <Plus size={18} strokeWidth={3} /> Create New Resume <ChevronRight size={16} className="ml-1 opacity-80" />
                            </button>
                            <button onClick={() => setShowVideo(true)} className="bg-white/90 backdrop-blur-sm hover:bg-blue-50/50 text-gray-700 font-bold py-3.5 px-6 rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 w-full sm:w-auto text-[15px] group">
                                <div className="text-[#2563EB] flex items-center justify-center w-5 h-5 rounded-full pl-0.5 bg-blue-50 border border-blue-100 group-hover:scale-110 group-hover:shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                                Watch How It Works
                            </button>
                        </div>
                        
                        {/* Trust badge */}
                        <div className="flex items-center gap-3 mt-8 relative z-20" style={{ animationDelay: '0.3s' }}>
                            <div className="flex -space-x-2">
                                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=1" alt="user" />
                                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=2" alt="user" />
                                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=3" alt="user" />
                                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=4" alt="user" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center text-amber-400 gap-0.5">
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                </div>
                                <span className="text-[11px] font-medium text-gray-500 mt-0.5">Trusted by <span className="text-gray-900 font-bold">1M+</span> job seekers</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto relative z-10 flex flex-col items-center lg:items-end mt-12 lg:mt-0 lg:ml-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative mb-6">
                            {/* Decorative squiggles */}
                            <svg className="absolute -top-8 -left-4 text-amber-400 w-10 h-10 -rotate-12 animate-[pulse_4s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v-4a4 4 0 0 1 4-4h0M14 4h4a4 4 0 0 1 4 4v0"/></svg>
                            <svg className="absolute -bottom-10 right-10 text-amber-400 w-20 h-20 animate-[pulse_5s_ease-in-out_infinite] mix-blend-multiply opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20c4-8 12-8 16-8M16 8l4 4-4 4"/></svg>
                            
                            {/* Background Card */}
                            <div className="w-64 h-[340px] bg-white/60 backdrop-blur-sm shadow-xl border border-white/50 rounded-2xl p-4 rotate-3 transform origin-bottom-right opacity-90 absolute top-0 left-4 group-hover/hero:rotate-6 group-hover/hero:scale-105 transition-all duration-700 ease-out"></div>
                            
                            {/* Foreground Card */}
                            <div className="w-64 h-[340px] bg-white/95 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/80 rounded-2xl p-6 -rotate-3 transform origin-bottom-left relative z-10 flex flex-col group-hover/hero:rotate-0 group-hover/hero:scale-105 transition-all duration-700 ease-out cursor-default">
                                <div className="flex gap-4 mb-8 items-center">
                                    <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB]">
                                        <User size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[15px] font-bold text-gray-800 mb-1.5">Your Resume</div>
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-5 flex-1">
                                    <div>
                                        <div className="w-24 h-4 bg-[#2563EB] rounded mb-3"></div>
                                        <div className="w-full h-2.5 bg-[#E2E8F0] rounded mb-2"></div>
                                        <div className="w-full h-2.5 bg-[#E2E8F0] rounded mb-2"></div>
                                        <div className="w-3/4 h-2.5 bg-[#E2E8F0] rounded"></div>
                                    </div>
                                    <div className="pt-2">
                                        <div className="w-16 h-4 bg-[#60A5FA] rounded mb-3"></div>
                                        <div className="w-full h-2.5 bg-[#E2E8F0] rounded mb-2"></div>
                                        <div className="w-full h-2.5 bg-[#E2E8F0] rounded mb-2"></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating decoration text - Post it note */}
                            <div className="absolute -left-12 bottom-12 -rotate-12 bg-[#FFFDF0] px-4 py-3 rounded-lg shadow-lg shadow-amber-500/10 border border-amber-100/50 z-20 flex flex-col items-center animate-float hover:scale-110 transition-transform cursor-default">
                                <div className="text-[14px] font-writing font-bold text-gray-800 leading-snug text-center">
                                    Create<br/>Edit<br/>Download<br/>Apply!
                                </div>
                                <div className="absolute -bottom-3 right-0 text-[#2563EB]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </div>
                            </div>
                            
                            {/* Side floating badge */}
                            <div className="absolute -right-12 top-16 bg-white/90 backdrop-blur-md px-4 py-3 rounded-[14px] shadow-[0_8px_25px_rgba(37,99,235,0.12)] border border-blue-50/50 z-20 animate-float-delayed hover:scale-110 transition-transform cursor-default">
                                <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-[13px] text-center leading-snug">Land Your<br/>Dream Job<br/>Faster! <span className="text-[16px] drop-shadow-md">🚀</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Create/List Resumes */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                        
                        {/* Dynamic Resume Area */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-center min-h-[400px] relative overflow-hidden">
                            
                            {resumes.length === 0 ? (
                                /* Empty State */
                                <div className="text-center max-w-md mx-auto relative z-10">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <FileText size={32} />
                                        <Plus size={20} className="absolute ml-8 mt-8 bg-white rounded-full text-blue-600 p-0.5" />
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Create Your First Resume</h2>
                                    <p className="text-sm text-gray-500 font-medium mb-8">Start building a professional resume with AI assistance. Choose from templates or start from scratch.</p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                                        <button onClick={() => setIsCreationModalOpen(true)} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                            <Plus size={18} /> Create New Resume
                                        </button>
                                        <button className="bg-white text-gray-700 border border-gray-200 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                            <Upload size={18} /> Upload Existing Resume
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* List Resumes State */
                                <div className="flex flex-col w-full h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900 leading-tight">Your Resumes</h2>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">Manage and edit your resumes</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsCreationModalOpen(true)} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 border border-blue-100 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-[10px] transition-colors">
                                            <Plus size={16} /> New Resume
                                        </button>
                                    </div>
                                    <div 
                                        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar relative transition-all duration-300 group/scroll flex-1 ${isResumesScrollable ? 'overflow-y-auto max-h-[500px] pr-2' : 'overflow-hidden max-h-[320px] cursor-pointer'}`}
                                        onClick={() => !isResumesScrollable && setIsResumesScrollable(true)}
                                    >
                                        {!isResumesScrollable && resumes.length > 2 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-4 z-10 pointer-events-none">
                                                <button className="pointer-events-auto text-[12px] font-bold text-[#2563EB] bg-blue-50 border border-blue-100 shadow-sm px-4 py-1.5 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-opacity flex items-center gap-1 hover:bg-blue-100">
                                                    Click to scroll <ChevronDown size={14}/>
                                                </button>
                                            </div>
                                        )}
                                        {resumes.map(resume => (
                                            <div key={resume._id} onClick={() => navigate(`/resumes/build/${resume._id}`)} className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-2xl p-4 flex flex-col cursor-pointer transition-all duration-200 group h-[150px]">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0 shadow-sm relative">
                                                        <TemplateThumbnail type={resume.template} />
                                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{resume.resumeName}</h3>
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">{resume.template}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><TimeIcon size={10}/> {moment(resume.updatedAt).fromNow()}</p>
                                                            </div>
                                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={(e) => duplicateResume(resume._id, e)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Duplicate"><Copy size={14} /></button>
                                                                <button onClick={(e) => { e.stopPropagation(); setResumeToDelete(resume._id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-auto border-t border-gray-100 pt-3 flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/resumes/build/${resume._id}`) }} className="flex-1 bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 font-bold py-1.5 rounded-[10px] flex items-center justify-center gap-1.5 transition text-[11px] shadow-sm">
                                                        <Edit3 size={12} /> Edit
                                                    </button>
                                                    <button onClick={(e) => downloadPdf(resume._id, resume.resumeName, e)} className="flex-[1.5] bg-blue-50/80 hover:bg-blue-100 text-blue-600 font-bold py-1.5 rounded-[10px] flex items-center justify-center gap-1.5 transition text-[11px] shadow-sm border border-blue-100/50">
                                                        <Download size={12} strokeWidth={2.5} /> Download PDF
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Separator / Alternative (Only show if empty or push to bottom) */}
                            {resumes.length === 0 && (
                                <>
                                    <div className="flex items-center justify-center gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest my-6">
                                        <div className="h-px bg-gray-200 w-12"></div>
                                        OR
                                        <div className="h-px bg-gray-200 w-12"></div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between mx-auto w-full max-w-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition cursor-pointer" onClick={() => createNewResume()}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">Build from Your Profile</h4>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">Use your existing profile information</p>
                                            </div>
                                        </div>
                                        <div className="text-blue-600 font-bold text-sm flex items-center gap-1">
                                            Use My Profile <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Career Insights & Resume Tips */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                        <Zap size={16} fill="currentColor" strokeWidth={0} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Career Insights</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">Tips to stand out to recruiters</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                <div className="bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/50 p-5 rounded-2xl flex flex-col gap-3 group hover:border-blue-200 transition-colors cursor-default">
                                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                        <FileCheck size={16} /> ATS Optimization
                                    </div>
                                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">Use standard section headings like "Experience" and "Education". Avoid using complex formatting that ATS systems can't read.</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/50 p-5 rounded-2xl flex flex-col gap-3 group hover:border-emerald-200 transition-colors cursor-default">
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                        <Briefcase size={16} /> Action Verbs
                                    </div>
                                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">Start bullet points with strong action verbs (e.g., Achieved, Developed) rather than passive phrases like "Responsible for".</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50/50 to-white border border-purple-100/50 p-5 rounded-2xl flex flex-col gap-3 group hover:border-purple-200 transition-colors cursor-default">
                                    <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                                        <TrendingUp size={16} /> Quantify Results
                                    </div>
                                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">Numbers speak louder than words. Mention specific percentages, revenue growth, or time saved to prove your exact impact.</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50/50 to-white border border-amber-100/50 p-5 rounded-2xl flex flex-col gap-3 group hover:border-amber-200 transition-colors cursor-default">
                                    <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                                        <ShieldCheck size={16} /> Tailor for the Job
                                    </div>
                                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">Don't use a generic resume for every application. Mirror the keywords and skills found directly in the job description.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Templates & Info */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        
                        {/* Resume Templates Grid */}
                        <div className="bg-white border border-gray-100 rounded-[24px] p-6 lg:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Layout size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Resume Templates</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">Professional, ATS-friendly designs</p>
                                    </div>
                                </div>
                                <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    View All <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Template Mockups */}
                                {['ATS Classic', 'Modern Professional', 'Tech Professional', 'Minimal Executive'].map((tplName, i) => {
                                    const isActive = tplName === 'ATS Classic';
                                    return (
                                    <div key={i} className="flex flex-col group">
                                        <div onClick={() => createNewResume(tplName)} className={`cursor-pointer aspect-[1/1.3] rounded-xl border-2 transition-all relative overflow-hidden mb-3 flex flex-col shadow-sm ${isActive ? 'border-[#2563EB] ring-4 ring-blue-50 shadow-blue-100' : 'border-gray-100 hover:border-gray-300'} bg-white`}>
                                            <TemplateThumbnail type={tplName} />
                                            {isActive && <div className="absolute bottom-3 right-3 bg-[#2563EB] rounded-full shadow-md"><CheckCircle2 size={20} className="text-white p-1" strokeWidth={3} /></div>}
                                        </div>
                                        <p className="text-center text-[11px] font-bold text-gray-800 mb-3">{tplName}</p>
                                        {isActive ? (
                                            <button onClick={() => createNewResume(tplName)} className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-[11px] transition-colors shadow-sm">Use Template</button>
                                        ) : (
                                            <button onClick={() => createNewResume(tplName)} className="w-full bg-white hover:bg-blue-50 text-[#2563EB] font-bold py-2.5 rounded-xl border border-blue-100 text-[11px] transition-colors shadow-sm opacity-0 group-hover:opacity-100">Preview</button>
                                        )}
                                    </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Why Use Feature List */}
                        <div className="bg-white border border-gray-100 rounded-[24px] p-6 lg:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Star size={18} className="text-amber-500 fill-amber-500" />
                                    <h3 className="text-lg font-bold text-gray-900">Why Use Our AI Resume Builder?</h3>
                                </div>
                                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Learn More &rarr;</button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                                        <TimeIcon size={16} />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Save Time</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Generate content in seconds</p>
                                </div>
                                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                                        <Sparkles size={16} />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Better Results</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">AI-optimized for job applications</p>
                                </div>
                                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                                        <FileCheck size={16} />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">ATS Friendly</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Designed for recruiter systems</p>
                                </div>
                                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                                        <FileType size={16} />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Multiple Formats</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Download as PDF & more</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Quote */}
                <div className="mt-12 text-center pb-12">
                    <p className="text-sm font-medium text-blue-600/80 italic font-serif relative inline-block">
                        <span className="text-2xl text-blue-300 absolute -left-6 -top-2 leading-none">"</span>
                        A great resume opens doors. A better resume creates opportunities.
                        <span className="text-2xl text-blue-300 absolute -right-6 top-1 leading-none">"</span>
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {resumeToDelete && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-sm w-full relative transform transition-all border border-gray-100">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 mx-auto border border-red-100">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Resume?</h3>
                        <p className="text-[13px] font-medium text-gray-500 text-center mb-8 leading-relaxed">This action cannot be undone. Are you sure you want to delete this resume permanently?</p>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setResumeToDelete(null)} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-[12px] border border-gray-200 transition-colors shadow-sm text-sm">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-[12px] transition-colors shadow-[0_4px_12px_rgba(220,38,38,0.2)] text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Creation Selection Modal */}
            {isCreationModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8 animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 lg:p-12 max-w-[1100px] w-full relative border border-gray-100 my-8 overflow-hidden">
                        
                        {/* Background blobs inside modal */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

                        <button onClick={() => setIsCreationModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white border border-gray-100 hover:bg-gray-50 text-gray-500 rounded-full shadow-sm transition-colors z-20">
                            <X size={20} strokeWidth={2.5} />
                        </button>
                        
                        {/* Top Badge */}
                        <div className="text-center mb-6 mt-2 relative z-10 flex justify-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-100 shadow-sm text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                <Sparkles size={16} className="text-purple-500" /> Build Your Professional Story
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="text-center mb-12 relative z-10">
                            <h2 className="text-4xl lg:text-[42px] font-extrabold text-slate-900 mb-4 tracking-tight">
                                How would you like to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-blue-500">start?</span>
                            </h2>
                            <p className="text-gray-500 font-medium text-[15px] max-w-xl mx-auto leading-relaxed">
                                Choose the fastest way to build your professional resume. Our AI is ready to help you stand out and land your dream job.
                            </p>
                            
                            {/* Floating Top Left Note */}
                            <div className="hidden lg:flex absolute -left-4 top-0 -rotate-12 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 items-start gap-3 w-48">
                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 mt-1">
                                    <CheckCircle2 size={18} className="text-white" />
                                </div>
                                <div className="text-[13px] font-bold text-gray-700 leading-tight text-left">
                                    Better<br/>Resume<br/>Brighter<br/>Future
                                </div>
                            </div>
                            
                            {/* Floating Curved Text Right */}
                            <div className="hidden lg:block absolute -right-6 -top-4 rotate-12 text-blue-400 font-writing text-lg leading-tight text-center">
                                Your<br/>Next Opportunity<br/>Starts Here!
                                <svg className="w-8 h-8 mx-auto mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9l-6 6 6 6"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                            
                            {/* Floating Curved Text Left (Bottom of cards) */}
                            <div className="hidden lg:block absolute -left-16 bottom-16 -rotate-12 text-blue-400 font-writing text-lg leading-tight text-center">
                                Same<br/>Skills<br/>Bigger<br/>Opportunities
                                <svg className="w-8 h-8 mx-auto mt-1 -rotate-90 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9l-6 6 6 6"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
                            </div>

                            {/* Option 1: AI Resume Builder */}
                            <div onClick={() => { toast.info("AI Builder coming soon!"); setIsCreationModalOpen(false); }} className="group relative bg-white rounded-[28px] border-2 border-[#8B5CF6] shadow-[0_10px_30px_rgba(139,92,246,0.15)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.25)] p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 mt-6 lg:mt-0">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1.5">
                                    <Star size={12} className="fill-white" /> RECOMMENDED
                                </div>
                                
                                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                                    <Wand2 size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3">AI Resume Builder</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-6">Generate a perfectly tailored resume instantly by describing your role and experience.</p>
                                
                                <div className="flex flex-col gap-3 w-full text-left mb-8">
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">AI-powered content</span></div>
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">Job-specific tailoring</span></div>
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">Professional & ATS-friendly</span></div>
                                </div>

                                <div className="mt-auto w-full">
                                    <div className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white font-bold py-3.5 rounded-[14px] transition-colors flex items-center justify-center gap-2 shadow-md">
                                        Start with AI <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Option 2: Manually Create */}
                            <div onClick={() => { createNewResume(); setIsCreationModalOpen(false); }} className="group relative bg-white rounded-[28px] border border-gray-100 hover:border-blue-200 p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 mt-4 lg:mt-0">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#3B82F6] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                                    <FileText size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3">Create Manually</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-6">Start from a blank professional template and enter your details step by step.</p>
                                
                                <div className="flex flex-col gap-3 w-full text-left mb-8">
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">Choose from templates</span></div>
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">Full control over content</span></div>
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">Customize your design</span></div>
                                </div>

                                <div className="mt-auto w-full">
                                    <div className="w-full bg-blue-50 hover:bg-blue-100 text-[#3B82F6] font-bold py-3.5 rounded-[14px] transition-colors flex items-center justify-center gap-2">
                                        Start Blank <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Option 3: Update Existing */}
                            <div onClick={() => { if(!isUploading) fileInputRef.current?.click(); }} className={`group relative bg-white rounded-[28px] border border-gray-100 p-8 flex flex-col items-center text-center transition-all duration-300 relative ${isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:border-emerald-200 cursor-pointer hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1'}`}>
                                <input type="file" ref={fileInputRef} hidden accept=".pdf,.docx" onChange={handleFileUpload} />
                                
                                {/* Right Side Badges for layout visual */}
                                <div className="hidden lg:flex absolute -right-28 top-20 flex-col gap-3 pointer-events-none">
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2.5 px-4 flex items-center gap-3 rotate-3 transform hover:scale-105 transition-transform"><div className="w-7 h-7 bg-blue-50 text-[#3B82F6] rounded-lg flex items-center justify-center"><Briefcase size={14}/></div><span className="text-[13px] font-extrabold text-gray-800">Get Hired</span></div>
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2.5 px-4 flex items-center gap-3 -rotate-2 transform hover:scale-105 transition-transform"><div className="w-7 h-7 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center"><Layout size={14}/></div><span className="text-[13px] font-extrabold text-gray-800">Grow Faster</span></div>
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2.5 px-4 flex items-center gap-3 rotate-2 transform hover:scale-105 transition-transform"><div className="w-7 h-7 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center"><Star size={14} className="fill-amber-500"/></div><span className="text-[13px] font-extrabold text-gray-800">Achieve More</span></div>
                                </div>

                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                                    {isUploading ? <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div> : <Upload size={28} strokeWidth={2.5} />}
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{isUploading ? "Uploading..." : "Update Resume"}</h3>
                                <div className="text-[13px] text-gray-500 font-medium leading-relaxed mb-6 w-full px-4 text-center flex justify-center">
                                    {isUploading && uploadedFileName ? (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg py-2 px-3 flex items-center justify-center gap-2 text-emerald-700 max-w-full">
                                            <FileText size={16} className="shrink-0" />
                                            <span className="truncate font-semibold">{uploadedFileName}</span>
                                        </div>
                                    ) : "Upload an existing resume and let our AI parse and format it automatically."}
                                </div>
                                
                                <div className="flex flex-col gap-3 w-full text-left mb-8">
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">Auto-extract information</span></div>
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">Improve with AI suggestions</span></div>
                                    <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-[13px] font-semibold text-gray-700">Get ATS-ready format</span></div>
                                </div>

                                <div className="mt-auto w-full">
                                    <div className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold py-3.5 rounded-[14px] transition-colors flex items-center justify-center gap-2">
                                        {isUploading ? "Processing..." : "Upload File"} <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Trust Section */}
                        <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                            <div className="flex items-center gap-4 justify-center md:justify-start">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><ShieldCheck size={20} strokeWidth={2.5} /></div>
                                <div><h4 className="text-[13px] font-extrabold text-gray-900">Your Data is Secure</h4><p className="text-[11px] font-medium text-gray-500 mt-0.5">We keep your information safe</p></div>
                            </div>
                            <div className="flex items-center gap-4 justify-center">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3B82F6] shrink-0"><Zap size={20} strokeWidth={2.5} /></div>
                                <div><h4 className="text-[13px] font-extrabold text-gray-900">Fast & Easy</h4><p className="text-[11px] font-medium text-gray-500 mt-0.5">Create in minutes</p></div>
                            </div>
                            <div className="flex items-center gap-4 justify-center md:justify-end">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3B82F6] shrink-0"><User size={20} strokeWidth={2.5} /></div>
                                <div><h4 className="text-[13px] font-extrabold text-gray-900">Trusted by 1M+ Job Seekers</h4><p className="text-[11px] font-medium text-gray-500 mt-0.5">Join thousands building better careers</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Draggable Floating Video Window (No Backdrop) */}
            {showVideo && (
                <div 
                    className={`fixed z-[100] w-full max-w-[700px] bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-100 flex flex-col ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-default'}`}
                    style={{ 
                        left: `${videoPos.x}px`, 
                        top: `${videoPos.y}px`,
                        // Ensure it doesn't get too big on small screens
                        maxWidth: 'calc(100vw - 32px)',
                        transition: isDragging ? 'none' : 'opacity 0.3s'
                    }}
                >
                    
                    {/* Header Bar (Drag Handle) */}
                    <div 
                        className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[24px] cursor-grab active:cursor-grabbing select-none"
                        onMouseDown={(e) => {
                            setIsDragging(true);
                            dragOffset.current = {
                                x: e.clientX - videoPos.x,
                                y: e.clientY - videoPos.y
                            };
                        }}
                    >
                        <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles size={16} className="text-blue-600" /> Watch How It Works
                        </h3>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent drag start when clicking close
                                setShowVideo(false);
                            }}
                            className="w-8 h-8 hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Flexible Video Player Box */}
                    <div className="p-4 bg-white rounded-b-[24px]">
                        <div className="relative w-full rounded-xl overflow-hidden shadow-inner bg-slate-900 flex items-center justify-center border border-gray-200" style={{ aspectRatio: '16/9' }}>
                            {/* The user will place their video file in the public folder as 'demo_video.mp4' */}
                            <video 
                                src="/demo_video.mp4" 
                                controls 
                                autoPlay 
                                className="absolute inset-0 w-full h-full object-contain bg-black"
                                onError={(e) => {
                                    e.target.onerror = null;
                                }}
                            >
                                Your browser does not support the video tag.
                            </video>
                            
                            {/* Helper text if video is missing */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none -z-10 bg-slate-900">
                                <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-slate-700 shadow-md">
                                    <p className="font-bold text-white mb-2">Video not found</p>
                                    <p className="text-sm text-slate-300">Place video at: <code className="text-amber-400">client/public/demo_video.mp4</code></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResumeDashboard
