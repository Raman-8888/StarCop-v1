import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Load user from localStorage on initialization
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    const checkUserLoggedIn = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (data.success) {
                // Merge localStorage data with fresh server data to be safe
                const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...savedUser, ...data.user, token };

                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update cache
            } else {
                // Invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
