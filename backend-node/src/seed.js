import bcrypt from 'bcryptjs';
import { connectDb } from './config/db.js';
import { Announcement } from './models/Announcement.js';
import { Appointment } from './models/Appointment.js';
import { CentreEvent } from './models/CentreEvent.js';
import { TimeSlot } from './models/TimeSlot.js';
import { User } from './models/User.js';

async function ensureUser({ name, email, password, role, faculty = null }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;

  return User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role,
    faculty
  });
}

async function ensureAnnouncement({ title, type, message, published_on }) {
  const existing = await Announcement.findOne({ title, published_on });
  if (existing) return existing;

  return Announcement.create({ title, type, message, published_on });
}

async function ensureEvent({ title, event_date, event_time, venue, category }) {
  const existing = await CentreEvent.findOne({ title, event_date, event_time });
  if (existing) return existing;

  return CentreEvent.create({ title, event_date, event_time, venue, category });
}

async function ensureSlot({ mentor_id, date, start_time, end_time, status = 'available' }) {
  const existing = await TimeSlot.findOne({ mentor_id, date, start_time, end_time });
  if (existing) {
    if (existing.status !== status) {
      existing.status = status;
      await existing.save();
    }

    return existing;
  }

  return TimeSlot.create({ mentor_id, date, start_time, end_time, status });
}

async function ensureAppointment({
  student_id,
  mentor_id,
  time_slot_id,
  status,
  student_contact_details,
  appointment_subject,
  reminder_sent_at = null,
  confirmed_sent_at = null
}) {
  const existing = await Appointment.findOne({ student_id, time_slot_id });
  if (existing) return existing;

  return Appointment.create({
    student_id,
    mentor_id,
    time_slot_id,
    status,
    student_contact_details,
    appointment_subject,
    reminder_sent_at,
    confirmed_sent_at
  });
}

