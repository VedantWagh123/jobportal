import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Building2, Ban, CheckCircle, Trash2, Mail, Briefcase, Filter } from 'lucide-react';

const EmployersManagement = () => {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Pending, Approved, Banned
    const { user } = useContext(AuthContext);

    const fetchEmployers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/super-admin/employers', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEmployers(data.employers);
        } catch (error) {
            console.error('Failed to fetch employers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEmployers();
        }
    }, [user]);

    const updateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this employer as ${status}?`)) return;
        
        try {
            await axios.put(`/api/super-admin/employers/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEmployers(employers.map(emp => emp._id === id ? { ...emp, status } : emp));
        } catch (error) {
            alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
        }
    };

    const deleteEmployer = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this employer and all their posted jobs? This action cannot be undone.')) return;

        try {
            await axios.delete(`/api/super-admin/employers/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEmployers(employers.filter(emp => emp._id !== id));
        } catch (error) {
            alert(`Failed to delete employer: ${error.response?.data?.message || error.message}`);
        }
    };

    const filteredEmployers = employers.filter(emp => filter === 'All' || emp.status === filter);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={14} /> Approved</span>;
            case 'Pending':
                return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Building2 size={14} /> Pending</span>;
            case 'Banned':
                return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Ban size={14} /> Banned</span>;
            default:
                return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={14} /> Approved</span>; // Legacy compatibility
        }
    };

    if (loading) return <div className="text-gray-500 py-10 text-center">Loading employer data...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Employer Management</h3>
                        <p className="text-sm text-gray-500 mt-1">Review, approve, ban, and manage companies registered on the platform.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-sm">
                            <Filter size={16} className="text-gray-400 ml-2" />
                            <select 
                                value={filter} 
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer pl-2 pr-8"
                            >
                                <option value="All">All Employers</option>
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Banned">Banned</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredEmployers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No employers found</p>
                        <p className="text-sm">Try changing the filter or wait for new registrations.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Details</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs Posted</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEmployers.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img src={emp.image} alt={emp.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-white" />
                                                <div>
                                                    <span className="font-bold text-gray-900 block">{emp.name}</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={12} /> {emp.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(emp.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase size={16} className="text-blue-500" />
                                                {emp.jobCount || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            {(emp.status === 'Pending' || emp.status === 'Banned') && (
                                                <button 
                                                    onClick={() => updateStatus(emp._id, 'Approved')}
                                                    className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 font-medium text-xs rounded-lg transition-colors border border-green-200"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            
                                            {(emp.status === 'Approved' || !emp.status || emp.status === 'Pending') && (
                                                <button 
                                                    onClick={() => updateStatus(emp._id, 'Banned')}
                                                    className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium text-xs rounded-lg transition-colors border border-amber-200"
                                                    title="Ban Employer"
                                                >
                                                    Ban
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => deleteEmployer(emp._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex align-middle"
                                                title="Delete Employer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployersManagement;
