# Careloop

**Every voice, resolved.**

Careloop is a multi-branch customer support ticketing system with a searchable knowledge base, built with the MERN stack. Customers raise tickets with their branch, agents claim and resolve them, and customers close the loop with a satisfaction rating. Admins track SLA performance and agent metrics across branches.

Built as the final project (Project 09: SupportSphere) for the MERN stack course.

## Live demo

| | Link |
|---|---|
| Frontend | https://care-loop-app.vercel.app |
| Backend API | `https://care-loop-api-seven.vercel.app/` (health check: `/api/health`) |
| GitHub | `https://github.com/Ummesalma806/CareLoop` |


Open the login page and use the demo account buttons, or the accounts below.

## Test accounts

Password for every account: `Password123`

| Role | Email |
|---|---|
| Customer | `customer1.khi@careloop.com` (also `customer2`, `customer3`) |
| Agent | `agent1.khi@careloop.com` (also `agent2`) |
| Branch admin | `admin.khi@careloop.com` |
| Super admin | `super@careloop.com` |

Replace `khi` with `lhr` (Lahore) or `isb` (Islamabad) for the other branches. Staff only see tickets of their own branch, so log in with the agent of the same branch as the customer's ticket.

## Features

**Customer**
- Register (choose a branch) and log in
- Raise a ticket with subject, description, category, priority and attachments (JPG, PNG, PDF)
- Suggested help articles appear while typing the subject
- Track tickets in Active and Closed tabs, with SLA countdown
- Reply to agents, view the full ticket history timeline
- Rate the service (1 to 5 stars) once a ticket is resolved, which closes the ticket

**Agent**
- Branch ticket queue with tabs and counts (Active, Unassigned, Overdue, Open, In progress, Resolved, Closed, All)
- Claim a ticket, reply to the customer, add internal notes the customer cannot see
- Mark tickets resolved, reopen or close them

**Admin (branch and super)**
- Dashboard with totals, status and priority charts
- Agent performance table: assigned, resolved, average resolution time, average rating, SLA breaches
- Assign tickets to agents
- Super admin also sees a branch comparison (tickets, resolved, SLA breaches, ratings)

**Knowledge base**
- Searchable help center, expandable articles, "Was this helpful?" voting

**Platform**
- Role-based access, branch-based data scoping, audit trail on every ticket
- Intro splash animation with skeleton loading, responsive layout with mobile drawer

## Engineering highlights

- **Customers only see their own tickets.** One central function (`ticketScope`) builds the base filter for every ticket query: customer sees own tickets, agent and branch admin see their branch, super admin sees all. The rule lives on the server, not just in the UI. A ticket outside your scope returns 404, so its existence is not revealed.
- **Assignment is recorded.** `assignedTo` and `assignedAt` are stored, and every claim or assignment is added to the history.
- **Ticket history is auditable.** Each ticket has an append-only `history` log (who, what, when, from, to), shown as a timeline.
- **SLA tracking.** A due date is set from priority: urgent 4h, high 8h, medium 24h, low 48h. Overdue tickets are flagged and counted as breaches in the metrics.
- **Server-side trust.** Public signup always creates a customer; the branch and customer of a ticket come from the logged-in user, never from the request body.
- Passwords hashed with bcrypt, JWT authentication, request validation with Zod, central error handling.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Framer Motion, Recharts, Axios |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT, bcryptjs |
| File storage | Cloudinary (via Multer) |
| Hosting | Vercel (frontend and backend) |

## Architecture

```
React client (Vercel)
      |  HTTPS + JWT in Authorization header
      v
Express API (Vercel serverless)
  routes -> middleware (auth, role, branch scope, upload) -> controllers -> models
      |                                   |
      v                                   v
MongoDB Atlas                        Cloudinary (attachments)
```

### Database collections

| Collection | Purpose |
|---|---|
| Branch | Campus or branch; also holds the counter for ticket keys like `KHI-0042` |
| User | Customer, agent or admin (`adminLevel`: branch or super), linked to a branch |
| Category | Ticket categories |
| Ticket | Ticket details, SLA, assignment, attachments and embedded audit history |
| TicketComment | Replies and internal notes |
| KnowledgeArticle | Help center articles (searchable, with votes) |
| Satisfaction | One rating per ticket, linked to the agent |

### Folder structure

```
CareLoop
├── client/                React app
│   └── src/ (pages, components, context, lib)
├── server/
│   ├── api/index.js       Vercel serverless entry
│   └── src/ (config, models, controllers, routes, middleware, utils, seed)
└── README.md
```

## API endpoints

Base path: `/api`. "Auth" means a `Bearer` token is required.

**Auth**
| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/register` | Public (creates a customer) |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Auth |

**Reference data**
| Method | Endpoint | Access |
|---|---|---|
| GET | `/branches` | Public |
| GET | `/categories` | Public |

**Tickets**
| Method | Endpoint | Access |
|---|---|---|
| POST | `/tickets` | Customer (multipart, supports `attachments`) |
| GET | `/tickets/me` | Customer |
| GET | `/tickets` | Agent, admin (branch scoped; filters `status`, `priority`, `unassigned`) |
| GET | `/tickets/:id` | Auth, within scope |
| PATCH | `/tickets/:id/assign` | Agent (claim), admin (`agentId`) |
| PATCH | `/tickets/:id/status` | Agent, admin |
| GET | `/tickets/:id/comments` | Auth, within scope (customers never get internal notes) |
| POST | `/tickets/:id/comments` | Auth, within scope (multipart, supports `attachments`) |
| POST | `/tickets/:id/satisfaction` | Customer |

**Knowledge base**
| Method | Endpoint | Access |
|---|---|---|
| GET | `/articles?search=&category=` | Public |
| GET | `/articles/:id` | Public |
| POST | `/articles/:id/vote` | Public |
| POST, PATCH, DELETE | `/articles`, `/articles/:id` | Agent, admin |

**Admin**
| Method | Endpoint | Access |
|---|---|---|
| GET | `/admin/stats` | Admin (totals, charts, agent metrics, branch comparison for super admin) |
| GET | `/admin/agents` | Admin |

## Run locally

Requirements: Node.js 18+, a MongoDB Atlas database, a Cloudinary account.

```bash
git clone YOUR-GITHUB-REPO-LINK
cd CareLoop
```

**Backend**
```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```
Fill in `server/.env`:
```
PORT=5000
NODE_ENV=development
MONGO_URI=your MongoDB Atlas connection string (with database name careloop)
JWT_SECRET=a long random string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
```bash
npm run seed              # loads demo branches, users, tickets, articles (clears existing data)
npm run dev               # http://localhost:5000
```

**Frontend**
```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

## Seed data

`npm run seed` creates 3 branches (Karachi, Lahore, Islamabad), 19 users across all roles, 36 tickets in mixed states with comments, ratings and history, and 8 help articles. It deletes existing data first, so use it only on a demo database.

## Demo flow

1. A customer raises a ticket and attaches a screenshot
2. An agent of the same branch claims it, replies, and marks it resolved
3. The customer rates the service, which closes the ticket
4. The admin dashboard shows the updated metrics and the ticket history shows every step

## Screenshots

Add images to a `screenshots` folder and link them here.

| Login | Customer tickets |
|---|---|
| ![Login](screenshots/login.png) | ![Tickets](screenshots/tickets.png) |

| Ticket detail | Admin dashboard |
|---|---|
| ![Detail](screenshots/ticket-detail.png) | ![Dashboard](screenshots/dashboard.png) |

## Future work

Auto-suggested category, sentiment summary, AI knowledge-base chatbot, canned replies, ticket transfer between branches, and live notifications.
