import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const visitorSchema = new mongoose.Schema({
    // ── Visitor Basic Info ──────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    
    // ── ID Proof Details ────────────────────────────────────────────────────
    idType: {
      type: String,
      enum: ['Aadhar', 'Driving License', 'Passport', 'Voter ID', 'Other'],
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
    },
    
    // ── Vehicle & Photo ─────────────────────────────────────────────────────
    vehicleNumber: {
      type: String,
    },
    photo: {
      type: String, // URL to stored photo
    },
    
    // ── Visit Details ───────────────────────────────────────────────────────
    purpose: {
      type: String,
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hostName: String,
    hostApartment: String,
    
    // ── Visit Type & Status ─────────────────────────────────────────────────
    visitType: {
      type: String,
      enum: ['pre-approved', 'walk-in'],
      default: 'pre-approved',
    },
    status: {
      type: String,
      enum: ['pending', 'pre-approved',"approved", 'checked-in', 'checked-out', 'expired', 'rejected'],
      default: 'pending',
    },
    
    // ── QR Code ────────────────────────────────────────────────────────────
    qrCode: {
      type: String,
    },
    
    // ── Timestamps ──────────────────────────────────────────────────────────
    checkInTime: Date,
    checkOutTime: Date,
    expectedArrival: Date,
    expectedDeparture: Date,
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    
    // ── Personnel Tracking ──────────────────────────────────────────────────
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    securityPersonnel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // ── Pass Identification ─────────────────────────────────────────────────
    passId: {
      type: String,
      unique: true,
      default: () => `GP-${uuidv4().slice(0, 8).toUpperCase()}`,
    },
    
    // ── Additional Info ─────────────────────────────────────────────────────
    rejectionReason: { type: String, trim: true, default: "" },
    
    // ── Auto-expiry & Notifications ─────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    notificationSent: { type: Boolean, default: false },
    
    // ── System Fields ───────────────────────────────────────────────────────
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// ── Indexes ────────────────────────────────────────────────────────────────

// TTL Index - Auto-expire based on createdAt (24 hours)
// Note: MongoDB only allows one TTL index per collection
// If you want to use expiresAt instead, comment this line and uncomment the expiresAt index
visitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Alternative TTL using expiresAt (uncomment if you prefer this)
// visitorSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Text search index for better search capabilities
visitorSchema.index({
  name: "text",
  phone: "text",
  hostName: "text",
  passId: "text",
  email: "text",
});

// Filter indexes for better query performance
visitorSchema.index({ status: 1 });
visitorSchema.index({ host: 1 });
visitorSchema.index({ createdBy: 1 });
visitorSchema.index({ visitType: 1 });
visitorSchema.index({ checkInTime: 1 });
visitorSchema.index({ checkOutTime: 1 });

// Compound indexes for common queries
visitorSchema.index({ status: 1, checkInTime: 1 });
visitorSchema.index({ host: 1, status: 1 });
visitorSchema.index({ createdBy: 1, createdAt: -1 });

// ── Virtuals ───────────────────────────────────────────────────────────────
visitorSchema.virtual('isActive').get(function() {
  return this.status === 'checked-in' || this.status === 'approved';
});

visitorSchema.virtual('duration').get(function() {
  if (this.checkInTime && this.checkOutTime) {
    return (this.checkOutTime - this.checkInTime) / (1000 * 60); // minutes
  }
  return null;
});

// ── Methods ─────────────────────────────────────────────────────────────────
visitorSchema.methods.canCheckIn = function() {
  return ['pending', 'approved', 'pre-approved'].includes(this.status);
};

visitorSchema.methods.canCheckOut = function() {
  return this.status === 'checked-in';
};

visitorSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// ── Statics ─────────────────────────────────────────────────────────────────
visitorSchema.statics.getActiveVisitors = function() {
  return this.find({ status: 'checked-in' });
};

visitorSchema.statics.getTodayVisitors = function() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
};

visitorSchema.statics.getVisitorsByStatus = function(status) {
  return this.find({ status }).populate('host', 'name email phone');
};

visitorSchema.statics.getExpiredVisitors = function() {
  return this.find({
    expiresAt: { $lt: new Date() },
    status: { $nin: ['checked-out', 'expired'] }
  });
};

export default mongoose.model('Visitor', visitorSchema);