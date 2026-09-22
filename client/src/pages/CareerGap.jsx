import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Target, TrendingUp, BookOpen, CheckCircle2, AlertCircle,
  ChevronDown, GraduationCap, MapPin, Clock, Zap, ArrowRight,
  Sparkles, Users, Star, ExternalLink, Layers, Award, Building2
} from 'lucide-react';

const CareerGap = () => {
  const { backendUrl, userData, jobs } = useContext(AppContext);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [targetJobs, setTargetJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [enrollingBatchId, setEnrollingBatchId] = useState(null);

  // Fetch all jobs for the dropdown
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const token = await getToken();
        const { data } = await axios.get(backendUrl + '/api/users/career/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setTargetJobs(data.jobs);
        }
      } catch (err) {
        toast.error('Could not load jobs.');
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch career analysis when job is selected
  useEffect(() => {
    if (!selectedJobId) {
      setAnalysis(null);
      return;
    }
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setAnalysis(null);
        const token = await getToken();
        const { data } = await axios.get(
          backendUrl + `/api/users/career/skill-gap/${selectedJobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          setAnalysis(data.analysis);
        } else {
          toast.error(data.message || 'Could not load analysis.');
        }
      } catch (err) {
        toast.error('Failed to fetch career analysis.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [selectedJobId]);

  const handleEnroll = async (batchId) => {
    try {
      setEnrollingBatchId(batchId);
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/users/enroll',
        { batchId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Successfully enrolled in training batch!');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrollingBatchId(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', stroke: 'text-green-500', badge: 'bg-green-100 text-green-700 border-green-200' };
    if (score >= 50) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', stroke: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', stroke: 'text-red-500', badge: 'bg-red-100 text-red-700 border-red-200' };
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 75) return 'Strong Match';
    if (score >= 50) return 'Moderate Match';
    return 'Skill Gap Detected';
  };

  const colors = analysis ? getScoreColor(analysis.matchScore) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Page Header */}
      <div className="w-full bg-white border-b border-gray-100 px-6 lg:px-10 py-8 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
              <Target size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Lumi Career &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Skill Gap</span> Analyzer
              </h1>
              <p className="text-[15px] text-gray-500 font-medium mt-1.5 max-w-2xl">
                Select a target job to analyze your skill match. If your score is below 50%, we'll recommend government-approved training courses to bridge the gap.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                  <Zap size={13} className="text-purple-500" /> Instant Analysis
                </span>
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                  <GraduationCap size={13} className="text-blue-500" /> Govt. Courses
                </span>
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                  <TrendingUp size={13} className="text-green-500" /> Career Growth
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-8">

        {/* Job Selector Card */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]">
          <label className="block text-[13px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">
            Find Your Skill Gap: Choose a Target Job
          </label>
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              disabled={loadingJobs}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-[15px] font-semibold px-5 py-4 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all cursor-pointer disabled:opacity-60"
            >
              <option value="">
                {loadingJobs ? 'Loading jobs...' : '— Select a job position to analyze —'}
              </option>
              {targetJobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} at {job.companyId?.name} ({job.location})
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-[24px] p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-500 animate-spin"></div>
            <p className="text-gray-500 font-semibold text-[15px]">Analyzing your skill gap...</p>
          </div>
        )}

        {/* Analysis Results */}
        {!loading && analysis && (
          <>
            {/* Score + Job Info Card */}
            <div className={`bg-white rounded-[24px] p-6 sm:p-8 border-2 ${colors.border} shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] relative overflow-hidden`}>
              <div className={`absolute -top-20 -right-20 w-64 h-64 ${colors.bg} rounded-full blur-3xl opacity-50 pointer-events-none`}></div>

              <div className="flex flex-col sm:flex-row gap-8 items-center z-10 relative">
                {/* Circular Score */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 36 36">
                      <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path
                        className={`${colors.stroke} transition-all duration-1000 ease-out`}
                        strokeDasharray={`${analysis.matchScore}, 100`}
                        strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="flex flex-col items-center justify-center bg-white rounded-full w-[116px] h-[116px] shadow-sm border border-gray-50 z-10">
                      <span className={`text-4xl font-black tracking-tight ${colors.text}`}>{analysis.matchScore}%</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Your Skill Match</span>
                    </div>
                  </div>
                  <span className={`mt-4 px-4 py-1.5 rounded-full text-xs font-extrabold border ${colors.badge}`}>
                    {getScoreLabel(analysis.matchScore)}
                  </span>
                </div>

                {/* Job Info + Key Stats */}
                <div className="flex-1 w-full">
                  <h2 className="text-xl font-extrabold text-gray-900">{analysis.job?.title}</h2>
                  <p className="text-[14px] font-medium text-gray-500 mt-1 flex items-center gap-2">
                    <Building2 size={14} /> {analysis.job?.company}
                    <span className="text-gray-300">•</span>
                    <MapPin size={14} /> {analysis.job?.location}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mt-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-600">{analysis.matchedSkills?.length || 0}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Matched</p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <p className="text-2xl font-black text-red-500">{analysis.missingSkills?.length || 0}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Missing</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-700">{analysis.requiredSkills?.length || 0}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Required</p>
                    </div>
                  </div>

                  {/* Apply nudge if match >= 75 */}
                  {analysis.matchScore >= 75 && (
                    <div className="mt-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                      <CheckCircle2 size={22} className="text-green-500 shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold text-green-800 text-[14px]">You're a great fit! Consider applying now.</p>
                        <p className="text-green-600 text-[12px] font-medium">Your skills strongly align with this role.</p>
                      </div>
                      <button
                        onClick={() => {
                          const job = targetJobs.find(j => j._id === selectedJobId);
                          if (job) navigate(`/apply-job/${job._id}`);
                        }}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-green-500/20 whitespace-nowrap"
                      >
                        Apply Now <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Matched Skills */}
            {analysis.matchedSkills?.length > 0 && (
              <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
                <h3 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  Your Matched Skills
                  <span className="ml-auto text-[13px] font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                    {analysis.matchedSkills.length} of {analysis.requiredSkills.length} matched
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {analysis.matchedSkills.map((skill, i) => (
                    <span key={i} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 font-bold text-[13px] px-4 py-2 rounded-full shadow-sm">
                      <CheckCircle2 size={14} className="text-green-500 fill-green-100" /> {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {analysis.missingSkills?.length > 0 && (
              <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
                <h3 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                    <AlertCircle size={18} />
                  </div>
                  Skills You Need (Missing)
                  <span className="ml-auto text-[13px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                    {analysis.missingSkills.length} skills missing
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {analysis.missingSkills.map((skill, i) => (
                    <span key={i} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 font-bold text-[13px] px-4 py-2 rounded-full shadow-sm">
                      <AlertCircle size={14} className="text-red-400" /> {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* No missing skills */}
            {analysis.missingSkills?.length === 0 && analysis.requiredSkills?.length > 0 && (
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 text-center shadow-sm">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <p className="text-[15px] font-extrabold text-gray-900">You have all required skills!</p>
                <p className="text-gray-500 text-sm mt-1">You're fully qualified. Go ahead and apply.</p>
              </div>
            )}

            {/* Government Course Recommendations — only when matchScore < 50 */}
            {analysis.matchScore < 50 && analysis.recommendations?.length > 0 && (
              <div className="flex flex-col gap-5">
                {/* Section Header */}
                <div className="flex items-start gap-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-[24px] p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                    <GraduationCap size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Recommended Government Training</h3>
                    <p className="text-[14px] text-gray-500 font-medium mt-0.5">
                      Based on your missing skills, these government-certified courses can help you qualify for this role.
                    </p>
                  </div>
                </div>

                {/* Course Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {analysis.recommendations.map((rec, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigate('/upskilling')}
                      className="cursor-pointer bg-white rounded-[20px] p-6 border border-gray-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] hover:border-violet-200 transition-all duration-300 flex flex-col gap-4"
                    >
                      {/* Course Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shrink-0">
                          <BookOpen size={22} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-gray-900 text-[15px] leading-snug">{rec.courseName}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[13px] text-gray-500 font-medium">
                            <Building2 size={13} className="shrink-0 text-violet-500" />
                            <span className="truncate">{rec.instituteName}</span>
                          </div>
                          {rec.districtName && rec.districtName !== 'Unknown' && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-gray-400">
                              <MapPin size={12} className="shrink-0" /> {rec.districtName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Covered Skills */}
                      {rec.coveredSkills?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Skills You'll Learn</p>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.coveredSkills.map((skill, si) => (
                              <span key={si} className="text-[12px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Batch Status + Enroll */}
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {rec.batchAvailable ? (
                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Batch Available
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                              <Clock size={12} /> Coming Soon
                            </span>
                          )}
                        </div>

                        {rec.batchAvailable && rec.batchId ? (
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEnroll(rec.batchId);
                            }}
                            disabled={enrollingBatchId === rec.batchId}
                            className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-md shadow-violet-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {enrollingBatchId === rec.batchId ? (
                              <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Enrolling...</>
                            ) : (
                              <><GraduationCap size={14} /> Enroll Now</>
                            )}
                          </button>
                        ) : (
                          <span className="text-[13px] font-bold text-gray-400">No batch yet</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* When match < 50 but no course recommendations yet */}
            {analysis.matchScore < 50 && analysis.recommendations?.length === 0 && analysis.missingSkills?.length > 0 && (
              <div className="bg-white rounded-[24px] p-8 border border-dashed border-violet-200 shadow-sm flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
                  <GraduationCap size={32} className="text-violet-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-[16px]">No courses available yet</h4>
                  <p className="text-[14px] text-gray-500 mt-1 max-w-md">
                    Government training institutes haven't added courses for your missing skills yet. Check back soon, or contact your nearest training institute.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {analysis.missingSkills.slice(0, 5).map((skill, i) => (
                    <span key={i} className="text-[13px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full">
                      {skill.name}
                    </span>
                  ))}
                  {analysis.missingSkills.length > 5 && (
                    <span className="text-[13px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                      +{analysis.missingSkills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* No skill data for this job */}
            {analysis.requiredSkills?.length === 0 && (
              <div className="bg-white rounded-[24px] p-8 border border-gray-100 flex flex-col items-center text-center gap-3 shadow-sm">
                <Layers size={40} className="text-gray-300" />
                <p className="font-bold text-gray-700 text-[16px]">Skill data not available</p>
                <p className="text-[14px] text-gray-400 max-w-sm">
                  {analysis.message || 'This job does not have skill requirements configured yet. Try another job.'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty State — no job selected */}
        {!loading && !analysis && !selectedJobId && (
          <div className="bg-white rounded-[24px] p-12 border border-dashed border-gray-200 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 flex items-center justify-center">
              <Target size={36} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-gray-900">Select a Target Job</h3>
              <p className="text-[14px] text-gray-500 mt-1.5 max-w-sm">
                Choose a job position above to instantly see your skill match score and get personalized course recommendations.
              </p>
            </div>
            <div className="flex items-center gap-6 mt-4 text-[13px] text-gray-400 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> Matched skills</span>
              <span className="flex items-center gap-1.5"><AlertCircle size={14} className="text-red-400" /> Missing skills</span>
              <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-violet-400" /> Govt. courses</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerGap;
