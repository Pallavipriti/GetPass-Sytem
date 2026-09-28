import express from 'express';

import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/roleCheck.js';
import { getGuards, getGuardById ,deleteGuard} from '../controllers/guardController.js';

const guardRouter = express.Router();
guardRouter.use(protect);

guardRouter.get('/',  getGuards);
guardRouter.get('/:id',  getGuardById);
guardRouter.delete('/:id', restrictTo('admin'), deleteGuard);




export default guardRouter;