import PDFDocument from "pdfkit";

export const generateGatePassPDF = (visitor) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // 🎨 HEADER
    doc
      .fillColor("#2E86C1")
      .fontSize(22)
      .text("GATE PASS", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fillColor("black")
      .fontSize(14)
      .text("Society Visitor Management System", { align: "center" });

    doc.moveDown(1.5);

    // 📦 BOX
    doc
      .lineWidth(2)
      .rect(40, 120, 515, 400)
      .stroke();

    // 📌 SECTION TITLE
    doc
      .fontSize(16)
      .fillColor("#1B4F72")
      .text("Visitor Details", 60, 140);

    doc.moveDown();

    // 🧾 DETAILS
    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Name: ${visitor.name}`, 60, 180)
      .text(`Email: ${visitor.email}`, 60, 200)
      .text(`Phone: ${visitor.phone || "N/A"}`, 60, 220)
      .text(`Purpose: ${visitor.purpose}`, 60, 240)
      .text(`Host: ${visitor.hostName || "N/A"}`, 60, 260)
      .text(`Apartment: ${visitor.hostApartment || "N/A"}`, 60, 280)
      .text(`Visit Type: ${visitor.visitType}`, 60, 300)
      .text(`Pass ID: ${visitor.passId}`, 60, 320);
    doc.text(`Date: ${new Date().toLocaleString()}`, 60,340);

    // 🔥 STATUS (BIG + COLORED)
    doc
      .fontSize(18)
      .fillColor(visitor.status === "approved" ? "green" : "red")
      .text(
        `STATUS: ${visitor.status.toUpperCase()}`,
        60,
        360
      );

    // 🔳 QR CODE (if exists)
    if (visitor.qrCode) {
      try {
        doc.image(visitor.qrCode, 400, 180, {
          width: 120,
        });
      } catch (err) {
        console.log("QR not added:", err);
      }
    }

    // ✍️ SIGNATURE AREA
    doc
      .moveTo(60, 460)
      .lineTo(200, 460)
      .stroke();

    doc
      .fontSize(10)
      .text("Authorized Signature", 60, 465);

    // 🏁 FOOTER
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "This is a system-generated gate pass. Please carry valid ID.",
        40,
        550,
        { align: "center" }
      );

    doc.end();
  });
};