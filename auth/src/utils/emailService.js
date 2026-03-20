import nodemailer from 'nodemailer';
import randomstring from 'randomstring';

export default class EmailService {
  static async sendVerificationCode(email) {
    // Verificar que todas las variables de entorno necesarias estén definidas
    const requiredEnvVars = [
      'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'
    ];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error(`Error: Variables de entorno faltantes: ${missingVars.join(', ')}`);
      throw new Error(`Configuración de correo incompleta. Faltan: ${missingVars.join(', ')}`);
    }
    
    // Generar código de verificación
    const verificationCode = randomstring.generate({
      length: 6,
      charset: 'numeric'
    });

    // Configurar el transporte de correo con SMTP simple
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Plantilla HTML mejorada para el correo
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Código de Verificación</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center;">
          <p style="font-size: 16px;">Su código de verificación es:</p>
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 20px 0;">${verificationCode}</h1>
          <p style="color: #666;">Este código expirará en 10 minutos.</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          Si no solicitó este código, puede ignorar este correo.
        </p>
      </div>
    `;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Ketoffee',
        address: process.env.EMAIL_FROM
      },
      to: email,
      subject: 'Código de Verificación para Recuperación de Contraseña',
      text: `Su código de verificación es: ${verificationCode}. Este código expirará en 10 minutos.`,
      html: htmlTemplate
    };
    
    try {
      // Verificar conexión antes de enviar
      await transporter.verify();
      
      // Enviar el correo
      await transporter.sendMail(mailOptions);
      
      // Retornar el código y su tiempo de expiración
      return {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos desde ahora
      };
    } catch (error) {
      console.error('Error enviando correo de verificación:', error);
      throw new Error('No se pudo enviar el código de verificación');
    }
  }
}