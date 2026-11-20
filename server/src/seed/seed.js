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
import { calcDueAt } from '../utils/sla.js';

const PASSWORD = 'Password123';
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const hoursAfter = (d, h) => new Date(d.getTime() + h * 3600000);
const hoursAgo = (h) => new Date(Date.now() - h * 3600000);

const SUBJECTS = [
  ['Wi-Fi not working in lab', 'The internet has been down in the computer lab since morning.'],
  ['Cannot log in to student portal', 'My password is rejected even after resetting it twice.'],
  ['Fee receipt not received', 'I paid my fee last week but I have not received the receipt.'],
  ['Projector broken in classroom 4', 'The projector shows no signal and the class is being delayed.'],
  ['Air conditioner not cooling', 'The AC in the main hall is running but the room is very hot.'],
  ['Rude behaviour from front desk', 'I was spoken to rudely at the front desk when asking about my class.'],
  ['Request for course schedule', 'Please share the updated schedule for the next batch.'],
  ['Certificate has wrong name spelling', 'My name is misspelled on the certificate and needs correction.'],
  ['Washroom cleanliness issue', 'The washrooms on the second floor have not been cleaned for days.'],
  ['Attendance marked absent by mistake', 'I attended all classes this week but the portal shows me absent.'],
];
const REPLIES = [
  'Thank you for reaching out. We are looking into this right now.',
  'We have checked this and are working on a fix. Please bear with us.',
  'This has been resolved from our side. Please confirm if everything works for you.',
];
const COMMENTS = ['Excellent and quick service.', 'Helpful agent, thank you.', 'Took a while but got solved.', 'Very satisfied with the support.', 'Good, but communication could be better.'];

