'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService, Serie } from '@/lib/api';

const SeriesPage = () => {
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSeries();
        setSeries(response.data);
      } catch (err) {
        setError('Failed to fetch series data');
        console.error('Error fetching series:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      upcoming: 'bg-yellow-900/50 text-yellow-300',
      ongoing: 'bg-green-900/50 text-green-300',
      completed: 'bg-slate-700 text-slate-300'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Clean Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-lg p-6 text-white shadow-md">
          <h1 className="text-3xl font-bold mb-2">📋 Competition Series</h1>
          <p className="text-purple-100">Overview of all Eurobot competition series</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-900/50 text-purple-400">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total Series</p>
                <p className="text-2xl font-semibold text-slate-100">{series.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-violet-900/50 text-violet-400">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total Teams</p>
                <p className="text-2xl font-semibold text-slate-100">
                  {series.reduce((total, serie) => total + serie.totalTeams, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-900/50 text-indigo-400">
                <span className="text-2xl">⚔️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total Matches</p>
                <p className="text-2xl font-semibold text-slate-100">
                  {series.reduce((total, serie) => total + serie.totalMatches, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg">No series found</div>
          <p className="text-slate-500 mt-2">Series data will appear here once available.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {series.map((serie) => (
            <div key={serie._id} className="bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-700">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 bg-opacity-20 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {serie.serieNumber}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{serie.name}</h2>
                      <p className="text-purple-100">{serie.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(serie.status)}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Serie Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-slate-100">{serie.totalTeams}</div>
                        <div className="text-sm text-slate-400">Teams</div>
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-slate-100">{serie.totalMatches}</div>
                        <div className="text-sm text-slate-400">Matches</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-slate-400">Duration</h3>
                        <p className="text-slate-100">
                          {formatDate(serie.startDate)} - {formatDate(serie.endDate)}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-slate-400">Location</h3>
                        <p className="text-slate-100">{serie.location}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-slate-400">Rules</h3>
                        <p className="text-slate-100">{serie.rules}</p>
                      </div>
                    </div>
                    
                    {/* View Matches Button */}
                    <div className="mt-6">
                      <Link
                        href={`/matches?serie=${serie.serieNumber}`}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        <span className="mr-2">⚔️</span>
                        View Matches
                      </Link>
                    </div>
                  </div>
                  
                  {/* Live Stream Video */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-4">Live Stream</h3>
                    {serie.liveStreamUrl ? (
                      <div className="aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={serie.liveStreamUrl}
                          title={`${serie.name} - Live Stream`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          className="rounded-lg shadow-md"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-700/50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-slate-400 text-lg mb-2">📹</div>
                          <p className="text-slate-400">No live stream available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default SeriesPage;
