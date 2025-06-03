const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchNumber: {
    type: Number,
    required: true
  },
  serie: {
    type: Number,
    required: true
  },
  team1: {
    name: { type: String, required: true },
    stand: { type: String, required: true },
    score: { type: Number, required: true }
  },
  team2: {
    name: { type: String, required: true },
    stand: { type: String, required: true },
    score: { type: Number, required: true }
  }
}, {
  timestamps: true
});

matchSchema.index({ serie: 1, matchNumber: 1 });

module.exports = mongoose.model('Match', matchSchema);
