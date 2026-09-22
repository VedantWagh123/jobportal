import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Play, MessageSquare, BookOpen, Clock, Loader2, BookOpenCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
    const { myCourses, fetchMyCourses } = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch courses when component mounts to ensure data is fresh
        const load = async () => {
            setLoading(true);
            await fetchMyCourses();
            setLoading(false);
        };
        load();
    }, []);

    const filteredCourses = myCourses.filter(course =>
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instituteName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && myCourses.length === 0) {
        return (
            <div className="bg-slate-50 min-h-screen p-8 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (myCourses.length === 0) {
        return (
            <div className="bg-slate-50 min-h-screen p-8">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-20">
                    <BookOpenCheck size={48} className="text-slate-300 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">You haven't enrolled in any courses</h2>
                    <p className="text-slate-500 mb-6">Discover in-demand skills and upgrade your career.</p>
                    <button 
                        onClick={() => navigate('/upskilling')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                    >
                        Explore Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">
            <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-1">My Courses</h1>
                        <p className="text-slate-600 text-sm font-medium">Access your enrolled courses, lectures and resources.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search your courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Course List */}
                <div className="space-y-6">
                    {filteredCourses.map((course, index) => {
                        const isNotStarted = course.progressPercentage === 0;
                        const fallbackGradient = `linear-gradient(135deg, hsl(${(index * 50) % 360}, 70%, 50%), hsl(${((index + 1) * 70) % 360}, 60%, 40%))`;

                        return (
                            <div key={course.enrollmentId} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                
                                {/* Thumbnail */}
                                <div className="relative h-48 md:h-40 md:w-72 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                                    {course.courseImage ? (
                                        <img 
                                            src={course.courseImage} 
                                            alt={course.courseName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div 
                                            className="w-full h-full flex items-center justify-center text-white p-4 text-center"
                                            style={{ background: fallbackGradient }}
                                        >
                                            <span className="font-black text-2xl drop-shadow-md">
                                                {course.courseName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Middle */}
                                <div className="flex-1 flex flex-col justify-center py-2">
                                    <h2 className="text-xl font-bold text-slate-900 mb-1">{course.courseName}</h2>
                                    <p className="text-sm font-semibold text-slate-500 mb-4">{course.instituteName}</p>

                                    <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen size={16} className="text-slate-400" />
                                            <span>{course.totalLectures > 0 ? `${course.totalLectures} Lectures` : 'Modules Setup'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} className="text-slate-400" />
                                            <span>{course.durationMonths} Months</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {/* Static level icon to match design */}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="18" y="3" width="4" height="18"></rect><rect x="10" y="8" width="4" height="13"></rect><rect x="2" y="13" width="4" height="8"></rect></svg>
                                            <span>Beginner</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${isNotStarted ? 'bg-transparent' : course.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                                style={{ width: `${course.progressPercentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 w-24 text-right">
                                            {isNotStarted ? 'Not started yet' : `${course.progressPercentage}% complete`}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions Right */}
                                <div className="flex flex-col justify-center gap-3 shrink-0 md:w-56 py-2 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                                    <button 
                                        onClick={() => navigate(`/course-player/${course.enrollmentId}`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Play size={16} className="fill-white" />
                                        {isNotStarted ? 'Start Learning' : 'Continue Learning'}
                                    </button>
                                    
                                    <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2">
                                        <MessageSquare size={16} className="text-slate-500" />
                                        Ask a Doubt
                                    </button>

                                    <button 
                                        onClick={() => navigate('/course/' + (course.courseId || course._id), { state: { course } })}
                                        className="w-full text-blue-600 hover:text-blue-700 font-bold py-1 text-sm mt-1 flex items-center justify-center gap-1"
                                    >
                                        Course Details <span className="text-lg leading-none">&rarr;</span>
                                    </button>
                                </div>
                                
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default MyCourses;