async function seed() {
  await connectDB();
  await Promise.all([Ticket, TicketComment, KnowledgeArticle, Satisfaction, Category, User, Branch].map((m) => m.deleteMany()));

  const branches = await Branch.insertMany([
    { name: 'Karachi Central', code: 'KHI', city: 'Karachi' },
    { name: 'Lahore Campus', code: 'LHR', city: 'Lahore' },
    { name: 'Islamabad Campus', code: 'ISB', city: 'Islamabad' },
  ]);
  const categories = await Category.insertMany([
    { name: 'Technical Issue', description: 'Equipment, internet, portal or software problems' },
    { name: 'Billing & Fees', description: 'Payments, receipts and fee queries' },
    { name: 'Facilities', description: 'Classrooms, cleanliness, maintenance' },
    { name: 'Staff & Conduct', description: 'Feedback or complaints about staff' },
    { name: 'General Inquiry', description: 'Anything else' },
  ]);

  const superAdmin = await User.create({ name: 'Head Office Admin', email: 'super@careloop.com', password: PASSWORD, role: 'admin', adminLevel: 'super' });

  for (const b of branches) {
    const c = b.code.toLowerCase();
    await User.create({ name: `${b.city} Admin`, email: `admin.${c}@careloop.com`, password: PASSWORD, role: 'admin', adminLevel: 'branch', branch: b._id });
    const agents = [];
    const customers = [];
    for (let i = 1; i <= 2; i++) agents.push(await User.create({ name: `${b.city} Agent ${i}`, email: `agent${i}.${c}@careloop.com`, password: PASSWORD, role: 'agent', branch: b._id }));
    for (let i = 1; i <= 3; i++) customers.push(await User.create({ name: `${b.city} Customer ${i}`, email: `customer${i}.${c}@careloop.com`, password: PASSWORD, role: 'customer', branch: b._id }));

    // 12 demo tickets per branch in mixed states
    for (let n = 0; n < 12; n++) {
      const [subject, description] = rand(SUBJECTS);
      const status = rand(['open', 'open', 'in_progress', 'in_progress', 'resolved', 'closed', 'closed', 'closed']);
      const priority = rand(['low', 'medium', 'medium', 'high', 'urgent']);
      const customer = rand(customers);
      const createdAt = hoursAgo(3 + Math.random() * 200);
      const t = new Ticket({
        key: await Branch.nextTicketKey(b._id), subject, description, category: rand(categories)._id, priority, status: 'open',
        customer: customer._id, branch: b._id, createdAt, sla: { dueAt: calcDueAt(priority, createdAt) },
      });
      t.history.push({ action: 'created', by: customer._id, to: 'open', at: createdAt });
      const comments = [{ author: customer._id, body: description, at: createdAt }];

      if (status !== 'open') {
        const agent = rand(agents);
        const claimedAt = hoursAfter(createdAt, 0.5 + Math.random() * 2);
        t.assignedTo = agent._id; t.assignedAt = claimedAt; t.status = 'in_progress';
        t.sla.firstResponseAt = hoursAfter(claimedAt, 0.3);
        t.history.push({ action: 'claimed', by: agent._id, to: agent.name, at: claimedAt });
        t.history.push({ action: 'status_changed', by: agent._id, from: 'open', to: 'in_progress', at: claimedAt });
        t.history.push({ action: 'comment_added', by: agent._id, note: 'reply', at: t.sla.firstResponseAt });
        comments.push({ author: agent._id, body: REPLIES[0], at: t.sla.firstResponseAt });

        if (status === 'resolved' || status === 'closed') {
          const resolvedAt = hoursAfter(createdAt, 2 + Math.random() * 40);
          t.status = 'resolved'; t.sla.resolvedAt = resolvedAt;
          t.history.push({ action: 'status_changed', by: agent._id, from: 'in_progress', to: 'resolved', at: resolvedAt });
          comments.push({ author: agent._id, body: REPLIES[2], at: resolvedAt });
          if (status === 'closed') {
            const closedAt = hoursAfter(resolvedAt, 1);
            const rating = rand([3, 4, 4, 5, 5, 5, 2]);
            t.status = 'closed'; t.closedAt = closedAt; t.isRated = true;
            t.history.push({ action: 'status_changed', by: customer._id, from: 'resolved', to: 'closed', at: closedAt });
            t.history.push({ action: 'rated', by: customer._id, to: `${rating}/5`, at: closedAt });
            await t.save();
            await Satisfaction.create({ ticket: t._id, customer: customer._id, agent: agent._id, branch: b._id, rating, comment: rand(COMMENTS), createdAt: closedAt });
          }
        }
      }
      if (t.isNew || t.isModified()) await t.save();
      await TicketComment.insertMany(comments.map((c) => ({ ticket: t._id, author: c.author, body: c.body, createdAt: c.at })));
    }
  }

  const cat = (name) => categories.find((x) => x.name === name)._id;
  await KnowledgeArticle.insertMany([
    { title: 'How to reset your portal password', body: 'Open the student portal login page and click "Forgot password". Enter your registered email and follow the link we send you. If you do not receive the email within 10 minutes, check your spam folder or raise a ticket.', category: cat('Technical Issue'), tags: ['password', 'login', 'portal'], author: superAdmin._id },
    { title: 'Wi-Fi not connecting in classrooms', body: 'Forget the network on your device and reconnect with the credentials given at admission. If the problem is in a whole lab or classroom, raise a Technical Issue ticket with the room number so an agent can check the router.', category: cat('Technical Issue'), tags: ['wifi', 'internet', 'network'], author: superAdmin._id },
    { title: 'Fee payment methods and receipts', body: 'Fees can be paid by bank transfer, online banking or at the branch accounts office. Receipts are emailed within 24 hours of confirmation. Keep your transaction ID until you receive the receipt.', category: cat('Billing & Fees'), tags: ['fee', 'payment', 'receipt'], author: superAdmin._id },
    { title: 'How to request a fee refund', body: 'Refund requests must be raised as a Billing ticket within 7 days of payment. Attach the payment proof and state the reason. Approved refunds are processed within 10 working days.', category: cat('Billing & Fees'), tags: ['refund', 'fee'], author: superAdmin._id },
    { title: 'Reporting a facility problem', body: 'For broken equipment, cleanliness or maintenance issues, raise a Facilities ticket and mention the room or floor. Urgent safety issues should also be reported to the front desk immediately.', category: cat('Facilities'), tags: ['facility', 'maintenance', 'cleaning'], author: superAdmin._id },
    { title: 'How to correct details on your certificate', body: 'Raise a General Inquiry ticket with a copy of your ID card showing the correct spelling. Corrected certificates are issued within 2 weeks.', category: cat('General Inquiry'), tags: ['certificate', 'name', 'correction'], author: superAdmin._id },
    { title: 'Understanding ticket priorities and response times', body: 'Urgent tickets are targeted within 4 hours, High within 8 hours, Medium within 24 hours and Low within 48 hours. Choose the priority that matches the real impact of your issue.', category: cat('General Inquiry'), tags: ['sla', 'priority', 'ticket'], author: superAdmin._id },
    { title: 'How to give feedback about staff', body: 'We take staff conduct seriously. Raise a Staff & Conduct ticket describing what happened, when and where. Your complaint is reviewed by the branch admin and handled confidentially.', category: cat('Staff & Conduct'), tags: ['staff', 'complaint', 'feedback'], author: superAdmin._id },
  ]);

  console.log('Seed complete.');
  console.log(`Branches: ${branches.length} | Users: ${await User.countDocuments()} | Tickets: ${await Ticket.countDocuments()} | Ratings: ${await Satisfaction.countDocuments()} | Articles: ${await KnowledgeArticle.countDocuments()}`);
  console.log(`All demo accounts use password: ${PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
