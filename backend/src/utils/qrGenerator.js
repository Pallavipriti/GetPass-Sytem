import QRCode from 'qrcode';

export const generateQR = async (data) => {
  try {
    const qrString = JSON.stringify(data);
    const qrCode = await QRCode.toDataURL(qrString);
    return qrCode;
  } catch (error) {
    console.error('QR generation error:', error);
    throw error;
  }
};