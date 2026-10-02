# Client Lead Management System (Mini CRM)

> **Future Interns — Full Stack Web Development Internship**  
> **Task 2 — Client Lead Management System (Mini CRM)**  
> **Repository:** `FUTURE_FS_02`

A complete, full-stack Client Lead Management System (Mini CRM) built to manage, track, and convert sales inquiries generated from website contact forms. Developed with a modern Node.js/Express REST backend, React with TypeScript, Tailwind CSS, and a robust database layer supporting MongoDB (Mongoose) with an integrated persistent ACID fallback.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Architecture & Directory Structure](#project-architecture--directory-structure)
5. [Demo Credentials](#demo-credentials)
6. [Prerequisites & Installation](#prerequisites--installation)
7. [Environment Configuration](#environment-configuration)
8. [Database Setup (MongoDB & Local Engine)](#database-setup-mongodb--local-engine)
9. [Running the Application](#running-the-application)
10. [REST API Documentation](#rest-api-documentation)
11. [Website Contact Form Simulator](#website-contact-form-simulator)
12. [Screenshots](#screenshots)
13. [Future Improvements](#future-improvements)
14. [Submission Details](#submission-details)

---

## 🎯 Project Overview

In real-world business scenarios, businesses lose prospective customers due to unorganized email inboxes and delayed responses. This Mini CRM serves as an automated intake and lead lifecycle management dashboard for administrators, enabling:

- Instant ingestion of inquiries from website contact forms.
- Full CRUD management of leads (Full Name, Company, Contact, Budget, Attribution Source).
- State-machine status progression: `New` ➔ `Contacted` ➔ `Converted`.
- Multi-threaded interaction notes per lead.
- Scheduled follow-up tasks with deadline alerts and overdue tracking.
- Dynamic filtering, multi-parameter search, and CSV data export.
- Real-time pipeline performance analytics and conversion rate statistics.

---

## ✨ Key Features

### 1. Secure Authentication & Admin Gate
- JWT-based authentication with bcrypt password hashing.
- Route protection middleware (`authMiddleware`) for all private CRUD endpoints.
- Auto-fill demo credentials shortcut for convenient evaluation.

### 2. Executive Dashboard
- **5 High-Impact Metric Cards**: Total Leads, New Inquiries, Contacted, Converted, and Follow-ups Due.
- **Conversion Pipeline Bar**: Visual breakdown of leads in each stage with real-time percentage calculations.
- **Acquisition Channel Distribution**: Visual attribution analytics (Website, LinkedIn, Instagram, Referral, Ads, Other).
- **Recent Inquiries & Upcoming Due Reminders**: Immediate visibility into pending checkpoints.

### 3. Comprehensive Lead Management (CRUD)
- **CREATE**: Add new leads with contact info, source attribution, estimated budget, requirements message, and follow-up date.
- **READ**: Filterable table with quick-action status updates, detailed profile drawer, and activity timestamps.
- **UPDATE**: In-place inline status switches or modal editing of lead parameters.
- **DELETE**: Permanent deletion with a safety confirmation dialog and cascading deletion of associated notes and follow-ups.

### 4. Advanced Search, Filtering & Sorting
- Dynamic live search across: Full Name, Company, Email, and Phone.
- Multi-dimensional filters: Status (`New`, `Contacted`, `Converted`), Source (`Website`, `LinkedIn`, etc.), and Follow-up state (`Due Today`, `Overdue`, `Upcoming`).
- One-click CSV export of filtered lead datasets.

### 5. Activity Notes & Follow-up Task Engine
- **Internal Notes**: Timestamped chronological discussion and call notes attached to leads.
- **Actionable Follow-ups**: Set task titles, due dates, and priority levels (`High`, `Medium`, `Low`). Mark tasks completed or overdue with real-time UI indicators.

### 6. Interactive Website Contact Form Simulator
- A live client-side portal simulating an external landing page contact form.
- Dispatches submissions to `POST /api/public/contact`, immediately creating a `New` lead with status `Website`, an initial audit note, and a 24-hour follow-up task.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Component-based, responsive SPA |
| **Styling** | Tailwind CSS v4 | SaaS dark-mode UI with sleek modern aesthetic |
| **Icons** | Lucide React | Clean, consistent icons |
| **Backend** | Node.js + Express | Modular REST API with structured controllers |
| **Database** | MongoDB + Mongoose / ACID File Store | Dual-mode persistence engine |
| **Security** | JSON Web Tokens (JWT) + BcryptJS | Tokenized auth and salted password hashing |
| **Build Tool** | Vite 8 + TSX | Fast dev server and optimized production build |

---

## 📁 Project Architecture & Directory Structure

```text
FUTURE_FS_02/
├── data/                         # Local database storage for persistent document fallback
│   └── mini_crm_db.json
├── server/                       # Backend architecture
│   ├── config/
│   │   └── db.ts                 # Database connector (MongoDB Mongoose + persistent fallback)
│   ├── controllers/
│   │   ├── authController.ts     # Admin login & profile controller
│   │   ├── leadController.ts     # Lead CRUD operations & validations
│   │   ├── noteController.ts     # Notes creation, editing, & deletion
│   │   ├── followUpController.ts # Follow-up scheduling & status toggling
│   │   └── dashboardController.ts# Aggregated metrics & pipeline analytics
│   ├── middleware/
│   │   └── auth.ts               # Bearer JWT verification middleware
│   ├── models/                   # Standard Mongoose Schemas & TypeScript interfaces
│   │   ├── User.ts               # Admin user model
│   │   ├── Lead.ts               # Lead model
│   │   ├── Note.ts               # Note model
│   │   └── FollowUp.ts           # Follow-up task model
│   └── routes/
│       ├── authRoutes.ts         # /api/auth routes
│       ├── leadRoutes.ts         # /api/leads routes
│       ├── noteRoutes.ts         # /api/notes routes
│       ├── followUpRoutes.ts     # /api/followups routes
│       ├── dashboardRoutes.ts    # /api/dashboard routes
│       └── publicRoutes.ts       # /api/public contact form and seed routes
├── src/                          # Frontend architecture
│   ├── components/
│   │   ├── ConfirmDialog.tsx     # Reusable confirmation modal
│   │   ├── LeadDetailModal.tsx   # Detailed lead view with notes & follow-ups
│   │   ├── LeadFormModal.tsx     # Add / Edit lead modal with validation
│   │   ├── Navbar.tsx            # Top header with quick actions
│   │   ├── Sidebar.tsx           # Navigation sidebar with status badges
│   │   └── Toast.tsx             # Alert & notification toast provider
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication context & persistent session
│   ├── pages/
│   │   ├── Dashboard.tsx         # Dashboard metrics and visualization
│   │   ├── FollowUps.tsx         # Dedicated follow-ups task manager
│   │   ├── Leads.tsx             # Complete leads table with filters & search
│   │   ├── Login.tsx             # Admin login page
│   │   ├── Settings.tsx          # System, database, and seed controls
│   │   └── WebsiteFormDemo.tsx   # Interactive website contact form simulator
│   ├── services/
│   │   └── api.ts                # Centralized typed HTTP API service
│   ├── types/
│   │   └── index.ts              # TypeScript domain types & interfaces
│   ├── App.tsx                   # Main application router & modal manager
│   ├── index.css                 # Tailwind CSS styles
│   └── main.tsx                  # React DOM mount point
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore file
├── metadata.json                 # Project metadata
├── package.json                  # Dependencies and scripts
├── server.ts                     # Full-stack Express server entry point
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build and plugin setup
```

---

## 🔑 Demo Credentials

For testing and grading the internship assignment:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@futureinterns.com` | `Admin@123` |

*(A **"Fill Credentials"** button is also available directly on the login screen for instant one-click testing.)*

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/FUTURE_FS_02.git
cd FUTURE_FS_02
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

---

## ⚙️ Environment Variables

The application reads from `.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=future-interns-crm-task-2-secret-2026
MONGODB_URI=mongodb://localhost:27017/mini_crm_db
```

---

## 🗄️ Database Setup

### Option A: Automatic Out-of-the-Box Setup (Zero-Configuration Fallback)
If you do not have MongoDB installed or running locally, **no action is required**. The system automatically initializes a persistent ACID-compliant document store in `./data/mini_crm_db.json`. All CRUD mutations, notes, and follow-ups persist reliably across restarts.

### Option B: MongoDB / MongoDB Atlas Connection
To connect to a live MongoDB instance or MongoDB Atlas cluster:
1. Provide your connection string in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mini_crm_db?retryWrites=true&w=majority
   ```
2. The server will detect the URI and automatically establish the connection using Mongoose (`server/models/`).

### Seeding Sample Data
The system comes pre-seeded with 10 realistic sample leads covering all stages (`New`, `Contacted`, `Converted`) and diverse lead sources.  
You can re-seed or reset the database anytime by visiting **Database & Settings** ➔ **"Reset & Seed Demo Data"**.

---

## ▶️ Running the Application

### Development Mode (Full Stack)
Runs Express backend on port `3000` with integrated Vite middleware:
```bash
npm run dev
```
Open your browser at: `http://localhost:3000`

### Production Build & Launch
```bash
# 1. Compile frontend assets
npm run build

# 2. Start production server
npm start
```

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/login`: Authenticate admin user and issue JWT.
- `POST /api/auth/logout`: Invalidate session.
- `GET /api/auth/me`: Retrieve current authenticated admin profile.

### Leads
- `GET /api/leads`: Retrieve all leads. Supports query params:
  - `status`: Filter by `New`, `Contacted`, `Converted`
  - `leadSource`: Filter by `Website`, `LinkedIn`, `Instagram`, etc.
  - `search`: Full text search across name, email, company, and phone
  - `sort`: `newest` or `oldest`
- `GET /api/leads/:id`: Retrieve lead by ID with nested notes and follow-ups.
- `POST /api/leads`: Create a new lead (requires valid name, email, phone, company).
- `PUT /api/leads/:id`: Update lead properties or change status.
- `DELETE /api/leads/:id`: Cascade delete lead and its related records.

### Notes
- `GET /api/leads/:id/notes`: Retrieve notes associated with a lead.
- `POST /api/leads/:id/notes`: Add a note to a lead.
- `PUT /api/notes/:id`: Update existing note content.
- `DELETE /api/notes/:id`: Delete a note.

### Follow-ups
- `GET /api/followups`: Retrieve all scheduled follow-ups (`?status=pending|completed`).
- `POST /api/leads/:id/followups`: Schedule a follow-up for a specific lead.
- `PUT /api/followups/:id`: Update follow-up details or toggle completion status.
- `DELETE /api/followups/:id`: Delete a follow-up task.

### Dashboard & Analytics
- `GET /api/dashboard/stats`: Returns KPI metrics, pipeline stages, source breakdown, and urgent due tasks.

### Public Endpoints
- `POST /api/public/contact`: Ingests inquiries from external website contact forms.
- `POST /api/public/seed`: Resets and seeds 10 demonstration leads into the database.

---

## 🌐 Website Contact Form Simulator

To test the end-to-end integration:
1. Log in to the CRM dashboard.
2. Click **"Web Form Simulator"** in the sidebar.
3. Select a preset (e.g. *SaaS Startup*, *FinTech Portal*) or enter custom lead information.
4. Click **"Submit Contact Inquiry"**.
5. Observe the instant ingestion confirmation and click **"Inspect Lead in CRM"** to verify that the lead was created in real-time with status `New`.

---

## 📸 Screenshots

*(Add screenshots of your running application before submitting to GitHub)*

1. **Dashboard Overview**: `docs/screenshots/dashboard.png`
2. **Leads Management Table**: `docs/screenshots/leads-table.png`
3. **Lead Details Drawer & Notes**: `docs/screenshots/lead-details.png`
4. **Follow-ups Workspace**: `docs/screenshots/followups.png`
5. **Website Contact Form Simulator**: `docs/screenshots/web-simulator.png`

---

## 🔮 Future Improvements

- Email notification dispatch via Nodemailer or SendGrid when a new lead arrives.
- Kanban board drag-and-drop view for drag-to-convert lead pipeline stages.
- Role-based permissions (Admin, Sales Rep, Support Agent).
- Google Calendar sync for scheduled follow-up dates.

---

## 🎓 Internship Submission Information

- **Organization**: Future Interns
- **Track**: Full Stack Web Development Internship
- **Task Number**: Task 2
- **Task Title**: Client Lead Management System (Mini CRM)
- **Repository Tag**: `FUTURE_FS_02`
