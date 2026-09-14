function pad(value, size = 2) {
  return String(value).padStart(size, '0');
}

function formatICSDate(date) {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const minute = pad(date.getUTCMinutes());
  const second = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

function escapeICS(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function buildDescription(parts) {
  return Object.entries(parts)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\\n');
}

export function generateICS({ summary, description, organizer, attendees, start, end, location, uid }) {
  const createdAt = formatICSDate(new Date());
  const dtstart = formatICSDate(start);
  const dtend = formatICSDate(end);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UMP-CFERI//Mentorship Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  if (organizer) {
    lines.push(`BEGIN:VEVENT`);
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${createdAt}`);
    lines.push(`DTSTART;TZID=Africa/Johannesburg:${dtstart.replace('Z', '')}`);
    lines.push(`DTEND;TZID=Africa/Johannesburg:${dtend.replace('Z', '')}`);
    lines.push(`SUMMARY:${escapeICS(summary)}`);
    if (description) lines.push(`DESCRIPTION:${escapeICS(description)}`);
    if (location) lines.push(`LOCATION:${escapeICS(location)}`);
    lines.push(`ORGANIZER;CN=${escapeICS(organizer.name)}:mailto:${escapeICS(organizer.email)}`);
    for (const attendee of attendees || []) {
      lines.push(`ATTENDEE;CN=${escapeICS(attendee.name)}:mailto:${escapeICS(attendee.email)}`);
    }
    lines.push(`END:VEVENT`);
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

export function buildConfirmedICS(appointment) {
  const slot = appointment?.time_slot || {};
  const date = String(slot.date || '').trim();
  const startTime = String(slot.start_time || '').trim();
  const endTime = String(slot.end_time || '').trim();

  if (!date || !startTime || !endTime) return null;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const [year, month, day] = date.split('-').map(Number);

  const start = new Date(Date.UTC(year, month - 1, day, startHour || 0, startMinute || 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day, endHour || 0, endMinute || 0, 0));

  const mentorName = appointment?.mentor?.name || 'Mentor';
  const mentorEmail = appointment?.mentor?.email || '';
  const studentName = appointment?.public_student?.full_name || appointment?.student?.name || 'Student';
  const studentEmail = appointment?.public_student?.email || appointment?.student?.email || '';
  const reason = appointment?.appointment_subject || '';

  const summary = `UMP-CFERI Mentorship Session – ${mentorName}`;
  const description = buildDescription({
    Mentor: mentorName,
    Student: studentName,
    Reason: reason,
    Notes: 'This mentorship session has been confirmed by the mentor.'
  });

  const uid = `appointment-${appointment.id}@ump-cferi`;

  const attendees = [];
  if (studentEmail) attendees.push({ name: studentName, email: studentEmail });
  if (mentorEmail) attendees.push({ name: mentorName, email: mentorEmail });

  return generateICS({
    summary,
    description,
    organizer: mentorEmail ? { name: mentorName, email: mentorEmail } : null,
    attendees,
    start,
    end,
    location: 'UMP-CFERI',
    uid
  });
}
