/**
 * Data service for the Eurobot Dashboard
 * 
 * This service handles all data operations using the MongoDB API
 * instead of parsing CSV files directly
 */
import { Match, TeamRanking, TeamPerformance } from '../types/dataTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch matches from the API for a specific series
 * 
 * @param seriesNumber - The series number (1, 2, or 3)
 * @returns Promise resolving to an array of Match objects
 */
export const fetchMatches = async (seriesNumber?: number): Promise<Match[]> => {
  try {
    const url = seriesNumber 
      ? `${API_BASE_URL}/api/matches?series=${seriesNumber}`
      : `${API_BASE_URL}/api/matches`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch matches');
    }
    
    // Transform MongoDB documents to Match objects
    return result.data.map((match: any) => ({
      matchNumber: match.matchNumber,
      matchId: match.matchId,
      team1: {
        name: match.team1.name,
        id: match.team1.id,
        score: match.team1.score
      },
      team2: {
        name: match.team2.name,
        id: match.team2.id,
        score: match.team2.score
      },
      winner: match.winner,
      series: match.series
    }));
  } catch (error) {
    console.error(`Error fetching matches for series ${seriesNumber}:`, error);
    throw new Error(`Failed to fetch matches for series ${seriesNumber}`);
  }
};

/**
 * Fetch rankings from the API for a specific series
 * 
 * @param seriesNumber - The series number (1, 2, or 3)
 * @returns Promise resolving to an array of TeamRanking objects
 */
export const fetchRankings = async (seriesNumber?: number): Promise<TeamRanking[]> => {
  try {
    const url = seriesNumber 
      ? `${API_BASE_URL}/api/rankings?series=${seriesNumber}`
      : `${API_BASE_URL}/api/rankings`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch rankings');
    }
    
    // Transform MongoDB documents to TeamRanking objects
    return result.data.map((ranking: any) => ({
      position: ranking.position,
      name: ranking.name,
      standId: ranking.standId,
      country: ranking.country,
      totalPoints: ranking.totalPoints,
      matchesPlayed: ranking.matchesPlayed,
      wins: ranking.wins,
      draws: ranking.draws,
      losses: ranking.losses,
      series: ranking.series
    }));
  } catch (error) {
    console.error(`Error fetching rankings for series ${seriesNumber}:`, error);
    throw new Error(`Failed to fetch rankings for series ${seriesNumber}`);
  }
};

/**
 * Get all team data across all series
 * 
 * @returns Promise resolving to an array of TeamPerformance objects
 */
export const getAllTeamData = async (): Promise<TeamPerformance[]> => {
  try {
    // Fetch all data from all series
    const [allMatches, allRankings] = await Promise.all([
      fetchMatches(),
      fetchRankings()
    ]);
    
    // Create team performance objects
    const teamMap = new Map<string, TeamPerformance>();
    
    // Process rankings to get team names and IDs
    allRankings.forEach(ranking => {
      if (!teamMap.has(ranking.name)) {
        teamMap.set(ranking.name, {
          name: ranking.name,
          standId: ranking.standId,
          country: ranking.country,
          matches: [],
          rankings: {},
          totalPoints: 0,
          averagePoints: 0
        });
      }
      
      const team = teamMap.get(ranking.name);
      if (team) {
        team.rankings[`series${ranking.series}` as keyof typeof team.rankings] = ranking;
        team.totalPoints += ranking.totalPoints;
      }
    });
    
    // Add matches to each team
    allMatches.forEach(match => {
      const team1 = teamMap.get(match.team1.name);
      const team2 = teamMap.get(match.team2.name);
      
      if (team1) team1.matches.push(match);
      if (team2) team2.matches.push(match);
    });
    
    // Calculate average points
    teamMap.forEach(team => {
      const seriesPlayed = Object.keys(team.rankings).length;
      team.averagePoints = seriesPlayed > 0 ? team.totalPoints / seriesPlayed : 0;
    });
    
    return Array.from(teamMap.values());
  } catch (error) {
    console.error('Error getting all team data:', error);
    throw new Error('Failed to get all team data');
  }
};

/**
 * Create a new match
 * 
 * @param match - The match data to create
 * @returns Promise resolving to the created Match object
 */
export const createMatch = async (match: Omit<Match, 'matchNumber'>): Promise<Match> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(match),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create match');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error creating match:', error);
    throw new Error('Failed to create match');
  }
};

/**
 * Create a new team ranking
 * 
 * @param ranking - The ranking data to create
 * @returns Promise resolving to the created TeamRanking object
 */
export const createRanking = async (ranking: TeamRanking): Promise<TeamRanking> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rankings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ranking),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create ranking');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error creating ranking:', error);
    throw new Error('Failed to create ranking');
  }
};

/**
 * Migrate CSV data to MongoDB
 * 
 * @returns Promise resolving to migration results
 */
export const migrateData = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to migrate data');
    }
    
    return result;
  } catch (error) {
    console.error('Error migrating data:', error);
    throw new Error('Failed to migrate data');
  }
};
