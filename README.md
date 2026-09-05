# ENGINEERING DAY 2026 — Official University Portal

A full-stack web application for **Engineering Day 2026** (14th & 15th September 2026). Inspired by the official futuristic event poster, this portal provides a complete registration, manual UPI/QR payment verification, student admission pass generator, and administrative control center for university symposiums.

---

## 🎨 Visual Identity

- **Poster Palette**:
  - Primary Background: `#010914` (Deep Tech Navy)
  - Deep Background: `#000510`
  - Engineering Yellow: `#FFC800` (CTAs, key phrases, "DAY" headline)
  - Electric Blue: `#008CFF` & Cyan: `#00BFFF` (Gradients and borders)
  - Neon Cyan: `#00D9FF` (Glows, HUD tactical corners, and circuit highlights)
  - Text: `#FFFFFF` (White) and `#D0D5DC` (Light Grey)
- **Typography**: Anton & Oswald for high-impact condensed headers; Inter and Space Grotesk for digital technical specifications.
- **Aesthetic**: Rotating mechanical gear motifs, circuit board vector overlays, HUD tactical brackets, live countdown timer to 14 September 2026.
- **Strict Compliance**: No DJ celebration exists anywhere across the portal.

---

## ⚡ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Tooling**: Vite
- **Styling**: Tailwind CSS with custom neon glows and HUD utilities
- **Icons**: Lucide React
- **Effects & Print**: Canvas-Confetti, CSS print stylesheets for printable admission badges
- **Routing & Networking**: React Router v6, Axios

### Backend
- **Runtime**: Node.js & Express.js with TypeScript
- **Database & ORM**: PostgreSQL (Production) / SQLite (Zero-config local development) via Prisma ORM
- **Authentication**: JWT, bcryptjs password hashing, role-based authorization (`STUDENT`, `ADMIN`, `SUPER_ADMIN`)
- **File Upload & Security**: Multer with strict MIME/extension whitelisting (`JPG`, `JPEG`, `PNG`, `WEBP`) and 5MB size limit. Payment receipts are stored privately and only served through authenticated authorization guards.
- **Data Export**: ExcelJS (styled `.xlsx` spreadsheets) and native CSV streaming
- **Email Service**: Nodemailer architecture with mock console fallback when SMTP credentials are not configured

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js v18+ (tested on v24)
- npm v9+

### 2. Install Dependencies
Install dependencies for both root, server, and client:

```powershell
# In project root:
npm run install:all
```

Or individually:
```powershell
cd server
npm install

cd ../client
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` in `server/` to `.env`:

```powershell
cd server
cp .env.example .env
```

Default local `.env` values:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=supersecret_jwt_key_eng26_replace_in_prod_94ea5d4c
ADMIN_EMAIL=admin@engineeringday2026.edu
ADMIN_PASSWORD=AdminPass#2026!
CORS_ORIGIN=http://localhost:5173
DEFAULT_UPI_ID=engineeringday2026@upi
DEFAULT_UPI_NAME=Engineering Day 2026 Organizers
MAX_FILE_SIZE_MB=5
```

### 4. Initialize Database & Seed
Initialize the database schema and seed the initial events, settings, and administrator account:

```powershell
cd server
npx prisma db push
npx ts-node-dev prisma/seed.ts
```

This seeds:
- **Admin account**: `admin@engineeringday2026.edu` / `AdminPass#2026!`
- **Day 1 Events**:
  1. `E-SPORTS — BGMI` (₹49)
  2. `E-SPORTS — FREE FIRE` (₹49)
  3. `BLIND CODING COMPETITION` (₹49)
  4. `QUIZ COMPETITION` (Free Entry)
- **Day 2 Events**:
  5. `CULTURAL PERFORMANCE` (Free Entry)
- System settings and default QR code path (`Qr Code For Payment.jpeg`).

### 5. Run Development Servers

Run backend and frontend simultaneously:

**Terminal 1 (Backend API):**
```powershell
cd server
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```powershell
cd client
npm run dev
# Client running at http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🎮 Dedicated E-Sports Team Registration Module (BGMI & Free Fire)

