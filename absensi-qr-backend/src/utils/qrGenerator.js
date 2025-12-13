import qrcode from 'qrcode';

/**
 * 
 * 
 * @param {string} text 
 * @returns {Promise<string>} 
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