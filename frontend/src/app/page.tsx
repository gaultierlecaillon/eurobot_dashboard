'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService, Stats } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Eurobot 2025 Dashboard</h1>
        <p className="text-blue-100">Competition overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-900/50 text-blue-400">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Teams</p>
              <p className="text-2xl font-semibold text-slate-100">{stats?.totalTeams || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-900/50 text-green-400">
              <span className="text-2xl">⚔️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Matches</p>
              <p className="text-2xl font-semibold text-slate-100">{stats?.totalMatches || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-900/50 text-yellow-400">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Series</p>
              <p className="text-2xl font-semibold text-slate-100">{stats?.totalSeries || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-900/50 text-purple-400">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Points Scored</p>
              <p className="text-2xl font-semibold text-slate-100">{stats?.totalPointsScored || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matches by Serie Chart */}
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Matches by Serie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.matchesBySerie || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="_id" tick={{ fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#e2e8f0'
                }} 
              />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Teams */}
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Top 5 Teams (Serie {stats?.lastKnownSerie || 1})
          </h3>
          <div className="space-y-3">
            {stats?.topTeams?.slice(0, 5).map((team, index) => (
              <div key={team._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-slate-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                  }`}>
                    {team.position}
                  </div>
                  <div>
                    <Link 
                      href={`/teams/${encodeURIComponent(team.team.name)}`}
                      className="font-medium text-slate-100 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                    >
                      {team.team.name}
                    </Link>
                    <p className="text-sm text-slate-400">{team.team.origin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-100">{team.points} pts</p>
                  <div className="text-sm">
                    <span className="text-green-400 font-medium">{team.victories}</span>W-
                    <span className="text-yellow-400 font-medium">{team.draws}</span>D-
                    <span className="text-red-400 font-medium">{team.defeats}</span>L
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
