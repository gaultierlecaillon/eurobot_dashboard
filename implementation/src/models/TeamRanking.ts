import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamRanking extends Document {
  position: number;
  name: string;
  standId: string;
  country: string;
  totalPoints: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  series: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamRankingSchema: Schema = new Schema({
  position: {
    type: Number,
    required: true,
    min: 1,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  standId: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  totalPoints: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  matchesPlayed: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  wins: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  draws: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  losses: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  series: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
  },
}, {
  timestamps: true,
});

// Create compound index for efficient queries
TeamRankingSchema.index({ series: 1, position: 1 });
TeamRankingSchema.index({ name: 1, series: 1 }, { unique: true });
TeamRankingSchema.index({ country: 1 });
TeamRankingSchema.index({ totalPoints: -1 });

export default mongoose.models.TeamRanking || mongoose.model<ITeamRanking>('TeamRanking', TeamRankingSchema);
