'use client'

import { useState, useEffect } from 'react'
import { MatchCard } from '@/components/MatchCard'
import { TeamPerformanceChart } from '@/components/TeamPerformanceChart'
import { Match, TeamPerformance } from '@/types/dataTypes'
import { fetchMatches, getAllTeamData } from '@/services/dataService'

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])
  const [teamData, setTeamData] = useState<TeamPerformance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<number>(1)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  
  const [isOpen, setIsOpen] = useState(false)
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get all team data
        const teams = await getAllTeamData()
        setTeamData(teams)
        
        // Get all matches
        const allMatches = await fetchMatches()
        setMatches(allMatches)
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load dashboard data. Please try again later.')
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Calculate summary statistics
  const totalTeams = teamData.length
  const totalMatches = matches.length
  
  // Get top teams
  const topTeams = [...teamData]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5)
  
  // Get recent matches for the selected series
  const seriesMatches = matches.filter(match => match.series === selectedSeries)
  
  // Handle match card click
  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match)
    onOpen()
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Eurobot Dashboard</h1>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Dashboard content */}
      {!loading && !error && (
        <>
          {/* Summary statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg shadow p-5 bg-white">
              <h2 className="text-lg font-bold mb-2">Total Teams</h2>
              <p className="text-3xl font-bold">{totalTeams}</p>
              <p className="text-gray-600">From {new Set(teamData.map(team => team.country)).size} countries</p>
            </div>
            
            <div className="border rounded-lg shadow p-5 bg-white">
              <h2 className="text-lg font-bold mb-2">Total Matches</h2>
              <p className="text-3xl font-bold">{totalMatches}</p>
              <p className="text-gray-600">Across 3 series</p>
            </div>
            
            <div className="border rounded-lg shadow p-5 bg-white">
              <h2 className="text-lg font-bold mb-2">Highest Score</h2>
              <p className="text-3xl font-bold">
                {Math.max(...matches.flatMap(m => [m.team1.score, m.team2.score]))}
              </p>
              <p className="text-gray-600">Points in a single match</p>
            </div>
          </div>
          
          {/* Team Performance Chart */}
          <div className="mb-8">
            <TeamPerformanceChart teams={teamData} limit={8} />
          </div>
          
          {/* Recent Matches */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Matches</h2>
            </div>
            
            <div className="flex mb-4">
              <button 
                className={`mr-2 px-4 py-2 rounded ${selectedSeries === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectedSeries(1)}
              >
                Series 1
              </button>
              <button 
                className={`mr-2 px-4 py-2 rounded ${selectedSeries === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectedSeries(2)}
              >
                Series 2
              </button>
              <button 
                className={`px-4 py-2 rounded ${selectedSeries === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectedSeries(3)}
              >
                Series 3
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matches
                .filter(match => match.series === selectedSeries)
                .slice(0, 6)
                .map((match) => (
                  <MatchCard 
                    key={`${match.series}-${match.matchNumber}`}
                    match={match}
                    onClick={handleMatchClick}
                  />
                ))}
            </div>
            
            {matches.filter(match => match.series === selectedSeries).length === 0 && (
              <div className="text-center py-10">
                <p className="text-lg">No matches found for Series {selectedSeries}</p>
              </div>
            )}
          </div>
          
          {/* Top Teams */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Top Teams</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topTeams.map((team) => (
                <div key={team.name} className="border rounded-lg shadow p-5 bg-white">
                  <div className="flex justify-between mb-2">
                    <p className="font-bold">{team.name}</p>
                    <p className="text-gray-500">{team.country}</p>
                  </div>
                  <p className="text-3xl font-bold">{team.totalPoints}</p>
                  <p className="text-gray-600">
                    {Object.keys(team.rankings).length} series played
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Match details dialog */}
      {isOpen && selectedMatch && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div 
            className="bg-white rounded-lg shadow-lg max-w-2xl w-11/12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">
                Match #{selectedMatch.matchNumber} - Series {selectedMatch.series}
              </h3>
              <button 
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="font-bold">Team 1</p>
                  <p className="text-xl">{selectedMatch.team1.name}</p>
                  <p>Stand ID: {selectedMatch.team1.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Score</p>
                  <p className="text-3xl font-bold">{selectedMatch.team1.score}</p>
                </div>
              </div>
              
              <div className="flex justify-between mb-4">
                <div>
                  <p className="font-bold">Team 2</p>
                  <p className="text-xl">{selectedMatch.team2.name}</p>
                  <p>Stand ID: {selectedMatch.team2.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Score</p>
                  <p className="text-3xl font-bold">{selectedMatch.team2.score}</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-100 rounded">
                <p className="font-bold">Result</p>
                <p className="text-lg">
                  {selectedMatch.team1.score === selectedMatch.team2.score
                    ? 'Draw'
                    : `Winner: ${
                        selectedMatch.team1.score > selectedMatch.team2.score
                          ? selectedMatch.team1.name
                          : selectedMatch.team2.name
                      }`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
