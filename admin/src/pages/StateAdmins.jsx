import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Users, Trash2, Plus, Shield, Search, ChevronRight, Home,
    CheckCircle2, XCircle, AlertCircle, RefreshCw, Mail,
    Building2, MapPin, X, Loader2
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   GLOBAL KEYFRAMES
───────────────────────────────────────────────────────── */
const GlobalStyles = () => (
    <style>{`
        @keyframes fadeUp  {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn {from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer {from{background-position:-200% 0}to{background-position:200% 0}}
        .au{animation:fadeUp .42s cubic-bezier(.22,1,.36,1) both}
        .sc{animation:scaleIn .28s cubic-bezier(.22,1,.36,1) both}
        .su{animation:slideUp .35s cubic-bezier(.22,1,.36,1) both}
        .row-hover:hover td{background:rgba(248,250,252,.85);}
    `}</style>
);

/* ─────────────────────────────────────────────────────────
   GOVERNMENT BUILDING SVG (Light Theme)
───────────────────────────────────────────────────────── */
const GovBuildingSVG = () => (
    <svg viewBox="0 0 500 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
        <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f4faeb"/>
                <stop offset="100%" stopColor="#ffffff"/>
            </linearGradient>
            <linearGradient id="pillarGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f8fafc"/>
                <stop offset="100%" stopColor="#e2e8f0"/>
            </linearGradient>
            <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#cbd5e1"/>
                <stop offset="100%" stopColor="#94a3b8"/>
            </linearGradient>
        </defs>
        
        {/* Background Sky */}
        <rect width="500" height="180" fill="url(#skyGrad)"/>
        
        {/* Background Trees (Soft glowing circles) */}
        <circle cx="150" cy="130" r="40" fill="#dcfce7" opacity="0.6"/>
        <circle cx="190" cy="140" r="30" fill="#bbf7d0" opacity="0.5"/>
        <circle cx="360" cy="120" r="50" fill="#dcfce7" opacity="0.5"/>
        <circle cx="410" cy="135" r="35" fill="#bbf7d0" opacity="0.4"/>
        
        {/* Rolling Hills (Subtle Tricolor) */}
        <path d="M0,165 Q125,155 250,162 T500,158 L500,180 L0,180 Z" fill="#ffedd5" opacity="0.8"/>
        <path d="M0,170 Q150,162 300,168 T500,165 L500,180 L0,180 Z" fill="#dcfce7" opacity="0.8"/>
        <path d="M0,175 Q150,165 250,172 T500,168 L500,180 L0,180 Z" fill="#cbd5e1" opacity="0.4"/>
        
        {/* Birds */}
        <path d="M80,60 Q85,55 90,60 Q95,55 100,60" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M120,45 Q123,42 126,45 Q129,42 132,45" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>

        {/* --- Main Building --- */}
        {/* Base Steps */}
        <rect x="220" y="152" width="160" height="10" fill="#94a3b8" rx="1"/>
        <rect x="225" y="144" width="150" height="8" fill="#cbd5e1" rx="1"/>
        <rect x="230" y="136" width="140" height="8" fill="#e2e8f0" rx="1"/>

        {/* Pillars */}
        {[240, 258, 276, 294, 312, 330].map(x => (
            <rect key={x} x={x} y="74" width="12" height="62" fill="url(#pillarGrad)" rx="1"/>
        ))}

        {/* Roof Base */}
        <rect x="225" y="66" width="150" height="8" fill="#e2e8f0" rx="1"/>
        <rect x="220" y="58" width="160" height="8" fill="#cbd5e1" rx="1"/>
        
        {/* Triangle Roof */}
        <polygon points="300,20 220,58 380,58" fill="url(#roofGrad)"/>
        
        {/* Roof Seal / Circle */}
        <circle cx="300" cy="45" r="5" fill="#f8fafc"/>
        <circle cx="300" cy="45" r="3" fill="#64748b"/>
    </svg>
);

