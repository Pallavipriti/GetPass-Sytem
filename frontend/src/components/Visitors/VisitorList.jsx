import React, { useState, useEffect } from 'react';

import { Search, Filter, Eye, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from "react-qr-code";
import axiosApi from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VisitorList = () => {
  const {user} = useAuth();
  const navigate = useNavigate();
  console.log("user in visitor list", user);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
  });
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, [filters]);

  const fetchVisitors = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await axiosApi.get(`/visitors?${params}`);
      setVisitors(response.data.visitors);
    } catch (error) {
      toast.error('Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, action ,status) => {
    console.log( "handleStatusChange", id,action);
    try {
      await axiosApi.put(`/visitors/${id}/${action}`,{status: status});
      toast.success(`Visitor ${action} successful`);
      fetchVisitors();
    } catch (error) {
      toast.error(`Failed to ${action} visitor`);
    }
  };
  const handleStatusChange2 = async (id, action,status) => {
    console.log( "handleStatusChange", id,action);
    try {
      await axiosApi.patch(`/visitors/${id}/${action}`,{status: status, reason: "Not allowed by host"});
      toast.success(`Visitor ${action} successful`);
      fetchVisitors();
    } catch (error) {
      console.error("Error in handleStatusChange2", error);
      toast.error(`Failed to ${action} visitor`);
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
    <div className="p-6"  >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Visitor Management</h1>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-row md:flex-row gap-4">
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
            <option value="expired">Expired</option>
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
      
      {/* Visitor Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visitors.map((visitor) => (
                <tr key={visitor._id} className="hover:bg-gray-50" onClick={()=>navigate(`/visitors/${visitor._id}`)} >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                        <div className="text-sm text-gray-500">{visitor.idType}: {visitor.idNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{visitor.phone}</div>
                    <div className="text-sm text-gray-500">{visitor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{visitor.hostName}</div>
                    <div className="text-sm text-gray-500">{visitor.hostApartment}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(visitor.status)}`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedVisitor(visitor);
                        setShowQR(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <QrCode size={18} />
                    </button>
                    {visitor.status === 'pending' && (
                      <div className='inline-flex gap-2'>
                      <button
                        onClick={() => handleStatusChange(visitor._id, 'approve' , "approved")}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Approve
                      </button>
                     
                      <button
                        onClick={() => handleStatusChange2(visitor._id, 'reject', "rejected")}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        Reject
                      </button>
                      </div>
                    )}
                    {visitor.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(visitor._id, 'checkin', "checked-in")}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Check In
                      </button>
                    )}
                    {visitor.status === 'checked-in' && (
                      <button
                        onClick={() => handleStatusChange(visitor._id, 'checkout', "checked-out")}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQR && selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Visitor QR Code</h2>
            <div className="flex justify-center mb-4">
              <QRCode value={selectedVisitor.qrCode || JSON.stringify({ visitorId: selectedVisitor._id })} size={200} />
            </div>
            <p className="text-center text-gray-600 mb-4">
              {selectedVisitor.name} - {selectedVisitor.purpose}
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorList;