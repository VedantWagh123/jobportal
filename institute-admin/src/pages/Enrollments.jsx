import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, BookOpen, UserCircle } from 'lucide-react';

const Enrollments = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            fetchBatches();
        }
    }, [user]);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/institute/management/batches', { headers: { token: user.token } });
            if (data.success) {
                setBatches(data.batches);
            }
        } catch (error) {
            console.error("Failed to fetch batches:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrollments = async (batchId) => {
        try {
            setLoadingStudents(true);
            const { data } = await axios.get(`/api/institute/management/batches/${batchId}/enrollments`, { headers: { token: user.token } });
            if (data.success) {
                setEnrollments(data.enrollments);
            }
        } catch (error) {
            console.error("Failed to fetch enrollments:", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleBatchClick = (batch) => {
        if (selectedBatch?._id === batch._id) {
            setSelectedBatch(null); // toggle off
        } else {
            setSelectedBatch(batch);
            fetchEnrollments(batch._id);
        }
    };

    if (loading) return <div className="flex justify-center p-8 text-gray-500">Loading enrollments...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Enrollments</h1>
                    <p className="text-gray-500 mt-1">View the list of students enrolled in your batches real-time.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {batches.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">No batches available.</div>
                ) : batches.map(batch => (
                    <div key={batch._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div 
                            onClick={() => handleBatchClick(batch)}
                            className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{batch.batchCode}</h3>
                                    <p className="text-sm text-gray-500">{batch.courseId?.name || 'Unknown Course'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-700">Enrolled</div>
                                <div className="flex items-center gap-1 justify-end text-lg font-bold text-indigo-600">
                                    <Users size={16} />
                                    {batch.enrolledCount} / {batch.capacity}
                                </div>
                            </div>
                        </div>
                        
                        {/* Expandable Details */}
                        {selectedBatch?._id === batch._id && (
                            <div className="border-t border-gray-100 bg-gray-50 p-4">
                                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Enrolled Students</h4>
                                {loadingStudents ? (
                                    <div className="text-sm text-gray-500 py-2">Loading students...</div>
                                ) : enrollments.length === 0 ? (
                                    <div className="text-sm text-gray-500 py-2">No students enrolled yet.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {enrollments.map(enr => (
                                            <div key={enr._id} className="flex items-center gap-3 bg-white p-3 rounded border border-gray-100 shadow-sm">
                                                {enr.userId?.image ? (
                                                    <img src={enr.userId.image} alt={enr.userId.name} className="w-10 h-10 rounded-full" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                        <UserCircle size={24} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{enr.userId?.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-gray-500">{enr.userId?.email || 'No email provided'}</p>
                                                </div>
                                                <div className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                                    {enr.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Enrollments;
