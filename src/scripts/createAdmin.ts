import 'module-alias/register';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import { connectToDB } from '@/config/db';
import Admin from '@/model/Admin';

console.log('Starting createAdmin script...');

async function createTestAdmin() {
  try {
    await connectToDB();
    const phoneNumber = '9714024077';
    const password = 'Admin@123';

    const existingAdmin = await Admin.findOne({ phoneNumber });
    if (existingAdmin) {
      console.log('Admin already exists:', phoneNumber);
      return;
    }

    const admin = new Admin({
      phoneNumber,
      password,
    });

    await admin.save();
    console.log('Test admin created successfully:', phoneNumber);
  } catch (error) {
    console.error('Error creating test admin:', error);
  } finally {
    process.exit();
  }
}

createTestAdmin();