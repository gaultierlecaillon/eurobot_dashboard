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
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🤖 Teams</h1>
        <p className="text-green-100">All participating robotics teams</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Teams
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by team name or stand..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Origin Filter */}
          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Origin
            </label>
            <select
              id="origin"
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {team.stand}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                {team.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">🌍</span>
                <span className="text-sm text-gray-600">{team.origin}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-xs text-gray-500">
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
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Teams</h4>
          <p className="text-3xl font-bold text-blue-600">{teams.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Countries</h4>
          <p className="text-3xl font-bold text-green-600">{origins.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Filtered</h4>
          <p className="text-3xl font-bold text-purple-600">{filteredTeams.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Most Common</h4>
          <p className="text-lg font-bold text-orange-600">
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
