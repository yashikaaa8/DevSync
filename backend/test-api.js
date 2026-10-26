// ==============================================================================
// REST API Automated Smoke Test (backend/test-api.js)
// Verifies all 5 CRUD endpoints and validation handlers
// Run via: npm run test:api
// ==============================================================================

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api/clubs`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const logPass = (desc) => console.log(`${colors.green}  ✓ PASS:${colors.reset} ${desc}`);
const logFail = (desc, detail) => console.log(`${colors.red}  ✗ FAIL:${colors.reset} ${desc} -> ${detail}`);

const runTests = async () => {
  console.log(`\n${colors.cyan}====================================================`);
  console.log(' Starting REST API Smoke Tests');
  console.log(` Target URL: ${BASE_URL}`);
  console.log(`====================================================${colors.reset}\n`);

  let passed = 0;
  let failed = 0;
  let createdClubId = null;

  // ---------------------------------------------------------------------------
  // Test 1: GET /api/clubs (Retrieve All Clubs)
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch(BASE_URL);
    const json = await res.json();
    if (res.status === 200 && json.success === true && Array.isArray(json.data)) {
      logPass(`GET /api/clubs returned 200 OK with ${json.count} clubs`);
      passed++;
    } else {
      logFail('GET /api/clubs', `Status ${res.status}, body: ${JSON.stringify(json)}`);
      failed++;
    }
  } catch (err) {
    logFail('GET /api/clubs (Connection)', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // Test 2: POST /api/clubs (Create New Club - Valid Input)
  // ---------------------------------------------------------------------------
  try {
    const newClubPayload = {
      name: 'Automated Test AI Society',
      description: 'Dedicated to machine learning, neural networks, and prompt engineering workshops.',
      category: 'Technology & Coding',
      president: 'Tanya Sen',
      meetingDay: 'Tuesday',
      meetingTime: '3:00 PM - 4:30 PM'
    };

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClubPayload)
    });
    const json = await res.json();

    if (res.status === 201 && json.success === true && json.data._id) {
      createdClubId = json.data._id;
      logPass(`POST /api/clubs created club with ID: ${createdClubId} (Status 201 Created)`);
      passed++;
    } else {
      logFail('POST /api/clubs', `Status ${res.status}, body: ${JSON.stringify(json)}`);
      failed++;
    }
  } catch (err) {
    logFail('POST /api/clubs', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // Test 3: POST /api/clubs (Validation - Missing Required Fields)
  // ---------------------------------------------------------------------------
  try {
    const invalidPayload = { name: 'Only Name Given' };
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload)
    });
    const json = await res.json();

    if (res.status === 400 && json.success === false) {
      logPass(`POST /api/clubs rejected missing fields with 400 Bad Request`);
      passed++;
    } else {
      logFail('POST /api/clubs validation check', `Expected 400, got ${res.status}`);
      failed++;
    }
  } catch (err) {
    logFail('POST /api/clubs validation check', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // Test 4: GET /api/clubs/:id (Retrieve Single Club by ID)
  // ---------------------------------------------------------------------------
  if (createdClubId) {
    try {
      const res = await fetch(`${BASE_URL}/${createdClubId}`);
      const json = await res.json();

      if (res.status === 200 && json.success === true && json.data.name === 'Automated Test AI Society') {
        logPass(`GET /api/clubs/:id retrieved club "${json.data.name}" (Status 200 OK)`);
        passed++;
      } else {
        logFail('GET /api/clubs/:id', `Status ${res.status}, body: ${JSON.stringify(json)}`);
        failed++;
      }
    } catch (err) {
      logFail('GET /api/clubs/:id', err.message);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // Test 5: GET /api/clubs/:id (Invalid ID Format Handling)
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/invalid-non-hex-id-123`);
    const json = await res.json();

    if (res.status === 400 && json.success === false) {
      logPass(`GET /api/clubs/invalid-id properly returned 400 Bad Request`);
      passed++;
    } else {
      logFail('GET invalid ID format', `Expected 400, got ${res.status}`);
      failed++;
    }
  } catch (err) {
    logFail('GET invalid ID format', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // Test 6: PUT /api/clubs/:id (Update Existing Club)
  // ---------------------------------------------------------------------------
  if (createdClubId) {
    try {
      const updatePayload = {
        name: 'Automated Test AI & Data Science Society',
        meetingTime: '3:30 PM - 5:00 PM'
      };

      const res = await fetch(`${BASE_URL}/${createdClubId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const json = await res.json();

      if (res.status === 200 && json.success === true && json.data.name === updatePayload.name) {
        logPass(`PUT /api/clubs/:id updated club name to "${json.data.name}" (Status 200 OK)`);
        passed++;
      } else {
        logFail('PUT /api/clubs/:id', `Status ${res.status}, body: ${JSON.stringify(json)}`);
        failed++;
      }
    } catch (err) {
      logFail('PUT /api/clubs/:id', err.message);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // Test 7: DELETE /api/clubs/:id (Delete Existing Club)
  // ---------------------------------------------------------------------------
  if (createdClubId) {
    try {
      const res = await fetch(`${BASE_URL}/${createdClubId}`, {
        method: 'DELETE'
      });
      const json = await res.json();

      if (res.status === 200 && json.success === true) {
        logPass(`DELETE /api/clubs/:id deleted test club (Status 200 OK)`);
        passed++;
      } else {
        logFail('DELETE /api/clubs/:id', `Status ${res.status}, body: ${JSON.stringify(json)}`);
        failed++;
      }
    } catch (err) {
      logFail('DELETE /api/clubs/:id', err.message);
      failed++;
    }

    // ---------------------------------------------------------------------------
    // Test 8: GET /api/clubs/:id (Verify 404 after Deletion)
    // ---------------------------------------------------------------------------
    try {
      const res = await fetch(`${BASE_URL}/${createdClubId}`);
      const json = await res.json();

      if (res.status === 404 && json.success === false) {
        logPass(`GET /api/clubs/:id confirmed deleted club returns 404 Not Found`);
        passed++;
      } else {
        logFail('GET deleted club 404 check', `Expected 404, got ${res.status}`);
        failed++;
      }
    } catch (err) {
      logFail('GET deleted club 404 check', err.message);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // Test 9: POST /api/memberships (Join Club - Valid)
  // ---------------------------------------------------------------------------
  const MEMBERSHIPS_URL = `http://localhost:${PORT}/api/memberships`;
  let sampleClubId = null;

  try {
    // Get an existing club ID to join
    const clubsRes = await fetch(BASE_URL);
    const clubsJson = await clubsRes.json();
    if (clubsJson.data && clubsJson.data.length > 0) {
      sampleClubId = clubsJson.data[0]._id;
    }

    if (sampleClubId) {
      const joinPayload = {
        clubId: sampleClubId,
        studentName: 'Tanya Test Student',
        studentId: 'STU9999',
        email: 'tanya.test@campus.edu'
      };

      const res = await fetch(MEMBERSHIPS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinPayload)
      });
      const json = await res.json();

      if (res.status === 201 && json.success === true && json.data._id) {
        logPass(`POST /api/memberships registered new member "${json.data.studentName}" (Status 201 Created)`);
        passed++;
      } else {
        logFail('POST /api/memberships', `Status ${res.status}, body: ${JSON.stringify(json)}`);
        failed++;
      }

      // ---------------------------------------------------------------------------
      // Test 10: POST /api/memberships (Duplicate Prevention Check)
      // ---------------------------------------------------------------------------
      const dupRes = await fetch(MEMBERSHIPS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinPayload) // Same studentId & clubId
      });
      const dupJson = await dupRes.json();

      if (dupRes.status === 400 && dupJson.success === false) {
        logPass(`POST /api/memberships properly rejected duplicate student ID with 400 Bad Request`);
        passed++;
      } else {
        logFail('POST /api/memberships duplicate check', `Expected 400, got ${dupRes.status}`);
        failed++;
      }

      // ---------------------------------------------------------------------------
      // Test 11: GET /api/memberships?clubId=... (Filtered Memberships)
      // ---------------------------------------------------------------------------
      const filterRes = await fetch(`${MEMBERSHIPS_URL}?clubId=${sampleClubId}`);
      const filterJson = await filterRes.json();

      if (filterRes.status === 200 && filterJson.success === true && Array.isArray(filterJson.data)) {
        logPass(`GET /api/memberships?clubId=... returned 200 OK with ${filterJson.count} member(s)`);
        passed++;
      } else {
        logFail('GET /api/memberships filtered', `Status ${filterRes.status}`);
        failed++;
      }
    }
  } catch (err) {
    logFail('Membership endpoints test', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log(`\n${colors.cyan}====================================================`);
  console.log(` Test Summary: ${colors.green}${passed} Passed${colors.cyan}, ${failed > 0 ? colors.red : colors.green}${failed} Failed${colors.cyan}`);
  console.log(`====================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
