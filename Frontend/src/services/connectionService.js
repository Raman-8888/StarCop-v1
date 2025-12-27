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
 * Get all connections for the current user
 */
export const getMyConnections = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/connections`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Get connections error:', error);
        throw error;
    }
};

/**
 * Check if connection exists with a specific user
 */
export const checkConnection = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/api/connections/check/${userId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Check connection error:', error);
        throw error;
    }
};

/**
 * Get connection by ID
 */
export const getConnectionById = async (connectionId) => {
    try {
        const response = await axios.get(`${API_URL}/api/connections/${connectionId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Get connection error:', error);
        throw error;
    }
};

/**
 * Block or unblock a connection
 */
export const toggleBlockConnection = async (connectionId) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/connections/${connectionId}/block`,
            {},
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Toggle block connection error:', error);
        throw error;
    }
};

export default {
    getMyConnections,
    checkConnection,
    getConnectionById,
    toggleBlockConnection
};
