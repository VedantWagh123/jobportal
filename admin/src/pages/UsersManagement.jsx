import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    Users, Search, ChevronLeft, ChevronRight, User as UserIcon, 
    Mail, MapPin, Phone, GraduationCap, Clock, FileText, 
    Briefcase, X, Calendar, Building, Trash2, AlertCircle
} from 'lucide-react';

const UsersManagement = () => {
    const { user } = useContext(AuthContext);
    
    // State
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const limit = 20;

    // Selected User Modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [userHistory, setUserHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Delete User Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user && user.token) {
            fetchUsers();
        }
    }, [page, user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/super-admin/users?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });

            if (data.success) {
                setUsersList(data.users);
                setTotalPages(data.totalPages);
                setTotalUsers(data.total);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        setIsModalOpen(true);
        setLoadingHistory(true);
        try {
            const { data } = await axios.get(`/api/super-admin/users/${userId}/history`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            if (data.success) {
                setSelectedUser(data.user);
                setUserHistory(data.history);
            }
        } catch (error) {
            toast.error('Failed to fetch user details');
            setIsModalOpen(false);
        } finally {
            setLoadingHistory(false);
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        setIsDeleting(true);
        try {
            const { data } = await axios.delete(`/api/super-admin/users/${userToDelete._id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            
            if (data.success) {
                toast.success('User deleted successfully');
                setUsersList(prev => prev.filter(u => u._id !== userToDelete._id));
                setTotalUsers(prev => prev - 1);
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = usersList.filter(u => 
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0B2757] flex items-center gap-2">
                        <Users className="text-blue-600" size={28} />
                        Candidates & Users Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Total {totalUsers} registered candidates on the platform.
                    </p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                    />
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        No candidates found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((candidate) => (
                                    <tr key={candidate._id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden shrink-0">
                                                    {candidate.image && candidate.image.includes('http') ? (
                                                        <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        candidate.name?.charAt(0).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{candidate.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">ID: {candidate._id.substring(0, 12)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Mail size={14} className="text-gray-400" />
                                                    {candidate.email}
                                                </div>
                                                {candidate.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Phone size={14} className="text-gray-400" />
                                                        {candidate.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <MapPin size={14} className="text-gray-400 shrink-0" />
                                                <span className="truncate max-w-[150px]">{candidate.city || candidate.address || 'Not specified'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleViewUser(candidate._id)}
                                                    className="px-4 py-1.5 bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-lg text-sm font-semibold transition-all shadow-sm"
                                                >
                                                    View History
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(candidate)}
                                                    className="p-1.5 bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all shadow-sm group"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <p className="text-sm text-gray-500 font-medium">
                            Showing page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-50 transition-colors bg-white shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-50 transition-colors bg-white shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for User Details & History */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#f8fafc] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-black text-[#0B2757] flex items-center gap-2">
                                <UserIcon className="text-blue-600" />
                                Candidate Profile & History
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {loadingHistory ? (
                                <div className="h-40 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : selectedUser && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    
                                    {/* Left Sidebar: User Details */}
                                    <div className="lg:col-span-1 space-y-4">
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                                            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-100 flex items-center justify-center mb-3">
                                                {selectedUser.image ? (
                                                    <img src={selectedUser.image} alt={selectedUser.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl font-bold text-blue-600">{selectedUser.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedUser.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded-full">Clerk ID: {selectedUser._id.substring(0, 8)}...</p>
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Contact Info</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <Mail size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                                    <span className="text-sm text-gray-600 break-all">{selectedUser.email}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Phone size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                                    <span className="text-sm text-gray-600">{selectedUser.phone || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                                    <span className="text-sm text-gray-600">{selectedUser.address || selectedUser.city || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <GraduationCap size={16} className="text-purple-500 mt-0.5 shrink-0" />
                                                    <span className="text-sm text-gray-600">{selectedUser.college || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 mb-3">Top Skills</h4>
                                            {selectedUser.skills && selectedUser.skills.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedUser.skills.slice(0, 10).map((skill, idx) => (
                                                        <span key={idx} className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-md border border-blue-100">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {selectedUser.skills.length > 10 && (
                                                        <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2.5 py-1 rounded-md">
                                                            +{selectedUser.skills.length - 10} more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No skills listed</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Content: Timeline */}
                                    <div className="lg:col-span-2">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                                            <h4 className="font-bold text-[#0B2757] text-lg mb-6 flex items-center gap-2">
                                                <Clock className="text-blue-600" />
                                                Activity Timeline
                                            </h4>
                                            
                                            {userHistory.length === 0 ? (
                                                <div className="h-40 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <FileText size={32} className="text-gray-300 mb-2" />
                                                    <p className="text-gray-500 font-medium">No applications or enrollments yet.</p>
                                                </div>
                                            ) : (
                                                <div className="relative pl-6 border-l-2 border-blue-100 space-y-8 pb-4">
                                                    {userHistory.map((item, idx) => (
                                                        <div key={idx} className="relative">
                                                            <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                                                                item.type === 'Application' ? 'bg-orange-500' : 'bg-emerald-500'
                                                            }`}></div>
                                                            
                                                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl hover:shadow-md transition-shadow">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                                item.type === 'Application' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                                                                            }`}>
                                                                                {item.type}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                                                                <Calendar size={12} />
                                                                                {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                                                                            </span>
                                                                        </div>
                                                                        <h5 className="font-bold text-gray-900 text-base">{item.title}</h5>
                                                                        <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1.5">
                                                                            {item.type === 'Application' ? <Briefcase size={14} className="text-gray-400" /> : <Building size={14} className="text-gray-400" />}
                                                                            {item.organization}
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div className="shrink-0 text-right">
                                                                        <span className={`inline-flex font-bold text-xs px-2.5 py-1 rounded-lg border ${
                                                                            item.status === 'Hired' || item.status === 'Accepted' || item.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                            item.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                            'bg-blue-50 text-blue-700 border-blue-200'
                                                                        }`}>
                                                                            {item.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(8px)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 border border-gray-100 animate-in zoom-in duration-200">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={26} className="text-red-500" />
                        </div>
                        <h3 className="text-[17px] font-black text-gray-900 text-center">Delete User?</h3>
                        <p className="text-[12px] text-gray-500 text-center mt-2 font-medium leading-relaxed">
                            Are you sure you want to permanently delete <strong>{userToDelete?.name}</strong>? This will also remove all their job applications and enrollments. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-[13px] text-white transition-all hover:opacity-90 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    'Yes, Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagement;
