// ==============================================================================
// Membership Model (backend/models/Membership.js)
// Defines schema and model for Student Club Memberships
// Enforces unique compound index on (clubId + studentId) at the database level
// ==============================================================================

const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Club ID is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Student name must be at least 2 characters long'],
    maxlength: [80, 'Student name cannot exceed 80 characters']
  },
  studentId: {
    type: String,
    required: [true, 'Student ID / Roll number is required'],
    trim: true,
    uppercase: true,
    minlength: [2, 'Student ID must be at least 2 characters long'],
    maxlength: [30, 'Student ID cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Database-level duplicate check: Compound unique index prevents the same student ID
// from registering for the same club more than once in MongoDB
membershipSchema.index({ clubId: 1, studentId: 1 }, { unique: true });

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;
