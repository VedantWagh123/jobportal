import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

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

    const [userData, setUserData] = useState(null)
    const [userApplications, setUserApplications] = useState([])
    const [savedJobs, setSavedJobs] = useState([])
    const [isChatbotOpen, setIsChatbotOpen] = useState(false)

    // Function to handle saved jobs
    const toggleSaveJob = (jobId) => {
        setSavedJobs(prev => {
            const updated = prev.includes(jobId) 
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId];
            localStorage.setItem('savedJobs', JSON.stringify(updated));
            return updated;
        });
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
        if (companyQueryData) setCompanyData(companyQueryData);
    }, [companyQueryData]);

    // Function to Fetch User Data
    const fetchUserData = async () => {
        try {

            const token = await getToken();

            let { data } = await axios.get(backendUrl + '/api/users/user',
                { headers: { Authorization: `Bearer ${token}` } })

            if (!data.success && data.message === 'User Not Found' && user) {
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
            } else {
                if (data.message !== 'User Not Found') {
                    toast.error(data.message)
                }
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to Fetch User's Applied Applications
    const fetchUserApplications = async () => {
        try {

            const token = await getToken()

            const { data } = await axios.get(backendUrl + '/api/users/applications',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setUserApplications(data.applications)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
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

        const storedSavedJobs = localStorage.getItem('savedJobs')
        if (storedSavedJobs) {
            try {
                setSavedJobs(JSON.parse(storedSavedJobs))
            } catch (e) {
                console.error("Failed to parse saved jobs", e)
            }
        }

    }, [])

    // Fetch Company Data if Company Token is Available
    // Handled automatically by useQuery `enabled: !!companyToken`

    // Fetch User's Applications & Data if User is Logged In
    useEffect(() => {
        // Wait for Clerk to fully load before reacting to user state.
        // Without this guard, on page refresh: user is null briefly (Clerk loading),
        // so userData stays null and the Navbar shows Login. Once Clerk resolves,
        // user becomes available and we fetch correctly.
        if (!isLoaded) return;
        if (user) {
            fetchUserData()
            fetchUserApplications()
        } else {
            // User has signed out — clear user data
            setUserData(null)
            setUserApplications([])
        }
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
        selectedCategories, setSelectedCategories,
        selectedLocations, setSelectedLocations,
        fetchNextPage, hasNextPage, isFetchingNextPage, jobsStatus
    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)

}