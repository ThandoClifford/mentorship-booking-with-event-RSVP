import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { Announcement } from '../models/Announcement.js';
import { Appointment } from '../models/Appointment.js';
import { AuditLog } from '../models/AuditLog.js';
import { CentreEvent } from '../models/CentreEvent.js';
import { GroupSession } from '../models/GroupSession.js';
import { MentorAvailability } from '../models/MentorAvailability.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { SessionNote } from '../models/SessionNote.js';
import { TimeSlot } from '../models/TimeSlot.js';
import { User } from '../models/User.js';
import {
  getLastMailError,
  getMailConfigIssues,
  sendAppointmentCancelledEmails,
  sendAppointmentCompletedEmail,
  sendAppointmentConfirmedEmails,
  sendAdminTestEmail,
  sendMentorJoinRequestEmails,
  sendMentorSignupConfirmationEmail,
  sendMenteeSignupConfirmationEmail,
  sendMentorVerifiedEmail,
  sendPasswordResetEmail
} from '../services/mail.js';
import { writeAudit } from '../utils/audit.js';
import { signToken } from '../utils/auth.js';
import { failure, success } from '../utils/response.js';

const router = express.Router();

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function dayName(dateStr) {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[day];
}

function mapUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    faculty: user.faculty || null,
    mentor_verified_at: user.mentor_verified_at || null,
  };
}

function mapSlot(slot) {
  return {
    id: String(slot._id),
    mentor_id: String(slot.mentor_id?._id || slot.mentor_id),
    date: slot.date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: slot.status,
    mentor: slot.mentor_id && slot.mentor_id.name ? mapUser(slot.mentor_id) : undefined
  };
}

function mapAppointment(appointment) {
  return {
    id: String(appointment._id),
    student_id: String(appointment.student_id?._id || appointment.student_id),
    mentor_id: String(appointment.mentor_id?._id || appointment.mentor_id),
    time_slot_id: String(appointment.time_slot_id?._id || appointment.time_slot_id),
    status: appointment.status,
    student_contact_details: appointment.student_contact_details || null,
    appointment_subject: appointment.appointment_subject || null,
    cancelled_reason: appointment.cancelled_reason || null,
    confirmed_sent_at: appointment.confirmed_sent_at || null,
    cancelled_sent_at: appointment.cancelled_sent_at || null,
    reminder_sent_at: appointment.reminder_sent_at || null,
    student: appointment.student_id && appointment.student_id.name ? mapUser(appointment.student_id) : undefined,
    mentor: appointment.mentor_id && appointment.mentor_id.name ? mapUser(appointment.mentor_id) : undefined,
    time_slot: appointment.time_slot_id && appointment.time_slot_id.date ? mapSlot(appointment.time_slot_id) : undefined
  };
}

async function loadAppointmentWithRelations(id) {
  return Appointment.findById(id)
    .populate('student_id', 'name email role')
    .populate('mentor_id', 'name email role')
    .populate('time_slot_id');
}

router.post('/auth/register', async (req, res) => {
  const { name, email, password, password_confirmation, role, faculty } = req.body || {};
  const normalizedRole = ['student', 'mentor', 'admin', 'super_admin'].includes(role) ? role : 'student';
  const normalizedFaculty = String(faculty || '').trim();

  if (!name || !email || !password || password !== password_confirmation) {
    return failure(res, 'Validation failed', null, 422);
  }
  if (normalizedRole === 'mentor' && !normalizedFaculty) {
    return failure(res, 'Validation failed', { faculty: ['The faculty field is required for mentor registration.'] }, 422);
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    return failure(res, 'Validation failed', { email: ['The email has already been taken.'] }, 422);
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const user = await User.create({
    name: String(name),
    email: String(email).toLowerCase(),
    password: passwordHash,
    role: normalizedRole,
    faculty: normalizedRole === 'mentor' ? normalizedFaculty : null
  });

  if (user.role === 'mentor') {
    await sendMentorJoinRequestEmails(user);
    await sendMentorSignupConfirmationEmail(user);
  } else if (user.role === 'student') {
    const mentee = await User.findById(user._id).select('name email role');
    if (mentee) {
      await sendMenteeSignupConfirmationEmail(mentee);
    }
  }

  const token = signToken(user);
  return success(res, 'Registered successfully', { user: mapUser(user), token }, 201);
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (!user) {
    return failure(res, 'Invalid credentials', null, 401);
  }

  const ok = await bcrypt.compare(String(password || ''), user.password);
  if (!ok) {
    return failure(res, 'Invalid credentials', null, 401);
  }

  if (user.role === 'mentor' && !user.mentor_verified_at) {
    return failure(res, 'Your mentor account is pending verification by admin.', null, 403);
  }

  return success(res, 'Login successful', { user: mapUser(user), token: signToken(user) });
});

router.post('/auth/logout', authRequired, async (req, res) => {
  req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
  await req.user.save();
  return success(res, 'Logout successful');
});

router.post('/auth/password/forgot', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  if (!email) {
    return failure(res, 'Validation failed', null, 422);
  }

  const user = await User.findOne({ email });
  let issuedToken = null;
  if (user) {
    await PasswordResetToken.updateMany({ email, used_at: null }, { $set: { used_at: new Date() } });
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordResetToken.create({ email, token, expires_at: expiresAt, used_at: null });
    await sendPasswordResetEmail({ email, name: user.name, token });
    issuedToken = token;
  }

  return success(res, 'If the email exists, a password reset link has been issued', {
    reset_token: process.env.NODE_ENV === 'production' ? null : issuedToken
  });
});

