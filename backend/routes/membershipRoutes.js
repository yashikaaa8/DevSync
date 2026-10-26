// ==============================================================================
// Membership Routes (backend/routes/membershipRoutes.js)
// Defines REST API endpoints for joining clubs and viewing club memberships
// ==============================================================================

const express = require('express');
const mongoose = require('mongoose');
const Membership = require('../models/Membership');
const Club = require('../models/Club');

const router = express.Router();

/**
 * Helper to validate MongoDB ObjectId format
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// -----------------------------------------------------------------------------
// 1. GET /api/memberships - Retrieve memberships (optionally filtered by clubId)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { clubId } = req.query;
    const filter = {};

    // Optional filtering by clubId
    if (clubId) {
      if (!isValidObjectId(clubId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid club ID format: "${clubId}".`
        });
      }
      filter.clubId = clubId;
    }

    // Retrieve memberships, populated with club details, sorted newest first
    const memberships = await Membership.find(filter)
      .populate('clubId', 'name category')
      .sort({ joinedAt: -1 });

    res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships
    });
  } catch (error) {
    console.error('[API Error - GET /api/memberships]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error: unable to retrieve memberships'
    });
  }
});

// -----------------------------------------------------------------------------
// 2. POST /api/memberships - Join a club (Create Membership)
// -----------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { clubId, studentName, studentId, email } = req.body;

    // 1. Validate required fields
    const missing = [];
    if (!clubId || !clubId.trim()) missing.push('clubId');
    if (!studentName || !studentName.trim()) missing.push('studentName');
    if (!studentId || !studentId.trim()) missing.push('studentId');
    if (!email || !email.trim()) missing.push('email');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(', ')}`
      });
    }

    // 2. Validate clubId format
    if (!isValidObjectId(clubId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid club ID format: "${clubId}".`
      });
    }

    // 3. Confirm target club exists in database
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: `Target club with ID "${clubId}" was not found.`
      });
    }

    // Normalize student ID and email
    const normalizedStudentId = studentId.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Backend-level duplicate check: Verify student is not already a member of this club
    const existingMembership = await Membership.findOne({
      clubId,
      studentId: normalizedStudentId
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: `Student ID "${normalizedStudentId}" is already registered as a member of "${club.name}".`
      });
    }

    // 5. Create membership document (enforces database-level compound unique index as well)
    const newMembership = await Membership.create({
      clubId,
      studentName: studentName.trim(),
      studentId: normalizedStudentId,
      email: normalizedEmail
    });

    res.status(201).json({
      success: true,
      message: `Congratulations ${newMembership.studentName}! You have successfully joined "${club.name}".`,
      data: newMembership
    });
  } catch (error) {
    console.error('[API Error - POST /api/memberships]:', error.message);

    // Handle MongoDB duplicate key error (code 11000) from unique compound index
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This student ID is already registered as a member of this club (database unique constraint).'
      });
    }

    // Handle Mongoose validation errors (e.g. invalid email)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${messages.join('. ')}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error: unable to process membership request'
    });
  }
});

module.exports = router;