An integrated, team-based competition engine built specifically for BGMI and Free Fire:
- **Team Size**: 1 to 4 players (1: Captain only, 2: Captain + 1, 3: Captain + 2, 4: Captain + 3).
- **Team Captain**: The logged-in student who creates the team automatically becomes the Team Captain. Profile information (Full Name, Email, Mobile, Course, Semester, Roll Number) is auto-populated.
- **Dynamic Fee Calculation**: Strictly calculated on the backend as **`Number of Members × ₹49`**:
  - 1 Member = **₹49**
  - 2 Members = **₹98**
  - 3 Members = **₹147**
  - 4 Members = **₹196**
- **In-Game Credentials**: Dynamic collection and validation of **In-Game Name (IGN)** and **Game UID** (BGMI Player ID or Free Fire UID) for all players.
- **Payment & Storage**: University UPI QR code, UTR submission, and screenshot upload.
- **Team Locking**: Upon manual admin approval, the team is stamped with `TEAM LOCKED` to freeze rosters.
- **Admin Management & Export**: Search, filter by game/status, inspect complete member rosters, approve, reject (with mandatory explanation), request resubmission, and export 30-column Excel (`.xlsx`) & CSV reports.

---

## 🏛️ Venue & Location

- **Official Conclave Venue**: **Apex University Auditorium, VT Road, Mansarovar**
- **Dates**: 14th & 15th September 2026

---

## 🛡️ Administrative Access Credentials

- **Admin Login URL**: `http://localhost:5173/admin/login`
- **Official Admin Email**: `parmjeetyadav1230@gmail.com`
- **Official Admin Password**: `Engineeringday@2026`

---

## 📞 Event Coordination & Query Desk

- **Parmjeet Yadav**: `+91 94678 43851`
- **Priyanshu Sharma**: `+91 75418 41303`

---

## 💳 Payment Verification Workflow

1. **Database-Driven Fee**: The frontend never determines the amount; fees are calculated directly from the `Event` database table.
2. **Scan & Pay**: Students see the active QR Code and copyable UPI ID on `/student/payment/:id`.
3. **Receipt Upload**: Students upload their payment screenshot (JPG/PNG/WEBP <= 5MB) and enter their 12-digit bank UTR number.
4. **Duplicate Detection**: Submitting an identical UTR flags the registration with a duplicate warning in the admin audit dossier.
5. **Payment Verification Center**: The admin inspects the student details, views the uploaded receipt, and can:
   - **Approve**: Instantly marks the pass as verified and unlocks the downloadable admission card.
   - **Reject**: Prompts for a mandatory rejection reason and notifies the student to re-upload.
   - **Request Resubmission**: Allows updating receipts without formal disqualification.

---

## 🗄️ PostgreSQL Production Setup

To connect to a production PostgreSQL database (e.g. Supabase, Neon, AWS RDS, GCP Cloud SQL, or Docker):

1. Switch the provider in `server/prisma/schema.prisma` from `sqlite` to `postgresql` (or use `server/prisma/schema.postgresql.prisma`).
2. Update `DATABASE_URL` in `server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@your-db-host:5432/engineering_day_2026?schema=public"
   ```
3. Run migrations and seed:
   ```powershell
   npx prisma migrate dev --name init
   npx ts-node-dev prisma/seed.ts
   ```

---

## 🧪 Automated Testing

A dedicated test suite is included to verify all 11 critical workflows:

```powershell
cd server
npm test
```

Tests cover:
1. Student registration with bcrypt hashing and profile link
2. Student login authentication
3. Duplicate email rejection
4. Database-driven fee calculation
5. Registration ID generation format (`ENG26-SLUG-XXXXXX`)
6. Prevention of duplicate registrations for same student + same event
7. Payment submission & transition to `UNDER_REVIEW`
8. Duplicate UTR / Transaction ID detection & flagging
9. Role-based admin route protection
10. Admin payment approval and audit logging
11. Admin rejection with mandatory explanation
