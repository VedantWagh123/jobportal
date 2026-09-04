import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AdminDistricts = () => {
    const { backendUrl, adminToken } = useContext(AdminContext);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', state: '', country: 'India' });
    
    const fetchDistricts = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/government-admin/districts`, {
                headers: { token: adminToken }
            });
            if (data.success) {
                setDistricts(data.districts);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch districts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDistricts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${backendUrl}/api/government-admin/districts`, formData, {
                headers: { token: adminToken }
            });
            if (data.success) {
                toast.success('District created successfully');
                setShowModal(false);
                setFormData({ name: '', state: '', country: 'India' });
                fetchDistricts();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating district');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Districts Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage geographic zones for supply data</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    + Add District
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
                                    <th className="py-4 px-6">State</th>
                                    <th className="py-4 px-6">Country</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {districts.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">No districts found</td>
                                    </tr>
                                ) : (
                                    districts.map(d => (
                                        <tr key={d._id} className="hover:bg-gray-50 transition">
                                            <td className="py-4 px-6 font-medium text-gray-900">{d.name}</td>
                                            <td className="py-4 px-6 text-gray-600">{d.state}</td>
                                            <td className="py-4 px-6 text-gray-500">{d.country}</td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Add New District</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">District Name</label>
                                <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Pune" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="e.g. Maharashtra" />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50" value={formData.country} disabled />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save District</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDistricts;
