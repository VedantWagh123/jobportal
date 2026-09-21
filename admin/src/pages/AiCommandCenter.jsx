import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
    Cpu, Activity, Zap, CheckCircle, Clock, 
    AlertTriangle, Server, Database, BarChart2,
    Settings, ShieldCheck, ChevronDown, BellRing,
    Search, X, RefreshCw
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-toastify';

// Components
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ title, subtitle, icon: Icon, action }) => (
    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                <Icon size={16} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
            </div>
        </div>
        {action && <div>{action}</div>}
    </div>
);

const AiCommandCenter = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useSocket();
    
    // State
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('24H');
    const [isLive, setIsLive] = useState(true);
    const [sendingAlert, setSendingAlert] = useState(false);
    
    // Modal State
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/super-admin/ai-command-center/stats?timeFilter=${timeFilter}`, {
                headers: { token: user.token }
            });
            if (res.data.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch AI stats:", error);
            toast.error("Failed to load AI Command Center data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, timeFilter]);

    // Socket.io integration
    useEffect(() => {
        if (!socket || !isLive) return;
        
        const handleAiUpdate = (newLog) => {
            setData(prev => {
                if (!prev) return prev;
                
                // Real-time optimistic updates for metrics
                const isSuccess = newLog.status === 'success';
                const isError = newLog.status === 'error';
                
                const updatedQuota = {
                    ...prev.quota,
                    totalRequests: prev.quota.totalRequests + 1,
                    successfulRequests: prev.quota.successfulRequests + (isSuccess ? 1 : 0),
                    failedRequests: prev.quota.failedRequests + (isError ? 1 : 0),
                    fallbackRequests: prev.quota.fallbackRequests + (newLog.fallbackUsed ? 1 : 0)
                };
                
                // Keep recent logs at max 100
                const updatedLogs = [newLog, ...prev.recentLogs].slice(0, 100);
                
                return {
                    ...prev,
                    quota: updatedQuota,
                    recentLogs: updatedLogs
                    // (Note: we don't dynamically update charts on every socket ping to avoid jitter, user can refresh for full aggregation)
                };
            });
        };

        socket.on('ai_usage_updated', handleAiUpdate);
        
        return () => {
            socket.off('ai_usage_updated', handleAiUpdate);
        };
    }, [socket, isLive]);

    if (loading && !data) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <RefreshCw size={32} className="animate-spin text-blue-600" />
                    <p className="font-medium">Connecting to AI Telemetry...</p>
                </div>
            </div>
        );
    }

    const {
        quota, channels, featureUtilization, chartData, topErrors, performance, recentLogs
    } = data || {};

    const errorRate = quota?.totalRequests > 0 
        ? ((quota.failedRequests / quota.totalRequests) * 100).toFixed(1) 
        : 0;

    return (
        <div className="space-y-6 pb-12 font-sans text-gray-800">
            {/* TOP HEADER */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 relative overflow-hidden">
                <div className="flex items-center gap-4 z-10 w-full xl:w-auto">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-blue-900 text-blue-400 shadow-inner">
                        <Cpu size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">AI Command Center</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-green-50 border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase text-green-700 tracking-wider">Operational</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">
                            Real-time AI telemetry, API usage, and system health observability.
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Time Filter */}
                    <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200">
                        {['1H', '6H', '24H', '7D', '30D'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTimeFilter(t)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${timeFilter === t ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setIsLive(!isLive)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${isLive ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-blue-500 animate-ping' : 'bg-gray-400'}`}></span>
                        {isLive ? 'Live Updates ON' : 'Live Updates OFF'}
                    </button>
                    
                    <button onClick={fetchData} className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* Quota Card */}
                <Card className="flex flex-col p-5">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex justify-between">
                        Application Usage
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded lowercase">{timeFilter}</span>
                    </h3>
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-gray-900">{quota?.totalRequests?.toLocaleString() || 0}</span>
                            <span className="text-sm font-bold text-gray-400">requests</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Provider API limits are not directly exposed. This value represents total backend AI invocations tracked by the telemetry layer.
                        </p>
                    </div>
                    <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Tokens</p>
                            <p className="text-sm font-black text-gray-700">{quota?.tokens?.total?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Success</p>
                            <p className="text-sm font-black text-green-600">{quota?.successfulRequests?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </Card>

                {/* System Health */}
                <Card className="flex flex-col p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">System Health</h3>
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Cpu size={14} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-200">Gemini Engine</span>
                            </div>
                            <span className="text-xs font-bold text-green-400">Operational</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Database size={14} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-200">MongoDB Logs</span>
                            </div>
                            <span className="text-xs font-bold text-green-400">Connected</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-200">Socket Telemetry</span>
                            </div>
                            <span className="text-xs font-bold text-green-400">{socket?.connected ? 'Streaming' : 'Connecting'}</span>
                        </div>
                    </div>
                    <div className="mt-4 border-t border-gray-700 pt-3">
                        <p className="text-[10px] text-gray-400 flex items-center justify-between">
                            <span>Avg Latency: <strong className="text-white">{performance?.avgLatency || 0}s</strong></span>
                            <span>Error Rate: <strong className="text-white">{errorRate}%</strong></span>
                        </p>
                    </div>
                </Card>

                {/* Traffic Chart */}
                <Card className="xl:col-span-2 flex flex-col p-5">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Traffic Analytics</h3>
                    <div className="flex-1 w-full h-[150px]">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} dy={5} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: '12px' }} 
                                    />
                                    <Area type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 font-medium border border-dashed rounded-lg bg-gray-50">
                                No traffic data for selected period
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* TWO COLUMNS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Channels / Providers */}
                <Card>
                    <SectionHeader title="Providers & API Channels" icon={ShieldCheck} />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Channel</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Model</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Requests</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Errors</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {channels && channels.length > 0 ? channels.map((c, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900">{c.channel}</span>
                                                <span className="text-[10px] text-gray-500">{c.provider}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700">{c.model}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-gray-900 text-right">{c.requests.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-right text-red-600">{c.errors.toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-xs text-gray-500">No channels utilized.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Feature Utilization */}
                <Card>
                    <SectionHeader title="Feature Utilization" icon={Zap} />
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Feature</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Count</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Success Rate</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Avg Latency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {featureUtilization && featureUtilization.length > 0 ? featureUtilization.map((f, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-xs font-bold text-gray-900">{f.feature}</td>
                                        <td className="px-4 py-3 text-xs text-gray-700 text-right">{f.requests.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-xs text-right">
                                            <span className={`px-1.5 py-0.5 rounded font-bold ${f.successRate > 90 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {f.successRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700 text-right">{f.avgLatency}s</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-xs text-gray-500">No feature data.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

            </div>

            {/* LIVE LOGS TABLE */}
            <Card>
                <SectionHeader 
                    title="Real-Time Execution Logs" 
                    subtitle="Detailed telemetry for backend AI requests"
                    icon={Server} 
                    action={
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600">
                            {isLive ? (
                                <><span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span> Live</>
                            ) : (
                                <><span className="w-2 h-2 rounded-full bg-gray-400"></span> Paused</>
                            )}
                        </div>
                    }
                />
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50/95 backdrop-blur z-10 border-b border-gray-100 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Feature</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Model / Channel</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Latency</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentLogs && recentLogs.length > 0 ? recentLogs.map((log, idx) => (
                                <tr key={log._id || idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${log.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {log.status === 'success' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold text-gray-900">{log.feature}</span>
                                        {log.fallbackUsed && <span className="ml-2 text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold uppercase">Fallback</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-800">{log.modelUsed}</span>
                                            <span className="text-[10px] text-gray-500">{log.keyChannel}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1 text-xs font-bold text-gray-700">
                                            <Clock size={12} className="text-gray-400" />
                                            {(log.durationMs / 1000).toFixed(2)}s
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button 
                                            onClick={() => setSelectedLog(log)}
                                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-sm font-medium text-gray-500">
                                        No recent AI activities detected.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* LOG DETAIL MODAL */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                <Search size={16} className="text-gray-500" />
                                Request Details
                            </h2>
                            <button onClick={() => setSelectedLog(null)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-700">
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                                    <p className={`font-bold ${selectedLog.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{selectedLog.status.toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Time</p>
                                    <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Duration</p>
                                    <p className="font-bold">{(selectedLog.durationMs / 1000).toFixed(2)}s</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tokens</p>
                                    <p className="font-medium text-gray-900">{selectedLog.totalTokens || 'Unknown'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-900 border-b pb-2 mb-3">Configuration</h3>
                                    <ul className="space-y-2 text-xs">
                                        <li className="flex justify-between"><span className="text-gray-500">Feature:</span> <strong className="text-gray-900">{selectedLog.feature}</strong></li>
                                        <li className="flex justify-between"><span className="text-gray-500">Provider:</span> <strong className="text-gray-900">{selectedLog.provider || 'Google Gemini'}</strong></li>
                                        <li className="flex justify-between"><span className="text-gray-500">Model:</span> <strong className="text-gray-900">{selectedLog.modelUsed}</strong></li>
                                        <li className="flex justify-between"><span className="text-gray-500">Channel:</span> <strong className="text-gray-900">{selectedLog.keyChannel || 'Unknown'}</strong></li>
                                        <li className="flex justify-between"><span className="text-gray-500">Source:</span> <strong className="text-gray-900">{selectedLog.source}</strong></li>
                                        <li className="flex justify-between"><span className="text-gray-500">Fallback Used:</span> <strong className="text-gray-900">{selectedLog.fallbackUsed ? 'Yes' : 'No'}</strong></li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-xs font-bold text-gray-900 border-b pb-2 mb-3">Usage Tokens</h3>
                                    <ul className="space-y-2 text-xs">
                                        <li className="flex justify-between"><span className="text-gray-500">Input Tokens:</span> <strong className="text-gray-900">{selectedLog.inputTokens || 0}</strong></li>
                                        <li className="flex justify-between"><span className="text-gray-500">Output Tokens:</span> <strong className="text-gray-900">{selectedLog.outputTokens || 0}</strong></li>
                                        <li className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500 font-bold">Total:</span> <strong className="text-blue-600 font-black">{selectedLog.totalTokens || 0}</strong></li>
                                    </ul>
                                </div>
                            </div>

                            {selectedLog.status === 'error' && (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                                    <h3 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Error Details
                                    </h3>
                                    <p className="text-xs text-red-600 font-mono bg-white p-2 rounded border border-red-100 break-words">
                                        {selectedLog.errorMessage || 'Unknown Error'}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold text-gray-900 border-b pb-2 mb-3">Prompt Preview (Sanitized)</h3>
                                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg font-mono text-[11px] text-gray-600 max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words">
                                    {selectedLog.promptPreview || 'No preview available.'}
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default AiCommandCenter;
