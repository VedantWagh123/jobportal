import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AdminCourses = () => {
    const { backendUrl, adminToken } = useContext(AdminContext);
    const [courses, setCourses] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', instituteId: '', durationMonths: '', level: 'Beginner' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { headers: { token: adminToken } };
                const [courseRes, instRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/government-admin/courses`, headers),
                    axios.get(`${backendUrl}/api/government-admin/institutes`, headers)
                ]);
                if (courseRes.data.success) setCourses(courseRes.data.courses);
                if (instRes.data.success) setInstitutes(instRes.data.institutes);
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
            const { data } = await axios.post(`${backendUrl}/api/government-admin/courses`, formData, {
                headers: { token: adminToken }
            });
            if (data.success) {
                toast.success('Course created');
                setShowModal(false);
                const res = await axios.get(`${backendUrl}/api/government-admin/courses`, { headers: { token: adminToken } });
                setCourses(res.data.courses);
                setFormData({ name: '', description: '', instituteId: '', durationMonths: '', level: 'Beginner' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating course');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Directory</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage training curriculum definitions</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    + Add Course
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
                                    <th className="py-4 px-6">Course Name</th>
                                    <th className="py-4 px-6">Institute</th>
                                    <th className="py-4 px-6">Duration</th>
                                    <th className="py-4 px-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {courses.length === 0 ? (
                                    <tr><td colSpan="4" className="py-8 text-center text-gray-500">No courses found</td></tr>
                                ) : (
                                    courses.map(c => (
                                        <tr key={c._id} className="hover:bg-gray-50 transition">
                                            <td className="py-4 px-6 font-medium text-gray-900">{c.name}</td>
                                            <td className="py-4 px-6 text-gray-600">{c.instituteId?.name || 'N/A'}</td>
                                            <td className="py-4 px-6 text-gray-500">{c.durationMonths} Months</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {c.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Add Course</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                                <select required className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.instituteId} onChange={e => setFormData({...formData, instituteId: e.target.value})}>
                                    <option value="">Select Institute</option>
                                    {institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
                                <input required type="number" min="1" className="w-full border rounded-lg px-3 py-2" value={formData.durationMonths} onChange={e => setFormData({...formData, durationMonths: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea className="w-full border rounded-lg px-3 py-2" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                            <div className="col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
