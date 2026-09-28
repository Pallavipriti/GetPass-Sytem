import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import axiosApi from '../services/api';

export const useResidents = () => {
  const [residents, setResidents] = useState([]);
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch all residents with filters
  const fetchResidents = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.block) params.append('block', filters.block);
      if (filters.ownershipType) params.append('ownershipType', filters.ownershipType);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axiosApi.get(`/residents?${params}`);
      setResidents(response.data.residents);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotal(response.data.total);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch residents');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single resident by ID
  const fetchResident = useCallback(async (id) => {
    try {
      const response = await axiosApi.get(`/residents/${id}`);
      setResident(response.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch resident details');
      throw error;
    }
  }, []);

  // Create new resident
  const createResident = useCallback(async (residentData) => {
    try {
      const response = await axiosApi.post('/residents', residentData);
      toast.success('Resident created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create resident');
      throw error;
    }
  }, []);

  // Update resident details
  const updateResident = useCallback(async (id, residentData) => {
    try {
      const response = await axiosApi.put(`/residents/${id}`, residentData);
      toast.success('Resident updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update resident');
      throw error;
    }
  }, []);

  // Delete resident
  const deleteResident = useCallback(async (id) => {
    try {
      await axiosApi.delete(`/residents/${id}`);
      toast.success('Resident deleted successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resident');
      throw error;
    }
  }, []);

  return {
    residents,
    resident,
    loading,
    totalPages,
    currentPage,
    total,
    fetchResidents,
    fetchResident,
    createResident,
    updateResident,
    deleteResident,
  };
};