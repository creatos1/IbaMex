
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Generar un secreto MFA para un usuario
const generateMfaSecret = (username) => {
  const secret = speakeasy.generateSecret({
    name: `UTASOFT:${username}`
  });
  
  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url
  };
};

// Generar un código MFA temporal
const generateMfaToken = (secret) => {
  return speakeasy.totp({
    secret,
    encoding: 'base32'
  });
};

// Verificar un código MFA
const verifyMfaToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1 // Permitir ventana de 1 periodo para compensar posibles desincronizaciones
  });
};

// Generar un QR code como data URL para configurar aplicaciones MFA
const generateQRCode = async (otpAuthUrl) => {
  try {
    return await qrcode.toDataURL(otpAuthUrl);
  } catch (error) {
    console.error('Error al generar QR code:', error);
    throw error;
  }
};

module.exports = {
  generateMfaSecret,
  generateMfaToken,
  verifyMfaToken,
  generateQRCode
};