router.post('/auth/password/reset', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const token = String(req.body?.token || '').trim();
  const password = String(req.body?.password || '');
  const passwordConfirmation = String(req.body?.password_confirmation || '');

  if (!email || !token || !password || password !== passwordConfirmation) {
    return failure(res, 'Validation failed', null, 422);
  }

  const resetToken = await PasswordResetToken.findOne({ email, token, used_at: null }).sort({ createdAt: -1 });
  if (!resetToken || new Date(resetToken.expires_at).getTime() < Date.now()) {
    return failure(res, 'Invalid or expired reset token', null, 422);
  }

  const user = await User.findOne({ email });
  if (!user) {
    return failure(res, 'User not found', null, 404);
  }

  user.password = await bcrypt.hash(password, 12);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  resetToken.used_at = new Date();
  await resetToken.save();

  await writeAudit(req, user._id, 'password.reset', 'User', user._id);
  return success(res, 'Password reset successful', null);
});

router.get('/auth/me', authRequired, async (req, res) => {
  return success(res, 'Authenticated user', mapUser(req.user));
});

router.get('/ping', async (_req, res) => success(res, 'pong'));

router.get('/health', async (_req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    return success(res, 'ok', { app_time: new Date().toISOString(), db_ok: true });
  } catch (_error) {
    return failure(res, 'Service unavailable', { app_time: new Date().toISOString(), db_ok: false }, 503);
  }
});

router.get('/public/home', async (_req, res) => {
  const announcements = await Announcement.find().sort({ published_on: -1, createdAt: -1 }).limit(20);
  const centreEvents = await CentreEvent.find().sort({ event_date: 1, event_time: 1 }).limit(20);
  return success(res, 'Home data retrieved', {
    announcements: announcements.map((item) => item.toJSON()),
    centreEvents: centreEvents.map((item) => item.toJSON())
  });
});

router.get('/public/mentors', async (_req, res) => {
  const mentors = await User.find({ role: 'mentor', mentor_verified_at: { $ne: null } })
    .select('name email role faculty')
    .sort({ name: 1 });
  return success(res, 'Mentors retrieved', mentors.map(mapUser));
});

router.get('/metrics', authRequired, requireRole('admin', 'super_admin'), async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const appointments = await Appointment.find().populate('time_slot_id');
  const bookingsToday = appointments.filter((a) => a.time_slot_id?.date === today).length;
  return success(res, 'Metrics retrieved', {
    bookings_today: bookingsToday,
    failed_jobs_count: 0,
    queue_size: null,
    queue_size_supported: false,
    queue_connection: 'mongodb',
    generated_at: new Date().toISOString()
  });
});

router.get('/admin/mentors', authRequired, requireRole('admin', 'super_admin'), async (_req, res) => {
  const mentors = await User.find({ role: 'mentor' }).sort({ createdAt: -1 });
  return success(res, 'Mentors retrieved', mentors.map(mapUser));
});


router.get('/admin/students', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const search = String(req.query.search || '').trim();
  const status = String(req.query.status || 'all').trim().toLowerCase();

  const query = { role: 'student' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const students = await User.find(query).sort({ createdAt: -1 });

  const studentIds = students.map((student) => student._id);

  const appointments = await Appointment.find({
    student_id: { $in: studentIds }
  }).populate('time_slot_id');

  const appointmentMap = new Map();

  for (const appointment of appointments) {
    const studentId = String(appointment.student_id);
    const current = appointmentMap.get(studentId) || {
      total_appointments: 0,
      upcoming_appointments: 0,
      completed_appointments: 0,
      cancelled_appointments: 0,
      last_appointment_date: null,
    };

    current.total_appointments += 1;

    if (appointment.status === 'completed') current.completed_appointments += 1;
    if (appointment.status === 'cancelled') current.cancelled_appointments += 1;

    const slotDate = appointment.time_slot_id?.date || null;
    if (slotDate) {
      if (!current.last_appointment_date || slotDate > current.last_appointment_date) {
        current.last_appointment_date = slotDate;
      }
      if (slotDate >= new Date().toISOString().slice(0, 10) && ['pending', 'confirmed'].includes(appointment.status)) {
        current.upcoming_appointments += 1;
      }
    }

    appointmentMap.set(studentId, current);
  }

  let data = students.map((student) => {
    const stats = appointmentMap.get(String(student._id)) || {
      total_appointments: 0,
      upcoming_appointments: 0,
      completed_appointments: 0,
      cancelled_appointments: 0,
      last_appointment_date: null,
    };

    return {
      ...mapUser(student),
      created_at: student.createdAt,
      updated_at: student.updatedAt,
      status: 'active',
      ...stats,
    };
  });

  if (status !== 'all') {
    data = data.filter((student) => student.status === status);
  }

  return success(res, 'Students retrieved', data);
});




