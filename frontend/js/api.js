// ==============================================================================
// API Client (frontend/js/api.js)
// Centralized Fetch API methods for communicating with the Node/Express backend
// ==============================================================================

const API_BASE = '/api/clubs';

/**
 * Handle API HTTP response parsing and error extraction
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Invalid server response (Status ${response.status})`);
  }

  if (!response.ok) {
    // If backend provided a custom message, throw that; otherwise use status text
    const errorMsg = data && data.message ? data.message : `HTTP Error ${response.status}: ${response.statusText}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * 1. Retrieve all clubs from the backend
 * HTTP Method: GET /api/clubs
 * @returns {Promise<{success: boolean, count: number, data: Array}>}
 */
async function getAllClubs() {
  try {
    const res = await fetch(API_BASE, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('[API Error] getAllClubs failed:', error);
    throw error;
  }
}

/**
 * 2. Retrieve a single club by its MongoDB ID
 * HTTP Method: GET /api/clubs/:id
 * @param {string} id
 * @returns {Promise<{success: boolean, data: Object}>}
 */
async function getClubById(id) {
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`[API Error] getClubById(${id}) failed:`, error);
    throw error;
  }
}

/**
 * 3. Create a new campus club
 * HTTP Method: POST /api/clubs
 * @param {Object} clubData
 * @returns {Promise<{success: boolean, message: string, data: Object}>}
 */
async function createClub(clubData) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(clubData)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('[API Error] createClub failed:', error);
    throw error;
  }
}

/**
 * 4. Update an existing campus club by ID
 * HTTP Method: PUT /api/clubs/:id
 * @param {string} id
 * @param {Object} clubData
 * @returns {Promise<{success: boolean, message: string, data: Object}>}
 */
async function updateClub(id, clubData) {
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(clubData)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`[API Error] updateClub(${id}) failed:`, error);
    throw error;
  }
}

/**
 * 5. Delete a club by its MongoDB ID
 * HTTP Method: DELETE /api/clubs/:id
 * @param {string} id
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function deleteClub(id) {
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`[API Error] deleteClub(${id}) failed:`, error);
    throw error;
  }
}

/**
 * 6. Join a club (Submit membership request)
 * HTTP Method: POST /api/memberships
 * @param {Object} membershipData - { clubId, studentName, studentId, email }
 * @returns {Promise<{success: boolean, message: string, data: Object}>}
 */
async function joinClub(membershipData) {
  try {
    const res = await fetch('/api/memberships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(membershipData)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('[API Error] joinClub failed:', error);
    throw error;
  }
}

/**
 * 7. Retrieve memberships for a club
 * HTTP Method: GET /api/memberships?clubId=...
 * @param {string} [clubId]
 * @returns {Promise<{success: boolean, count: number, data: Array}>}
 */
async function getClubMemberships(clubId) {
  try {
    const url = clubId
      ? `/api/memberships?clubId=${encodeURIComponent(clubId)}`
      : '/api/memberships';
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('[API Error] getClubMemberships failed:', error);
    throw error;
  }
}
