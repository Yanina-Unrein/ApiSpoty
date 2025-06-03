const nodemailer = require('nodemailer');

// Configuración dinámica del transporter
const getTransporter = () => {
  const service = process.env.EMAIL_SERVICE;
  
  // Configuración para servicios conocidos
  const serviceConfigs = {
    Gmail: {
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
    Outlook: {
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
    SendGrid: {
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    },
    Mailgun: {
      host: process.env.MAILGUN_SMTP_SERVER,
      port: process.env.MAILGUN_SMTP_PORT,
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD
      }
    },
    Mailtrap: {
      host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
      port: process.env.MAILTRAP_PORT || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    }
  };

  // Configuración personalizada si no es un servicio conocido
  if (!serviceConfigs[service]) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return nodemailer.createTransport(serviceConfigs[service]);
};

// Plantilla del email de reseteo
const sendResetEmail = async (email, token, firstName) => {
  try {
    const transporter = getTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Spotify Clone'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Restablece tu contraseña en Spotify Clone',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background-color: #1DB954; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Spotify Clone</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #1DB954;">Hola ${firstName},</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Haz clic en el botón siguiente para continuar:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #1DB954; 
                 color: white; text-decoration: none; border-radius: 500px; font-weight: bold;">
                 Restablecer contraseña
              </a>
            </div>
            
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            <p style="font-size: 12px; color: #777;">
              Este enlace expirará en 1 hora. Si tienes problemas, copia y pega esta URL en tu navegador:<br>
              ${resetUrl}
            </p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            © ${new Date().getFullYear()} Spotify Clone. Todos los derechos reservados.
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de recuperación enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
    throw new Error('No se pudo enviar el email de recuperación');
  }
};

module.exports = { sendResetEmail };