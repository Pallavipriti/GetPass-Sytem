import nodemailer from "nodemailer";

export const sendEmailWithPDF = async (visitor, pdfBuffer) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "testing.pallavi16@gmail.com",
      pass: "tobp ynnz vhpk djkp",
    },
  });

const mailOptions = {
  from: "testing.pallavi16@gmail.com" ,//yha-apna-email-dalna
  to: visitor.email,
  subject: `Gate Pass ${visitor.status.toUpperCase()} - ${visitor.name}`,

  // ✅ PROFESSIONAL EMAIL (HTML)
  html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">

    <h2 style="color: #2E86C1;">Gate Pass Notification</h2>

    <p>Dear <strong>${visitor.name}</strong>,</p>

    <p>
      We would like to inform you that your gate pass request has been 
      <strong style="color: ${
        visitor.status === "approved" ? "green" : "red"
      };">
        ${visitor.status.toUpperCase()}
      </strong>.
    </p>

    <p>
      📄 Your gate pass is attached with this email. Please download and carry it during your visit.
    </p>

    <hr style="margin: 20px 0;" />

    <h3>Visitor Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${visitor.name}</li>
      <li><strong>Email:</strong> ${visitor.email}</li>
      <li><strong>Purpose:</strong> ${visitor.purpose}</li>
      <li><strong>Status:</strong> ${visitor.status}</li>
    </ul>

    <p>
      If you have any queries, please contact the resident or security desk.
    </p>

    <p style="margin-top: 30px;">
      Thank you for your cooperation.<br/>
      <strong>Society Management</strong>
    </p>

  </div>
  `,

  // ✅ PDF ATTACHMENT
  attachments: [
    {
      filename: "gatepass.pdf",
      content: pdfBuffer,
    },
  ],
};
  await transporter.sendMail(mailOptions);
};