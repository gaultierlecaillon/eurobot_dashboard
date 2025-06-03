'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiService, Match } from '@/lib/api';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSerie, setSelectedSerie] = useState<number>(3);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getMatches(selectedSerie);
      setMatches(response.data);
    } catch (err) {
      setError('Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSerie]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

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
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">⚔️ Matches</h1>
        <p className="text-red-100">Competition match results</p>
      </div>

      {/* Serie Selector */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Serie</h3>
        <div className="flex space-x-4">
          {[1, 2, 3].map((serie) => (
            <button
              key={serie}
              onClick={() => setSelectedSerie(serie)}
              className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                selectedSerie === serie
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Serie {serie}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div key={match._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">Match #{match.matchNumber}</span>
              <span className="text-sm text-gray-500">Serie {match.serie}</span>
            </div>
            
            <div className="space-y-4">
              {/* Team 1 */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{match.team1.name}</div>
                  <div className="text-sm text-gray-500">{match.team1.stand}</div>
                </div>
                <div className={`text-2xl font-bold px-3 py-1 rounded ${
                  match.team1.score > match.team2.score 
                    ? 'bg-green-100 text-green-800' 
                    : match.team1.score === match.team2.score
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {match.team1.score}
                </div>
              </div>

              {/* VS Divider */}
              <div className="text-center text-gray-400 font-medium">VS</div>

              {/* Team 2 */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{match.team2.name}</div>
                  <div className="text-sm text-gray-500">{match.team2.stand}</div>
                </div>
                <div className={`text-2xl font-bold px-3 py-1 rounded ${
                  match.team2.score > match.team1.score 
                    ? 'bg-green-100 text-green-800' 
                    : match.team2.score === match.team1.score
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {match.team2.score}
                </div>
              </div>
            </div>

            {/* Match Result */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                {match.team1.score > match.team2.score ? (
                  <span className="text-green-600 font-medium">🏆 {match.team1.name} wins!</span>
                ) : match.team2.score > match.team1.score ? (
                  <span className="text-green-600 font-medium">🏆 {match.team2.name} wins!</span>
                ) : (
                  <span className="text-yellow-600 font-medium">🤝 Draw</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Matches</h4>
          <p className="text-3xl font-bold text-blue-600">{matches.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Highest Score</h4>
          <p className="text-3xl font-bold text-green-600">
            {matches.length > 0 ? Math.max(...matches.flatMap(m => [m.team1.score, m.team2.score])) : 0}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Average Score</h4>
          <p className="text-3xl font-bold text-purple-600">
            {matches.length > 0 ? 
              Math.round(matches.reduce((sum, m) => sum + m.team1.score + m.team2.score, 0) / (matches.length * 2)) : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
