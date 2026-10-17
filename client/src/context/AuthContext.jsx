import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cinebook_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cinebook_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Configure axios authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('cinebook_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('cinebook_token');
    }
  }, [token]);

  // Check current session
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data.user);
          localStorage.setItem('cinebook_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('cinebook_user', JSON.stringify(res.data.user));
      localStorage.setItem('cinebook_token', res.data.token);
      showToast(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, 'success');
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('cinebook_user', JSON.stringify(res.data.user));
      localStorage.setItem('cinebook_token', res.data.token);
      showToast('Registration successful! Welcome to CineBook.', 'success');
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await axios.put('/api/auth/profile', formData);
      setUser(res.data.user);
      localStorage.setItem('cinebook_user', JSON.stringify(res.data.user));
      showToast('Profile updated successfully!', 'success');
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cinebook_user');
    localStorage.removeItem('cinebook_token');
    delete axios.defaults.headers.common['Authorization'];
    showToast('You have been logged out.', 'info');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