router.get('/admin/mentors/pending-verification', authRequired, requireRole('admin', 'super_admin'), async (_req, res) => {
  const pending = await User.find({ role: 'mentor', mentor_verified_at: null }).sort({ createdAt: 1 });
  return success(res, 'Pending mentor verifications retrieved', pending.map(mapUser));
});

router.post('/admin/mentors/:id/verify', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Mentor not found', null, 404);

  const mentor = await User.findOne({ _id: id, role: 'mentor' });
  if (!mentor) return failure(res, 'Mentor not found', null, 404);

  mentor.mentor_verified_at = mentor.mentor_verified_at || new Date();
  await mentor.save();
  await writeAudit(req, req.user._id, 'mentor.verified', 'User', mentor._id);
  await sendMentorVerifiedEmail(mentor);

  return success(res, 'Mentor verified', mapUser(mentor));
});

router.post('/admin/mentors', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { name, email, password, password_confirmation } = req.body || {};
  if (!name || !email || !password || password !== password_confirmation) {
    return failure(res, 'Validation failed', null, 422);
  }

  if (await User.findOne({ email: String(email).toLowerCase() })) {
    return failure(res, 'Validation failed', { email: ['The email has already been taken.'] }, 422);
  }

  const mentor = await User.create({
    name: String(name),
    email: String(email).toLowerCase(),
    password: await bcrypt.hash(String(password), 12),
    role: 'mentor'
  });

  await writeAudit(req, req.user._id, 'mentor.created', 'User', mentor._id, { role: 'mentor' });
  return success(res, 'Mentor created', mapUser(mentor), 201);
});

router.patch('/admin/mentors/:id', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Mentor not found', null, 404);

  const mentor = await User.findOne({ _id: id, role: 'mentor' });
  if (!mentor) return failure(res, 'Mentor not found', null, 404);

  if (req.body.name) mentor.name = String(req.body.name);
  if (req.body.email) mentor.email = String(req.body.email).toLowerCase();
  await mentor.save();
  await writeAudit(req, req.user._id, 'mentor.updated', 'User', mentor._id, { fields: Object.keys(req.body || {}) });

  return success(res, 'Mentor updated', mapUser(mentor));
});

router.delete('/admin/mentors/:id', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Mentor not found', null, 404);
  const mentor = await User.findOneAndDelete({ _id: id, role: 'mentor' });
  if (!mentor) return failure(res, 'Mentor not found', null, 404);
  await writeAudit(req, req.user._id, 'mentor.deleted', 'User', mentor._id);
  return success(res, 'Mentor deleted');
});

router.get('/admin/mentors/:mentorId/availability', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { mentorId } = req.params;
  if (!isObjectId(mentorId)) return failure(res, 'Mentor not found', null, 404);

  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
  if (!mentor) return failure(res, 'Mentor not found', null, 404);

  const availability = await MentorAvailability.find({ mentor_id: mentor._id }).sort({ day_of_week: 1, start_time: 1 });
  return success(res, 'Availability retrieved', availability.map((a) => a.toJSON()));
});

router.post('/admin/mentors/:mentorId/availability', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { mentorId } = req.params;
  const { day_of_week, start_time, end_time, is_active } = req.body || {};

  if (!isObjectId(mentorId)) return failure(res, 'Mentor not found', null, 404);
  if (!['tuesday', 'thursday'].includes(day_of_week) || !start_time || !end_time || end_time <= start_time) {
    return failure(res, 'Validation failed', null, 422);
  }

  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
  if (!mentor) return failure(res, 'Mentor not found', null, 404);

  let availability = await MentorAvailability.findOne({ mentor_id: mentor._id, day_of_week, start_time, end_time });
  let created = false;

  if (!availability) {
    availability = await MentorAvailability.create({ mentor_id: mentor._id, day_of_week, start_time, end_time, is_active: is_active ?? true });
    created = true;
  } else if (typeof is_active === 'boolean') {
    availability.is_active = is_active;
    await availability.save();
  }

  await writeAudit(req, req.user._id, created ? 'availability.created' : 'availability.updated', 'MentorAvailability', availability._id, {
    mentor_id: mentor._id,
    day_of_week,
    start_time,
    end_time
  });

  return success(res, created ? 'Availability created' : 'Availability already exists', availability.toJSON(), created ? 201 : 200);
});

