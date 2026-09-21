import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    Users, Zap, FileText, TrendingUp, Building, MapPin, Award, 
    Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Briefcase
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('Private');
    const [accreditation, setAccreditation] = useState('');
    const [districtId, setDistrictId] = useState('');
    const [districts, setDistricts] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const { data } = await axios.get('/api/institute/auth/districts');
                if (data.success && data.districts.length > 0) {
                    setDistricts(data.districts);
                    setDistrictId(data.districts[0]._id);
                }
            } catch (err) {
                console.error("Failed to load districts", err);
            }
        };
        fetchDistricts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        if (isRegistering) {
            try {
                const { data } = await axios.post('/api/institute/auth/register', {
                    name, email, password, type, accreditation, districtId: districtId || districts[0]?._id
                });
                if (data.success) {
                    setSuccessMsg("Registration successful! Please wait for approval.");
                    setIsRegistering(false);
                    setEmail('');
                    setPassword('');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Registration failed');
            }
        } else {
            const res = await login(email, password);
            if (!res.success) setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F8FF] to-[#EBF2FF] font-sans relative overflow-hidden flex flex-col">
            
            {/* Global Keyframes for floats */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
            `}</style>

            {/* BACKGROUND DECORATIONS */}
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 z-0 pointer-events-none"></div>
            <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 z-0 pointer-events-none"></div>

            {/* HEADER */}
            <header className="relative z-10 w-full px-6 py-6 lg:px-12 flex justify-between items-center bg-transparent max-w-[1600px] mx-auto">
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">in</div>
                    <span className="font-extrabold text-slate-900 text-xl tracking-tight">InsiderJobs</span>
                </div>
                
                <a href="/" className="flex items-center gap-2 text-[14px] font-bold text-slate-600 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Home
                </a>
            </header>

            {/* MAIN CONTENT (3 Columns) */}
            <main className="relative z-10 flex-grow flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-12 py-8 w-full max-w-[1700px] 2xl:max-w-[1900px] mx-auto gap-8 lg:gap-12 xl:gap-16">
                
                {/* --- LEFT COLUMN (Marketing) --- */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex flex-col w-full lg:w-[32%] xl:w-[28%] 2xl:w-[25%] pt-4"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md mb-8 border border-blue-100/50 self-start">
                        <Building size={14} className="text-blue-600" />
                        <span className="text-[11px] font-extrabold text-blue-600 tracking-wider uppercase">For Employers</span>
                    </div>

                    <h2 className="text-[44px] xl:text-[52px] font-black text-[#0F172A] leading-[1.05] mb-6 tracking-tight">
                        Find the Right <br />Talent, <span className="text-blue-600 relative inline-block">
                            Faster
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-400 opacity-60" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <path d="M2 9.5C45.5 -1.5 125 -1.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h2>
                    
                    <p className="text-slate-600 font-medium mb-10 text-[15px] leading-relaxed max-w-[90%]">
                        Connect with skilled professionals, post jobs, manage applications, and grow your team — all in one place.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
                                <Users className="text-blue-600" size={20} strokeWidth={2.5} />
                            </div>
                            <div className="pt-0.5">
                                <h3 className="font-extrabold text-slate-900 text-[15px]">Access Skilled Talent</h3>
                                <p className="text-slate-500 text-[13px] font-medium mt-1">From freshers to experienced professionals</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                                <Zap className="text-emerald-500" size={20} strokeWidth={2.5} />
                            </div>
                            <div className="pt-0.5">
                                <h3 className="font-extrabold text-slate-900 text-[15px]">Smart Hiring Tools</h3>
                                <p className="text-slate-500 text-[13px] font-medium mt-1">AI-powered candidate matching</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-purple-100">
                                <FileText className="text-purple-500" size={20} strokeWidth={2.5} />
                            </div>
                            <div className="pt-0.5">
                                <h3 className="font-extrabold text-slate-900 text-[15px]">Manage with Ease</h3>
                                <p className="text-slate-500 text-[13px] font-medium mt-1">Track applications and schedule interviews</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-100">
                                <TrendingUp className="text-amber-500" size={20} strokeWidth={2.5} />
                            </div>
                            <div className="pt-0.5">
                                <h3 className="font-extrabold text-slate-900 text-[15px]">Grow Your Business</h3>
                                <p className="text-slate-500 text-[13px] font-medium mt-1">Hire the right people to build the future</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-14 opacity-80 -rotate-3">
                        <p className="font-['Caveat',cursive,sans-serif] text-[34px] font-bold text-slate-400 leading-none">
                            Great Teams
                        </p>
                        <p className="font-['Caveat',cursive,sans-serif] text-[34px] font-bold text-slate-400 ml-6 leading-none">
                            Build Great Things
                        </p>
                    </div>
                </motion.div>

                {/* --- CENTER COLUMN (Login Card) --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="w-full lg:w-[40%] xl:w-[35%] 2xl:w-[32%] flex justify-center items-center z-20"
                >
                    <div className="w-full max-w-[460px] bg-white rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 sm:p-10 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[26px] font-black text-slate-900 tracking-tight">
                                {isRegistering ? 'Register Company' : 'Employer Login'}
                            </h2>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Briefcase size={20} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p className="text-[13px] font-medium text-slate-500 mb-8 max-w-[90%]">
                            {isRegistering ? 'Create your employer account to start hiring the best talent.' : 'Welcome back! Please log in to access your dashboard.'}
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-[13px] font-bold flex items-center gap-2 border border-red-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></div>
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-[13px] font-bold flex items-center gap-2 border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0"></div>
                                {successMsg}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {isRegistering && (
                                <div className="space-y-5 animate-fadeIn">
                                    <div>
                                        <label className="block text-[12px] font-extrabold text-slate-900 mb-2">Company Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Building className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input type="text" required value={name} onChange={e => setName(e.target.value)} 
                                                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-[14px] font-bold text-slate-900 transition-all placeholder-slate-400" 
                                                placeholder="Enter company name"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[12px] font-extrabold text-slate-900 mb-2">Type</label>
                                            <select value={type} onChange={e => setType(e.target.value)} 
                                                className="block w-full py-3 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-[14px] font-bold text-slate-900 transition-all appearance-none cursor-pointer">
                                                <option value="Private">Private</option>
                                                <option value="Government">Government</option>
                                                <option value="NGO">NGO</option>
                                                <option value="Corporate">Corporate</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-extrabold text-slate-900 mb-2">District</label>
                                            <select value={districtId} onChange={e => setDistrictId(e.target.value)} 
                                                className="block w-full py-3 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-[14px] font-bold text-slate-900 transition-all appearance-none cursor-pointer">
                                                {districts.map(d => (
                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[12px] font-extrabold text-slate-900 mb-2">Industry (Optional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Award className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input type="text" value={accreditation} onChange={e => setAccreditation(e.target.value)} 
                                                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-[14px] font-bold text-slate-900 transition-all placeholder-slate-400" 
                                                placeholder="e.g. Technology, Healthcare"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[12px] font-extrabold text-slate-900 mb-2">Corporate Email ID</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                                        className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-[14px] font-bold text-slate-900 transition-all placeholder-slate-400" 
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-extrabold text-slate-900 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} 
                                        className="block w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-[14px] font-bold text-slate-900 transition-all placeholder-slate-400" 
                                        placeholder="Enter your password"
                                    />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {!isRegistering && (
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="remember" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                                        <label htmlFor="remember" className="text-[12px] font-bold text-slate-600 cursor-pointer">Remember me</label>
                                    </div>
                                    <a href="#" className="text-[12px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
                                </div>
                            )}

                            <div className="pt-3">
                                <button type="submit" disabled={loading} 
                                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-[0_5px_15px_rgba(37,99,235,0.2)] text-[14px] font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-[0_8px_25px_rgba(37,99,235,0.3)] focus:outline-none active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100">
                                    {loading ? 'Processing...' : (isRegistering ? 'Submit Application' : 'Sign In to Dashboard')}
                                    {!loading && <ArrowRight size={16} strokeWidth={2.5} />}
                                </button>
                            </div>
                        </form>

                        <div className="relative mt-8 mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">OR</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMsg(''); }} 
                                className="w-full py-3.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                {isRegistering ? 'Already have an account? Log In' : 'New to our platform? '}
                                {!isRegistering && <span className="text-blue-600">Register Company</span>}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* --- RIGHT COLUMN (Visual Photo & Cards) --- */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="hidden xl:flex flex-col w-[35%] 2xl:w-[30%] h-[600px] justify-center items-center relative z-10"
                >
                    <div className="relative w-[380px] h-[520px] rounded-3xl bg-slate-200 overflow-hidden shadow-2xl">
                        <img 
                            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                            alt="Professional Employer" 
                            className="w-full h-full object-cover object-top"
                        />
                        {/* Soft overlay for premium look */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 via-transparent to-transparent"></div>
                    </div>

                    {/* Top Left Floating Card */}
                    <div className="absolute top-[8%] -left-8 bg-white/95 backdrop-blur-md p-3.5 pr-6 rounded-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] border border-white flex items-center gap-3.5 animate-float-slow z-20">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                            <Users size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="font-extrabold text-slate-900 text-[15px] leading-tight">10K+</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Active Candidates</p>
                        </div>
                    </div>

                    {/* Top Right Floating Card */}
                    <div className="absolute top-[28%] -right-14 bg-white/95 backdrop-blur-md p-3.5 pr-6 rounded-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] border border-white flex items-center gap-3.5 animate-float-medium z-20">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
                            <Building size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="font-extrabold text-slate-900 text-[15px] leading-tight">500+</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Hiring Companies</p>
                        </div>
                    </div>

                    {/* Bottom Left Floating Card */}
                    <div className="absolute bottom-[20%] -left-10 bg-white/95 backdrop-blur-md p-3.5 pr-6 rounded-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] border border-white flex items-center gap-3.5 animate-float-fast z-20">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0 shadow-inner">
                            <TrendingUp size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="font-extrabold text-slate-900 text-[15px] leading-tight">3x</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Faster Hiring</p>
                        </div>
                    </div>

                    {/* Bottom Center Pill Card */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white p-3 pr-4 rounded-[24px] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-between gap-6 min-w-[260px] z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <p className="font-extrabold text-slate-900 text-[14px] leading-tight">Build Your</p>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dream Team</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <ArrowRight size={14} strokeWidth={3} />
                        </div>
                    </div>

                    {/* Hand drawn text & arrow */}
                    <div className="absolute bottom-[35%] -right-32 rotate-6 opacity-70">
                        <div className="font-['Caveat',cursive,sans-serif] text-[26px] font-bold text-slate-500 leading-none mb-2">
                            Hire Smarter<br/>Grow Faster
                        </div>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-blue-500 transform -rotate-12 translate-x-4">
                            <path d="M5 20C5 20 12 18 16 12C18.6667 8 19 4 19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M14 4H19V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    {/* Decorative dashes top right */}
                    <div className="absolute top-[2%] -right-10 flex flex-col gap-1.5 rotate-12 opacity-80 animate-float-delayed scale-75">
                        <div className="w-6 h-2 bg-blue-500 rounded-full rotate-45"></div>
                        <div className="w-8 h-2 bg-blue-400 rounded-full rotate-45 translate-x-2"></div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Login;
