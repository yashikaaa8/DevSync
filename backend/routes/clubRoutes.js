// ==============================================================================
// Club Routes (backend/routes/clubRoutes.js)
// Defines the REST API endpoints for all CRUD operations on Clubs
// ==============================================================================

const express = require('express');
const mongoose = require('mongoose');
const Club = require('../models/Club');

const router = express.Router();

/**
 * Helper to validate MongoDB ObjectId format
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// -----------------------------------------------------------------------------
// 1. GET /api/clubs - Retrieve all clubs (Read all)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // Fetch all clubs from MongoDB, sorted newest first
    const clubs = await Club.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs
    });
  } catch (error) {
    console.error('[API Error - GET /api/clubs]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error: unable to retrieve clubs'
    });
  }
});

// -----------------------------------------------------------------------------
// 2. GET /api/clubs/:id - Retrieve one club by ID (Read one)
// -----------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format before querying MongoDB
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid club ID format: "${id}". Must be a 24-character hexadecimal string.`
      });
    }

    const club = await Club.findById(id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: `Club with ID "${id}" was not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (error) {
    console.error(`[API Error - GET /api/clubs/${req.params.id}]:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error: unable to retrieve club details'
    });
  }
});

// -----------------------------------------------------------------------------
// 3. POST /api/clubs - Create a new club (Create)
// -----------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name, description, category, president, meetingDay, meetingTime } = req.body;

    // Manual input presence validation on backend
    const missingFields = [];
    if (!name || !name.trim()) missingFields.push('name');
    if (!description || !description.trim()) missingFields.push('description');
    if (!category || !category.trim()) missingFields.push('category');
    if (!president || !president.trim()) missingFields.push('president');
    if (!meetingDay || !meetingDay.trim()) missingFields.push('meetingDay');
    if (!meetingTime || !meetingTime.trim()) missingFields.push('meetingTime');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(', ')}`
      });
    }

    // Create the club in MongoDB using Mongoose model
    const newClub = await Club.create({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      president: president.trim(),
      meetingDay: meetingDay.trim(),
      meetingTime: meetingTime.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: newClub
    });
  } catch (error) {
    console.error('[API Error - POST /api/clubs]:', error.message);

    // Mongoose schema validation error returns 400 Bad Request
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${messages.join('. ')}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error: unable to create club'
    });
  }
});

// -----------------------------------------------------------------------------
// 4. PUT /api/clubs/:id - Update an existing club (Update)
// -----------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid club ID format: "${id}".`
      });
    }

    const { name, description, category, president, meetingDay, meetingTime } = req.body;

    // Validate that at least one field is provided and required fields are not empty strings
    if (!name && !description && !category && !president && !meetingDay && !meetingTime) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update.'
      });
    }

    const updateData = {};
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Club name cannot be empty' });
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      if (!description.trim()) return res.status(400).json({ success: false, message: 'Description cannot be empty' });
      updateData.description = description.trim();
    }
    if (category !== undefined) {
      if (!category.trim()) return res.status(400).json({ success: false, message: 'Category cannot be empty' });
      updateData.category = category.trim();
    }
    if (president !== undefined) {
      if (!president.trim()) return res.status(400).json({ success: false, message: 'President cannot be empty' });
      updateData.president = president.trim();
    }
    if (meetingDay !== undefined) {
      if (!meetingDay.trim()) return res.status(400).json({ success: false, message: 'Meeting day cannot be empty' });
      updateData.meetingDay = meetingDay.trim();
    }
    if (meetingTime !== undefined) {
      if (!meetingTime.trim()) return res.status(400).json({ success: false, message: 'Meeting time cannot be empty' });
      updateData.meetingTime = meetingTime.trim();
    }

    // Find and update with Mongoose validators enabled
    const updatedClub = await Club.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedClub) {
      return res.status(404).json({
        success: false,
        message: `Club with ID "${id}" was not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Club updated successfully',
      data: updatedClub
    });
  } catch (error) {
    console.error(`[API Error - PUT /api/clubs/${req.params.id}]:`, error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${messages.join('. ')}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error: unable to update club'
    });
  }
});

// -----------------------------------------------------------------------------
// 5. DELETE /api/clubs/:id - Delete a club (Delete)
// -----------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid club ID format: "${id}".`
      });
    }

    const deletedClub = await Club.findByIdAndDelete(id);

    if (!deletedClub) {
      return res.status(404).json({
        success: false,
        message: `Club with ID "${id}" was not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Club "${deletedClub.name}" deleted successfully.`,
      data: {}
    });
  } catch (error) {
    console.error(`[API Error - DELETE /api/clubs/${req.params.id}]:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error: unable to delete club'
    });
  }
});

module.exports = router;