/* ─────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────── */
const Toast = ({ msg }) => msg ? (
    <div className="fixed bottom-6 right-6 z-[200] bg-gray-950/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-[12px] font-bold flex items-center gap-2 border border-white/10 su">
        <span>{msg.slice(0, 2)}</span>{msg.slice(2)}
    </div>
) : null;

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const StateAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Form modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [scope, setScope] = useState('state');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Search and toast
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3500); };

    const fetchAdmins = async () => {
        try {
            setLoading(true);
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

    useEffect(() => { if (user) fetchAdmins(); }, [user]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { data } = await axios.post('/api/super-admin/admins', 
                { name, email, password, scope },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAdmins([data, ...admins]);
            setIsModalOpen(false);
            setName(''); setEmail(''); setPassword(''); setScope('state');
            showToast('✅ Admin account created successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, adminName) => {
        if (!window.confirm(`Are you sure you want to permanently delete the admin "${adminName}"?`)) return;
        try {
            await axios.delete(`/api/super-admin/admins/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAdmins(admins.filter(a => a._id !== id));
            showToast('🗑️ Admin account deleted');
        } catch (error) {
            showToast('❌ Failed to delete admin');
        }
    };

    const filteredAdmins = admins.filter(a => {
        const q = search.toLowerCase();
        return (a.name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q);
    });

    const stateCount = admins.filter(a => a.scope === 'state').length;
    const districtCount = admins.filter(a => a.scope === 'district').length;
    const nationalCount = admins.filter(a => a.scope === 'national').length;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-emerald-600 border-r-teal-500 animate-spin"/>
                <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-t-green-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '.75s' }}/>
            </div>
            <p className="text-gray-400 text-[13px] font-semibold tracking-wide animate-pulse">Loading admins…</p>
        </div>
    );

    return (
        <>
        <GlobalStyles />
        
        <div className="space-y-5 pb-12">
            {/* ═══════════════════════════════════════════
                HERO BANNER
            ═══════════════════════════════════════════ */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 au" style={{ animationDelay: '0ms' }}>
                <div className="flex flex-col md:flex-row items-stretch min-h-[190px]">
                    
                    {/* LEFT - Text Content */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10">
                        <nav className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 mb-3 tracking-wider uppercase">
                            <Home size={12}/>
                            <span className="hover:text-[#0B2757] cursor-pointer transition-colors">National Portal</span>
                            <ChevronRight size={10}/>
                            <span className="text-[#0B2757]">Government Admins</span>
                        </nav>

                        <h1 className="text-3xl sm:text-4xl font-black text-[#0B2757] leading-tight tracking-tight">
                            Administration Access
                        </h1>
                        <p className="text-gray-500 text-[14px] font-medium mt-2 leading-relaxed max-w-lg">
                            Manage State and District level administrative accounts securely. Provision access and oversee government personnel seamlessly.
                        </p>

                        <div className="flex items-center gap-3 mt-5 flex-wrap">
                            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-50/80 rounded-xl border border-emerald-100/50 shadow-sm">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><Shield size={14}/></div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-[9px] font-bold text-emerald-600/80 uppercase tracking-wide leading-none">Total</span>
                                    <span className="text-[15px] font-black text-emerald-700 leading-none mt-0.5">{admins.length}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-blue-50/80 rounded-xl border border-blue-100/50 shadow-sm">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Building2 size={14}/></div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-[9px] font-bold text-blue-600/80 uppercase tracking-wide leading-none">State</span>
                                    <span className="text-[15px] font-black text-blue-700 leading-none mt-0.5">{stateCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-amber-50/80 rounded-xl border border-amber-100/50 shadow-sm">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600"><MapPin size={14}/></div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-[9px] font-bold text-amber-600/80 uppercase tracking-wide leading-none">District</span>
                                    <span className="text-[15px] font-black text-amber-700 leading-none mt-0.5">{districtCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - Illustration (Matching Reference) */}
                    <div className="hidden md:block relative w-[360px] lg:w-[450px] shrink-0 bg-[#f4faeb]/30 overflow-hidden border-l border-gray-50">
                        <div className="absolute inset-0">
                            <GovBuildingSVG />
                        </div>

                        {/* Floating Emblem Badge (Exactly as reference) */}
                        <div className="absolute top-6 right-6 flex flex-col items-center justify-center gap-1 bg-white/95 backdrop-blur-xl border border-white/60 rounded-[18px] w-[86px] h-[92px] shadow-[0_12px_40px_rgb(0,0,0,0.12)] ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-[0_15px_45px_rgb(0,0,0,0.15)] transition-all duration-300">
                            <img src="/ashoka_emblem.png" alt="Ashoka Emblem" className="w-[46px] h-[46px] object-contain drop-shadow-sm" onError={e => { e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/100px-Emblem_of_India.svg.png'; }} />
                            <p className="text-[10px] font-bold text-gray-800 tracking-wide text-center mt-0.5" style={{ fontFamily: 'serif' }}>सत्यमेव जयते</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                TABLE SECTION
            ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden au" style={{ animationDelay: '100ms' }}>
                
                {/* Toolbar */}
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-2.5 bg-gray-50/80 border border-gray-200/60 rounded-xl px-4 py-2.5 w-full sm:w-80 focus-within:bg-white focus-within:border-[#0B2757] focus-within:ring-4 focus-within:ring-[#0B2757]/10 transition-all duration-200">
                        <Search size={15} className="text-gray-400 shrink-0"/>
                        <input type="text" placeholder="Search government personnel..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none flex-1 text-[13px] text-gray-700 placeholder-gray-400 font-medium min-w-0"/>
                    </div>
                    
                    <button onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-[#0B2757] hover:bg-[#133c85] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-md shadow-[#0B2757]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0">
                        <Plus size={16} /> Add Admin
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4 rounded-tl-xl">Admin Profile</th>
                                <th className="px-6 py-4">Scope & Role</th>
                                <th className="px-6 py-4">Date Joined</th>
                                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/80">
                            {filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner">
                                                <Users size={28} className="text-gray-300"/>
                                            </div>
                                            <p className="font-bold text-gray-500 text-sm">No administrators found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAdmins.map((admin, idx) => (
                                <tr key={admin._id} className="row-hover group transition-colors au bg-white hover:bg-gray-50/50" style={{ animationDelay: `${idx * 40}ms` }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#0B2757] to-[#1e488d] flex items-center justify-center font-black text-white text-[15px] shadow-sm shrink-0 ring-4 ring-gray-50 group-hover:scale-105 transition-transform">
                                                {(admin.name || 'A')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-[14px] group-hover:text-[#0B2757] transition-colors">{admin.name}</p>
                                                <p className="text-[12px] text-gray-500 flex items-center gap-1.5 mt-0.5"><Mail size={11} className="text-gray-400"/> {admin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {admin.scope === 'national' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100/50 uppercase tracking-wide"><Shield size={12}/> National Authority</span>}
                                        {admin.scope === 'state' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100/50 uppercase tracking-wide"><Building2 size={12}/> State Level</span>}
                                        {admin.scope === 'district' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100/50 uppercase tracking-wide"><MapPin size={12}/> District Level</span>}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-medium text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            {new Date(admin.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(admin._id, admin.name)}
                                            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" title="Delete">
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* ═══════════════════════════════════════════
            CREATE MODAL
        ═══════════════════════════════════════════ */}
        {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(8px)' }}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden sc">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><Shield size={18} className="text-emerald-600"/></div>
                            <div>
                                <h3 className="text-[16px] font-black text-gray-900 leading-tight">Create Admin</h3>
                                <p className="text-[11px] font-medium text-gray-500 mt-0.5">Provision a new government account</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X size={16}/></button>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-[12px] font-bold mb-5 border border-red-100">
                                <AlertCircle size={14}/> {error}
                            </div>
                        )}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} 
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    placeholder="e.g. Rahul Sharma" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    placeholder="official@gov.in" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1.5">Administrative Scope</label>
                                <select value={scope} onChange={e => setScope(e.target.value)} 
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all appearance-none cursor-pointer">
                                    <option value="state">State Level (State Nodal Officer)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1.5">Temporary Password</label>
                                <input type="text" required value={password} onChange={e => setPassword(e.target.value)} 
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-mono"
                                    placeholder="Temp@123" />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} 
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 flex items-center justify-center py-3 rounded-xl font-bold text-[13px] text-white bg-emerald-600 hover:bg-emerald-700 transition-all hover:shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none">
                                    {submitting ? <Loader2 size={16} className="animate-spin"/> : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        <Toast msg={toast}/>
        </>
    );
};

export default StateAdmins;
