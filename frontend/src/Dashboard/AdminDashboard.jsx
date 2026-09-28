import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import axiosApi from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosApi.get('/analytics/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const weeklyChartData = {
    labels: stats?.weeklyData.map(item => item._id) || [],
    datasets: [
      {
        label: 'Visitors',
        data: stats?.weeklyData.map(item => item.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  };

  const purposeChartData = {
    labels: stats?.purposeStats.map(item => item._id) || [],
    datasets: [
      {
        data: stats?.purposeStats.map(item => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const statsCards = [
    { title: 'Total Visitors', value: stats?.totalVisitors || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Visitors', value: stats?.checkedIn || 0, icon: UserCheck, color: 'bg-green-500' },
    { title: 'Total Residents', value: stats?.totalResidents || 0, icon: Calendar, color: 'bg-purple-500' },
    { title: "Today's Visitors", value: stats?.todayVisitors || 0, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Visitor Trends</h2>
          <Bar data={weeklyChartData} options={{ responsive: true }} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Visit Purpose Distribution</h2>
          <Pie data={purposeChartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;