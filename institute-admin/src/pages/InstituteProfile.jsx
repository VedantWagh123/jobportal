import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Building2, Mail, Phone, MapPin, FileText, Save, Loader2,
    CheckCircle2, AlertCircle, User2, Camera
} from 'lucide-react';

// -----------------------------------------------------------------------
// REUSABLE FIELD COMPONENTS
// -----------------------------------------------------------------------

const FormField = ({ label, hint, icon: Icon, children }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Icon size={17} />
                </div>
            )}
            {children}
        </div>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
);

const inputBase =
    'w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium py-2.5 pr-4 outline-none transition-all placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 hover:border-slate-300';
const inputWithIcon = `${inputBase} pl-10`;
const inputReadOnly = `${inputWithIcon} bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200 focus:border-slate-200 focus:ring-0`;

// -----------------------------------------------------------------------
// SECTION HEADING
// -----------------------------------------------------------------------

const SectionHeading = ({ title, description }) => (
    <div className="mb-5 pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
    </div>
);

// -----------------------------------------------------------------------
// MAIN PAGE
// -----------------------------------------------------------------------

const InstituteProfile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', msg: '' }
    const [showForm, setShowForm] = useState(false); // To toggle form visibility

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            setFetchLoading(true);
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
                    setLocation(data.institute.districtId?.name || '');
                    if (data.institute.image) {
                        setImagePreview(data.institute.image);
                    }
                    
                    // If profile has data, hide form by default
                    if (data.institute.phone || data.institute.address) {
                        setShowForm(false);
                    } else {
                        setShowForm(true);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
                showToast('error', 'Failed to load profile data.');
            } finally {
                setFetchLoading(false);
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
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('phone', phone.trim());
            formData.append('address', address.trim());
            formData.append('location', location.trim());
            formData.append('description', description.trim());
            
            if (image) {
                formData.append('image', image);
            }

            const { data } = await axios.put(
                '/api/institute/auth/profile',
                formData,
                { 
                    headers: { 
                        token: user.token,
                        'Content-Type': 'multipart/form-data'
                    } 
                }
            );

            if (data.success) {
                if (setUser) setUser({ ...user, name: data.institute.name, image: data.institute.image });
                showToast('success', 'Profile updated successfully!');
                setShowForm(false);
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const initials = name
        ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'IN';

    return (
        <div className="w-full max-w-5xl mx-auto pb-12">

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-fade-in ${
                    toast.type === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                }`}>
                    {toast.type === 'success'
                        ? <CheckCircle2 size={18} />
                        : <AlertCircle size={18} />
                    }
                    {toast.msg}
                </div>
            )}

            {/* Page Header */}
            <div className="mb-8">
                <p className="text-[11px] font-bold tracking-widest uppercase text-green-600 mb-1">
                    Institute Profile
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                            Institute Profile
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Manage your institute information and contact details.
                        </p>
                    </div>
                    {!fetchLoading && !showForm && (
                        <button 
                            onClick={() => setShowForm(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-xl shadow-sm shadow-green-200 transition-colors text-sm"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {fetchLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-green-500 mb-3" />
                    <p className="text-sm font-medium">Loading profile...</p>
                </div>
            ) : !showForm ? (
                <div className="space-y-6">
                    {/* Read-Only Profile Header */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-200">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Institute Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-2xl font-extrabold">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="text-center sm:text-left mt-2 sm:mt-0">
                            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                                <Building2 size={14} className="text-slate-400" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                    {user?.type || 'Government'} Institute
                                </span>
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                                {name || 'Your Institute Name'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
                                <Mail size={14} className="text-slate-400" />
                                {email}
                            </p>
                        </div>
                    </div>

                    {/* Read-Only Main Info Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 space-y-8">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Institute Name</p>
                                    <p className="font-semibold text-slate-800">{name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Email Address</p>
                                    <p className="font-semibold text-slate-800">{email}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Contact & Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                                    <p className="font-semibold text-slate-800">{phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">District / Location</p>
                                    <p className="font-semibold text-slate-800">{location || 'Not provided'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Full Address</p>
                                <p className="font-medium text-slate-700">{address || 'Not provided'}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">About Institute</h3>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Description</p>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6">

                    {/* Profile Header Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        
                        <div className="relative group cursor-pointer">
                            <label htmlFor="profileImage" className="cursor-pointer block">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Institute Logo" className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-2xl font-extrabold shrink-0 shadow-md shadow-green-200">
                                        {initials}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </label>
                            <input 
                                type="file" 
                                id="profileImage" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                    if(e.target.files && e.target.files[0]) {
                                        setImage(e.target.files[0]);
                                        setImagePreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }} 
                            />
                        </div>

                        <div className="text-center sm:text-left mt-2 sm:mt-0">
                            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                                <User2 size={14} className="text-slate-400" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                    Profile Information
                                </span>
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                                {name || 'Your Institute Name'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5 capitalize">
                                {user?.type || 'Government'} Institute
                            </p>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
                                <Mail size={12} />
                                {email}
                            </p>
                        </div>
                    </div>

                    {/* Main Info Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 md:p-7 space-y-7">

                            {/* Basic Information */}
                            <div>
                                <SectionHeading
                                    title="Basic Information"
                                    description="Core details about your institute."
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField label="Institute Name" icon={Building2}>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className={inputWithIcon}
                                            placeholder="Your Institute Name"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Email Address"
                                        icon={Mail}
                                        hint="Email cannot be changed after registration."
                                    >
                                        <input
                                            type="email"
                                            disabled
                                            value={email}
                                            className={inputReadOnly}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            {/* Contact & Location */}
                            <div>
                                <SectionHeading
                                    title="Contact & Location"
                                    description="Help students and employers find and contact your institute."
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    <FormField label="Phone Number" icon={Phone}>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className={inputWithIcon}
                                            placeholder="+91 9876543210"
                                        />
                                    </FormField>

                                    <FormField
                                        label="District / Location"
                                        icon={MapPin}
                                        hint="Connects your institute to State Intelligence analytics."
                                    >
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            className={inputWithIcon}
                                            placeholder="e.g. Pune, Nagpur, Mumbai"
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Full Address" icon={MapPin}>
                                    <textarea
                                        rows={3}
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        className={`${inputWithIcon} resize-none`}
                                        placeholder="Enter complete physical address..."
                                    />
                                </FormField>
                            </div>

                            {/* About Institute */}
                            <div>
                                <SectionHeading
                                    title="About Institute"
                                    description="A short description visible to students and employers."
                                />
                                <FormField label="Description" icon={FileText}>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className={`${inputWithIcon} resize-none`}
                                        placeholder="Describe your institute's facilities, history, and specializations..."
                                    />
                                </FormField>
                            </div>

                        </div>

                        {/* Footer Action */}
                        <div className="px-5 md:px-7 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs text-slate-400 font-medium">
                                Changes are saved to your live public profile.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-7 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-green-200 transition-all"
                            >
                                {loading
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : <Save size={18} />
                                }
                                {loading ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </div>

                </form>
            )}
        </div>
    );
};

export default InstituteProfile;
