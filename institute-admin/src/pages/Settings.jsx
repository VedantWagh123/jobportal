import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, Loader2, Building, MapPin, Phone, Mail } from 'lucide-react';

const Settings = () => {
    const { user, login } = useContext(AuthContext); // we use login to update context state
    const [loading, setLoading] = useState(false);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        // Fetch current profile details
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/api/institute/auth/me', {
                    headers: { token: user.token }
                });
                if (data.success && data.institute) {
                    setName(data.institute.name || '');
                    setEmail(data.institute.email || '');
                    setPhone(data.institute.phone || '');
                    setAddress(data.institute.address || '');
                    setDescription(data.institute.description || '');
                    // We need to fetch district name if we wanted, but we will leave it empty for them to overwrite
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        
        if (user?.token) {
            fetchProfile();
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put('/api/institute/auth/profile', 
                { name, phone, address, location, description },
                { headers: { token: user.token } }
            );

            if (data.success) {
                alert("Profile updated successfully!");
                // Update local auth context
                login({ ...user, name: data.institute.name });
                setShowForm(false);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <SettingsIcon className="text-primary-600" />
                    Institute Profile Settings
                </h1>
                <p className="text-gray-500 mt-1">Manage your public institute profile and contact information.</p>
                {!showForm && (
                    <button 
                        onClick={() => setShowForm(true)} 
                        className="mt-4 bg-primary-100 text-primary-700 px-4 py-2 rounded font-medium hover:bg-primary-200"
                    >
                        Edit Profile Again
                    </button>
                )}
            </header>

            {showForm && (
            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Institute Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Building size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Cannot change)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input 
                                        type="email" 
                                        disabled 
                                        value={email} 
                                        className="pl-10 w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Location */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Contact & Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Phone size={18} />
                                    </div>
                                    <input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Institute Location (District)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <MapPin size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={location} 
                                        onChange={(e) => setLocation(e.target.value)} 
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                        placeholder="e.g. Pune, Nagpur, Mumbai"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">This connects your institute to State Intelligence analytics.</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-gray-400">
                                    <MapPin size={18} />
                                </div>
                                <textarea 
                                    rows="3" 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)} 
                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                    placeholder="Enter complete physical address..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">About Institute</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea 
                                rows="4" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                placeholder="Describe your institute's facilities, history, and specializations..."
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                </div>
            </form>
            )}
        </div>
    );
};

export default Settings;
