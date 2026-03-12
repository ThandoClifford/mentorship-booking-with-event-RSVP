import bcrypt from 'bcryptjs';
import { connectDb } from './config/db.js';
import { User } from './models/User.js';

async function seed() {
  await connectDb();

  const adminEmail = 'admin@ump.local';
  const exists = await User.findOne({ email: adminEmail });

  if (!exists) {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: await bcrypt.hash('Admin1234', 12),
      role: 'admin'
    });

    console.log('Seeded admin user: admin@ump.local / Admin1234');
  } else {
    console.log('Admin user already exists.');
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
