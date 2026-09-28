import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import axiosApi from '../services/api';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch all visitors with filters
  const fetchVisitors = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axiosApi.get(`/visitors?${params}`);
      setVisitors(response.data.visitors);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotal(response.data.total);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch visitors');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single visitor by ID
  const fetchVisitor = useCallback(async (id) => {
    try {
      const response = await axiosApi.get(`/visitors/${id}`);
      setVisitor(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch visitor details');
      throw error;
    }
  }, []);

  // Scan pass by ID
  const scanPass = useCallback(async (passId) => {
    console.log("scanPass called with passId:", passId);
    try {
      const response = await axiosApi.get(`/visitors/pass/${passId}`);
      console.log("response",response);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pass not found');
      throw error;
    }
  }, []);

  // Create new visitor
  const createVisitor = useCallback(async (visitorData) => {
    try {
      const response = await axiosApi.post('/visitors', visitorData);
      toast.success('Visitor created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create visitor');
      throw error;
    }
  }, []);

  // Check in visitor
  const checkIn = useCallback(async (id) => {
    try {
      const response = await axiosApi.put(`/visitors/${id}/status`, { status: 'checked-in' });
      toast.success('Visitor checked in successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
      throw error;
    }
  }, []);

  // Check out visitor
  const checkOut = useCallback(async (id) => {
    try {
      const response = await axiosApi.put(`/visitors/${id}/status`, { status: 'checked-out' });
      toast.success('Visitor checked out successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
      throw error;
    }
  }, []);

  // Delete visitor
  const deleteVisitor = useCallback(async (id) => {
    try {
      await axiosApi.delete(`/visitors/${id}`);
      toast.success('Visitor deleted successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete visitor');
      throw error;
    }
  }, []);

  // Update visitor status
  const updateStatus = useCallback(async (id, status) => {
    try {
      const response = await axiosApi.put(`/visitors/${id}/status`, { status });
      toast.success(`Visitor ${status} successfully`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed');
      throw error;
    }
  }, []);

  return {
    visitors,
    visitor,
    loading,
    totalPages,
    currentPage,
    total,
    fetchVisitors,
    fetchVisitor,
    scanPass,
    createVisitor,
    checkIn,
    checkOut,
    deleteVisitor,
    updateStatus,
  };
};