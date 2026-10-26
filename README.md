# Campus Club Management System — First Evaluation Version

A complete, clean, and fully functional full-stack web application designed for campus student organization management. Built from scratch without frontend frameworks or external CSS libraries to demonstrate foundational mastery of web technologies, RESTful APIs, database persistence, and direct DOM manipulation.

---

## 📌 Project Overview & Features

The **Campus Club Management System** enables university administrators, faculty coordinators, and student leaders to maintain and explore student organizations from a unified portal.

### Key Features:
- **Live Metrics Dashboard (`index.html`):** Real-time club count, active category counter, and dynamic preview of recently registered clubs.
- **Clubs Directory (`clubs.html`):** Interactive card directory with instant client-side keyword search (by name, category, or president) and category filtering.
- **Add Club Form (`add-club.html`):** Complete registration form with client-side and server-side validation, duplicate submission protection, and clear user feedback.
- **Edit Club Form (`edit-club.html`):** Reads the club ID from URL query parameters, pre-populates existing data, and submits updates via HTTP PUT.
- **Club Details Profile (`club-details.html`):** Clean single-club view displaying leadership, schedule, category badge, and registration timestamp with quick edit and delete options.
- **Project Documentation Page (`about.html`):** Comprehensive breakdown of system architecture, request flows, and technical stack.
- **Direct DOM Manipulation:** Built entirely in Vanilla JavaScript using `createElement`, `textContent`, `replaceChildren`, `appendChild`, and `addEventListener`.
- **Integrated Server:** Express serves both the REST API and the frontend static assets from a single port (`5000`), completely eliminating Cross-Origin Resource Sharing (CORS) issues.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Markup** | HTML5 | Exactly six semantic pages, accessible tags |
| **Frontend Styling** | CSS3 | Custom university theme, CSS Grid & Flexbox, no Bootstrap or Tailwind |
| **Frontend Scripting**| Vanilla JavaScript | ES6+ async/await, Fetch API, direct DOM manipulation |
| **Backend Runtime** | Node.js (v18+) | CommonJS modules (`require`) |
| **Web Framework** | Express.js (v4) | RESTful API endpoints, static file serving, JSON parser |
| **Database** | MongoDB | Document-oriented NoSQL database |
| **Database ODM** | Mongoose (v8) | Strict schema validation, data casting, query helpers |

---

## 📋 Prerequisites

Before running the application, make sure you have:
1. **Node.js** (v18.0.0 or later) installed. Check with:
   ```powershell
   node -v
   npm -v
   ```
2. **MongoDB** (v6.0 or later) installed locally.

---

## ⚙️ MongoDB Setup

The application connects to a local MongoDB database named `campus_club_db` via the connection string:
```text
mongodb://127.0.0.1:27017/campus_club_db
```

### Option A: If MongoDB is installed as a Windows Service
Check if the MongoDB Windows service is running. If not, open PowerShell as Administrator and run:
```powershell
net start MongoDB
```

### Option B: Running `mongod` manually
If MongoDB is installed in the default location (`C:\Program Files\MongoDB\Server\<version>\bin`), you can start it by running:
```powershell
# Create a local data directory if one doesn't exist
mkdir C:\data\db -Force

# Start MongoDB daemon
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "C:\data\db"
```

---

## 🔧 Environment Configuration

The application reads configuration from environment variables via `dotenv`.

A `.env.example` file is included in both the root directory and `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campus_club_db
```

An active `.env` file is already created in the workspace with these default values. You can change `PORT` or `MONGO_URI` in `.env` if your local MongoDB uses different credentials or ports.

---

## 🚀 Exact Commands to Run the Project

Open your terminal in the project root (`Campus_Club_Management`):

### 1. Install Dependencies
```powershell
npm install
```

### 2. (Optional) Seed the Database with Sample Campus Clubs
To immediately populate the database with realistic clubs (Coding Club, Robotics, Dance, Athletics, Debate, EcoWarriors):
```powershell
npm run seed
```

### 3. Start the Application Server
```powershell
npm start
```

### 4. Open the Web Application
Open your web browser and navigate to:
```text
http://localhost:5000
```

---

## 📡 Backend REST API Endpoints

The API is mounted at `/api/clubs` and accepts/returns standard JSON:

