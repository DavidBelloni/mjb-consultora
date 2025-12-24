// api/contact.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Función para validar el token de reCAPTCHA con Google
async function verifyCaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secret}&response=${token}`
  });
  return response.json();
}

export default async function handler(req, res) {
  // Configurar CORS 
  res.setHeader("Access-Control-Allow-Origin", "https://v2.mjbconsultora.com.ar"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS"); 
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Manejar preflight (OPTIONS) 
  if (req.method === "OPTIONS") { 
    return res.status(200).end(); 
  }
  
  if (req.method === 'POST') {
    const { nombre, email, telefono, mensaje, website, token } = req.body;

    console.log("Token recibido en backend:", token);
    
    // Honeypot: si el campo oculto tiene contenido → spam
    if (website && website.trim() !== "") {
      return res.status(400).json({ error: "Detección de spam (honeypot)" });
    }

    // Verificación reCAPTCHA
    const captcha = await verifyCaptcha(token);
    if (!captcha.success) {
      return res.status(400).json({ error: "Captcha inválido" });
    }

    try {
      // Envío del correo con Resend
      await resend.emails.send({
        from: 'contactform@mjbconsultora.com.ar',
        to: 'info@mjbconsultora.com.ar',
        subject: `Nuevo mensaje de ${nombre}`,
        html: `
          <h2>Nuevo mensaje desde el formulario de contacto</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono || 'No especificado'}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje}</p>
        `
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error al enviar correo:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