async function seed() {
  await connectDb();

  const admin = await ensureUser({
    name: 'System Admin',
    email: 'admin@ump.local',
    password: 'Admin1234',
    role: 'admin'
  });

  const mentorA = await ensureUser({
    name: 'Dr. Nomusa Dlamini',
    email: 'mentor1@ump.local',
    password: 'Mentor1234',
    role: 'mentor',
    faculty: 'Engineering'
  });
  mentorA.mentor_verified_at = mentorA.mentor_verified_at || new Date();
  await mentorA.save();

  const mentorB = await ensureUser({
    name: 'Mr. Kabelo Mokoena',
    email: 'mentor2@ump.local',
    password: 'Mentor1234',
    role: 'mentor',
    faculty: 'Computer Science'
  });
  mentorB.mentor_verified_at = mentorB.mentor_verified_at || new Date();
  await mentorB.save();

  const studentA = await ensureUser({
    name: 'Lerato Molefe',
    email: 'student1@ump.local',
    password: 'Student1234',
    role: 'student',
    faculty: 'Engineering'
  });

  const studentB = await ensureUser({
    name: 'Sipho Mthembu',
    email: 'student2@ump.local',
    password: 'Student1234',
    role: 'student',
    faculty: 'Information Technology'
  });

  const studentC = await ensureUser({
    name: 'Anele Ncube',
    email: 'student3@ump.local',
    password: 'Student1234',
    role: 'student',
    faculty: 'Computer Science'
  });

  await Promise.all([
    ensureAnnouncement({
      title: 'Career Fair Week',
      type: 'Notice',
      message: 'Bring your updated CV and student card for recruiter check-ins at the mentoring centre.',
      published_on: '2026-03-10'
    }),
    ensureAnnouncement({
      title: 'Mock Interview Signups Open',
      type: 'Opportunity',
      message: 'Book a 30-minute mock interview slot with mentors before Friday 17:00.',
      published_on: '2026-03-12'
    }),
    ensureAnnouncement({
      title: 'CV Clinic Walk-In Hours',
      type: 'Reminder',
      message: 'Drop in on Tuesday and Thursday from 13:00-16:00 for quick CV reviews.',
      published_on: '2026-03-14'
    }),
    ensureAnnouncement({
      title: 'Exam Prep Group Sessions',
      type: 'Event',
      message: 'Join group mentoring sessions for exam preparation on topics requested by students.',
      published_on: '2026-03-16'
    }),
    ensureAnnouncement({
      title: 'New Workshop: Networking Skills',
      type: 'Workshop',
      message: 'Sign up for the networking workshop to improve interviewer communication and confidence.',
      published_on: '2026-03-18'
    })
  ]);

  await Promise.all([
    ensureEvent({
      title: 'Industry Mentorship Showcase',
      event_date: '2026-03-24',
      event_time: '10:00',
      venue: 'Main Hall A',
      category: 'Workshop'
    }),
    ensureEvent({
      title: 'Women in STEM Fireside Chat',
      event_date: '2026-03-26',
      event_time: '14:00',
      venue: 'Innovation Hub',
      category: 'Talk'
    }),
    ensureEvent({
      title: 'Final Year Project Pitch Clinic',
      event_date: '2026-04-02',
      event_time: '09:30',
      venue: 'Lab 3',
      category: 'Coaching'
    }),
    ensureEvent({
      title: 'Career Development Panel',
      event_date: '2026-04-05',
      event_time: '11:00',
      venue: 'Conference Room B',
      category: 'Panel'
    }),
    ensureEvent({
      title: 'Graduate Applications Q&A',
      event_date: '2026-04-08',
      event_time: '15:00',
      venue: 'Lecture Theatre 2',
      category: 'Q&A'
    })
  ]);

  const slot1 = await ensureSlot({
    mentor_id: mentorA._id,
    date: '2026-03-19',
    start_time: '09:00',
    end_time: '09:30',
    status: 'booked'
  });

  const slot2 = await ensureSlot({
    mentor_id: mentorA._id,
    date: '2026-03-19',
    start_time: '10:00',
    end_time: '10:30',
    status: 'booked'
  });

  const slot3 = await ensureSlot({
    mentor_id: mentorB._id,
    date: '2026-03-21',
    start_time: '11:00',
    end_time: '11:30',
    status: 'booked'
  });

  const slot4 = await ensureSlot({
    mentor_id: mentorA._id,
    date: '2026-03-22',
    start_time: '13:00',
    end_time: '13:30',
    status: 'available'
  });

  const slot5 = await ensureSlot({
    mentor_id: mentorB._id,
    date: '2026-03-22',
    start_time: '14:00',
    end_time: '14:30',
    status: 'available'
  });

  await Promise.all([
    ensureAppointment({
      student_id: studentA._id,
      mentor_id: mentorA._id,
      time_slot_id: slot1._id,
      status: 'confirmed',
      student_contact_details: 'lerato.molefe@ump.local / +27 71 100 0001',
      appointment_subject: 'Internship application strategy',
      reminder_sent_at: new Date(),
      confirmed_sent_at: new Date()
    }),
    ensureAppointment({
      student_id: studentB._id,
      mentor_id: mentorA._id,
      time_slot_id: slot2._id,
      status: 'pending',
      student_contact_details: 'sipho.mthembu@ump.local / +27 71 100 0002',
      appointment_subject: 'CV and cover letter review'
    }),
    ensureAppointment({
      student_id: studentC._id,
      mentor_id: mentorB._id,
      time_slot_id: slot3._id,
      status: 'completed',
      student_contact_details: 'anele.ncube@ump.local / +27 71 100 0003',
      appointment_subject: 'Project portfolio feedback',
      confirmed_sent_at: new Date()
    }),
    ensureAppointment({
      student_id: studentA._id,
      mentor_id: mentorA._id,
      time_slot_id: slot4._id,
      status: 'pending',
      student_contact_details: 'lerato.molefe@ump.local / +27 71 100 0001',
      appointment_subject: 'Scholarship interview prep'
    }),
    ensureAppointment({
      student_id: studentB._id,
      mentor_id: mentorB._id,
      time_slot_id: slot5._id,
      status: 'pending',
      student_contact_details: 'sipho.mthembu@ump.local / +27 71 100 0002',
      appointment_subject: 'Final term report feedback'
    })
  ]);

  const [announcementCount, eventCount, bookingCount] = await Promise.all([
    Announcement.countDocuments(),
    CentreEvent.countDocuments(),
    Appointment.countDocuments()
  ]);

  console.log(`Seed complete. Admin: ${admin.email}`);
  console.log(`Presentation data counts -> announcements: ${announcementCount}, events: ${eventCount}, bookings: ${bookingCount}`);
  console.log('Demo logins: admin@ump.local / Admin1234, mentor1@ump.local / Mentor1234, student1@ump.local / Student1234');

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
