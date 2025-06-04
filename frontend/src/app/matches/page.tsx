'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiService, Match, Serie } from '@/lib/api';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSerie, setSelectedSerie] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const searchParams = useSearchParams();

  // Helper function to generate video URL with timecode
  const getVideoUrlWithTimecode = (match: Match, serie: Serie) => {
    if (!match.timecode || !serie.liveStreamUrl) return null;
    
    // Check if the URL already has parameters
    const hasParams = serie.liveStreamUrl.includes('?');
    const separator = hasParams ? '&' : '?';
    
    return `${serie.liveStreamUrl}${separator}start=${match.timecode}`;
  };

  const fetchSeries = useCallback(async () => {
    try {
      setSeriesLoading(true);
      const response = await apiService.getSeries();
      setSeries(response.data);
      
      // Check for serie parameter in URL
      const serieParam = searchParams.get('serie');
      if (serieParam && selectedSerie === null) {
        const serieNumber = parseInt(serieParam, 10);
        if (!isNaN(serieNumber) && response.data.some(s => s.serieNumber === serieNumber)) {
          setSelectedSerie(serieNumber);
        } else if (response.data.length > 0) {
          setSelectedSerie(response.data[0].serieNumber);
        }
      } else if (response.data.length > 0 && selectedSerie === null) {
        // Set default selected serie to the first available serie
        setSelectedSerie(response.data[0].serieNumber);
      }
    } catch (err) {
      setError('Failed to fetch series');
      console.error('Error fetching series:', err);
    } finally {
      setSeriesLoading(false);
    }
  }, [selectedSerie, searchParams]);

  const fetchMatches = useCallback(async () => {
    if (selectedSerie === null) return;
    
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
    fetchSeries();
  }, [fetchSeries]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (seriesLoading) {
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
        {seriesLoading ? (
          <div className="flex justify-center items-center h-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {series.map((serie) => (
              <button
                key={serie.serieNumber}
                onClick={() => setSelectedSerie(serie.serieNumber)}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  selectedSerie === serie.serieNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Serie {serie.serieNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No matches available for Serie {selectedSerie}
            </div>
          ) : (
            matches.map((match) => (
              <div key={match._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-500">Match #{match.matchNumber}</span>
                  <span className="text-sm text-gray-500">Serie {match.serie}</span>
                </div>
                
                <div className="space-y-4">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link 
                        href={`/teams/${encodeURIComponent(match.team1.name)}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                      >
                        {match.team1.name}
                      </Link>
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
                      <Link 
                        href={`/teams/${encodeURIComponent(match.team2.name)}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                      >
                        {match.team2.name}
                      </Link>
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
                      <span className="text-green-600 font-medium">
                        🏆 <Link 
                          href={`/teams/${encodeURIComponent(match.team1.name)}`}
                          className="hover:underline"
                        >
                          {match.team1.name}
                        </Link> wins!
                      </span>
                    ) : match.team2.score > match.team1.score ? (
                      <span className="text-green-600 font-medium">
                        🏆 <Link 
                          href={`/teams/${encodeURIComponent(match.team2.name)}`}
                          className="hover:underline"
                        >
                          {match.team2.name}
                        </Link> wins!
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">🤝 Draw</span>
                    )}
                  </div>
                  
                  {/* Watch Video Button */}
                  {match.timecode && (() => {
                    const currentSerie = series.find(s => s.serieNumber === match.serie);
                    const videoUrl = currentSerie ? getVideoUrlWithTimecode(match, currentSerie) : null;
                    
                    return videoUrl ? (
                      <div className="mt-3">
                        <button
                          onClick={() => setSelectedMatch(match)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          🎥 Watch Match (at {Math.floor(match.timecode / 60)}:{(match.timecode % 60).toString().padStart(2, '0')})
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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

      {/* Video Modal */}
      {selectedMatch && (() => {
        const currentSerie = series.find(s => s.serieNumber === selectedMatch.serie);
        const videoUrl = currentSerie ? getVideoUrlWithTimecode(selectedMatch, currentSerie) : null;
        
        return videoUrl ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Match #{selectedMatch.matchNumber} - Serie {selectedMatch.serie}
                  </h3>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span>{selectedMatch.team1.name} ({selectedMatch.team1.stand})</span>
                    <span className="font-bold">
                      {selectedMatch.team1.score} - {selectedMatch.team2.score}
                    </span>
                    <span>{selectedMatch.team2.name} ({selectedMatch.team2.stand})</span>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Starting at {Math.floor(selectedMatch.timecode! / 60)}:{(selectedMatch.timecode! % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={videoUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="rounded-md"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
}
