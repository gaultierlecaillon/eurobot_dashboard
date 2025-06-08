'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiService, Match, Team, Serie, Ranking } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TeamDetail() {
  const params = useParams();
  const router = useRouter();
  const teamName = decodeURIComponent(params.teamName as string);
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [series, setSeries] = useState<Serie[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Helper function to generate video URL with timecode
  const getVideoUrlWithTimecode = (match: Match, serie: Serie) => {
    if (!match.timecode || !serie.liveStreamUrl) return null;
    
    // Check if the URL already has parameters
    const hasParams = serie.liveStreamUrl.includes('?');
    const separator = hasParams ? '&' : '?';
    
    return `${serie.liveStreamUrl}${separator}start=${match.timecode}`;
  };

  // Define fetchTeamData before using it in useEffect
  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team matches
      const matchesResponse = await apiService.getTeamMatches(teamName);
      setMatches(matchesResponse.data);
      
      // Try to find the team details from the teams list
      const teamsResponse = await apiService.getTeams();
      const foundTeam = teamsResponse.data.find(t => t.name === teamName);
      setTeam(foundTeam || null);
      
      // Fetch series data for video functionality
      const seriesResponse = await apiService.getSeries();
      setSeries(seriesResponse.data);
      
      // Fetch rankings data
      const rankingsResponse = await apiService.getRankings();
      setRankings(rankingsResponse.data.filter(r => r.team.name === teamName));
      
    } catch (err) {
      setError('Failed to fetch team data');
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamName]);


  const getMatchResult = (match: Match, teamName: string) => {
    const isTeam1 = match.team1.name === teamName;
    const teamScore = isTeam1 ? match.team1.score : match.team2.score;
    const opponentScore = isTeam1 ? match.team2.score : match.team1.score;
    
    if (teamScore > opponentScore) return 'win';
    if (teamScore < opponentScore) return 'loss';
    return 'draw';
  };

  const getOpponent = (match: Match, teamName: string) => {
    return match.team1.name === teamName ? match.team2 : match.team1;
  };

  const getTeamScore = (match: Match, teamName: string) => {
    return match.team1.name === teamName ? match.team1.score : match.team2.score;
  };

  const getOpponentScore = (match: Match, teamName: string) => {
    return match.team1.name === teamName ? match.team2.score : match.team1.score;
  };

  // Calculate statistics
  const wins = matches.filter(match => getMatchResult(match, teamName) === 'win').length;
  const draws = matches.filter(match => getMatchResult(match, teamName) === 'draw').length;
  const losses = matches.filter(match => getMatchResult(match, teamName) === 'loss').length;
  const totalPoints = matches.reduce((sum, match) => sum + getTeamScore(match, teamName), 0);
  const totalOpponentPoints = matches.reduce((sum, match) => sum + getOpponentScore(match, teamName), 0);
  const maxPointsInMatch = matches.length > 0 ? Math.max(...matches.map(match => getTeamScore(match, teamName))) : 0;
  const avgPointsPerMatch = matches.length > 0 ? (totalPoints / matches.length).toFixed(1) : '0';

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
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-4 text-slate-400 hover:text-slate-100 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold mb-2 text-slate-100">🤖 {teamName}</h1>
            {team && (
              <div className="flex items-center space-x-4 text-slate-400">
                <span>Stand: {team.stand}</span>
                <span>•</span>
                <span>Origin: {team.origin}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-100">
              {rankings.length > 0 ? 
                (() => {
                  const position = rankings.sort((a, b) => b.serie - a.serie)[0].position;
                  const medal = position === 1 ? '🥇 ' : 
                               position === 2 ? '🥈 ' : 
                               position === 3 ? '🥉 ' : '';
                  return `${medal}#${position}`;
                })() : 
                'N/A'}
            </div>
            <div className="text-slate-400">Last Ranking</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-3">Match Results</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Victories:</span>
              <span className="font-bold text-green-400">{wins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Draws:</span>
              <span className="font-bold text-yellow-400">{draws}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Defeats:</span>
              <span className="font-bold text-red-400">{losses}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Total Points</h4>
          <p className="text-3xl font-bold text-slate-100">{totalPoints}</p>
          <p className="text-sm text-slate-400">vs {totalOpponentPoints} conceded</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Max Points</h4>
          <p className="text-3xl font-bold text-slate-100">{maxPointsInMatch}</p>
          <p className="text-sm text-slate-400">in a single match</p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Avg Points</h4>
          <p className="text-3xl font-bold text-slate-100">{avgPointsPerMatch}</p>
          <p className="text-sm text-slate-400">per match</p>
        </div>
      </div>

      {/* Matches */}
      <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">All Matches</h2>
        </div>
        
        {matches.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-slate-400 text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-slate-100 mb-2">No matches found</h3>
            <p className="text-slate-400">This team hasn't played any matches yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {matches.map((match) => {
              const result = getMatchResult(match, teamName);
              const opponent = getOpponent(match, teamName);
              const teamScore = getTeamScore(match, teamName);
              const opponentScore = getOpponentScore(match, teamName);
              
              return (
                <div key={match._id} className="p-6 hover:bg-slate-700/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        result === 'win' ? 'bg-green-400' : 
                        result === 'loss' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}></div>
                      
                      <div>
                        <div className="font-medium text-slate-100">
                          Serie {match.serie} - Match #{match.matchNumber}
                        </div>
                        <div className="text-sm text-slate-400">
                          vs <Link 
                            href={`/teams/${encodeURIComponent(opponent.name)}`}
                            className="hover:text-slate-300 transition-colors duration-200 cursor-pointer"
                          >
                            {opponent.name}
                          </Link> ({opponent.stand})
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <div className="text-lg font-semibold text-slate-100">
                          {teamScore} - {opponentScore}
                        </div>
                        <div className={`text-sm font-medium ${
                          result === 'win' ? 'text-green-400' : 
                          result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {result === 'win' ? 'Victory' : result === 'loss' ? 'Defeat' : 'Draw'}
                        </div>
                      </div>
                      
                      {/* Watch Video Button */}
                      {match.timecode && (() => {
                        const currentSerie = series.find(s => s.serieNumber === match.serie);
                        const videoUrl = currentSerie ? getVideoUrlWithTimecode(match, currentSerie) : null;
                        
                        return videoUrl ? (
                          <button
                            onClick={() => setSelectedMatch(match)}
                            className="bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium py-1 px-3 rounded-md transition-colors duration-200 flex items-center gap-1"
                          >
                            <span className="mr-1">🎥</span> Watch Match
                          </button>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance by Serie Chart */}
      {matches.length > 0 && (
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-slate-100">Performance by Serie</h2>
          </div>
          
          <div className="p-6">
            <div className="h-80">
                <p className="text-sm text-slate-400 mb-4">
                This chart shows the team&#39;s performance across different series. The blue line represents total points scored, while the orange line shows ranking position (lower is better, with 1st place being the top position).
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[...new Set(matches.map(m => m.serie))].sort().map(serie => {
                    const serieMatches = matches.filter(m => m.serie === serie);
                    const totalPoints = serieMatches.reduce((sum, match) => sum + getTeamScore(match, teamName), 0);
                    
                    // Find ranking for this serie
                    const ranking = rankings.find(r => r.serie === serie);
                    
                    return {
                      serie: `Serie ${serie}`,
                      points: totalPoints,
                      matches: serieMatches.length,
                      position: ranking ? ranking.position : null
                    };
                  }).filter(item => item.position !== null)} // Filter out items without ranking data
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="serie" 
                    tick={{ fontSize: 12, fill: '#cbd5e1' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'Points', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
                    tick={{ fontSize: 12, fill: '#cbd5e1' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Ranking', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
                    tick={{ fontSize: 12, fill: '#cbd5e1' }}
                    domain={[1, 'dataMax']}
                    reversed={true}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'points') return [value, 'Points'];
                      if (name === 'position') return [value, 'Ranking'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => label}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                      if (value === 'points') return 'Points Scored';
                      if (value === 'position') return 'Ranking Position';
                      return value;
                    }}
                    wrapperStyle={{
                      paddingTop: '10px',
                      color: '#cbd5e1'
                    }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="points" 
                    stroke="#60a5fa"
                    strokeWidth={3}
                    dot={{ fill: '#60a5fa', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#60a5fa', strokeWidth: 2 }}
                    yAxisId="left"
                    name="points"
                  />
                  <Line 
                    type="monotone"
                    dataKey="position" 
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#f97316', strokeWidth: 2 }}
                    yAxisId="right"
                    name="position"
                    connectNulls={true} // Connect points even if there are null values
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
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
