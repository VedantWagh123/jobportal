import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Play, Clock, UploadCloud, Trash2, Edit2, CheckCircle, FileText, Loader2, AlertCircle, Hash, Layers, Flag, Save } from 'lucide-react';

const LectureManagementDrawer = ({ course, onClose, userToken }) => {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingLectureId, setEditingLectureId] = useState(null);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [lectureNumber, setLectureNumber] = useState(1);
    const [type, setType] = useState('Theory');
    const [duration, setDuration] = useState(20);
    const [status, setStatus] = useState('Published');
    
    // Video upload state
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreviewName, setVideoPreviewName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchLectures();
    }, [course]);

    const fetchLectures = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/institute/management/courses/${course._id}/lectures`, {
                headers: { token: userToken }
            });
            if (data.success) {
                setLectures(data.lectures);
                setLectureNumber(data.lectures.length + 1);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoChange = (e) => {
        setError('');
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // basic check
            if (!file.type.startsWith('video/')) {
                setError('Please select a valid video file.');
                return;
            }
            
            setVideoFile(file);
            setVideoPreviewName(file.name);
        }
    };

    const handleUploadToCloudinary = async (file) => {
        try {
            // 1. Get Signature
            const sigRes = await axios.get('/api/institute/management/cloudinary/signature', {
                headers: { token: userToken }
            });
            
            if (!sigRes.data.success) throw new Error("Failed to get signature");
            
            const { signature, timestamp, cloudName, apiKey } = sigRes.data;
            
            // 2. Upload to Cloudinary directly
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'jobportal_lectures');
            // If we want to strictly limit duration, we can't easily do it BEFORE upload to cloudinary 
            // unless we parse it locally. We will validate after Cloudinary returns the duration.

            const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, formData, {
                withCredentials: false,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            return uploadRes.data;
        } catch (error) {
            console.error("Cloudinary upload error", error);
            let detailedMsg = "Video upload failed.";
            if (error.response) {
                detailedMsg = `Server responded: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                detailedMsg = "Network error: No response received from server. Adblocker or CORS issue?";
            } else {
                detailedMsg = `Error: ${error.message}`;
            }
            throw new Error(detailedMsg);
        }
    };

    const handleAddLecture = async (e) => {
        e.preventDefault();
        setError('');
        
        if (duration > 20) {
            setError('Lecture duration cannot exceed 20 minutes.');
            return;
        }
        
        // Only require video if publishing a NEW lecture, or if no video exists yet.
        // Backend will ultimately validate if a published lecture lacks a video.
        if (status === 'Published' && !videoFile && !editingLectureId) {
            setError('A video file is required for published lectures.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            let videoData = undefined;
            
            if (videoFile) {
                const cloudinaryData = await handleUploadToCloudinary(videoFile);
                
                // Cloudinary returns duration in seconds
                const cloudinaryDurationMins = cloudinaryData.duration / 60;
                
                if (cloudinaryDurationMins > 20) {
                    // It exceeds 20 minutes!
                    // Delete it immediately from cloudinary using our backend if possible (optional cleanup)
                    throw new Error(`Video is too long (${Math.round(cloudinaryDurationMins)} mins). Maximum duration is 20 minutes.`);
                }
                
                videoData = {
                    publicId: cloudinaryData.public_id,
                    secureUrl: cloudinaryData.secure_url,
                    format: cloudinaryData.format,
                    duration: cloudinaryData.duration,
                    resourceType: cloudinaryData.resource_type
                };
            }

            // Save to backend
            const payload = {
                title,
                description,
                lectureNumber: Number(lectureNumber),
                type,
                duration: Number(duration),
                status,
                video: videoData
            };

            if (editingLectureId) {
                const { data } = await axios.put(`/api/institute/management/courses/${course._id}/lectures/${editingLectureId}`, payload, {
                    headers: { token: userToken }
                });
                if (data.success) {
                    setLectures(lectures.map(l => l._id === editingLectureId ? data.lecture : l));
                    setIsAdding(false);
                    resetForm();
                }
            } else {
                const { data } = await axios.post(`/api/institute/management/courses/${course._id}/lectures`, payload, {
                    headers: { token: userToken }
                });
                if (data.success) {
                    setLectures([...lectures, data.lecture]);
                    setIsAdding(false);
                    resetForm();
                }
            }
            
        } catch (err) {
            setError(err.message || 'Failed to save lecture');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteLecture = async (lectureId) => {
        if (!window.confirm("Are you sure you want to delete this lecture?")) return;
        
        try {
            const { data } = await axios.delete(`/api/institute/management/courses/${course._id}/lectures/${lectureId}`, {
                headers: { token: userToken }
            });
            if (data.success) {
                setLectures(lectures.filter(l => l._id !== lectureId));
            }
        } catch (error) {
            alert('Failed to delete lecture');
        }
    };

    const handleEditClick = (lecture) => {
        setTitle(lecture.title);
        setDescription(lecture.description || '');
        setLectureNumber(lecture.lectureNumber);
        setType(lecture.type || 'Theory');
        setDuration(lecture.duration);
        setStatus(lecture.status || 'Published');
        setVideoFile(null);
        setVideoPreviewName('');
        setUploadProgress(0);
        setError('');
        setEditingLectureId(lecture._id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLectureNumber(lectures.length + 1);
        setType('Theory');
        setDuration(20);
        setStatus('Coming Soon');
        setVideoFile(null);
        setVideoPreviewName('');
        setUploadProgress(0);
        setError('');
        setEditingLectureId(null);
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform border-l border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-100">
                        <Play size={18} className="ml-0.5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">Course Lectures</h2>
                        <p className="text-xs text-slate-500 font-medium truncate w-64">{course?.name}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white p-6">
                {!isAdding ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800">{lectures.length} Lectures</h3>
                            <button 
                                onClick={() => { resetForm(); setIsAdding(true); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
                            >
                                + Add Lecture
                            </button>
                        </div>
                        
                        {loading ? (
                            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={30} /></div>
                        ) : lectures.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                                <h4 className="text-slate-700 font-bold mb-1">No lectures yet</h4>
                                <p className="text-xs text-slate-500 mb-4 px-4">Your institute has not added any lectures for this course.</p>
                                <button onClick={() => { resetForm(); setIsAdding(true); }} className="text-blue-600 font-bold text-sm hover:underline">Add your first lecture</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lectures.map(lecture => (
                                    <div key={lecture._id} className="border border-slate-200 rounded-xl p-4 flex gap-4 hover:border-blue-200 transition-colors">
                                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center font-black text-slate-400 text-lg shrink-0">
                                            {String(lecture.lectureNumber).padStart(2, '0')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-bold text-slate-900 truncate">{lecture.title}</h4>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button onClick={() => handleEditClick(lecture)} className="text-slate-400 hover:text-blue-600"><Edit2 size={14}/></button>
                                                    <button onClick={() => handleDeleteLecture(lecture._id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><FileText size={12}/> {lecture.type}</span>
                                                <span className="flex items-center gap-1"><Clock size={12}/> {lecture.duration} mins</span>
                                                {lecture.status === 'Published' ? (
                                                    <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Published</span>
                                                ) : (
                                                    <span className="text-orange-500">Coming Soon</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <button onClick={() => { setIsAdding(false); resetForm(); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><X size={18} /></button>
                            <h3 className="font-bold text-slate-800">{editingLectureId ? 'Edit Lecture' : 'Add New Lecture'}</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium ml-10 mb-6">{editingLectureId ? 'Update lecture details below.' : 'Fill in the details to add a new lecture to this course.'}</p>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleAddLecture} className="space-y-5">
                            <div>
                                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Lecture Title <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText size={16} className="text-slate-400" />
                                    </div>
                                    <input 
                                        type="text" required value={title} onChange={e=>setTitle(e.target.value)}
                                        placeholder="e.g. Introduction to Generative AI"
                                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Lecture Description</label>
                                <div className="relative border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden bg-white">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FileText size={16} className="text-slate-400" />
                                    </div>
                                    <textarea 
                                        rows="3" value={description} onChange={e=>setDescription(e.target.value)} maxLength={500}
                                        placeholder="Briefly describe what this lecture covers..."
                                        className="w-full pl-10 pr-3 py-2.5 text-sm outline-none resize-none placeholder:text-slate-400 bg-transparent"
                                    />
                                    <div className="absolute bottom-2 right-3 text-[10px] font-medium text-slate-400">
                                        {description.length}/500
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Lecture Number <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Hash size={16} className="text-slate-400" />
                                        </div>
                                        <input 
                                            type="number" required min="1" value={lectureNumber} onChange={e=>setLectureNumber(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Lecture Type <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Layers size={16} className="text-slate-400" />
                                        </div>
                                        <select value={type} onChange={e=>setType(e.target.value)} className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white appearance-none cursor-pointer">
                                            <option>Theory</option>
                                            <option>Practical</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Duration (Minutes) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock size={16} className="text-slate-400" />
                                        </div>
                                        <input 
                                            type="number" required min="1" max="20" value={duration} onChange={e=>setDuration(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1.5">Max 20 mins</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Status <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Flag size={16} className="text-slate-400" />
                                        </div>
                                        <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white appearance-none cursor-pointer">
                                            <option>Coming Soon</option>
                                            <option>Published</option>
                                            <option>Draft</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Lecture Video</label>
                                <div 
                                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${videoFile ? 'border-blue-400 bg-blue-50/50' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300'}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {videoFile ? (
                                        <div>
                                            <CheckCircle size={28} className="mx-auto text-blue-500 mb-2" />
                                            <p className="text-sm font-bold text-blue-700 truncate px-4">{videoPreviewName}</p>
                                            <p className="text-xs text-blue-500 mt-1">Click to change</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <UploadCloud size={28} className="mx-auto text-blue-500 mb-2" />
                                            <p className="text-sm font-bold text-slate-900 mb-1">Upload Lecture Video</p>
                                            <p className="text-xs font-medium text-slate-500">Drag & drop a video file or click to choose</p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-1">MP4 / WebM (Max 20 mins)</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleVideoChange} accept="video/mp4,video/webm" className="hidden" />
                            </div>
                            
                            <div className="pt-2 pb-8">
                                <button 
                                    type="submit" 
                                    disabled={isUploading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            {editingLectureId ? 'Update Lecture' : 'Save Lecture'}
                                        </>
                                    )}
                                </button>
                                {isUploading && (
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LectureManagementDrawer;
