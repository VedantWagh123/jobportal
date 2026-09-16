import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';
import { AppContext } from '../context/AppContext';
import { 
    BookOpen, MapPin, Clock, X, ChevronRight, 
    Sparkles, CheckCircle, AlertCircle, GraduationCap,
    Layers, Download, Image as ImageIcon, FileText
} from 'lucide-react';

// --- PDF DOWNLOAD HANDLER ---
const downloadCurriculumPDF = (course) => {
    const printWindow = window.open('', '_blank');
    const hasCurriculum = course.courseCurriculum && course.courseCurriculum.length > 0;

    const curriculumHTML = hasCurriculum
        ? course.courseCurriculum.map(month => `
            <div class="month-block">
                <div class="month-header">
                    <span class="month-badge">Month ${month.month}</span>
                    <span class="month-title">${month.title || `Module ${month.month}`}</span>
                </div>
                ${month.topics && month.topics.length > 0
                    ? `<div class="topics-grid">
                        ${month.topics.map(t => `<span class="topic-chip">${t}</span>`).join('')}
                      </div>`
                    : '<p class="no-topics">No topics specified.</p>'
                }
            </div>
        `).join('')
        : '<p class="empty">No curriculum has been added for this course yet.</p>';

    const skillsHTML = course.coveredSkills && course.coveredSkills.length > 0
        ? course.coveredSkills.map(s => `<span class="skill-chip">${s}</span>`).join('')
        : 'Not specified';

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>${course.courseName} - Curriculum</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
                .header { border-bottom: 3px solid #4f46e5; padding-bottom: 24px; margin-bottom: 28px; }
                .logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
                .logo-badge { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
                .course-title { font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
                .meta-row { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 12px; }
                .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; font-weight: 500; }
                .meta-label { font-weight: 700; color: #334155; }
                .section { margin-bottom: 28px; }
                .section-title { font-size: 11px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
                .skills-row { display: flex; flex-wrap: wrap; gap: 8px; }
                .skill-chip { background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 600; }
                .month-block { border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; overflow: hidden; page-break-inside: avoid; }
                .month-header { background: #f8fafc; padding: 14px 18px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #e2e8f0; }
                .month-badge { background: #4f46e5; color: white; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 800; min-width: 56px; text-align: center; }
                .month-title { font-size: 14px; font-weight: 700; color: #1e293b; }
                .topics-grid { padding: 14px 18px; display: flex; flex-wrap: wrap; gap: 8px; }
                .topic-chip { background: #fff; border: 1px solid #cbd5e1; color: #475569; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 500; }
                .no-topics, .empty { padding: 14px 18px; color: #94a3b8; font-size: 13px; font-style: italic; }
                .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px; text-align: center; color: #94a3b8; font-size: 11px; }
                @media print {
                    body { padding: 20px; }
                    .month-block { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-row">
                    <span class="logo-badge">📘 Course Curriculum</span>
                </div>
                <div class="course-title">${course.courseName}</div>
                <div class="meta-row">
                    <div class="meta-item"><span class="meta-label">Institute:</span> ${course.instituteName}</div>
                    <div class="meta-item"><span class="meta-label">Location:</span> ${course.districtName || 'N/A'}</div>
                    <div class="meta-item"><span class="meta-label">Duration:</span> ${course.durationMonths || 'N/A'} Months</div>
                    <div class="meta-item"><span class="meta-label">Mode:</span> ${course.location || 'Online'}</div>
                    <div class="meta-item"><span class="meta-label">Batch:</span> ${course.batchAvailable ? 'Available' : 'Not Available'}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Skills You Will Learn</div>
                <div class="skills-row">${skillsHTML}</div>
            </div>

            <div class="section">
                <div class="section-title">Month-by-Month Curriculum</div>
                ${curriculumHTML}
            </div>

            <div class="footer">
                Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;|&nbsp; SkillSet India Job Portal
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
};

// --- GRADIENT PLACEHOLDER (when no image) ---
const CoursePlaceholder = ({ name }) => {
    const colors = [
        'from-indigo-500 to-purple-600',
        'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
    ];
    const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
    const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'C';
    return (
        <div className={`w-full h-full bg-gradient-to-br ${color} flex flex-col items-center justify-center`}>
            <span className="text-white text-3xl font-black opacity-80">{initials}</span>
            <span className="text-white/60 text-xs mt-1 font-medium">No Thumbnail</span>
        </div>
    );
};

// --- CURRICULUM MODAL ---
const CurriculumModal = ({ course, onClose }) => {
    if (!course) return null;
    const hasCurriculum = course.courseCurriculum && course.courseCurriculum.length > 0;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4" 
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Banner Image / Gradient */}
                <div className="relative h-36 overflow-hidden flex-shrink-0">
                    {course.courseImage ? (
                        <img 
                            src={course.courseImage} 
                            alt={course.courseName} 
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display='none'; }}
                        />
                    ) : (
                        <CoursePlaceholder name={course.courseName} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {/* Close button */}
                    <button 
                        onClick={onClose} 
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers size={13} className="text-indigo-300" />
                            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Course Curriculum</span>
                        </div>
                        <h2 className="text-white font-bold text-lg leading-tight">{course.courseName}</h2>
                        <p className="text-white/70 text-xs mt-0.5">{course.instituteName} · {course.districtName}</p>
                    </div>
                </div>

                {/* Meta Info Bar */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-x-5 gap-y-1.5">
                    {course.durationMonths > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <Clock size={12} className="text-slate-400" /> {course.durationMonths} Months
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <MapPin size={12} className="text-slate-400" /> {course.location || 'Online'}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${course.batchAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                        <CheckCircle size={12} />
                        {course.batchAvailable ? 'Batch Available' : 'No Active Batch'}
                    </div>
                </div>

                {/* Skills */}
                {course.coveredSkills?.length > 0 && (
                    <div className="px-6 pt-4 pb-2 flex-shrink-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Skills You Will Learn</p>
                        <div className="flex flex-wrap gap-2">
                            {course.coveredSkills.map((sk, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold">
                                    <Sparkles size={9} /> {sk}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Curriculum Body */}
                <div className="overflow-y-auto flex-1 px-6 py-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                        Month-by-Month Syllabus
                    </p>
                    {!hasCurriculum ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <FileText size={32} className="text-slate-300 mb-3" />
                            <p className="text-sm font-semibold text-slate-500">No curriculum added yet</p>
                            <p className="text-xs text-slate-400 mt-1">The institute hasn't uploaded a month-by-month syllabus.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {course.courseCurriculum.map((month, idx) => (
                                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors">
                                    <div className="bg-slate-50 px-4 py-3 flex items-center gap-3 border-b border-slate-100">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                                            M{month.month}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{month.title || `Month ${month.month} Module`}</p>
                                            {month.topics?.length > 0 && (
                                                <p className="text-[11px] text-slate-400 font-medium">{month.topics.length} topics</p>
                                            )}
                                        </div>
                                    </div>
                                    {month.topics?.length > 0 && (
                                        <div className="px-4 py-3 flex flex-wrap gap-2 bg-white">
                                            {month.topics.map((topic, tIdx) => (
                                                <span key={tIdx} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full font-medium">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
                    <button 
                        onClick={() => downloadCurriculumPDF(course)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                    >
                        <Download size={15} /> Download Curriculum PDF
                    </button>
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COURSE CARD ---
const CourseCard = ({ rec, enrolling, onEnroll, onViewDetails }) => {
    const urgencyColor = rec.urgencyMessage?.toLowerCase().includes('critical') 
        ? 'bg-red-50 text-red-600 border-red-100'
        : 'bg-amber-50 text-amber-700 border-amber-100';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 overflow-hidden flex flex-col">
            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden bg-slate-100 flex-shrink-0">
                {rec.courseImage ? (
                    <img 
                        src={rec.courseImage} 
                        alt={rec.courseName} 
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                    />
                ) : null}
                {/* Gradient placeholder shown when no image or image fails */}
                <div 
                    className="w-full h-full absolute inset-0"
                    style={{ display: rec.courseImage ? 'none' : 'flex' }}
                >
                    <CoursePlaceholder name={rec.courseName} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                {/* Urgency badge */}
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm ${urgencyColor} bg-white/90`}>
                    <AlertCircle size={10} />
                    <span className="truncate max-w-[180px]">{rec.urgencyMessage || 'High Demand'}</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1.5 line-clamp-2">{rec.courseName}</h3>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <GraduationCap size={12} className="flex-shrink-0" />
                    <span className="truncate font-medium">{rec.instituteName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span>{rec.districtName}</span>
                    {rec.durationMonths > 0 && (
                        <>
                            <span className="text-slate-200">·</span>
                            <Clock size={11} className="flex-shrink-0" />
                            <span>{rec.durationMonths}M</span>
                        </>
                    )}
                </div>

                {/* Skills */}
                {rec.coveredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {rec.coveredSkills.slice(0, 3).map((sk, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                                <Sparkles size={9} /> {sk}
                            </span>
                        ))}
                        {rec.coveredSkills.length > 3 && (
                            <span className="text-[11px] text-slate-400 self-center font-medium">+{rec.coveredSkills.length - 3} more</span>
                        )}
                    </div>
                )}

                {/* Buttons */}
                <div className="mt-auto flex gap-2">
                    <button
                        onClick={() => onViewDetails(rec)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                    >
                        <BookOpen size={13} /> View Details
                    </button>
                    <button
                        disabled={!rec.batchAvailable || enrolling === rec.batchId?.toString() || rec.isEnrolled}
                        onClick={() => onEnroll(rec.batchId)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs transition-colors ${
                            rec.isEnrolled
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                                : rec.batchAvailable
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {rec.isEnrolled ? (
                            <><CheckCircle size={13} /> Enrolled</>
                        ) : enrolling === rec.batchId?.toString() ? (
                            'Enrolling...'
                        ) : rec.batchAvailable ? (
                            <><ChevronRight size={13} /> Enroll Now</>
                        ) : (
                            'No Batches'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const AILearningRecommendations = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const { backendUrl } = useContext(AppContext);

    const [recommendations, setRecommendations] = useState([]);
    const [missingSkills, setMissingSkills] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleEnroll = async (batchId) => {
        if (!user || !batchId) return;
        try {
            setEnrolling(batchId.toString());
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/users/enroll`, { batchId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setRecommendations(prev => prev.map(rec => 
                    rec.batchId?.toString() === batchId.toString() ? { ...rec, isEnrolled: true } : rec
                ));
            }
        } catch (error) {
            console.error('Enroll failed:', error);
        } finally {
            setEnrolling(null);
        }
    };

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user || !isLoaded) return;
            try {
                const token = await getToken();
                const { data } = await axios.get(`${backendUrl}/api/users/career/market-recommendations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setRecommendations(data.recommendations || []);
                    setMissingSkills(data.missingSkills || []);
                    setMessage(data.message || '');
                }
            } catch (error) {
                console.error('Failed to fetch market recommendations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [user, isLoaded]);

    if (!user) return (
        <div className="text-center py-16 text-slate-500">Please log in to view AI recommendations.</div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Analysing market intelligence…</p>
        </div>
    );

    if (message && recommendations.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
                <CheckCircle className="text-emerald-500" size={30} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">You're all caught up!</h3>
            <p className="text-slate-500 text-sm">{message}</p>
        </div>
    );

    if (recommendations.length === 0) return (
        <div className="text-center py-16 text-slate-400 text-sm">No recommendations found based on your profile.</div>
    );

    return (
        <>
            {selectedCourse && <CurriculumModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center">
                        <AlertCircle size={15} className="text-rose-500" />
                    </div>
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">AI-Detected Market Gaps</span>
                </div>
                <p className="text-slate-600 text-sm">
                    Based on live market analysis, you are missing:
                    {missingSkills.map((sk, i) => (
                        <span key={i} className="ml-2 inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            <Sparkles size={9} className="text-indigo-500" /> {sk}
                        </span>
                    ))}
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {recommendations.map((rec, idx) => (
                    <CourseCard
                        key={idx}
                        rec={rec}
                        enrolling={enrolling}
                        onEnroll={handleEnroll}
                        onViewDetails={setSelectedCourse}
                    />
                ))}
            </div>
        </>
    );
};

export default AILearningRecommendations;
