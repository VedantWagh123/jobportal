import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Plus, Trash2, Loader2, Sparkles, X } from 'lucide-react';

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
            
            // Always fetch the freshest profile to get the correct district name
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
                // Location remains locked to the user's district
                setSkills([]);
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
                // Merge without duplicates
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

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Courses & Curriculum</h1>
                    <p className="text-gray-500 mt-1">Manage the courses your institute offers.</p>
                </div>
                <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                    <Plus size={20} />
                    Add Course
                </button>
            </header>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <h2 className="text-lg font-bold mb-4">Add New Course</h2>
                    <form onSubmit={handleAddCourse} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Advanced AI Development" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
                                <input type="number" required min="1" max="60" value={durationMonths} onChange={e=>setDurationMonths(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Location</label>
                                <input type="text" disabled value={location} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" title="Location is auto-locked to your Institute's registered district" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea rows="3" required value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="Course syllabus and details..."></textarea>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-blue-900">Skills You Will Learn (Required for AI Matching)</label>
                                <button type="button" onClick={handleExtractSkills} disabled={isExtracting || !description} className="flex items-center gap-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-bold transition disabled:opacity-50">
                                    {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-yellow-500" />}
                                    {isExtracting ? 'Extracting...' : 'AI Auto-Extract'}
                                </button>
                            </div>
                            <p className="text-xs text-blue-700 mb-3">AI uses these skills to match your course with student skill gaps.</p>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                                {skills.map((skill, idx) => (
                                    <span key={idx} className="bg-blue-600 text-white px-2.5 py-1 rounded-md text-sm flex items-center gap-1.5 shadow-sm">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-200"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                value={newSkill} 
                                onChange={e => setNewSkill(e.target.value)} 
                                onKeyDown={handleAddSkill} 
                                placeholder="Type a skill and press Enter..." 
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm outline-none" 
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Save Course</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500">
                        No courses added yet. Click 'Add Course' to begin declaring your capacity.
                    </div>
                ) : (
                    courses.map(course => (
                        <div key={course._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative group">
                            <button onClick={() => handleDelete(course._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={18} />
                            </button>
                            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center mb-4">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{course.name}</h3>
                            <p className="text-xs text-primary-600 font-medium mb-1">{course.durationMonths} Months Duration</p>
                            <p className="text-xs text-gray-500 font-medium mb-3">📍 {course.location || 'Online'}</p>
                            <p className="text-sm text-gray-500 line-clamp-3">{course.description}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Courses;
