import React from 'react';
import { Box, Flex, Text, Badge, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { Match } from '../types/dataTypes';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
}

/**
 * MatchCard component displays a single match with teams and scores
 * 
 * This is a sample component showing how the match data would be displayed
 * using Chakra UI as the component library
 */
const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const winnerBg = useColorModeValue('green.100', 'green.900');
  const loserBg = useColorModeValue('red.50', 'red.900');
  
  // Determine winner and loser styling
  const team1IsWinner = match.team1.score > match.team2.score;
  const team2IsWinner = match.team2.score > match.team1.score;
  const isDraw = match.team1.score === match.team2.score;
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBg}
      p={4}
      shadow="md"
      cursor="pointer"
      onClick={() => onClick(match)}
      transition="all 0.2s"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <Badge colorScheme="blue">Match #{match.matchNumber}</Badge>
        <Badge colorScheme="purple">Series {match.series}</Badge>
      </Flex>
      
      <Flex direction="column" gap={4}>
        {/* Team 1 */}
        <Flex 
          justifyContent="space-between" 
          p={2} 
          borderRadius="md"
          bg={team1IsWinner ? winnerBg : team2IsWinner ? loserBg : 'transparent'}
        >
          <Tooltip label={`Stand ID: ${match.team1.id}`}>
            <Text fontWeight="bold" isTruncated maxWidth="70%">
              {match.team1.name}
            </Text>
          </Tooltip>
          <Text fontSize="xl" fontWeight="bold">
            {match.team1.score}
          </Text>
        </Flex>
        
        {/* VS Divider */}
        <Flex justifyContent="center" alignItems="center">
          <Text fontSize="sm" color="gray.500">VS</Text>
        </Flex>
        
        {/* Team 2 */}
        <Flex 
          justifyContent="space-between" 
          p={2} 
          borderRadius="md"
          bg={team2IsWinner ? winnerBg : team1IsWinner ? loserBg : 'transparent'}
        >
          <Tooltip label={`Stand ID: ${match.team2.id}`}>
            <Text fontWeight="bold" isTruncated maxWidth="70%">
              {match.team2.name}
            </Text>
          </Tooltip>
          <Text fontSize="xl" fontWeight="bold">
            {match.team2.score}
          </Text>
        </Flex>
      </Flex>
      
      {/* Match Result */}
      <Flex justifyContent="center" mt={3}>
        <Badge colorScheme={isDraw ? 'gray' : 'green'}>
          {isDraw 
            ? 'Draw' 
            : `Winner: ${team1IsWinner ? match.team1.name : match.team2.name}`}
        </Badge>
      </Flex>
    </Box>
  );
};

export default MatchCard;
