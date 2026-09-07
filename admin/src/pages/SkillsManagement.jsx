import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Check, X, AlertCircle } from 'lucide-react';

const SkillsManagement = () => {
    const [activeTab, setActiveTab] = useState('unresolved');
    const [skills, setSkills] = useState([]);
    const [masterSkills, setMasterSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchSkills = async () => {
        try {
            setLoading(true);
            if (activeTab === 'unresolved') {
                const { data } = await axios.get('/api/super-admin/skills/unresolved', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setSkills(data);
            } else {
                const { data } = await axios.get('/api/super-admin/skills/master', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setMasterSkills(data);
            }
        } catch (error) {
            console.error('Failed to fetch skills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSkills();
        }
    }, [user, activeTab]);

    const [searchQuery, setSearchQuery] = useState('');

    const handleApprove = async (id) => {
        try {
            const { data } = await axios.post(`/api/super-admin/skills/unresolved/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSkills(skills.filter(s => s._id !== id));
            if (activeTab === 'unresolved') {
                // If we want to show a toast we can, but silent is better.
            }
        } catch (error) {
            alert(`Failed to approve skill: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.delete(`/api/super-admin/skills/unresolved/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSkills(skills.filter(s => s._id !== id));
        } catch (error) {
            alert('Failed to reject skill');
        }
    };

    const filteredMasterSkills = masterSkills.filter(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (skill.aliases && skill.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'unresolved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('unresolved')}
                >
                    Unresolved Queue {skills.length > 0 && activeTab === 'unresolved' && <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">{skills.length}</span>}
                </button>
                <button
                    className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'master' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('master')}
                >
                    Master Skills Database
                </button>
            </div>

            {loading ? (
                <div className="text-gray-500 py-10 text-center">Loading skills data...</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {activeTab === 'unresolved' ? (
                        <>
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Unresolved Skills Queue</h3>
                                    <p className="text-sm text-gray-500 mt-1">Review new skills detected by the AI parsing engine before they enter the canonical master list.</p>
                                </div>
                                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {skills.length} Pending
                                </div>
                            </div>

                            {skills.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <Check size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Queue is empty!</p>
                                    <p className="text-sm">All AI-detected skills have been resolved.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white border-b border-gray-100">
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skill Name</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">First Detected</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {skills.map((skill) => (
                                                <tr key={skill._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-medium text-gray-900">{skill.normalizedName}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                        {skill.frequency || 1} times
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                        {new Date(skill.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                        <button 
                                                            onClick={() => handleReject(skill._id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject & Delete"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleApprove(skill._id)}
                                                            className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 font-medium text-sm rounded-lg transition-colors border border-green-200"
                                                        >
                                                            Approve to Master
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Master Skills Database</h3>
                                    <p className="text-sm text-gray-500 mt-1">This is the canonical list of approved skills used by the AI engine.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            placeholder="Search skills..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                                        />
                                    </div>
                                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                        {filteredMasterSkills.length} Total Skills
                                    </div>
                                </div>
                            </div>

                            {filteredMasterSkills.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <p className="text-lg font-medium">No master skills found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white border-b border-gray-100">
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Canonical Name</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aliases (Mapped Variants)</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Added</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredMasterSkills.map((skill) => (
                                                <tr key={skill._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-bold text-blue-600">{skill.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">{skill.category || 'Uncategorized'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                                        <div className="flex flex-wrap gap-1">
                                                            {skill.aliases && skill.aliases.length > 0 ? skill.aliases.map((alias, idx) => (
                                                                <span key={idx} className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full text-xs">{alias}</span>
                                                            )) : <span className="text-gray-400 italic">None</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                                        {new Date(skill.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SkillsManagement;
