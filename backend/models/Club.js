// ==============================================================================
// Club Model (backend/models/Club.js)
// Defines the MongoDB schema and Mongoose model for Campus Clubs
// ==============================================================================

const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    minlength: [2, 'Club name must be at least 2 characters long'],
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: [
        'Technology & Coding',
        'Cultural & Performing Arts',
        'Sports & Fitness',
        'Academic & Research',
        'Social Service & Environment',
        'Media & Journalism',
        'Other'
      ],
      message: '{VALUE} is not a supported club category'
    }
  },
  president: {
    type: String,
    required: [true, 'President / Lead name is required'],
    trim: true,
    minlength: [2, 'President name must be at least 2 characters long'],
    maxlength: [80, 'President name cannot exceed 80 characters']
  },
  meetingDay: {
    type: String,
    required: [true, 'Meeting day is required'],
    trim: true,
    enum: {
      values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      message: '{VALUE} is not a valid meeting day'
    }
  },
  meetingTime: {
    type: String,
    required: [true, 'Meeting time is required'],
    trim: true,
    maxlength: [50, 'Meeting time cannot exceed 50 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compile and export the Mongoose model
const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
