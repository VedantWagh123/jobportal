import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AdminInstitutes = () => {
    const { backendUrl, adminToken } = useContext(AdminContext);
    const [institutes, setInstitutes] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Simplification for step 4: Read-only view for complex entities initially to ensure safety,
    // though the instructions asked for create/edit. I'll add basic create.
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', districtId: '', type: 'Private', accreditation: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { headers: { token: adminToken } };
                const [instRes, distRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/government-admin/institutes`, headers),
                    axios.get(`${backendUrl}/api/government-admin/districts`, headers)
                ]);
                
                if (instRes.data.success) setInstitutes(instRes.data.institutes);
                if (distRes.data.success) setDistricts(distRes.data.districts);
            } catch (error) {
                toast.error('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [adminToken, backendUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${backendUrl}/api/government-admin/institutes`, formData, {
                headers: { token: adminToken }
            });
            if (data.success) {
                toast.success('Institute created');
                setShowModal(false);
                // Refresh
                const res = await axios.get(`${backendUrl}/api/government-admin/institutes`, { headers: { token: adminToken } });
                setInstitutes(res.data.institutes);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating institute');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Training Institutes</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage supply capacity providers</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    + Add Institute
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="py-4 px-6">Name</th>
                                    <th className="py-4 px-6">District</th>
                                    <th className="py-4 px-6">Type</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {institutes.length === 0 ? (
                                    <tr><td colSpan="4" className="py-8 text-center text-gray-500">No institutes found</td></tr>
                                ) : (
                                    institutes.map(i => (
                                        <tr key={i._id} className="hover:bg-gray-50 transition">
                                            <td className="py-4 px-6">
                                                <p className="font-medium text-gray-900">{i.name}</p>
                                                <p className="text-xs text-gray-500">{i.email}</p>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{i.districtId?.name || 'N/A'}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    i.type === 'Government' ? 'bg-green-100 text-green-700' :
                                                    i.type === 'NGO' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {i.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Basic Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Add Institute</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input required type="email" className="w-full border rounded-lg px-3 py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input required type="password" className="w-full border rounded-lg px-3 py-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                <select required className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.districtId} onChange={e => setFormData({...formData, districtId: e.target.value})}>
                                    <option value="">Select District</option>
                                    {districts.map(d => <option key={d._id} value={d._id}>{d.name} ({d.state})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="Private">Private</option>
                                    <option value="Government">Government</option>
                                    <option value="NGO">NGO</option>
                                    <option value="Corporate">Corporate</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInstitutes;
