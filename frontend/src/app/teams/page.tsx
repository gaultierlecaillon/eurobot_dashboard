'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService, Team } from '@/lib/api';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeams();
      setTeams(response.data);
    } catch (err) {
      setError('Failed to fetch teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique origins for filter
  const origins = [...new Set(teams.map(team => team.origin))].sort();

  // Filter teams based on search and origin
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.stand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin = selectedOrigin === '' || team.origin === selectedOrigin;
    return matchesSearch && matchesOrigin;
  });

  if (loading) {
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
        <h1 className="text-3xl font-bold mb-2 text-slate-100">🤖 Teams</h1>
        <p className="text-slate-400">All participating robotics teams</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-2">
              Search Teams
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by team name or stand..."
              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder-slate-400"
            />
          </div>

          {/* Origin Filter */}
          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-slate-300 mb-2">
              Filter by Origin
            </label>
            <select
              id="origin"
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {origins.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeams.map((team) => (
          <Link 
            key={team._id} 
            href={`/teams/${encodeURIComponent(team.name)}`}
            className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6 hover:shadow-lg hover:border-slate-600 transition-all duration-200 cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-sm font-medium text-slate-300 bg-slate-700 px-2 py-1 rounded">
                {team.stand}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-100 line-clamp-2 hover:text-slate-300 transition-colors duration-200">
                {team.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">🌍</span>
                <span className="text-sm text-slate-300">{team.origin}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Stand: {team.stand}</span>
                <span>Team ID: {team._id.slice(-6)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-slate-100 mb-2">No teams found</h3>
          <p className="text-slate-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Total Teams</h4>
          <p className="text-3xl font-bold text-slate-100">{teams.length}</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Countries</h4>
          <p className="text-3xl font-bold text-slate-100">{origins.length}</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Filtered</h4>
          <p className="text-3xl font-bold text-slate-100">{filteredTeams.length}</p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Most Common</h4>
          <p className="text-lg font-bold text-slate-100">
            {origins.length > 0 ? 
              origins.reduce((a, b) => 
                teams.filter(t => t.origin === a).length > teams.filter(t => t.origin === b).length ? a : b
              ) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
