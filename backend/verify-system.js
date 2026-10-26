// ==============================================================================
// Full System Verification Script (backend/verify-system.js)
// Starts MongoDB daemon -> Seeds sample data -> Starts Express server ->
// Runs all API tests -> Validates all 6 frontend pages & assets -> Shuts down cleanly
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const mongoose = require('mongoose');

const LOCAL_BIN_MONGOD = path.join(__dirname, '../bin/mongod.exe');
const MONGOD_PATH = fs.existsSync(LOCAL_BIN_MONGOD)
  ? LOCAL_BIN_MONGOD
  : 'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe';
const DB_PATH = path.join(__dirname, '../data/db');
const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const pass = (msg) => console.log(`  ${colors.green}✓ PASS:${colors.reset} ${msg}`);
const fail = (msg, err) => console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${msg} (${err || ''})`);

let mongodProcess = null;
let serverInstance = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================`);
  console.log(' CAMPUS CLUB MANAGEMENT SYSTEM — COMPREHENSIVE VERIFICATION');
  console.log(`================================================================${colors.reset}\n`);

  let totalTests = 0;
  let passedTests = 0;

  // 1. Ensure DB directory exists
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
  }

  // 2. Start local mongod process
  console.log(`${colors.yellow}[Step 1/5] Launching local MongoDB daemon...${colors.reset}`);
  mongodProcess = spawn(MONGOD_PATH, ['--dbpath', DB_PATH, '--port', '27017', '--bind_ip', '127.0.0.1'], {
    stdio: 'ignore'
  });

  // Wait for MongoDB to bind
  let mongoConnected = false;
  for (let i = 0; i < 15; i++) {
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/campus_club_db');
      mongoConnected = true;
      break;
    } catch (e) {
      await sleep(1000);
    }
  }

  if (!mongoConnected) {
    fail('Could not connect to MongoDB after 15 seconds');
    cleanup();
    process.exit(1);
  }
  pass('MongoDB daemon running and connected to "campus_club_db"');
  totalTests++;
  passedTests++;

  // 3. Seed sample data
  console.log(`\n${colors.yellow}[Step 2/5] Seeding sample campus clubs into MongoDB...${colors.reset}`);
  const Club = require('./models/Club');
  await Club.deleteMany();

  const seedClubs = [
    {
      name: 'ByteCrafters Coding Club',
      description: 'A student developer community dedicated to competitive programming, web development, open-source contributions, and hackathons.',
      category: 'Technology & Coding',
      president: 'Aarav Sharma',
      meetingDay: 'Wednesday',
      meetingTime: '5:00 PM - 6:30 PM'
    },
    {
      name: 'RoboKnights Robotics Society',
      description: 'Hands-on hardware club exploring embedded systems, Arduino, Raspberry Pi, robotics design, and combat bot competitions.',
      category: 'Technology & Coding',
      president: 'Priya Patel',
      meetingDay: 'Friday',
      meetingTime: '4:30 PM - 6:00 PM'
    },
    {
      name: 'Rhythm & Beats Dance Troupe',
      description: 'Collegiate dance society covering contemporary, hip-hop, classical fusion, and street dance across campus events.',
      category: 'Cultural & Performing Arts',
      president: 'Sneha Roy',
      meetingDay: 'Tuesday',
      meetingTime: '5:30 PM - 7:00 PM'
    },
    {
      name: 'Stride & Spike Athletics Club',
      description: 'Fostering campus fitness, intramural tournaments, marathon training, basketball leagues, and recreational sports.',
      category: 'Sports & Fitness',
      president: 'Rohan Verma',
      meetingDay: 'Saturday',
      meetingTime: '7:00 AM - 9:00 AM'
    },
    {
      name: 'Veritas Debate & Literary Guild',
      description: 'Encouraging critical thinking, Parliamentary debate, model United Nations conferences, and student publications.',
      category: 'Academic & Research',
      president: 'Ananya Iyer',
      meetingDay: 'Monday',
      meetingTime: '4:00 PM - 5:30 PM'
    },
    {
      name: 'EcoWarriors Green Campus Initiative',
      description: 'Student-led environmental sustainability group organizing tree plantation drives, recycling, and climate talks.',
      category: 'Social Service & Environment',
      president: 'Vikram Joshi',
      meetingDay: 'Thursday',
      meetingTime: '4:00 PM - 5:00 PM'
    }
  ];

  const seeded = await Club.insertMany(seedClubs);
  pass(`Database seeded with ${seeded.length} campus clubs`);
  totalTests++;
  passedTests++;

  // 4. Start Express Server
  console.log(`\n${colors.yellow}[Step 3/5] Starting Express backend server...${colors.reset}`);
  const { app } = require('./server');
  serverInstance = app.listen(PORT);
  await sleep(1000);
  pass(`Express server listening on ${BASE_URL}`);
  totalTests++;
  passedTests++;

  // 5. REST API Tests
  console.log(`\n${colors.yellow}[Step 4/5] Executing REST API Endpoints & CRUD Suite...${colors.reset}`);

  // Test: GET /api/health
  totalTests++;
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (res.status === 200 && data.status === 'online') {
      pass('GET /api/health returned 200 OK');
      passedTests++;
    } else {
      fail('GET /api/health status mismatch');
    }
  } catch (err) {
    fail('GET /api/health failed', err.message);
  }

  // Test: GET /api/clubs (Read All)
  totalTests++;
  try {
    const res = await fetch(`${BASE_URL}/api/clubs`);
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.data.length === 6) {
      pass(`GET /api/clubs returned 200 OK with all ${data.data.length} clubs`);
      passedTests++;
    } else {
      fail('GET /api/clubs data count mismatch');
    }
  } catch (err) {
    fail('GET /api/clubs failed', err.message);
  }

  // Test: POST /api/clubs (Create New Club)
  totalTests++;
  let newClubId = null;
  try {
    const postPayload = {
      name: 'Verification AI & Data Society',
      description: 'Conducting student workshops on artificial intelligence, neural networks, and Python data pipelines.',
      category: 'Technology & Coding',
      president: 'Aarav Test',
      meetingDay: 'Friday',
      meetingTime: '3:00 PM - 4:30 PM'
    };
    const res = await fetch(`${BASE_URL}/api/clubs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postPayload)
    });
    const data = await res.json();
    if (res.status === 201 && data.success === true && data.data._id) {
      newClubId = data.data._id;
      pass(`POST /api/clubs created new club with ID "${newClubId}" (Status 201 Created)`);
      passedTests++;
    } else {
      fail('POST /api/clubs failed to create club', JSON.stringify(data));
    }
  } catch (err) {
    fail('POST /api/clubs failed', err.message);
  }

  // Test: POST /api/clubs validation failure (400 Bad Request)
  totalTests++;
  try {
    const res = await fetch(`${BASE_URL}/api/clubs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Only Name Given' })
    });
    if (res.status === 400) {
      pass('POST /api/clubs properly rejected missing fields with 400 Bad Request');
      passedTests++;
    } else {
      fail('POST /api/clubs validation check did not return 400');
    }
  } catch (err) {
    fail('POST /api/clubs validation test failed', err.message);
  }

  // Test: GET /api/clubs/:id (Read One by ID)
  totalTests++;
  try {
    const res = await fetch(`${BASE_URL}/api/clubs/${newClubId}`);
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.data.name === 'Verification AI & Data Society') {
      pass(`GET /api/clubs/:id retrieved club details (Status 200 OK)`);
      passedTests++;
    } else {
      fail('GET /api/clubs/:id mismatch');
    }
  } catch (err) {
    fail('GET /api/clubs/:id failed', err.message);
  }

  // Test: GET /api/clubs/invalid-id (400 Format Validation)
  totalTests++;
  try {
    const res = await fetch(`${BASE_URL}/api/clubs/not-a-valid-id`);
    if (res.status === 400) {
      pass('GET /api/clubs/not-a-valid-id returned 400 Bad Request');
      passedTests++;
    } else {
      fail('Invalid ID format did not return 400');
    }
  } catch (err) {
    fail('Invalid ID test failed', err.message);
  }

  // Test: PUT /api/clubs/:id (Update Club)
  totalTests++;
  try {
    const putPayload = {
      name: 'Verification AI, Robotics & Data Society',
      meetingTime: '3:30 PM - 5:00 PM'
    };
    const res = await fetch(`${BASE_URL}/api/clubs/${newClubId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(putPayload)
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.data.name === putPayload.name) {
      pass(`PUT /api/clubs/:id successfully updated club name (Status 200 OK)`);
      passedTests++;
    } else {
      fail('PUT /api/clubs/:id failed to update');
    }
  } catch (err) {
    fail('PUT /api/clubs/:id failed', err.message);
  }

  // Test: DELETE /api/clubs/:id (Delete Club)
  totalTests++;
  try {
    const res = await fetch(`${BASE_URL}/api/clubs/${newClubId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true) {
      pass(`DELETE /api/clubs/:id deleted test club (Status 200 OK)`);
      passedTests++;
    } else {
      fail('DELETE /api/clubs/:id failed');
    }
  } catch (err) {
    fail('DELETE /api/clubs/:id failed', err.message);
  }

  // Test: GET /api/clubs/:id after delete (404 Not Found)
  totalTests++;
  try {
    const res = await fetch(`${BASE_URL}/api/clubs/${newClubId}`);
    if (res.status === 404) {
      pass('GET /api/clubs/:id confirmed deleted club returns 404 Not Found');
      passedTests++;
    } else {
      fail('Deleted club did not return 404');
    }
  } catch (err) {
    fail('404 confirmation check failed', err.message);
  }

  // Test: POST /api/memberships (Join Club)
  totalTests++;
  try {
    const clubsList = await Club.find();
    const targetClub = clubsList[0];
    const joinRes = await fetch(`${BASE_URL}/api/memberships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clubId: targetClub._id.toString(),
        studentName: 'Verification Student',
        studentId: 'VERIF101',
        email: 'verif.student@campus.edu'
      })
    });
    const joinData = await joinRes.json();
    if (joinRes.status === 201 && joinData.success === true && joinData.data.studentId === 'VERIF101') {
      pass('POST /api/memberships registered new member (Status 201 Created)');
      passedTests++;
    } else {
      fail('POST /api/memberships failed', JSON.stringify(joinData));
    }

    // Test: POST /api/memberships duplicate prevention
    totalTests++;
    const dupRes = await fetch(`${BASE_URL}/api/memberships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clubId: targetClub._id.toString(),
        studentName: 'Verification Student',
        studentId: 'VERIF101',
        email: 'verif.student@campus.edu'
      })
    });
    const dupData = await dupRes.json();
    if (dupRes.status === 400 && dupData.success === false) {
      pass('POST /api/memberships duplicate registration correctly rejected (Status 400 Bad Request)');
      passedTests++;
    } else {
      fail('POST /api/memberships duplicate was not rejected with 400', dupRes.status);
    }

    // Test: GET /api/memberships?clubId=...
    totalTests++;
    const getMembRes = await fetch(`${BASE_URL}/api/memberships?clubId=${targetClub._id}`);
    const getMembData = await getMembRes.json();
    if (getMembRes.status === 200 && getMembData.success === true && getMembData.count >= 1) {
      pass(`GET /api/memberships?clubId=... retrieved ${getMembData.count} member(s) (Status 200 OK)`);
      passedTests++;
    } else {
      fail('GET /api/memberships?clubId failed');
    }
  } catch (err) {
    fail('Membership tests failed', err.message);
  }

  // 6. Frontend Pages & Assets Verification
  console.log(`\n${colors.yellow}[Step 5/5] Verifying all 6 Frontend HTML Pages & Static Assets...${colors.reset}`);

  const pagesToTest = [
    { file: 'index.html', titleSnippet: 'Campus Clubs', domSelector: 'id="total-clubs-count"' },
    { file: 'clubs.html', titleSnippet: 'Clubs Directory', domSelector: 'id="clubs-container"' },
    { file: 'add-club.html', titleSnippet: 'Add New Club', domSelector: 'id="add-club-form"' },
    { file: 'edit-club.html', titleSnippet: 'Edit Club', domSelector: 'id="edit-club-form"' },
    { file: 'club-details.html', titleSnippet: 'Club Details', domSelector: 'id="club-details-container"' },
    { file: 'about.html', titleSnippet: 'About & Architecture', domSelector: 'class="tech-table"' }
  ];

  for (const page of pagesToTest) {
    totalTests++;
    try {
      const res = await fetch(`${BASE_URL}/${page.file}`);
      const html = await res.text();
      if (res.status === 200 && html.includes(page.domSelector)) {
        pass(`Page "${page.file}" served with status 200 and expected DOM anchor (${page.domSelector})`);
        passedTests++;
      } else {
        fail(`Page "${page.file}" failed check`, `Status ${res.status}`);
      }
    } catch (err) {
      fail(`Page "${page.file}" failed to load`, err.message);
    }
  }

  // Static Assets (CSS & JS)
  const assetsToTest = ['css/style.css', 'js/api.js', 'js/dom.js', 'js/app.js', 'js/dashboard.js', 'js/clubs.js'];
  for (const asset of assetsToTest) {
    totalTests++;
    try {
      const res = await fetch(`${BASE_URL}/${asset}`);
      if (res.status === 200) {
        pass(`Asset "${asset}" served with status 200 OK`);
        passedTests++;
      } else {
        fail(`Asset "${asset}" returned status ${res.status}`);
      }
    } catch (err) {
      fail(`Asset "${asset}" error`, err.message);
    }
  }

  // Final Summary
  console.log(`\n${colors.bold}${colors.cyan}================================================================`);
  console.log(` VERIFICATION RESULTS: ${passedTests}/${totalTests} CHECKS PASSED`);
  console.log(`================================================================${colors.reset}\n`);

  cleanup();

  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bold}ALL VERIFICATION TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}SOME TESTS FAILED!${colors.reset}\n`);
    process.exit(1);
  }
}

function cleanup() {
  if (serverInstance) {
    try { serverInstance.close(); } catch (e) {}
  }
  if (mongoose.connection.readyState !== 0) {
    try { mongoose.disconnect(); } catch (e) {}
  }
  if (mongodProcess) {
    try { mongodProcess.kill(); } catch (e) {}
  }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

main().catch((err) => {
  console.error('Fatal verification error:', err);
  cleanup();
  process.exit(1);
});
