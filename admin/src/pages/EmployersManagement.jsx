import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Building2, Ban, CheckCircle2, Trash2, Mail, Briefcase,
    Search, ChevronLeft, ChevronRight, MoreHorizontal,
    XCircle, Clock, Eye, RefreshCw, AlertCircle, Home,
    ArrowUpDown, SortAsc, SortDesc, TrendingUp, Users,
    Filter, Shield, MapPin
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   GLOBAL KEYFRAMES
───────────────────────────────────────────────────────── */
const GlobalStyles = () => (
    <style>{`
        @keyframes fadeUp  {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn {from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse2  {0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes spin90  {to{transform:rotate(360deg)}}
        .au{animation:fadeUp .42s cubic-bezier(.22,1,.36,1) both}
        .sc{animation:scaleIn .28s cubic-bezier(.22,1,.36,1) both}
        .su{animation:slideUp .35s cubic-bezier(.22,1,.36,1) both}
        .emp-row:hover td{background:rgba(248,250,252,.85);}
        .shimmer::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);background-size:200% 100%;border-radius:inherit;opacity:0;transition:opacity .2s}
        .shimmer:hover::after{opacity:1;animation:shimmer2 1s ease}
        @keyframes shimmer2{from{background-position:-200% 0}to{background-position:200% 0}}
        @keyframes chakraSpin{to{transform:rotate(360deg)}}
        .chakra-bg{animation:chakraSpin 22s linear infinite}
    `}</style>
);

