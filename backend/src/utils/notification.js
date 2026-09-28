import { sendEmail } from '../config/email.js';

export const sendNotification = async (email, phone, data) => {
  const templates = {
    visitor_request: `
      <h2>Visitor Request</h2>
      <p><strong>${data.visitorName}</strong> has requested to visit you.</p>
      <p>Purpose: ${data.purpose}</p>
      <p>Please login to approve or reject this request.</p>
    `,
    visitor_arrived: `
      <h2>Visitor Arrived</h2>
      <p><strong>${data.visitorName}</strong> has arrived at the gate.</p>
      <p>Check-in time: ${new Date(data.checkInTime).toLocaleString()}</p>
    `,
    visitor_status: `
      <h2>Visitor Request ${data.status}</h2>
      <p>Your visit request has been ${data.status}.</p>
    `,
  };

  if (email) {
    await sendEmail(email, `Gate Pass Notification`, templates[data.type]);
  }
  
  // Add SMS notification here using Twilio if needed
  return true;
};