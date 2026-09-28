import Visitor from '../models/Visitor.js';
import VisitorLog from '../models/VisitorLog.js';
import User from '../models/User.js';
import { generateQR } from '../utils/qrGenerator.js';
import { sendNotification } from '../utils/notification.js';





export const getGuards = async (req, res) => {
  try {
    // const { status, search, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = {role: 'guard'};
    
    // if (status) query.status = status;
    // if (search) {
    //   query.$or = [
    //     { name: { $regex: search, $options: 'i' } },
    //     { phone: { $regex: search, $options: 'i' } },
    //     { idNumber: { $regex: search, $options: 'i' } },
    //   ];
    // }
    
    // if (startDate && endDate) {
    //   query.createdAt = {
    //     $gte: new Date(startDate),
    //     $lte: new Date(endDate),
    //   };
    // }


    const guards = await User.find(query).sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      guards,
    //   totalPages: Math.ceil(total / limit),
    //   currentPage: page,
    //   total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGuardById = async (req, res) => {
  try {
    const guard = await User.findById(req.params.id);
    
    if (!guard) {
      return res.status(404).json({ message: 'Guard not found' });
    }
    
    res.json(guard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteGuard = async (req, res) => {
  try {
    const guard = await User.findByIdAndDelete(req.params.id);
    
    if (!guard) {
      return res.status(404).json({ message: 'Guard not found' });
    }
    
    res.json({ message: 'Guard deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};