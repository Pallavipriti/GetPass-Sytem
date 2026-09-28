import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosApi from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
    console.log("AuthProvider","AuthProvider")

  // Fetch logged-in user if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("tokentokentokentoken",token)
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axiosApi.get('/auth/me',{
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      console.log("responsegewgwgewg",response?.data)
      setUser(response.data);
    } catch (error) {
      console.error("Fetch user error:", error.response?.data || error.message);
      // localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosApi.post('/auth/login', { email, password });
      const { token, user } = response.data;
      console.log("response=========>",token, user);
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Login successful!');
      return token;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed');
      return null;
    }
  };
  const register = async (form) => {
    try {
      console.log("register form",form);
      const response = await axiosApi.post('/auth/register', form);
      // const { user } = response.data;
      console.log("response=========>",response.data, user);
      // setUser(user);
      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Registration failed');
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout ,loading ,register}}>
      {children}
    </AuthContext.Provider>
  );
};

