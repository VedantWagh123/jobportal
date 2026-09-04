import { useContext } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
    const { openSignIn } = useClerk()
    const { user } = useUser()
    const navigate = useNavigate()

    return (
        <div className='bg-white shadow-sm border-b border-gray-100 py-4'>
            <div className='px-4 lg:px-8 flex justify-between items-center'>
                {/* Logo */}
                <img onClick={() => navigate('/')} className='cursor-pointer h-8 lg:h-10' src={assets.logo} alt="Logo" />
                
                {/* Auth Area */}
                <div>
                    {
                        user
                            ? <div className='flex items-center gap-4'>
                                <p className='text-sm text-gray-700 font-medium max-sm:hidden'>
                                    Welcome, {user.firstName}
                                </p>
                                <div className="border p-1 rounded-full border-gray-200 hover:shadow-md transition">
                                    <UserButton />
                                </div>
                            </div>
                            : <div>
                                <button onClick={e => openSignIn()} className='bg-blue-600 text-white px-6 py-2 text-sm font-medium rounded-full hover:bg-blue-700 transition shadow-sm hover:shadow-md'>
                                    Candidate Login
                                </button>
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Navbar