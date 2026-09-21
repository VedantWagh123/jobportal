import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    GraduationCap, Eye, EyeOff, Building, MapPin, Award, 
    BookOpen, Users, BarChart3, Settings, ArrowRight, CheckCircle2,
    Users2, Settings2, LineChart
} from 'lucide-react';
import axios from 'axios';

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
                    setSuccessMsg("Registration successful! Please wait for Super Admin approval before logging in.");
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
        <div className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden flex flex-col">
            
            {/* BACKGROUND DECORATIONS */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 z-0 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0 pointer-events-none"></div>
            <div className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0 pointer-events-none"></div>
            
            {/* Curved waves at bottom */}
            <svg className="absolute bottom-0 w-full h-auto text-green-500/10 z-0 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,138.7C960,128,1056,160,1152,181.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg className="absolute bottom-0 w-full h-auto text-green-600/20 z-0 translate-y-4 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="currentColor" d="M0,160L60,176C120,192,240,224,360,208C480,192,600,128,720,117.3C840,107,960,149,1080,170.7C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>

            {/* HEADER */}
            <header className="relative z-10 w-full px-6 py-4 lg:px-12 lg:py-6 flex justify-between items-center bg-transparent">
                <div className="flex items-center gap-3">
                    <div className="bg-[#16A34A] text-white p-2 rounded-xl shadow-[0_4px_14px_rgba(22,163,74,0.3)]">
                        <GraduationCap size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-black text-[#10233F] tracking-tight leading-none">
                            SkillSet <span className="text-[#16A34A]">India</span>
                        </h1>
                        <p className="text-[10px] lg:text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mt-1">
                            Empowering Skills, Building Bharat
                        </p>
                    </div>
                </div>
                
                <nav className="hidden lg:flex items-center gap-10 text-[15px] font-bold text-gray-500">
                    <a href="#" className="hover:text-[#16A34A] transition-colors cursor-pointer">Learn</a>
                    <a href="#" className="hover:text-[#16A34A] transition-colors cursor-pointer">Train</a>
                    <a href="#" className="hover:text-[#16A34A] transition-colors cursor-pointer">Grow</a>
                    <a href="#" className="text-[#16A34A] border-b-[3px] border-[#16A34A] pb-1 cursor-pointer">Build India</a>
                </nav>
            </header>

            {/* MAIN CONTENT */}
            <main className="relative z-10 flex-grow flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-4 w-full max-w-[1600px] mx-auto gap-8 xl:gap-16">
                
                {/* LEFT SECTION - MARKETING */}
                <div className="hidden lg:flex flex-col w-full lg:w-[30%] max-w-md pt-8">
                    <h2 className="text-[46px] xl:text-[56px] font-black text-[#10233F] leading-[1.05] mb-4 tracking-tight">
                        Skilled India<br />
                        <span className="text-[#16A34A]">Stronger Tomorrow</span>
                    </h2>
                    <p className="text-gray-600 font-semibold mt-4 mb-12 text-[17px] leading-relaxed">
                        Manage your courses, batches, trainees and more — all in one place.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-[18px] bg-[#DCFCE7] flex items-center justify-center flex-shrink-0 shadow-sm">
                                <BookOpen className="text-[#16A34A]" size={24} strokeWidth={2.5} />
                            </div>
                            <div className="pt-1">
                                <h3 className="font-bold text-[#10233F] text-[16px]">Manage Courses</h3>
                                <p className="text-gray-500 text-[14px] font-medium mt-1">Create and update training programs</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-[18px] bg-[#FEF3C7] flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Users className="text-[#D97706]" size={24} strokeWidth={2.5} />
                            </div>
                            <div className="pt-1">
                                <h3 className="font-bold text-[#10233F] text-[16px]">Track Batches</h3>
                                <p className="text-gray-500 text-[14px] font-medium mt-1">Monitor trainee progress efficiently</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-[18px] bg-[#DBEAFE] flex items-center justify-center flex-shrink-0 shadow-sm">
                                <BarChart3 className="text-[#2563EB]" size={24} strokeWidth={2.5} />
                            </div>
                            <div className="pt-1">
                                <h3 className="font-bold text-[#10233F] text-[16px]">View Reports</h3>
                                <p className="text-gray-500 text-[14px] font-medium mt-1">Get insights and real-time analytics</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-[18px] bg-[#F3E8FF] flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Settings className="text-[#9333EA]" size={24} strokeWidth={2.5} />
                            </div>
                            <div className="pt-1">
                                <h3 className="font-bold text-[#10233F] text-[16px]">Simplify Administration</h3>
                                <p className="text-gray-500 text-[14px] font-medium mt-1">Digital tools for better management</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-14 opacity-90 -rotate-3 pl-4">
                        <p className="font-['Caveat',cursive,sans-serif] text-[40px] font-bold text-[#0F9D58] leading-none">
                            Naye Skills,
                        </p>
                        <p className="font-['Caveat',cursive,sans-serif] text-[40px] font-bold text-[#0F9D58] ml-8 leading-none">
                            Naya Bharat
                        </p>
                    </div>
                </div>

                {/* CENTER SECTION - LOGIN CARD */}
                <div className="w-full lg:w-[40%] flex justify-center items-center z-20">
                    <div className="w-full max-w-[480px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-12 transition-all">
                        <div className="flex flex-col items-center mb-10">
                            <div className="text-[#16A34A] mb-4">
                                <GraduationCap size={44} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-[28px] font-black text-[#10233F] text-center tracking-tight">
                                {isRegistering ? 'Register Institute' : 'Training Institute Portal'}
                            </h2>
                            <p className="text-center text-[15px] font-medium text-gray-500 mt-3 max-w-[320px] leading-relaxed">
                                {isRegistering ? 'Apply for an account to manage capacity and courses' : 'Sign in to manage courses, batches, and view real-time insights'}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-[14px] mb-6 text-[14px] font-semibold flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></div>
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-[14px] mb-6 text-[14px] font-semibold flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0"></div>
                                {successMsg}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {isRegistering && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Institute Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Building className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input type="text" required value={name} onChange={e => setName(e.target.value)} 
                                                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[14px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] text-[15px] font-medium text-gray-900 transition-colors" 
                                                placeholder="Enter institute name"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Type</label>
                                            <select value={type} onChange={e => setType(e.target.value)} 
                                                className="block w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-[14px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] text-[15px] font-medium text-gray-900 transition-colors appearance-none cursor-pointer">
                                                <option value="Private">Private</option>
                                                <option value="Government">Government</option>
                                                <option value="NGO">NGO</option>
                                                <option value="Corporate">Corporate</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">District</label>
                                            <select value={districtId} onChange={e => setDistrictId(e.target.value)} 
                                                className="block w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-[14px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] text-[15px] font-medium text-gray-900 transition-colors appearance-none cursor-pointer">
                                                {districts.map(d => (
                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Accreditation (Optional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Award className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input type="text" value={accreditation} onChange={e => setAccreditation(e.target.value)} 
                                                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[14px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] text-[15px] font-medium text-gray-900 transition-colors" 
                                                placeholder="e.g. NSDC, AICTE"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
                                    <div className="relative">
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                                            className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[14px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] text-[15px] font-medium text-gray-900 transition-colors placeholder-gray-400" 
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} 
                                            className="block w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-[14px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] text-[15px] font-medium text-gray-900 transition-colors placeholder-gray-400" 
                                            placeholder="Enter your password"
                                        />
                                        <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#16A34A] transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={loading} 
                                    className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-[14px] shadow-[0_4px_14px_rgba(22,163,74,0.3)] text-[16px] font-bold text-white bg-[#16A34A] hover:bg-[#15803d] hover:shadow-[0_6px_20px_rgba(22,163,74,0.4)] focus:outline-none active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100">
                                    {loading ? 'Processing...' : (isRegistering ? 'Submit Application' : 'Sign In')}
                                    {!loading && <ArrowRight size={18} strokeWidth={2.5} />}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-[14px] font-semibold text-gray-500">
                                {isRegistering ? 'Already have an account?' : 'Need an account?'}
                                <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMsg(''); }} 
                                    className="ml-2 font-bold text-[#16A34A] hover:text-[#15803d] hover:underline transition-all outline-none">
                                    {isRegistering ? 'Sign in' : 'Register your institute'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION - VISUAL COMPOSITION */}
                <div className="hidden xl:flex flex-col w-[30%] justify-center items-center relative z-10 pt-10">
                    
                    {/* Visual Collage container */}
                    <div className="relative w-full max-w-[400px] h-[450px]">
                        
                        {/* Big Yellow Circle */}
                        <div className="absolute top-[10%] right-[5%] w-[320px] h-[320px] bg-[#FEF3C7] rounded-full z-0 shadow-inner"></div>
                        
                        {/* Floating quote bubble */}
                        <div className="absolute top-0 left-[-20px] bg-white p-5 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-20 border border-gray-100 max-w-[200px] animate-bounce-slow">
                            <p className="text-[#10233F] font-black text-[22px] leading-[1.2]">
                                "Skills<br />
                                today for a<br />
                                <span className="text-[#16A34A]">brighter<br />tomorrow"</span>
                            </p>
                        </div>
                        
                        {/* Motivational Element 1 */}
                        <div className="absolute top-[15%] right-[-10px] transform rotate-12 z-20">
                            <span className="font-['Caveat',cursive,sans-serif] text-[28px] font-bold text-[#10233F]">Viksit Bharat</span>
                        </div>

                        {/* Motivational Element 2 */}
                        <div className="absolute bottom-[25%] right-[-20px] transform -rotate-6 z-20 flex flex-col items-end">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></div>
                                <span className="font-['Caveat',cursive,sans-serif] text-[24px] font-bold text-[#16A34A] leading-none">Learn</span>
                            </div>
                            <span className="font-['Caveat',cursive,sans-serif] text-[24px] font-bold text-[#16A34A] leading-none">Grow</span>
                            <span className="font-['Caveat',cursive,sans-serif] text-[24px] font-bold text-[#16A34A] leading-none">Succeed</span>
                        </div>
                        
                        {/* CSS Abstract Composition representing Students / Growth */}
                        <div className="absolute bottom-0 left-[10%] w-[280px] h-[380px] bg-gradient-to-t from-gray-900/10 to-transparent rounded-t-full z-10 overflow-hidden flex items-end justify-center">
                            {/* Abstract student shapes using CSS */}
                            <div className="w-[120px] h-[200px] bg-[#10233F] rounded-t-[60px] translate-x-4 opacity-90 relative">
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[80px] h-[90px] bg-[#10233F] rounded-[40px]"></div>
                            </div>
                            <div className="w-[140px] h-[160px] bg-gray-700 rounded-t-[70px] -translate-x-10 opacity-95 relative">
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-[70px] h-[80px] bg-gray-700 rounded-[35px]"></div>
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[80px] h-[100px] bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"></div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="mt-8 bg-white/80 backdrop-blur-md rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 p-5 flex items-center justify-between w-[110%] max-w-[500px] z-20">
                        <div className="flex items-center gap-3">
                            <Users2 className="text-[#10233F] opacity-70" size={20} />
                            <div>
                                <h4 className="text-[12px] font-black text-[#10233F] leading-none">Skilled Youth</h4>
                                <p className="text-[10px] font-bold text-gray-500 mt-0.5">Stronger India</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <Settings2 className="text-[#10233F] opacity-70" size={20} />
                            <div>
                                <h4 className="text-[12px] font-black text-[#10233F] leading-none">Better Training</h4>
                                <p className="text-[10px] font-bold text-gray-500 mt-0.5">Brighter Careers</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <LineChart className="text-[#10233F] opacity-70" size={20} />
                            <div>
                                <h4 className="text-[12px] font-black text-[#10233F] leading-none">Developed India</h4>
                                <p className="text-[10px] font-bold text-gray-500 mt-0.5">Our Shared Goal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
