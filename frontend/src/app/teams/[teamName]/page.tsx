'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService, Match, Team } from '@/lib/api';

export default function TeamDetail() {
  const params = useParams();
  const router = useRouter();
  const teamName = decodeURIComponent(params.teamName as string);
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, [teamName]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team matches
      const matchesResponse = await apiService.getTeamMatches(teamName);
      setMatches(matchesResponse.data);
      
      // Try to find the team details from the teams list
      const teamsResponse = await apiService.getTeams();
      const foundTeam = teamsResponse.data.find(t => t.name === teamName);
      setTeam(foundTeam || null);
      
    } catch (err) {
      setError('Failed to fetch team data');
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMatchResult = (match: Match, teamName: string) => {
    const isTeam1 = match.team1.name === teamName;
    const teamScore = isTeam1 ? match.team1.score : match.team2.score;
    const opponentScore = isTeam1 ? match.team2.score : match.team1.score;
    
    if (teamScore > opponentScore) return 'win';
    if (teamScore < opponentScore) return 'loss';
    return 'draw';
  };

  const getOpponent = (match: Match, teamName: string) => {
    return match.team1.name === teamName ? match.team2 : match.team1;
  };

  const getTeamScore = (match: Match, teamName: string) => {
    return match.team1.name === teamName ? match.team1.score : match.team2.score;
  };

  const getOpponentScore = (match: Match, teamName: string) => {
    return match.team1.name === teamName ? match.team2.score : match.team1.score;
  };

  // Calculate statistics
  const wins = matches.filter(match => getMatchResult(match, teamName) === 'win').length;
  const draws = matches.filter(match => getMatchResult(match, teamName) === 'draw').length;
  const losses = matches.filter(match => getMatchResult(match, teamName) === 'loss').length;
  const totalPoints = matches.reduce((sum, match) => sum + getTeamScore(match, teamName), 0);
  const totalOpponentPoints = matches.reduce((sum, match) => sum + getOpponentScore(match, teamName), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-4 text-blue-100 hover:text-white transition-colors duration-200 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold mb-2">🤖 {teamName}</h1>
            {team && (
              <div className="flex items-center space-x-4 text-blue-100">
                <span>Stand: {team.stand}</span>
                <span>•</span>
                <span>Origin: {team.origin}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{matches.length}</div>
            <div className="text-blue-100">Total Matches</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Victories</h4>
          <p className="text-3xl font-bold text-green-600">{wins}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Draws</h4>
          <p className="text-3xl font-bold text-yellow-600">{draws}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Defeats</h4>
          <p className="text-3xl font-bold text-red-600">{losses}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Points Scored</h4>
          <p className="text-3xl font-bold text-blue-600">{totalPoints}</p>
          <p className="text-sm text-gray-500">vs {totalOpponentPoints} conceded</p>
        </div>
      </div>

      {/* Matches */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Matches</h2>
        </div>
        
        {matches.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500">This team hasn't played any matches yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {matches.map((match) => {
              const result = getMatchResult(match, teamName);
              const opponent = getOpponent(match, teamName);
              const teamScore = getTeamScore(match, teamName);
              const opponentScore = getOpponentScore(match, teamName);
              
              return (
                <div key={match._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        result === 'win' ? 'bg-green-500' : 
                        result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          Serie {match.serie} - Match #{match.matchNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          vs {opponent.name} ({opponent.stand})
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {teamScore} - {opponentScore}
                      </div>
                      <div className={`text-sm font-medium ${
                        result === 'win' ? 'text-green-600' : 
                        result === 'loss' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {result === 'win' ? 'Victory' : result === 'loss' ? 'Defeat' : 'Draw'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Match History by Serie */}
      {matches.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Performance by Serie</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...new Set(matches.map(m => m.serie))].sort().map(serie => {
                const serieMatches = matches.filter(m => m.serie === serie);
                const serieWins = serieMatches.filter(match => getMatchResult(match, teamName) === 'win').length;
                const serieDraws = serieMatches.filter(match => getMatchResult(match, teamName) === 'draw').length;
                const serieLosses = serieMatches.filter(match => getMatchResult(match, teamName) === 'loss').length;
                
                return (
                  <div key={serie} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Serie {serie}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Matches:</span>
                        <span className="font-medium">{serieMatches.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wins:</span>
                        <span className="font-medium text-green-600">{serieWins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Draws:</span>
                        <span className="font-medium text-yellow-600">{serieDraws}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Losses:</span>
                        <span className="font-medium text-red-600">{serieLosses}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
