import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Trash2, Plus, Shield } from 'lucide-react';

const StateAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [scope, setScope] = useState('state');
    const [error, setError] = useState('');

    const fetchAdmins = async () => {
        try {
            const { data } = await axios.get('/api/super-admin/admins', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAdmins(data);
        } catch (error) {
            console.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAdmins();
    }, [user]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await axios.post('/api/super-admin/admins', 
                { name, email, password, scope },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAdmins([data, ...admins]);
            setIsModalOpen(false);
            // Reset form
            setName(''); setEmail(''); setPassword(''); setScope('state');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this admin account?")) return;
        try {
            await axios.delete(`/api/super-admin/admins/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAdmins(admins.filter(a => a._id !== id));
        } catch (error) {
            alert('Failed to delete admin');
        }
    };

    if (loading) return <div className="text-gray-500">Loading admins...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Government Admins</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage State and District level administrative accounts.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={18} /> New Admin
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-primary-600"/> Create Government Admin
                        </h3>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
                        
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                                <input type="text" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Administrative Scope</label>
                                <select value={scope} onChange={e => setScope(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                                    <option value="state">State Level</option>
                                    <option value="district">District Level</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Scope</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {admins.map((admin) => (
                            <tr key={admin._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{admin.name}</td>
                                <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">{admin.scope}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(admin._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {admins.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    <Users size={32} className="mx-auto mb-2 opacity-50"/>
                                    No government admins created yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StateAdmins;
