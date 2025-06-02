import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  matchNumber: number;
  matchId: string;
  team1: {
    name: string;
    id: string;
    score: number;
  };
  team2: {
    name: string;
    id: string;
    score: number;
  };
  winner: string;
  series: number;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema({
  matchNumber: {
    type: Number,
    required: true,
  },
  matchId: {
    type: String,
    required: true,
  },
  team1: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  team2: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  winner: {
    type: String,
    required: true,
    enum: ['team1', 'team2', 'draw'],
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
MatchSchema.index({ series: 1, matchNumber: 1 });
MatchSchema.index({ 'team1.name': 1 });
MatchSchema.index({ 'team2.name': 1 });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