| Method | Endpoint | Description | Request Body | Success Status | Error Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/clubs` | Retrieve all clubs (sorted newest first) | None | `200 OK` | `500` |
| **GET** | `/api/clubs/:id` | Retrieve one club by MongoDB ID | None | `200 OK` | `400`, `404`, `500` |
| **POST** | `/api/clubs` | Create a new campus club | JSON object with required fields | `201 Created` | `400`, `500` |
| **PUT** | `/api/clubs/:id` | Update an existing club by ID | JSON object with fields to update | `200 OK` | `400`, `404`, `500` |
| **DELETE**| `/api/clubs/:id` | Delete a club by ID | None | `200 OK` | `400`, `404`, `500` |
| **POST** | `/api/memberships` | Join a club (with duplicate check) | `{ clubId, studentName, studentId, email }` | `201 Created` | `400`, `404`, `500` |
| **GET** | `/api/memberships` | Retrieve memberships (optional `?clubId=...`) | None | `200 OK` | `400`, `500` |

### Data Schema Definitions:

#### 1. Club Model (`backend/models/Club.js`):
```json
{
  "name": "Robotics Club",
  "category": "Technology & Coding",
  "president": "Priya Patel",
  "meetingDay": "Friday",
  "meetingTime": "4:30 PM - 6:00 PM",
  "description": "Hands-on robotics, microcontrollers, and automation workshops."
}
```

#### 2. Membership Model (`backend/models/Membership.js`):
```json
{
  "clubId": "64f123... (ObjectId ref 'Club')",
  "studentName": "Maya Sharma",
  "studentId": "STU202601",
  "email": "maya.sharma@campus.edu",
  "joinedAt": "2026-10-26T08:00:00.000Z"
}
```
*Note: A compound unique index `{ clubId: 1, studentId: 1 }` is enforced at the MongoDB database level to ensure a student cannot join the same club more than once.*

---

## 🧪 Testing All CRUD Operations

### Automated Smoke Tests
With the server running on `http://localhost:5000`, run in a separate terminal:
```powershell
npm run test:api
```
This script automatically runs through:
1. `GET /api/clubs`
2. `POST /api/clubs` (creates a test club)
3. `GET /api/clubs/:id` (retrieves the test club)
4. `PUT /api/clubs/:id` (updates the test club)
5. `DELETE /api/clubs/:id` (deletes the test club)
6. `GET /api/clubs/:id` (verifies 404 after deletion)
7. Format validation & missing field rejection tests (verifies 400 Bad Request)

### Manual Browser Walkthrough
1. **CREATE:** Go to `http://localhost:5000/add-club.html`, fill out the form, and click **Create Club**. A green confirmation banner will appear.
2. **READ (All):** Click **Browse Clubs Directory** or visit `http://localhost:5000/clubs.html`. Your newly created club will be visible as a card.
3. **READ (One):** Click **View Details** on any card to view `http://localhost:5000/club-details.html?id=...`. All fields and registered members are displayed.
4. **JOIN CLUB:** On `club-details.html`, click **Join Club**. A modal opens asking for your Full Name, Student ID, and Email. Enter your information and click **Confirm & Join**. The member counter updates and your name appears in the member list. Attempting to submit the same Student ID for the same club will show a duplicate prevention error.
5. **UPDATE:** Click **Edit** from either the card or the details view (`http://localhost:5000/edit-club.html?id=...`). Update the meeting time or president name and click **Save Changes**.
6. **DELETE:** On `clubs.html` or `club-details.html`, click **Delete**. Confirm the deletion in the modal dialog. The club is removed and the counter decrements.

---

## 🔍 Troubleshooting Guide

### 1. `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
- **Cause:** The MongoDB service is not currently running.
- **Fix:** Start MongoDB using `net start MongoDB` or launch `mongod.exe` manually.

### 2. `Error: EADDRINUSE: address already in use :::5000`
- **Cause:** Another process or background instance is occupying port 5000.
- **Fix:** Either change the port in `.env` (e.g., `PORT=5001`) or stop the process running on port 5000:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
  ```

### 3. "No clubs found" or 0 count on the Dashboard
- **Cause:** MongoDB is connected, but the collection is empty.
- **Fix:** Run `npm run seed` to insert realistic sample clubs, or create a club via `add-club.html`.

### 4. Direct DOM elements not appearing
- **Cause:** Browser cache or script error.
- **Fix:** Open DevTools (F12) -> Console tab to verify network requests to `/api/clubs`. Ensure both server and browser are communicating on `http://localhost:5000`.