router.patch('/admin/availability/:id', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Availability not found', null, 404);

  const availability = await MentorAvailability.findById(id);
  if (!availability) return failure(res, 'Availability not found', null, 404);

  const day = req.body.day_of_week ?? availability.day_of_week;
  const start = req.body.start_time ?? availability.start_time;
  const end = req.body.end_time ?? availability.end_time;

  if (!['tuesday', 'thursday'].includes(day) || end <= start) {
    return failure(res, 'The end_time must be after start_time.', null, 422);
  }

  availability.day_of_week = day;
  availability.start_time = start;
  availability.end_time = end;
  if (typeof req.body.is_active === 'boolean') availability.is_active = req.body.is_active;
  await availability.save();

  await writeAudit(req, req.user._id, 'availability.updated', 'MentorAvailability', availability._id, { fields: Object.keys(req.body || {}) });
  return success(res, 'Availability updated', availability.toJSON());
});

router.delete('/admin/availability/:id', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Availability not found', null, 404);

  const availability = await MentorAvailability.findByIdAndDelete(id);
  if (!availability) return failure(res, 'Availability not found', null, 404);

  await writeAudit(req, req.user._id, 'availability.deleted', 'MentorAvailability', availability._id);
  return success(res, 'Availability deleted');
});

router.post('/admin/mentors/:mentorId/generate-slots', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { mentorId } = req.params;
  const { start_date, end_date, slot_duration_minutes } = req.body || {};

  if (!isObjectId(mentorId)) return failure(res, 'Mentor not found', null, 404);
  if (!start_date || !end_date || end_date < start_date) return failure(res, 'Validation failed', null, 422);

  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
  if (!mentor) return failure(res, 'Mentor not found', null, 404);

  const duration = [15, 30, 45, 60].includes(Number(slot_duration_minutes)) ? Number(slot_duration_minutes) : 60;
  let created = 0;
  let skipped = 0;

  const start = new Date(`${start_date}T00:00:00`);
  const end = new Date(`${end_date}T00:00:00`);

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const day = dayName(dateStr);
    if (!['tuesday', 'thursday'].includes(day)) continue;

    const availabilities = await MentorAvailability.find({ mentor_id: mentor._id, day_of_week: day, is_active: true });

    for (const availability of availabilities) {
      let [h, m] = availability.start_time.split(':').map(Number);
      const [endH, endM] = availability.end_time.split(':').map(Number);

      while (h * 60 + m + duration <= endH * 60 + endM) {
        const startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
        const totalEnd = h * 60 + m + duration;
        const eH = Math.floor(totalEnd / 60);
        const eM = totalEnd % 60;
        const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}:00`;

        const exists = await TimeSlot.findOne({ mentor_id: mentor._id, date: dateStr, start_time: startTime, end_time: endTime });
        if (!exists) {
          await TimeSlot.create({ mentor_id: mentor._id, date: dateStr, start_time: startTime, end_time: endTime, status: 'available' });
          created += 1;
        } else {
          skipped += 1;
        }

        h = eH;
        m = eM;
      }
    }
  }

  await writeAudit(req, req.user._id, 'slots.generated', 'User', mentor._id, { mentor_id: mentor._id, start_date, end_date, created, skipped });
  return success(res, 'Slots generated', { created, skipped });
});

router.get('/admin/reports/summary', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const from = req.query.from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const to = req.query.to || new Date().toISOString().slice(0, 10);

  const appointments = await Appointment.find()
    .populate('time_slot_id')
    .populate('mentor_id', 'name email');

  const filtered = appointments.filter((a) => {
    const date = a.time_slot_id?.date;
    return date && date >= from && date <= to;
  });

  const statusCount = (status) => filtered.filter((a) => a.status === status).length;

  const mentorMap = new Map();
  const dayMap = new Map();

  for (const appointment of filtered) {
    const mentorId = String(appointment.mentor_id?._id || appointment.mentor_id);
    const mentorName = appointment.mentor_id?.name || null;
    const day = appointment.time_slot_id?.date || '';

    mentorMap.set(mentorId, {
      mentor_id: mentorId,
      mentor_name: mentorName,
      total: (mentorMap.get(mentorId)?.total || 0) + 1
    });

    dayMap.set(day, {
      date: day,
      total: (dayMap.get(day)?.total || 0) + 1
    });
  }

  const topMentors = [...mentorMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  const busiestDays = [...dayMap.values()].sort((a, b) => b.total - a.total).slice(0, 10).sort((a, b) => a.date.localeCompare(b.date));

  return success(res, 'Reports summary retrieved', {
    total_appointments: filtered.length,
    confirmed_count: statusCount('confirmed'),
    cancelled_count: statusCount('cancelled'),
    completed_count: statusCount('completed'),
    pending_count: statusCount('pending'),
    top_mentors: topMentors,
    busiest_days: busiestDays,
    from,
    to
  });
});

router.get('/admin/appointments', authRequired, requireRole('admin', 'super_admin'), async (_req, res) => {
  const appointments = await Appointment.find()
    .populate('student_id', 'name email role')
    .populate('mentor_id', 'name email role')
    .populate('time_slot_id')
    .sort({ createdAt: -1 });

  return success(res, 'Admin appointments retrieved', appointments.map(mapAppointment));
});

router.get('/admin/appointments/:id', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Appointment not found', null, 404);

  const appointment = await Appointment.findById(id)
    .populate('student_id', 'name email role')
    .populate('mentor_id', 'name email role')
    .populate('time_slot_id');

  if (!appointment) return failure(res, 'Appointment not found', null, 404);
  return success(res, 'Appointment retrieved', mapAppointment(appointment));
});

router.post('/admin/appointments/:id/approve', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Appointment not found', null, 404);

  const appointment = await Appointment.findById(id);
  if (!appointment) return failure(res, 'Appointment not found', null, 404);

  appointment.status = 'confirmed';
  appointment.confirmed_sent_at = appointment.confirmed_sent_at || null;
  await appointment.save();
  await writeAudit(req, req.user._id, 'appointment.approved', 'Appointment', appointment._id);

  const full = await loadAppointmentWithRelations(id);
  const sent = await sendAppointmentConfirmedEmails(mapAppointment(full));
  if (sent && !appointment.confirmed_sent_at) {
    appointment.confirmed_sent_at = new Date();
    await appointment.save();
    full.confirmed_sent_at = appointment.confirmed_sent_at;
  }

  return success(res, 'Appointment approved', mapAppointment(full));
});

router.get('/admin/announcements', authRequired, requireRole('admin', 'super_admin'), async (_req, res) => {
  const announcements = await Announcement.find().sort({ published_on: -1, createdAt: -1 });
  return success(res, 'Announcements retrieved', announcements.map((item) => item.toJSON()));
});

router.post('/admin/announcements', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { title, type, message, published_on } = req.body || {};
  if (!title || !type || !message || !published_on) {
    return failure(res, 'Validation failed', null, 422);
  }

  const item = await Announcement.create({
    title: String(title),
    type: String(type),
    message: String(message),
    published_on: String(published_on)
  });

  await writeAudit(req, req.user._id, 'announcement.created', 'Announcement', item._id);
  return success(res, 'Announcement created', item.toJSON(), 201);
});

router.delete('/admin/announcements/:id', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Announcement not found', null, 404);

  const item = await Announcement.findByIdAndDelete(id);
  if (!item) return failure(res, 'Announcement not found', null, 404);

  await writeAudit(req, req.user._id, 'announcement.deleted', 'Announcement', item._id);
  return success(res, 'Announcement deleted');
});

router.get('/admin/centre-events', authRequired, requireRole('admin', 'super_admin'), async (_req, res) => {
  const events = await CentreEvent.find().sort({ event_date: 1, event_time: 1 });
  return success(res, 'Centre events retrieved', events.map((item) => item.toJSON()));
});

router.post('/admin/centre-events', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { event_title, event_date, event_time, event_venue, event_category } = req.body || {};
  if (!event_title || !event_date || !event_time || !event_venue || !event_category) {
    return failure(res, 'Validation failed', null, 422);
  }

  const event = await CentreEvent.create({
    title: String(event_title),
    event_date: String(event_date),
    event_time: String(event_time),
    venue: String(event_venue),
    category: String(event_category)
  });

  await writeAudit(req, req.user._id, 'centre_event.created', 'CentreEvent', event._id);
  return success(res, 'Centre event created', event.toJSON(), 201);
});

router.delete('/admin/centre-events/:id', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Centre event not found', null, 404);

  const event = await CentreEvent.findByIdAndDelete(id);
  if (!event) return failure(res, 'Centre event not found', null, 404);

  await writeAudit(req, req.user._id, 'centre_event.deleted', 'CentreEvent', event._id);
  return success(res, 'Centre event deleted');
});

router.get('/admin/ops', authRequired, requireRole('admin', 'super_admin'), async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const appointments = await Appointment.find().populate('time_slot_id');
  const bookingsToday = appointments.filter((a) => a.time_slot_id?.date === today).length;

  const remindersSent = await Appointment.countDocuments({ reminder_sent_at: { $gte: new Date(Date.now() - 24 * 3600000) } });
  const confirmationsSent = await Appointment.countDocuments({ confirmed_sent_at: { $gte: new Date(Date.now() - 24 * 3600000) } });
  const cancellationsSent = await Appointment.countDocuments({ cancelled_sent_at: { $gte: new Date(Date.now() - 24 * 3600000) } });
  const lastAudits = await AuditLog.find().sort({ createdAt: -1 }).limit(10);

  return success(res, 'Ops dashboard retrieved', {
    health: {
      app_time: new Date().toISOString(),
      db_ok: true,
      app_env: process.env.NODE_ENV || 'development',
      app_version: process.env.APP_VERSION || null
    },
    metrics: {
      bookings_today: bookingsToday,
      failed_jobs_count: 0,
      queue_connection: 'mongodb',
      queue_size: null
    },
    recent_failures: {
      last_failed_jobs: []
    },
    reminders_status: {
      reminders_sent_last_24h: remindersSent,
      confirmations_sent_last_24h: confirmationsSent,
      cancellations_sent_last_24h: cancellationsSent
    },
    audit_snapshot: {
      last_audits: lastAudits.map((a) => a.toJSON())
    }
  });
});

router.get('/admin/ops/alerts', authRequired, requireRole('admin', 'super_admin'), async (_req, res) => {
  const alerts = [];
  const now = new Date().toISOString();

  const today = new Date().toISOString().slice(0, 10);
  const appointments = await Appointment.find().populate('time_slot_id');
  const bookingsToday = appointments.filter((a) => a.time_slot_id?.date === today && ['confirmed', 'completed'].includes(a.status)).length;
  const remindersSent = await Appointment.countDocuments({ reminder_sent_at: { $gte: new Date(Date.now() - 24 * 3600000) } });

  if (bookingsToday > 0 && remindersSent === 0) {
    alerts.push({
      severity: 'warning',
      code: 'REMINDERS_NOT_SENDING',
      message: 'Bookings exist but no reminders were sent in the last 24 hours.',
      details: { bookings_today: bookingsToday, reminders_sent_last_24h: remindersSent }
    });
  }

  const mailIssues = getMailConfigIssues();
  for (const issue of mailIssues) {
    alerts.push({
      severity: issue === 'MAIL_DISABLED' ? 'info' : 'warning',
      code: issue,
      message: `Mail configuration issue: ${issue}`,
      details: null
    });
  }

  return success(res, 'OK', {
    generated_at: now,
    queue_connection: 'mongodb',
    queue_size_supported: false,
    queue_size: null,
    alert_count: alerts.length,
    alerts
  });
});

router.post('/admin/ops/test-email', authRequired, requireRole('admin', 'super_admin'), async (req, res) => {
  const requestedEmail = String(req.body?.email || '').trim();
  const targetEmail = requestedEmail || req.user.email;
  if (!targetEmail) {
    return failure(res, 'A recipient email is required', null, 422);
  }

  const mailIssues = getMailConfigIssues();
  if (mailIssues.length > 0) {
    return failure(res, 'Test email failed. Mail configuration is incomplete.', {
      issues: mailIssues
    }, 422);
  }

  const sent = await sendAdminTestEmail({ email: targetEmail, name: req.user.name });
  if (!sent) {
    return failure(res, 'Test email failed. Check SMTP configuration and logs.', {
      reason: getLastMailError() || null
    }, 503);
  }

  return success(res, 'Test email sent', { to: targetEmail });
});

router.get('/student/slots', authRequired, requireRole('student'), async (req, res) => {
  const { date, from, to, mentor_id } = req.query;

  const query = { status: 'available' };
  if (mentor_id && isObjectId(mentor_id)) query.mentor_id = mentor_id;

  let slots = await TimeSlot.find(query).populate('mentor_id', 'name email role');

  if (date) {
    slots = slots.filter((slot) => slot.date === date);
  } else {
    const start = from || new Date().toISOString().slice(0, 10);
    const end = to || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    slots = slots.filter((slot) => slot.date >= start && slot.date <= end);
  }

  return success(res, 'Available slots retrieved', slots.sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`)).map(mapSlot));
});

