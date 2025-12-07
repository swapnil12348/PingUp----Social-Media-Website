import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events

export const inngest = new Inngest({ id: "pingup-app" });

// Inngest function to save user data to database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' }, // Fixed: lowercase 'user'
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
    { event: 'clerk/user.updated' }, // Fixed: was 'deleted' before!
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
    { id: 'delete-user-from-clerk' }, // Fixed typo: 'delte' -> 'delete'
    { event: 'clerk/user.deleted' }, // Fixed: was 'updated' before!
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

// Export all Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];