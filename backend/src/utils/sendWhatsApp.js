import twilio from "twilio";


const client = twilio(
process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsAppMessage = async (visitor) => {
  try {
    // ✅ Fix phone number (removes +91, spaces, etc.)
    const phone = visitor.phone.replace(/\D/g, "");

    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${phone}`,

      // ✅ PROFESSIONAL MESSAGE
      body: `Hello ${visitor.name},

We would like to inform you that your gate pass request has been *${visitor.status.toUpperCase()}*.

📄 A detailed gate pass has been shared with you via email. Kindly check your inbox.

We appreciate your cooperation.

Best regards,  
Society Management`
    });

    console.log("✅ WhatsApp sent:", message.sid);

  } catch (err) {
    console.error("❌ WhatsApp error:", err);
  }
};