import React, { useState, useEffect } from 'react';

import { Search, Filter, Eye, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from "react-qr-code";
import axiosApi from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ResidentList = () => {
  const navigate = useNavigate()
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, [filters]);

  const fetchResidents = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const response = await axiosApi.get(`/residents?${params}`);
      setResidents(response.data.residents);
    } catch (error) {
      toast.error('Failed to fetch residents');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      await axiosApi.put(`/residents/${id}/${action}`);
      toast.success(`Resident ${action} successful`);
      fetchResidents();
    } catch (error) {
      toast.error(`Failed to ${action} resident`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      'checked-in': 'bg-blue-100 text-blue-800',
      'checked-out': 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resident Management</h1>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
            
          </select>
        </div>
      </div>
      
      {/* Resident Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartment No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {residents.map((resident) => (
                <tr key={resident._id} className="hover:bg-gray-50"  onClick={() => navigate(`/residents/${resident._id}`)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{resident.name}</div>
                        <div className="text-sm text-gray-500">{resident.idType}: {resident.idNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{resident.phone}</div>
                    <div className="text-sm text-gray-500">{resident.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{resident.apartmentNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{resident.isActive ? 'Active' : 'Inactive'}</div>
                  </td>
                  
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
     
    </div>
  );
};

export default ResidentList;