router.post('/student/appointments', authRequired, requireRole('student'), async (req, res) => {
  const { time_slot_id } = req.body || {};
  if (!time_slot_id || !isObjectId(time_slot_id)) {
    return failure(res, 'Validation failed', null, 422);
  }

  const slot = await TimeSlot.findById(time_slot_id);
  if (!slot || slot.status !== 'available') {
    return failure(res, 'Selected slot is no longer available', null, 422);
  }

  if (!['tuesday', 'thursday'].includes(dayName(slot.date))) {
    return failure(res, 'Appointments are only allowed on Tuesday or Thursday slots', null, 422);
  }

  const existing = await Appointment.find({ student_id: req.user._id, status: { $in: ['confirmed', 'pending'] } }).populate('time_slot_id');
  if (existing.some((a) => a.time_slot_id?.date === slot.date)) {
    return failure(res, 'You already have an appointment on this date', null, 422);
  }

  if (await Appointment.findOne({ time_slot_id: slot._id })) {
    return failure(res, 'This slot has been used before and cannot be booked again', null, 422);
  }

  const appointment = await Appointment.create({
    student_id: req.user._id,
    mentor_id: slot.mentor_id,
    time_slot_id: slot._id,
    status: 'confirmed',
    confirmed_sent_at: null
  });

  slot.status = 'booked';
  await slot.save();

  const full = await loadAppointmentWithRelations(appointment._id);
  const sent = await sendAppointmentConfirmedEmails(mapAppointment(full));
  if (sent && !appointment.confirmed_sent_at) {
    appointment.confirmed_sent_at = new Date();
    await appointment.save();
    full.confirmed_sent_at = appointment.confirmed_sent_at;
  }

  await writeAudit(req, req.user._id, 'appointment.booked', 'Appointment', appointment._id, {
    slot_id: slot._id,
    mentor_id: slot.mentor_id
  });

  return success(res, 'Appointment booked successfully.', mapAppointment(full), 201);
});

