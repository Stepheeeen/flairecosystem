import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const users = await db.collection('users').find({}).toArray();
  console.log("Users:", users.map(u => ({ 
    email: u.email, 
    role: u.role, 
    emailVerified: u.emailVerified,
    companyId: u.companyId
  })));
  process.exit(0);
}
listUsers();
