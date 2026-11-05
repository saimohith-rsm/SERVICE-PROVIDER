import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('serveease_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [provider, setProvider] = useState(() => {
    const saved = localStorage.getItem('serveease_provider');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('serveease_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify token and fetch fresh user profile on startup
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('serveease_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setProvider(res.data.provider || null);
            localStorage.setItem('serveease_user', JSON.stringify(res.data.user));
            if (res.data.provider) {
              localStorage.setItem('serveease_provider', JSON.stringify(res.data.provider));
            } else {
              localStorage.removeItem('serveease_provider');
            }
          }
        } catch (error) {
          console.error('Session validation error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user, provider } = res.data;
      setToken(token);
      setUser(user);
      setProvider(provider || null);
      localStorage.setItem('serveease_token', token);
      localStorage.setItem('serveease_user', JSON.stringify(user));
      if (provider) {
        localStorage.setItem('serveease_provider', JSON.stringify(provider));
      } else {
        localStorage.removeItem('serveease_provider');
      }
      return { success: true, user, provider };
    }
    return { success: false, message: res.data.message };
  };

  const registerCustomer = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      setProvider(null);
      localStorage.setItem('serveease_token', token);
      localStorage.setItem('serveease_user', JSON.stringify(user));
      localStorage.removeItem('serveease_provider');
      return { success: true, user };
    }
    return { success: false, message: res.data.message };
  };

  const registerProvider = async (data) => {
    const res = await api.post('/auth/register-provider', data);
    if (res.data.success) {
      const { token, user, provider } = res.data;
      setToken(token);
      setUser(user);
      setProvider(provider);
      localStorage.setItem('serveease_token', token);
      localStorage.setItem('serveease_user', JSON.stringify(user));
      localStorage.setItem('serveease_provider', JSON.stringify(provider));
      return { success: true, user, provider };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    setUser(null);
    setProvider(null);
    setToken(null);
    localStorage.removeItem('serveease_token');
    localStorage.removeItem('serveease_user');
    localStorage.removeItem('serveease_provider');
  };

  const refreshMe = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProvider(res.data.provider || null);
        localStorage.setItem('serveease_user', JSON.stringify(res.data.user));
        if (res.data.provider) {
          localStorage.setItem('serveease_provider', JSON.stringify(res.data.provider));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('serveease_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        provider,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        registerCustomer,
        registerProvider,
        logout,
        refreshMe,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

