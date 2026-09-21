import { useState, useEffect, useContext, Fragment } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Building2, Check, X, Loader2, AlertCircle, Search, Filter,
    ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2,
    XCircle, Clock, ArrowUpDown, SortAsc, SortDesc, Eye,
    Mail, MapPin, Award, RefreshCw, Shield, Home, Phone, Star
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   INDIA FLAG SVG
───────────────────────────────────────────────────────── */
const IndiaFlag = ({ className = 'w-10 h-[26px]' }) => (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="900" height="200" y="0"   fill="#FF9933"/>
        <rect width="900" height="200" y="200" fill="#FFFFFF"/>
        <rect width="900" height="200" y="400" fill="#138808"/>
        <circle cx="450" cy="300" r="90" fill="none" stroke="#000080" strokeWidth="8"/>
        <circle cx="450" cy="300" r="12"  fill="#000080"/>
        {Array.from({length:24},(_,i)=>{
            const a=(i*15*Math.PI)/180;
            return <line key={i}
                x1={450+12*Math.cos(a)} y1={300+12*Math.sin(a)}
                x2={450+90*Math.cos(a)} y2={300+90*Math.sin(a)}
                stroke="#000080" strokeWidth="3.5"/>;
        })}
    </svg>
);

/* ─────────────────────────────────────────────────────────
   ASHOKA CHAKRA – decorative (light version)
───────────────────────────────────────────────────────── */
const Chakra = ({ size=80, color='#000080', opacity=0.08 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{opacity}}>
        <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="3.5"/>
        <circle cx="50" cy="50" r="7"  fill={color}/>
        {Array.from({length:24},(_,i)=>{
            const a=(i*15*Math.PI)/180;
            return <line key={i}
                x1={50+7*Math.cos(a)} y1={50+7*Math.sin(a)}
                x2={50+46*Math.cos(a)} y2={50+46*Math.sin(a)}
                stroke={color} strokeWidth="1.8"/>;
        })}
    </svg>
);

/* ─────────────────────────────────────────────────────────
   INDIA GATE – inline light SVG illustration
───────────────────────────────────────────────────────── */
const IndiaGateSVG = () => (
    <svg viewBox="0 0 520 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMax meet">
        <defs>
            <linearGradient id="skyL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8f4fd"/>
                <stop offset="100%" stopColor="#f8fbff"/>
            </linearGradient>
            <linearGradient id="gateL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8d5a3"/>
                <stop offset="100%" stopColor="#c9a96e"/>
            </linearGradient>
        </defs>
        {/* sky */}
        <rect width="520" height="200" fill="url(#skyL)"/>
        {/* distant buildings left */}
        <rect x="30"  y="115" width="14" height="65" fill="#d4c9b0" opacity=".45"/>
        <rect x="48"  y="105" width="10" height="75" fill="#ccc0a0" opacity=".38"/>
        <rect x="14"  y="125" width="9"  height="55" fill="#d4c9b0" opacity=".32"/>
        {/* distant buildings right */}
        <rect x="465" y="118" width="14" height="62" fill="#d4c9b0" opacity=".45"/>
        <rect x="485" y="108" width="10" height="72" fill="#ccc0a0" opacity=".38"/>
        <rect x="500" y="128" width="9"  height="52" fill="#d4c9b0" opacity=".32"/>
        {/* India Gate body */}
        <rect x="200" y="70"  width="120" height="118" fill="url(#gateL)" rx="2"/>
        {/* arch opening */}
        <ellipse cx="260" cy="140" rx="32" ry="38" fill="url(#skyL)"/>
        <rect    x="228" y="140" width="64"  height="48" fill="url(#skyL)"/>
        {/* top layers */}
        <rect x="188" y="57"  width="144" height="16" rx="2" fill="#dfc47a"/>
        <rect x="182" y="44"  width="156" height="15" rx="2" fill="#d4b45e"/>
        <rect x="176" y="33"  width="168" height="13" rx="2" fill="#c9a03c"/>
        {/* columns */}
        <rect x="200" y="65"  width="16"  height="123" fill="#d4b45e"/>
        <rect x="304" y="65"  width="16"  height="123" fill="#d4b45e"/>
        {/* inscription bar */}
        <rect x="212" y="46"  width="96"  height="9"   rx="2" fill="#b8922c" opacity=".5"/>
        {/* base plinth */}
        <rect x="170" y="182" width="180" height="10"  rx="2" fill="#c9a03c"/>
        <rect x="158" y="190" width="204" height="8"   rx="2" fill="#b8922c"/>
        {/* ground */}
        <rect x="0" y="196" width="520" height="4" fill="#e0d5b8" opacity=".6"/>
        {/* birds */}
        <path d="M80,35 Q84,31 88,35 Q92,31 96,35"  fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity=".5"/>
        <path d="M420,28 Q424,24 428,28 Q432,24 436,28" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity=".5"/>
        <path d="M460,45 Q463,42 466,45 Q469,42 472,45" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity=".4"/>
        {/* tricolor swoosh bottom */}
        <path d="M0,190 Q130,180 260,185 Q390,190 520,178 L520,193 Q390,193 260,193 Q130,193 0,193Z" fill="#FF9933" opacity=".35"/>
        <path d="M0,193 Q130,183 260,188 Q390,193 520,181 L520,196 Q390,196 260,196 Q130,196 0,196Z" fill="#ffffff" opacity=".7"/>
        <path d="M0,195 Q130,185 260,190 Q390,195 520,183 L520,198 Q390,197 260,197 Q130,197 0,198Z" fill="#138808" opacity=".35"/>
    </svg>
);

