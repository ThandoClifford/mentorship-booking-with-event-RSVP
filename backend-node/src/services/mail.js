import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporterPromise;

function isMailConfigured() {
  return Boolean(env.mailHost && env.mailFromAddress && env.mailEnabled);
}

async function getTransporter() {
  if (!isMailConfigured()) return null;
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: env.mailHost,
        port: env.mailPort,
        secure: env.mailSecure,
        auth: env.mailUser ? { user: env.mailUser, pass: env.mailPass } : undefined
      })
    );
  }

  return transporterPromise;
}

function portalUrl(path = '/') {
  const base = String(env.appUrl || 'http://localhost:5174').replace(/\/$/, '');
  const suffix = String(path || '/').startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

function appointmentLine(appointment) {
  const date = appointment?.time_slot?.date || '-';
  const start = String(appointment?.time_slot?.start_time || '-').slice(0, 5);
  const end = String(appointment?.time_slot?.end_time || '-').slice(0, 5);
  return `${date} ${start}-${end}`;
}

async function sendEmail({ to, subject, text, html }) {
  const recipient = String(to || '').trim();
  if (!recipient) return false;

  const transporter = await getTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: env.mailFromName ? `${env.mailFromName} <${env.mailFromAddress}>` : env.mailFromAddress,
      to: recipient,
      subject,
      text,
      html
    });
    return true;
  } catch (error) {
    console.error('Mail send failed:', error?.message || error);
    return false;
  }
}

export async function sendMentorVerifiedEmail(mentor) {
  const mentorName = mentor?.name || 'Mentor';
  const loginUrl = portalUrl('/login?role=mentor');
  return sendEmail({
    to: mentor?.email,
    subject: 'Your mentor account has been verified',
    text: `Hello ${mentorName},\n\nYour mentor account has been verified by the admin team. You can now sign in at ${loginUrl}.\n\nRegards,\nUMPCFERI`,
    html: `<p>Hello ${mentorName},</p><p>Your mentor account has been verified by the admin team.</p><p>You can now sign in <a href="${loginUrl}">here</a>.</p><p>Regards,<br/>UMPCFERI</p>`
  });
}

export async function sendAppointmentConfirmedEmails(appointment) {
  const when = appointmentLine(appointment);
  const studentName = appointment?.student?.name || 'Student';
  const mentorName = appointment?.mentor?.name || 'Mentor';

  const studentSent = await sendEmail({
    to: appointment?.student?.email,
    subject: 'Your appointment is confirmed',
    text: `Hello ${studentName},\n\nYour appointment with ${mentorName} is confirmed for ${when}.\n\nRegards,\nUMPCFERI`,
    html: `<p>Hello ${studentName},</p><p>Your appointment with <strong>${mentorName}</strong> is confirmed for <strong>${when}</strong>.</p><p>Regards,<br/>UMPCFERI</p>`
  });

  const mentorSent = await sendEmail({
    to: appointment?.mentor?.email,
    subject: 'New confirmed mentorship appointment',
    text: `Hello ${mentorName},\n\nAn appointment with ${studentName} is confirmed for ${when}.\n\nRegards,\nUMPCFERI`,
    html: `<p>Hello ${mentorName},</p><p>An appointment with <strong>${studentName}</strong> is confirmed for <strong>${when}</strong>.</p><p>Regards,<br/>UMPCFERI</p>`
  });

  return studentSent || mentorSent;
}

export async function sendAppointmentCancelledEmails(appointment, reason = '') {
  const when = appointmentLine(appointment);
  const studentName = appointment?.student?.name || 'Student';
  const mentorName = appointment?.mentor?.name || 'Mentor';
  const reasonLine = reason ? `\nReason: ${reason}` : '';

  const studentSent = await sendEmail({
    to: appointment?.student?.email,
    subject: 'Your appointment was cancelled',
    text: `Hello ${studentName},\n\nYour appointment with ${mentorName} scheduled for ${when} was cancelled.${reasonLine}\n\nRegards,\nUMPCFERI`,
    html: `<p>Hello ${studentName},</p><p>Your appointment with <strong>${mentorName}</strong> scheduled for <strong>${when}</strong> was cancelled.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}<p>Regards,<br/>UMPCFERI</p>`
  });

  const mentorSent = await sendEmail({
    to: appointment?.mentor?.email,
    subject: 'An appointment was cancelled',
    text: `Hello ${mentorName},\n\nThe appointment with ${studentName} scheduled for ${when} was cancelled.${reasonLine}\n\nRegards,\nUMPCFERI`,
    html: `<p>Hello ${mentorName},</p><p>The appointment with <strong>${studentName}</strong> scheduled for <strong>${when}</strong> was cancelled.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}<p>Regards,<br/>UMPCFERI</p>`
  });

  return studentSent || mentorSent;
}

export async function sendAppointmentCompletedEmail(appointment) {
  const when = appointmentLine(appointment);
  const studentName = appointment?.student?.name || 'Student';
  const mentorName = appointment?.mentor?.name || 'Mentor';

  return sendEmail({
    to: appointment?.student?.email,
    subject: 'Your mentorship session has been completed',
    text: `Hello ${studentName},\n\nYour session with ${mentorName} on ${when} has been marked as completed.\n\nRegards,\nUMPCFERI`,
    html: `<p>Hello ${studentName},</p><p>Your session with <strong>${mentorName}</strong> on <strong>${when}</strong> has been marked as completed.</p><p>Regards,<br/>UMPCFERI</p>`
  });
}

export function isMailServiceEnabled() {
  return isMailConfigured();
}
