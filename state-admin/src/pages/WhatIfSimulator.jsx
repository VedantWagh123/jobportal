import { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Send, BrainCircuit, AlertCircle, Briefcase, TrendingUp, Activity, BarChart2, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';

const WhatIfSimulator = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [prompt, setPrompt] = useState(location.state?.initialPrompt || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (location.state?.initialPrompt) {
            setPrompt(location.state.initialPrompt);
        }
    }, [location.state?.initialPrompt]);

    const handleSimulate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const token = user?.token || localStorage.getItem('stateAdminToken');
            const { data } = await axios.post(
                '/api/state-admin/intelligence/simulate',
                { prompt },
                { headers: { token } }
            );

            if (data.success) {
                setResult(data);
            } else {
                setError(data.message || 'Simulation failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server error occurred during simulation.');
        } finally {
            setLoading(false);
        }
    };

    const chartData = result ? [
        {
            name: 'Active Jobs (Demand)',
            "Current State": result.marketData?.activeJobs || 0,
            "Simulated Future": result.marketData?.activeJobs || 0, // Assume demand stays same, we are just increasing supply
        },
        {
            name: 'Available Candidates (Supply)',
            "Current State": result.marketData?.currentSupply || 0,
            "Simulated Future": (result.marketData?.currentSupply || 0) + (result.intent?.estimatedSeats || 0),
        }
    ] : [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <header className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                    <Sparkles className="text-indigo-600" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">What-If AI Simulator</h1>
                <p className="text-gray-500 mt-2 max-w-2xl mx-auto mb-4">
                    Type a hypothetical scenario about training batches or skill gaps, and Gemini AI will predict the outcome based on real-time market data.
                </p>
                {result?.isFallback && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertCircle size={14} /> Fallback Mode (API Quota Exceeded)
                    </span>
                )}
                {!result?.isFallback && result && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Sparkles size={14} /> Real AI Prediction Generated
                    </span>
                )}
            </header>

            {/* Input Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSimulate}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe your scenario
                    </label>
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., What if we start 2 new batches of Data Science (100 seats) in Pune?"
                            className="w-full p-4 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            rows="3"
                        />
                        <button
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <span className="text-xs text-gray-500 font-medium">Try asking:</span>
                        <button type="button" onClick={() => setPrompt("What if we add 50 seats for scikit-learn in Mumbai?")} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">What if we add 50 seats for scikit-learn in Mumbai?</button>
                        <button type="button" onClick={() => setPrompt("If I open 3 React courses in overall state, will they get jobs?")} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">If I open 3 React courses, will they get jobs?</button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                    <AlertCircle className="mt-0.5 flex-shrink-0" size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Results Section */}
            {result && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Left Column: AI Intent & Real Market Data */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <BrainCircuit size={16} className="text-indigo-600"/> 
                                AI Understood
                            </h3>
                            {result?.intent?.queryType === 'open_ended_suggestion' ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                        <Lightbulb size={18} />
                                        <p className="text-sm font-semibold">Open Ended Suggestion</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">The AI is analyzing the top skill gaps across the state to provide you with the best course recommendations.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Target Skill</p>
                                        <p className="font-semibold text-gray-900">{result?.intent?.skill || 'General'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">District Focus</p>
                                        <p className="font-semibold text-gray-900">{result?.intent?.district || 'Overall'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Proposed Injection</p>
                                        <p className="font-semibold text-indigo-600">+{result?.intent?.estimatedSeats || 0} Seats ({result?.intent?.proposedBatches || 0} Batches)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {result?.intent?.queryType !== 'open_ended_suggestion' && (
                            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm text-white">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <Activity size={16} className="text-emerald-400"/> 
                                    Current Reality
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                                        <p className="text-sm text-slate-400">Total Active Jobs</p>
                                        <p className="text-xl font-bold">{result?.marketData?.activeJobs || 0}</p>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                                        <p className="text-sm text-slate-400">Current Enrolled</p>
                                        <p className="text-xl font-bold">{result?.marketData?.currentSupply || 0}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-sm text-slate-400">Current Gap</p>
                                        <p className={`text-xl font-bold ${result?.marketData?.gap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {result?.marketData?.gap > 0 ? `+${result?.marketData?.gap} Shortage` : 'Balanced'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: AI Final Prediction */}
                    <div className="md:col-span-2">
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 shadow-sm h-full">
                            <h3 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2">
                                <Sparkles size={24} className="text-indigo-600"/> 
                                Gemini AI Prediction
                            </h3>
                            <div className="prose prose-indigo prose-sm max-w-none text-gray-700 leading-relaxed mb-8">
                                {result?.prediction ? (
                                    <ReactMarkdown>{result.prediction}</ReactMarkdown>
                                ) : (
                                    <p>Loading prediction...</p>
                                )}
                            </div>

                            {/* Recharts Visualization */}
                            {result?.intent?.queryType !== 'open_ended_suggestion' && (
                                <div className="bg-white p-6 rounded-xl border border-indigo-50 shadow-sm mt-6 mb-8">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <BarChart2 size={16} className="text-indigo-600"/> 
                                        Impact Visualization
                                    </h4>
                                    <div className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13, fontWeight: 500}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                                <Tooltip 
                                                    cursor={{fill: '#f8fafc'}}
                                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                                                <Bar dataKey="Current State" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={40} />
                                                <Bar dataKey="Simulated Future" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-auto pt-6 border-t border-indigo-100 flex gap-4">
                                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Briefcase size={18} /> Approve Policy Action
                                </button>
                                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <TrendingUp size={18} /> Generate Detailed Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatIfSimulator;
