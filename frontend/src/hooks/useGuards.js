import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import axiosApi from '../services/api';

export const useGuards = () => {
  const [guards, setGuards] = useState([]);
  const [guard, setGuard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch all guards with filters
  const fetchGuards = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.shift) params.append('shift', filters.shift);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axiosApi.get(`/guards?${params}`);
      setGuards(response.data.guards);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotal(response.data.total);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch guards');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single guard by ID
  const fetchGuard = useCallback(async (id) => {
    try {
      const response = await axiosApi.get(`/guards/${id}`);
      setGuard(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch guard details');
      throw error;
    }
  }, []);

  // Create new guard
  const createGuard = useCallback(async (guardData) => {
    try {
      const response = await axiosApi.post('/guards', guardData);
      toast.success('Guard created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create guard');
      throw error;
    }
  }, []);

  // Update guard details
  const updateGuard = useCallback(async (id, guardData) => {
    try {
      const response = await axiosApi.put(`/guards/${id}`, guardData);
      toast.success('Guard updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update guard');
      throw error;
    }
  }, []);

  // Delete guard
  const deleteGuard = useCallback(async (id) => {
    try {
      await axiosApi.delete(`/guards/${id}`);
      toast.success('Guard deleted successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete guard');
      throw error;
    }
  }, []);

  return {
    guards,
    guard,
    loading,
    totalPages,
    currentPage,
    total,
    fetchGuards,
    fetchGuard,
    createGuard,
    updateGuard,
    deleteGuard,
  };
};