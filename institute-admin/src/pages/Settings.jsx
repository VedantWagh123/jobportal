import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Bell, Shield, Lock, Eye, EyeOff, Save, Loader2,
    CheckCircle2, AlertCircle, Smartphone, Mail, Globe, Moon
} from 'lucide-react';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [toast, setToast] = useState(null);
    const [pwLoading, setPwLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    // Notification prefs (local UI state only — connect to backend when ready)
    const [notif, setNotif] = useState({
        emailAlerts: true,
        batchUpdates: true,
        placementReports: false,
        smsAlerts: false,
    });

    // Password change state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast('error', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            showToast('error', 'Password must be at least 6 characters.');
            return;
        }
        setPwLoading(true);
        try {
            const { data } = await axios.put(
                '/api/institute/auth/change-password',
                { oldPassword, newPassword },
                { headers: { token: user.token } }
            );
            if (data.success) {
                showToast('success', 'Password changed successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showToast('error', data.message || 'Failed to change password.');
            }
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    const inputCls =
        'w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium py-2.5 px-4 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300';

    const Toggle = ({ checked, onChange }) => (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer focus:outline-none ${
                checked ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
        >
            <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );

    return (
        <div className="max-w-3xl mx-auto pb-12">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold animate-fade-in ${
                    toast.type === 'success' ? 'bg-indigo-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Page Header */}
            <div className="mb-8">
                <p className="text-[11px] font-bold tracking-widest uppercase text-indigo-600 mb-1">
                    Application Settings
                </p>
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Manage your security, notifications, and application preferences.
                </p>
            </div>

            <div className="space-y-6">

                {/* Notification Preferences */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Notification Preferences</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Choose how you want to receive alerts and updates.</p>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            {
                                key: 'emailAlerts',
                                icon: <Mail size={17} className="text-indigo-500" />,
                                title: 'Email Alerts',
                                desc: 'Receive important updates via email.',
                            },
                            {
                                key: 'batchUpdates',
                                icon: <Globe size={17} className="text-emerald-500" />,
                                title: 'Batch & Enrollment Updates',
                                desc: 'Get notified when students enroll or batch status changes.',
                            },
                            {
                                key: 'placementReports',
                                icon: <Moon size={17} className="text-amber-500" />,
                                title: 'Placement Reports',
                                desc: 'Weekly summary of placement activity.',
                            },
                            {
                                key: 'smsAlerts',
                                icon: <Smartphone size={17} className="text-rose-500" />,
                                title: 'SMS Alerts',
                                desc: 'Receive critical alerts via SMS on your registered number.',
                            },
                        ].map(({ key, icon, title, desc }) => (
                            <div key={key} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-slate-100 rounded-lg">{icon}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={notif[key]}
                                    onChange={(val) => setNotif(prev => ({ ...prev, [key]: val }))}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security - Change Password */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="bg-rose-50 p-2 rounded-xl text-rose-600">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Security</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Keep your account safe with a strong password.</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Current Password</label>
                            <div className="relative">
                                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type={showOld ? 'text' : 'password'}
                                    value={oldPassword}
                                    onChange={e => setOldPassword(e.target.value)}
                                    className={`${inputCls} pl-10 pr-11`}
                                    placeholder="Enter current password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOld(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showOld ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">New Password</label>
                                <div className="relative">
                                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className={`${inputCls} pl-10 pr-11`}
                                        placeholder="Min. 6 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
                                <div className="relative">
                                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="Re-enter new password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={pwLoading}
                                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
                            >
                                {pwLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {pwLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Account Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl text-slate-500 shadow-sm">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">Logged in as <span className="text-indigo-600">{user?.name}</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            To update your institute name, contact details, and address, go to{' '}
                            <a href="/profile" className="text-indigo-600 font-semibold hover:underline">Institute Profile</a>.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
