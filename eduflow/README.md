# EduFlow — AI-Powered School Management System

Full-stack MERN project (MongoDB + Express + React + Node.js) with 4 roles —
Admin, Teacher, Student, Parent — real-time chat (Socket.IO), and an AI
Assistant powered by the Anthropic Claude API.

> **Disclaimer:** All names/branding here ("EduFlow") are original. This was
> built feature-for-feature from a tutorial's video walkthrough, not copied
> from anyone's source code — some implementation details will differ from
> the original project.

---

## 1. Requirements

- Node.js 18+ and npm
- MongoDB (local install, or a free MongoDB Atlas cluster)
- An Anthropic API key (for AI Assistant) — get one at https://console.anthropic.com
- (Optional) A Gmail account + [App Password](https://myaccount.google.com/apppasswords) for sending real emails

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
MONGO_URI=mongodb://127.0.0.1:27017/eduflow      # or your Atlas connection string
JWT_SECRET=any_long_random_string
ANTHROPIC_API_KEY=sk-ant-...                      # required for AI Assistant
SMTP_USER=you@gmail.com                           # optional - emails just log to console if left blank
SMTP_PASS=your_16_char_app_password
```

Create a demo school to log in with immediately (optional but recommended):

```bash
npm run seed
```

This prints:

```
Email: admin@demo-school.com
Password: Demo@123
```

Start the backend:

```bash
npm run dev
```

Server runs at **http://localhost:5000**. Visit `http://localhost:5000/api/health` to confirm it's up.

## 3. Frontend Setup

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** (Vite proxies `/api` and `/socket.io` to the backend automatically — see `vite.config.js`).

## 4. First login

1. Open http://localhost:5173
2. Either:
   - Log in as **Admin** with the seeded demo account above, or
   - Click **Register School** to create your own (OTP is printed in the
     backend terminal if SMTP isn't configured).
3. As Admin: create a **Class** → create a **Subject** → create a **Teacher**
   → create a **Student** (this auto-creates linked Teacher/Student/Parent
   login accounts — temporary passwords are printed in the backend console
   if email isn't configured).
4. Log out and log back in as Teacher / Student / Parent using those
   generated credentials to see their dashboards.

## 5. Project Structure

```
eduflow/
  backend/
    config/        # DB connection, permissions catalogue
    controllers/    # one file per module (students, fees, attendance, ai, ...)
    middleware/      # auth (JWT + role + permission checks), error handler, uploads
    models/          # Mongoose schemas
    routes/          # Express routers, one per module
    utils/           # email, AI service (Claude), token helpers, seed script
    server.js        # app entrypoint + Socket.IO setup
  frontend/
    src/
      api/           # axios instance + socket.io client
      components/    # Sidebar, DashboardLayout, shared chat/attendance widgets
      context/        # AuthContext (login/logout/current user)
      pages/
        admin/        # Admin-only pages (Students, Teachers, Fees, Reports, Settings...)
        teacher/       # Teacher pages (also reused by Admin for shared modules)
        student/       # Student pages
        parent/        # Parent pages
        shared/        # Components reused across roles (Attendance, Homework,
                        # Timetable, Tests/Exams, Results, Study Material, Notices)
```

## 6. Feature Checklist (matches the full module list)

| Module | Status |
|---|---|
| School Registration + OTP verification | ✅ |
| Multi-role login (Admin/Teacher/Student/Parent) | ✅ |
| Admin Dashboard (live stats, attendance chart, finance summary, notices) | ✅ |
| Students module (CRUD, auto-generates Student + Parent logins) | ✅ |
| Classes module | ✅ |
| Subjects & Teachers, Subject↔Class assignment | ✅ |
| Attendance marking + per-student history/stats | ✅ |
| Fee Structure, Collection, Receipts, Concession, Reports (Day Book, Class Report, Defaulters, Ledger, Finance) | ✅ |
| Homework | ✅ |
| Timetable (Periods + per-class grid) | ✅ |
| Notice Board | ✅ |
| Communication (real-time chat via Socket.IO) | ✅ |
| Reports Dashboard (attendance chart + exam grade distribution) | ✅ |
| Finance section | ✅ (part of Fees → Reports) |
| AI Assistant (Quiz Generator, Homework Helper, Event Planner, Notice Generator, "ask about my school" chat) | ✅ |
| Roles & Permissions (toggle teacher capabilities) | ✅ |
| Tests & Exams | ✅ |
| Result Entry + Publishing (auto grade calculation) | ✅ |
| Study Material upload (PDF/Notes/Past Paper/Worksheet) | ✅ |
| School Settings | ✅ |
| Teacher Dashboard | ✅ |
| Student Dashboard (attendance, homework, exams, fees, progress) | ✅ |
| Parent Dashboard (child's attendance, results, fees, notices) | ✅ |

## 7. Known limitations / what to harden before real production use

- **Class-level data isolation is partial.** Students/Parents are always
  restricted to *their own* attendance/results/fees (enforced server-side),
  but a couple of list endpoints (Tests & Exams, Study Material) filter by
  class mainly on the frontend. Fine for a demo/school project; for a public
  production deployment, add server-side class-ownership checks on those too.
- **Email sending is optional.** If `SMTP_USER`/`SMTP_PASS` are blank, the
  app still works — OTPs and generated passwords are printed to the backend
  console instead of emailed.
- **File uploads** (Study Material, student documents) are stored on local
  disk under `backend/uploads/` — fine for development; use S3 or similar
  for real deployment.
- **AI Assistant** requires your own Anthropic API key and will return a
  clear error message in the UI if it's missing — it does not silently fail.
- No automated test suite is included.

## 8. Useful scripts

```bash
# Backend
npm run dev      # start with nodemon (auto-restart)
npm run start    # start normally
npm run seed      # create a demo school for quick login

# Frontend
npm run dev       # start Vite dev server
npm run build     # production build
```
"# education-school-managment" 
