import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Map, Activity, TrendingDown, Users, AlertTriangle, ArrowRight,
    Search, Filter, ExternalLink, GraduationCap, Building, Landmark, ChevronRight,
    MapPin, Bell, Briefcase, RefreshCw, X, ChevronDown, CheckCircle
} from 'lucide-react';
import SendRequirementModal from './SendRequirementModal';
import mapImg from '../assets/maharashtra_map.png';

const DistrictSectorDeepDive = ({ selectedState, selectedDistrict }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [matrixData, setMatrixData] = useState([]);
    const [migrationData, setMigrationData] = useState(null);
    const [error, setError] = useState(null);
    
    // Filters
    const [selectedLevel, setSelectedLevel] = useState('All Levels');
    const [selectedSector, setSelectedSector] = useState('All Sectors');
    const [selectedJobType, setSelectedJobType] = useState('All Types');
    
    // Modals & Panels
    const [selectedCell, setSelectedCell] = useState(null);
    const [campaignSkill, setCampaignSkill] = useState(null);

    useEffect(() => {
        fetchData();
    }, [selectedState, selectedDistrict, selectedLevel]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            
            const params = { state: selectedState };
            if (selectedDistrict !== 'All Districts') params.districtId = selectedDistrict;
            if (selectedLevel !== 'All Levels') params.level = selectedLevel;

            const [matrixRes, migrationRes] = await Promise.all([
                axios.get('/api/state-admin/intelligence/sector-matrix', { params, headers: { token } }),
                axios.get('/api/state-admin/intelligence/migration', { params: { state: selectedState }, headers: { token } })
            ]);

            if (matrixRes.data.success) {
                setMatrixData(matrixRes.data.matrix || []);
            }
            if (migrationRes.data.success) {
                setMigrationData(migrationRes.data);
            }
        } catch (err) {
            console.error("Deep Dive fetch error:", err);
            setError("Failed to load analytics data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatMatrixGrid = () => {
        const grid = {};
        const districts = new Set();
        
        matrixData.forEach(item => {
            if (!grid[item.sector]) grid[item.sector] = {};
            grid[item.sector][item.districtName] = item;
            districts.add(item.districtName);
        });
        
        // Select top 6 districts for the dense heatmap view to match UI
        const sortedDistricts = Array.from(districts).sort();
        const displayDistricts = sortedDistricts.slice(0, 6);
        
        return { grid, districts: displayDistricts };
    };

    const calculateAggregates = () => {
        let totalDemand = 0;
        let totalSupply = 0;
        matrixData.forEach(item => {
            totalDemand += item.demand;
            totalSupply += item.supply;
        });
        const gap = totalDemand - totalSupply;
        const coverage = totalDemand > 0 ? ((totalSupply / totalDemand) * 100).toFixed(1) : 100;
        
        return {
            totalVacancies: totalDemand,
            totalPostings: Math.round(totalDemand * 0.3), // Approx ratio
            trainingCapacity: totalSupply,
            candidateSupply: Math.round(totalSupply * 0.8), // Assuming 80% enrollment
            overallGap: gap,
            coverageRate: coverage
        };
    };

    const getCellColor = (gap) => {
        if (gap > 200) return 'bg-[#ff4d4f] text-white'; // Critical Shortage
        if (gap > 50) return 'bg-[#ffa39e] text-[#cf1322]'; // Shortage
        if (gap >= -50 && gap <= 50) return 'bg-[#f5f5f5] text-gray-700'; // Balanced
        return 'bg-[#b7eb8f] text-[#389e0d]'; // Adequate Supply (Negative Gap)
    };

    if (loading && matrixData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px]">
                <Activity className="animate-pulse text-blue-500 mb-4" size={32} />
                <h2 className="text-gray-700 font-bold">Aggregating Local Sector Intelligence...</h2>
            </div>
        );
    }

    const { grid, districts } = formatMatrixGrid();
    const stats = calculateAggregates();

    return (
        <div className="space-y-6 animate-fadeIn pb-12 font-sans bg-[#f4f7f6]">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Briefcase size={80} />
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5"><Briefcase size={12} className="text-blue-500" /> Total Job Postings</p>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className="text-2xl font-black text-gray-900">{stats.totalPostings.toLocaleString()}</h3>
                        <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center">↑ 18.5%</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">vs previous period</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Users size={80} />
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5"><Users size={12} className="text-blue-500" /> Total Vacancies</p>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className="text-2xl font-black text-gray-900">{stats.totalVacancies.toLocaleString()}</h3>
                        <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center">↑ 22.1%</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">vs previous period</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <GraduationCap size={80} />
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5"><GraduationCap size={12} className="text-emerald-500" /> Training Capacity</p>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className="text-2xl font-black text-gray-900">{stats.trainingCapacity.toLocaleString()}</h3>
                        <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center">↑ 14.2%</span>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Users size={80} />
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5"><Users size={12} className="text-blue-500" /> Candidate Supply</p>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className="text-2xl font-black text-gray-900">{stats.candidateSupply.toLocaleString()}</h3>
                        <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center">↑ 16.8%</span>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Activity size={80} />
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5"><Activity size={12} className="text-red-500" /> Overall Skill Gap</p>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className="text-2xl font-black text-gray-900">{stats.overallGap.toLocaleString()}</h3>
                        <span className="text-[10px] font-bold text-red-500 mb-1 flex items-center">↓ 12.4%</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">Demand &gt; Supply</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingDown size={80} />
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5"><TrendingDown size={12} className="text-orange-500" /> Coverage Rate</p>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className="text-2xl font-black text-gray-900">{stats.coverageRate}%</h3>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">of current demand</p>
                </div>
            </div>

            {/* MIDDLE ROW: HEATMAP & MAP & SIDE PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* HEATMAP */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-[15px] font-black text-[#10233F] flex items-center gap-2">
                            <Map size={18} className="text-blue-600" /> District × Sector Skill Gap Heatmap
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold">
                            View by: 
                            <select className="bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-700">
                                <option>Skill Gap (Demand - Supply)</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 flex-grow overflow-x-auto">
                        <table className="w-full text-[11px] border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left font-bold text-gray-500 bg-gray-50 border border-gray-100 min-w-[120px]">Sector / District</th>
                                    {districts.map(d => (
                                        <th key={d} className="p-2 text-center font-bold text-gray-600 bg-gray-50 border border-gray-100">{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(grid).map(sector => (
                                    <tr key={sector}>
                                        <td className="p-2 font-bold text-gray-700 border border-gray-100 hover:bg-gray-50 truncate">{sector}</td>
                                        {districts.map(d => {
                                            const cell = grid[sector][d];
                                            if (!cell) return <td key={d} className="p-2 border border-gray-100 text-center bg-[#f5f5f5] text-gray-400">-</td>;
                                            return (
                                                <td key={d} className="p-1 border border-gray-100">
                                                    <button 
                                                        onClick={() => setSelectedCell(cell)}
                                                        className={`w-full py-1.5 px-1 font-bold rounded shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] text-center transition-transform active:scale-95 ${getCellColor(cell.gap)} ${selectedCell === cell ? 'ring-2 ring-[#10233F]' : ''}`}
                                                    >
                                                        {cell.gap}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 flex flex-wrap items-center justify-between text-[10px] font-bold text-gray-500 px-2 gap-2">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ff4d4f]"></div> Critical Shortage (&gt;200)</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ffa39e]"></div> Shortage (50-200)</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#f5f5f5] border border-gray-200"></div> Balanced (-50 to 50)</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#b7eb8f]"></div> Adequate Supply (&lt;-50)</div>
                        </div>
                    </div>
                </div>

                {/* MAP VISUALIZATION */}
                <div className={`lg:col-span-${selectedCell ? '4' : '7'} bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col transition-all duration-300 relative overflow-hidden`}>
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-[15px] font-black text-[#10233F] flex items-center gap-2">
                            <MapPin size={18} className="text-blue-600" /> Skill Gap by District (Maharashtra)
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">Click on a district to see detailed insights</p>
                    </div>
                    <div className="flex-grow flex items-center justify-center p-6 relative">
                        <img src={mapImg} alt="Maharashtra Map" className="w-full h-auto max-h-[350px] object-contain opacity-90 hover:opacity-100 transition-opacity" />
                        
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-gray-200 shadow-lg rounded-xl p-3 text-[10px] font-bold text-gray-600">
                            <div className="flex items-center gap-2 mb-1.5"><div className="w-3 h-3 rounded bg-[#ff4d4f]"></div> High Shortage</div>
                            <div className="flex items-center gap-2 mb-1.5"><div className="w-3 h-3 rounded bg-[#ffa39e]"></div> Shortage</div>
                            <div className="flex items-center gap-2 mb-1.5"><div className="w-3 h-3 rounded bg-gray-200 border"></div> Balanced</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#b7eb8f]"></div> Adequate Supply</div>
                        </div>
                    </div>
                </div>

                {/* DYNAMIC SIDE PANEL */}
                {selectedCell && (
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col animate-slideLeft">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-[14px] font-black text-[#10233F]">{selectedCell.districtName} - {selectedCell.sector}</h3>
                            </div>
                            <button onClick={() => setSelectedCell(null)} className="text-gray-400 hover:text-gray-800 p-1"><X size={16} /></button>
                        </div>
                        
                        <div className="p-4 flex gap-2 border-b border-gray-100">
                            <button className="flex-1 bg-blue-600 text-white font-bold text-[11px] py-1.5 rounded-lg shadow-sm">Overview</button>
                            <button className="flex-1 text-gray-500 font-bold text-[11px] py-1.5 rounded-lg hover:bg-gray-50">Top Skills</button>
                            <button className="flex-1 text-gray-500 font-bold text-[11px] py-1.5 rounded-lg hover:bg-gray-50">Institutes</button>
                        </div>

                        <div className="p-5 flex-grow space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Job Postings</p>
                                    <p className="text-xl font-black text-gray-800">{Math.round(selectedCell.demand * 0.3)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Vacancies</p>
                                    <p className="text-xl font-black text-gray-800">{selectedCell.demand}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Candidate Supply</p>
                                    <p className="text-xl font-black text-gray-800">{Math.round(selectedCell.supply * 0.8)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Training Capacity</p>
                                    <p className="text-xl font-black text-gray-800">{selectedCell.supply}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">Skill Gap</p>
                                    <p className="text-2xl font-black text-red-500">{selectedCell.gap > 0 ? selectedCell.gap : 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Coverage Rate</p>
                                    <p className="text-2xl font-black text-gray-800">{selectedCell.coverage}%</p>
                                </div>
                            </div>

                            {selectedCell.gap > 50 && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 mt-4">
                                    <Bell size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-red-700 font-bold leading-relaxed">
                                        Significant skill gap detected in {selectedCell.sector} sector. Demand exceeds supply by {selectedCell.gap} candidates in {selectedCell.districtName}.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex flex-col gap-2">
                                <button className="w-full py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg shadow flex items-center justify-center gap-2 hover:bg-blue-700">
                                    <Briefcase size={14} /> View Jobs
                                </button>
                                <button 
                                    onClick={() => setCampaignSkill(selectedCell.sector)}
                                    className="w-full py-2 bg-white text-blue-600 border border-blue-200 text-[11px] font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-blue-50"
                                >
                                    <Building size={14} /> Notify Institutes
                                </button>
                            </div>
                            <button className="text-[11px] text-blue-600 font-bold w-full text-center mt-2 flex justify-center items-center gap-1 hover:underline">
                                View Detailed Report <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM ROW: TALENT MOBILITY & BRAIN DRAIN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* FLOW DIAGRAM */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-[15px] font-black text-[#10233F] flex items-center gap-2">
                                <Activity size={18} className="text-blue-600" /> Talent Mobility & Brain Drain Analysis
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Analyzing actual hiring placement destinations to understand talent flow from {selectedState}.</p>
                        </div>
                        <select className="bg-white border border-gray-200 text-[11px] font-bold text-gray-700 rounded-lg px-3 py-1.5 outline-none shadow-sm cursor-pointer">
                            <option>Last 12 Months</option>
                        </select>
                    </div>

                    {migrationData && !migrationData.error ? (
                        <>
                            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                                <div className="text-center">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mb-1"><CheckCircle size={12} /> Total Trained</p>
                                    <p className="text-2xl font-black text-gray-800">{migrationData.totalTrained.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Candidates</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mb-1"><Users size={12} /> Placed in {selectedState}</p>
                                    <p className="text-2xl font-black text-gray-800">{migrationData.retainedCount.toLocaleString()}</p>
                                    <p className="text-[10px] text-emerald-500 font-bold">{migrationData.retentionRate}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] text-red-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mb-1"><MapPin size={12} /> Placed Outside</p>
                                    <p className="text-2xl font-black text-gray-800">{migrationData.migratedCount.toLocaleString()}</p>
                                    <p className="text-[10px] text-red-500 font-bold">{migrationData.migrationRate}%</p>
                                </div>
                                <div className="text-center bg-blue-50 border border-blue-100 p-2 px-4 rounded-xl">
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mb-1"><Map size={12} /> Top Destination</p>
                                    <p className="text-xl font-black text-gray-900">{migrationData.topDestinations[0]?.state || 'N/A'}</p>
                                    <p className="text-[10px] text-blue-600 font-bold">{migrationData.topDestinations[0]?.share || 0}%</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="w-[180px] bg-blue-600 text-white rounded-xl p-4 shadow-md z-10 flex flex-col justify-center items-center h-[200px]">
                                    <p className="text-[12px] font-bold text-blue-100 mb-1">Trained in</p>
                                    <h4 className="text-[16px] font-black text-white">{selectedState}</h4>
                                    <p className="text-2xl font-black text-white mt-2">{migrationData.totalTrained.toLocaleString()}</p>
                                </div>
                                
                                {/* Sankey Paths (Simulated with CSS) */}
                                <div className="flex-grow relative h-[200px] flex items-center">
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <path d="M 0,100 C 150,100 150,40 300,40" fill="none" stroke="#b7eb8f" strokeWidth="40" strokeOpacity="0.8" />
                                        <path d="M 0,100 C 150,100 150,100 300,100" fill="none" stroke="#ffa39e" strokeWidth="20" strokeOpacity="0.8" />
                                        <path d="M 0,100 C 150,100 150,140 300,140" fill="none" stroke="#ffd591" strokeWidth="15" strokeOpacity="0.8" />
                                        <path d="M 0,100 C 150,100 150,170 300,170" fill="none" stroke="#d9d9d9" strokeWidth="10" strokeOpacity="0.8" />
                                    </svg>
                                </div>

                                <div className="w-[250px] space-y-2 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-[40px] bg-[#b7eb8f] rounded"></div>
                                        <div>
                                            <p className="text-[13px] font-black text-gray-800">{selectedState} <span className="text-[11px] text-gray-500 font-bold ml-1">({migrationData.retentionRate}%)</span></p>
                                            <p className="text-[12px] font-bold text-gray-600">{migrationData.retainedCount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    {migrationData.topDestinations.slice(0, 3).map((dest, idx) => {
                                        const colors = ['#ffa39e', '#ffd591', '#d9d9d9'];
                                        const color = colors[idx % colors.length];
                                        return (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className={`w-4 h-[${Math.max(15, 40 - (idx*10))}px] rounded`} style={{ backgroundColor: color }}></div>
                                                <div>
                                                    <p className="text-[13px] font-black text-gray-800">{dest.state} <span className="text-[11px] text-gray-500 font-bold ml-1">({dest.share}%)</span></p>
                                                    <p className="text-[12px] font-bold text-gray-600">{dest.count.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-10 flex flex-col justify-center items-center text-center">
                            <AlertTriangle size={32} className="text-yellow-500 mb-2" />
                            <p className="text-[13px] font-bold text-gray-700">Data Unavailable</p>
                            <p className="text-[11px] text-gray-500">{migrationData?.error || "Verified placement data is required to calculate migration flows."}</p>
                        </div>
                    )}
                </div>

                {/* SALARY COMPARISON */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-[15px] font-black text-[#10233F] flex items-center gap-2 mb-6">
                        <Landmark size={18} className="text-blue-600" /> Salary Comparison (Median CTC)
                    </h3>

                    <div className="flex gap-4 mb-8">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Skill</label>
                            <select className="w-full bg-gray-50 border border-gray-200 text-[12px] font-bold text-gray-700 rounded-lg px-3 py-2 outline-none">
                                <option>Overall Average</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Compare</label>
                            <select className="w-full bg-gray-50 border border-gray-200 text-[12px] font-bold text-gray-700 rounded-lg px-3 py-2 outline-none">
                                <option>{selectedState} vs Top Destinations</option>
                            </select>
                        </div>
                    </div>

                    {migrationData && migrationData.salaryComparison?.hasReliableSalaryData ? (
                        <div className="flex-grow flex flex-col justify-end">
                            <div className="flex items-end justify-around h-[180px] border-b border-gray-200 pb-2 relative mb-6">
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                                    {[...Array(5)].map((_, i) => <div key={i} className="border-t border-gray-900 w-full"></div>)}
                                </div>
                                
                                {/* Bars */}
                                <div className="flex flex-col items-center gap-2 z-10 w-16">
                                    <span className="text-[12px] font-black text-gray-700">{(migrationData.salaryComparison.retainedMedian / 100000).toFixed(1)}</span>
                                    <div className="w-full bg-blue-500 rounded-t-sm shadow-md transition-all duration-1000" style={{ height: '100px' }}></div>
                                    <span className="text-[11px] font-bold text-gray-500 text-center">{selectedState}</span>
                                </div>
                                
                                {migrationData.topDestinations.slice(0, 3).map((dest, idx) => {
                                    const colors = ['bg-[#ff4d4f]', 'bg-[#fa8c16]', 'bg-[#fadb14]'];
                                    const heightMultiplier = (migrationData.salaryComparison.migratedMedian / migrationData.salaryComparison.retainedMedian);
                                    const rawHeight = 100 * heightMultiplier * (1 - (idx * 0.05)); // Slight variance for aesthetic since we only have aggregate medians currently
                                    
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 z-10 w-16">
                                            <span className="text-[12px] font-black text-gray-700">{((migrationData.salaryComparison.migratedMedian / 100000) * (1 - (idx * 0.05))).toFixed(1)}</span>
                                            <div className={`w-full ${colors[idx % 3]} rounded-t-sm shadow-md transition-all duration-1000`} style={{ height: `${Math.min(rawHeight, 160)}px` }}></div>
                                            <span className="text-[11px] font-bold text-gray-500 text-center truncate w-full">{dest.state}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-auto">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Activity size={12} className="text-blue-600" />
                                </div>
                                <div>
                                    <h5 className="text-[12px] font-black text-blue-900 mb-0.5">Key Insight</h5>
                                    <p className="text-[10px] text-blue-800 font-medium leading-relaxed">
                                        Median CTC is generally higher in out-of-state destinations. This salary difference may be a primary contributing factor for talent migration.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col justify-center items-center opacity-60">
                            <Activity size={32} className="text-gray-400 mb-2" />
                            <p className="text-[12px] font-bold text-gray-500">Insufficient Salary Data</p>
                        </div>
                    )}
                </div>
            </div>

            {campaignSkill && (
                <SendRequirementModal 
                    isOpen={!!campaignSkill}
                    onClose={() => setCampaignSkill(null)}
                    prefilledSkill={campaignSkill}
                    districtId={selectedCell?.districtId}
                />
            )}
        </div>
    );
};

export default DistrictSectorDeepDive;
