import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Plus, Calendar, Settings } from 'lucide-react';

const Batches = () => {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingBatchId, setEditingBatchId] = useState(null);
    
    // Form state
    const [courseId, setCourseId] = useState('');
    const [batchCode, setBatchCode] = useState('');
    const [capacity, setCapacity] = useState(30);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const { user } = useContext(AuthContext);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [batchesRes, coursesRes] = await Promise.all([
                axios.get('/api/institute/management/batches', { headers: { token: user.token } }),
                axios.get('/api/institute/management/courses', { headers: { token: user.token } })
            ]);
            
            if (batchesRes.data.success) setBatches(batchesRes.data.batches);
            if (coursesRes.data.success) {
                setCourses(coursesRes.data.courses);
                if (coursesRes.data.courses.length > 0) setCourseId(coursesRes.data.courses[0]._id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleAddBatch = async (e) => {
        e.preventDefault();
        try {
            if (editingBatchId) {
                const { data } = await axios.put(`/api/institute/management/batches/${editingBatchId}`, {
                    courseId, batchCode, capacity, startDate, endDate
                }, { headers: { token: user.token } });
                if (data.success) {
                    setBatches(batches.map(b => b._id === editingBatchId ? data.batch : b));
                    setIsAdding(false);
                    setEditingBatchId(null);
                    setBatchCode('');
                }
            } else {
                const { data } = await axios.post('/api/institute/management/batches', {
                    courseId, batchCode, capacity, startDate, endDate
                }, { headers: { token: user.token } });
                
                if (data.success) {
                    setBatches([data.batch, ...batches]);
                    setIsAdding(false);
                    setBatchCode('');
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save batch');
        }
    };

    const handleEditClick = (batch) => {
        setEditingBatchId(batch._id);
        setCourseId(batch.courseId._id);
        setBatchCode(batch.batchCode);
        setCapacity(batch.capacity);
        setStartDate(batch.startDate ? batch.startDate.substring(0,10) : '');
        setEndDate(batch.endDate ? batch.endDate.substring(0,10) : '');
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingBatchId(null);
        setBatchCode('');
        setCapacity(30);
        setStartDate('');
        setEndDate('');
        if (courses.length > 0) setCourseId(courses[0]._id);
    };

    const updateStatus = async (id, status) => {
        try {
            const { data } = await axios.put(`/api/institute/management/batches/${id}/status`, { status }, {
                headers: { token: user.token }
            });
            if (data.success) {
                setBatches(batches.map(b => b._id === id ? data.batch : b));
            }
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="flex justify-center p-8 text-gray-500">Loading batches...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Batches & Capacity</h1>
                    <p className="text-gray-500 mt-1">Declare your active batches to influence local supply metrics.</p>
                </div>
                <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                    <Plus size={20} />
                    New Batch
                </button>
            </header>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <h2 className="text-lg font-bold mb-4">{editingBatchId ? 'Edit Batch Capacity & Timeline' : 'Create New Batch'}</h2>
                    {courses.length === 0 ? (
                        <p className="text-red-500 text-sm">Please add a course first before creating a batch.</p>
                    ) : (
                        <form onSubmit={handleAddBatch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                                    <select required value={courseId} onChange={e=>setCourseId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg">
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code / ID</label>
                                    <input type="text" required value={batchCode} onChange={e=>setBatchCode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g. BTH-2026-A1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Max Students)</label>
                                    <input type="number" required min="1" value={capacity} onChange={e=>setCapacity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" required value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" required value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">{editingBatchId ? 'Save Changes' : 'Create Batch'}</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Batch Details</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Timeline</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {batches.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No batches declared yet.</td></tr>
                            ) : batches.map(batch => (
                                <tr key={batch._id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{batch.batchCode}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <Users size={14}/> Capacity: {batch.capacity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{batch.courseId?.name || 'Unknown Course'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1"><Calendar size={14}/> {new Date(batch.startDate).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-1 mt-1 opacity-70"><Calendar size={14}/> {new Date(batch.endDate).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={batch.status} 
                                            onChange={(e) => updateStatus(batch._id, e.target.value)}
                                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${
                                                batch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                batch.status === 'Planning' ? 'bg-amber-100 text-amber-700' :
                                                batch.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            <option value="Planning">Planning</option>
                                            <option value="Active">Active</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEditClick(batch)} title="Edit Batch Capacity" className="text-gray-400 hover:text-emerald-600 transition-colors">
                                            <Settings size={18} />
                                        </button>
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

export default Batches;
