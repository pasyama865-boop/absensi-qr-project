import qrcode from 'qrcode';

/**
 * Generate QR Code as a Data URL (base64)
 * The content of the QR code will be the SISWA_ID
 * @param {string} text - The content to be encoded (e.g., Siswa ID)
 * @returns {Promise<string>} - Base64 Data URL of the QR Code image
 */
export const generateQrCode = async (text) => {
    try {
        const qrDataUrl = await qrcode.toDataURL(text, { errorCorrectionLevel: 'H', type: 'image/png' });
        return qrDataUrl;
    } catch (err) {
        console.error('QR Code generation error:', err);
        throw new Error('Failed to generate QR Code');
    }
};