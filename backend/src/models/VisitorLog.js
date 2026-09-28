import mongoose from 'mongoose';

const visitorLogSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true,
  },
  action: {
    type: String,
    enum: ['check-in', 'check-out', 'approved', 'rejected'],
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gate: {
    type: String,
    default: 'Main Gate',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: String,
});

export default mongoose.model('VisitorLog', visitorLogSchema);