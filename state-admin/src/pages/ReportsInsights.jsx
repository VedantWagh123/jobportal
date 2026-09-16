import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
    AreaChart, Area
} from 'recharts';
import { 
    TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Sparkles, Filter, Briefcase, X, ChevronRight, BookOpen, Map
} from 'lucide-react';
import SendRequirementModal from '../components/SendRequirementModal';
import DistrictSectorDeepDive from '../components/DistrictSectorDeepDive';

const ReportsInsights = () => {
    const { user } = useContext(AuthContext);
    
    // Tabs
    const [activeTab, setActiveTab] = useState('deepdive');

    // State
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    
    // Filters
    const [selectedState, setSelectedState] = useState(user?.stateName || 'Maharashtra');
    const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
    const [availableDistricts, setAvailableDistricts] = useState([]);
    
    // AI Insights
    const [aiInsight, setAiInsight] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    
    // Campaign Modal
    const [campaignSkill, setCampaignSkill] = useState(null);
    
    useEffect(() => {
        fetchDistricts();
        if (activeTab === 'predictive') {
            fetchForecastData();
        }
    }, [selectedState, selectedDistrict, activeTab]);

    const fetchDistricts = async () => {
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const res = await axios.get('/api/state-admin/intelligence/districts', {
                params: { state: selectedState },
                headers: { token }
            });
            if (res.data.success) {
                setAvailableDistricts(res.data.districts);
            }
        } catch (err) {
            console.error("Failed to fetch districts");
        }
    };

    const fetchForecastData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const res = await axios.get('/api/state-admin/intelligence/forecast', {
                params: {
                    state: selectedState,
                    district: selectedDistrict
                },
                headers: { token }
            });
            if (res.data.success) {
                setData(res.data.forecast);
                setLastUpdated(res.data.forecast.timestamp);
                setAiInsight(null); // Reset AI insight on new data
            } else {
                setError("Failed to load forecast data.");
            }
        } catch (err) {
            console.error("Error fetching forecast:", err);
            setError(err.response?.data?.message || "An error occurred while forecasting data.");
        } finally {
            setLoading(false);
        }
    };

    const generateAIInsights = async () => {
        if (!data) return;
        setAiLoading(true);
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const res = await axios.post('/api/state-admin/intelligence/forecast/insights', {
                forecastData: data
            }, { headers: { token } });
            if (res.data.success) {
                setAiInsight(res.data.insights);
            }
        } catch (err) {
            console.error("AI Insights Error:", err);
            setAiInsight("AI Policy Insights are currently unavailable. Please review the raw forecast data below.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleCreateCampaign = (skillName) => {
        setCampaignSkill(skillName);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans pb-24">
            
            {/* TOP NAVIGATION / HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#10233F] tracking-tight flex items-center gap-2">
                        State Reports & Insights
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-1 max-w-2xl">
                        Comprehensive analytics suite powered by real-time hiring, training, and placement data.
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm">
                    <Filter size={16} className="text-gray-400 ml-2" />
                    
                    <select 
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="bg-transparent text-[13px] font-bold text-gray-700 focus:outline-none border-none py-2 pr-6 cursor-pointer"
                    >
                        <option value="All India">All India</option>
                        <option value="Maharashtra">Maharashtra</option>
                    </select>

                    <div className="w-px h-6 bg-gray-200"></div>

                    <select 
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="bg-transparent text-[13px] font-bold text-gray-700 focus:outline-none border-none py-2 pr-6 cursor-pointer"
                    >
                        <option value="All Districts">All Districts</option>
                        {availableDistricts.map(d => (
                            <option key={d._id} value={d._id}>{d._id}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TAB BAR */}
            <div className="flex border-b border-gray-200 mb-8 gap-6">
                <button 
                    onClick={() => setActiveTab('deepdive')}
                    className={`pb-4 text-[14px] font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'deepdive' ? 'text-[#16A34A] border-[#16A34A]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}
                >
                    <Map size={18} />
                    District & Sector Deep-Dive
                </button>
                <button 
                    onClick={() => setActiveTab('predictive')}
                    className={`pb-4 text-[14px] font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'predictive' ? 'text-[#16A34A] border-[#16A34A]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}
                >
                    <TrendingUp size={18} />
                    Predictive Insights
                </button>
            </div>

            {activeTab === 'deepdive' && (
                <DistrictSectorDeepDive selectedState={selectedState} selectedDistrict={selectedDistrict} />
            )}

            {activeTab === 'predictive' && (
                <div className="animate-fadeIn">
                    {loading && !data ? (
                        <div className="flex flex-col items-center justify-center h-[500px]">
                            <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
                            <h2 className="text-gray-700 font-bold">Analyzing Historical Data & Generating Forecasts...</h2>
                        </div>
                    ) : error && !data ? (
                        <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                            <h2 className="text-gray-900 font-bold text-lg mb-2">Forecasting Engine Error</h2>
                            <p className="text-gray-600 text-sm">{error}</p>
                            <button onClick={fetchForecastData} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">Retry</button>
                        </div>
                    ) : (
                        <>
                            {/* KPI ROW */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Emerging Skills</p>
                                            <h3 className="text-3xl font-black text-gray-900">{data?.emergingSkills?.length || 0}</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <TrendingUp size={20} className="text-emerald-500" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-4">Skills showing strong deterministic growth.</p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Declining Skills</p>
                                            <h3 className="text-3xl font-black text-gray-900">{data?.decliningSkills?.length || 0}</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                            <TrendingDown size={20} className="text-red-500" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-4">Skills losing market demand over time.</p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Projected Shortages</p>
                                            <h3 className="text-3xl font-black text-gray-900">{data?.shortages?.length || 0}</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                                            <AlertTriangle size={20} className="text-orange-500" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-4">Skills where future demand exceeds supply.</p>
                                </div>
                            </div>

                            {/* AI POLICY INSIGHTS PANEL */}
                            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={20} className="text-blue-600" />
                                        <h3 className="text-lg font-black text-gray-900">AI Policy Insights</h3>
                                    </div>
                                    {!aiInsight && (
                                        <button 
                                            onClick={generateAIInsights}
                                            disabled={aiLoading}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
                                        >
                                            {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                            Generate AI Insights
                                        </button>
                                    )}
                                </div>
                                
                                {aiInsight ? (
                                    <div className="bg-white/80 p-5 rounded-xl border border-blue-100/50 text-[13px] leading-relaxed text-gray-700 font-medium whitespace-pre-wrap shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                        {aiInsight}
                                    </div>
                                ) : (
                                    <p className="text-[13px] text-gray-500 font-medium max-w-2xl">
                                        Click the button above to generate a high-level policy interpretation based on the current forecasting models. This action utilizes the Gemini AI engine to interpret the raw structured data.
                                    </p>
                                )}
                            </div>

                            {/* FORECAST CHART */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                                <h3 className="text-lg font-black text-gray-900 mb-1">Macro Demand vs Supply Forecast</h3>
                                <p className="text-[12px] text-gray-500 mb-6 font-medium">Historical data linearly extrapolated for the next 6 months.</p>
                                
                                {data?.chartData && data.chartData.length > 0 ? (
                                    <div className="h-[350px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                                                    dy={10} 
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                                                    dx={-10}
                                                />
                                                <RechartsTooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                                    labelStyle={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '20px' }} />
                                                
                                                <Area 
                                                    type="monotone" 
                                                    name="Projected Demand"
                                                    dataKey="demand" 
                                                    stroke="#3b82f6" 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorDemand)" 
                                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    name="Projected Supply"
                                                    dataKey="supply" 
                                                    stroke="#10b981" 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorSupply)" 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-[13px] font-semibold text-gray-500">Insufficient historical data for reliable forecasting.</p>
                                    </div>
                                )}
                            </div>

                            {/* EMERGING & DECLINING SKILLS */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Emerging Skills */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-emerald-50/30">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp size={18} className="text-emerald-500" />
                                            <h3 className="text-[15px] font-black text-gray-900">Emerging Skills</h3>
                                        </div>
                                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Growth &gt; 10%</span>
                                    </div>
                                    
                                    <div className="p-2 flex-grow overflow-y-auto max-h-[400px] custom-scrollbar">
                                        {data?.emergingSkills?.length > 0 ? (
                                            data.emergingSkills.map((skill, idx) => (
                                                <div key={idx} className="p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0 group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-[14px] text-gray-800">{skill.skill}</h4>
                                                        <span className="text-[12px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shadow-sm">
                                                            +{skill.growthPercentage}%
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-medium mb-3">{skill.reason}</p>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold bg-white border border-gray-100 rounded-lg p-2">
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">Current Demand</span>
                                                            <span className="text-gray-700">{skill.currentDemand}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">6Mo Forecast</span>
                                                            <span className="text-blue-600 font-bold">{skill.projectedDemand}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 text-[12px] font-medium">
                                                No emerging skills detected with high confidence in the selected dataset.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Declining Skills */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-red-50/30">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown size={18} className="text-red-500" />
                                            <h3 className="text-[15px] font-black text-gray-900">Obsolescence Warnings</h3>
                                        </div>
                                        <span className="text-[11px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">Decline &lt; -10%</span>
                                    </div>
                                    
                                    <div className="p-2 flex-grow overflow-y-auto max-h-[400px] custom-scrollbar">
                                        {data?.decliningSkills?.length > 0 ? (
                                            data.decliningSkills.map((skill, idx) => (
                                                <div key={idx} className="p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0 group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-[14px] text-gray-800">{skill.skill}</h4>
                                                        <span className="text-[12px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded shadow-sm">
                                                            {skill.growthPercentage}%
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-medium mb-3">{skill.reason}</p>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold bg-white border border-gray-100 rounded-lg p-2">
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">Current Demand</span>
                                                            <span className="text-gray-700">{skill.currentDemand}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">6Mo Forecast</span>
                                                            <span className="text-red-500 font-bold">{skill.projectedDemand}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 text-[12px] font-medium">
                                                No significantly declining skills detected in the selected dataset.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* PROJECTED SHORTAGES (COLLISION FORECAST) */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-orange-50/30">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-orange-500" />
                                        <h3 className="text-[15px] font-black text-gray-900">Projected Skill Shortages (Next 6 Months)</h3>
                                    </div>
                                </div>
                                
                                <div className="p-0 overflow-x-auto">
                                    {data?.shortages?.length > 0 ? (
                                        <table className="w-full text-[13px] text-left">
                                            <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Skill Cluster</th>
                                                    <th className="px-6 py-4 text-center">Current Demand</th>
                                                    <th className="px-6 py-4 text-center">Projected Demand</th>
                                                    <th className="px-6 py-4 text-center">Projected Supply</th>
                                                    <th className="px-6 py-4 text-center">Projected Gap</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {data.shortages.map((skill, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-800">{skill.skill}</td>
                                                        <td className="px-6 py-4 text-center font-semibold text-gray-600">{skill.currentDemand}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-blue-600">{skill.projectedDemand}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{skill.currentSupply}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="bg-red-50 text-red-600 font-black px-2 py-1 rounded">
                                                                -{skill.projectedGap}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button 
                                                                onClick={() => handleCreateCampaign(skill.skill)}
                                                                className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
                                                            >
                                                                Create Campaign <ChevronRight size={12} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-10 flex flex-col items-center justify-center text-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                <BookOpen size={20} className="text-gray-400" />
                                            </div>
                                            <h4 className="text-[14px] font-bold text-gray-800 mb-1">No Future Shortages Detected</h4>
                                            <p className="text-[12px] text-gray-500 font-medium max-w-md">
                                                Based on the deterministic forecasting model, current supply capacity appears sufficient to meet projected demand over the next 6 months.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {campaignSkill && (
                        <SendRequirementModal 
                            isOpen={!!campaignSkill}
                            onClose={() => setCampaignSkill(null)}
                            prefilledSkill={campaignSkill}
                            districtId={selectedDistrict !== 'All Districts' ? selectedDistrict : null}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsInsights;
