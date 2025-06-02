import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  SimpleGrid, 
  Select, 
  Flex, 
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import MatchCard from './MatchCard';
import { Match } from './types/dataTypes';
import { parseMatchesCSV } from './utils/dataParser';

/**
 * MatchesPage component displays a grid of match cards with filtering options
 * 
 * This is a sample page component showing how the matches would be displayed
 * using the proposed technology stack
 */
const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Fetch match data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch matches from all series
        const series1Matches = await parseMatchesCSV(1);
        const series2Matches = await parseMatchesCSV(2);
        const series3Matches = await parseMatchesCSV(3);
        
        const allMatches = [...series1Matches, ...series2Matches, ...series3Matches];
        setMatches(allMatches);
        setFilteredMatches(allMatches);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load match data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter matches when series selection changes
  useEffect(() => {
    if (selectedSeries === 0) {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter(match => match.series === selectedSeries));
    }
  }, [selectedSeries, matches]);
  
  // Handle match card click
  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    onOpen();
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Eurobot Matches</Heading>
      
      {/* Filters */}
      <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box flex="1">
          <Text mb={2} fontWeight="medium">Filter by Series</Text>
          <Select 
            value={selectedSeries} 
            onChange={(e) => setSelectedSeries(Number(e.target.value))}
          >
            <option value={0}>All Series</option>
            <option value={1}>Series 1</option>
            <option value={2}>Series 2</option>
            <option value={3}>Series 3</option>
          </Select>
        </Box>
      </Flex>
      
      {/* Loading state */}
      {loading && (
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      )}
      
      {/* Error state */}
      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* Matches grid */}
      {!loading && !error && (
        <>
          <Text mb={4}>Showing {filteredMatches.length} matches</Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredMatches.map((match) => (
              <MatchCard 
                key={`${match.series}-${match.matchNumber}`}
                match={match}
                onClick={handleMatchClick}
              />
            ))}
          </SimpleGrid>
          
          {filteredMatches.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg">No matches found</Text>
            </Box>
          )}
        </>
      )}
      
      {/* Match details modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Match #{selectedMatch?.matchNumber} - Series {selectedMatch?.series}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedMatch && (
              <Box>
                <Flex justify="space-between" mb={4}>
                  <Box>
                    <Text fontWeight="bold">Team 1</Text>
                    <Text fontSize="xl">{selectedMatch.team1.name}</Text>
                    <Text>Stand ID: {selectedMatch.team1.id}</Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontWeight="bold">Score</Text>
                    <Text fontSize="3xl">{selectedMatch.team1.score}</Text>
                  </Box>
                </Flex>
                
                <Flex justify="space-between" mb={4}>
                  <Box>
                    <Text fontWeight="bold">Team 2</Text>
                    <Text fontSize="xl">{selectedMatch.team2.name}</Text>
                    <Text>Stand ID: {selectedMatch.team2.id}</Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontWeight="bold">Score</Text>
                    <Text fontSize="3xl">{selectedMatch.team2.score}</Text>
                  </Box>
                </Flex>
                
                <Box mt={6} p={4} bg="gray.100" borderRadius="md">
                  <Text fontWeight="bold">Result</Text>
                  <Text fontSize="lg">
                    {selectedMatch.team1.score === selectedMatch.team2.score
                      ? 'Draw'
                      : `Winner: ${
                          selectedMatch.team1.score > selectedMatch.team2.score
                            ? selectedMatch.team1.name
                            : selectedMatch.team2.name
                        }`}
                  </Text>
                </Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MatchesPage;
