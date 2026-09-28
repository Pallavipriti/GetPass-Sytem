import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, QrCode, PlusCircle, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosApi from '../services/api';

const GuardDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    Visitors:[],
    totalVisitors: 0,
    checkedIn: 0,
    checkedOut: 0,
    pending: 0,
    todayVisitors: 0,
  });
  console.log("stats",stats);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch visitors data
   const visitorsResponse = await axiosApi.get('/analytics/stats');
   console.log("dashboard stats",visitorsResponse.data);
      setStats(visitorsResponse.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (visitorId) => {
    try {
      await axiosApi.put(`/visitors/${visitorId}/checkin`, { gate: 'Main Gate' });
      toast.success('Visitor checked in successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in visitor');
    }
  };

  const handleCheckOut = async (visitorId) => {
    try {
      await axiosApi.put(`/visitors/${visitorId}/checkout`, { gate: 'Main Gate' });
      toast.success('Visitor checked out successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out visitor');
    }
  };

  const handleQRScan = async () => {
    if (!qrData.trim()) {
      toast.error('Please enter or scan QR code');
      return;
    }
    
    try {
      // Parse QR data (assuming it contains visitor ID)
      let visitorId;
      try {
        const parsed = JSON.parse(qrData);
        visitorId = parsed.visitorId;
      } catch {
        visitorId = qrData; // If not JSON, treat as direct ID
      }
      
      // Fetch visitor details
      const response = await axiosApi.get(`/visitors/${visitorId}`);
      const visitor = response.data;
      
      if (visitor.status === 'checked-in') {
        await handleCheckOut(visitorId);
      } else if (visitor.status === 'approved' || visitor.status === 'pending') {
        await handleCheckIn(visitorId);
      } else {
        toast.error(`Visitor cannot be checked in/out. Current status: ${visitor.status}`);
      }
      
      setQrData('');
      setScanning(false);
    } catch (error) {
      toast.error('Invalid QR code or visitor not found');
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

  const formatTime = (date) => {
    if (!date) return 'Not yet';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const statsCards = [
    { 
      title: 'Total Visitors', 
      value: stats.totalVisitors, 
      icon: Users, 
      color: 'bg-blue-500',
      subtitle: 'All time visitors'
    },
    { 
      title: 'Checked In', 
      value: stats.checkedIn, 
      icon: UserCheck, 
      color: 'bg-green-500',
      subtitle: 'Currently on premises'
    },
    { 
      title: 'Checked Out', 
      value: stats.checkedOut, 
      icon: UserX, 
      color: 'bg-red-500',
      subtitle: 'Completed visits'
    },
    { 
      title: "Today's Visitors", 
      value: stats.todayVisitors, 
      icon: TrendingUp, 
      color: 'bg-orange-500',
      subtitle: 'Visits today'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Guard Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at the gate today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Add Visitor Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Add New Visitor</h2>
                <p className="text-blue-100 mb-4">Register a new visitor walk-in or pre-approved</p>
                <button 
                  onClick={() => navigate("/add-visitor")}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  Create New Entry
                </button>
              </div>
              <PlusCircle size={48} className="opacity-50" />
            </div>
          </div>

          {/* Scan QR Card */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Scan QR Code</h2>
                <p className="text-purple-100 mb-4">Quick check-in/out using QR code scanner</p>
                <button 
                  onClick={() => setScanning(!scanning)}
                  className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center gap-2"
                >
                  <QrCode size={18} />
                  {scanning ? 'Close Scanner' : 'Open Scanner'}
                </button>
              </div>
              <QrCode size={48} className="opacity-50" />
            </div>
          </div>
        </div>

        {/* QR Scanner Modal */}
        {scanning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">QR Code Scanner</h3>
                <button 
                  onClick={() => setScanning(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <QrCode size={64} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Enter QR code data or scan using device camera</p>
                </div>
                <input
                  type="text"
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder="Paste QR code data here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleQRScan}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Process QR Code
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Tip: You can also manually enter the visitor ID or QR data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Visitors Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Recent Visitors</h2>
              <button 
                onClick={() => navigate("/visitors")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host/Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.Visitors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No visitors found
                    </td>
                  </tr>
                ) : (
                  stats?.Visitors.map((visitor) => (
                    <tr key={visitor._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                            <div className="text-sm text-gray-500">{visitor.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.hostName || visitor.purpose}</div>
                        <div className="text-sm text-gray-500">
                          {visitor.hostApartment && `Apt: ${visitor.hostApartment}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {visitor.checkInTime ? formatTime(visitor.checkInTime) : 'Not checked in'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {visitor.checkInTime ? 'Active' : 'Waiting'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(visitor.status)}`}>
                          {visitor.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {visitor.status === 'approved' && (
                          <button
                            onClick={() => handleCheckIn(visitor._id)}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition text-xs font-medium"
                          >
                            Check In
                          </button>
                        )}
                        {visitor.status === 'checked-in' && (
                          <button
                            onClick={() => handleCheckOut(visitor._id)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition text-xs font-medium"
                          >
                            Check Out
                          </button>
                        )}
                        {visitor.status === 'pending' && (
                          <span className="text-yellow-600 text-xs">Awaiting Approval</span>
                        )}
                        {visitor.status === 'checked-out' && (
                          <span className="text-gray-500 text-xs">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Check-in Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalVisitors ? Math.round((stats.checkedIn / stats.totalVisitors) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Activity</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayVisitors}</p>
              </div>
              <Users className="text-green-500" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardDashboard;