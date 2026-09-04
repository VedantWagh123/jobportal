import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const AdminUnresolvedSkills = () => {
    const { backendUrl, adminToken } = useContext(AdminContext);

    const [skills, setSkills] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('pending');
    const [search, setSearch] = useState('');

    const [selectedSkill, setSelectedSkill] = useState(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Summary stats
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });

    const fetchSkills = async (currentPage = 1, status = statusFilter, query = search) => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/government-admin/intelligence/unresolved-skills`, {
                headers: { token: adminToken },
                params: { page: currentPage, limit: 10, status, search: query }
            });

            if (data.success) {
                setSkills(data.unresolvedSkills);
                setTotal(data.total);
                setPage(data.page);
                setTotalPages(data.pages);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        // Quick workaround to fetch counts for summary cards
        try {
            const pendingReq = axios.get(`${backendUrl}/api/government-admin/intelligence/unresolved-skills`, { headers: { token: adminToken }, params: { status: 'pending', limit: 1 } });
            const approvedReq = axios.get(`${backendUrl}/api/government-admin/intelligence/unresolved-skills`, { headers: { token: adminToken }, params: { status: 'reviewed', limit: 1 } });
            const rejectedReq = axios.get(`${backendUrl}/api/government-admin/intelligence/unresolved-skills`, { headers: { token: adminToken }, params: { status: 'rejected', limit: 1 } });
            
            const [pRes, aRes, rRes] = await Promise.all([pendingReq, approvedReq, rejectedReq]);
            
            setStats({
                pending: pRes.data.total || 0,
                approved: aRes.data.total || 0,
                rejected: rRes.data.total || 0,
                total: (pRes.data.total || 0) + (aRes.data.total || 0) + (rRes.data.total || 0)
            });
        } catch (error) {
            console.error("Stats Error:", error);
        }
    };

    useEffect(() => {
        if (adminToken) {
            fetchSkills(1, statusFilter, search);
            fetchStats();
        }
    }, [adminToken, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchSkills(1, statusFilter, search);
    };

    const handleApprove = async () => {
        if (!selectedSkill) return;
        setIsProcessing(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/government-admin/intelligence/unresolved-skills/${selectedSkill._id}/approve`, {}, {
                headers: { token: adminToken }
            });
            if (data.success) {
                toast.success('Skill Approved and Added to Master');
                setIsApproveModalOpen(false);
                setSelectedSkill(null);
                fetchSkills(page);
                fetchStats();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedSkill) return;
        setIsProcessing(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/government-admin/intelligence/unresolved-skills/${selectedSkill._id}/reject`, {}, {
                headers: { token: adminToken }
            });
            if (data.success) {
                toast.success('Skill Rejected');
                setIsRejectModalOpen(false);
                setSelectedSkill(null);
                fetchSkills(page);
                fetchStats();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const openReview = (skill) => {
        setSelectedSkill(skill);
        setIsApproveModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">AI Skill Review</h1>
                <p className="text-gray-500 mt-1">Review skills identified by AI that are not yet part of the Skill Master.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Approved</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Rejected</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Total Detected</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto flex-1">
                    <input 
                        type="text" 
                        placeholder="Search skill..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:max-w-xs"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Search</button>
                    {search && (
                        <button type="button" onClick={() => { setSearch(''); fetchSkills(1, statusFilter, ''); }} className="px-4 py-2 text-gray-500 hover:text-gray-700">Clear</button>
                    )}
                </form>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-gray-600 text-sm font-medium">Status:</span>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading skills...</div>
                ) : skills.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No unresolved skills found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-200">
                                    <th className="py-3 px-4 font-semibold">Skill</th>
                                    <th className="py-3 px-4 font-semibold">Normalized Name</th>
                                    <th className="py-3 px-4 font-semibold">Confidence</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">Detected In Job</th>
                                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {skills.map((skill) => (
                                    <tr key={skill._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 font-medium text-gray-900">{skill.rawName}</td>
                                        <td className="py-3 px-4 text-gray-600">{skill.normalizedName}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${(skill.confidence * 100) >= 90 ? 'bg-green-100 text-green-700' : (skill.confidence * 100) >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {Math.round(skill.confidence * 100)}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded-full border ${
                                                skill.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                skill.status === 'reviewed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {skill.status === 'reviewed' ? 'Approved' : skill.status.charAt(0).toUpperCase() + skill.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 text-sm font-medium">{skill.jobId ? skill.jobId.title : 'Unknown Job'}</span>
                                                <span className="text-gray-500 text-xs">{moment(skill.createdAt).format('DD MMM YYYY')}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {skill.status === 'pending' ? (
                                                <button onClick={() => openReview(skill)} className="text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition">
                                                    Review
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Resolved</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to <span className="font-medium">{Math.min(page * 10, total)}</span> of <span className="font-medium">{total}</span> results
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => fetchSkills(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700 font-medium">Page {page} of {totalPages}</span>
                            <button 
                                onClick={() => fetchSkills(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Approve/Review Modal */}
            {isApproveModalOpen && selectedSkill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Review AI Detected Skill</h3>
                            <button onClick={() => { setIsApproveModalOpen(false); setSelectedSkill(null); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    AI detected <strong>{selectedSkill.rawName}</strong> from a recently posted job description. It is not currently in the Master Database.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
                                <div>
                                    <p className="text-gray-500 mb-1">Detected As</p>
                                    <p className="font-medium text-gray-900 text-base">{selectedSkill.rawName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Normalized Name</p>
                                    <p className="font-medium text-gray-900 text-base">{selectedSkill.normalizedName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">AI Confidence</p>
                                    <p className="font-medium text-gray-900">{Math.round(selectedSkill.confidence * 100)}%</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Detected Date</p>
                                    <p className="font-medium text-gray-900">{moment(selectedSkill.createdAt).format('DD MMM YYYY, h:mm A')}</p>
                                </div>
                                {selectedSkill.jobId && (
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-1">Detected In Job</p>
                                        <p className="font-medium text-gray-900">{selectedSkill.jobId.title}</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 pt-5 text-center">
                                <p className="text-gray-600 mb-4 text-sm">Approve this skill and add it to the Skill Master?</p>
                                <div className="flex gap-3 justify-center">
                                    <button 
                                        onClick={() => { setIsApproveModalOpen(false); setIsRejectModalOpen(true); }}
                                        disabled={isProcessing}
                                        className="px-6 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition"
                                    >
                                        Reject Skill
                                    </button>
                                    <button 
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 font-medium rounded-lg transition shadow-sm flex items-center justify-center min-w-[140px]"
                                    >
                                        {isProcessing ? 'Processing...' : 'Approve Skill'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {isRejectModalOpen && selectedSkill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-red-500 text-3xl">!</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Skill?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to reject <strong>{selectedSkill.rawName}</strong>? It will be marked as rejected and will not be added to the Master Database.
                            </p>
                            
                            <div className="flex gap-3 justify-center">
                                <button 
                                    onClick={() => { setIsRejectModalOpen(false); setIsApproveModalOpen(true); }}
                                    disabled={isProcessing}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition w-full"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg transition shadow-sm flex items-center justify-center w-full"
                                >
                                    {isProcessing ? 'Rejecting...' : 'Yes, Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUnresolvedSkills;
