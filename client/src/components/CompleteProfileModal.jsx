import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, Upload, MapPin, Phone, GraduationCap, ChevronRight, ChevronLeft, Check, FileText } from 'lucide-react';

const CompleteProfileModal = ({ isOpen, onClose }) => {
    const { backendUrl, userData, setUserData } = useContext(AppContext);
    const { getToken } = useAuth();
    const [step, setStep] = useState(1);
    const [loadingState, setLoadingState] = useState(''); // '', 'uploading', 'saving', 'done'
    
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        city: '',
        college: '',
        skills: [],
    });
    
    // Debug log to trace render and HMR
    console.log("CompleteProfileModal Render, isOpen:", isOpen, "userData.skills:", userData?.skills);

    React.useEffect(() => {
        if (isOpen && userData) {
            setFormData({
                phone: userData.phone || '',
                address: userData.address || '',
                city: userData.city || '',
                college: userData.college || '',
                skills: Array.isArray(userData.skills) ? userData.skills : (typeof userData.skills === 'string' && userData.skills ? userData.skills.split(',').map(s => s.trim()) : []),
            });
            setStep(1);
            setLoadingState('');
        }
    }, [isOpen, userData]);
    
    // File states
    const [resumeFile, setResumeFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [removeResume, setRemoveResume] = useState(false);
    
    // Refs for hidden inputs
    const resumeRef = useRef(null);
    const imageRef = useRef(null);

    const [newSkill, setNewSkill] = useState('');
    const [isExtractingSkills, setIsExtractingSkills] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => setStep(step + 1);
    const handlePrev = () => setStep(step - 1);

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(newSkill.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            }
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    const handleExtractSkills = async () => {
        if (!resumeFile) return toast.warning("Please select a resume file first.");
        setIsExtractingSkills(true);
        try {
            let token = await getToken();
            // Retry once if token is null (Clerk session may not be ready)
            if (!token) {
                await new Promise(r => setTimeout(r, 1000));
                token = await getToken();
            }
            if (!token) {
                toast.error("Session expired. Please refresh the page and try again.");
                return;
            }
            const data = new FormData();
            data.append('resume', resumeFile);
            
            const response = await axios.post(`${backendUrl}/api/users/extract-resume-skills`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success && response.data.skills) {
                const merged = [...new Set([...formData.skills, ...response.data.skills])];
                setFormData({ ...formData, skills: merged });
                toast.success("Skills extracted successfully!");
            } else {
                toast.error("Could not extract skills.");
            }
        } catch (error) {
            toast.error(error.message || "Failed to extract skills.");
        } finally {
            setIsExtractingSkills(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingState('uploading');

        try {
            let token = await getToken();
            // Retry once if Clerk session token is not ready yet
            if (!token) {
                await new Promise(r => setTimeout(r, 1500));
                token = await getToken();
            }
            if (!token) {
                setLoadingState('');
                toast.error("Session expired. Please refresh the page and try again.");
                return;
            }

            const data = new FormData();
            
            data.append('phone', formData.phone);
            data.append('address', formData.address);
            data.append('city', formData.city);
            data.append('college', formData.college);
            data.append('skills', JSON.stringify(formData.skills));
            
            if (removeImage && !imageFile) data.append('removeImage', 'true');
            if (removeResume && !resumeFile) data.append('removeResume', 'true');

            if (resumeFile) data.append('resume', resumeFile);
            if (imageFile) data.append('image', imageFile);

            const response = await axios.post(`${backendUrl}/api/users/complete-profile`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (percentCompleted === 100) {
                        setLoadingState('saving');
                    }
                }
            });

            if (response.data.success) {
                setLoadingState('done');
                toast.success("Profile updated successfully!");
                // Update local context data so the UI reflects changes immediately
                setUserData(response.data.user);
                setTimeout(() => {
                    onClose();
                    setLoadingState('');
                }, 1000);
            } else {
                setLoadingState('');
                toast.error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            setLoadingState('');
            console.error("Profile Update Error:", error);
            toast.error(error.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                    <p className="text-blue-100 text-sm">Stand out to top employers by providing full details.</p>
                    
                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-6">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex items-center gap-2 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 
                                    ${step === num ? 'bg-white text-blue-600 border-white' : 
                                      step > num ? 'bg-blue-400 text-white border-blue-400' : 'border-blue-400 text-blue-200'}`}>
                                    {step > num ? <Check size={16} /> : num}
                                </div>
                                {num < 3 && <div className={`h-1 flex-1 rounded ${step > num ? 'bg-blue-400' : 'bg-blue-800/40'}`}></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Body - Scrollable if needed, but designed to fit */}
                <div className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4 animate-slide-up">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="text-blue-500"/> Personal Details</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 9876543210" 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current City</label>
                                <input 
                                    type="text" 
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Mumbai, Maharashtra" 
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address (Optional)</label>
                                <textarea 
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Your residential address..." 
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-slide-up">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><GraduationCap className="text-blue-500"/> Educational Details</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">College / Institute Name</label>
                                <input 
                                    type="text" 
                                    name="college"
                                    value={formData.college}
                                    onChange={handleInputChange}
                                    placeholder="e.g. VJTI Mumbai, Govt ITI Pune..." 
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                />
                                <p className="text-xs text-gray-500 mt-2">Providing your exact college name helps us match you with campus placement drives.</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-slide-up">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Upload className="text-blue-500"/> Skills & Documents</h3>
                            
                            {/* Skills Section */}
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills (Tags)</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {Array.isArray(formData.skills) && formData.skills.map((skill, idx) => (
                                        <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg shadow-sm">
                                            {skill}
                                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-gray-400 hover:text-red-500 transition"><X size={12}/></button>
                                        </span>
                                    ))}
                                </div>
                                <input 
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                    placeholder="Type a skill and press Enter..."
                                    className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                />
                            </div>
                            
                            {/* Profile Photo Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition cursor-pointer bg-gray-50 group" onClick={() => imageRef.current.click()}>
                                <input type="file" ref={imageRef} hidden accept="image/*" onChange={(e) => { setImageFile(e.target.files[0]); setRemoveImage(false); }} />
                                {imageFile || (userData?.image && !removeImage) ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-blue-500">
                                            <img src={imageFile ? URL.createObjectURL(imageFile) : userData.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">{imageFile ? imageFile.name : 'Existing Photo'}</p>
                                        <div className="flex gap-4 mt-1">
                                            <p className="text-xs text-blue-600 hover:underline">Change Photo</p>
                                            {userData?.image && !imageFile && (
                                                <p className="text-xs text-red-500 hover:underline" onClick={(e) => { e.stopPropagation(); setRemoveImage(true); }}>Remove</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">Upload Professional Photo</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                            </div>

                            {/* Resume Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition cursor-pointer bg-gray-50 group" onClick={() => resumeRef.current.click()}>
                                <input type="file" ref={resumeRef} hidden accept=".pdf,.doc,.docx" onChange={(e) => { setResumeFile(e.target.files[0]); setRemoveResume(false); }} />
                                {resumeFile || (userData?.resume && !removeResume) ? (
                                    <div className="flex flex-col items-center">
                                        <FileText size={32} className="text-blue-600 mb-2" />
                                        <p className="text-sm font-medium text-gray-800">{resumeFile ? resumeFile.name : 'Existing Resume Uploaded'}</p>
                                        <div className="flex gap-4 mt-1">
                                            <p className="text-xs text-blue-600 hover:underline">{resumeFile ? 'Change Resume' : 'Upload New Resume'}</p>
                                            {userData?.resume && !resumeFile && (
                                                <p className="text-xs text-red-500 hover:underline" onClick={(e) => { e.stopPropagation(); setRemoveResume(true); }}>Remove</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                                            <FileText size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">Upload Updated Resume</p>
                                        <p className="text-xs text-gray-500 mt-1">PDF or Word Doc up to 10MB</p>
                                    </div>
                                )}
                            </div>

                            {/* Extract AI Button */}
                            {resumeFile && (
                                <div className="flex justify-center mt-2">
                                    <button 
                                        type="button" 
                                        onClick={handleExtractSkills}
                                        disabled={isExtractingSkills}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-bold hover:bg-purple-100 transition disabled:opacity-50"
                                    >
                                        {isExtractingSkills ? <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div> : <span>✨</span>}
                                        {isExtractingSkills ? 'Extracting...' : 'AI Extract Skills from Resume'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-gray-100 p-6 flex justify-between bg-gray-50 shrink-0">
                    <button 
                        onClick={step === 1 ? onClose : handlePrev} 
                        className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition flex items-center gap-2"
                        disabled={loadingState !== ''}
                    >
                        {step === 1 ? 'Cancel' : <><ChevronLeft size={18}/> Back</>}
                    </button>

                    {step < 3 ? (
                        <button 
                            onClick={handleNext} 
                            className="px-6 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
                        >
                            Next <ChevronRight size={18}/>
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit} 
                            disabled={loadingState !== ''}
                            className={`px-6 py-2.5 rounded-xl font-medium text-white transition shadow-lg flex items-center gap-2 ${loadingState === 'done' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'}`}
                        >
                            {loadingState === 'uploading' && (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                            )}
                            {loadingState === 'saving' && (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                            )}
                            {loadingState === 'done' && (
                                <><Check size={18} className="animate-bounce" /> Done!</>
                            )}
                            {loadingState === '' && (
                                <><Check size={18}/> Complete Profile</>
                            )}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CompleteProfileModal;
