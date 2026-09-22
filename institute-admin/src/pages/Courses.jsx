import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    BookOpen, Plus, Trash2, Loader2, Sparkles, X, 
    Image as ImageIcon, User2, Calendar, MapPin, 
    FileText, Search, GraduationCap, CheckSquare, Pencil, Upload, Eye
} from 'lucide-react';
import LectureManagementDrawer from '../components/LectureManagementDrawer';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'curriculum'
    
    // Edit Course State
    const [editingCourse, setEditingCourse] = useState(null); // The course being edited
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDuration, setEditDuration] = useState(3);
    const [editLocation, setEditLocation] = useState('');
    const [editSkills, setEditSkills] = useState([]);
    const [editNewSkill, setEditNewSkill] = useState('');
    const [editThumbnail, setEditThumbnail] = useState(null);
    const [editThumbnailPreview, setEditThumbnailPreview] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const editFileInputRef = useRef(null);
    
    // Curriculum State
    const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState(null);
    const [curriculumData, setCurriculumData] = useState([]);
    const [isSavingCurriculum, setIsSavingCurriculum] = useState(false);

    // Lecture Management State
    const [selectedCourseForLectures, setSelectedCourseForLectures] = useState(null);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
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
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('durationMonths', durationMonths);
            formData.append('location', location);
            skills.forEach(s => formData.append('skills[]', s));
            if (thumbnail) {
                formData.append('image', thumbnail);
            }

            const { data } = await axios.post('/api/institute/management/courses', formData, {
                headers: { token: user.token, 'Content-Type': 'multipart/form-data' }
            });
            
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

    // --- Edit Course Handlers ---
    const openEditModal = (course) => {
        setEditingCourse(course);
        setEditName(course.name || '');
        setEditDescription(course.description || '');
        setEditDuration(course.durationMonths || 3);
        setEditLocation(course.location || '');
        setEditThumbnail(null);
        setEditThumbnailPreview(course.image || ''); // show existing image
        // Fetch existing skills for this course
        axios.get(`/api/institute/management/courses`, { headers: { token: user.token } })
            .then(({ data }) => {
                // We'll load skills from courseSkills separately if needed
            });
        setEditSkills([]); // We'll add from scratch — user can re-add
    };

    const handleEditThumbnailChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditThumbnail(file);
            setEditThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingCourse) return;
        setIsSavingEdit(true);
        try {
            const formData = new FormData();
            formData.append('name', editName);
            formData.append('description', editDescription);
            formData.append('durationMonths', editDuration);
            formData.append('location', editLocation);
            if (editSkills.length > 0) editSkills.forEach(s => formData.append('skills[]', s));
            if (editThumbnail) formData.append('image', editThumbnail);

            const { data } = await axios.put(
                `/api/institute/management/courses/${editingCourse._id}`,
                formData,
                { headers: { token: user.token, 'Content-Type': 'multipart/form-data' } }
            );

            if (data.success) {
                // Immediately update the course in local state
                setCourses(prev => prev.map(c => c._id === editingCourse._id ? { ...c, ...data.course } : c));
                setEditingCourse(null);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update course');
        } finally {
            setIsSavingEdit(false);
        }
    };

    // --- Curriculum Functions ---
    const handleCourseSelectForCurriculum = (courseId) => {
        const course = courses.find(c => c._id === courseId);
        setSelectedCourseForCurriculum(course);
        if (course && course.curriculum && course.curriculum.length > 0) {
            setCurriculumData(course.curriculum);
        } else {
            setCurriculumData([{ month: 1, title: '', topics: [] }]);
        }
    };

    const handleAddMonth = () => {
        setCurriculumData([...curriculumData, { month: curriculumData.length + 1, title: '', topics: [] }]);
    };
    
    const handleRemoveMonth = (index) => {
        const updated = curriculumData.filter((_, i) => i !== index);
        // Re-index months
        updated.forEach((item, i) => { item.month = i + 1; });
        setCurriculumData(updated);
    };

    const handleCurriculumChange = (index, field, value) => {
        const updated = [...curriculumData];
        updated[index][field] = value;
        setCurriculumData(updated);
    };

    const handleTopicChange = (monthIndex, topicString) => {
        const updated = [...curriculumData];
        updated[monthIndex].topics = topicString.split(',').map(t => t.trim()).filter(t => t);
        setCurriculumData(updated);
    };

    const handleSaveCurriculum = async () => {
        if (!selectedCourseForCurriculum) return;
        setIsSavingCurriculum(true);
        try {
            const { data } = await axios.put(`/api/institute/management/courses/${selectedCourseForCurriculum._id}/curriculum`, {
                curriculum: curriculumData
            }, { headers: { token: user.token }});
            if (data.success) {
                alert("Curriculum saved successfully!");
                setCourses(courses.map(c => c._id === selectedCourseForCurriculum._id ? { ...c, curriculum: curriculumData } : c));
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save curriculum");
        } finally {
            setIsSavingCurriculum(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>;

    return (
        <div className={`w-full pb-12 text-slate-800 font-sans transition-all duration-300 ${selectedCourseForLectures ? 'lg:pr-[520px] lg:pl-8' : 'max-w-7xl mx-auto px-4 lg:px-8'}`}>
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
                    <button 
                        onClick={() => setActiveTab('courses')}
                        className={`font-bold pb-2 flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'courses' 
                            ? 'text-green-600 border-green-600' 
                            : 'text-slate-400 border-transparent hover:text-slate-600'
                        }`}
                    >
                        <BookOpen size={18} />
                        Courses
                    </button>
                    <button 
                        onClick={() => setActiveTab('curriculum')}
                        className={`font-bold pb-2 flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'curriculum' 
                            ? 'text-green-600 border-green-600' 
                            : 'text-slate-400 border-transparent hover:text-slate-600'
                        }`}
                    >
                        <Sparkles size={18} />
                        Curriculum Overview
                    </button>
                </div>
                {!isAdding && activeTab === 'courses' && (
                    <button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm shadow-green-200 transition-colors flex items-center gap-2 text-sm">
                        <Plus size={18} />
                        Add Course
                    </button>
                )}
            </div>

            {/* Add New Course Card */}
            {isAdding && activeTab === 'courses' && (
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
            {activeTab === 'courses' && (
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
                            <div key={course._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group flex flex-col overflow-hidden">
                                {/* Thumbnail */}
                                <div className="relative h-36 bg-slate-100 flex-shrink-0 overflow-hidden">
                                    {course.image ? (
                                        <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                                            <BookOpen size={32} className="text-white/70" />
                                        </div>
                                    )}
                                    {/* Action buttons on hover */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => openEditModal(course)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
                                        >
                                            <Pencil size={13} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(course._id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Card Body */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1 leading-tight text-sm">{course.name}</h3>
                                    <p className="text-xs text-green-600 font-bold mb-1 flex items-center gap-1"><Calendar size={11}/> {course.durationMonths} Months Duration</p>
                                    <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1"><MapPin size={11}/> {course.location || 'Online'}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-auto leading-relaxed">{course.description}</p>
                                    
                                    <div className="mt-3 flex items-center justify-between gap-2">
                                        <button
                                            onClick={() => openEditModal(course)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-colors"
                                        >
                                            <Pencil size={11} /> Edit Course
                                        </button>
                                        <button
                                            onClick={() => setSelectedCourseForLectures(course)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-slate-200 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold hover:border-blue-300 hover:bg-blue-100 transition-colors"
                                        >
                                            <FileText size={11} /> Add Detail
                                        </button>
                                        <button
                                            className="w-8 flex items-center justify-center gap-1.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                                            title="View Course"
                                        >
                                            <Eye size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            )}

            {/* Curriculum Builder Card */}
            {activeTab === 'curriculum' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Sparkles className="text-green-600" size={24} />
                                Master Curriculum Builder
                            </h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Design the month-by-month syllabus for your courses.</p>
                        </div>
                        
                        <div className="w-full sm:w-1/3">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Select Course to Edit</label>
                            <select 
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100"
                                value={selectedCourseForCurriculum?._id || ''}
                                onChange={(e) => handleCourseSelectForCurriculum(e.target.value)}
                            >
                                <option value="" disabled>-- Select a Course --</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!selectedCourseForCurriculum ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Select a course to build curriculum</h3>
                            <p className="text-sm text-slate-500 max-w-sm mt-2">You need to select a course from the dropdown above to add or modify its month-by-month syllabus.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {curriculumData.map((item, index) => (
                                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative group">
                                    <button 
                                        onClick={() => handleRemoveMonth(index)} 
                                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Remove Month"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-3">
                                        <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm">
                                            M{item.month}
                                        </div>
                                        <h4 className="font-bold text-slate-800">Month {item.month} Syllabus</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Module Title</label>
                                            <input 
                                                type="text" 
                                                value={item.title} 
                                                onChange={(e) => handleCurriculumChange(index, 'title', e.target.value)}
                                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-100"
                                                placeholder="e.g. Introduction to Core Concepts"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Topics Covered (Comma separated)</label>
                                            <textarea 
                                                rows="3"
                                                value={item.topics.join(', ')} 
                                                onChange={(e) => handleTopicChange(index, e.target.value)}
                                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-100 resize-none"
                                                placeholder="e.g. Basics, Syntax, Variables, Control Flow"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <button 
                                    onClick={handleAddMonth}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-sm transition-colors"
                                >
                                    <Plus size={16} /> Add Another Month
                                </button>
                                
                                <button 
                                    onClick={handleSaveCurriculum}
                                    disabled={isSavingCurriculum}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                                >
                                    {isSavingCurriculum ? <Loader2 size={16} className="animate-spin" /> : <CheckSquare size={16} />}
                                    Save Curriculum
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ====== EDIT COURSE MODAL ====== */}
            {editingCourse && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
                onClick={e => e.target === e.currentTarget && setEditingCourse(null)}
            >
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Editing Course</p>
                            <h2 className="text-lg font-bold text-slate-900">{editingCourse.name}</h2>
                        </div>
                        <button onClick={() => setEditingCourse(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <form onSubmit={handleSaveEdit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                        
                        {/* Thumbnail Upload */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Course Thumbnail</label>
                            <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 hover:border-green-400 transition-colors cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                                {editThumbnailPreview ? (
                                    <img src={editThumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <Upload size={28} className="mb-2" />
                                        <p className="text-xs font-medium">Click to upload thumbnail</p>
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-white/90 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 flex items-center gap-1 shadow-sm">
                                    <Upload size={11} /> Change Photo
                                </div>
                            </div>
                            <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditThumbnailChange} />
                        </div>

                        {/* Course Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Course Name *</label>
                            <input 
                                type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400"
                                placeholder="e.g. Full Stack Web Development"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                            <textarea 
                                rows={3} value={editDescription} onChange={e => setEditDescription(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 resize-none"
                                placeholder="What will students learn in this course?"
                            />
                        </div>

                        {/* Duration & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Months) *</label>
                                <input 
                                    type="number" min={1} max={36} required value={editDuration} onChange={e => setEditDuration(Number(e.target.value))}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Location / Mode</label>
                                <input 
                                    type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100"
                                    placeholder="Online / Pune / Mumbai"
                                />
                            </div>
                        </div>

                        {/* Note about curriculum */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium flex items-start gap-2">
                            <span className="text-base">💡</span>
                            <p>To edit the month-by-month syllabus, use the <strong>Curriculum Overview</strong> tab after saving these changes.</p>
                        </div>
                    </form>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                        <button 
                            onClick={() => setEditingCourse(null)}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveEdit}
                            disabled={isSavingEdit}
                            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors shadow-sm shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSavingEdit ? <Loader2 size={15} className="animate-spin" /> : <CheckSquare size={15} />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
            )}

            {/* ====== LECTURE MANAGEMENT DRAWER ====== */}
            {selectedCourseForLectures && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-transparent z-40" 
                        onClick={() => setSelectedCourseForLectures(null)}
                    />
                    <LectureManagementDrawer 
                        course={selectedCourseForLectures} 
                        userToken={user?.token}
                        onClose={() => setSelectedCourseForLectures(null)} 
                    />
                </>
            )}

        </div>
    );
};

export default Courses;
