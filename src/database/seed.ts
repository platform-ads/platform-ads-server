import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

import { seedRoles } from './seeds';

dotenv.config();

async function runSeeds() {
  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB_NAME;

  if (!mongoUri) {
    throw new Error('Missing required env var: MONGODB_URI');
  }
  if (!mongoDbName) {
    throw new Error('Missing required env var: MONGODB_DB_NAME');
  }

  try {
    await mongoose.connect(mongoUri, { dbName: mongoDbName });
    await seedRoles(mongoose);
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runSeeds().catch((err) => {
  console.error('Error during seeding process:', err);
  process.exit(1);
});
