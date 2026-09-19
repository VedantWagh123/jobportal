import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { 
    Search, Filter, ChevronDown, Clock, Users, Bookmark, 
    GraduationCap, Sparkles, BookOpen, Loader2, X, Download, Star 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const CATEGORIES = [
    "All Courses", 
    "Tech & Development", 
    "Data & Analytics", 
    "AI & ML", 
    "Design", 
    "Business", 
    "Career Growth"
];

const Upskilling = () => {
    const { backendUrl, userData } = useContext(AppContext);
    const { getToken, isSignedIn } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollingMap, setEnrollingMap] = useState({});

    // Filters
    const [activeCategory, setActiveCategory] = useState("All Courses");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Most Popular");

    // Course Review State
    const loc = useLocation();
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewCourseId, setReviewCourseId] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(loc.search);
        const rateId = queryParams.get('rateCourse');
        if (rateId) {
            setReviewCourseId(rateId);
            setShowReviewModal(true);
        }
    }, [loc.search]);

    const submitReview = async () => {
        if (reviewRating === 0) return toast.error("Please select a rating");
        try {
            setSubmittingReview(true);
            const token = await getToken();
            const res = await axios.post(`${backendUrl}/api/users/course-review`, {
                courseId: reviewCourseId,
                rating: reviewRating,
                review: reviewText
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (res.data.success) {
                toast.success("Review submitted successfully! Thank you.");
                setShowReviewModal(false);
                fetchCourses(); // refresh course ratings
                // clear query param
                navigate('/upskill', { replace: true });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review");
            if (err.response?.data?.message === 'You have already reviewed this course') {
                setShowReviewModal(false);
                navigate('/upskill', { replace: true });
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [isSignedIn]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const res = await axios.get(`${backendUrl}/api/users/courses`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.data.success) {
                setCourses(res.data.courses);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError("Unable to load courses. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (course) => {
        if (!isSignedIn) {
            toast.info("Please login to enroll in courses");
            return;
        }
        if (!course.batchAvailable || !course.batchId) {
            toast.error("No active batches available for this course right now.");
            return;
        }

        try {
            setEnrollingMap(prev => ({ ...prev, [course.courseId]: true }));
            const token = await getToken();
            const { data } = await axios.post(
                `${backendUrl}/api/users/enroll`,
                { batchId: course.batchId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success("Successfully enrolled!");
                // Update local state to reflect enrollment
                setCourses(prev => prev.map(c => 
                    c.courseId === course.courseId ? { ...c, isEnrolled: true, totalStudents: c.totalStudents + 1 } : c
                ));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error enrolling in course");
        } finally {
            setEnrollingMap(prev => ({ ...prev, [course.courseId]: false }));
        }
    };

    // Filter Logic
    const filteredCourses = courses.filter(course => {
        const matchesCategory = activeCategory === "All Courses" || course.category === activeCategory;
        const matchesSearch = course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              course.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              course.coveredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Sort Logic (Basic implementation)
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        if (sortBy === "Most Popular") {
            return b.totalStudents - a.totalStudents;
        }
        if (sortBy === "Newest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0; // Default
    });


    // UI Helper for dynamic status badge
    const getStatusBadge = (course, index) => {
        if (course.isEnrolled) return { text: "Enrolled", color: "bg-green-500" };
        if (!course.batchAvailable) return { text: "Coming Soon", color: "bg-slate-500" };
        
        // Deterministic pseudo-random badge assignment for visual variety based on index/id
        const hash = (course.courseName.length + index) % 4;
        if (hash === 0) return { text: "Trending", color: "bg-purple-500" };
        if (hash === 1) return { text: "Popular", color: "bg-emerald-500" };
        if (hash === 2) return { text: "High Demand", color: "bg-orange-500" };
        return { text: "New", color: "bg-blue-500" };
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">
            <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
                
                {/* === PAGE HEADER === */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Upskilling Hub</p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            Upgrade Your Skills for a Better Tomorrow
                        </h1>
                        <p className="text-slate-600 text-sm sm:text-base max-w-3xl">
                            Learn in-demand skills with industry-relevant courses. Stay ahead, build expertise, and boost your career prospects.
                        </p>
                    </div>
                    
                    {/* Decorative Banner Right Side */}
                    <div className="hidden lg:flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm min-w-[300px]">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <p className="text-indigo-900 font-bold text-lg leading-tight italic">Invest in Skills,</p>
                            <p className="text-indigo-900 font-bold text-lg leading-tight italic">Invest in Yourself</p>
                        </div>
                    </div>
                </div>

                {/* === SEARCH & FILTERS === */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    
                    {/* Category Tabs (Scrollable on small screens) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                                    activeCategory === category 
                                        ? 'bg-blue-600 text-white border border-blue-600' 
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort Row */}
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search courses, skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                            />
                        </div>
                        
                        <div className="relative hidden sm:block">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white cursor-pointer shadow-sm"
                            >
                                <option value="Most Popular">Most Popular</option>
                                <option value="Newest">Newest</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        
                        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 shadow-sm transition-colors">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                {/* === COURSE GRID === */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-blue-600">
                        <Loader2 size={40} className="animate-spin mb-4" />
                        <p className="font-semibold text-slate-600">Loading courses...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100 max-w-2xl mx-auto mt-10">
                        <p className="font-bold">{error}</p>
                        <button onClick={fetchCourses} className="mt-4 px-6 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-semibold transition-colors">
                            Retry
                        </button>
                    </div>
                ) : sortedCourses.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm max-w-3xl mx-auto mt-10">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <BookOpen size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No courses available yet</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            {searchQuery || activeCategory !== "All Courses" 
                                ? "We couldn't find any courses matching your filters. Try adjusting your search."
                                : "Institutes haven't published any courses yet. Please check back later."}
                        </p>
                        {(searchQuery || activeCategory !== "All Courses") && (
                            <button 
                                onClick={() => { setSearchQuery(""); setActiveCategory("All Courses"); }}
                                className="mt-6 px-6 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8">
                        {sortedCourses.map((course, index) => {
                            const badge = getStatusBadge(course, index);
                            const fallbackGradient = `linear-gradient(135deg, hsl(${(index * 50) % 360}, 70%, 50%), hsl(${((index + 1) * 70) % 360}, 60%, 40%))`;

                            return (
                                <div 
                                    key={course.courseId} 
                                    className="bg-white rounded-[1.25rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col group cursor-pointer ring-1 ring-slate-900/5"
                                    onClick={() => setSelectedCourse(course)}
                                >
                                    
                                    {/* Image Section */}
                                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                                        {course.courseImage ? (
                                            <img 
                                                src={course.courseImage} 
                                                alt={course.courseName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div 
                                                className="w-full h-full flex items-center justify-center text-white p-4 text-center"
                                                style={{ background: fallbackGradient }}
                                            >
                                                <span className="font-bold text-xl opacity-90 drop-shadow-md">
                                                    {course.courseName.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Top Left Badge */}
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white shadow-sm ${badge.color}`}>
                                            {badge.text}
                                        </div>

                                        {/* Top Right Duration */}
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
                                            <Clock size={11} />
                                            {course.durationMonths} Months
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="mb-4 flex-1">
                                            <h3 className="font-extrabold text-slate-900 text-base leading-tight mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors" title={course.courseName}>
                                                {course.courseName}
                                            </h3>
                                            <div className="flex flex-col mb-2 gap-1.5">
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{course.instituteName}</p>
                                                {course.calculatedInstituteRating > 0 && (
                                                    <div className="flex items-center gap-1.5 bg-amber-50/50 w-fit px-2 py-1 rounded-md border border-amber-100" title={`Institute Rating: ${course.calculatedInstituteRating}/5 (Based on ${course.placementRatePercentage}% placements)`}>
                                                        <div className="flex items-center gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={10} className={i < Math.round(course.calculatedInstituteRating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] font-extrabold text-amber-700">{course.calculatedInstituteRating}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                                                {course.courseDescription || "Learn the essential skills and tools required to excel in this field."}
                                            </p>
                                        </div>

                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {course.coveredSkills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                                                    {skill}
                                                </span>
                                            ))}
                                            {course.coveredSkills.length > 3 && (
                                                <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold border border-slate-200">
                                                    +{course.coveredSkills.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer Info (Students & Rating) */}
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mb-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                                                <Users size={14} className="text-slate-400" />
                                                <span>{course.totalStudents} student{course.totalStudents !== 1 ? 's' : ''}</span>
                                            </div>
                                            {course.courseRating > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                                    <span className="text-xs font-bold text-slate-700">{course.courseRating}</span>
                                                    <span className="text-[10px] text-slate-400">({course.totalCourseRatings})</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-slate-400 italic">New Course</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={() => handleEnroll(course)}
                                                disabled={enrollingMap[course.courseId] || course.isEnrolled || !course.batchAvailable}
                                                title={course.isEnrolled ? "Already Bought" : ""}
                                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2
                                                    ${course.isEnrolled 
                                                        ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
                                                        : !course.batchAvailable
                                                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 shadow-md'
                                                    }
                                                `}
                                            >
                                                {enrollingMap[course.courseId] ? (
                                                    <><Loader2 size={16} className="animate-spin" /> Enrolling...</>
                                                ) : course.isEnrolled ? (
                                                    "Enrolled"
                                                ) : !course.batchAvailable ? (
                                                    "Unavailable"
                                                ) : (
                                                    "Enroll Now"
                                                )}
                                            </button>
                                            
                                            <button className="w-11 h-11 flex items-center justify-center border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
                                                <Bookmark size={18} />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ====== COURSE DETAIL MODAL ====== */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 pr-8">{selectedCourse.courseName}</h2>
                                <p className="text-sm font-semibold text-slate-500 mt-1">{selectedCourse.instituteName} • {selectedCourse.durationMonths} Months</p>
                            </div>
                            <button 
                                onClick={() => setSelectedCourse(null)}
                                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                            
                            {/* Course Image */}
                            {selectedCourse.courseImage && (
                                <img src={selectedCourse.courseImage} alt="Course Thumbnail" className="w-full h-48 sm:h-64 object-cover rounded-xl mb-6 shadow-sm border border-slate-200" />
                            )}

                            {/* Institute Rating Section */}
                            {selectedCourse.calculatedInstituteRating > 0 && (
                                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center border border-amber-200 shadow-sm shrink-0">
                                        <span className="text-xl font-black text-amber-600 leading-none">{selectedCourse.calculatedInstituteRating}</span>
                                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-1">/ 5</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h3 className="font-black text-amber-900 text-lg">Institute Rating</h3>
                                            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">Verified Data</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} className={i < Math.round(selectedCourse.calculatedInstituteRating) ? "text-amber-500 fill-amber-500" : "text-amber-200 fill-amber-100/50"} />
                                                ))}
                                            </div>
                                            <span className="text-[13px] text-amber-700 font-bold ml-1">
                                                {selectedCourse.calculatedInstituteRating} out of 5
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-amber-700/80 font-medium">
                                            Calculated dynamically based on the institute's quality score and a <strong className="font-extrabold">{selectedCourse.placementRatePercentage}%</strong> actual candidate placement rate through this portal.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="mb-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2">About this Course</h3>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedCourse.courseDescription}</p>
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <h3 className="font-bold text-slate-800 mb-3">Skills Covered</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCourse.coveredSkills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Curriculum Section */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:block print-curriculum-container">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                                    <h3 className="font-bold text-slate-800 text-lg">Course Curriculum</h3>
                                    <button 
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors print:hidden"
                                    >
                                        <Download size={16} />
                                        Download PDF
                                    </button>
                                </div>

                                {selectedCourse.courseCurriculum && selectedCourse.courseCurriculum.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedCourse.courseCurriculum.map((month, idx) => (
                                            <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden print:border-none print:break-inside-avoid print:mb-6">
                                                <div className="bg-slate-50 px-4 py-3 font-bold text-slate-800 border-b border-slate-100 print:bg-white print:border-b-2 print:border-black print:px-0">
                                                    Month {month.month}
                                                </div>
                                                <div className="p-4 bg-white print:px-0">
                                                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 print:text-black">
                                                        {month.topics.map((topic, tIdx) => (
                                                            <li key={tIdx} className="leading-relaxed">{topic}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">No curriculum uploaded yet.</p>
                                )}
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-white print:hidden">
                            <button 
                                onClick={() => setSelectedCourse(null)}
                                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    handleEnroll(selectedCourse);
                                }}
                                disabled={enrollingMap[selectedCourse.courseId] || selectedCourse.isEnrolled || !selectedCourse.batchAvailable}
                                title={selectedCourse.isEnrolled ? "Already Bought" : ""}
                                className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2
                                    ${selectedCourse.isEnrolled 
                                        ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
                                        : !selectedCourse.batchAvailable
                                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 shadow-md'
                                    }
                                `}
                            >
                                {enrollingMap[selectedCourse.courseId] ? (
                                    <><Loader2 size={16} className="animate-spin" /> Enrolling...</>
                                ) : selectedCourse.isEnrolled ? (
                                    "Enrolled"
                                ) : !selectedCourse.batchAvailable ? (
                                    "Unavailable"
                                ) : (
                                    "Enroll Now"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Print Styling injected inline for ease */}
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    .print-curriculum-container, .print-curriculum-container * {
                        visibility: visible !important;
                    }
                    .print-curriculum-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                    }
                }
            `}</style>
            {/* Course Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl">
                        <button onClick={() => { setShowReviewModal(false); navigate('/upskill', { replace: true }); }} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Star size={32} className="text-blue-600 fill-blue-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">Rate Your Course</h2>
                            <p className="text-sm text-slate-500 mt-2">
                                We noticed your recent interview. How would you rate the training you received?
                            </p>
                        </div>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    onClick={() => setReviewRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star 
                                        size={36} 
                                        className={reviewRating >= star ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} 
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Review (Optional)</label>
                            <textarea 
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Tell us what could be improved or what you liked..."
                                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                            />
                        </div>

                        <button 
                            onClick={submitReview}
                            disabled={submittingReview}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2"
                        >
                            {submittingReview ? <Loader2 size={18} className="animate-spin" /> : 'Submit Feedback'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upskilling;
