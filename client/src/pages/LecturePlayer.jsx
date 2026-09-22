import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Play, Pause, Settings, Maximize, Volume2, VolumeX, ChevronLeft, ChevronRight, CheckCircle, Clock, Award, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import io from 'socket.io-client';

const LecturePlayer = () => {
    const { enrollmentId } = useParams();
    const navigate = useNavigate();
    const { myCourses, user } = useContext(AppContext);
    const { getToken } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [lectures, setLectures] = useState([]);
    const [loadingLectures, setLoadingLectures] = useState(true);
    const [activeLectureIndex, setActiveLectureIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    
    // Custom Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    
    const playerContainerRef = useRef(null);
    const speedMenuRef = useRef(null);
    const videoRef = useRef(null);
    const socketRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // 1. Find Course from Context
    useEffect(() => {
        if (myCourses && myCourses.length > 0) {
            const found = myCourses.find(c => c.enrollmentId === enrollmentId);
            if (found) {
                setCourse(found);
            } else {
                toast.error("Course not found!");
                navigate('/my-courses');
            }
        }
    }, [myCourses, enrollmentId, navigate]);

    // 2. Fetch Real Lectures
    useEffect(() => {
        if (!course) return;

        const backendUrl = import.meta.env.DEV ? 'http://localhost:5000' : (import.meta.env.VITE_BACKEND_URL || '');

        const fetchLectures = async () => {
            try {
                setLoadingLectures(true);
                const token = await getToken();
                if (!token) return;
                
                const { data } = await axios.get(`${backendUrl}/api/users/courses/${course.courseId}/lectures`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setLectures(data.lectures);
                }
            } catch (error) {
                console.error("Failed to fetch lectures", error);
            } finally {
                setLoadingLectures(false);
            }
        };

        fetchLectures();
        
        // Setup Socket.IO for Real-time updates
        const socketURL = import.meta.env.DEV ? 'http://localhost:5000' : (import.meta.env.VITE_BACKEND_URL || '');
        socketRef.current = io(socketURL);
        
        socketRef.current.on('lecture:created', (data) => {
            if (data.courseId === course.courseId) {
                setLectures(prev => {
                    // Check if not draft
                    if (data.lecture.status === 'Draft') return prev;
                    return [...prev, data.lecture].sort((a,b) => a.lectureNumber - b.lectureNumber);
                });
            }
        });

        socketRef.current.on('lecture:updated', (data) => {
            if (data.courseId === course.courseId) {
                setLectures(prev => {
                    let updated = prev.map(l => l._id === data.lecture._id ? data.lecture : l);
                    updated = updated.filter(l => l.status !== 'Draft');
                    return updated.sort((a,b) => a.lectureNumber - b.lectureNumber);
                });
            }
        });

        socketRef.current.on('lecture:deleted', (data) => {
            if (data.courseId === course.courseId) {
                setLectures(prev => {
                    const filtered = prev.filter(l => l._id !== data.lectureId);
                    // Adjust active index if necessary
                    if (activeLectureIndex >= filtered.length) {
                        setActiveLectureIndex(Math.max(0, filtered.length - 1));
                    }
                    return filtered;
                });
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [course]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (speedMenuRef.current && !speedMenuRef.current.contains(event.target)) {
                setShowSpeedMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Apply playback speed when video changes or speed changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed, activeLectureIndex]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            playerContainerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleNext = () => {
        if (activeLectureIndex < lectures.length - 1) {
            setActiveLectureIndex(prev => prev + 1);
            setIsPlaying(false);
        }
    };

    const handlePrev = () => {
        if (activeLectureIndex > 0) {
            setActiveLectureIndex(prev => prev - 1);
            setIsPlaying(false);
        }
    };
    
    // Video Helper Functions
    const formatVideoTime = (time) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getDurationText = (duration) => {
        if (!duration) return '0 mins';
        const mins = Number(duration);
        if (mins < 1) return '< 1 min';
        return `${mins} mins`;
    };

    const getOptimizedVideoUrl = (url) => {
        if (!url) return '';
        // If it's a standard cloudinary upload URL without existing optimization
        if (url.includes('/upload/') && !url.includes('q_auto')) {
            return url.replace('/upload/', '/upload/q_auto,f_auto/');
        }
        return url;
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            // Reset state for new video
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    const handleTimelineClick = (e) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * duration;
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
            if (!newMuted && volume === 0) {
                setVolume(1);
                videoRef.current.volume = 1;
            }
        }
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
            setIsMuted(val === 0);
        }
    };
    
    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const handleMouseLeave = () => {
        if (isPlaying) setShowControls(false);
    };

    if (!course || loadingLectures) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Determine Active State
    const hasRealLectures = lectures.length > 0;
    const activeLecture = hasRealLectures ? lectures[activeLectureIndex] : null;

    // Helper to format duration
    const formatDuration = (mins) => {
        return `${mins} mins`;
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] w-full flex-1 overflow-hidden bg-[#F8FAFC]">
            {/* LEFT SIDEBAR - WIDER AS REQUESTED */}
            <div className="w-full md:w-[360px] lg:w-[400px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shadow-[2px_0_15px_rgba(0,0,0,0.03)] z-10">
                {/* Sidebar Header */}
                <div className="p-5 lg:p-6 border-b border-gray-100 bg-white">
                    <Link to="/my-courses" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-4 gap-1.5">
                        <ArrowLeft size={16} /> Back to My Courses
                    </Link>
                    
                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight mb-1 line-clamp-2">{course.courseName}</h2>
                    <p className="text-sm font-medium text-gray-500 mb-5">{course.instituteName}</p>
                    
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                        <span>{course.progressPercentage}% complete</span>
                        <span className="text-gray-400">0/{hasRealLectures ? lectures.length : 1} lectures</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                            style={{ width: `${course.progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Sidebar Content Header */}
                <div className="px-5 lg:px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-extrabold text-gray-800 text-sm">Course Content</h3>
                    <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
                        {hasRealLectures ? lectures.length : 0} Lectures
                    </span>
                </div>

                {/* Lectures List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-200 bg-white">
                    <div className="flex flex-col gap-1.5">
                        {!hasRealLectures ? (
                            // Empty State / Placeholder
                            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                <FileText size={40} className="text-gray-200 mb-4" />
                                <h4 className="text-base font-bold text-gray-700 mb-1">No Lectures Yet</h4>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">The institute is preparing the course content. Lectures will appear here automatically.</p>
                            </div>
                        ) : (
                            // Real Lectures
                            lectures.map((lec, idx) => {
                                const isActive = idx === activeLectureIndex;
                                return (
                                    <button
                                        key={lec._id}
                                        onClick={() => setActiveLectureIndex(idx)}
                                        className={`flex items-start gap-4 p-3.5 rounded-xl transition-all duration-200 text-left relative group ${
                                            isActive 
                                                ? 'bg-blue-50/80 border-transparent shadow-[inset_4px_0_0_#2563eb]' 
                                                : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold mt-0.5 transition-colors ${
                                            isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                        }`}>
                                            {String(lec.lectureNumber).padStart(2, '0')}
                                        </div>
                                        <div className="flex-1 pr-2 min-w-0">
                                            <h4 className={`text-[13px] font-bold leading-snug mb-1.5 line-clamp-2 ${
                                                isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                                            }`}>
                                                {lec.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-gray-500">
                                                <span className={`flex items-center gap-1 ${isActive ? 'text-blue-600' : ''}`}>
                                                    <Clock size={12} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                                    {formatDuration(lec.duration)}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1 text-gray-500">{lec.type}</span>
                                            </div>
                                        </div>
                                        {lec.status === 'Coming Soon' && (
                                            <div className="absolute right-3 top-3 text-[9px] font-extrabold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                                Soon
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN VIDEO AREA */}
            <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
                {/* Header */}
                <div className="px-6 lg:px-10 py-5 flex items-center justify-between border-b border-gray-200 bg-white shrink-0 sticky top-0 z-20 shadow-sm">
                    <h1 className="text-lg lg:text-xl font-extrabold text-gray-900 truncate pr-4">
                        {hasRealLectures ? `Lecture ${activeLecture.lectureNumber}: ${activeLecture.title}` : 'Course Overview'}
                    </h1>
                </div>

                {/* Video Player Section */}
                <div className="p-4 md:p-6 lg:p-10 flex flex-col max-w-[1200px] w-full mx-auto flex-1">
                    <div 
                        ref={playerContainerRef} 
                        className="w-full aspect-video bg-[#0F172A] rounded-2xl md:rounded-[24px] shadow-2xl relative overflow-hidden group flex flex-col justify-center border border-gray-800"
                    >
                        {!hasRealLectures || activeLecture.status === 'Coming Soon' || !activeLecture.video?.secureUrl ? (
                            // Placeholder State
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0F172A]">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                                    <Play size={36} className="fill-gray-500 text-gray-500 ml-2 opacity-50" />
                                </div>
                                <h2 className="text-white text-2xl font-extrabold tracking-tight mb-2">
                                    {!hasRealLectures ? 'Content in Preparation' : 'Coming Soon'}
                                </h2>
                                <p className="text-gray-400 text-sm font-medium mb-1">
                                    {!hasRealLectures ? 'The course material will be available here shortly.' : 'This lecture will be published soon.'}
                                </p>
                            </div>
                        ) : (
                            // Custom HTML5 Video Player
                            <div 
                                className="relative w-full h-full"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <video 
                                    ref={videoRef}
                                    className="w-full h-full object-contain bg-black cursor-pointer"
                                    src={getOptimizedVideoUrl(activeLecture.video.secureUrl)}
                                    poster={course.courseImage} // Fallback to course image as poster
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onClick={togglePlay}
                                    onEnded={handleNext}
                                />
                                
                                {/* Custom Controls Overlay */}
                                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-6 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                                    {/* Timeline */}
                                    <div 
                                        className="w-full h-1.5 md:h-2 bg-white/20 rounded-full mb-4 cursor-pointer relative group/timeline hover:bg-white/30 transition-colors" 
                                        onClick={handleTimelineClick}
                                    >
                                        <div 
                                            className="h-full bg-blue-500 rounded-full relative" 
                                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow cursor-grab scale-0 group-hover/timeline:scale-100 transition-transform"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-white">
                                        {/* Left Controls */}
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <button onClick={togglePlay} className="hover:text-blue-400 transition-colors focus:outline-none">
                                                {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
                                            </button>
                                            <div className="flex items-center gap-2 group/volume">
                                                <button onClick={toggleMute} className="hover:text-blue-400 transition-colors focus:outline-none">
                                                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                                </button>
                                                <input 
                                                    type="range" 
                                                    min="0" max="1" step="0.05" 
                                                    value={isMuted ? 0 : volume} 
                                                    onChange={handleVolumeChange}
                                                    className="w-0 md:group-hover/volume:w-20 transition-all duration-300 overflow-hidden cursor-pointer accent-blue-500 opacity-0 md:group-hover/volume:opacity-100"
                                                />
                                            </div>
                                            <div className="text-xs md:text-sm font-medium text-gray-300 tabular-nums">
                                                {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                                            </div>
                                        </div>
                                        
                                        {/* Right Controls */}
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="relative" ref={speedMenuRef}>
                                                <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="hover:text-blue-400 transition-colors text-sm font-bold flex items-center gap-1.5 focus:outline-none">
                                                    <Settings size={20} />
                                                </button>
                                                {showSpeedMenu && (
                                                    <div className="absolute bottom-full right-0 mb-3 bg-gray-900/95 backdrop-blur-md rounded-xl overflow-hidden py-2 min-w-[140px] shadow-2xl border border-gray-700">
                                                        <div className="px-4 py-2 text-xs text-gray-400 font-bold border-b border-gray-800 uppercase tracking-wider">Playback Speed</div>
                                                        {[0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                                                            <button 
                                                                key={speed}
                                                                onClick={() => {
                                                                    setPlaybackSpeed(speed);
                                                                    setShowSpeedMenu(false);
                                                                }}
                                                                className={`w-full text-left px-5 py-2.5 text-sm hover:bg-gray-800 transition-colors ${playbackSpeed === speed ? 'text-blue-400 font-extrabold bg-gray-800/50' : 'text-gray-200 font-medium'}`}
                                                            >
                                                                {speed === 1 ? 'Normal' : `${speed}x`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={toggleFullscreen} className="hover:text-blue-400 transition-colors focus:outline-none">
                                                <Maximize size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Below Video Description */}
                    {hasRealLectures && (
                        <div className="mt-8 flex flex-col md:flex-row items-start justify-between gap-6 bg-white p-6 md:p-8 rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-3 truncate">Lecture {activeLecture.lectureNumber}: {activeLecture.title}</h2>
                                <div className="flex flex-wrap items-center gap-3 mb-5 text-xs font-bold text-gray-500">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-wide">{activeLecture.type}</span>
                                    <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5"><Clock size={14} /> {activeLecture.duration} mins</span>
                                </div>
                                <p className="text-[15px] text-gray-600 font-medium leading-relaxed max-w-3xl whitespace-pre-wrap">
                                    {activeLecture.description || 'No description provided.'}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                <button 
                                    onClick={handlePrev}
                                    disabled={activeLectureIndex === 0}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={18} /> Previous
                                </button>
                                <button 
                                    onClick={handleNext}
                                    disabled={activeLectureIndex === lectures.length - 1}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_2px_10px_rgba(37,99,235,0.2)]"
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LecturePlayer;
