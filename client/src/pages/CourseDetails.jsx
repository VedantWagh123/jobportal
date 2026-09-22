import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Play, Clock, Award, ArrowLeft, Heart, MessageSquare, AlertCircle, HelpCircle, Share2, Star, CheckCircle, FileText, BookOpen } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { backendUrl, myCourses } = useContext(AppContext);
    
    const [course, setCourse] = useState(location.state?.course || null);
    const [activeTab, setActiveTab] = useState('Overview');
    const [loading, setLoading] = useState(!course);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            if (course) return;
            try {
                // Fetch public courses and find this one
                const { data } = await axios.get(backendUrl + '/api/users/courses');
                if (data.success) {
                    const found = data.courses.find(c => c._id === id || c.courseId === id);
                    if (found) {
                        setCourse(found);
                    } else {
                        toast.error("Course not found");
                        navigate('/upskilling');
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, course, backendUrl, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!course) return null;

    const isEnrolled = course.isEnrolled;
    const tabs = ['Overview', 'Curriculum', 'Instructor', 'Reviews', 'FAQs'];

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            const { data } = await axios.post(backendUrl + '/api/users/enroll', { batchId: course._id }, {
                headers: { token: localStorage.getItem('userToken') }
            });
            if (data.success) {
                toast.success('Successfully enrolled!');
                navigate('/my-courses');
            } else {
                toast.error(data.message || 'Enrollment failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                
                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm mb-6 w-fit">
                    <ArrowLeft size={16} /> Back to Courses
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN - MAIN CONTENT */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* HERO BANNER */}
                        <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] bg-slate-900 rounded-3xl overflow-hidden shadow-xl group">
                            {course.image ? (
                                <img src={course.image} alt={course.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-500" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent" />
                            
                            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {course.targetRole && (
                                        <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-blue-500/30 shadow-sm">
                                            {course.targetRole.name || 'Professional'}
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-blue-100 text-xs font-bold rounded-lg border border-white/10">
                                        Beginner to Advanced
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-3 max-w-2xl drop-shadow-lg">
                                    {course.name}
                                </h1>
                                <p className="text-slate-300 text-sm sm:text-base max-w-2xl line-clamp-2 mb-6 text-shadow-sm font-medium">
                                    {course.description || "Master these skills from fundamentals to real-world production applications. Start learning today."}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-200 text-sm font-semibold">
                                    <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                        <BookOpen size={16} className="text-blue-400" />
                                        <span>{course.curriculum?.length || 0} Modules</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                        <Clock size={16} className="text-blue-400" />
                                        <span>{course.durationMonths} Months</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                        <Award size={16} className="text-blue-400" />
                                        <span>Certificate</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm hidden sm:flex">
                                        <Play size={16} className="text-blue-400" />
                                        <span>Self-paced</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COURSE HEADER DETAILS (Below Banner) */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-4 leading-tight">{course.name}</h2>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                        {course.instituteName?.charAt(0) || 'I'}
                                    </div>
                                    <span>By <span className="text-slate-900 font-bold">{course.instituteName || 'Training Institute'}</span></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Star size={16} className="text-amber-400 fill-amber-400" />
                                    <span className="text-slate-900 font-bold">{course.courseRating || '4.8'}</span>
                                    <span className="text-slate-500">({course.totalCourseRatings || '320'} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} className="text-slate-400" />
                                    <span>{course.durationMonths} Months Duration</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <BookOpen size={16} className="text-slate-400" />
                                    <span>{course.curriculum?.length || 0} Modules</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isEnrolled ? (
                                    <button 
                                        onClick={() => navigate('/my-courses')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                                    >
                                        Go to My Courses <ArrowLeft size={16} className="rotate-180" />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleEnroll}
                                        disabled={enrolling || !course.batchAvailable}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                                    >
                                        {enrolling ? 'Enrolling...' : 'Continue Learning'} <ArrowLeft size={16} className="rotate-180" />
                                    </button>
                                )}
                                <button className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors">
                                    <Heart size={20} />
                                </button>
                            </div>
                        </div>

                        {/* TABS */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="flex overflow-x-auto border-b border-slate-100 no-scrollbar">
                                {tabs.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                                            activeTab === tab 
                                                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="p-6 sm:p-8">
                                {activeTab === 'Overview' && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div>
                                            <h3 className="text-xl font-extrabold text-slate-900 mb-3">About This Course</h3>
                                            <p className="text-slate-600 leading-relaxed font-medium">
                                                {course.description || "This course covers the complete journey from basic concepts to advanced real-world applications. You'll learn essential techniques, model training, fine-tuning, deployment, and ethical considerations with hands-on examples and projects."}
                                            </p>
                                        </div>

                                        {/* Course Features */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                                                    <FileText size={20} />
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-sm mb-1">Hands-on Projects</h4>
                                                <p className="text-xs text-slate-500 font-medium">Build real-world projects</p>
                                            </div>
                                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                                                    <Clock size={20} />
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-sm mb-1">Lifetime Access</h4>
                                                <p className="text-xs text-slate-500 font-medium">Learn at your own pace</p>
                                            </div>
                                            <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100/50">
                                                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                                                    <Award size={20} />
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-sm mb-1">Certificate</h4>
                                                <p className="text-xs text-slate-500 font-medium">Get certified on completion</p>
                                            </div>
                                            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
                                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                                                    <HelpCircle size={20} />
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-sm mb-1">Expert Support</h4>
                                                <p className="text-xs text-slate-500 font-medium">Get help when you need it</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {activeTab === 'Curriculum' && (
                                    <div className="animate-fadeIn">
                                        <h3 className="text-xl font-extrabold text-slate-900 mb-6">Course Curriculum</h3>
                                        {course.curriculum && course.curriculum.length > 0 ? (
                                            <div className="space-y-4">
                                                {course.curriculum.map((module, idx) => (
                                                    <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-slate-900 text-lg">Module {module.month}: {module.title}</h4>
                                                        </div>
                                                        {module.topics && module.topics.length > 0 && (
                                                            <ul className="space-y-2 mt-3">
                                                                {module.topics.map((topic, tIdx) => (
                                                                    <li key={tIdx} className="flex items-start gap-2 text-slate-600 text-sm font-medium">
                                                                        <CheckCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                                                        {topic}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 font-medium">Curriculum details are not available for this course yet.</p>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab !== 'Overview' && activeTab !== 'Curriculum' && (
                                    <div className="py-10 text-center animate-fadeIn">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle size={24} className="text-slate-300" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 mb-1">{activeTab} Info</h3>
                                        <p className="text-slate-500 font-medium text-sm">This section is currently being updated.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - SIDEBAR */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Progress Card (If Enrolled) */}
                        {isEnrolled && (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-extrabold text-slate-900 text-lg">Your Progress</h3>
                                    <span className="text-sm font-bold text-blue-600">0% completed</span>
                                </div>
                                <p className="text-xs font-medium text-slate-500 mb-4">0 of {course.curriculum?.length || 10} modules completed</p>
                                
                                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                
                                <button 
                                    onClick={() => navigate('/my-courses')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    Continue Learning <ArrowLeft size={16} className="rotate-180" />
                                </button>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-extrabold text-slate-900 text-lg mb-5">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-green-200 hover:shadow-md hover:shadow-green-900/5 transition-all text-left group">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <MessageSquare size={16} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-xs mb-1">Chat with Instructor</h4>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight">Get your questions answered</p>
                                </button>
                                <button className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-amber-200 hover:shadow-md hover:shadow-amber-900/5 transition-all text-left group">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <HelpCircle size={16} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-xs mb-1">Doubt Solver</h4>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight">AI-powered doubt resolution</p>
                                </button>
                                <button className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-900/5 transition-all text-left group">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <FileText size={16} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-xs mb-1">Course Inquiry</h4>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight">Ask about this course</p>
                                </button>
                                <button className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-red-200 hover:shadow-md hover:shadow-red-900/5 transition-all text-left group">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <AlertCircle size={16} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-xs mb-1">Report an Issue</h4>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight">Facing any problems?</p>
                                </button>
                            </div>
                        </div>

                        {/* Instructor / Institute */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-extrabold text-slate-900 text-lg mb-5">Instructor / Institute</h3>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                                    {course.instituteName?.charAt(0) || 'R'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 leading-tight mb-1">{course.instituteName || 'Training Institute'}</h4>
                                    <p className="text-xs text-slate-500 font-medium">Industry-focused skill development</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mb-6 text-center border-y border-slate-100 py-4">
                                <div>
                                    <p className="font-extrabold text-slate-900 text-sm">50+</p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Courses</p>
                                </div>
                                <div className="border-x border-slate-100">
                                    <p className="font-extrabold text-slate-900 text-sm">10K+</p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Students</p>
                                </div>
                                <div>
                                    <p className="font-extrabold text-slate-900 text-sm flex items-center justify-center gap-1">
                                        4.7 <Star size={10} className="fill-slate-900" />
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Rating</p>
                                </div>
                            </div>
                            
                            <button className="w-full py-2.5 bg-white border-2 border-blue-100 hover:border-blue-600 text-blue-600 font-bold rounded-xl transition-colors text-sm">
                                View Profile
                            </button>
                        </div>

                        {/* Need Help */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
                                    <HelpCircle size={24} className="text-blue-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Need Help?</h4>
                                    <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
                                        Facing any issues or have questions? Our support team is here to help.
                                    </p>
                                    <button className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
