import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, phone, service, message } = data;

    // Validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Pflichtfelder fehlen' 
      }), { status: 400 });
    }

    // Create transporter
    const port = parseInt(process.env.SMTP_PORT || '587');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.danapfel-digital.de',
      port: port,
      secure: port === 465, // true für 465, false für 587
      auth: {
        user: process.env.SMTP_USER || 'info@galabau-fortkamp.de',
        pass: process.env.SMTP_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: `"Galabau Fortkamp Website" <${process.env.SMTP_USER || 'info@galabau-fortkamp.de'}>`,
      to: 'info@galabau-fortkamp.de',
      replyTo: email,
      subject: `Neue Kontaktanfrage von ${name}`,
      html: `
        <h2>Neue Kontaktanfrage über die Website</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">E-Mail:</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Telefon:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${phone || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Leistung:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${service || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Nachricht:</td>
            <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Diese E-Mail wurde automatisch über das Kontaktformular auf galabau-fortkamp.de gesendet.
        </p>
      `,
      text: `
Neue Kontaktanfrage über die Website

Name: ${name}
E-Mail: ${email}
Telefon: ${phone || '-'}
Leistung: ${service || '-'}

Nachricht:
${message}

---
Diese E-Mail wurde automatisch über das Kontaktformular auf galabau-fortkamp.de gesendet.
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Nachricht erfolgreich gesendet' 
    }), { status: 200 });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Fehler beim Senden der Nachricht' 
    }), { status: 500 });
  }
};

