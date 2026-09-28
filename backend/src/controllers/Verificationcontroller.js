// controllers/verificationController.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles the full verification flow for visitor passes:
//
//  PRE-APPROVED flow:
//    Resident/Admin creates pass in advance → status = "pre-approved"
//    Guard scans QR at gate → checks in directly
//
//  PENDING (Walk-in) flow:
//    Guard registers walk-in at gate → status = "pending"
//    Notification sent to host (resident)
//    Host approves  → status = "pre-approved" → guard checks in
//    Host denies    → status = "rejected"        → visitor turned away
//    Auto-expires   → status = "expired"       if host doesn't respond in time
// ─────────────────────────────────────────────────────────────────────────────

import Visitor from '../models/Visitor.js';
import VisitorLog from '../models/VisitorLog.js';
import User from '../models/User.js';
import { 
  sendNotification, 
//   sendApprovalNotification, 
//   sendDenialNotification 
} from '../utils/notification.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ═════════════════════════════════════════════════════════════════════════════
// @desc    Register a WALK-IN (pending) visitor at the gate
// @route   POST /api/verify/walkin
// @access  Guard, Admin
//
// What it does:
//   1. Creates a new visitor with status = "pending"
//   2. Tries to find the host user in the DB by name/email
//   3. Sends a verification request notification to the host
//   4. Returns the created visitor so the guard can show the pending screen
// ═════════════════════════════════════════════════════════════════════════════
export const registerWalkIn = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    email,
    purpose,
    hostName,
    hostDepartment,
    photo,
    vehicleNumber,
    idProofType,
    idProofNumber,
    comments,
  } = req.body;

  // Basic validation
  if (!name || !phone || !purpose || !hostName) {
    return res.status(400).json({
      success: false,
      message: 'name, phone, purpose, and hostName are required.',
    });
  }

  // Create the visitor with status = "pending"
  const visitor = await Visitor.create({
    name,
    phone,
    email: email || '',
    purpose,
    hostName,
    hostDepartment: hostDepartment || '',
    photo: photo || null,
    vehicleNumber: vehicleNumber || '',
    idProofType: idProofType || '',
    idProofNumber: idProofNumber || '',
    comments: comments || '',
    visitorType: 'walk-in',
    status: 'pending',          // ← key difference from pre-approved
    expectedDate: new Date(),
    createdBy: req.user._id,
    securityPersonnel: req.user._id,

    // Pass expires in 2 hours if host never responds
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  });

  // Try to find the host user in the database to notify them
  // Match by name (case-insensitive) — or you can match by flat/department
  const hostUser = await User.findOne({
    name: { $regex: new RegExp(`^${hostName.trim()}$`, 'i') },
    role: 'resident',
    isActive: true,
  });

  // Send notification to host if found and they have an email
  if (hostUser?.email) {
    sendVerificationRequest(visitor, hostUser).catch((err) =>
      console.error('Verification email failed:', err.message)
    );
    visitor.approvedBy = hostUser._id; // tentatively link the host
    await visitor.save();
  }

  // Populate for a richer response
  await visitor.populate('createdBy', 'name role');

  res.status(201).json({
    success: true,
    message: hostUser
      ? `Walk-in registered. Verification request sent to ${hostUser.name}.`
      : 'Walk-in registered. Host not found in system — manual approval needed.',
    hostNotified: !!hostUser?.email,
    visitor,
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// @desc    Approve a PENDING visitor
// @route   PATCH /api/verify/:id/approve
// @access  Resident (host), Admin
//
// What it does:
//   1. Finds the visitor by ID, ensures status is "pending"
//   2. Verifies the requester is the host or an admin
//   3. Changes status → "pre-approved"
//   4. Records who approved and when
//   5. Sends approval confirmation to the guard (via socket or polling)
//   6. Sends SMS/email to visitor if contact available
// ═════════════════════════════════════════════════════════════════════════════
export const approveVisitor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body; // optional approval note

  const visitor = await Visitor.findById(id).populate('createdBy', 'name role');

  if (!visitor) {
    return res.status(404).json({ success: false, message: 'Visitor pass not found.' });
  }

  // Only pending visitors can be approved
  if (visitor.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Cannot approve a visitor with status "${visitor.status}". Only "pending" visitors can be approved.`,
    });
  }

  // Authorization check:
  // - Admin can approve anyone
  // - Resident can only approve if they are the listed host (matched by name)
  const isAdmin = req.user.role === 'admin';
  const isHost = req.user.role === 'resident' &&
    visitor.hostName.trim().toLowerCase() === req.user.name.trim().toLowerCase();

  if (!isAdmin && !isHost) {
    return res.status(403).json({
      success: false,
      message: 'Only the listed host or an admin can approve this visitor.',
    });
  }

  // Update the visitor record
  visitor.status = 'pre-approved';
  visitor.approvedBy = req.user._id;
  visitor.approvedAt = new Date();           // custom field — add to schema if needed
  if (remarks) visitor.comments = `${visitor.comments ? visitor.comments + ' | ' : ''}Approval note: ${remarks}`;

  // Reset expiry — give them a full 24 hours from approval
  visitor.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await visitor.save();
  await visitor.populate('approvedBy', 'name role');

  // Notify visitor (if email available)
  if (visitor.email) {
    sendNotification(visitor).catch((err) =>
      console.error('Approval email failed:', err.message)
    );
  }

  res.json({
    success: true,
    message: `${visitor.name} has been approved. The guard can now check them in.`,
    visitor,
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// @desc    Deny a PENDING visitor
// @route   PATCH /api/verify/:id/deny
// @access  Resident (host), Admin
//
// What it does:
//   1. Finds the visitor, ensures status is "pending"
//   2. Same authorization check as approve
//   3. Changes status → "rejected"
//   4. Records denial reason (denialReason is important for audit trail)
//   5. Notifies visitor if email available
// ═════════════════════════════════════════════════════════════════════════════
export const denyVisitor = asyncHandler(async (req, res) => {
  console.log("denyVisitor called with params:", req.params.id, "and body:", req.body);
  const { id } = req.params;
  const { reason } = req.body;



  const visitor = await Visitor.findById(id).populate('createdBy', 'name role');

  if (!visitor) {
    return res.status(404).json({ success: false, message: 'Visitor pass not found.' });
  }

  if (visitor.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Cannot deny a visitor with status "${visitor.status}". Only "pending" visitors can be rejected.`,
    });
  }

  // Same authorization check as approve
  const isAdmin = req.user.role === 'admin';
  const isGuard = req.user.role === 'guard';
  const isHost = req.user.role === 'resident' &&
    visitor.hostName.trim().toLowerCase() === req.user.name.trim().toLowerCase();

  if (!isAdmin && !isGuard && !isHost) {
    return res.status(403).json({
      success: false,
      message: 'Only the listed host or guard or an admin can deny this visitor.',
    });
  }

  visitor.status = 'rejected';
  visitor.approvedBy = req.user._id;
  visitor.rejectedAt = new Date();           // custom field — add to schema if needed
  visitor.rejectionReason = reason.trim();        // custom field — add to schema if needed
  visitor.comments = `${visitor.comments ? visitor.comments + ' | ' : ''}Rejected: ${reason.trim()}`;

  await visitor.save();
  await visitor.populate('approvedBy', 'name role');

  // Notify visitor of denial if email available
  if (visitor.email) {
    sendNotification(visitor, reason).catch((err) =>
      console.error('Denial email failed:', err.message)
    );
  }

  res.json({
    success: true,
    message: `${visitor.name} has been rejected entry. Guard has been notified.`,
    visitor,
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// @desc    Get all PENDING visitors (for the host/resident's approval queue)
// @route   GET /api/verify/pending
// @access  Resident, Admin
//
// What it does:
//   - Admin sees ALL pending visitors
//   - Resident sees only pending visitors where hostName matches their name
//   This is the "inbox" for hosts — they see who is waiting at the gate for them
// ═════════════════════════════════════════════════════════════════════════════
export const getPendingVisitors = asyncHandler(async (req, res) => {
  let query = { status: 'pending' };

  // Date filtering
  const { startDate, endDate } = req.query;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Residents only see their own pending visitors
  if (req.user.role === 'resident') {
    query.hostName = { $regex: new RegExp(`^${req.user.name.trim()}$`, 'i') };
  }

  const visitors = await Visitor.find(query)
    .populate('createdBy', 'name role')
    .populate('securityPersonnel', 'name')
    .sort({ createdAt: -1 }); // newest first — most urgent

  res.json({
    success: true,
    count: visitors.length,
    visitors,
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// @desc    Verify a PRE-APPROVED visitor at the gate (guard scans QR)
// @route   POST /api/verify/scan
// @access  Guard, Admin
//
// What it does:
//   1. Receives the passId from QR scan
//   2. Finds visitor and validates they are pre-approved and not expired
//   3. Returns full visitor details for the guard to review
//   4. Guard can then hit the /checkin endpoint
//
//   This is separate from check-in — it is the "lookup + display" step
//   before the guard physically confirms entry
// ═════════════════════════════════════════════════════════════════════════════
export const verifyPassAtGate = asyncHandler(async (req, res) => {
  console.log("req.params.id",req.params.id);
  const  passId  = req.params.id;

  if (!passId || !passId.trim()) {
    return res.status(400).json({ success: false, message: 'passId is required.' });
  }

  const visitor = await Visitor.findOne({ passId: passId.trim().toUpperCase() })
    .populate('createdBy', 'name role email')
    .populate('securityPersonnel', 'name');

  if (!visitor) {
    return res.status(404).json({
      success: false,
      message: 'No visitor pass found with this ID. Check the pass ID and try again.',
    });
  }

  // ── Gate logic: what can the guard actually do? ───────────────────────────
  const now = new Date();
  let gateDecision = '';
  let canCheckIn = false;
  let canCheckOut = false;

  switch (visitor.status) {
    case 'pre-approved':
      if (now > visitor.expiresAt) {
        // Pass expired — update status
        visitor.status = 'expired';
        await visitor.save();
        gateDecision = 'DENY — Pass has expired.';
      } else {
        gateDecision = 'ALLOW — Visitor is pre-approved. Proceed with check-in.';
        canCheckIn = true;
      }
      break;

    case 'pending':
      gateDecision = 'HOLD — Awaiting host approval. Ask visitor to wait.';
      break;

    case 'checked-in':
      gateDecision = 'INSIDE — Visitor is already checked in. Proceed with check-out if leaving.';
      canCheckOut = true;
      break;

    case 'checked-out':
      gateDecision = 'DONE — Visitor has already completed their visit.';
      break;

    case 'rejected':
      gateDecision = `DENY — Entry was rejected. Reason: ${visitor.rejectionReason || 'Not specified'}`;
      break;

    case 'expired':
      gateDecision = 'DENY — Pass has expired. A new pass must be created.';
      break;

    default:
      gateDecision = 'UNKNOWN — Contact admin.';
  }

  res.json({
    success: true,
    gateDecision,   // clear human-readable instruction for the guard screen
    canCheckIn,
    canCheckOut,
    visitor,
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// @desc    Get verification summary (for the guard dashboard live panel)
// @route   GET /api/verify/summary
// @access  Guard, Admin
//
// Returns counts of each status — useful for the guard's at-a-glance panel
// ═════════════════════════════════════════════════════════════════════════════
export const getVerificationSummary = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [pending, preApproved, checkedIn, rejected, todayTotal] = await Promise.all([
    Visitor.countDocuments({ status: 'pending' }),
    Visitor.countDocuments({ status: 'pre-approved' }),
    Visitor.countDocuments({ status: 'checked-in' }),
    Visitor.countDocuments({ status: 'rejected', createdAt: { $gte: today, $lte: todayEnd } }),
    Visitor.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
  ]);

  res.json({
    success: true,
    summary: {
      pending,        // currently waiting for host approval
      preApproved,    // approved, not yet arrived
      checkedIn,      // currently inside
      rejected,         // rejected today
      todayTotal,     // all visitors today
    },
  });
});