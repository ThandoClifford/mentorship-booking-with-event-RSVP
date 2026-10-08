import { TimeSlot } from '../models/TimeSlot.js';

const SLOT_START_MINUTES = 9 * 60;
const SLOT_END_MINUTES = 16 * 60;
const SLOT_DURATION_MINUTES = 60;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::00)?$/;
const DAYS_TO_MAINTAIN = 30;
const SLOT_DAYS = new Set([2, 4]);
const pendingSchedules = new Map();

function timeInMinutes(value) {
  const match = TIME_PATTERN.exec(String(value || ''));
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function isStandardSlot(slot) {
  const start = timeInMinutes(slot?.start_time);
  const end = timeInMinutes(slot?.end_time);
  return start !== null
    && end !== null
    && start >= SLOT_START_MINUTES
    && start < SLOT_END_MINUTES
    && start % SLOT_DURATION_MINUTES === 0
    && end - start === SLOT_DURATION_MINUTES;
}

export function isValidAvailabilityWindow(startTime, endTime) {
  const start = timeInMinutes(startTime);
  const end = timeInMinutes(endTime);
  return start !== null
    && end !== null
    && start >= SLOT_START_MINUTES
    && end <= SLOT_END_MINUTES
    && end > start;
}

export function standardSlotsWithinAvailability(availability) {
  const start = timeInMinutes(availability?.start_time);
  const end = timeInMinutes(availability?.end_time);
  if (!isValidAvailabilityWindow(availability?.start_time, availability?.end_time)) return [];

  const slots = [];
  for (let slotStart = SLOT_START_MINUTES; slotStart + SLOT_DURATION_MINUTES <= SLOT_END_MINUTES; slotStart += SLOT_DURATION_MINUTES) {
    if (slotStart < start || slotStart + SLOT_DURATION_MINUTES > end) continue;
    slots.push({
      start_time: `${String(Math.floor(slotStart / 60)).padStart(2, '0')}:00:00`,
      end_time: `${String(Math.floor((slotStart + SLOT_DURATION_MINUTES) / 60)).padStart(2, '0')}:00:00`,
    });
  }
  return slots;
}

export function standardSlotsForDateRange(mentorId, startDate = new Date(), days = DAYS_TO_MAINTAIN) {
  const start = startDate instanceof Date
    ? new Date(`${startDate.toISOString().slice(0, 10)}T00:00:00.000Z`)
    : new Date(`${String(startDate).slice(0, 10)}T00:00:00.000Z`);
  if (!Number.isFinite(start.getTime()) || !Number.isInteger(days) || days < 1) return [];

  const standardSlots = standardSlotsWithinAvailability({ start_time: '09:00', end_time: '16:00' });
  const scheduledSlots = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + offset);
    if (!SLOT_DAYS.has(date.getUTCDay())) continue;

    const dateString = date.toISOString().slice(0, 10);
    for (const slot of standardSlots) {
      scheduledSlots.push({
        mentor_id: mentorId,
        date: dateString,
        ...slot,
        status: 'available',
      });
    }
  }

  return scheduledSlots;
}

export async function ensureUpcomingSlotsForMentor(mentorId, startDate = new Date()) {
  const mentorKey = String(mentorId);
  const startDateString = startDate instanceof Date ? startDate.toISOString().slice(0, 10) : String(startDate).slice(0, 10);
  const key = `${mentorKey}:${startDateString}`;
  const pending = pendingSchedules.get(key);
  if (pending) return pending;

  const schedule = standardSlotsForDateRange(mentorId, startDateString);
  const operation = schedule.length
    ? TimeSlot.bulkWrite(schedule.map((slot) => ({
      updateOne: {
        filter: {
          mentor_id: slot.mentor_id,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
        },
        update: { $setOnInsert: slot },
        upsert: true,
      },
    })), { ordered: false }).then((result) => result.upsertedCount)
    : Promise.resolve(0);

  pendingSchedules.set(key, operation);
  try {
    return await operation;
  } finally {
    pendingSchedules.delete(key);
  }
}
