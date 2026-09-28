import express from 'express';

import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/roleCheck.js';
import { getResidentById, getResidents  ,deleteResident} from '../controllers/residentController.js';

const residentRouter = express.Router();
residentRouter.use(protect);

residentRouter.get('/',  getResidents);
residentRouter.get('/:id',  getResidentById);
residentRouter.delete('/:id', restrictTo('admin'), deleteResident);



export default residentRouter;