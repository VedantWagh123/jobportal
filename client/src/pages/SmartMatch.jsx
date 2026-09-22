import React, { useState, useRef, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Zap, Search, Loader2, ChevronRight, Target, User, Bookmark, Briefcase, Clock, IndianRupee, Sparkles, TrendingUp, ShieldCheck, Lightbulb, BarChart, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import InlineSkillGapAnalyzer from '../components/InlineSkillGapAnalyzer';
import { assets } from '../assets/assets';

const colorVariants = [
    { bg: 'bg-blue-50/50', border: 'border-blue-100/50', text: 'text-blue-600', iconText: 'text-blue-400', chipBg: 'bg-blue-100/60', chipText: 'text-blue-700', btnBg: 'bg-blue-600 hover:bg-blue-700', hoverBorder: 'hover:border-blue-300/60', glow: 'from-blue-50/50' },
    { bg: 'bg-emerald-50/50', border: 'border-emerald-100/50', text: 'text-emerald-600', iconText: 'text-emerald-400', chipBg: 'bg-emerald-100/60', chipText: 'text-emerald-700', btnBg: 'bg-emerald-500 hover:bg-emerald-600', hoverBorder: 'hover:border-emerald-300/60', glow: 'from-emerald-50/50' },
    { bg: 'bg-orange-50/50', border: 'border-orange-100/50', text: 'text-orange-600', iconText: 'text-orange-400', chipBg: 'bg-orange-100/60', chipText: 'text-orange-700', btnBg: 'bg-orange-500 hover:bg-orange-600', hoverBorder: 'hover:border-orange-300/60', glow: 'from-orange-50/50' },
    { bg: 'bg-purple-50/50', border: 'border-purple-100/50', text: 'text-purple-600', iconText: 'text-purple-400', chipBg: 'bg-purple-100/60', chipText: 'text-purple-700', btnBg: 'bg-purple-600 hover:bg-purple-700', hoverBorder: 'hover:border-purple-300/60', glow: 'from-purple-50/50' },
    { bg: 'bg-pink-50/50', border: 'border-pink-100/50', text: 'text-pink-600', iconText: 'text-pink-400', chipBg: 'bg-pink-100/60', chipText: 'text-pink-700', btnBg: 'bg-pink-500 hover:bg-pink-600', hoverBorder: 'hover:border-pink-300/60', glow: 'from-pink-50/50' },
    { bg: 'bg-cyan-50/50', border: 'border-cyan-100/50', text: 'text-cyan-600', iconText: 'text-cyan-400', chipBg: 'bg-cyan-100/60', chipText: 'text-cyan-700', btnBg: 'bg-cyan-500 hover:bg-cyan-600', hoverBorder: 'hover:border-cyan-300/60', glow: 'from-cyan-50/50' },
];

const getVariant = (id) => {
    if (!id) return colorVariants[0];
    const charCode = id.charCodeAt(id.length - 1);
    return colorVariants[charCode % 6];
};

const SmartMatch = () => {
    const { backendUrl, userData, consumeLumiCredit } = useContext(AppContext);
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Status states
    const [status, setStatus] = useState(() => sessionStorage.getItem('smartMatch_status') || 'idle');
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
    const [tokenClient, setTokenClient] = useState(null);
    
    // Data states
    const [analysisData, setAnalysisData] = useState(() => {
        const saved = sessionStorage.getItem('smartMatch_analysisData');
        return saved ? JSON.parse(saved) : null;
    });
    const [matches, setMatches] = useState(() => {
        const saved = sessionStorage.getItem('smartMatch_matches');
        return saved ? JSON.parse(saved) : [];
    });
    
    useEffect(() => {
        sessionStorage.setItem('smartMatch_status', status);
    }, [status]);
    
    useEffect(() => {
        if (analysisData) {
            sessionStorage.setItem('smartMatch_analysisData', JSON.stringify(analysisData));
        } else {
            sessionStorage.removeItem('smartMatch_analysisData');
        }
    }, [analysisData]);
    
    useEffect(() => {
        if (matches.length > 0) {
            sessionStorage.setItem('smartMatch_matches', JSON.stringify(matches));
        } else {
            sessionStorage.removeItem('smartMatch_matches');
        }
    }, [matches]);
    
    // Skill Gap Analyzer state - initialize from sessionStorage so refresh doesn't lose selected job
    const [selectedGapJob, setSelectedGapJob] = useState(() => {
        const savedMatches = sessionStorage.getItem('smartMatch_matches');
        if (savedMatches) {
            const parsed = JSON.parse(savedMatches);
            return parsed.length > 0 ? parsed[0] : null;
        }
        return null;
    });
    const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
    
    const handleAnalyzeGap = (match) => {
        const isClosing = selectedGapJob?.job._id === match.job._id;
        setSelectedGapJob(isClosing ? null : match);
        
        if (!isClosing) {
            setTimeout(() => {
                const element = document.getElementById('skill-gap-section');
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 100; // 100px offset for padding
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 150); // slight delay to allow rendering
        }
    };

    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            toast.error("Only PDF files are supported.");
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB.");
            return;
        }
        setFile(selectedFile);
    };

    // Google Drive Picker Logic
    useEffect(() => {
        const checkGoogleApi = setInterval(() => {
            if (window.gapi && window.google) {
                clearInterval(checkGoogleApi);
                setIsGoogleApiLoaded(true);
                
                // Initialize Token Client
                try {
                    const client = window.google.accounts.oauth2.initTokenClient({
                        client_id: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
                        scope: 'https://www.googleapis.com/auth/drive.readonly',
                        callback: (tokenResponse) => {
                            if (tokenResponse && tokenResponse.access_token) {
                                openGooglePicker(tokenResponse.access_token);
                            }
                        },
                    });
                    setTokenClient(client);
                } catch (err) {
                    console.error("Error initializing Google Token Client:", err);
                }

                // Load Picker API
                window.gapi.load('client:picker', () => {
                    window.gapi.client.load('drive', 'v3');
                });
            }
        }, 500);

        return () => clearInterval(checkGoogleApi);
    }, []);

    // Dropbox Chooser Logic
    useEffect(() => {
        if (!document.getElementById('dropboxjs')) {
            const script = document.createElement('script');
            script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
            script.id = 'dropboxjs';
            script.setAttribute('data-app-key', import.meta.env.VITE_DROPBOX_APP_KEY || '');
            document.head.appendChild(script);
        }
    }, []);

    const handleGoogleDriveClick = () => {
        if (!import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || !import.meta.env.VITE_GOOGLE_API_KEY) {
            toast.error("Google Drive Integration is not configured yet. Missing API Keys.");
            return;
        }
        if (!isGoogleApiLoaded || !tokenClient) {
            toast.info("Google API is loading, please try again in a moment...");
            return;
        }
        // Request token (triggers popup)
        tokenClient.requestAccessToken({ prompt: 'consent' });
    };

    const openGooglePicker = (token) => {
        const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        view.setMimeTypes('application/pdf');

        const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(token)
            .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
            .setCallback((data) => pickerCallback(data, token))
            .build();
        
        picker.setVisible(true);
    };

    const pickerCallback = async (data, token) => {
        if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs[0];
            const fileId = doc.id;
            const fileName = doc.name;
            const mimeType = doc.mimeType;

            try {
                toast.info("Downloading file from Google Drive...", { autoClose: 2000 });
                const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (!response.ok) throw new Error("Failed to download file from Drive");
                
                const blob = await response.blob();
                const downloadedFile = new File([blob], fileName, { type: mimeType });
                validateAndSetFile(downloadedFile);
                toast.success("File imported successfully!");
            } catch (err) {
                console.error("Error downloading from Drive:", err);
                toast.error("Error downloading file from Google Drive");
            }
        }
    };

    const handleDropboxClick = () => {
        if (!import.meta.env.VITE_DROPBOX_APP_KEY) {
            toast.error("Dropbox Integration is not configured. Missing API Key.");
            return;
        }
        if (!window.Dropbox) {
            toast.info("Dropbox API is loading, please try again in a moment...");
            return;
        }
        
        window.Dropbox.choose({
            success: async (files) => {
                if (files && files.length > 0) {
                    const fileData = files[0];
                    try {
                        toast.info("Downloading file from Dropbox...", { autoClose: 2000 });
                        const response = await fetch(fileData.link);
                        if (!response.ok) throw new Error("Failed to download from Dropbox");
                        const blob = await response.blob();
                        const downloadedFile = new File([blob], fileData.name, { type: 'application/pdf' });
                        validateAndSetFile(downloadedFile);
                        toast.success("File imported successfully!");
                    } catch (err) {
                        console.error("Error downloading from Dropbox:", err);
                        toast.error("Error downloading file from Dropbox");
                    }
                }
            },
            cancel: () => {},
            linkType: "direct",
            multiselect: false,
            extensions: ['.pdf']
        });
    };

    const startAnalysis = async () => {
        if (!file) return;

        consumeLumiCredit(async () => {
            try {
                setStatus('uploading');
                setProgress(15);
                setStatusMessage('Uploading and extracting resume text...');
                
                const formData = new FormData();
                formData.append('resume', file);
                formData.append('userId', userData?._id || "guest");

                const uploadRes = await axios.post(`${backendUrl}/api/smartmatch/analyze`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (!uploadRes.data.success) {
                    throw new Error(uploadRes.data.message || "Failed to analyze resume.");
                }

                const analysis = uploadRes.data.data;
                setAnalysisData(analysis);
                
                setStatus('analyzing');
                setProgress(60);
                setStatusMessage('Normalizing skills and generating embeddings...');
                
                await new Promise(r => setTimeout(r, 1500));

                setStatus('matching');
                setProgress(85);
                setStatusMessage('Searching Vector DB for perfect semantic matches...');

                const matchRes = await axios.post(`${backendUrl}/api/smartmatch/match`, {
                    analysisId: analysis._id
                });

                if (!matchRes.data.success) {
                    throw new Error(matchRes.data.message || "Failed to find matches.");
                }

                await new Promise(r => setTimeout(r, 1000));
                
                const newMatches = matchRes.data.matches;
                setMatches(newMatches);
                // Auto-select removed to prevent unnecessary API quota usage. User must manually click 'Generate Skill Gap'.
                setStatus('complete');
                setProgress(100);
                setStatusMessage('Analysis Complete!');
                toast.success("Successfully found smart matches!");

            } catch (error) {
                console.error(error);
                setStatus('error');
                toast.error(error.response?.data?.message || error.message || "An error occurred.");
                setFile(null); 
            }
        });
    };

    const getCompleteness = () => {
        // Calculate real-time profile completeness based on actual user data
        if (userData) {
            let score = 15; // Base score for account creation
            if (userData.image) score += 10;
            if (userData.resume) score += 20;
            if (userData.skills && userData.skills.length > 0) score += 25;
            if (userData.college) score += 15;
            if (userData.phone) score += 5;
            if (userData.city || userData.address) score += 10;
            return Math.min(score, 100);
        }

        // Fallback to resume analysis if userData is not available
        if (!analysisData || !analysisData.extractedData) return 0;
        let score = 0;
        const d = analysisData.extractedData;
        if (d.summary) score += 20;
        if (d.technicalSkills?.length > 0) score += 20;
        if (d.softSkills?.length > 0) score += 10;
        if (d.experience?.length > 0) score += 30;
        if (d.education?.length > 0) score += 20;
        return score;
    };
    const completenessScore = getCompleteness();

    return (
        <div className="bg-[#F8FAFC] py-8 min-h-screen">
            <div className="w-full px-4 md:px-8 xl:px-12 mx-auto">
                
                {/* Hero Banner */}
                <div className="bg-[#f3f7fd] p-8 md:p-10 xl:p-12 rounded-[32px] mb-8 flex flex-col xl:flex-row items-center justify-between border border-[#e2eaf6] shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
                    
                    {/* Left: Text & Stats */}
                    <div className="xl:w-[45%] relative z-20 text-center xl:text-left">
                        <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-blue-100">
                            <Zap size={14} className="text-blue-600" />
                            <span className="text-[11px] font-black text-blue-700 tracking-wider">LUMI POWERED</span>
                        </div>
                        <h1 className="text-4xl md:text-[52px] font-black text-[#1e293b] mb-5 tracking-tight leading-[1.1]">
                            Lumi <span className="text-blue-600">SmartMatch</span>
                        </h1>
                        <p className="text-[#64748b] text-[15px] font-medium leading-relaxed max-w-lg mx-auto xl:mx-0 mb-10">
                            Upload your resume and let our advanced Lumi analyze your skills, experience, and career profile to match you with the perfect opportunities.
                        </p>
                        
                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center justify-center xl:justify-start gap-6 lg:gap-10">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-full bg-emerald-100/80 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
                                    <Target size={20} className="text-emerald-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-black text-gray-900 text-[19px] leading-none mb-1">95%</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Match Accuracy</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-full bg-indigo-100/80 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
                                    <Zap size={20} className="text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-black text-gray-900 text-[19px] leading-none mb-1">10x</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Faster Search</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3.5 hidden sm:flex">
                                <div className="w-11 h-11 rounded-full bg-orange-100/80 flex items-center justify-center shrink-0 shadow-sm border border-orange-100">
                                    <User size={20} className="text-orange-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-black text-gray-900 text-[19px] leading-none mb-1">500K+</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jobs Mapped</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right: Hand text + Feature List + Illustration */}
                    <div className="xl:w-[55%] mt-12 xl:mt-0 flex flex-col md:flex-row items-center justify-end relative z-10 w-full gap-8">
                        
                        {/* Feature List Card */}
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[24px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] w-full max-w-[300px] shrink-0 relative z-20">
                            
                            {/* Handwritten text anchored to this card */}
                            <div className="absolute top-0 -left-[200px] transform text-blue-500 font-serif italic text-2xl -rotate-12 hidden 2xl:block opacity-80 whitespace-nowrap z-20">
                                Your skills <br/>
                                Your opportunities &rarr;
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4 group cursor-default p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"><Search size={18} strokeWidth={2.5}/></div>
                                    <div>
                                        <span className="block text-[13px] font-extrabold text-gray-900 mb-0.5">Analyze Skills</span>
                                        <span className="block text-[10px] text-gray-500 font-medium leading-tight">Get detailed skill analysis</span>
                                    </div>
                                    <ChevronRight size={14} className="ml-auto text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                                </li>
                                <li className="flex items-center gap-4 group cursor-default p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 rounded-[14px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"><CheckCircle2 size={18} strokeWidth={2.5}/></div>
                                    <div>
                                        <span className="block text-[13px] font-extrabold text-gray-900 mb-0.5">Find Best Matches</span>
                                        <span className="block text-[10px] text-gray-500 font-medium leading-tight">Discover relevant opportunities</span>
                                    </div>
                                    <ChevronRight size={14} className="ml-auto text-emerald-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                                </li>
                                <li className="flex items-center gap-4 group cursor-default p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 rounded-[14px] bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"><AlertTriangle size={18} strokeWidth={2.5}/></div>
                                    <div>
                                        <span className="block text-[13px] font-extrabold text-gray-900 mb-0.5">Identify Skill Gaps</span>
                                        <span className="block text-[10px] text-gray-500 font-medium leading-tight">Know what to learn next</span>
                                    </div>
                                    <ChevronRight size={14} className="ml-auto text-amber-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                                </li>
                                <li className="flex items-center gap-4 group cursor-default p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 rounded-[14px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"><Target size={18} strokeWidth={2.5}/></div>
                                    <div>
                                        <span className="block text-[13px] font-extrabold text-gray-900 mb-0.5">Get Learning Paths</span>
                                        <span className="block text-[10px] text-gray-500 font-medium leading-tight">Personalized recommendations</span>
                                    </div>
                                    <ChevronRight size={14} className="ml-auto text-purple-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                                </li>
                            </ul>
                        </div>
                        
                        {/* Illustration Card */}
                        <div className="hidden md:flex w-full max-w-[320px] h-[360px] bg-gradient-to-br from-white/90 to-blue-50/60 rounded-[32px] border border-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.06)] relative flex-col items-center justify-center shrink-0 overflow-hidden group">
                            {/* Floating visual elements */}
                            <div className="absolute top-8 left-8 w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm -rotate-6 group-hover:-translate-y-2 group-hover:-translate-x-1 transition-transform duration-700 ease-out"><TrendingUp size={20} className="text-purple-600"/></div>
                            <div className="absolute top-12 right-10 w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-sm rotate-12 group-hover:-translate-y-2 group-hover:translate-x-1 transition-transform duration-700 ease-out delay-75"><BarChart size={24} className="text-blue-600"/></div>
                            <div className="absolute bottom-16 right-6 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm -rotate-12 group-hover:-translate-y-1 transition-transform duration-700 ease-out delay-150"><Briefcase size={20} className="text-blue-500"/></div>
                            
                            {/* Main Document Graphic */}
                            <div className="bg-white w-[220px] p-7 rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-50 z-10 relative group-hover:-translate-y-2 transition-transform duration-700 ease-out">
                                <h4 className="font-black text-gray-900 text-[17px] leading-[1.2] text-center mb-6">Great Careers<br/>Start Here</h4>
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2">
                                    <FileText size={32} className="text-white" strokeWidth={1.5} />
                                </div>
                                <div className="w-14 h-2 bg-gray-100 rounded-full mx-auto mt-5"></div>
                                <div className="w-10 h-2 bg-gray-100 rounded-full mx-auto mt-2.5"></div>
                                
                                {/* Glowing orange button */}
                                <div className="absolute -bottom-6 -right-3 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] text-white ring-4 ring-white">
                                    <RefreshCw size={20} />
                                </div>
                                
                                {/* Drawn arrow text anchored to inner card */}
                                <div className="absolute -bottom-16 right-14 text-blue-600 font-serif italic text-[15px] -rotate-12 whitespace-nowrap text-right z-20">
                                    Upload<br/>Analyze<br/>Grow
                                </div>
                                
                                {/* Curved arrow SVG anchored to inner card */}
                                <svg className="absolute -bottom-14 right-2 w-12 h-12 text-blue-500 overflow-visible z-20 opacity-80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M 10 90 Q 70 90 90 20" stroke="currentColor" strokeWidth="3" strokeDasharray="5,5" fill="none" strokeLinecap="round"/>
                                    <path d="M 80 25 L 90 20 L 95 30" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    {/* Background decorations */}
                    <div className="absolute -top-[200px] -right-[100px] w-[500px] h-[500px] bg-gradient-to-br from-blue-200/50 to-purple-200/20 rounded-full blur-[80px] pointer-events-none z-0"></div>
                    <div className="absolute -bottom-[200px] -left-[100px] w-[400px] h-[400px] bg-gradient-to-tr from-indigo-200/40 to-blue-200/20 rounded-full blur-[60px] pointer-events-none z-0"></div>
                </div>

                {/* Upload & Processing States */}
                {status !== 'complete' && (
                    <>
                    <div className="flex flex-col lg:flex-row gap-6 mb-6">
                        {/* Left Column: Upload Area */}
                        <div className="flex-grow bg-white rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col overflow-hidden">
                            {(status === 'idle' || status === 'error') && (
                                <div 
                                    className="p-8 md:p-12 flex flex-col items-center justify-center text-center flex-grow transition-all duration-300"
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect} 
                                        accept="application/pdf"
                                        className="hidden" 
                                    />
                                    
                                    {!file ? (
                                        <>
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5 text-blue-600">
                                                <UploadCloud size={28} strokeWidth={2.5} />
                                            </div>
                                            <h3 className="text-[22px] font-black text-gray-900 mb-2">Click or drag your resume to upload</h3>
                                            <p className="text-[13px] text-gray-500 font-medium mb-8">PDF only. Maximum size 5MB.</p>
                                            
                                            <button 
                                                onClick={() => fileInputRef.current?.click()} 
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] mb-10 w-full max-w-[240px] hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <UploadCloud size={18} /> Upload Resume
                                            </button>
                                            
                                            <div className="flex items-center w-full max-w-md mx-auto mb-8">
                                                <div className="h-px bg-gray-200 flex-1"></div>
                                                <span className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">or</span>
                                                <div className="h-px bg-gray-200 flex-1"></div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                                                <button 
                                                    onClick={handleGoogleDriveClick} 
                                                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 px-4 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm text-[13px]"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144" width="18" height="18"><path fill="#34A853" d="M96 14L41 110l24 42 55-96z"/><path fill="#4285F4" d="M141 93H32l-23 41h108z"/><path fill="#FBBC05" d="M49 13L0 98l23 41 50-86z"/></svg>
                                                    Choose from Drive
                                                </button>
                                                <button 
                                                    onClick={handleDropboxClick} 
                                                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 px-4 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm text-[13px]"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#0061FF"><path d="M12.01 2.375L3.898 7.64l8.112 5.275 8.113-5.275z"/><path d="M3.898 18.193l8.112-5.274-8.112-5.275-8.112 5.275z"/><path d="M20.123 18.193l8.112-5.275-8.112-5.275-8.113 5.275z"/><path d="M12.01 22.375l-8.112-5.275h16.224z"/></svg>
                                                    Choose from Dropbox
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-sm">
                                                <FileText size={36} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{file.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium mb-8">Ready to analyze ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); startAnalysis(); }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
                                            >
                                                <Zap size={20} /> Run Lumi SmartMatch
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {(status === 'uploading' || status === 'analyzing' || status === 'matching') && (
                                <div className="p-12 flex flex-col items-center justify-center relative flex-grow min-h-[400px]">
                                    <div className="relative w-36 h-48 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-center mb-10 shadow-inner overflow-hidden">
                                        <FileText size={56} className="text-blue-300" />
                                        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 shadow-[0_0_12px_3px_rgba(59,130,246,0.5)] animate-scan"></div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                        <Loader2 size={26} className="animate-spin text-blue-600" /> 
                                        {statusMessage}
                                    </h3>
                                    <div className="w-full max-w-md bg-gray-100 h-2.5 rounded-full overflow-hidden mt-6">
                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-lg">
                                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${status === 'uploading' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>Extracting Text</span>
                                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${status === 'analyzing' ? 'bg-purple-100 text-purple-700 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>Lumi Normalization</span>
                                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${status === 'matching' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>Semantic Search</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Right Column: Insights List */}
                        <div className="w-full lg:w-[320px] shrink-0 bg-white rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] border border-gray-100 p-7 flex flex-col h-full">
                            <h3 className="text-[17px] font-extrabold text-gray-900 mb-7">Get Lumi-Powered Insights</h3>
                            <ul className="space-y-5 flex-1">
                                <li className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><Target size={16} strokeWidth={2.5}/></div>
                                    <span className="text-[13px] font-bold text-gray-600">Instant skill analysis</span>
                                </li>
                                <li className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0"><Zap size={16} strokeWidth={2.5}/></div>
                                    <span className="text-[13px] font-bold text-gray-600">Personalized job matches</span>
                                </li>
                                <li className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><AlertTriangle size={16} strokeWidth={2.5}/></div>
                                    <span className="text-[13px] font-bold text-gray-600">Skill gap identification</span>
                                </li>
                                <li className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText size={16} strokeWidth={2.5}/></div>
                                    <span className="text-[13px] font-bold text-gray-600">Learning recommendations</span>
                                </li>
                                <li className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shrink-0"><TrendingUp size={16} strokeWidth={2.5}/></div>
                                    <span className="text-[13px] font-bold text-gray-600">Career growth suggestions</span>
                                </li>
                            </ul>
                            <div className="mt-8 bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center gap-2.5 text-emerald-700 shadow-[0_2px_10px_rgba(16,185,129,0.05)]">
                                <ShieldCheck size={18} className="shrink-0" />
                                <span className="text-[11px] font-bold leading-tight">Your data is secure and confidential</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Search size={20}/></div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-[13px] mb-0.5">Analyze Skills</h4>
                                <p className="text-[11px] text-gray-500 leading-tight">Get a detailed breakdown of your skills and experience.</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 ml-auto shrink-0"/>
                        </div>
                        <div className="bg-white border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 size={20}/></div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-[13px] mb-0.5">Find Best Matches</h4>
                                <p className="text-[11px] text-gray-500 leading-tight">Discover job opportunities that fit your profile.</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 ml-auto shrink-0"/>
                        </div>
                        <div className="bg-white border border-amber-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><AlertTriangle size={20}/></div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-[13px] mb-0.5">Identify Skill Gaps</h4>
                                <p className="text-[11px] text-gray-500 leading-tight">Know what skills you need to learn next.</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 ml-auto shrink-0"/>
                        </div>
                        <div className="bg-white border border-purple-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Target size={20}/></div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-[13px] mb-0.5">Get Learning Paths</h4>
                                <p className="text-[11px] text-gray-500 leading-tight">Receive personalized course recommendations.</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 ml-auto shrink-0"/>
                        </div>
                    </div>
                    
                    {/* Pro Tip Banner */}
                    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-10">
                        <Lightbulb size={18} className="text-amber-500 shrink-0"/>
                        <p className="text-[12px] text-gray-700 font-medium">
                            <strong className="text-gray-900">Pro Tip:</strong> A complete and up-to-date resume increases your chances of getting noticed by top employers.
                        </p>
                        <button className="ml-auto text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0">
                            Resume Tips <ChevronRight size={14}/>
                        </button>
                    </div>
                    </>
                )}

                {/* Results View */}
                {status === 'complete' && analysisData && (
                    <div className="flex flex-col gap-6 pb-20">
                        {/* Two Column Layout: Profile & Jobs */}
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            
                            {/* Profile Card (Left Column) */}
                            <div className="w-full lg:w-[25%] shrink-0 sticky top-8">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Your Profile</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Lumi analyzed from resume</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center gap-4 mb-6">
                                    <div className="relative w-20 h-20 shrink-0 mx-auto">
                                        <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                                            <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className="text-emerald-500" strokeWidth="3" strokeDasharray={`${completenessScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-lg font-black text-gray-900 leading-none">{completenessScore}%</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase leading-tight text-center mt-0.5">Profile<br/>Completeness</span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Top Skills</p>
                                        <div className="flex flex-wrap justify-center gap-1.5">
                                            {(isSkillsExpanded ? analysisData.normalizedSkills : analysisData.normalizedSkills?.slice(0, 6)).map((s, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 text-[10px] font-medium rounded border border-gray-100">{s}</span>
                                            ))}
                                            {!isSkillsExpanded && analysisData.normalizedSkills?.length > 6 && (
                                                <button onClick={() => setIsSkillsExpanded(true)} className="px-2 py-1 text-blue-600 hover:text-blue-700 text-[10px] font-medium transition-colors">+{analysisData.normalizedSkills.length - 6} more</button>
                                            )}
                                            {isSkillsExpanded && analysisData.normalizedSkills?.length > 6 && (
                                                <button onClick={() => setIsSkillsExpanded(false)} className="px-2 py-1 text-gray-400 hover:text-gray-600 text-[10px] font-medium transition-colors">Show less</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => { setStatus('idle'); setFile(null); setAnalysisData(null); setMatches([]); setSelectedGapJob(null); }}
                                    className="w-full py-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2"
                                >
                                    <UploadCloud size={14} /> Scan Another Resume
                                </button>
                            </div>
                        </div>
                        
                        {/* Jobs List (Right Column) */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase size={18} className="text-blue-600" /> Top Recommended Jobs
                                </h3>
                                <button onClick={() => navigate('/jobs')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                                    View All Jobs <ChevronRight size={14} />
                                </button>
                            </div>
                            
                            {matches.length === 0 ? (
                                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                                    <AlertTriangle size={40} className="mx-auto text-yellow-500 mb-4 opacity-80" />
                                    <h4 className="font-bold text-gray-900 text-base mb-2">No strong matches found</h4>
                                    <p className="text-xs text-gray-500">Try updating your skills or uploading a different resume.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {matches.map((match, idx) => {
                                        const variant = getVariant(match.job._id);
                                        return (
                                        <div key={idx} className={`p-5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] border transition-all duration-300 flex flex-col h-full group bg-gradient-to-br to-white/10 ${variant.bg} ${variant.glow} ${
                                            selectedGapJob?.job._id === match.job._id 
                                            ? `border-blue-400 ring-2 ring-blue-50` 
                                            : `${variant.border} ${variant.hoverBorder} hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1`
                                        }`}>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="flex gap-3 items-start cursor-pointer group/company" onClick={() => {navigate(`/company/${match.job.companyId?._id}`); window.scrollTo(0,0);}}>
                                                    <div className='w-12 h-12 bg-white rounded-[14px] shadow-sm border border-gray-100/80 flex items-center justify-center p-2.5 shrink-0 group-hover/company:border-blue-200 transition-colors'>
                                                        <img src={match.job.companyId?.image || assets.default_company} alt="" className="max-h-full max-w-full object-contain" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm leading-tight group-hover/company:text-blue-600 transition-colors cursor-pointer mb-0.5 line-clamp-1">{match.job.title}</h4>
                                                        <p className="text-[11px] text-gray-500 font-medium">{match.job.companyId?.name || "Company"} • {match.job.location}</p>
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-orange-500 transition-colors shrink-0 p-1">
                                                    <Bookmark size={18} className="group-hover:text-orange-400 transition-colors" />
                                                </button>
                                            </div>
                                            
                                            <div className="mb-4 relative z-10">
                                                <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">Score: {match.aiScore}%</span>
                                            </div>
                                            
                                            <div className="flex gap-x-4 gap-y-2 text-[11px] text-gray-500 mb-5 font-medium flex-wrap relative z-10">
                                                <span className="flex items-center gap-1.5"><Clock size={13} className="text-gray-400"/> {match.job.jobType || "Full-time"}</span>
                                                <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-gray-400"/> {match.job.level === 'Senior level' ? '5+ yrs' : match.job.level === 'Mid level' ? '2-4 yrs' : '0-2 yrs'}</span>
                                                <span className="flex items-center gap-1.5"><IndianRupee size={13} className="text-gray-400"/> {match.job.salary || "Not disclosed"}</span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-4 mt-auto relative z-10">
                                                {match.job.skills?.slice(0, 3).map((s, i) => (
                                                    <span key={i} className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide ${variant.chipBg} ${variant.chipText}`}>{s}</span>
                                                ))}
                                                {match.job.skills?.length > 3 && (
                                                    <span className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide ${variant.chipBg} ${variant.chipText}`}>+{match.job.skills.length - 3}</span>
                                                )}
                                            </div>
                                            
                                            <div className="mb-4 relative z-10">
                                                {match.aiScore >= 70 ? (
                                                    <div className="flex items-start gap-1.5 p-2 bg-emerald-50/80 rounded-lg border border-emerald-100/50">
                                                        <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                                                        <p className="text-[10px] font-semibold text-emerald-700 leading-snug">Strong match. You have a high chance of selection. Apply now!</p>
                                                    </div>
                                                ) : match.aiScore >= 50 ? (
                                                    <div className="flex items-start gap-1.5 p-2 bg-amber-50/80 rounded-lg border border-amber-100/50">
                                                        <TrendingUp size={13} className="text-amber-500 mt-0.5 shrink-0" />
                                                        <p className="text-[10px] font-semibold text-amber-700 leading-snug">Good potential. Improve missing skills for a few days before applying.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-1.5 p-2 bg-red-50/80 rounded-lg border border-red-100/50">
                                                        <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
                                                        <p className="text-[10px] font-semibold text-red-700 leading-snug">Needs work. Develop skills first or you might face rejection.</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2 pt-4 border-t border-black/5 relative z-10">
                                                <div className="flex gap-2">
                                                    <button onClick={() => navigate(`/job/${match.job._id}`)} className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                                        View Job
                                                    </button>
                                                    <div className="flex-1 relative group/applybtn">
                                                        <button onClick={() => navigate(`/apply-job/${match.job._id}`)} className={`w-full text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm group-hover/applybtn:shadow-md ${variant.btnBg}`}>
                                                            Apply Now
                                                        </button>
                                                        {match.aiScore < 70 && (
                                                            <div className={`absolute bottom-full right-0 mb-3 w-[260px] p-3.5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover/applybtn:opacity-100 group-hover/applybtn:visible transition-all duration-300 z-50 pointer-events-none transform translate-y-2 group-hover/applybtn:translate-y-0 border ${match.aiScore >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                                                <div className="flex items-start gap-3">
                                                                    {match.aiScore >= 50 ? (
                                                                        <div className="bg-amber-100 p-1.5 rounded-full shrink-0 mt-0.5">
                                                                            <TrendingUp size={16} className="text-amber-600" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-red-100 p-1.5 rounded-full shrink-0 mt-0.5">
                                                                            <AlertTriangle size={16} className="text-red-600" />
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <h5 className={`font-bold text-[13px] mb-1 leading-none ${match.aiScore >= 50 ? 'text-amber-800' : 'text-red-800'}`}>
                                                                            {match.aiScore >= 50 ? 'Partial Skills Match' : 'High Rejection Risk'}
                                                                        </h5>
                                                                        <p className={`text-[11px] leading-relaxed font-medium ${match.aiScore >= 50 ? 'text-amber-700/90' : 'text-red-700/90'}`}>
                                                                            {match.aiScore >= 50 
                                                                                ? 'Good potential! Improve your missing skills for a few days to boost your selection chances.' 
                                                                                : "Don't apply yet! Develop the missing skills first to avoid getting rejected."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {/* Arrow pointing down to the button */}
                                                                <div className={`absolute -bottom-[6px] right-10 w-3 h-3 rotate-45 border-r border-b ${match.aiScore >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => selectedGapJob?.job._id === match.job._id ? setSelectedGapJob(null) : handleAnalyzeGap(match)} 
                                                    className={`w-full text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                                        selectedGapJob?.job._id === match.job._id 
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                                        : 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 hover:from-purple-100 hover:to-blue-100 border border-purple-100/50 shadow-[0_2px_8px_rgba(147,51,234,0.05)] hover:shadow-[0_4px_12px_rgba(147,51,234,0.1)]'
                                                    }`}
                                                >
                                                    <Sparkles size={14} className={selectedGapJob?.job._id === match.job._id ? '' : 'text-purple-500'} />
                                                    {selectedGapJob?.job._id === match.job._id ? 'Close Analysis' : 'Generate Skill Gap'}
                                                </button>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* INLINE SKILL GAP SECTION - FULL WIDTH BELOW */}
                    {selectedGapJob && (
                        <div className="w-full mt-4" id="skill-gap-section">
                            <InlineSkillGapAnalyzer 
                                matchScore={selectedGapJob.aiScore} 
                                job={selectedGapJob.job} 
                                missingSkills={selectedGapJob.missingSkills}
                                matchedSkills={selectedGapJob.matchedSkills}
                                analysisId={analysisData._id}
                                onClose={() => setSelectedGapJob(null)}
                            />
                        </div>
                    )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default SmartMatch;
