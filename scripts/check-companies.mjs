import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const companies = await db.collection('companies').find({}).toArray();
  console.log("Companies:", companies.map(c => ({ slug: c.slug, id: c._id })));
  process.exit(0);
}
check();
