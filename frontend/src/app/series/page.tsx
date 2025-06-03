'use client';

import React, { useState, useEffect } from 'react';
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
      upcoming: 'bg-yellow-100 text-yellow-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competition Series</h1>
        <p className="text-gray-600">Overview of all Eurobot competition series</p>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No series found</div>
          <p className="text-gray-400 mt-2">Series data will appear here once available.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {series.map((serie) => (
            <div key={serie._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {serie.serieNumber}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{serie.name}</h2>
                      <p className="text-blue-100">{serie.description}</p>
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
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{serie.totalTeams}</div>
                        <div className="text-sm text-gray-500">Teams</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{serie.totalMatches}</div>
                        <div className="text-sm text-gray-500">Matches</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                        <p className="text-gray-900">
                          {formatDate(serie.startDate)} - {formatDate(serie.endDate)}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="text-gray-900">{serie.location}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Rules</h3>
                        <p className="text-gray-900">{serie.rules}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Live Stream Video */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Stream</h3>
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
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-gray-400 text-lg mb-2">📹</div>
                          <p className="text-gray-500">No live stream available</p>
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
