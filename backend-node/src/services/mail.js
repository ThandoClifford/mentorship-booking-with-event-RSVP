import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { buildConfirmedICS } from './calendar.js';

let transporterPromise;
let lastMailError = '';

function isMailConfigured() {
  return Boolean(env.mailHost && env.mailFromAddress && env.mailEnabled);
}

function mailConfigIssues() {
  const issues = [];
  if (!env.mailEnabled) {
    issues.push('MAIL_DISABLED');
    return issues;
  }
  if (!env.mailHost) issues.push('MAIL_HOST_MISSING');
  if (!env.mailFromAddress) issues.push('MAIL_FROM_ADDRESS_MISSING');
  if (env.mailUser && !env.mailPass) issues.push('MAIL_PASS_MISSING');
  return issues;
}

async function getTransporter() {
  if (!isMailConfigured()) return null;
  if (!transporterPromise) {
    const auth = env.mailUser ? { user: env.mailUser, pass: env.mailPass } : undefined;
    const isGmail = String(env.mailHost || '').toLowerCase().includes('gmail.com');

    transporterPromise = Promise.resolve(
      nodemailer.createTransport(
        isGmail
          ? {
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth,
              requireTLS: true,
              authMethod: 'LOGIN',
              tls: { rejectUnauthorized: false }
            }
          : {
              host: env.mailHost,
              port: env.mailPort,
              secure: env.mailSecure,
              auth,
              requireTLS: true,
              authMethod: 'LOGIN',
              tls: { rejectUnauthorized: false }
            }
      )
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
  if (!recipient) {
    lastMailError = 'Missing recipient email';
    return false;
  }

  const transporter = await getTransporter();
  if (!transporter) {
    const issues = mailConfigIssues();
    lastMailError = issues.length ? `Mail not configured: ${issues.join(', ')}` : 'Mail transporter unavailable';
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
    lastMailError = '';
    return true;
  } catch (error) {
    lastMailError = error?.message || String(error);
    console.error('Mail send failed:', lastMailError);
    return false;
  }
}

export async function sendMentorVerifiedEmail(mentor) {
  const mentorName = mentor?.name || 'Mentor';
  const loginUrl = portalUrl('/login?role=mentor');
  return sendEmail({
    to: mentor?.email,
    subject: 'Your mentor account has been verified',
    text: `Hello ${mentorName},\n\nYour mentor account has been verified by the admin team. You can now sign in at ${loginUrl}.\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${mentorName},</p><p>Your mentor account has been verified by the admin team.</p><p>You can now sign in <a href="${loginUrl}">here</a>.</p><p>Regards,<br/>The Mentorship Academy</p>`
  });
}

export async function sendPasswordResetEmail({ email, name, token }) {
  const safeEmail = String(email || '').trim();
  if (!safeEmail || !token) return false;

  const displayName = name || 'User';
  const resetUrl = portalUrl(`/reset-password?email=${encodeURIComponent(safeEmail)}&token=${encodeURIComponent(token)}`);

  return sendEmail({
    to: safeEmail,
    subject: 'Reset your The Mentorship Academy password',
    text: `Hello ${displayName},\n\nWe received a request to reset your password. Use this link to continue:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${displayName},</p><p>We received a request to reset your password.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p><p>Regards,<br/>The Mentorship Academy</p>`
  });
}

export async function sendMenteeSignupConfirmationEmail(user) {
  const menteeName = user?.name || 'Mentee';
  const loginUrl = portalUrl('/login?role=student');
  return sendEmail({
    to: user?.email,
    subject: 'Welcome to The Mentorship Academy Mentorship Portal',
    text: `Hello ${menteeName},\n\nYour mentee account has been created successfully. You can now sign in at ${loginUrl}.\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${menteeName},</p><p>Your mentee account has been created successfully.</p><p>You can now sign in <a href="${loginUrl}">here</a>.</p><p>Regards,<br/>The Mentorship Academy</p>`
  });
}

export async function sendMentorJoinRequestEmails(mentor) {
  if (!Array.isArray(env.adminNotifyEmails) || env.adminNotifyEmails.length === 0) {
    console.log('No admin notification emails configured.');
    return false;
  }

  const adminLink = portalUrl('/admin/mentors');
  const mentorName = mentor?.name || 'Mentor';
  const mentorEmail = mentor?.email || 'No email provided';
  const mentorFaculty = mentor?.faculty || 'N/A';

  return sendEmail({
    to: env.adminNotifyEmails.join(','),
    subject: 'New mentor verification request',
    text: `Hello Admin,\n\nA new mentor has signed up and is waiting for verification.\n\nName: ${mentorName}\nEmail: ${mentorEmail}\nFaculty: ${mentorFaculty}\n\nReview the request here: ${adminLink}\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello Admin,</p><p>A new mentor has signed up and is waiting for verification.</p><ul><li><strong>Name:</strong> ${mentorName}</li><li><strong>Email:</strong> ${mentorEmail}</li><li><strong>Faculty:</strong> ${mentorFaculty}</li></ul><p>Review the request <a href="${adminLink}">here</a>.</p><p>Regards,<br/>The Mentorship Academy</p>`
  });
}

export async function sendMentorSignupConfirmationEmail(mentor) {
  const mentorName = mentor?.name || 'Mentor';
  const loginUrl = portalUrl('/login?role=mentor');
  return sendEmail({
    to: mentor?.email,
    subject: 'Your mentor signup has been received',
    text: `Hello ${mentorName},\n\nThank you for signing up to the The Mentorship Academy Mentorship Portal. Your application is pending admin verification.\n\nYou can sign in once approved at ${loginUrl}.\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${mentorName},</p><p>Thank you for signing up to the The Mentorship Academy Mentorship Portal. Your application is pending admin verification.</p><p>You can sign in once approved <a href="${loginUrl}">here</a>.</p><p>Regards,<br/>The Mentorship Academy</p>`
  });
}

export async function sendAdminTestEmail({ email, name }) {
  const safeEmail = String(email || '').trim();
  if (!safeEmail) return false;

  const displayName = name || 'Admin';
  return sendEmail({
    to: safeEmail,
    subject: 'The Mentorship Academy SMTP test email',
    text: `Hello ${displayName},\n\nThis is a test email from the The Mentorship Academy portal. SMTP is configured and working.\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${displayName},</p><p>This is a test email from the The Mentorship Academy portal.</p><p><strong>SMTP is configured and working.</strong></p><p>Regards,<br/>The Mentorship Academy</p>`
  });
}

function resolvePublicStudentEmail(appointment) {
  return String(appointment?.public_student?.email || appointment?.student?.email || '').trim();
}

function resolvePublicStudentName(appointment) {
  return appointment?.public_student?.full_name || appointment?.student?.name || 'Student';
}

export async function sendPublicAppointmentRequestedEmail(appointment, acceptUrl, declineUrl) {
  const when = appointmentLine(appointment);
  const studentName = resolvePublicStudentName(appointment);
  const mentorName = appointment?.mentor?.name || 'Mentor';
  const mentorEmail = appointment?.mentor?.email || '';
  const studentNumber = appointment?.public_student?.student_number || 'N/A';
  const studentEmail = resolvePublicStudentEmail(appointment);
  const reason = appointment?.appointment_subject || 'Not provided';
  const subject = 'New mentorship appointment request';

  const acceptLink = acceptUrl ? `\nAccept: ${acceptUrl}` : '';
  const declineLink = declineUrl ? `\nDecline: ${declineUrl}` : '';

  const text = `Hello ${mentorName},\n\nA new public mentorship appointment request has been submitted.\n\nStudent: ${studentName}\nStudent number: ${studentNumber}\nStudent email: ${studentEmail}\nDate/time: ${when}\nReason: ${reason}\n${acceptLink}${declineLink}\n\nRegards,\nThe Mentorship Academy`;

  const html = `<p>Hello ${mentorName},</p>
<p>A new public mentorship appointment request has been submitted.</p>
<ul>
  <li><strong>Student:</strong> ${studentName}</li>
  <li><strong>Student number:</strong> ${studentNumber}</li>
  <li><strong>Student email:</strong> ${studentEmail}</li>
  <li><strong>Date/time:</strong> ${when}</li>
  <li><strong>Reason:</strong> ${reason}</li>
</ul>
<p>Please review this request:</p>
<ul>
  ${acceptUrl ? `<li><a href="${acceptUrl}">Accept appointment</a></li>` : ''}
  ${declineUrl ? `<li><a href="${declineUrl}">Decline appointment</a></li>` : ''}
</ul>
<p>Regards,<br/>The Mentorship Academy</p>`;

  return sendEmail({
    to: mentorEmail,
    subject,
    text,
    html
  });
}

export async function sendPublicAppointmentRequestReceivedEmail(appointment) {
  const when = appointmentLine(appointment);
  const studentName = resolvePublicStudentName(appointment);
  const mentorName = appointment?.mentor?.name || 'Mentor';
  const studentEmail = resolvePublicStudentEmail(appointment);

  const subject = 'Your mentorship appointment request has been received';
  const text = `Hello ${studentName},\n\nWe have received your mentorship appointment request with ${mentorName} for ${when}.\n\nPlease note that this request is not confirmed yet. The mentor will review your request and you will receive another email once it has been accepted or declined.\n\nRegards,\nThe Mentorship Academy`;

  const html = `<p>Hello ${studentName},</p>
<p>We have received your mentorship appointment request with <strong>${mentorName}</strong> for <strong>${when}</strong>.</p>
<p>Please note that this request is <strong>not confirmed yet</strong>. The mentor will review your request and you will receive another email once it has been accepted or declined.</p>
<p>Regards,<br/>The Mentorship Academy</p>`;

  return sendEmail({
    to: studentEmail,
    subject,
    text,
    html
  });
}

export async function sendConfirmedCalendarInvitation(appointment) {
  const ics = buildConfirmedICS(appointment);
  if (!ics) return false;

  const when = appointmentLine(appointment);
  const studentName = resolvePublicStudentName(appointment);
  const mentorName = appointment?.mentor?.name || 'Mentor';
  const studentEmail = resolvePublicStudentEmail(appointment);
  const mentorEmail = appointment?.mentor?.email || '';

  const subject = `Your UMP-CFERI mentorship session is confirmed – ${mentorName}`;

  const studentText = `Hello ${studentName},\n\nYour appointment with ${mentorName} scheduled for ${when} has been confirmed.\n\nPlease find the calendar invitation attached to this email.\n\nRegards,\nThe Mentorship Academy`;

  const studentHtml = `<p>Hello ${studentName},</p>
<p>Your appointment with <strong>${mentorName}</strong> scheduled for <strong>${when}</strong> has been confirmed.</p>
<p>Please find the calendar invitation attached to this email.</p>
<p>Regards,<br/>The Mentorship Academy</p>`;

  const mentorText = `Hello ${mentorName},\n\nThe appointment with ${studentName} scheduled for ${when} has been confirmed.\n\nPlease find the calendar invitation attached to this email.\n\nRegards,\nThe Mentorship Academy`;

  const mentorHtml = `<p>Hello ${mentorName},</p>
<p>The appointment with <strong>${studentName}</strong> scheduled for <strong>${when}</strong> has been confirmed.</p>
<p>Please find the calendar invitation attached to this email.</p>
<p>Regards,<br/>The Mentorship Academy</p>`;

  const attachments = [
    {
      filename: `appointment-${appointment.id}.ics`,
      content: ics,
      contentType: 'text/calendar; charset=utf-8; method=PUBLISH'
    }
  ];

  const studentSent = studentEmail
    ? await sendEmail({
        to: studentEmail,
        subject,
        text: studentText,
        html: studentHtml,
        attachments
      })
    : false;

  const mentorSent = mentorEmail
    ? await sendEmail({
        to: mentorEmail,
        subject,
        text: mentorText,
        html: mentorHtml,
        attachments
      })
    : false;

  return studentSent || mentorSent;
}

export async function sendAppointmentConfirmedEmails(appointment) {
  const when = appointmentLine(appointment);
  const studentName = resolvePublicStudentName(appointment);
  const mentorName = appointment?.mentor?.name || 'Mentor';
  const recipient = resolvePublicStudentEmail(appointment);

  const studentSent = await sendEmail({
    to: recipient,
    subject: 'Your appointment is confirmed',
    text: `Hello ${studentName},\n\nYour appointment with ${mentorName} is confirmed for ${when}.\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${studentName},</p><p>Your appointment with <strong>${mentorName}</strong> is confirmed for <strong>${when}</strong>.</p><p>Regards,<br/>The Mentorship Academy</p>`
  });

  const mentorSent = await sendEmail({
    to: appointment?.mentor?.email,
    subject: 'New confirmed mentorship appointment',
    text: `Hello ${mentorName},\n\nAn appointment with ${studentName} is confirmed for ${when}.\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${mentorName},</p><p>An appointment with <strong>${studentName}</strong> is confirmed for <strong>${when}</strong>.</p><p>Regards,<br/>The Mentorship Academy</p>`
  });

  return studentSent || mentorSent;
}

export async function sendAppointmentCancelledEmails(appointment, reason = '') {
  const when = appointmentLine(appointment);
  const studentName = resolvePublicStudentName(appointment);
  const mentorName = appointment?.mentor?.name || 'Mentor';
  const recipient = resolvePublicStudentEmail(appointment);
  const reasonLine = reason ? `\nReason: ${reason}` : '';

  const studentSent = await sendEmail({
    to: recipient,
    subject: 'Your appointment was cancelled',
    text: `Hello ${studentName},\n\nYour appointment with ${mentorName} scheduled for ${when} was cancelled.${reasonLine}\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${studentName},</p><p>Your appointment with <strong>${mentorName}</strong> scheduled for <strong>${when}</strong> was cancelled.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}<p>Regards,<br/>The Mentorship Academy</p>`
  });

  const mentorSent = await sendEmail({
    to: appointment?.mentor?.email,
    subject: 'An appointment was cancelled',
    text: `Hello ${mentorName},\n\nThe appointment with ${studentName} scheduled for ${when} was cancelled.${reasonLine}\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${mentorName},</p><p>The appointment with <strong>${studentName}</strong> scheduled for <strong>${when}</strong> was cancelled.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}<p>Regards,<br/>The Mentorship Academy</p>`
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
    text: `Hello ${studentName},\n\nYour session with ${mentorName} on ${when} has been marked as completed.\n\nRegards,\nThe Mentorship Academy`,
    html: `<p>Hello ${studentName},</p><p>Your session with <strong>${mentorName}</strong> on <strong>${when}</strong> has been marked as completed.</p><p>Regards,<br/>The Mentorship Academy</p>`
  });
}

export function isMailServiceEnabled() {
  return isMailConfigured();
}

export function getMailConfigIssues() {
  return mailConfigIssues();
}

export function getLastMailError() {
  return lastMailError;
}
