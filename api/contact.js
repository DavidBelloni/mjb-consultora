// api/contact.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nombre, email, telefono, mensaje } = req.body;

    try {
      await resend.emails.send({
        from: 'tu-email@tudominio.com', // debe ser un dominio verificado en Resend
        to: 'destinatario@ejemplo.com', // el correo donde querés recibir los mensajes
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
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
