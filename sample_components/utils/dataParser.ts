/**
 * Data parsing utilities for the Eurobot Dashboard
 * 
 * These functions handle parsing the CSV data files and transforming them
 * into the application's data models
 */
import Papa from 'papaparse';
import { Match, TeamRanking, TeamPerformance } from '../types/dataTypes';

/**
 * Parse matches CSV file for a specific series
 * 
 * @param seriesNumber - The series number (1, 2, or 3)
 * @returns Promise resolving to an array of Match objects
 */
export const parseMatchesCSV = async (seriesNumber: number): Promise<Match[]> => {
  try {
    // In a real application, this would fetch from the public directory
    const response = await fetch(`/data/matchs_serie_${seriesNumber}.csv`);
    const csv = await response.text();
    
    // Parse CSV with PapaParse
    const { data } = Papa.parse(csv, { 
      header: true, 
      skipEmptyLines: true,
      // Transform function would handle any data cleaning
      transform: (value) => value.trim()
    });
    
    // Transform raw data into Match objects
    return data.map((row: any) => {
      // Extract team1 data (handling the semicolon-separated format)
      const team1Parts = row[';;Équipe 1'].split(';');
      const team1Id = team1Parts[0] || '';
      const team1Name = team1Parts[1] || '';
      
      // Extract team2 data
      const team2Parts = row[';;Équipe 2'].split(';');
      const team2Name = team2Parts[0] || '';
      const team2Id = team2Parts[1] || '';
      
      // Extract scores
      const scoreParts = row['Score'].split(';');
      const team1Score = parseInt(scoreParts[0]) || 0;
      const team2Score = parseInt(scoreParts[1]) || 0;
      
      // Determine winner
      let winner = 'draw';
      if (team1Score > team2Score) {
        winner = 'team1';
      } else if (team2Score > team1Score) {
        winner = 'team2';
      }
      
      // Create and return Match object
      return {
        matchNumber: parseInt(row['#']) || 0,
        matchId: team1Id,
        team1: {
          name: team1Name,
          id: team1Id,
          score: team1Score
        },
        team2: {
          name: team2Name,
          id: team2Id,
          score: team2Score
        },
        winner,
        series: seriesNumber
      };
    });
  } catch (error) {
    console.error(`Error parsing matches for series ${seriesNumber}:`, error);
    throw new Error(`Failed to parse matches for series ${seriesNumber}`);
  }
};

/**
 * Parse rankings CSV file for a specific series
 * 
 * @param seriesNumber - The series number (1, 2, or 3)
 * @returns Promise resolving to an array of TeamRanking objects
 */
export const parseRankingsCSV = async (seriesNumber: number): Promise<TeamRanking[]> => {
  try {
    // In a real application, this would fetch from the public directory
    const response = await fetch(`/data/classement_serie_${seriesNumber}.csv`);
    const csv = await response.text();
    
    // Parse CSV with PapaParse
    const { data } = Papa.parse(csv, { 
      header: true, 
      skipEmptyLines: true,
      // Transform function would handle any data cleaning
      transform: (value) => value.trim()
    });
    
    // Transform raw data into TeamRanking objects
    return data.map((row: any) => {
      // Extract position and team name
      const positionParts = row[';Équipe'].split(';');
      const position = positionParts[0].replace('er', '').replace('ème', '').replace('nd', '').trim();
      const name = positionParts[1] || '';
      
      // Extract country
      const countryParts = row[';Origine'].split(';');
      const country = countryParts[1] || '';
      
      // Extract points and stats
      const totalPoints = parseInt(row['Cumul'].split(';')[0]) || 0;
      const matchesPlayed = parseInt(row['Joués']) || 0;
      const wins = parseInt(row['Vict.']) || 0;
      const draws = parseInt(row['Égal.']) || 0;
      const losses = parseInt(row['Déf.']) || 0;
      
      // Create and return TeamRanking object
      return {
        position: parseInt(position) || 0,
        name,
        standId: row['Stand'] || '',
        country,
        totalPoints,
        matchesPlayed,
        wins,
        draws,
        losses,
        series: seriesNumber
      };
    });
  } catch (error) {
    console.error(`Error parsing rankings for series ${seriesNumber}:`, error);
    throw new Error(`Failed to parse rankings for series ${seriesNumber}`);
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
    const series1Matches = await parseMatchesCSV(1);
    const series2Matches = await parseMatchesCSV(2);
    const series3Matches = await parseMatchesCSV(3);
    
    const series1Rankings = await parseRankingsCSV(1);
    const series2Rankings = await parseRankingsCSV(2);
    const series3Rankings = await parseRankingsCSV(3);
    
    const allMatches = [...series1Matches, ...series2Matches, ...series3Matches];
    
    // Create team performance objects
    const teamMap = new Map<string, TeamPerformance>();
    
    // Process rankings to get team names and IDs
    [...series1Rankings, ...series2Rankings, ...series3Rankings].forEach(ranking => {
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
