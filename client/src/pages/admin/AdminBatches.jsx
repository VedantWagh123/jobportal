import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AdminBatches = () => {
    const { backendUrl, adminToken } = useContext(AdminContext);
    const [batches, setBatches] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [courses, setCourses] = useState([]); // All courses or filtered courses
    
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    // Filters
    const [filterInstitute, setFilterInstitute] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    
    const initialFormState = {
        _id: '',
        instituteId: '',
        courseId: '',
        batchName: '',
        capacity: '',
        startDate: '',
        endDate: '',
        status: 'Planned'
    };
    
    const [formData, setFormData] = useState(initialFormState);

    const fetchReferenceData = async () => {
        try {
            const headers = { headers: { token: adminToken } };
            const [instRes, courseRes] = await Promise.all([
                axios.get(`${backendUrl}/api/government-admin/institutes`, headers),
                axios.get(`${backendUrl}/api/government-admin/courses`, headers)
            ]);
            if (instRes.data.success) setInstitutes(instRes.data.institutes);
            if (courseRes.data.success) setCourses(courseRes.data.courses);
        } catch (error) {
            toast.error('Failed to load reference data');
        }
    };

    const fetchBatches = async () => {
        try {
            setLoading(true);
            let query = [];
            if (filterInstitute) query.push(`instituteId=${filterInstitute}`);
            if (filterCourse) query.push(`courseId=${filterCourse}`);
            if (filterStatus) query.push(`status=${filterStatus}`);
            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            
            const { data } = await axios.get(`${backendUrl}/api/government-admin/batches${queryString}`, {
                headers: { token: adminToken }
            });
            if (data.success) setBatches(data.batches);
        } catch (error) {
            toast.error('Failed to fetch batches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminToken) {
            fetchReferenceData();
            fetchBatches();
        }
    }, [adminToken, filterInstitute, filterCourse, filterStatus, backendUrl]);

    const handleOpenModal = (batch = null) => {
        if (batch) {
            setEditMode(true);
            setFormData({
                _id: batch._id,
                instituteId: batch.instituteId?._id || '',
                courseId: batch.courseId?._id || '',
                batchName: batch.batchName,
                capacity: batch.capacity,
                startDate: new Date(batch.startDate).toISOString().split('T')[0],
                endDate: new Date(batch.endDate).toISOString().split('T')[0],
                status: batch.status
            });
        } else {
            setEditMode(false);
            setFormData(initialFormState);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (Number(formData.capacity) <= 0) {
            return toast.error("Capacity must be greater than 0");
        }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            return toast.error("End Date cannot be before Start Date");
        }

        try {
            const payload = { ...formData };
            let res;
            if (editMode) {
                res = await axios.put(`${backendUrl}/api/government-admin/batches/${formData._id}`, payload, {
                    headers: { token: adminToken }
                });
            } else {
                res = await axios.post(`${backendUrl}/api/government-admin/batches`, payload, {
                    headers: { token: adminToken }
                });
            }

            if (res.data.success) {
                toast.success(editMode ? 'Batch updated successfully' : 'Batch created successfully');
                setShowModal(false);
                fetchBatches();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    // Derived filtered courses based on selected institute in form
    const formAvailableCourses = formData.instituteId 
        ? courses.filter(c => c.instituteId?._id === formData.instituteId || c.instituteId === formData.instituteId)
        : courses;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Training Batches</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor and manage supply capacity</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    + Add Batch
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[200px]"
                    value={filterInstitute} onChange={e => setFilterInstitute(e.target.value)}>
                    <option value="">All Institutes</option>
                    {institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                </select>
                
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[200px]"
                    value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Planned">Planned</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading batches...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="py-4 px-6">Batch Name</th>
                                    <th className="py-4 px-6">Institute & Course</th>
                                    <th className="py-4 px-6">Timeline</th>
                                    <th className="py-4 px-6">Capacity</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {batches.length === 0 ? (
                                    <tr><td colSpan="6" className="py-8 text-center text-gray-500">No batches found</td></tr>
                                ) : (
                                    batches.map(b => (
                                        <tr key={b._id} className="hover:bg-gray-50 transition">
                                            <td className="py-4 px-6 font-medium text-gray-900">{b.batchName}</td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm font-semibold">{b.instituteId?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{b.courseId?.name || 'Unknown'}</p>
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{b.capacity} Seats</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    b.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                                                    b.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                                                    b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button onClick={() => handleOpenModal(b)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">{editMode ? 'Edit Batch' : 'Create New Batch'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                                <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.batchName} onChange={e => setFormData({...formData, batchName: e.target.value})} placeholder="e.g. Summer Full Stack 2024" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Training Institute</label>
                                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={formData.instituteId} onChange={e => setFormData({...formData, instituteId: e.target.value, courseId: ''})}>
                                    <option value="">Select Institute</option>
                                    {institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}
                                    disabled={!formData.instituteId}>
                                    <option value="">{formData.instituteId ? 'Select Course' : 'Select Institute First'}</option>
                                    {formAvailableCourses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Seats)</label>
                                <input required type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="Planned">Planned</option>
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                    {editMode ? 'Save Changes' : 'Create Batch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBatches;
