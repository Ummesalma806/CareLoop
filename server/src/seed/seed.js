import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Ticket from '../models/Ticket.js';
import TicketComment from '../models/TicketComment.js';
import KnowledgeArticle from '../models/KnowledgeArticle.js';
import Satisfaction from '../models/Satisfaction.js';

const PASSWORD = 'Password123';

async function seed() {
  await connectDB();

  // Purana demo data saaf karein (sirf hamare collections)
  await Promise.all([
    Ticket.deleteMany(), TicketComment.deleteMany(), KnowledgeArticle.deleteMany(),
    Satisfaction.deleteMany(), Category.deleteMany(), User.deleteMany(), Branch.deleteMany(),
  ]);

  const branches = await Branch.insertMany([
    { name: 'Karachi Central', code: 'KHI', city: 'Karachi' },
    { name: 'Lahore Campus', code: 'LHR', city: 'Lahore' },
    { name: 'Islamabad Campus', code: 'ISB', city: 'Islamabad' },
  ]);

  await Category.insertMany([
    { name: 'Technical Issue', description: 'Equipment, internet, portal or software problems' },
    { name: 'Billing & Fees', description: 'Payments, receipts and fee queries' },
    { name: 'Facilities', description: 'Classrooms, cleanliness, maintenance' },
    { name: 'Staff & Conduct', description: 'Feedback or complaints about staff' },
    { name: 'General Inquiry', description: 'Anything else' },
  ]);

  // Super admin (head office): no branch
  await User.create({ name: 'Head Office Admin', email: 'super@careloop.com', password: PASSWORD, role: 'admin', adminLevel: 'super' });

  // Har branch: 1 branch admin, 2 agents, 3 customers
  for (const b of branches) {
    const c = b.code.toLowerCase();
    await User.create({ name: `${b.city} Admin`, email: `admin.${c}@careloop.com`, password: PASSWORD, role: 'admin', adminLevel: 'branch', branch: b._id });
    for (let i = 1; i <= 2; i++) {
      await User.create({ name: `${b.city} Agent ${i}`, email: `agent${i}.${c}@careloop.com`, password: PASSWORD, role: 'agent', branch: b._id });
    }
    for (let i = 1; i <= 3; i++) {
      await User.create({ name: `${b.city} Customer ${i}`, email: `customer${i}.${c}@careloop.com`, password: PASSWORD, role: 'customer', branch: b._id });
    }
  }

  console.log('Seed complete.');
  console.log(`Branches: ${branches.length} | Users: ${await User.countDocuments()} | Categories: ${await Category.countDocuments()}`);
  console.log(`All demo accounts use password: ${PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });