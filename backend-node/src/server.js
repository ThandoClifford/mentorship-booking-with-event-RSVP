import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { ensureUpcomingSlotsForMentor } from './services/slots.js';

const SLOT_MAINTENANCE_INTERVAL = 12 * 60 * 60 * 1000;

async function maintainVerifiedMentorSlots() {
  const mentors = await User.find({
    role: 'mentor',
    mentor_verified_at: { $ne: null },
  }).select('_id');

  let created = 0;
  for (const mentor of mentors) {
    created += await ensureUpcomingSlotsForMentor(mentor._id);
  }

  console.log(`Maintained 30-day slot schedule for ${mentors.length} verified mentors; created ${created} slots.`);
}

async function bootstrap() {
  await connectDb();
  await maintainVerifiedMentorSlots();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Node backend listening on http://localhost:${env.port}`);
  });

  const maintenanceTimer = setInterval(() => {
    maintainVerifiedMentorSlots().catch((error) => {
      console.error('Failed to maintain verified mentor slots:', error);
    });
  }, SLOT_MAINTENANCE_INTERVAL);
  maintenanceTimer.unref();
}

bootstrap().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
