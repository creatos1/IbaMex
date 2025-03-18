
const nodemailer = require('nodemailer');

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "samuelhzd47@gmail.com",
    pass: "yvkb jypt yntq onte"
  },
  debug: true,
  logger: true
});

// Función para enviar código de verificación
const sendVerificationCode = async (email, code) => {
  try {
    console.log('Enviando email a:', email);
    console.log('Usando credenciales:', process.env.EMAIL_USER, 'con contraseña configurada');
    
    const mailOptions = {
      from: `"Servicio de Verificación" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Código de Verificación',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4A55A2;">Código de Verificación</h2>
          <p>Usa el siguiente código para completar tu inicio de sesión:</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expirará en 10 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este correo.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado');
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
};

module.exports = { sendVerificationCode };