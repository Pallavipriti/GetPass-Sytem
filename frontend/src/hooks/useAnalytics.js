import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatDate, getDateRange } from '../utils/helpers';
import axiosApi from '../services/api';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    checkedIn: 0,
    checkedOut: 0,
    preApprovedCount: 0,
    walkInCount: 0,
    weeklyData: [],
    purposeStats: [],
    loading: true,
    error: null,
  });

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [timeframe, setTimeframe] = useState('week'); // 'day', 'week', 'month', 'year'

  // Fetch main analytics data
  const fetchAnalytics = useCallback(async () => {
    setAnalytics(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axiosApi.get('/visitors/analytics');
      
      setAnalytics({
        ...response.data,
        loading: false,
        error: null,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch analytics data',
      }));
      toast.error('Failed to load analytics data');
      throw error;
    }
  }, []);

  // Fetch visitors by date range
  const fetchVisitorsByDateRange = useCallback(async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      
      const response = await axiosApi.get(`/visitors/analytics/range?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching date range data:', error);
      toast.error('Failed to fetch date range data');
      throw error;
    }
  }, []);

  // Fetch visitor trends over time
  const fetchTrends = useCallback(async (days = 30) => {
    try {
      const response = await axiosApi.get(`/visitors/analytics/trends?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast.error('Failed to fetch trend data');
      throw error;
    }
  }, []);

  // Fetch purpose breakdown
  const fetchPurposeBreakdown = useCallback(async () => {
    try {
      const response = await axiosApi.get('/visitors/analytics/purposes');
      return response.data;
    } catch (error) {
      console.error('Error fetching purpose breakdown:', error);
      toast.error('Failed to fetch purpose data');
      throw error;
    }
  }, []);

  // Fetch hourly distribution
  const fetchHourlyDistribution = useCallback(async (date) => {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date.toISOString());
      
      const response = await axiosApi.get(`/visitors/analytics/hourly?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hourly distribution:', error);
      toast.error('Failed to fetch hourly data');
      throw error;
    }
  }, []);

  // Fetch peak hours
  const fetchPeakHours = useCallback(async () => {
    try {
      const response = await axiosApi.get('/visitors/analytics/peak-hours');
      return response.data;
    } catch (error) {
      console.error('Error fetching peak hours:', error);
      toast.error('Failed to fetch peak hours data');
      throw error;
    }
  }, []);

  // Fetch resident stats
  const fetchResidentStats = useCallback(async (residentId) => {
    try {
      const response = await axiosApi.get(`/visitors/analytics/resident/${residentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resident stats:', error);
      toast.error('Failed to fetch resident statistics');
      throw error;
    }
  }, []);

  // Fetch guard performance
  const fetchGuardPerformance = useCallback(async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      
      const response = await axiosApi.get(`/visitors/analytics/guards?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching guard performance:', error);
      toast.error('Failed to fetch guard performance data');
      throw error;
    }
  }, []);

  // Export analytics data as CSV
  const exportAnalytics = useCallback(async (format = 'csv') => {
    try {
      const response = await axiosApi.get(`/visitors/analytics/export?format=${format}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_${formatDate(new Date())}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Analytics exported successfully as ${format.toUpperCase()}`);
      return true;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics data');
      throw error;
    }
  }, []);

  // Update timeframe and fetch data
  const updateTimeframe = useCallback(async (newTimeframe) => {
    setTimeframe(newTimeframe);
    const { start, end } = getDateRange(newTimeframe);
    setDateRange({ startDate: start, endDate: end });
    
    try {
      const data = await fetchVisitorsByDateRange(start, end);
      return data;
    } catch (error) {
      console.error('Error updating timeframe:', error);
      throw error;
    }
  }, [fetchVisitorsByDateRange]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    dateRange,
    timeframe,
    loading: analytics.loading,
    error: analytics.error,
    fetchAnalytics,
    fetchVisitorsByDateRange,
    fetchTrends,
    fetchPurposeBreakdown,
    fetchHourlyDistribution,
    fetchPeakHours,
    fetchResidentStats,
    fetchGuardPerformance,
    exportAnalytics,
    updateTimeframe,
    setTimeframe,
  };
};