/* ─────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────── */
const StatusBadge = ({ approved }) =>
    approved
        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Active
          </span>
        : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/> Pending
          </span>;

/* ─────────────────────────────────────────────────────────
   TYPE BADGE
───────────────────────────────────────────────────────── */
const TypeBadge = ({ type }) => {
    const m = { Government:'bg-blue-50 text-blue-700 border-blue-200', Private:'bg-violet-50 text-violet-700 border-violet-200', NGO:'bg-teal-50 text-teal-700 border-teal-200' };
    return <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${m[type]||'bg-gray-50 text-gray-500 border-gray-200'}`}>{type||'—'}</span>;
};

/* ─────────────────────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────────────────────── */
const ConfirmModal = ({ open, danger, title, message, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{background:'rgba(15,23,42,.45)',backdropFilter:'blur(8px)'}}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 border border-gray-100"
                style={{animation:'scaleIn .28s cubic-bezier(.22,1,.36,1) both'}}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger?'bg-red-50':'bg-emerald-50'}`}>
                    {danger ? <XCircle size={26} className="text-red-500"/> : <CheckCircle2 size={26} className="text-emerald-500"/>}
                </div>
                <h3 className="text-[17px] font-black text-gray-900 text-center">{title}</h3>
                <p className="text-[12px] text-gray-500 text-center mt-2 font-medium leading-relaxed">{message}</p>
                <div className="flex gap-3 mt-6">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all hover:opacity-90 active:scale-95 ${danger?'bg-red-500':'bg-emerald-500'}`}>
                        {danger?'Yes, Reject':'Yes, Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────── */
const Toast = ({ msg }) => msg ? (
    <div className="fixed bottom-6 right-6 z-[200] bg-gray-950/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-[12px] font-bold flex items-center gap-2 border border-white/10"
        style={{animation:'slideUp .35s cubic-bezier(.22,1,.36,1) both'}}>
        <span>{msg.slice(0,2)}</span>{msg.slice(2)}
    </div>
) : null;

/* ─────────────────────────────────────────────────────────
   SORT ICON
───────────────────────────────────────────────────────── */
const SortIcon = ({ f, sf, sd }) =>
    sf!==f ? <ArrowUpDown size={11} className="text-gray-300 ml-1"/>
           : sd==='asc' ? <SortAsc size={11} className="text-blue-500 ml-1"/> : <SortDesc size={11} className="text-blue-500 ml-1"/>;

/* ─────────────────────────────────────────────────────────
   EXPANDED DETAILS UI
───────────────────────────────────────────────────────── */
const ExpandedDetails = ({ inst }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white/60 backdrop-blur-sm rounded-2xl shadow-inner border border-gray-100 mt-2 mb-3 mx-2" style={{animation: 'slideUp 0.3s ease-out'}}>
        <div className="flex gap-4">
            <div className="w-24 h-24 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative group">
                {inst.image ? (
                    <img src={inst.image} alt={inst.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <Building2 size={36} className="text-gray-300" />
                    </div>
                )}
            </div>
            <div className="flex flex-col py-1">
                <h4 className="text-[15px] font-black text-gray-900 leading-tight">{inst.name}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                    <TypeBadge type={inst.type}/>
                    {inst.accreditation && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100"><Award size={10} className="inline mr-1"/>{inst.accreditation}</span>}
                </div>
                <p className="text-[12px] text-gray-500 font-medium mt-2.5 leading-relaxed line-clamp-3">
                    {inst.description || 'No detailed description has been provided by this institute yet.'}
                </p>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-5 py-2">
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5"><Shield size={10}/> Contact Information</p>
                <div className="space-y-2">
                    <p className="text-[12px] font-medium text-gray-700 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm"><Mail size={13} className="text-blue-500 shrink-0"/> <span className="truncate">{inst.email || '—'}</span></p>
                    <p className="text-[12px] font-medium text-gray-700 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm"><Phone size={13} className="text-emerald-500 shrink-0"/> <span>{inst.phone || 'Not provided'}</span></p>
                </div>
            </div>
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5"><MapPin size={10}/> Location Details</p>
                <div className="bg-white px-3 py-2.5 rounded-lg border border-gray-100 shadow-sm h-[72px] flex items-start gap-2">
                    <MapPin size={14} className="text-red-500 shrink-0 mt-0.5"/>
                    <div>
                        <p className="text-[11px] font-bold text-gray-800">{inst.districtId?.name || 'Unknown District'}</p>
                        <p className="text-[11px] font-medium text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{inst.address || 'Specific address not provided'}</p>
                    </div>
                </div>
            </div>
        </div>

        {inst.isApproved && (
            <div className="md:col-span-2 flex items-center gap-8 pt-4 border-t border-gray-100/60">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Quality Score</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < Math.round(inst.qualityScore || 0) ? "currentColor" : "transparent"} stroke={i < Math.round(inst.qualityScore || 0) ? "currentColor" : "#cbd5e1"} />
                            ))}
                        </div>
                        <p className="text-[14px] font-black text-gray-900">{inst.qualityScore || '0'}<span className="text-[11px] text-gray-400 font-medium">/5</span></p>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Ratings</p>
                    <p className="text-[14px] font-black text-gray-900">{inst.totalRatings || 0} <span className="text-[11px] font-medium text-gray-400 text-normal">reviews</span></p>
                </div>
                <div className="ml-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 text-right">Registration Date</p>
                    <p className="text-[12px] font-bold text-gray-700">{new Date(inst.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
            </div>
        )}
    </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const InstituteManagement = () => {
    const [institutes, setInstitutes]       = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');
    const [search, setSearch]               = useState('');
    const [sortField, setSortField]         = useState('name');
    const [sortDir, setSortDir]             = useState('asc');
    const [currentPage, setCurrentPage]     = useState(1);
    const [activeTab, setActiveTab]         = useState('all');
    const [modal, setModal]                 = useState(null);
    const [expandedId, setExpandedId]       = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast]                 = useState('');
    const { user }                          = useContext(AuthContext);
    const PAGE = 8;

    const fetchInstitutes = async () => {
        try { setLoading(true); setError('');
            const { data } = await axios.get('/api/super-admin/institutes',{headers:{Authorization:`Bearer ${user.token}`}});
            if (data.success) setInstitutes(data.institutes);
        } catch { setError('Failed to load institutes.'); } finally { setLoading(false); }
    };
    useEffect(()=>{ if(user) fetchInstitutes(); },[user]);

    const showToast = m => { setToast(m); setTimeout(()=>setToast(''),3200); };

    const handleApprove = async id => {
        setActionLoading(id);
        try {
            const {data} = await axios.put(`/api/super-admin/institutes/${id}/approve`,{},{headers:{Authorization:`Bearer ${user.token}`}});
            if(data.success){ setInstitutes(p=>p.map(i=>i._id===id?{...i,isApproved:true}:i)); showToast('✅ Institute approved!'); }
        } catch { showToast('❌ Error approving.'); } finally { setActionLoading(null); setModal(null); }
    };

    const handleReject = async id => {
        setActionLoading(id);
        try {
            const {data} = await axios.delete(`/api/super-admin/institutes/${id}/reject`,{headers:{Authorization:`Bearer ${user.token}`}});
            if(data.success){ setInstitutes(p=>p.filter(i=>i._id!==id)); showToast('🗑️ Institute removed.'); }
        } catch { showToast('❌ Error removing.'); } finally { setActionLoading(null); setModal(null); }
    };

    const pending   = institutes.filter(i=>!i.isApproved);
    const approved  = institutes.filter(i=> i.isApproved);
    const tabData   = { all:institutes, pending, approved, suspended:[] };

    const filtered = (tabData[activeTab]||[])
        .filter(i=>{ const q=search.toLowerCase();
            return !q||(i.name||'').toLowerCase().includes(q)||(i.email||'').toLowerCase().includes(q)
                    ||(i.type||'').toLowerCase().includes(q)||(i.districtId?.name||'').toLowerCase().includes(q); })
        .sort((a,b)=>{
            const get=x=>sortField==='district'?x.districtId?.name||'':x[sortField]||'';
            return sortDir==='asc'?get(a).localeCompare(get(b)):get(b).localeCompare(get(a));
        });

    const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE));
    const safePage   = Math.min(currentPage,totalPages);
    const paginated  = filtered.slice((safePage-1)*PAGE, safePage*PAGE);

    const toggleSort = f => { if(sortField===f) setSortDir(d=>d==='asc'?'desc':'asc'); else{setSortField(f);setSortDir('asc');} setCurrentPage(1); };

    const tabs=[
        {key:'all',       label:'All',       count:institutes.length, clr:'blue'},
        {key:'pending',   label:'Pending',   count:pending.length,    clr:'amber'},
        {key:'approved',  label:'Approved',  count:approved.length,   clr:'emerald'},
        {key:'suspended', label:'Suspended', count:0,                 clr:'red'},
    ];
    const tabActive = { blue:'bg-blue-600 text-white', amber:'bg-amber-500 text-white', emerald:'bg-emerald-600 text-white', red:'bg-red-500 text-white' };

    /* ── Loading ── */
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#FF9933] border-r-[#138808] animate-spin"/>
                <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-t-[#000080] animate-spin" style={{animationDirection:'reverse',animationDuration:'.7s'}}/>
            </div>
            <p className="text-gray-400 text-[13px] font-semibold tracking-wide animate-pulse">Loading institutes…</p>
        </div>
    );

    return (
        <>
        {/* ── Global Animations ── */}
        <style>{`
            @keyframes fadeUp  {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
            @keyframes scaleIn {from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
            @keyframes slideUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
            @keyframes flagWave{0%,100%{transform:perspective(300px) rotateY(0deg)}50%{transform:perspective(300px) rotateY(-6deg)}}
            @keyframes shimmer {0%{background-position:-200% 0}100%{background-position:200% 0}}
            @keyframes chakraSpin{to{transform:rotate(360deg)}}
            .au {animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both}
            .flag-wave{animation:flagWave 3s ease-in-out infinite}
            .chakra-spin{animation:chakraSpin 18s linear infinite}
            .shimmer-on:hover::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);background-size:200% 100%;animation:shimmer 1.2s ease;border-radius:inherit}
            tr.inst-row:hover td{background:rgba(248,250,252,.8);}
        `}</style>

        <div className="space-y-5 pb-12">

            {/* ═══════════════════════════════════════════
                HERO BANNER — light theme
            ═══════════════════════════════════════════ */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm au bg-white" style={{animationDelay:'0ms'}}>

                {/* Tricolor left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
                    <div className="flex-1 bg-[#FF9933]"/>
                    <div className="flex-1 bg-white border-y border-gray-100"/>
                    <div className="flex-1 bg-[#138808]"/>
                </div>

                {/* Rotating Chakra watermark — top right */}
                <div className="absolute top-2 right-2 md:right-56 pointer-events-none chakra-spin" style={{opacity:0.06}}>
                    <Chakra size={110} color="#000080" opacity={1}/>
                </div>

                <div className="pl-6 pr-4 md:pl-8 md:pr-0 py-6 flex items-stretch justify-between gap-4">

                    {/* LEFT — text content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-3 flex-wrap">
                            <Home size={11}/>
                            <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
                            <ChevronRight size={10}/>
                            <span className="text-blue-600 font-bold">Institute Management</span>
                        </nav>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                            Institute Management
                        </h1>
                        <p className="text-gray-500 text-[13px] font-medium mt-1.5 leading-relaxed max-w-md">
                            Review and approve Training Institutes joining the platform.
                        </p>

                        {/* Flag + tagline row */}
                        <div className="flex items-center gap-3 mt-4">
                            <div className="flag-wave rounded-[3px] overflow-hidden shadow border border-gray-200 shrink-0">
                                <IndiaFlag className="w-10 h-[26px]"/>
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-gray-800">
                                    Empowering Skills for{' '}
                                    <span className="text-[#FF9933]">Viksit Bharat</span>
                                </p>
                                <p className="text-[10px] text-gray-400 font-semibold tracking-widest mt-0.5">
                                    भारत कौशल विकास मिशन
                                </p>
                            </div>
                        </div>

                        {/* Mini pills */}
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                {institutes.length} Total
                            </span>
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                {pending.length} Pending
                            </span>
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {approved.length} Active
                            </span>
                        </div>
                    </div>

                    {/* RIGHT — India Gate illustration + Emblem */}
                    <div className="hidden sm:flex items-stretch relative shrink-0" style={{width: 'min(340px, 42%)'}}>
                        {/* India Gate SVG illustration */}
                        <div className="absolute inset-0">
                            <IndiaGateSVG/>
                        </div>

                        {/* Ashoka Emblem card — top-right of banner */}
                        <div className="absolute top-3 right-3 flex flex-col items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl px-3 py-2.5 shadow-md">
                            <img
                                src="/ashoka_emblem.png"
                                alt="Ashoka Emblem"
                                className="w-10 h-10 object-contain"
                                onError={e=>{
                                    e.target.src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/100px-Emblem_of_India.svg.png';
                                }}
                            />
                            <p className="text-[9px] font-black text-gray-700 tracking-wider text-center leading-tight" style={{fontFamily:'serif'}}>
                                सत्यमेव जयते
                            </p>
                            <div className="flex gap-0.5">
                                <div className="w-3 h-0.5 bg-[#FF9933] rounded-l-full"/>
                                <div className="w-3 h-0.5 bg-gray-200"/>
                                <div className="w-3 h-0.5 bg-[#138808] rounded-r-full"/>
                            </div>
                        </div>

                        {/* Govt verified badge — bottom-right */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-sm">
                            <Shield size={11} className="text-[#FF9933]"/>
                            <span className="text-[9px] font-extrabold text-gray-600 uppercase tracking-wider">Govt. Verified</span>
                        </div>
                    </div>
                </div>

                {/* Tricolor bottom stripe */}
                <div className="flex h-[3px]">
                    <div className="flex-1 bg-[#FF9933]"/>
                    <div className="flex-1 bg-gray-100"/>
                    <div className="flex-1 bg-[#138808]"/>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                STAT CARDS — 4 columns, responsive
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label:'Total Institutes',    value:institutes.length, sub:'Registered on platform', icon:<Building2 size={20}/>, grad:'from-blue-500 to-indigo-600',    ring:'ring-blue-100',   bg:'bg-blue-50',    delay:80  },
                    { label:'Pending Approvals',   value:pending.length,    sub:'Awaiting your review',  icon:<Clock size={20}/>,     grad:'from-amber-400 to-orange-500',  ring:'ring-amber-100',  bg:'bg-amber-50',   delay:150 },
                    { label:'Active Institutes',   value:approved.length,   sub:'Currently onboarded',   icon:<CheckCircle2 size={20}/>, grad:'from-emerald-500 to-green-600', ring:'ring-emerald-100',bg:'bg-emerald-50', delay:220 },
                    { label:'Suspended / Removed', value:0,                 sub:'Not active on platform',icon:<XCircle size={20}/>,   grad:'from-red-400 to-rose-500',      ring:'ring-red-100',    bg:'bg-red-50',     delay:290 },
                ].map((s,i)=>(
                    <div key={i}
                        className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group cursor-default shimmer-on au"
                        style={{animationDelay:`${s.delay}ms`}}>
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
                PENDING APPROVALS
            ═══════════════════════════════════════════ */}
            <div className="rounded-2xl overflow-hidden border border-amber-200 shadow-sm bg-amber-50/40 au" style={{animationDelay:'350ms'}}>
                {/* Header */}
                <div className="px-5 sm:px-7 py-4 border-b border-amber-100 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                            <Clock size={19} className="text-white"/>
                            {pending.length>0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white animate-bounce">
                                    {pending.length}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-[14px] sm:text-[15px] font-black text-amber-900">
                                Pending Approvals
                                <span className="ml-2 bg-amber-200 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{pending.length}</span>
                            </h2>
                            <p className="text-[11px] text-amber-700/70 font-medium">Institutes waiting for your review</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-1.5 shadow-sm">
                        <IndiaFlag className="w-8 h-5"/>
                        <span className="text-[10px] font-extrabold text-amber-700 tracking-wider uppercase">Awaiting Review</span>
                    </div>
                </div>

                {/* Empty state */}
                {pending.length===0 ? (
                    <div className="py-12 flex flex-col items-center gap-3 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 size={28} className="text-emerald-500"/>
                        </div>
                        <div>
                            <p className="font-black text-gray-700 text-[14px]">All caught up!</p>
                            <p className="text-[12px] text-gray-400 font-medium mt-0.5">New institute applications will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-amber-100 text-[10px] font-extrabold text-amber-700 uppercase tracking-wider bg-amber-50/70">
                                    <th className="px-5 sm:px-7 py-3">Institute Name</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">District</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Accreditation</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100/60">
                                {pending.map((inst,idx)=>(
                                    <Fragment key={inst._id}>
                                    <tr onClick={() => setExpandedId(expandedId === inst._id ? null : inst._id)} className="hover:bg-amber-50 transition-colors duration-150 au cursor-pointer" style={{animationDelay:`${idx*50}ms`}}>
                                        <td className="px-5 sm:px-7 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-white text-[13px] shadow-sm shrink-0">
                                                    {(inst.name||'I')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-[13px] leading-tight group-hover:text-amber-700">{inst.name||'—'}</p>
                                                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={9}/>{inst.email||'—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5"><TypeBadge type={inst.type}/></td>
                                        <td className="px-4 py-3.5 text-[12px] text-gray-600 font-medium">
                                            <span className="flex items-center gap-1"><MapPin size={11} className="text-amber-400 shrink-0"/>{inst.districtId?.name||'Unknown'}</span>
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell">
                                            {inst.accreditation
                                                ? <span className="text-[12px] font-bold text-blue-600 flex items-center gap-1"><Award size={12} className="text-amber-400"/>{inst.accreditation}</span>
                                                : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={()=>setModal({type:'approve',id:inst._id,name:inst.name})}
                                                    disabled={actionLoading===inst._id}
                                                    className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-60">
                                                    {actionLoading===inst._id?<Loader2 size={12} className="animate-spin"/>:<Check size={12}/>} Approve
                                                </button>
                                                <button
                                                    onClick={()=>setModal({type:'reject',id:inst._id,name:inst.name})}
                                                    disabled={actionLoading===inst._id}
                                                    className="inline-flex items-center gap-1.5 bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-60">
                                                    <X size={12}/> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === inst._id && (
                                        <tr className="bg-amber-50/50">
                                            <td colSpan="5" className="p-0 border-b border-amber-100">
                                                <ExpandedDetails inst={inst} />
                                            </td>
                                        </tr>
                                    )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════
                APPROVED INSTITUTES TABLE
            ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden au" style={{animationDelay:'430ms'}}>

                {/* Toolbar */}
                <div className="px-5 sm:px-7 py-5 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Title + tabs */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
                                    <Building2 size={18} className="text-white"/>
                                </div>
                                <div>
                                    <h2 className="text-[14px] sm:text-[15px] font-black text-gray-900">Approved Institutes</h2>
                                    <p className="text-[11px] text-gray-400 font-medium">List of institutes approved and active on the platform.</p>
                                </div>
                            </div>
                            {/* Tab row */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {tabs.map(tab=>{
                                    const isA = activeTab===tab.key;
                                    return (
                                        <button key={tab.key}
                                            onClick={()=>{setActiveTab(tab.key);setCurrentPage(1);}}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all duration-200 ${isA?tabActive[tab.clr]:'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            {tab.label}
                                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold ${isA?'bg-white/25 text-white':'bg-white text-gray-500'}`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Search + controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Search bar */}
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 w-full lg:w-64 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                                <Search size={13} className="text-gray-400 shrink-0"/>
                                <input type="text" placeholder="Search by name, email or district..."
                                    value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}}
                                    className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-gray-400 font-medium min-w-0"/>
                                {search && <button onClick={()=>setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"><X size={12}/></button>}
                            </div>
                            <button className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">
                                <Filter size={13}/><span className="hidden sm:inline">Filter</span>
                            </button>
                            <button onClick={()=>toggleSort('name')}
                                className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap">
                                <ArrowUpDown size={13}/><span className="hidden sm:inline">Sort: {sortDir==='asc'?'Newest':'Oldest'}</span>
                            </button>
                            <button className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                                <MoreHorizontal size={14}/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[560px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                                {[{l:'Institute Name',f:'name'},{l:'Type',f:'type'},{l:'District',f:'district'},{l:'Contact Email',f:'email'},{l:'Status',f:null},{l:'Actions',f:null,r:true}].map((col,i)=>(
                                    <th key={i} className={`px-4 sm:px-6 py-4 ${col.r?'text-right':''}`}>
                                        {col.f
                                            ? <button onClick={()=>toggleSort(col.f)} className="flex items-center hover:text-gray-700 transition-colors">
                                                {col.l}<SortIcon f={col.f} sf={sortField} sd={sortDir}/>
                                              </button>
                                            : col.l}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginated.length===0 ? (
                                <tr><td colSpan={6} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                            <Building2 size={26} className="text-gray-300"/>
                                        </div>
                                        <p className="font-bold text-gray-500 text-[13px]">{search?`No results for "${search}"`:'No institutes found.'}</p>
                                        {search && <button onClick={()=>setSearch('')} className="text-blue-600 text-[12px] font-bold hover:underline">Clear search</button>}
                                    </div>
                                </td></tr>
                            ) : paginated.map((inst,idx)=>(
                                <Fragment key={inst._id}>
                                <tr onClick={() => setExpandedId(expandedId === inst._id ? null : inst._id)} className="inst-row group cursor-pointer transition-all duration-150 au" style={{animationDelay:`${idx*35}ms`}}>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-white text-[13px] shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                {(inst.name||'I')[0].toUpperCase()}
                                                {inst.isApproved && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                                        <Check size={7} className="text-white" strokeWidth={3}/>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 text-[13px] truncate group-hover:text-blue-600 transition-colors">{inst.name||'—'}</p>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate"><Mail size={9}/>{inst.email||'—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4"><TypeBadge type={inst.type}/></td>
                                    <td className="px-4 py-4 text-[12px] text-gray-600 font-medium">
                                        <span className="flex items-center gap-1"><MapPin size={11} className="text-blue-400 shrink-0"/>{inst.districtId?.name||'Unknown'}</span>
                                    </td>
                                    <td className="px-4 py-4 text-[12px] text-gray-500">{inst.email||'—'}</td>
                                    <td className="px-4 py-4"><StatusBadge approved={inst.isApproved}/></td>
                                    <td className="px-4 sm:px-6 py-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button onClick={() => setExpandedId(expandedId === inst._id ? null : inst._id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title={expandedId === inst._id ? "Close Details" : "View Details"}><Eye size={14}/></button>
                                            {!inst.isApproved && (
                                                <button onClick={()=>setModal({type:'approve',id:inst._id,name:inst.name})}
                                                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors" title="Approve"><Check size={14}/></button>
                                            )}
                                            <button onClick={()=>setModal({type:'reject',id:inst._id,name:inst.name})}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove"><X size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === inst._id && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan="6" className="p-0 border-b border-gray-100">
                                            <ExpandedDetails inst={inst} />
                                        </td>
                                    </tr>
                                )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-5 sm:px-7 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-[12px] text-gray-400 font-medium">
                        Showing{' '}
                        <span className="font-extrabold text-gray-700">
                            {filtered.length===0?0:(safePage-1)*PAGE+1}–{Math.min(safePage*PAGE,filtered.length)}
                        </span>{' '}
                        of <span className="font-extrabold text-gray-700">{filtered.length}</span> institute{filtered.length!==1?'s':''}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={safePage===1}
                            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={14}/>
                        </button>
                        {Array.from({length:totalPages},(_,i)=>i+1).map(pg=>(
                            <button key={pg} onClick={()=>setCurrentPage(pg)}
                                className={`w-8 h-8 rounded-xl text-[12px] font-extrabold transition-all duration-200 ${pg===safePage?'bg-blue-600 text-white shadow-sm':'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                {pg}
                            </button>
                        ))}
                        <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages}
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
                    <button onClick={fetchInstitutes} className="flex items-center gap-1 text-red-600 font-bold text-[12px] hover:underline shrink-0">
                        <RefreshCw size={12}/> Retry
                    </button>
                </div>
            )}
        </div>

        <ConfirmModal
            open={!!modal} danger={modal?.type==='reject'}
            title={modal?.type==='approve'?'Approve Institute?':'Reject & Remove?'}
            message={modal?.type==='approve'
                ?`Approve "${modal?.name}"? They'll gain full platform access.`
                :`Permanently remove "${modal?.name}"? This cannot be undone.`}
            onConfirm={()=>modal?.type==='approve'?handleApprove(modal.id):handleReject(modal.id)}
            onCancel={()=>setModal(null)}/>
        <Toast msg={toast}/>
        </>
    );
};

export default InstituteManagement;
