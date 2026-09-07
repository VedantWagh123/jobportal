import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import moment from 'moment'
import { Bell, CheckCircle, Info } from 'lucide-react'

const Notifications = () => {
    const { backendUrl, companyToken } = useContext(AppContext)
    const [notifications, setNotifications] = useState(false)

    useEffect(() => {
        if (companyToken) {
            fetchNotifications()
        }
    }, [companyToken])

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/company/notifications', { headers: { token: companyToken } })
            if (data.success) {
                setNotifications(data.notifications)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const markAsRead = async (id = null) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/company/notifications/read', { id }, { headers: { token: companyToken } })
            if (data.success) {
                fetchNotifications()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    if (notifications === false) return <Loading />

    return (
        <div className='container mx-auto p-4 max-w-4xl pb-10'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>Notifications</h2>
                    <p className='text-sm text-gray-500 mt-1'>Stay updated with candidate applications and alerts.</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button onClick={() => markAsRead()} className='text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5'>
                        <CheckCircle size={16} /> Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center'>
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <Bell size={28} />
                    </div>
                    <h3 className='text-lg font-bold text-gray-900 mb-1'>All Caught Up!</h3>
                    <p className='text-gray-500'>You have no new notifications.</p>
                </div>
            ) : (
                <div className='bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100'>
                    {notifications.map((notif, index) => (
                        <div key={index} className={`p-5 flex gap-4 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                            <div className='mt-1'>
                                {notif.type === 'New_Application' ? (
                                    <div className='w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center'><Bell size={20}/></div>
                                ) : (
                                    <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center'><Info size={20}/></div>
                                )}
                            </div>
                            <div className='flex-1'>
                                <div className='flex justify-between items-start gap-4'>
                                    <h4 className={`text-base font-semibold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</h4>
                                    <span className='text-xs text-gray-400 whitespace-nowrap'>{moment(notif.date).fromNow()}</span>
                                </div>
                                <p className='text-sm text-gray-600 mt-1'>{notif.message}</p>
                                
                                {!notif.isRead && (
                                    <div className='mt-3 flex gap-3'>
                                        {notif.link && (
                                            <a href={notif.link} className='text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors'>View Details</a>
                                        )}
                                        <button onClick={() => markAsRead(notif._id)} className='text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors'>Dismiss</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Notifications
