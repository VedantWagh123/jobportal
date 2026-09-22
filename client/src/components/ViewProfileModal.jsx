import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import { X, MapPin, Phone, GraduationCap, Mail, FileText, Download, ExternalLink, Edit2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewProfileModal = ({ isOpen, onClose }) => {
    const { userData, setUserData, setIsProfileModalOpen, backendUrl } = useContext(AppContext);
    const { user, getToken } = useUser();
    const [extracting, setExtracting] = React.useState(false);

    if (!isOpen) return null;

    const handleEditClick = () => {
        onClose();
        setIsProfileModalOpen(true);
    };

    const handleExtractSkills = async () => {
        if (!userData?.resume) return toast.error("No resume found to extract skills from");
        try {
            setExtracting(true);
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/users/profile/extract-skills`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setUserData(data.user);
                toast.success("Skills extracted successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to extract skills");
        } finally {
            setExtracting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                
                {/* Header Profile Cover */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition backdrop-blur-md">
                        <X size={20} />
                    </button>
                    
                    {/* Avatar */}
                    <div className="absolute -bottom-12 left-8 p-1.5 bg-white rounded-full shadow-lg">
                        <img 
                            src={userData?.image || user?.imageUrl} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-white"
                        />
                    </div>

                    {/* Edit Button */}
                    <button 
                        onClick={handleEditClick}
                        className="absolute -bottom-6 right-8 px-4 py-2 bg-white text-gray-700 hover:text-blue-600 hover:bg-gray-50 border border-gray-200 rounded-full shadow-sm font-medium text-sm flex items-center gap-2 transition"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                </div>

                {/* Body Content */}
                <div className="px-8 pt-16 pb-8 overflow-y-auto bg-gray-50/50">
                    
                    {/* Name & Title */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
                        <p className="text-gray-500 font-medium">{userData?.college ? `Student at ${userData.college}` : 'Candidate'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Contact Info Card */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h3>
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email Address</p>
                                    <p className="text-sm font-medium text-gray-800 break-all">{user?.primaryEmailAddress?.emailAddress}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                    <p className="text-sm font-medium text-gray-800">{userData?.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-sm font-medium text-gray-800">{userData?.city || 'Not provided'}</p>
                                    {userData?.address && <p className="text-xs text-gray-500 mt-0.5">{userData.address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Education & Resume Card */}
                        <div className="space-y-6">
                            
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Education</h3>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <GraduationCap size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Institute/College</p>
                                        <p className="text-sm font-medium text-gray-800">{userData?.college || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Resume</h3>
                                {userData?.resume ? (
                                    <a 
                                        href={userData.resume ? userData.resume : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-red-50 text-red-500 rounded-lg shrink-0 group-hover:bg-red-100 transition">
                                                <FileText size={20} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700 transition">Candidate_Resume.pdf</p>
                                                <p className="text-xs text-gray-400">Click to view document</p>
                                            </div>
                                        </div>
                                        <div className="p-2 text-gray-400 group-hover:text-blue-600 rounded-lg transition">
                                            <ExternalLink size={20} />
                                        </div>
                                    </a>
                                ) : (
                                    <div className="text-center p-4 border border-dashed border-gray-300 rounded-xl">
                                        <p className="text-sm text-gray-500">No resume uploaded yet.</p>
                                        <button onClick={handleEditClick} className="text-sm text-blue-600 font-medium hover:underline mt-1">Upload now</button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Lumi Extracted Skills */}
                    <div className="mt-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Candidate Skills</h3>
                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 shadow-sm flex items-center gap-1">✨ Lumi Extracted</span>
                            </div>
                            {userData?.resume && (
                                <button 
                                    onClick={handleExtractSkills} 
                                    disabled={extracting}
                                    className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold transition disabled:opacity-50 flex items-center gap-1"
                                >
                                    {extracting ? "Extracting..." : "Re-extract Skills"}
                                </button>
                            )}
                        </div>
                        
                        {userData?.skills && (Array.isArray(userData.skills) ? userData.skills : typeof userData.skills === 'string' ? userData.skills.split(',') : []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(userData.skills) ? userData.skills : typeof userData.skills === 'string' ? userData.skills.split(',').map(s=>s.trim()) : []).map((skill, index) => (
                                    <span key={index} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                <p className="text-sm text-gray-500 mb-1">No skills detected yet.</p>
                                <p className="text-xs text-gray-400">Upload a new resume to auto-extract your skills.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewProfileModal;
