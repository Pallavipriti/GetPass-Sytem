import fs from "fs";
// import { sendWhatsAppMessage } from "../utils/sendWhatsApp.js";
import { generateGatePassPDF } from "../utils/generatePdf.js";
import { sendEmailWithPDF } from "../utils/sendEmail.js";
import Visitor from "../models/Visitor.js";
import VisitorLog from "../models/VisitorLog.js";
import User from "../models/User.js";
import { generateQR } from "../utils/qrGenerator.js";
import { sendNotification } from "../utils/notification.js";
import mongoose from "mongoose";

export const addVisitor = async (req, res) => {
  console.log("🚀 [ADD VISITOR] API HIT");
  console.log("📥 Body:", req.body);

  try {
    const {
      name,
      email,
      phone,
      idType,
      idNumber,
      vehicleNumber,
      purpose,
      hostId,
      visitType,
      expectedArrival,
      expectedDeparture,
    } = req.body;

    console.log("🔍 Finding host:", hostId);

    const host = await User.findById(new mongoose.Types.ObjectId(hostId));
    if (!host) {
      console.log("❌ Host not found");
      return res.status(404).json({ message: "Host not found" });
    }

    console.log("✅ Host found:", host.name);

    const visitor = await Visitor.create({
      name,
      email,
      phone,
      idType,
      idNumber,
      vehicleNumber,
      purpose,
      host: hostId,
      hostName: host.name,
      hostApartment: host.apartmentNo,
      visitType,
      expectedArrival,
      expectedDeparture,
      status: visitType === "pre-approved" ? "approved" : "pending",
    });
    if (visitType === "pre-approved") {
      try {
        const pdfBuffer = await generateGatePassPDF(visitor);
        console.log("✅ PDF Generated");

        // ✅ SEND EMAIL
        if (visitor?.email) {
          await sendEmailWithPDF(visitor, pdfBuffer);
          console.log("✅ Email Sent");
        }

        // 🔥 ADD THIS HERE (CREATE FOLDER)
        if (!fs.existsSync("./public")) {
          fs.mkdirSync("./public");
        }

        // ✅ SAVE PDF
        const filePath = `./public/gatepass-${visitor?._id}.pdf`;
        fs.writeFileSync(filePath, pdfBuffer);

        const pdfUrl = `http://localhost:5000/public/gatepass-${visitor?._id}.pdf`;

        // ✅ SEND WHATSAPP
        if (visitor?.phone) {
          // await sendWhatsAppMessage(visitor, pdfUrl);
          console.log("✅ WhatsApp Sent");
        }
      } catch (err) {
        console.error("❌ PDF/Email/WhatsApp Error:", err);
      }

      // Log the action
      await VisitorLog.create({
        visitor: visitor?._id,
        action: "approved",
        performedBy: req.user._id,
        notes: `Visitor approved by ${req.user.name}`,
      });

      // Send notification to visitor
      if (visitor?.email) {
        await sendNotification(visitor?.email, null, {
          type: "visitor_status",
          status: "approved",
          visitorName: visitor?.name,
        });
      }
    }
    console.log("🧾 Visitor created:", visitor?._id);

    // QR
    const qrData = {
      visitorId: visitor?._id,
      name: visitor?.name,
      host: visitor?.hostName,
    };

    console.log("🔳 Generating QR...");
    const qrCode = await generateQR(qrData);

    visitor?.qrCode = qrCode;
    await visitor?.save();

    console.log("✅ QR generated & saved", qrCode);

    // Notification
    console.log("📩 Sending notification to host...");
    await sendNotification(host.email, host.phone, {
      type: "visitor_request",
      visitorName: name,
      purpose,
    });

    console.log("✅ Notification sent");

    res.status(201).json(visitor);
  } catch (error) {
    console.error("❌ ERROR in addVisitor:");
    console.error(error);

    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : null,
    });
  }
};

export const approveVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("approved====", id, status);

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    visitor?.status = status;
    visitor?.approvedBy = req.user._id;
    await visitor?.save();

    try {
      const pdfBuffer = await generateGatePassPDF(visitor);
      console.log("✅ PDF Generated");

      // ✅ SEND EMAIL
      if (visitor?.email) {
        await sendEmailWithPDF(visitor, pdfBuffer);
        console.log("✅ Email Sent");
      }

      // 🔥 ADD THIS HERE (CREATE FOLDER)
      if (!fs.existsSync("./public")) {
        fs.mkdirSync("./public");
      }

      // ✅ SAVE PDF
      const filePath = `./public/gatepass-${visitor?._id}.pdf`;
      fs.writeFileSync(filePath, pdfBuffer);

      const pdfUrl = `http://localhost:5000/public/gatepass-${visitor?._id}.pdf`;

      // ✅ SEND WHATSAPP
      if (visitor?.phone) {
        // await sendWhatsAppMessage(visitor, pdfUrl);
        console.log("✅ WhatsApp Sent");
      }
    } catch (err) {
      console.error("❌ PDF/Email/WhatsApp Error:", err);
    }

    // Log the action
    await VisitorLog.create({
      visitor: visitor?._id,
      action: status === "approved" ? "approved" : "rejected",
      performedBy: req.user._id,
      notes: `Visitor ${status} by ${req.user.name}`,
    });

    // Send notification to visitor
    if (visitor?.email) {
      await sendNotification(visitor?.email, null, {
        type: "visitor_status",
        status,
        visitorName: visitor?.name,
      });
    }

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor?.status !== "approved" && visitor?.status !== "pending") {
      return res.status(400).json({ message: "Visitor cannot check in" });
    }

    visitor?.status = "checked-in";
    visitor?.checkInTime = new Date();
    await visitor?.save();

    await VisitorLog.create({
      visitor: visitor?._id,
      action: "check-in",
      performedBy: req.user._id,
      gate: req.body.gate || "Main Gate",
    });

    // Send notification to host
    const host = await User.findById(visitor?.host);
    await sendNotification(host.email, host.phone, {
      type: "visitor_arrived",
      visitorName: visitor?.name,
      checkInTime: visitor?.checkInTime,
    });

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor?.status !== "checked-in") {
      return res.status(400).json({ message: "Visitor is not checked in" });
    }

    visitor?.status = "checked-out";
    visitor?.checkOutTime = new Date();
    await visitor?.save();

    await VisitorLog.create({
      visitor: visitor?._id,
      action: "check-out",
      performedBy: req.user._id,
      gate: req.body.gate || "Main Gate",
    });

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVisitors = async (req, res) => {
  try {
    const {
      status,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;
    console.log("getVisitors called with query:", req.query);
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { idNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Role-based filtering
    if (req.user.role === "resident") {
      query.host = req.user._id;
    }

    const visitors = await Visitor.find(query)
      .populate("host", "name email phone apartmentNo")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Visitor.countDocuments(query);

    res.json({
      visitors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate("host", "name email phone apartmentNo")
      .populate("approvedBy", "name");

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getGuardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalVisitors,
      checkedIn,
      checkedOut,
      pending,
      todayVisitors,
      recentActivity,
    ] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ status: "checked-in" }),
      Visitor.countDocuments({ status: "checked-out" }),
      Visitor.countDocuments({ status: "pending" }),
      Visitor.countDocuments({ createdAt: { $gte: today } }),
      VisitorLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("visitor", "name phone")
        .populate("performedBy", "name"),
    ]);

    res.json({
      totalVisitors,
      checkedIn,
      checkedOut,
      pending,
      todayVisitors,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
