import express from 'express';
import { registerUser, login, getMe ,getUsers } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', login);
authRouter.get('/me', protect, getMe);
authRouter.get('/users', getUsers);


export default authRouter;