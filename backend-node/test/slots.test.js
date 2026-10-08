import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isStandardSlot,
  isValidAvailabilityWindow,
  standardSlotsForDateRange,
  standardSlotsWithinAvailability,
} from '../src/services/slots.js';

test('a full-day availability creates seven consecutive one-hour slots', () => {
  assert.deepEqual(
    standardSlotsWithinAvailability({ start_time: '09:00', end_time: '16:00' }),
    [
      { start_time: '09:00:00', end_time: '10:00:00' },
      { start_time: '10:00:00', end_time: '11:00:00' },
      { start_time: '11:00:00', end_time: '12:00:00' },
      { start_time: '12:00:00', end_time: '13:00:00' },
      { start_time: '13:00:00', end_time: '14:00:00' },
      { start_time: '14:00:00', end_time: '15:00:00' },
      { start_time: '15:00:00', end_time: '16:00:00' },
    ],
  );
});

test('partial availability produces only complete slots on the hourly grid', () => {
  assert.deepEqual(
    standardSlotsWithinAvailability({ start_time: '09:30', end_time: '12:00' }),
    [{ start_time: '10:00:00', end_time: '11:00:00' }, { start_time: '11:00:00', end_time: '12:00:00' }],
  );
});

test('availability outside 09:00-16:00 or with invalid times is rejected', () => {
  assert.equal(isValidAvailabilityWindow('08:00', '10:00'), false);
  assert.equal(isValidAvailabilityWindow('09:00', '16:30'), false);
  assert.equal(isValidAvailabilityWindow('11:00', '10:00'), false);
  assert.equal(isValidAvailabilityWindow('09:15', '10:00'), true);
  assert.deepEqual(standardSlotsWithinAvailability({ start_time: '09:00', end_time: '16:30' }), []);
});

test('only whole-hour slots within 09:00-16:00 are bookable', () => {
  assert.equal(isStandardSlot({ start_time: '09:00:00', end_time: '10:00:00' }), true);
  assert.equal(isStandardSlot({ start_time: '15:00', end_time: '16:00' }), true);
  assert.equal(isStandardSlot({ start_time: '08:00', end_time: '09:00' }), false);
  assert.equal(isStandardSlot({ start_time: '15:30', end_time: '16:30' }), false);
  assert.equal(isStandardSlot({ start_time: '09:00', end_time: '09:30' }), false);
});

test('the rolling schedule creates standard slots only on Tuesdays and Thursdays', () => {
  const slots = standardSlotsForDateRange('mentor-id', '2026-10-08', 8);
  assert.deepEqual([...new Set(slots.map((slot) => slot.date))], [
    '2026-10-08',
    '2026-10-13',
    '2026-10-15',
  ]);
  assert.equal(slots.length, 21);
  assert.ok(slots.every((slot) => slot.mentor_id === 'mentor-id' && isStandardSlot(slot)));
});
