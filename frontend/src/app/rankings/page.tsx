'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiService, Ranking } from '@/lib/api';

export default function Rankings() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSerie, setSelectedSerie] = useState<number>(3);

  const fetchRankings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getRankingsBySerie(selectedSerie);
      setRankings(response.data);
    } catch (err) {
      setError('Failed to fetch rankings');
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSerie]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const getPositionBadge = (position: number) => {
    if (position === 1) return 'bg-yellow-500 text-white';
    if (position === 2) return 'bg-gray-400 text-white';
    if (position === 3) return 'bg-amber-600 text-white';
    return 'bg-blue-500 text-white';
  };

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
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🏆 Rankings</h1>
        <p className="text-yellow-100">Team standings and performance</p>
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

      {/* Rankings Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Serie {selectedSerie} Rankings</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  W-D-L
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankings.map((ranking) => (
                <tr key={ranking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionBadge(ranking.position)}`}>
                      {ranking.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <Link 
                          href={`/teams/${encodeURIComponent(ranking.team.name)}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                        >
                          {ranking.team.name}
                        </Link>
                        <div className="text-sm text-gray-500">{ranking.team.stand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ranking.team.origin}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{ranking.points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ranking.matchesPlayed}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="text-green-600 font-medium">{ranking.victories}</span>-
                      <span className="text-yellow-600 font-medium">{ranking.draws}</span>-
                      <span className="text-red-600 font-medium">{ranking.defeats}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Teams</h4>
          <p className="text-3xl font-bold text-blue-600">{rankings.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Highest Score</h4>
          <p className="text-3xl font-bold text-green-600">
            {rankings.length > 0 ? Math.max(...rankings.map(r => r.points)) : 0}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Average Score</h4>
          <p className="text-3xl font-bold text-purple-600">
            {rankings.length > 0 ? Math.round(rankings.reduce((sum, r) => sum + r.points, 0) / rankings.length) : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