router.get('/student/appointments', authRequired, requireRole('student'), async (req, res) => {
  const appointments = await Appointment.find({ student_id: req.user._id })
    .populate('mentor_id', 'name email role')
    .populate('time_slot_id')
    .sort({ createdAt: -1 });

  const mapped = appointments.map(mapAppointment).sort((a, b) => `${b.time_slot?.date || ''} ${b.time_slot?.start_time || ''}`.localeCompare(`${a.time_slot?.date || ''} ${a.time_slot?.start_time || ''}`));
  return success(res, 'Appointments retrieved', mapped);
});

router.patch('/student/appointments/:id/cancel', authRequired, requireRole('student'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Appointment not found', null, 404);

  const appointment = await Appointment.findOne({ _id: id, student_id: req.user._id });
  if (!appointment) return failure(res, 'Appointment not found', null, 404);
  if (appointment.status === 'completed') return failure(res, 'Completed appointments cannot be cancelled', null, 422);

  appointment.status = 'cancelled';
  appointment.cancelled_reason = req.body?.cancelled_reason || appointment.cancelled_reason;
  appointment.cancelled_sent_at = appointment.cancelled_sent_at || null;
  await appointment.save();

  const slot = await TimeSlot.findById(appointment.time_slot_id);
  if (slot && slot.status === 'booked') {
    slot.status = 'available';
    await slot.save();
  }

  const full = await loadAppointmentWithRelations(appointment._id);
  const sent = await sendAppointmentCancelledEmails(mapAppointment(full), appointment.cancelled_reason || '');
  if (sent && !appointment.cancelled_sent_at) {
    appointment.cancelled_sent_at = new Date();
    await appointment.save();
    full.cancelled_sent_at = appointment.cancelled_sent_at;
  }

  await writeAudit(req, req.user._id, 'appointment.cancelled', 'Appointment', appointment._id, {
    reason: appointment.cancelled_reason || ''
  });

  return success(res, 'Appointment cancelled', mapAppointment(full));
});

