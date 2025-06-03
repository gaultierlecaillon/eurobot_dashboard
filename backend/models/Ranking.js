const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  serie: {
    type: Number,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  team: {
    name: { type: String, required: true },
    stand: { type: String, required: true },
    origin: { type: String, required: true }
  },
  points: {
    type: Number,
    required: true
  },
  matchesPlayed: {
    type: Number,
    required: true
  },
  victories: {
    type: Number,
    required: true
  },
  draws: {
    type: Number,
    required: true
  },
  defeats: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

rankingSchema.index({ serie: 1, position: 1 });

module.exports = mongoose.model('Ranking', rankingSchema);
