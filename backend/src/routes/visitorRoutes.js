import express from 'express';
import {
  addVisitor,
  approveVisitor,
  checkIn,
  checkOut,
  getVisitors,
  getVisitorById,
} from '../controllers/visitorController.js';
import { protect  } from '../middleware/auth.js';
import { restrictTo } from '../middleware/roleCheck.js';

import {
  denyVisitor,
  getPendingVisitors,
  verifyPassAtGate,
  getVerificationSummary,
  registerWalkIn,
} from '../controllers/Verificationcontroller.js';

const visitorRouter = express.Router();
visitorRouter.use(protect);

visitorRouter.post('/add-visitors', restrictTo('admin', 'guard','resident'), addVisitor);
visitorRouter.get('/', restrictTo('admin', 'guard','resident'), getVisitors);
visitorRouter.get('/:id', restrictTo('admin', 'guard','resident'), getVisitorById);
visitorRouter.put('/:id/approve', restrictTo('admin', 'resident' ,'guard'), approveVisitor);
visitorRouter.put('/:id/checkin', restrictTo('admin', 'guard'), checkIn);
visitorRouter.put('/:id/checkout', restrictTo('admin', 'guard'), checkOut);
visitorRouter.get('/analytics', restrictTo('admin'), getVisitors);
// visitorRouter.put('/:id/status', restrictTo('admin', 'guard' , 'resident'), approveVisitor);
visitorRouter.get('/getvisitor/:id', restrictTo('admin','resident'), approveVisitor);
visitorRouter.get('/pass/:id', restrictTo('admin','guard','resident'), verifyPassAtGate);
visitorRouter.post('/walkin', restrictTo('admin', 'guard'), registerWalkIn);
visitorRouter.patch('/:id/reject', restrictTo('admin','resident','guard'), denyVisitor);
visitorRouter.get('/summary', restrictTo('admin', 'guard'), getVerificationSummary);



export default visitorRouter;