router.get('/mentor/appointments', authRequired, requireRole('mentor'), async (req, res) => {
  const { date, from, to } = req.query;
  let appointments = await Appointment.find({ mentor_id: req.user._id })
    .populate('student_id', 'name email role')
    .populate('time_slot_id');

  if (date) {
    appointments = appointments.filter((a) => a.time_slot_id?.date === date);
  } else if (from && to) {
    appointments = appointments.filter((a) => a.time_slot_id?.date >= from && a.time_slot_id?.date <= to);
  }

  const mapped = appointments
    .map(mapAppointment)
    .sort((a, b) => `${a.time_slot?.date || ''} ${a.time_slot?.start_time || ''}`.localeCompare(`${b.time_slot?.date || ''} ${b.time_slot?.start_time || ''}`));

  return success(res, 'Mentor appointments retrieved', mapped);
});

router.post('/mentor/appointments/:id/confirm', authRequired, requireRole('mentor'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Appointment not found', null, 404);

  const appointment = await Appointment.findOne({ _id: id, mentor_id: req.user._id });
  if (!appointment) return failure(res, 'Appointment not found', null, 404);

  appointment.status = 'confirmed';
  appointment.confirmed_sent_at = appointment.confirmed_sent_at || null;
  await appointment.save();
  await writeAudit(req, req.user._id, 'appointment.confirmed', 'Appointment', appointment._id);

  const full = await loadAppointmentWithRelations(appointment._id);
  const sent = await sendAppointmentConfirmedEmails(mapAppointment(full));
  if (sent && !appointment.confirmed_sent_at) {
    appointment.confirmed_sent_at = new Date();
    await appointment.save();
    full.confirmed_sent_at = appointment.confirmed_sent_at;
  }

  return success(res, 'Appointment confirmed', mapAppointment(full));
});

