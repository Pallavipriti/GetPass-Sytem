import express from 'express';
import {
  getDashboardStats,
  getVisitorTrends,
  getPurposeBreakdown,
  getHourlyDistribution,
  getPeakHours,
  getResidentStats,
  getGuardPerformance,
  getDateRangeAnalytics,
  exportAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/roleCheck.js';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Admin-only routes
router.get('/stats', restrictTo('admin','guard'), getDashboardStats);
router.get('/trends', restrictTo('admin'), getVisitorTrends);
router.get('/purposes', restrictTo('admin'), getPurposeBreakdown);
router.get('/hourly', restrictTo('admin'), getHourlyDistribution);
router.get('/peak-hours', restrictTo('admin'), getPeakHours);
router.get('/guards', restrictTo('admin'), getGuardPerformance);
router.get('/range', restrictTo('admin'), getDateRangeAnalytics);
router.get('/export', restrictTo('admin'), exportAnalytics);

// Resident-specific routes
router.get('/resident/:residentId', restrictTo('admin', 'resident'), getResidentStats);

export default router;