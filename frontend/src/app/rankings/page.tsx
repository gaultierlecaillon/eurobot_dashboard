'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiService, Ranking, Serie } from '@/lib/api';

export default function Rankings() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSerie, setSelectedSerie] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSeries = useCallback(async () => {
    try {
      setSeriesLoading(true);
      const response = await apiService.getSeries();
      setSeries(response.data);
      // Set default selected serie to the first available serie
      if (response.data.length > 0 && selectedSerie === null) {
        setSelectedSerie(response.data[0].serieNumber);
      }
    } catch (err) {
      setError('Failed to fetch series');
      console.error('Error fetching series:', err);
    } finally {
      setSeriesLoading(false);
    }
  }, [selectedSerie]);

  const fetchRankings = useCallback(async () => {
    if (selectedSerie === null) return;
    
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
    fetchSeries();
  }, [fetchSeries]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const getPositionBadge = (position: number) => {
    if (position === 1) return 'bg-yellow-500 text-white';
    if (position === 2) return 'bg-gray-400 text-white';
    if (position === 3) return 'bg-amber-600 text-white';
    return 'bg-blue-500 text-white';
  };

  if (seriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-300">Error</h3>
            <div className="mt-2 text-sm text-red-200">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h1 className="text-3xl font-bold mb-2 text-slate-100">🏆 Rankings</h1>
        <p className="text-slate-400">Team standings and performance</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-2">
              Search Rankings
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by team name, stand, or origin..."
              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder-slate-400"
            />
          </div>

          {/* Serie Selector */}
          <div>
            <label htmlFor="serie" className="block text-sm font-medium text-slate-300 mb-2">
              Select Serie
            </label>
            {seriesLoading ? (
              <div className="flex justify-center items-center h-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {series.map((serie) => (
                  <button
                    key={serie.serieNumber}
                    onClick={() => setSelectedSerie(serie.serieNumber)}
                    className={`px-3 py-1 rounded-md font-medium transition-colors duration-200 ${
                      selectedSerie === serie.serieNumber
                        ? 'bg-slate-600 text-slate-100'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Serie {serie.serieNumber}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">Serie {selectedSerie} Rankings</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Matches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    W-D-L
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No rankings available for Serie {selectedSerie}
                    </td>
                  </tr>
                ) : (() => {
                  // Filter rankings based on search term
                  const filteredRankings = rankings.filter(ranking => {
                    const teamName = ranking.team.name.toLowerCase();
                    const teamStand = ranking.team.stand.toLowerCase();
                    const teamOrigin = ranking.team.origin.toLowerCase();
                    const search = searchTerm.toLowerCase();
                    
                    return teamName.includes(search) || 
                           teamStand.includes(search) || 
                           teamOrigin.includes(search);
                  });
                  
                  if (filteredRankings.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="text-slate-400 text-6xl mb-4">🔍</div>
                          <h3 className="text-lg font-medium text-slate-100 mb-2">No teams found</h3>
                          <p className="text-slate-400">Try adjusting your search criteria.</p>
                        </td>
                      </tr>
                    );
                  }
                  
                  return filteredRankings.map((ranking) => (
                    <tr key={ranking._id} className="hover:bg-slate-700/50">
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
                              className="text-sm font-medium text-slate-100 hover:text-slate-300 transition-colors duration-200 cursor-pointer"
                            >
                              {ranking.team.name}
                            </Link>
                            <div className="text-sm text-slate-400">{ranking.team.stand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-100">{ranking.team.origin}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-100">{ranking.points}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-100">{ranking.matchesPlayed}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-100">
                          <span className="text-green-400 font-medium">{ranking.victories}</span>-
                          <span className="text-yellow-400 font-medium">{ranking.draws}</span>-
                          <span className="text-red-400 font-medium">{ranking.defeats}</span>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Total Teams</h4>
          <p className="text-3xl font-bold text-slate-100">{rankings.length}</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Filtered</h4>
          <p className="text-3xl font-bold text-slate-100">
            {searchTerm ? rankings.filter(ranking => {
              const teamName = ranking.team.name.toLowerCase();
              const teamStand = ranking.team.stand.toLowerCase();
              const teamOrigin = ranking.team.origin.toLowerCase();
              const search = searchTerm.toLowerCase();
              
              return teamName.includes(search) || 
                     teamStand.includes(search) || 
                     teamOrigin.includes(search);
            }).length : rankings.length}
          </p>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Highest Score</h4>
          <p className="text-3xl font-bold text-slate-100">
            {rankings.length > 0 ? Math.max(...rankings.map(r => r.points)) : 0}
          </p>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Average Score</h4>
          <p className="text-3xl font-bold text-slate-100">
            {rankings.length > 0 ? Math.round(rankings.reduce((sum, r) => sum + r.points, 0) / rankings.length) : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
