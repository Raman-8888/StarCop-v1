import axios from 'axios';
import { API_URL } from '../config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

/**
 * Block a user
 */
export const blockUser = async (userId, reason = '') => {
    try {
        const response = await axios.post(
            `${API_URL}/api/blocks/${userId}`,
            { reason },
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Block user error:', error);
        throw error;
    }
};

/**
 * Unblock a user
 */
export const unblockUser = async (userId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/api/blocks/${userId}`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Unblock user error:', error);
        throw error;
    }
};

/**
 * Get list of blocked users
 */
export const getBlockedUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/blocks`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Get blocked users error:', error);
        throw error;
    }
};

/**
 * Check block status with a specific user
 */
export const checkBlockStatus = async (userId) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/blocks/check/${userId}`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Check block status error:', error);
        throw error;
    }
};

export default {
    blockUser,
    unblockUser,
    getBlockedUsers,
    checkBlockStatus
};
