import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AdminEnrollments = () => {
    const { backendUrl, adminToken } = useContext(AdminContext);
    const [enrollments, setEnrollments] = useState([]);
    
    // Reference Data
    const [users, setUsers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [companies, setCompanies] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    // Filters
    const [filterBatch, setFilterBatch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPlacement, setFilterPlacement] = useState('');

    const initialFormState = {
        _id: '',
        userId: '',
        batchId: '',
        status: 'Enrolled',
        placementStatus: 'Pending',
        placementCompanyId: '',
        employerFeedbackScore: ''
    };
    
    const [formData, setFormData] = useState(initialFormState);

    const fetchReferenceData = async () => {
        try {
            const headers = { headers: { token: adminToken } };
            const [userRes, batchRes, compRes] = await Promise.all([
                axios.get(`${backendUrl}/api/government-admin/users`, headers),
                axios.get(`${backendUrl}/api/government-admin/batches`, headers),
                axios.get(`${backendUrl}/api/government-admin/companies`, headers)
            ]);
            if (userRes.data.success) setUsers(userRes.data.users);
            if (batchRes.data.success) setBatches(batchRes.data.batches);
            if (compRes.data.success) setCompanies(compRes.data.companies);
        } catch (error) {
            toast.error('Failed to load reference data');
        }
    };

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            let query = [];
            if (filterBatch) query.push(`batchId=${filterBatch}`);
            if (filterStatus) query.push(`status=${filterStatus}`);
            if (filterPlacement) query.push(`placementStatus=${filterPlacement}`);
            const queryString = query.length > 0 ? `?${query.join('&')}` : '';

            const { data } = await axios.get(`${backendUrl}/api/government-admin/enrollments${queryString}`, {
                headers: { token: adminToken }
            });
            
            // Map the enrollment list to populate user name from our local users array,
            // since the backend might just return userId strings (Clerk IDs).
            let populated = data.enrollments || [];
            
            setEnrollments(populated);
        } catch (error) {
            toast.error('Failed to fetch enrollments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminToken) {
            fetchReferenceData();
            fetchEnrollments();
        }
    }, [adminToken, filterBatch, filterStatus, filterPlacement, backendUrl]);

    const handleOpenModal = (enrollment = null) => {
        if (enrollment) {
            setEditMode(true);
            setFormData({
                _id: enrollment._id,
                userId: enrollment.userId,
                batchId: enrollment.batchId?._id || '',
                status: enrollment.status,
                placementStatus: enrollment.placementStatus,
                placementCompanyId: enrollment.placementCompanyId?._id || '',
                employerFeedbackScore: enrollment.employerFeedbackScore || ''
            });
        } else {
            setEditMode(false);
            setFormData(initialFormState);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const payload = { ...formData };
            if (payload.placementStatus !== 'Placed') {
                payload.placementCompanyId = null;
                payload.employerFeedbackScore = null;
            }

            let res;
            if (editMode) {
                res = await axios.put(`${backendUrl}/api/government-admin/enrollments/${formData._id}`, payload, {
                    headers: { token: adminToken }
                });
            } else {
                res = await axios.post(`${backendUrl}/api/government-admin/enrollments`, payload, {
                    headers: { token: adminToken }
                });
            }

            if (res.data.success) {
                toast.success(editMode ? 'Enrollment updated successfully' : 'Enrollment created successfully');
                setShowModal(false);
                fetchEnrollments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    // Helper to render user name from local user array
    const getUserName = (userIdStr) => {
        const u = users.find(x => x._id === userIdStr);
        return u ? `${u.name} (${u.email})` : userIdStr;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Enrollments</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage training pipeline and placement tracking</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    + Add Enrollment
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[200px]"
                    value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                    <option value="">All Batches</option>
                    {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
                </select>
                
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Training Status</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Completed">Completed</option>
                    <option value="Dropped">Dropped</option>
                </select>

                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={filterPlacement} onChange={e => setFilterPlacement(e.target.value)}>
                    <option value="">All Placement Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Placed">Placed</option>
                    <option value="Not Placed">Not Placed</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading enrollments...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="py-4 px-6">Candidate</th>
                                    <th className="py-4 px-6">Batch Details</th>
                                    <th className="py-4 px-6">Training</th>
                                    <th className="py-4 px-6">Placement</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {enrollments.length === 0 ? (
                                    <tr><td colSpan="5" className="py-8 text-center text-gray-500">No enrollments found</td></tr>
                                ) : (
                                    enrollments.map(e => (
                                        <tr key={e._id} className="hover:bg-gray-50 transition">
                                            <td className="py-4 px-6">
                                                <p className="font-medium text-gray-900 text-sm">{getUserName(e.userId)}</p>
                                                <p className="text-xs text-gray-400 font-mono mt-1" title="Clerk ID">{e.userId.substring(0, 10)}...</p>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700">
                                                {e.batchId?.batchName || 'Unknown Batch'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    e.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    e.status === 'Dropped' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        e.placementStatus === 'Placed' ? 'bg-green-100 text-green-700' :
                                                        e.placementStatus === 'Not Placed' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {e.placementStatus}
                                                    </span>
                                                    {e.placementStatus === 'Placed' && e.placementCompanyId && (
                                                        <p className="text-xs text-gray-500 mt-2">@ {e.placementCompanyId.name}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button onClick={() => handleOpenModal(e)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CRUD Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <h3 className="font-bold text-gray-900">{editMode ? 'Edit Enrollment' : 'Create Enrollment'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 p-6">
                            <form id="enrollmentForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Candidate / User</label>
                                    <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})}
                                        disabled={editMode}>
                                        <option value="">Select Candidate</option>
                                        {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                                    </select>
                                    {editMode && <p className="text-xs text-gray-400 mt-1">Candidate cannot be changed after enrollment.</p>}
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Batch</label>
                                    <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})}
                                        disabled={editMode}>
                                        <option value="">Select Batch</option>
                                        {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                                    <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Status Tracking</h4>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Status</label>
                                    <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="Enrolled">Enrolled</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Dropped">Dropped</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Placement Status</label>
                                    <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.placementStatus} onChange={e => setFormData({...formData, placementStatus: e.target.value})}>
                                        <option value="Pending">Pending</option>
                                        <option value="Placed">Placed</option>
                                        <option value="Not Placed">Not Placed</option>
                                    </select>
                                </div>

                                {formData.placementStatus === 'Placed' && (
                                    <>
                                        <div className="md:col-span-2 bg-green-50 p-4 rounded-lg mt-2 border border-green-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-green-800 mb-1">Placement Company</label>
                                                <select required className="w-full border border-green-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                                    value={formData.placementCompanyId} onChange={e => setFormData({...formData, placementCompanyId: e.target.value})}>
                                                    <option value="">Select Company</option>
                                                    {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-green-800 mb-1">Employer Feedback Score (1-5)</label>
                                                <input type="number" min="1" max="5" step="0.1" className="w-full border border-green-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500" 
                                                    value={formData.employerFeedbackScore} onChange={e => setFormData({...formData, employerFeedbackScore: e.target.value})} placeholder="e.g. 4.5" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                            <button type="submit" form="enrollmentForm" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                {editMode ? 'Save Changes' : 'Create Enrollment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEnrollments;
