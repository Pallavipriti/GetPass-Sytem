

import User from '../models/User.js';
import Visitor from '../models/Visitor.js';
import VisitorLog from '../models/VisitorLog.js';
import { Parser } from 'json2csv';

// Get main analytics dashboard data
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      Visitors,
      totalVisitors,
      todayVisitors,
      Residents,
      totalResidents,
      checkedIn,
      checkedOut,
      preApprovedCount,
      walkInCount,
      weeklyData,
      purposeStats,
      monthlyData,
    ] = await Promise.all([
      Visitor.find({}),
      Visitor.countDocuments(),
      Visitor.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      User.find({ role: 'resident' }),
      User.countDocuments({ role: 'resident' }),
      Visitor.countDocuments({ status: 'checked-in' }),
      Visitor.countDocuments({ status: 'checked-out' }),
      Visitor.countDocuments({ visitType: 'pre-approved' }),
      Visitor.countDocuments({ visitType: 'walk-in' }),
      Visitor.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            preApproved: {
              $sum: { $cond: [{ $eq: ['$visitType', 'pre-approved'] }, 1, 0] },
            },
            walkIn: {
              $sum: { $cond: [{ $eq: ['$visitType', 'walk-in'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Visitor.aggregate([
        {
          $group: {
            _id: '$purpose',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Visitor.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
    ]);

    res.json({
      Visitors,
      totalVisitors,
      todayVisitors,
      Residents,
      totalResidents,
      checkedIn,
      checkedOut,
      preApprovedCount,
      walkInCount,
      weeklyData,
      purposeStats,
      monthlyData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get visitor trends over time
export const getVisitorTrends = async (req, res) => {
  try {
    const { days = 30, interval = 'day' } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let groupFormat;
    switch (interval) {
      case 'hour':
        groupFormat = { 
          date: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'week':
        groupFormat = { 
          date: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupFormat = { 
          date: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        groupFormat = { 
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const trends = await Visitor.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          preApproved: {
            $sum: { $cond: [{ $eq: ['$visitType', 'pre-approved'] }, 1, 0] },
          },
          walkIn: {
            $sum: { $cond: [{ $eq: ['$visitType', 'walk-in'] }, 1, 0] },
          },
          checkedIn: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-in'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.json(trends);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get visitor purpose breakdown
export const getPurposeBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchCondition = {};
    
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const purposes = await Visitor.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$purpose',
          count: { $sum: 1 },
          avgDuration: {
            $avg: {
              $cond: [
                { $and: ['$checkInTime', '$checkOutTime'] },
                { $subtract: ['$checkOutTime', '$checkInTime'] },
                null,
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Calculate percentages
    const total = purposes.reduce((sum, p) => sum + p.count, 0);
    const purposesWithPercentage = purposes.map(p => ({
      purpose: p._id,
      count: p.count,
      percentage: ((p.count / total) * 100).toFixed(2),
      avgDuration: p.avgDuration ? Math.round(p.avgDuration / (1000 * 60)) : 0, // in minutes
    }));

    res.json(purposesWithPercentage);
  } catch (error) {
    console.error('Purpose breakdown error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get hourly distribution
export const getHourlyDistribution = async (req, res) => {
  try {
    const { date } = req.query;
    let matchCondition = {};
    
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      matchCondition.createdAt = {
        $gte: targetDate,
        $lt: nextDay,
      };
    }

    const hourlyData = await Visitor.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          checkIns: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-in'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing hours with zero
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      checkIns: 0,
    }));
    
    hourlyData.forEach(data => {
      hours[data._id] = {
        hour: data._id,
        count: data.count,
        checkIns: data.checkIns,
      };
    });

    res.json(hours);
  } catch (error) {
    console.error('Hourly distribution error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get peak hours analysis
export const getPeakHours = async (req, res) => {
  try {
    const peakHours = await Visitor.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get average visit duration by hour
    const avgDuration = await Visitor.aggregate([
      {
        $match: {
          checkInTime: { $exists: true },
          checkOutTime: { $exists: true },
        },
      },
      {
        $group: {
          _id: { $hour: '$checkInTime' },
          avgDuration: {
            $avg: { $subtract: ['$checkOutTime', '$checkInTime'] },
          },
        },
      },
    ]);

    res.json({
      peakHours,
      avgDurationByHour: avgDuration,
    });
  } catch (error) {
    console.error('Peak hours error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get resident statistics
export const getResidentStats = async (req, res) => {
  try {
    const { residentId } = req.params;
    
    const [stats, visitors, monthlyBreakdown] = await Promise.all([
      Visitor.aggregate([
        { $match: { host: residentId } },
        {
          $group: {
            _id: null,
            totalVisitors: { $sum: 1 },
            checkedIn: {
              $sum: { $cond: [{ $eq: ['$status', 'checked-in'] }, 1, 0] },
            },
            preApproved: {
              $sum: { $cond: [{ $eq: ['$visitType', 'pre-approved'] }, 1, 0] },
            },
            walkIns: {
              $sum: { $cond: [{ $eq: ['$visitType', 'walk-in'] }, 1, 0] },
            },
          },
        },
      ]),
      Visitor.find({ host: residentId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('visitorName purpose status createdAt'),
      Visitor.aggregate([
        { $match: { host: residentId } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      stats: stats[0] || { totalVisitors: 0, checkedIn: 0, preApproved: 0, walkIns: 0 },
      recentVisitors: visitors,
      monthlyBreakdown,
    });
  } catch (error) {
    console.error('Resident stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get guard performance metrics
export const getGuardPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchCondition = {};
    
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const guardStats = await VisitorLog.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: 'users',
          localField: 'performedBy',
          foreignField: '_id',
          as: 'guard',
        },
      },
      { $unwind: '$guard' },
      {
        $match: { 'guard.role': 'guard' },
      },
      {
        $group: {
          _id: '$performedBy',
          guardName: { $first: '$guard.name' },
          totalActions: { $sum: 1 },
          checkIns: {
            $sum: { $cond: [{ $eq: ['$action', 'check-in'] }, 1, 0] },
          },
          checkOuts: {
            $sum: { $cond: [{ $eq: ['$action', 'check-out'] }, 1, 0] },
          },
          approvals: {
            $sum: { $cond: [{ $eq: ['$action', 'approved'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalActions: -1 } },
    ]);

    res.json(guardStats);
  } catch (error) {
    console.error('Guard performance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get date range analytics
export const getDateRangeAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const data = await Visitor.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          total: { $sum: 1 },
          preApproved: {
            $sum: { $cond: [{ $eq: ['$visitType', 'pre-approved'] }, 1, 0] },
          },
          walkIn: {
            $sum: { $cond: [{ $eq: ['$visitType', 'walk-in'] }, 1, 0] },
          },
          checkedIn: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-in'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.json(data);
  } catch (error) {
    console.error('Date range analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export analytics data
export const exportAnalytics = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const visitors = await Visitor.find(query)
      .populate('host', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    if (format === 'csv') {
      const fields = [
        'visitorName',
        'visitorEmail',
        'visitorContact',
        'purpose',
        'hostName',
        'visitType',
        'status',
        'checkInTime',
        'checkOutTime',
        'createdAt',
      ];
      
      const parser = new Parser({ fields });
      const csv = parser.parse(visitors);
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`analytics_${new Date().toISOString()}.csv`);
      return res.send(csv);
    }
    
    res.json(visitors);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: error.message });
  }
};