import { createContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.DEV ? 'http://localhost:5000' : import.meta.env.VITE_BACKEND_URL;

    const { user, isLoaded } = useUser()
    const { getToken } = useAuth()

    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: ''
    })

    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedLocations, setSelectedLocations] = useState([])

    const [isSearched, setIsSearched] = useState(false)

    const [jobs, setJobs] = useState([])

    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false)

    const [companyToken, setCompanyToken] = useState(null)
    const [instituteToken, setInstituteToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)

    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('candidateUserData');
        return saved ? JSON.parse(saved) : null;
    })
    const [userApplications, setUserApplications] = useState(() => {
        const saved = localStorage.getItem('candidateUserApps');
        return saved ? JSON.parse(saved) : [];
    })
    const [savedJobs, setSavedJobs] = useState([])
    const [isChatbotOpen, setIsChatbotOpen] = useState(false)
    const [showPremiumPopup, setShowPremiumPopup] = useState(false)
    const [isPremium, setIsPremium] = useState(false)
    const [myCourses, setMyCourses] = useState([])
    const prevUserRef = useRef(undefined)

    // Function to handle saved jobs
    const toggleSaveJob = async (jobId) => {
        // Optimistic UI update
        setSavedJobs(prev => {
            const updated = prev.includes(jobId) 
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId];
            // Still save to localStorage as a fallback for guest users
            localStorage.setItem('savedJobs', JSON.stringify(updated));
            return updated;
        });

        // Persist to DB if logged in
        if (user) {
            try {
                const token = await getToken();
                const { data } = await axios.post(backendUrl + '/api/users/toggle-saved-job', 
                    { jobId }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (data.success) {
                    setSavedJobs(data.savedJobs || []);
                }
            } catch (error) {
                console.error("Failed to toggle saved job in DB:", error);
            }
        }
    }

    // Function to handle Lumi Access Check (No Credit Consumed)
    const checkLumiAccess = (callback) => {
        if (!user) {
            toast.error("Please login to use AI features.");
            return;
        }
        // Temporarily unlocked for free
        if (callback) callback();
    }

    // Function to handle Lumi Credit Consumption
    const consumeLumiCredit = async (callback) => {
        if (!user) {
            toast.error("Please login to use AI features.");
            return;
        }

        // Temporarily unlocked for free without credit consumption
        toast(
            <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex items-center gap-3"
            >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-emerald-600" />
                </div>
                <div>
                    <p className="text-[13px] font-bold text-gray-800">✨ AI Feature Unlocked</p>
                    <p className="text-[11px] font-semibold text-gray-500">Currently free for all users!</p>
                </div>
            </motion.div>,
            {
                position: "top-center",
                autoClose: 2500,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                style: { borderRadius: '16px', padding: '12px', boxShadow: '0 10px 30px rgba(16,185,129,0.15)' }
            }
        );

        if (callback) callback();
    }

    // --- React Query Implementations ---

    // 1. Fetch Jobs with Infinite Scroll & Remote Filtering
    const { 
        data: jobsQueryData, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        status: jobsStatus 
    } = useInfiniteQuery({
        queryKey: ['jobs', searchFilter, selectedCategories, selectedLocations],
        queryFn: async ({ pageParam = 1 }) => {
            let url = `${backendUrl}/api/jobs?page=${pageParam}&limit=6`;
            if (searchFilter.title) url += `&title=${encodeURIComponent(searchFilter.title)}`;
            if (searchFilter.location) url += `&searchLocation=${encodeURIComponent(searchFilter.location)}`;
            if (selectedCategories.length > 0) url += `&categories=${encodeURIComponent(selectedCategories.join(','))}`;
            if (selectedLocations.length > 0) url += `&locations=${encodeURIComponent(selectedLocations.join(','))}`;
            
            const { data } = await axios.get(url);
            if (!data.success) throw new Error(data.message);
            return data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000 // 5 minutes
    })

    // 2. Fetch Company Data
    const { data: companyQueryData, refetch: fetchCompanyData } = useQuery({
        queryKey: ['companyData', companyToken],
        queryFn: async () => {
            const { data } = await axios.get(backendUrl + '/api/company/company', { headers: { token: companyToken } })
            if (!data.success) throw new Error(data.message)
            return data.company
        },
        enabled: !!companyToken,
        staleTime: 5 * 60 * 1000
    })

    // Sync React Query data to existing context states to prevent UI breakage
    useEffect(() => {
        if (jobsQueryData) {
            const allJobs = jobsQueryData.pages.flatMap(page => page.jobs);
            setJobs(allJobs);
        }
    }, [jobsQueryData]);

    useEffect(() => {
        if (companyQueryData) {
            setCompanyData(companyQueryData);
        }
    }, [companyQueryData]);

    // Secondary enforcement: if company data loads, no strict email check anymore because user wants unlocked email.
    // Session isolation is handled by tracking Clerk User ID.

    // Function to Fetch User Data
    const fetchUserData = async () => {
        try {

            const token = await getToken();

            // Guard: If Clerk hasn't issued a token yet (race condition on load), skip silently
            if (!token) {
                console.warn('fetchUserData: Clerk token not ready yet, skipping.');
                return;
            }

            let { data } = await axios.get(backendUrl + '/api/users/user',
                { headers: { Authorization: `Bearer ${token}` } })

            if (!data.success && (data.message === 'User Not Found' || data.message === 'Clerk authentication failed or token missing.') && user) {
                // Local dev fallback: if user not found but logged into Clerk, sync them manually
                const syncResponse = await axios.post(backendUrl + '/api/users/sync', {
                    name: user.fullName || 'User',
                    email: user.primaryEmailAddress?.emailAddress,
                    image: user.imageUrl
                }, { headers: { Authorization: `Bearer ${token}` } });
                data = syncResponse.data;
            }

            if (data.success) {
                setUserData(data.user)
                localStorage.setItem('candidateUserData', JSON.stringify(data.user))
                if (data.user.savedJobs) {
                    setSavedJobs(data.user.savedJobs)
                }
            } else {
                // Silently ignore auth/not-found errors — these are expected on first load
                const silentMessages = ['User Not Found', 'Clerk authentication failed or token missing.'];
                if (!silentMessages.includes(data.message)) {
                    toast.error(data.message)
                }
            }

        } catch (error) {
            console.error("Failed to fetch user data:", error);
            // Suppress network/auth toasts on page load
        }
    }

    // Function to Fetch User's Applied Applications
    const fetchUserApplications = async () => {
        try {

            const token = await getToken()

            // Guard: skip silently if token not ready
            if (!token) return;

            const { data } = await axios.get(backendUrl + '/api/users/applications',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setUserApplications(data.applications)
                localStorage.setItem('candidateUserApps', JSON.stringify(data.applications))
            } else {
                // Silently ignore auth-related errors on load
                const silentMessages = ['User Not Found', 'Clerk authentication failed or token missing.', 'Unauthorized: No Clerk session.'];
                if (!silentMessages.includes(data.message)) {
                    toast.error(data.message)
                }
            }

        } catch (error) {
            console.error("Failed to fetch user applications:", error);
            // Suppress network/auth toasts silently
        }
    }

    // Function to Fetch User's Enrolled Courses
    const fetchMyCourses = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const { data } = await axios.get(backendUrl + `/api/users/my-courses?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setMyCourses(data.myCourses);
            }
        } catch (error) {
            console.error("Failed to fetch my courses:", error);
        }
    }

    // Retrieve Tokens From LocalStorage
    useEffect(() => {

        const storedCompanyToken = localStorage.getItem('companyToken')
        const storedInstituteToken = localStorage.getItem('instituteToken')

        if (storedCompanyToken) {
            setCompanyToken(storedCompanyToken)
        }
        if (storedInstituteToken) {
            setInstituteToken(storedInstituteToken)
        }

        const handleCompanyTokenRefresh = (e) => {
            const newToken = e.detail;
            setCompanyToken(newToken);
        };
        window.addEventListener('token_refreshed_company', handleCompanyTokenRefresh);
        return () => window.removeEventListener('token_refreshed_company', handleCompanyTokenRefresh);

    }, [])

    // Fetch Company Data if Company Token is Available
    // Handled automatically by useQuery `enabled: !!companyToken`

    // Fetch User's Applications & Data if User is Logged In
    useEffect(() => {
        // Wait for Clerk to fully load before reacting to user state.
        if (!isLoaded) return;
        
        if (user) {
            // Optimistically set user data using Clerk's provided info so UI updates instantly
            setUserData(prev => prev || {
                name: user.fullName || 'User',
                email: user.primaryEmailAddress?.emailAddress,
                image: user.imageUrl,
            });
            fetchUserData();
            fetchUserApplications();
            fetchMyCourses();
        } else {
            // User has signed out — clear user data
            setUserData(null);
            setUserApplications([]);
            setMyCourses([]);
            localStorage.removeItem('candidateUserData');
            localStorage.removeItem('candidateUserApps');
        }

        // --- Session Isolation via Clerk User ID ---
        const storedClerkId = localStorage.getItem('lastClerkUserId');

        if (user) {
            // If a different Clerk user is detected (even across page reloads), purge old employer session
            if (storedClerkId && storedClerkId !== user.id) {
                console.warn("Security Event: Clerk user changed. Purging old employer session.");
                setCompanyToken(null);
                localStorage.removeItem('companyToken');
                setCompanyData(null);
                setInstituteToken(null);
                localStorage.removeItem('instituteToken');
            }
            localStorage.setItem('lastClerkUserId', user.id);
        } else {
            // Candidate logged out or is a guest
            if (storedClerkId) {
                setCompanyToken(null);
                localStorage.removeItem('companyToken');
                setCompanyData(null);
                setInstituteToken(null);
                localStorage.removeItem('instituteToken');
                localStorage.removeItem('lastClerkUserId');
            }
        }

        prevUserRef.current = user;
    }, [user, isLoaded])

    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        isProfileModalOpen, setIsProfileModalOpen,
        isViewProfileModalOpen, setIsViewProfileModalOpen,
        companyToken, setCompanyToken,
        instituteToken, setInstituteToken,
        companyData, setCompanyData,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications,
        savedJobs, toggleSaveJob,
        isChatbotOpen, setIsChatbotOpen,
        showPremiumPopup, setShowPremiumPopup,
        isPremium, setIsPremium,
        selectedCategories, setSelectedCategories,
        selectedLocations, setSelectedLocations,
        fetchNextPage, hasNextPage, isFetchingNextPage, jobsStatus,
        checkLumiAccess, consumeLumiCredit,
        myCourses, fetchMyCourses
    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)

}