/* ─────────────────────────────────────────────────────────
   CHAKRA WATERMARK
───────────────────────────────────────────────────────── */
const ChakraWatermark = ({ size = 100 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#1D4ED8" strokeWidth="3"/>
        <circle cx="50" cy="50" r="7" fill="#1D4ED8"/>
        {Array.from({ length: 24 }, (_, i) => {
            const a = (i * 15 * Math.PI) / 180;
            return <line key={i}
                x1={50 + 7  * Math.cos(a)} y1={50 + 7  * Math.sin(a)}
                x2={50 + 46 * Math.cos(a)} y2={50 + 46 * Math.sin(a)}
                stroke="#1D4ED8" strokeWidth="1.6"/>;
        })}
    </svg>
);

/* ─────────────────────────────────────────────────────────
   CITYSCAPE BANNER SVG — light, modern
───────────────────────────────────────────────────────── */
const CityscapeSVG = () => (
    <svg viewBox="0 0 500 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMax meet">
        <defs>
            <linearGradient id="skyE" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eff6ff"/>
                <stop offset="100%" stopColor="#f8faff"/>
            </linearGradient>
            <linearGradient id="b1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bfdbfe"/>
                <stop offset="100%" stopColor="#93c5fd"/>
            </linearGradient>
            <linearGradient id="b2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dbeafe"/>
                <stop offset="100%" stopColor="#bfdbfe"/>
            </linearGradient>
        </defs>
        <rect width="500" height="180" fill="url(#skyE)"/>

        {/* Building cluster right */}
        {/* Tall center tower */}
        <rect x="290" y="40" width="40" height="140" rx="2" fill="url(#b1)" opacity=".75"/>
        <rect x="296" y="46" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        <rect x="306" y="46" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        <rect x="316" y="46" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        <rect x="296" y="62" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        <rect x="306" y="62" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        <rect x="316" y="62" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        <rect x="296" y="78" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        <rect x="306" y="78" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        <rect x="316" y="78" width="6"  height="10"  rx="1" fill="#93c5fd" opacity=".6"/>
        {/* Antenna */}
        <rect x="308" y="28" width="4" height="14" rx="1" fill="#60a5fa"/>
        <circle cx="310" cy="27" r="3" fill="#3b82f6"/>

        {/* Mid building left of tower */}
        <rect x="250" y="70" width="34" height="110" rx="2" fill="url(#b2)" opacity=".7"/>
        <rect x="256" y="76" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".6"/>
        <rect x="265" y="76" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".6"/>
        <rect x="274" y="76" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".6"/>
        <rect x="256" y="90" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".6"/>
        <rect x="265" y="90" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".6"/>
        <rect x="274" y="90" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".6"/>

        {/* Right cluster */}
        <rect x="336" y="60" width="28" height="120" rx="2" fill="url(#b2)" opacity=".65"/>
        <rect x="342" y="66" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".55"/>
        <rect x="352" y="66" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".55"/>
        <rect x="342" y="80" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".55"/>
        <rect x="352" y="80" width="5" height="8" rx="1" fill="#bfdbfe" opacity=".55"/>

        <rect x="368" y="85" width="22" height="95" rx="2" fill="url(#b1)" opacity=".55"/>
        <rect x="394" y="95" width="18" height="85" rx="2" fill="url(#b2)" opacity=".5"/>
        <rect x="416" y="75" width="20" height="105" rx="2" fill="url(#b1)" opacity=".55"/>
        <rect x="440" y="100" width="16" height="80" rx="2" fill="url(#b2)" opacity=".45"/>
        <rect x="460" y="88" width="22" height="92" rx="2" fill="url(#b1)" opacity=".5"/>
        <rect x="485" y="110" width="15" height="70" rx="2" fill="url(#b2)" opacity=".4"/>

        {/* Ground line */}
        <rect x="0" y="176" width="500" height="4" rx="2" fill="#dbeafe" opacity=".7"/>

        {/* Abstract network dots — employer/business theme */}
        <circle cx="180" cy="60" r="3" fill="#3b82f6" opacity=".25"/>
        <circle cx="210" cy="40" r="2" fill="#3b82f6" opacity=".2"/>
        <circle cx="195" cy="75" r="2" fill="#6366f1" opacity=".2"/>
        <line x1="180" y1="60" x2="210" y2="40" stroke="#3b82f6" strokeWidth="1" opacity=".15"/>
        <line x1="180" y1="60" x2="195" y2="75" stroke="#6366f1" strokeWidth="1" opacity=".15"/>
        <line x1="210" y1="40" x2="195" y2="75" stroke="#3b82f6" strokeWidth="1" opacity=".12"/>

        {/* Tricolor swoosh bottom */}
        <path d="M0,170 Q125,160 250,165 Q375,170 500,158 L500,173 Q375,173 250,173 Q125,173 0,173Z" fill="#FF9933" opacity=".3"/>
        <path d="M0,173 Q125,163 250,168 Q375,173 500,161 L500,176 Q375,176 250,176 Q125,176 0,176Z" fill="#ffffff" opacity=".6"/>
        <path d="M0,175 Q125,165 250,170 Q375,175 500,163 L500,178 Q375,177 250,177 Q125,177 0,178Z" fill="#138808" opacity=".28"/>
    </svg>
);

/* ─────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const map = {
        Approved: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: <CheckCircle2 size={11}/> },
        Pending:  { cls: 'bg-amber-50   text-amber-700   border-amber-200',   dot: 'bg-amber-500',   icon: <Clock size={11}/> },
        Banned:   { cls: 'bg-red-50     text-red-700     border-red-200',     dot: 'bg-red-500',     icon: <Ban size={11}/> },
    };
    const s = map[status] || map.Approved;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${s.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.dot}`}/>
            {status || 'Approved'}
        </span>
    );
};

/* ─────────────────────────────────────────────────────────
   EMPLOYER AVATAR
───────────────────────────────────────────────────────── */
const EmployerAvatar = ({ emp }) => {
    const [imgErr, setImgErr] = useState(false);
    const initials = (emp.name || 'E').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600', 'from-emerald-500 to-teal-600',
                    'from-orange-400 to-amber-500', 'from-pink-500 to-rose-600', 'from-cyan-500 to-blue-500'];
    const grad = colors[(emp.name || '').charCodeAt(0) % colors.length];

    if (emp.image && !imgErr) {
        return (
            <img src={emp.image} alt={emp.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                onError={() => setImgErr(true)}/>
        );
    }
    return (
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center font-black text-white text-[13px] shadow-sm shrink-0`}>
            {initials}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────────────────────── */
const ConfirmModal = ({ open, type, empName, onConfirm, onCancel }) => {
    if (!open) return null;
    const cfg = {
        approve: { title: 'Approve Employer?',     msg: `Approve "${empName}"? They'll be able to post jobs on the platform.`, icon: <CheckCircle2 size={26} className="text-emerald-500"/>, btnCls: 'bg-emerald-500 hover:bg-emerald-600', btn: 'Yes, Approve', bg: 'bg-emerald-50' },
        ban:     { title: 'Ban Employer?',          msg: `Ban "${empName}"? They won't be able to post or manage jobs.`,         icon: <Ban size={26} className="text-amber-500"/>,             btnCls: 'bg-amber-500 hover:bg-amber-600',   btn: 'Yes, Ban',     bg: 'bg-amber-50'  },
        delete:  { title: 'Delete Employer?',       msg: `Permanently delete "${empName}" and all their jobs? This cannot be undone.`, icon: <Trash2 size={26} className="text-red-500"/>,         btnCls: 'bg-red-500 hover:bg-red-600',       btn: 'Yes, Delete',  bg: 'bg-red-50'    },
    };
    const c = cfg[type] || cfg.delete;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(8px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 border border-gray-100 sc">
                <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mx-auto mb-4`}>{c.icon}</div>
                <h3 className="text-[17px] font-black text-gray-900 text-center">{c.title}</h3>
                <p className="text-[12px] text-gray-500 text-center mt-2 font-medium leading-relaxed">{c.msg}</p>
                <div className="flex gap-3 mt-6">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all hover:opacity-90 active:scale-95 ${c.btnCls}`}>{c.btn}</button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────── */
const Toast = ({ msg }) => msg ? (
    <div className="fixed bottom-6 right-6 z-[200] bg-gray-950/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-[12px] font-bold flex items-center gap-2 border border-white/10 su">
        <span>{msg.slice(0, 2)}</span>{msg.slice(2)}
    </div>
) : null;

/* ─────────────────────────────────────────────────────────
   SORT ICON
───────────────────────────────────────────────────────── */
const SortIcon = ({ f, sf, sd }) =>
    sf !== f ? <ArrowUpDown size={11} className="text-gray-300 ml-1"/> :
    sd === 'asc' ? <SortAsc size={11} className="text-blue-500 ml-1"/> : <SortDesc size={11} className="text-blue-500 ml-1"/>;

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const EmployersManagement = () => {
    const [employers, setEmployers]         = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');
    const [search, setSearch]               = useState('');
    const [activeTab, setActiveTab]         = useState('All');
    const [sortField, setSortField]         = useState('name');
    const [sortDir, setSortDir]             = useState('asc');
    const [currentPage, setCurrentPage]     = useState(1);
    const [modal, setModal]                 = useState(null);   // { type, id, name }
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast]                 = useState('');
    const { user }                          = useContext(AuthContext);
    const PAGE = 8;

    /* ── Fetch ── */
    const fetchEmployers = async () => {
        try {
            setLoading(true); setError('');
            const { data } = await axios.get('/api/super-admin/employers', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEmployers(data.employers || []);
        } catch { setError('Failed to load employers. Please retry.'); }
        finally { setLoading(false); }
    };
    useEffect(() => { if (user) fetchEmployers(); }, [user]);

    /* ── Toast ── */
    const showToast = m => { setToast(m); setTimeout(() => setToast(''), 3200); };

    /* ── Update Status ── */
    const handleUpdateStatus = async (id, status) => {
        setActionLoading(id);
        try {
            await axios.put(`/api/super-admin/employers/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEmployers(prev => prev.map(e => e._id === id ? { ...e, status } : e));
            showToast(status === 'Approved' ? '✅ Employer approved!' : '🚫 Employer banned.');
        } catch (err) {
            showToast(`❌ ${err.response?.data?.message || 'Error updating status.'}`);
        } finally { setActionLoading(null); setModal(null); }
    };

    /* ── Delete ── */
    const handleDelete = async (id) => {
        setActionLoading(id);
        try {
            await axios.delete(`/api/super-admin/employers/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEmployers(prev => prev.filter(e => e._id !== id));
            showToast('🗑️ Employer deleted.');
        } catch (err) {
            showToast(`❌ ${err.response?.data?.message || 'Error deleting employer.'}`);
        } finally { setActionLoading(null); setModal(null); }
    };

    /* ── Stats ── */
    const totalCount    = employers.length;
    const approvedCount = employers.filter(e => e.status === 'Approved' || !e.status).length;
    const pendingCount  = employers.filter(e => e.status === 'Pending').length;
    const bannedCount   = employers.filter(e => e.status === 'Banned').length;
    const totalJobs     = employers.reduce((s, e) => s + (e.jobCount || 0), 0);

    /* ── Filtered & Sorted ── */
    const filtered = employers
        .filter(e => activeTab === 'All' || e.status === activeTab || (activeTab === 'Approved' && !e.status))
        .filter(e => {
            const q = search.toLowerCase();
            return !q
                || (e.name  || '').toLowerCase().includes(q)
                || (e.email || '').toLowerCase().includes(q);
        })
        .sort((a, b) => {
            let av = '', bv = '';
            if (sortField === 'name')     { av = a.name  || ''; bv = b.name  || ''; }
            if (sortField === 'email')    { av = a.email || ''; bv = b.email || ''; }
            if (sortField === 'status')   { av = a.status || ''; bv = b.status || ''; }
            if (sortField === 'jobCount') { return sortDir === 'asc' ? (a.jobCount||0) - (b.jobCount||0) : (b.jobCount||0) - (a.jobCount||0); }
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
    const safePage   = Math.min(currentPage, totalPages);
    const paginated  = filtered.slice((safePage - 1) * PAGE, safePage * PAGE);

    const toggleSort = f => {
        if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(f); setSortDir('asc'); }
        setCurrentPage(1);
    };

    /* ── Tabs ── */
    const tabs = [
        { key: 'All',      label: 'All',      count: totalCount,    dot: 'bg-blue-500'    },
        { key: 'Pending',  label: 'Pending',  count: pendingCount,  dot: 'bg-amber-500'   },
        { key: 'Approved', label: 'Approved', count: approvedCount, dot: 'bg-emerald-500' },
        { key: 'Banned',   label: 'Banned',   count: bannedCount,   dot: 'bg-red-500'     },
    ];
    const tabActiveClr = { All: 'bg-blue-600 text-white', Pending: 'bg-amber-500 text-white', Approved: 'bg-emerald-600 text-white', Banned: 'bg-red-500 text-white' };

    /* ── Loading ── */
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-indigo-500 animate-spin"/>
                <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-t-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '.75s' }}/>
            </div>
            <p className="text-gray-400 text-[13px] font-semibold tracking-wide animate-pulse">Loading employers…</p>
        </div>
    );

    return (
        <>
        <GlobalStyles/>

        <div className="space-y-5 pb-12">

            {/* ═══════════════════════════════════════════
                HERO BANNER — light theme
            ═══════════════════════════════════════════ */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white au" style={{ animationDelay: '0ms' }}>

                {/* Left tricolor accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
                    <div className="flex-1 bg-[#FF9933]"/>
                    <div className="flex-1 bg-gray-100"/>
                    <div className="flex-1 bg-[#138808]"/>
                </div>

                {/* Rotating chakra watermark */}
                <div className="absolute top-3 right-60 pointer-events-none chakra-bg" style={{ opacity: 0.05 }}>
                    <ChakraWatermark size={110}/>
                </div>

                <div className="pl-6 pr-4 md:pl-8 md:pr-0 py-6 flex items-stretch justify-between gap-4">

                    {/* LEFT — text */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-3 flex-wrap">
                            <Home size={11}/>
                            <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
                            <ChevronRight size={10}/>
                            <span className="text-blue-600 font-bold">Employer Management</span>
                        </nav>

                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                            Employer Management
                        </h1>
                        <p className="text-gray-500 text-[13px] font-medium mt-1.5 leading-relaxed max-w-md">
                            Review, approve, ban and manage companies registered on the platform.
                        </p>

                        {/* Tags row */}
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                <Building2 size={11}/> {totalCount} Companies
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                <Clock size={11}/> {pendingCount} Pending
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
                                <Briefcase size={11}/> {totalJobs} Jobs Listed
                            </span>
                        </div>
                    </div>

                    {/* RIGHT — cityscape illustration + emblem */}
                    <div className="hidden sm:flex items-stretch relative shrink-0" style={{ width: 'min(340px, 42%)' }}>
                        <div className="absolute inset-0">
                            <CityscapeSVG/>
                        </div>

                        {/* Emblem card */}
                        <div className="absolute top-3 right-3 flex flex-col items-center gap-1 bg-white/90 backdrop-blur border border-gray-200 rounded-2xl px-3 py-2.5 shadow-md">
                            <img
                                src="/ashoka_emblem.png"
                                alt="Ashoka Emblem"
                                className="w-10 h-10 object-contain"
                                onError={e => { e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/100px-Emblem_of_India.svg.png'; }}
                            />
                            <p className="text-[9px] font-black text-gray-700 tracking-wider text-center" style={{ fontFamily: 'serif' }}>
                                सत्यमेव जयते
                            </p>
                            <div className="flex gap-0.5">
                                <div className="w-3 h-0.5 bg-[#FF9933] rounded-l-full"/>
                                <div className="w-3 h-0.5 bg-gray-200"/>
                                <div className="w-3 h-0.5 bg-[#138808] rounded-r-full"/>
                            </div>
                        </div>

                        {/* Verified badge */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-sm">
                            <Shield size={11} className="text-blue-500"/>
                            <span className="text-[9px] font-extrabold text-gray-600 uppercase tracking-wider">Platform Verified</span>
                        </div>
                    </div>
                </div>

                {/* Bottom tricolor stripe */}
                <div className="flex h-[3px]">
                    <div className="flex-1 bg-[#FF9933]"/>
                    <div className="flex-1 bg-gray-100"/>
                    <div className="flex-1 bg-[#138808]"/>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                STAT CARDS
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total Employers',   value: totalCount,    sub: 'Registered on platform',  icon: <Building2 size={20}/>,   grad: 'from-blue-500 to-indigo-600',    ring: 'ring-blue-100',    delay: 80  },
                    { label: 'Pending Review',    value: pendingCount,  sub: 'Awaiting approval',       icon: <Clock size={20}/>,       grad: 'from-amber-400 to-orange-500',  ring: 'ring-amber-100',   delay: 150 },
                    { label: 'Approved',          value: approvedCount, sub: 'Active on platform',      icon: <CheckCircle2 size={20}/>,grad: 'from-emerald-500 to-green-600', ring: 'ring-emerald-100', delay: 220 },
                    { label: 'Total Jobs Listed', value: totalJobs,     sub: 'Across all employers',    icon: <Briefcase size={20}/>,   grad: 'from-violet-500 to-purple-600', ring: 'ring-violet-100',  delay: 290 },
                ].map((s, i) => (
                    <div key={i}
                        className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group cursor-default shimmer au"
                        style={{ animationDelay: `${s.delay}ms` }}>
                        <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow ring-4 ${s.ring} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                {s.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-[11px] font-extrabold text-gray-400 uppercase tracking-wider leading-tight truncate">{s.label}</p>
                                <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-none mt-1 tabular-nums">{s.value}</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-1 truncate hidden sm:block">{s.sub}</p>
                            </div>
                        </div>
                        <div className={`h-0.5 bg-gradient-to-r ${s.grad} opacity-60`}/>
                    </div>
                ))}
            </div>

            {/* ═══════════════════════════════════════════
                MAIN TABLE
            ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden au" style={{ animationDelay: '380ms' }}>

                {/* ── Toolbar ── */}
                <div className="px-5 sm:px-7 py-5 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                        {/* Left: title + tabs */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
                                    <Building2 size={18} className="text-white"/>
                                </div>
                                <div>
                                    <h2 className="text-[14px] sm:text-[15px] font-black text-gray-900">All Employers</h2>
                                    <p className="text-[11px] text-gray-400 font-medium">Manage companies registered on the SkillSet India platform.</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {tabs.map(tab => {
                                    const isA = activeTab === tab.key;
                                    return (
                                        <button key={tab.key}
                                            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all duration-200 ${isA ? tabActiveClr[tab.key] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            {isA && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`}/>}
                                            {tab.label}
                                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold ${isA ? 'bg-white/25 text-white' : 'bg-white text-gray-500'}`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: search + controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 w-full lg:w-64 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                                <Search size={13} className="text-gray-400 shrink-0"/>
                                <input type="text" placeholder="Search by company name or email..."
                                    value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                    className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-gray-400 font-medium min-w-0"/>
                                {search && (
                                    <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                                        <XCircle size={13}/>
                                    </button>
                                )}
                            </div>
                            <button onClick={() => toggleSort('name')}
                                className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">
                                <ArrowUpDown size={13}/>
                                <span className="hidden sm:inline">Sort: {sortDir === 'asc' ? 'A→Z' : 'Z→A'}</span>
                            </button>
                            <button className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                                <MoreHorizontal size={14}/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[560px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                                {[
                                    { l: 'Company Details', f: 'name'     },
                                    { l: 'Status',          f: 'status'   },
                                    { l: 'Jobs Posted',     f: 'jobCount' },
                                    { l: 'Actions', f: null, r: true      },
                                ].map((col, i) => (
                                    <th key={i} className={`px-4 sm:px-6 py-4 ${col.r ? 'text-right' : ''}`}>
                                        {col.f ? (
                                            <button onClick={() => toggleSort(col.f)} className="flex items-center hover:text-gray-700 transition-colors">
                                                {col.l}<SortIcon f={col.f} sf={sortField} sd={sortDir}/>
                                            </button>
                                        ) : col.l}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={4} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                            <Building2 size={26} className="text-gray-300"/>
                                        </div>
                                        <p className="font-bold text-gray-500 text-[13px]">
                                            {search ? `No results for "${search}"` : `No ${activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}employers found.`}
                                        </p>
                                        {search && <button onClick={() => setSearch('')} className="text-blue-600 text-[12px] font-bold hover:underline">Clear search</button>}
                                    </div>
                                </td></tr>
                            ) : paginated.map((emp, idx) => (
                                <tr key={emp._id}
                                    className="emp-row group transition-all duration-150 au"
                                    style={{ animationDelay: `${idx * 35}ms` }}>

                                    {/* Company Details */}
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative group-hover:scale-105 transition-transform duration-300">
                                                <EmployerAvatar emp={emp}/>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-extrabold text-gray-900 text-[13px] truncate group-hover:text-blue-600 transition-colors">
                                                    {emp.name || '—'}
                                                </p>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                                    <Mail size={10}/>{emp.email || '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <StatusBadge status={emp.status}/>
                                    </td>

                                    {/* Jobs */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <Briefcase size={13} className="text-blue-500"/>
                                            </div>
                                            <span className="font-extrabold text-gray-900 text-[13px] tabular-nums">{emp.jobCount || 0}</span>
                                            <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">jobs</span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* View */}
                                            <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" title="View">
                                                <Eye size={14}/>
                                            </button>

                                            {/* Approve (shown for Pending or Banned) */}
                                            {(emp.status === 'Pending' || emp.status === 'Banned') && (
                                                <button
                                                    onClick={() => setModal({ type: 'approve', id: emp._id, name: emp.name })}
                                                    disabled={actionLoading === emp._id}
                                                    className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-60 whitespace-nowrap">
                                                    {actionLoading === emp._id ? <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/> : <CheckCircle2 size={12}/>}
                                                    Approve
                                                </button>
                                            )}

                                            {/* Ban (shown for Approved or Pending) */}
                                            {(emp.status === 'Approved' || !emp.status || emp.status === 'Pending') && (
                                                <button
                                                    onClick={() => setModal({ type: 'ban', id: emp._id, name: emp.name })}
                                                    disabled={actionLoading === emp._id}
                                                    className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-60 whitespace-nowrap">
                                                    <Ban size={12}/> Ban
                                                </button>
                                            )}

                                            {/* Delete */}
                                            <button
                                                onClick={() => setModal({ type: 'delete', id: emp._id, name: emp.name })}
                                                disabled={actionLoading === emp._id}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-60" title="Delete">
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <div className="px-5 sm:px-7 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-[12px] text-gray-400 font-medium">
                        Showing{' '}
                        <span className="font-extrabold text-gray-700">
                            {filtered.length === 0 ? 0 : (safePage - 1) * PAGE + 1}–{Math.min(safePage * PAGE, filtered.length)}
                        </span>{' '}
                        of <span className="font-extrabold text-gray-700">{filtered.length}</span> employer{filtered.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={14}/>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                            <button key={pg} onClick={() => setCurrentPage(pg)}
                                className={`w-8 h-8 rounded-xl text-[12px] font-extrabold transition-all duration-200 ${pg === safePage ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                {pg}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl au">
                    <AlertCircle size={17} className="shrink-0"/>
                    <span className="font-medium text-[13px] flex-1">{error}</span>
                    <button onClick={fetchEmployers} className="flex items-center gap-1 text-red-600 font-bold text-[12px] hover:underline shrink-0">
                        <RefreshCw size={12}/> Retry
                    </button>
                </div>
            )}
        </div>

        {/* Confirm Modal */}
        <ConfirmModal
            open={!!modal}
            type={modal?.type}
            empName={modal?.name}
            onConfirm={() => {
                if (modal?.type === 'approve') handleUpdateStatus(modal.id, 'Approved');
                else if (modal?.type === 'ban') handleUpdateStatus(modal.id, 'Banned');
                else handleDelete(modal.id);
            }}
            onCancel={() => setModal(null)}
        />
        <Toast msg={toast}/>
        </>
    );
};

export default EmployersManagement;
