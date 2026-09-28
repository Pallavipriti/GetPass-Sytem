import twilio from "twilio";

const client = twilio(
  "ACbbf256f25c9d7ec434648b325d3c2326",
  "13d20a97e41ee54f68a433a5203f801f"
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