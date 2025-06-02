import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import TeamRanking from '@/models/TeamRanking';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Clear existing data
    await Match.deleteMany({});
    await TeamRanking.deleteMany({});

    const results = {
      matches: 0,
      rankings: 0,
      errors: [] as string[],
    };

    // Migrate matches data
    for (let series = 1; series <= 3; series++) {
      try {
        const matchesPath = path.join(process.cwd(), 'public', 'data', `matchs_serie_${series}.csv`);
        const matchesCSV = fs.readFileSync(matchesPath, 'utf-8');
        
        const { data: matchesData } = Papa.parse(matchesCSV, { 
          header: true, 
          skipEmptyLines: true,
          transform: (value: string) => value.trim()
        });

        for (const row of matchesData as any[]) {
          try {
            // Extract team1 data
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

            const match = new Match({
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
              series
            });

            await match.save();
            results.matches++;
          } catch (error) {
            results.errors.push(`Error processing match in series ${series}: ${error}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error reading matches file for series ${series}: ${error}`);
      }

      // Migrate rankings data
      try {
        const rankingsPath = path.join(process.cwd(), 'public', 'data', `classement_serie_${series}.csv`);
        const rankingsCSV = fs.readFileSync(rankingsPath, 'utf-8');
        
        const { data: rankingsData } = Papa.parse(rankingsCSV, { 
          header: true, 
          skipEmptyLines: true,
          transform: (value: string) => value.trim()
        });

        for (const row of rankingsData as any[]) {
          try {
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

            const ranking = new TeamRanking({
              position: parseInt(position) || 0,
              name,
              standId: row['Stand'] || '',
              country,
              totalPoints,
              matchesPlayed,
              wins,
              draws,
              losses,
              series
            });

            await ranking.save();
            results.rankings++;
          } catch (error) {
            results.errors.push(`Error processing ranking in series ${series}: ${error}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error reading rankings file for series ${series}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data migration completed',
      results
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}
