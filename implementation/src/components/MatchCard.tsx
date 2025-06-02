'use client'

import { Match } from '@/types/dataTypes'

interface MatchCardProps {
  match: Match
  onClick: (match: Match) => void
}

/**
 * MatchCard component displays a single match with teams and scores
 * 
 * This component shows match information in a card format with team names, scores, and result
 */
export function MatchCard({ match, onClick }: MatchCardProps) {
  // Determine winner and loser styling
  const team1IsWinner = match.team1.score > match.team2.score
  const team2IsWinner = match.team2.score > match.team1.score
  const isDraw = match.team1.score === match.team2.score
  
  return (
    <div 
      className="border border-gray-200 rounded-lg overflow-hidden bg-white p-4 shadow cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      onClick={() => onClick(match)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Match #{match.matchNumber}</span>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Series {match.series}</span>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Team 1 */}
        <div 
          className={`flex justify-between p-2 rounded ${
            team1IsWinner 
              ? 'bg-green-100' 
              : team2IsWinner 
                ? 'bg-red-50' 
                : ''
          }`}
        >
          <p className="font-bold max-w-[70%] truncate" title={`Stand ID: ${match.team1.id}`}>
            {match.team1.name}
          </p>
          <p className="text-xl font-bold">
            {match.team1.score}
          </p>
        </div>
        
        {/* VS Divider */}
        <div className="flex justify-center items-center">
          <p className="text-sm text-gray-500">VS</p>
        </div>
        
        {/* Team 2 */}
        <div 
          className={`flex justify-between p-2 rounded ${
            team2IsWinner 
              ? 'bg-green-100' 
              : team1IsWinner 
                ? 'bg-red-50' 
                : ''
          }`}
        >
          <p className="font-bold max-w-[70%] truncate" title={`Stand ID: ${match.team2.id}`}>
            {match.team2.name}
          </p>
          <p className="text-xl font-bold">
            {match.team2.score}
          </p>
        </div>
      </div>
      
      {/* Match Result */}
      <div className="flex justify-center mt-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
          isDraw 
            ? 'bg-gray-100 text-gray-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {isDraw 
            ? 'Draw' 
            : `Winner: ${team1IsWinner ? match.team1.name : match.team2.name}`}
        </span>
      </div>
    </div>
  )
}
