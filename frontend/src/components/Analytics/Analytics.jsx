import React, { useState, useEffect } from 'react';
import {
  Line,
  Bar,
  Pie,
  Doughnut,
} from 'react-chartjs-2';
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
  Filler,
} from 'chart.js';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  Clock,
  BarChart3,
} from 'lucide-react';
import { formatDate, getStatusConfig } from '../../utils/helpers';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Analytics = () => {
  const {
    analytics,
    loading,
    error,
    fetchAnalytics,
    exportAnalytics,
    updateTimeframe,
    timeframe,
  } = useAnalytics();

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAnalytics('csv');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleTimeframeChange = async (newTimeframe) => {
    await updateTimeframe(newTimeframe);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Visitors',
      value: analytics.totalVisitors || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Visitors',
      value: analytics.checkedIn || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: "Today's Visitors",
      value: analytics.todayVisitors || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+8%',
    },
    {
      title: 'Check Outs',
      value: analytics.checkedOut || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+3%',
    },
  ];

  // Weekly data chart
  const weeklyChartData = {
    labels: analytics.weeklyData?.map((item) => item._id) || [],
    datasets: [
      {
        label: 'Total Visitors',
        data: analytics.weeklyData?.map((item) => item.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Pre-Approved',
        data: analytics.weeklyData?.map((item) => item.preApproved) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Walk-in',
        data: analytics.weeklyData?.map((item) => item.walkIn) || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Visitor Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Visitors',
        },
      },
    },
  };

  // Purpose chart data
  const purposeChartData = {
    labels: analytics.purposeStats?.map((item) => item.purpose) || [],
    datasets: [
      {
        data: analytics.purposeStats?.map((item) => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const purposeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Visit Purpose Distribution',
      },
    },
  };

  // Visitor type doughnut chart
  const typeChartData = {
    labels: ['Pre-Approved', 'Walk-in'],
    datasets: [
      {
        data: [analytics.preApprovedCount || 0, analytics.walkInCount || 0],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)'],
        borderWidth: 0,
      },
    ],
  };

  const typeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Visitor Type Split',
      },
    },
  };

  // Status doughnut chart
  const statusChartData = {
    labels: ['Checked In', 'Checked Out', 'Pre-Approved'],
    datasets: [
      {
        data: [
          analytics.checkedIn || 0,
          analytics.checkedOut || 0,
          analytics.preApprovedCount || 0,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Visitor statistics and insights</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
            {['day', 'week', 'month', 'year'].map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-green-600 text-sm mt-2">{stat.change} from last week</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="text-white w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Weekly Trends</h2>
          </div>
          <div className="h-80">
            <Line data={weeklyChartData} options={weeklyChartOptions} />
          </div>
        </div>

        {/* Purpose Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Purpose Distribution</h2>
          </div>
          <div className="h-80">
            <Bar data={purposeChartData} options={purposeChartOptions} />
          </div>
        </div>

        {/* Visitor Type Split */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Visitor Types</h2>
          </div>
          <div className="h-80">
            <Doughnut data={typeChartData} options={typeChartOptions} />
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Status Breakdown</h2>
          </div>
          <div className="h-80">
            <Doughnut data={statusChartData} options={typeChartOptions} />
          </div>
        </div>
      </div>

      {/* Purpose Table */}
      {analytics.purposeStats && analytics.purposeStats.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Purpose Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.purposeStats.map((item, idx) => {
                  const percentage = (item.count / analytics.totalVisitors) * 100;
                  return (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {percentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;