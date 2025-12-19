import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

// Inngest function to save user data to database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event, step }) => {
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            
            console.log('🔵 User Creation Event Received:', id);
            
            let username = email_addresses[0].email_address.split('@')[0];
            
            // Check availability of username
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                username = username + Math.floor(Math.random() * 10000);
            }
            
            const userData = {
                _id: id,
                email: email_addresses[0].email_address,
                full_name: first_name + ' ' + last_name,
                profile_picture: image_url,
                username
            };
            
            const newUser = await User.create(userData);
            console.log('✅ User created in MongoDB:', newUser._id);
            
            return { success: true, userId: newUser._id };
        } catch (error) {
            console.error('❌ Error creating user:', error);
            throw error;
        }
    }
);

// Inngest function to update user data in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event, step }) => {
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            
            console.log('🟡 User Update Event Received:', id);
            
            const updatedUserData = {
                email: email_addresses[0].email_address,
                full_name: first_name + ' ' + last_name,
                profile_picture: image_url,
            };
            
            const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
            
            if (updatedUser) {
                console.log('✅ User updated in MongoDB:', updatedUser._id);
            } else {
                console.log('⚠️ User not found for update:', id);
            }
            
            return { success: true, userId: id };
        } catch (error) {
            console.error('❌ Error updating user:', error);
            throw error;
        }
    }
);

// Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event, step }) => {
        try {
            const { id } = event.data;
            
            console.log('🔴 User Deletion Event Received:', id);
            
            const deletedUser = await User.findByIdAndDelete(id);
            
            if (deletedUser) {
                console.log('✅ User deleted from MongoDB:', deletedUser._id);
            } else {
                console.log('⚠️ User not found for deletion:', id);
            }
            
            return { success: true, userId: id };
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            throw error;
        }
    }
);
//inngest fucntion to send reminder when a new connection request is added

const sendNewConnectionRequestReminder = inngest.createFunction(
    {id:"send-new-connection-request-reminder"},
    {event:"app/connection-request"},
    async ({event, step}) => {
        const {connectionId}=event.data;
        await step.run('send-connection-request-email', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
            const subject = `New Connection Request`;
            const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>HI ${connection.to_user_id.full_name},</h2>
            <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981">here</a> to accept or reject the request</p>
            <br/>
            <p>Thanks,<br/>PingUp - Stay Connected</p>
            </div>`;

            await sendEmail ({
                to: connection.to_user_id.email,
                subject,
                body
            })
            
        })

        const in24Hours=new Date(Date.now()+24*60*60*1000)
        await step.sleepUntil("wait-for-24-hours", in24Hours);
        await step.run('send-connection-request-reminder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');

            if (connection.status==="accepted") {
                return{message:"Connection already accepted"};

            }


            const subject = `New Connection Request`;
            const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>HI ${connection.to_user_id.full_name},</h2>
            <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981">here</a> to accept or reject the request</p>
            <br/>
            <p>Thanks,<br/>PingUp - Stay Connected</p>
            </div>`;

            await sendEmail ({
                to: connection.to_user_id.email,
                subject,
                body
            })

            return {message:"Reminder Email Sent"};

            
            
        })
        
    }
    
)

// inngest function to delete story after 24 hours

const deleteStory = inngest.createFunction(
    {id:"story-delete"},
    {event:"app/story.delete"},
    async ({event, step}) => {
        const {storyId}=event.data;
        const in24Hours=new Date(Date.now()+24*60*60*1000)
        await step.sleepUntil("wait-for-24-hours", in24Hours);
        await step.run('delete-story', async () => {
            await Story.findByIdAndDelete(storyId);
            return {message:"Story Deleted Successfully"};

        })
    }
)

const sendNotificationOfUnseenMessages = inngest.createFunction(
    {id:"send-unseen-messages-notification"},
    {cron:"TZ=America/New_York 0 9 * * *"}, // everyday 9 am
    async ({step}) => {
        const messages=await Message.find({seen:false}).populate('to_user_id');
        const unseenCount={};

        messages.map(message=>{
            unseenCount[message.to_user_id._id]=(unseenCount[message.to_user_id._id]||0)+1;
        })
        for (const userId in unseenCount) {
            const user=await User.findById(userId);

            const subject=`You have ${unseenCount[userId]} unseen messages`;
            const body=`<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>HI ${user.full_name},</h2>
            <p>You have ${unseenCount[userId]} unseen messages in your PingUp account.</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color:#10b981">here</a> to view your messages</p>
            <br/>
            <p>Thanks,<br/>PingUp - Stay Connected</p>
            </div>`;

            await sendEmail ({
                to: user.email,
                subject,
                body
            })
            
            
        }
        return {message:"Notifications Sent."};
        
    }
)

// Export all Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion, sendNewConnectionRequestReminder, deleteStory, sendNotificationOfUnseenMessages];