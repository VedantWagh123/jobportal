import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Building, Check, X, Loader2, AlertCircle } from 'lucide-react';

const InstituteManagement = () => {
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const fetchInstitutes = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/super-admin/institutes', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (data.success) {
                setInstitutes(data.institutes);
            }
        } catch (err) {
            setError('Failed to fetch institutes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchInstitutes();
    }, [user]);

    const handleApprove = async (id) => {
        try {
            const { data } = await axios.put(`/api/super-admin/institutes/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (data.success) {
                setInstitutes(institutes.map(inst => inst._id === id ? { ...inst, isApproved: true } : inst));
            }
        } catch (err) {
            alert('Error approving institute');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and remove this institute?')) return;
        try {
            const { data } = await axios.delete(`/api/super-admin/institutes/${id}/reject`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (data.success) {
                setInstitutes(institutes.filter(inst => inst._id !== id));
            }
        } catch (err) {
            alert('Error rejecting institute');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;

    const pendingInstitutes = institutes.filter(i => !i.isApproved);
    const approvedInstitutes = institutes.filter(i => i.isApproved);

    return (
        <div className="space-y-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Institute Management</h1>
                <p className="text-gray-500 mt-1">Review and approve Training Institutes joining the platform.</p>
            </header>

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg flex items-center gap-2"><AlertCircle size={20} />{error}</div>}

            {/* Pending Approvals Section */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden mb-8">
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                        <Building size={20} />
                        Pending Approvals
                        <span className="bg-amber-200 text-amber-800 text-xs py-0.5 px-2 rounded-full">{pendingInstitutes.length}</span>
                    </h2>
                </div>
                {pendingInstitutes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No pending institutes to review.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                                    <th className="px-6 py-3">Institute Name</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">District</th>
                                    <th className="px-6 py-3">Accreditation</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingInstitutes.map(inst => (
                                    <tr key={inst._id} className="hover:bg-amber-50/30">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{inst.name}</div>
                                            <div className="text-xs text-gray-500">{inst.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{inst.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{inst.districtId?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{inst.accreditation || '-'}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleApprove(inst._id)} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-emerald-200 transition-colors">
                                                <Check size={16} /> Approve
                                            </button>
                                            <button onClick={() => handleReject(inst._id)} className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-200 transition-colors">
                                                <X size={16} /> Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approved Institutes Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Approved Institutes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                                <th className="px-6 py-3">Institute Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">District</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {approvedInstitutes.map(inst => (
                                <tr key={inst._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{inst.name}</div>
                                        <div className="text-xs text-gray-500">{inst.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{inst.type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{inst.districtId?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Active</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleReject(inst._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default InstituteManagement;
