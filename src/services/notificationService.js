function formatInquiryText(inquiry) {
  const lines = [
    'New Contact Inquiry',
    `Name: ${inquiry?.name || ''}`,
    `Email: ${inquiry?.email || ''}`,
    `Phone: ${inquiry?.phone || ''}`,
    `Source: ${inquiry?.source || ''}`,
    '',
    `${inquiry?.message || ''}`,
  ];
  return lines.join('\n');
}

function formatAppointmentText(appointment) {
  const date = appointment?.preferred_date || appointment?.date || '';
  const time = appointment?.preferred_time || appointment?.time || '';
  const reason = appointment?.notes || appointment?.reason || '';

  const lines = [
    'New Appointment Request',
    `Name: ${appointment?.name || ''}`,
    `Email: ${appointment?.email || ''}`,
    `Phone: ${appointment?.phone || ''}`,
    `Preferred Date: ${date}`,
    `Preferred Time: ${time}`,
    '',
    `${reason}`,
  ];
  return lines.join('\n');
}

function createEmailClientFromEnv() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const to = process.env.NOTIFY_EMAIL_TO;

  if (!host || !port || !user || !pass || !from || !to) return null;

  const nodemailer = require('nodemailer');
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return {
    async send({ subject, text }) {
      await transporter.sendMail({ from, to, subject, text });
    },
  };
}

function createSmsClientFromEnv() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const to = process.env.NOTIFY_SMS_TO;

  if (!sid || !token || !from || !to) return null;

  const twilio = require('twilio');
  const client = twilio(sid, token);

  return {
    async send({ text }) {
      await client.messages.create({ from, to, body: text });
    },
  };
}

async function safeNotify({ subject, text }) {
  const emailClient = createEmailClientFromEnv();
  const smsClient = createSmsClientFromEnv();

  const tasks = [];
  if (emailClient) tasks.push(emailClient.send({ subject, text }));
  if (smsClient) tasks.push(smsClient.send({ text }));

  if (!tasks.length) return;

  const results = await Promise.allSettled(tasks);
  const rejected = results.find((r) => r.status === 'rejected');
  if (rejected && rejected.status === 'rejected') throw rejected.reason;
}

async function notifyNewInquiry(inquiry) {
  const text = formatInquiryText(inquiry);
  await safeNotify({ subject: 'New Contact Inquiry', text });
}

async function notifyNewAppointment(appointment) {
  const text = formatAppointmentText(appointment);
  await safeNotify({ subject: 'New Appointment Request', text });
}

module.exports = { notifyNewInquiry, notifyNewAppointment };
