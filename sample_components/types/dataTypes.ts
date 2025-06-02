/**
 * Data types for the Eurobot Dashboard application
 * These types correspond to the data structures in the CSV files
 */

/**
 * Match data model representing a single match between two teams
 */
export interface Match {
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
  winner: string; // team1, team2, or draw
  series: number; // 1, 2, or 3
}

/**
 * Team ranking model representing a team's position in a series
 */
export interface TeamRanking {
  position: number;
  name: string;
  standId: string;
  country: string;
  totalPoints: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  series: number; // 1, 2, or 3
}

/**
 * Team performance model aggregating data across all series
 */
export interface TeamPerformance {
  name: string;
  standId: string;
  country: string;
  matches: Match[];
  rankings: {
    series1?: TeamRanking;
    series2?: TeamRanking;
    series3?: TeamRanking;
  };
  totalPoints: number;
  averagePoints: number;
}
