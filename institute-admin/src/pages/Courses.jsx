import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    BookOpen, Plus, Trash2, Loader2, Sparkles, X, 
    Image as ImageIcon, User2, Calendar, MapPin, 
    FileText, Search, GraduationCap, CheckSquare
} from 'lucide-react';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const { user } = useContext(AuthContext);
    
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [durationMonths, setDurationMonths] = useState(3);
    const [location, setLocation] = useState(user?.districtId?.name || 'Online');
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    
    // Thumbnail state (Frontend only preview)
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const fileInputRef = useRef(null);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/institute/management/courses', {
                headers: { token: user.token }
            });
            if (data.success) {
                setCourses(data.courses);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCourses();
            const fetchFreshestLocation = async () => {
                try {
                    const { data } = await axios.get('/api/institute/auth/me', { headers: { token: user.token } });
                    if (data.success && data.institute?.districtId?.name) {
                        setLocation(data.institute.districtId.name);
                    } else if (data.success && data.institute?.districtId && typeof data.institute.districtId === 'string') {
                        setLocation('District ID: ' + data.institute.districtId.substring(0, 4));
                    }
                } catch (e) {
                    console.error("Could not fetch fresh location");
                }
            };
            fetchFreshestLocation();
        }
    }, [user]);

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/institute/management/courses', {
                name, description, durationMonths, location, skills
            }, { headers: { token: user.token } });
            
            if (data.success) {
                setCourses([data.course, ...courses]);
                setIsAdding(false);
                setName('');
                setDescription('');
                setSkills([]);
                setThumbnail(null);
                setThumbnailPreview(null);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add course');
        }
    };

    const handleExtractSkills = async () => {
        if (!description.trim()) return alert("Please enter a course description first.");
        setIsExtracting(true);
        try {
            const { data } = await axios.post('/api/institute/management/extract-skills', 
                { description },
                { headers: { token: user.token } }
            );
            if (data.success && data.skills) {
                const merged = [...new Set([...skills, ...data.skills])];
                setSkills(merged);
            }
        } catch (error) {
            alert("Failed to extract skills via AI.");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            if (!skills.includes(newSkill.trim())) {
                setSkills([...skills, newSkill.trim()]);
            }
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Delete this course?')) return;
        try {
            const { data } = await axios.delete(`/api/institute/management/courses/${id}`, {
                headers: { token: user.token }
            });
            if (data.success) {
                setCourses(courses.filter(c => c._id !== id));
            }
        } catch (error) {
            alert('Failed to delete course');
        }
    };

    const handleThumbnailChange = (e) => {
        if(e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>;

    return (
        <div className="w-full max-w-7xl mx-auto pb-12 text-slate-800 font-sans">
            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Courses & Curriculum</h1>
                    <p className="text-slate-500 mt-1.5 font-medium">Manage the courses your institute offers.</p>
                </div>
                {/* Banner visual */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-4 shadow-sm">
                    <div>
                        <p className="text-blue-900 font-bold text-sm italic">Create Impactful</p>
                        <p className="text-blue-900 font-bold text-sm italic">Courses for a Skilled</p>
                        <p className="text-blue-900 font-bold text-sm italic">Tomorrow</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100/50 rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen size={32} className="text-green-600" />
                    </div>
                </div>
            </div>

            {/* Tabs & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-6">
                    <button className="text-green-600 font-bold border-b-2 border-green-600 pb-2 flex items-center gap-2">
                        <BookOpen size={18} />
                        Courses
                    </button>
                    <button className="text-slate-400 font-medium pb-2 hover:text-slate-600 flex items-center gap-2">
                        <Sparkles size={18} />
                        Curriculum Overview
                    </button>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm shadow-green-200 transition-colors flex items-center gap-2 text-sm">
                        <Plus size={18} />
                        Add Course
                    </button>
                )}
            </div>

            {/* Add New Course Card */}
            {isAdding && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-green-100 text-green-600 p-1.5 rounded-lg">
                            <CheckSquare size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight">Add New Course</h2>
                            <p className="text-xs text-slate-500 font-medium">Fill in the details to create a new course for your institute.</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddCourse}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Left Column */}
                            <div className="space-y-8">
                                {/* Thumbnail */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors group">
                                        {thumbnailPreview ? (
                                            <div className="relative w-full h-48">
                                                <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                                                        Change
                                                    </button>
                                                    <button type="button" onClick={() => {setThumbnail(null); setThumbnailPreview(null);}} className="bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white p-2 rounded-xl transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                className="w-full h-48 flex flex-col items-center justify-center cursor-pointer p-6 text-center"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <ImageIcon size={24} />
                                                </div>
                                                <p className="text-sm font-bold text-blue-700 mb-1">Upload Course Thumbnail</p>
                                                <p className="text-xs text-slate-500">Drag & drop an image, or click to browse</p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">JPG, PNG or WebP (Max 5MB)</p>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            accept="image/*" 
                                            onChange={handleThumbnailChange} 
                                            className="hidden" 
                                        />
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-blue-600"><Sparkles size={16} /></div>
                                        <label className="block text-sm font-bold text-blue-900">Skills You Will Learn (Required for AI Matching)</label>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3 font-medium">Add the key skills students will learn in this course. These help in AI matching and recommendations.</p>
                                    
                                    <div className="relative flex items-center mb-4">
                                        <div className="absolute left-3 text-slate-400"><BookOpen size={16} /></div>
                                        <input 
                                            type="text" 
                                            value={newSkill} 
                                            onChange={e => setNewSkill(e.target.value)} 
                                            onKeyDown={handleAddSkill} 
                                            placeholder="Type a skill and press Enter..." 
                                            className="w-full pl-10 pr-36 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm outline-none transition-all shadow-sm" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleExtractSkills} 
                                            disabled={isExtracting || !description} 
                                            className="absolute right-2 bg-purple-100 hover:bg-purple-200 text-purple-700 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                                        >
                                            {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                            {isExtracting ? 'Extracting' : 'AI Auto-Extract'}
                                        </button>
                                    </div>

                                    {skills.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs text-slate-400 font-semibold mb-2">Added Skills:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {skills.map((skill, idx) => (
                                                    <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                                        {skill}
                                                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                                        <div className="text-blue-500 mt-0.5">💡</div>
                                        <p className="text-xs font-medium text-blue-800">
                                            <span className="font-bold">Tip:</span> Add relevant skills to improve course visibility and student matching.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Course Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-slate-400"><User2 size={16} /></div>
                                        <input 
                                            type="text" 
                                            required 
                                            value={name} 
                                            onChange={e=>setName(e.target.value)} 
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm outline-none transition-all shadow-sm" 
                                            placeholder="e.g. Advanced AI Development" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Duration (Months) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-slate-400"><Calendar size={16} /></div>
                                            <input 
                                                type="number" 
                                                required 
                                                min="1" 
                                                max="60" 
                                                value={durationMonths} 
                                                onChange={e=>setDurationMonths(e.target.value)} 
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm outline-none transition-all shadow-sm" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Course Location <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-slate-400"><MapPin size={16} /></div>
                                            <input 
                                                type="text" 
                                                disabled 
                                                value={location} 
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed text-sm shadow-sm" 
                                                title="Location is auto-locked to your Institute's registered district" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-slate-400"><FileText size={16} /></div>
                                        <textarea 
                                            rows="5" 
                                            required 
                                            value={description} 
                                            onChange={e=>setDescription(e.target.value)} 
                                            maxLength={500}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm outline-none transition-all shadow-sm resize-none" 
                                            placeholder="Enter course syllabus and details..."
                                        ></textarea>
                                        <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400">
                                            {description.length}/500
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAdding(false)} 
                                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-sm transition-colors shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 shadow-sm shadow-green-200 transition-colors"
                                    >
                                        Save Course
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Your Courses Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Your Courses</h2>
                            <p className="text-xs text-slate-500 font-medium">View and manage all your created courses.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search courses..." 
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none w-full sm:w-64 transition-all shadow-sm"
                            />
                        </div>
                        <select className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-green-100 shadow-sm appearance-none cursor-pointer">
                            <option>All Courses</option>
                        </select>
                    </div>
                </div>

                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                            <GraduationCap size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No courses added yet</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-sm mb-6">
                            Click the "Add Course" button above to begin creating your first course.
                        </p>
                        {!isAdding && (
                            <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-green-600 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors text-sm">
                                <Plus size={16} />
                                Add Course
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all relative group flex flex-col h-full">
                                <button onClick={() => handleDelete(course._id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-md shadow-sm border border-slate-100">
                                    <Trash2 size={16} />
                                </button>
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 shrink-0">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1.5 leading-tight">{course.name}</h3>
                                <p className="text-xs text-green-600 font-bold mb-2 flex items-center gap-1"><Calendar size={12}/> {course.durationMonths} Months Duration</p>
                                <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1"><MapPin size={12}/> {course.location || 'Online'}</p>
                                <p className="text-sm text-slate-600 line-clamp-3 mt-auto">{course.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
