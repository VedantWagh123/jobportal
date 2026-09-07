import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const { user } = useUser()
    const { getToken } = useAuth()

    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: ''
    })

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

    // Function to Fetch Jobs 
    const fetchJobs = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/jobs')

            if (data.success) {
                setJobs(data.jobs)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to Fetch Company Data
    const fetchCompanyData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/company/company', { headers: { token: companyToken } })

            if (data.success) {
                setCompanyData(data.company)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

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

    // Retrive Tokens From LocalStorage
    useEffect(() => {
        fetchJobs()

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
    useEffect(() => {
        if (companyToken) {
            fetchCompanyData()
        }
    }, [companyToken])

    // Fetch User's Applications & Data if User is Logged In
    useEffect(() => {
        if (user) {
            fetchUserData()
            fetchUserApplications()
        }
    }, [user])

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

    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)

}