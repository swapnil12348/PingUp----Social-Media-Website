import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { fetchConnections } from '../features/connections/connectionsSlice.js'
import api from '../api/axios.js'
import toast from 'react-hot-toast'


const Connections = () => {
    const [currentTab, setCurrentTab] = useState('Followers');
    const navigate = useNavigate();
    const {getToken}=useAuth();
    const dispatch=useDispatch();
    const {connections, pendingConnections, followers, following} = useSelector((state) => state.connections);

    const dataArray = [
        { label: 'Followers', value: followers, icon: Users },
        { label: 'Following', value: following, icon: UserCheck },
        { label: 'Pending Connections', value: pendingConnections, icon: UserRoundPen },
        { label: 'Connections', value: connections, icon: UserPlus },
    ]

    const handleUnfollow=async (userId) => {
        try {
            const {data}= await api.post('/api/user/unfollow', {
                id:userId
            },{
                headers:{
                    Authorization: `Bearer ${await getToken()}`
                }
            })

            if(data.success){
                toast.success(data.message);
                dispatch(fetchConnections(await getToken()));
            }else{
                toast(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            
        }
        
    }

        const acceptConnection=async (userId) => {
        try {
            const {data}= await api.post('/api/user/accept', {
                id:userId
            },{
                headers:{
                    Authorization: `Bearer ${await getToken()}`
                }
            })

            if(data.success){
                toast.success(data.message);
                dispatch(fetchConnections(await getToken()));
            }else{
                toast(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            
        }
        
    }

    useEffect(() => {
        getToken().then((token)=>{
            dispatch(fetchConnections(token))
        })
    },[])
    return (
        <div className='min-h-screen bg-slate-50'>
            <div className='max-w-6xl mx-auto p-6'>
                {/* title */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-2'>Connections</h1>
                    <p className='text-slate-600'>Manage your network and discover new connections</p>

                </div>
                {/* counts */}
                <div className='mb-8 flex flex-wrap gap-6'>
                    {/* FIX 4: Changed key from `index` to a stable `item.label` */}
                    {dataArray.map((item) => (
                        <div key={item.label} className='flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md'>
                            <b>{item.value?.length || 0}</b>
                            <p className='text-slate-600'>{item.label}</p>

                        </div>
                    ))}
                </div>
                {/* tabs */}
                <div className='inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm'>
                    {
                        dataArray.map((tab) => (
                            // FIX 3: Changed active tab style to be more visible (bg-indigo-500, text-white)
                            <button onClick={() => setCurrentTab(tab.label)} key={tab.label} className={`cursor-pointer flex items-center px-3 py-1 text-sm rounded-md transition-colors ${currentTab === tab.label ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-black'}`}>
                                <tab.icon className='w-4 h-4' />
                                <span className='ml-1'>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className='ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full'>{tab.count}</span>
                                )}
                            </button>
                        ))
                    }

                </div>
                {/* connection */}
                <div className='flex flex-wrap gap-6 mt-6'>
                    {dataArray.find((item) => item.label === currentTab)?.value?.map((user) => (
                        // FIX: Changed non-standard max-w-88 to max-w-sm for better consistency if needed
                        <div key={user._id} className='w-full max-w-sm flex flex-col sm:flex-row gap-5 p-6 bg-white shadow rounded-md'>
                            {/* FIX 2: Corrected typo `rounded-fll` to `rounded-full` */}
                            <img src={user.profile_picture} alt="" className='rounded-full w-12 h-12 shadow-md mx-auto sm:mx-0' />
                            <div className='flex-1'>
                                <p className='font-medium text-slate-700'>{user.full_name}</p>
                                <p className=' text-slate-500'>@{user.username}</p>
                                <p className=' text-sm text-gray-600'>{user.bio?.slice(0, 30)}...</p>
                                <div className='flex max-sm:flex-col gap-2 mt-4'>
                                    {
                                        <button onClick={() => navigate(`/profile/${user._id}`)} className='w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>View Profile</button>
                                    }
                                    {
                                        currentTab === 'Following' && (
                                            <button onClick={()=>handleUnfollow(user._id)} className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'>
                                                Unfollow
                                            </button>
                                        )
                                    }
                                    {
                                        // FIX 1: Corrected the condition from 'Pending' to 'Pending Connections'
                                        currentTab === 'Pending Connections' && (
                                            <button onClick={()=>acceptConnection(user._id)} className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'>
                                                Accept
                                            </button>
                                        )
                                    }
                                    {
                                        currentTab === 'Connections' && (
                                            <button onClick={() => navigate(`/messages/${user._id}`)} className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1'>
                                                <MessageSquare className='w-4 h-4' />
                                                Message
                                            </button>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Connections