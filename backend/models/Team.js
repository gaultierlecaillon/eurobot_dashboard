const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  stand: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
