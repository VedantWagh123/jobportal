import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Building, MapPin, Award } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-primary-600">
                    <GraduationCap size={48} />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isRegistering ? 'Register Institute' : 'Training Institute Portal'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isRegistering ? 'Apply for an account to manage capacity and courses' : 'Sign in to manage courses, batches, and view skill gaps'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm font-medium">{error}</div>}
                    {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm font-medium">{successMsg}</div>}
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        {isRegistering && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Institute Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                        <select value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                            <option value="Private">Private</option>
                                            <option value="Government">Government</option>
                                            <option value="NGO">NGO</option>
                                            <option value="Corporate">Corporate</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">District</label>
                                        <select value={districtId} onChange={e => setDistrictId(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                            {districts.map(d => (
                                                <option key={d._id} value={d._id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Accreditation (Optional)</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Award className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input type="text" placeholder="e.g. NSDC, AICTE" value={accreditation} onChange={e => setAccreditation(e.target.value)} className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50">
                                {loading ? 'Processing...' : (isRegistering ? 'Submit Application' : 'Sign in')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMsg(''); }} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register your Institute'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
