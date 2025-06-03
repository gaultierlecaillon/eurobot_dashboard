const mongoose = require('mongoose');

const serieSchema = new mongoose.Schema({
  serieNumber: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  totalTeams: {
    type: Number,
    default: 0
  },
  totalMatches: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    default: ''
  },
  rules: {
    type: String,
    default: ''
  },
  liveStreamUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Serie', serieSchema);
