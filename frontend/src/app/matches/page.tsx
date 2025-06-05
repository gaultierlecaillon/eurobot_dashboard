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
  const [searchTerm, setSearchTerm] = useState('');
  const [showHighestTotalMatch, setShowHighestTotalMatch] = useState(false);
  const [showHighestScoreMatch, setShowHighestScoreMatch] = useState(false);
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
        <h1 className="text-3xl font-bold mb-2 text-slate-100">⚔️ Matches</h1>
        <p className="text-slate-400">Competition match results</p>
      </div>

            {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-slate-700 text-slate-300">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Total Matches</p>
              <p className="text-2xl font-semibold text-slate-100">{matches.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6 cursor-pointer hover:bg-slate-750 transition-colors duration-200"
             onClick={() => {
               setSearchTerm('');
               setShowHighestTotalMatch(!showHighestTotalMatch);
             }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-slate-700 text-slate-300">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Highest Total Score Match</p>
              {matches.length > 0 ? (() => {
                // Find match with highest combined score
                const matchWithHighestTotal = [...matches].sort((a, b) => 
                  (b.team1.score + b.team2.score) - (a.team1.score + a.team2.score)
                )[0];
                
                const totalScore = matchWithHighestTotal.team1.score + matchWithHighestTotal.team2.score;
                
                return (
                  <div>
                    <p className="text-2xl font-semibold text-slate-100">
                      {totalScore} <span className="text-sm text-slate-400">pts</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Match #{matchWithHighestTotal.matchNumber} 
                      <span className="ml-1 text-slate-500">
                        (Click to {showHighestTotalMatch ? 'show all' : 'filter'})
                      </span>
                    </p>
                  </div>
                );
              })() : <p className="text-2xl font-semibold text-slate-100">0</p>}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6 cursor-pointer hover:bg-slate-750 transition-colors duration-200"
             onClick={() => {
               setSearchTerm('');
               setShowHighestTotalMatch(false);
               setShowHighestScoreMatch(!showHighestScoreMatch);
             }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-slate-700 text-slate-300">
              <span className="text-2xl">🥇</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Highest Score</p>
              {matches.length > 0 ? (() => {
                const highestScore = Math.max(...matches.flatMap(m => [m.team1.score, m.team2.score]));
                const teamWithHighestScore = matches.find(m => 
                  m.team1.score === highestScore || m.team2.score === highestScore
                );
                
                if (!teamWithHighestScore) return <p className="text-2xl font-semibold text-slate-100">{highestScore}</p>;
                
                const isTeam1 = teamWithHighestScore.team1.score === highestScore;
                const teamName = isTeam1 ? teamWithHighestScore.team1.name : teamWithHighestScore.team2.name;
                
                return (
                  <div>
                    <p className="text-2xl font-semibold text-slate-100">{highestScore}</p>
                    <div className="flex items-center text-xs text-slate-400">
                      <span>{teamName}</span>
                      <span className="mx-1">•</span>
                      <span>Match #{teamWithHighestScore.matchNumber}</span>
                      <span className="ml-1 text-slate-500">
                        (Click to {showHighestScoreMatch ? 'show all' : 'filter'})
                      </span>
                    </div>
                  </div>
                );
              })() : <p className="text-2xl font-semibold text-slate-100">0</p>}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-slate-700 text-slate-300">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">Average Score</p>
              <p className="text-2xl font-semibold text-slate-100">
                {matches.length > 0 ? 
                  Math.round(matches.reduce((sum, m) => sum + m.team1.score + m.team2.score, 0) / (matches.length * 2)) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-2">
              Search Matches
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by team name, stand, or match number..."
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

      {/* Matches Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            // Filter matches based on search term and highest score filters
            let filteredMatches = matches;
            
            if (showHighestTotalMatch && matches.length > 0) {
              // Find match with highest combined score
              const matchWithHighestTotal = [...matches].sort((a, b) => 
                (b.team1.score + b.team2.score) - (a.team1.score + a.team2.score)
              )[0];
              
              filteredMatches = matches.filter(match => 
                match.matchNumber === matchWithHighestTotal.matchNumber && 
                match.serie === matchWithHighestTotal.serie
              );
            } else if (showHighestScoreMatch && matches.length > 0) {
              // Find match with highest individual score
              const highestScore = Math.max(...matches.flatMap(m => [m.team1.score, m.team2.score]));
              
              filteredMatches = matches.filter(match => 
                match.team1.score === highestScore || match.team2.score === highestScore
              );
            } else if (searchTerm) {
              filteredMatches = matches.filter(match => {
                const matchNumber = match.matchNumber.toString();
                const team1Name = match.team1.name.toLowerCase();
                const team2Name = match.team2.name.toLowerCase();
                const team1Stand = match.team1.stand.toLowerCase();
                const team2Stand = match.team2.stand.toLowerCase();
                const search = searchTerm.toLowerCase();
                
                return matchNumber.includes(search) || 
                       team1Name.includes(search) || 
                       team2Name.includes(search) ||
                       team1Stand.includes(search) ||
                       team2Stand.includes(search);
              });
            }
            
            if (matches.length === 0) {
              return (
                <div className="col-span-full text-center py-8 text-slate-400">
                  No matches available for Serie {selectedSerie}
                </div>
              );
            }
            
            if (filteredMatches.length === 0) {
              return (
                <div className="col-span-full text-center py-12">
                  <div className="text-slate-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-slate-100 mb-2">No matches found</h3>
                  <p className="text-slate-400">Try adjusting your search criteria.</p>
                </div>
              );
            }
            
            return filteredMatches.map((match) => (
              <div key={match._id} className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-slate-400">Match #{match.matchNumber}</span>
                  <span className="text-sm text-slate-400">Serie {match.serie}</span>
                </div>
                
                <div className="space-y-4">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link 
                        href={`/teams/${encodeURIComponent(match.team1.name)}`}
                        className="font-medium text-slate-100 hover:text-slate-300 transition-colors duration-200 cursor-pointer"
                      >
                        {match.team1.name}
                      </Link>
                      <div className="text-sm text-slate-400">{match.team1.stand}</div>
                    </div>
                    <div className={`text-2xl font-bold px-3 py-1 rounded ${
                      match.team1.score > match.team2.score 
                        ? 'bg-green-900/50 text-green-300' 
                        : match.team1.score === match.team2.score
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-red-900/50 text-red-300'
                    }`}>
                      {match.team1.score}
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="text-center text-slate-400 font-medium">VS</div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link 
                        href={`/teams/${encodeURIComponent(match.team2.name)}`}
                        className="font-medium text-slate-100 hover:text-slate-300 transition-colors duration-200 cursor-pointer"
                      >
                        {match.team2.name}
                      </Link>
                      <div className="text-sm text-slate-400">{match.team2.stand}</div>
                    </div>
                    <div className={`text-2xl font-bold px-3 py-1 rounded ${
                      match.team2.score > match.team1.score 
                        ? 'bg-green-900/50 text-green-300' 
                        : match.team2.score === match.team1.score
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-red-900/50 text-red-300'
                    }`}>
                      {match.team2.score}
                    </div>
                  </div>
                </div>

                {/* Match Result */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-center">
                    {match.team1.score > match.team2.score ? (
                      <span className="text-green-400 font-medium">
                        🏆 <Link 
                          href={`/teams/${encodeURIComponent(match.team1.name)}`}
                          className="hover:underline"
                        >
                          {match.team1.name}
                        </Link> wins!
                      </span>
                    ) : match.team2.score > match.team1.score ? (
                      <span className="text-green-400 font-medium">
                        🏆 <Link 
                          href={`/teams/${encodeURIComponent(match.team2.name)}`}
                          className="hover:underline"
                        >
                          {match.team2.name}
                        </Link> wins!
                      </span>
                    ) : (
                      <span className="text-yellow-400 font-medium">🤝 Draw</span>
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
                          className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <span className="mr-1">🎥</span> Watch Match
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Video Modal */}
      {selectedMatch && (() => {
        const currentSerie = series.find(s => s.serieNumber === selectedMatch.serie);
        const videoUrl = currentSerie ? getVideoUrlWithTimecode(selectedMatch, currentSerie) : null;
        
        return videoUrl ? (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