router.post('/mentor/appointments/:id/decline', authRequired, requireRole('mentor'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Appointment not found', null, 404);

  const appointment = await Appointment.findOne({ _id: id, mentor_id: req.user._id });
  if (!appointment) return failure(res, 'Appointment not found', null, 404);

  appointment.status = 'cancelled';
  appointment.cancelled_reason = req.body?.cancelled_reason || 'Declined by mentor';
  appointment.cancelled_sent_at = appointment.cancelled_sent_at || null;
  await appointment.save();

  const slot = await TimeSlot.findById(appointment.time_slot_id);
  if (slot && slot.status === 'booked') {
    slot.status = 'available';
    await slot.save();
  }

  const full = await loadAppointmentWithRelations(appointment._id);
  const sent = await sendAppointmentCancelledEmails(mapAppointment(full), appointment.cancelled_reason || '');
  if (sent && !appointment.cancelled_sent_at) {
    appointment.cancelled_sent_at = new Date();
    await appointment.save();
    full.cancelled_sent_at = appointment.cancelled_sent_at;
  }

  await writeAudit(req, req.user._id, 'appointment.declined', 'Appointment', appointment._id);
  return success(res, 'Appointment declined', mapAppointment(full));
});

router.patch('/mentor/availability/:id/status', authRequired, requireRole('mentor'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Availability not found', null, 404);

  const availability = await MentorAvailability.findOne({ _id: id, mentor_id: req.user._id });
  if (!availability) return failure(res, 'Availability not found', null, 404);

  availability.is_active = Boolean(req.body?.is_active);
  await availability.save();
  await writeAudit(req, req.user._id, 'availability.updated', 'MentorAvailability', availability._id, { is_active: availability.is_active });

  return success(res, 'Availability status updated', availability.toJSON());
});

router.get('/mentor/availability', authRequired, requireRole('mentor'), async (req, res) => {
  const rows = await MentorAvailability.find({ mentor_id: req.user._id }).sort({ day_of_week: 1, start_time: 1 });
  return success(res, 'Mentor availability retrieved', rows.map((item) => item.toJSON()));
});

router.get('/mentor/group-sessions', authRequired, requireRole('mentor'), async (req, res) => {
  const sessions = await GroupSession.find({ mentor_id: req.user._id }).sort({ event_date: 1, event_time: 1 });
  return success(res, 'Group sessions retrieved', sessions.map((item) => item.toJSON()));
});

router.post('/mentor/group-sessions', authRequired, requireRole('mentor'), async (req, res) => {
  const { title, event_date, event_time, venue } = req.body || {};
  if (!title || !event_date || !event_time || !venue) {
    return failure(res, 'Validation failed', null, 422);
  }

  const item = await GroupSession.create({
    mentor_id: req.user._id,
    title: String(title),
    event_date: String(event_date),
    event_time: String(event_time),
    venue: String(venue)
  });

  await writeAudit(req, req.user._id, 'group_session.created', 'GroupSession', item._id);
  return success(res, 'Group session created', item.toJSON(), 201);
});

router.patch('/mentor/appointments/:id/complete', authRequired, requireRole('mentor'), async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return failure(res, 'Appointment not found', null, 404);

  const appointment = await Appointment.findOne({ _id: id, mentor_id: req.user._id });
  if (!appointment) return failure(res, 'Appointment not found', null, 404);
  if (appointment.status !== 'confirmed') return failure(res, 'Only confirmed appointments can be completed', null, 422);

  appointment.status = 'completed';
  await appointment.save();
  await writeAudit(req, req.user._id, 'appointment.completed', 'Appointment', appointment._id);

  const full = await loadAppointmentWithRelations(appointment._id);
  await sendAppointmentCompletedEmail(mapAppointment(full));

  return success(res, 'Appointment marked as completed', mapAppointment(full));
});

router.post('/mentor/appointments/:id/notes', authRequired, requireRole('mentor'), async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body || {};

  if (!isObjectId(id)) return failure(res, 'Appointment not found', null, 404);
  if (!notes) return failure(res, 'Validation failed', null, 422);

  const appointment = await Appointment.findOne({ _id: id, mentor_id: req.user._id });
  if (!appointment) return failure(res, 'Appointment not found', null, 404);

  const note = await SessionNote.findOneAndUpdate(
    { appointment_id: appointment._id },
    { mentor_id: req.user._id, notes: String(notes) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await writeAudit(req, req.user._id, 'appointment.notes_updated', 'Appointment', appointment._id, { session_note_id: note._id });
  return success(res, 'Session note saved', note.toJSON());
});

export { router as v1Router };
