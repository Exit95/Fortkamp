import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL, FROM_EMAIL, isSmtpConfigured } from '../../lib/env';

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

    // Prüfen ob SMTP konfiguriert ist
    if (!isSmtpConfigured()) {
      console.warn('⚠️ SMTP nicht konfiguriert - E-Mail wird nicht gesendet');
      console.warn('SMTP Debug:', { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, hasPassword: !!SMTP_PASS });
      return new Response(JSON.stringify({
        success: false,
        message: 'E-Mail-Versand nicht konfiguriert'
      }), { status: 500 });
    }

    console.log('📧 SMTP Config:', { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER });

    // Create transporter - wie bei Auszeit
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: SMTP_PORT === '465', // String-Vergleich wie bei Auszeit
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    // Email content
    const mailOptions = {
      from: `"Galabau Fortkamp Website" <${FROM_EMAIL}>`,
      to: CONTACT_EMAIL,
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

