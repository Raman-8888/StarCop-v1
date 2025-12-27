import axios from 'axios';
import { API_URL } from '../config';

// Send a message request (first message)
export const sendMessageRequest = async (receiverId, text, file = null) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('receiverId', receiverId);
        if (text) formData.append('text', text);
        if (file) formData.append('file', file);

        const response = await axios.post(`${API_URL}/api/message-requests/send`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get pending message requests
export const getMessageRequests = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/message-requests`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Accept a message request
export const acceptMessageRequest = async (requestId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/message-requests/${requestId}/accept`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Reject a message request
export const rejectMessageRequest = async (requestId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/message-requests/${requestId}/reject`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Check status of message request with a specific user
export const checkMessageRequestStatus = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/message-requests/check/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
