import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Save, User, Bell, Shield, Key } from 'lucide-react';

const Toast = ({ msg }) => msg ? (
    <div className="fixed bottom-6 right-6 z-[200] bg-gray-950/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-[12px] font-bold flex items-center gap-2 border border-white/10 animate-in slide-in-from-bottom-5">
        <span>{msg.slice(0, 2)}</span>{msg.slice(2)}
    </div>
) : null;

const Settings = () => {
    const { user, setUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // Form states
    const [name, setName] = useState(user?.name || 'System Administrator');
    const [email, setEmail] = useState(user?.email || 'admin@platform.gov');
    const [avatar, setAvatar] = useState(user?.avatar || null);

    const showToast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(''), 3500); };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call & update context locally
        setTimeout(() => {
            const updatedUser = { ...user, name, email, avatar };
            setUser(updatedUser);
            localStorage.setItem('superAdminInfo', JSON.stringify(updatedUser));
            
            setIsSaving(false);
            showToast('✅ Profile settings updated successfully!');
        }, 800);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Settings</h1>
                <p className="text-gray-500 font-medium mt-1">Manage your administrative preferences and system configurations.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-4 shrink-0">
                    <nav className="space-y-1">
                        {[
                            { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
                            { id: 'security', label: 'Security', icon: <Shield size={18} /> },
                            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-6 md:p-8">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                                <p className="text-sm text-gray-500">Update your account's profile information and email address.</p>
                            </div>
                            
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black shadow-inner overflow-hidden">
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                        Change Avatar
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </label>
                                    {avatar && (
                                        <button onClick={() => setAvatar(null)} className="px-4 py-2 bg-red-50 text-red-600 font-medium text-sm rounded-lg hover:bg-red-100 transition-colors">
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Department / Role</label>
                                    <input 
                                        type="text" 
                                        defaultValue="Super Admin"
                                        disabled
                                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl outline-none text-sm cursor-not-allowed"
                                    />
                                </div>

                                <div className="md:col-span-2 flex justify-end pt-4">
                                    <button disabled={isSaving} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-[13px] rounded-xl shadow-md shadow-blue-500/20 transition-all">
                                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab !== 'profile' && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Shield size={48} className="mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-gray-700 mb-1">Coming Soon</h3>
                            <p className="text-sm">This settings module is under construction.</p>
                        </div>
                    )}
                </div>
            </div>
            <Toast msg={toastMsg} />
        </div>
    );
};

export default Settings;
