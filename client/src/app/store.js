import {configureStore} from '@reduxjs/toolkit'
import userReduce from '../features/user/userSlice.js'
import connectionsReducer from '../features/connections/connectionsSlice.js'
import messagesReducer from '../features/messages/messagesSlice.js'


export const store=configureStore({
    reducer:{
        user:userReduce,
        connections:connectionsReducer,
        messages:messagesReducer

    }
})