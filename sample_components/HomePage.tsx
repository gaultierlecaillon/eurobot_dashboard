import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  SimpleGrid, 
  Flex, 
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import TeamPerformanceChart from './visualizations/TeamPerformanceChart';
import MatchCard from './MatchCard';
import { Match, TeamPerformance } from './types/dataTypes';
import { parseMatchesCSV, parseRankingsCSV, getAllTeamData } from './utils/dataParser';

/**
 * HomePage component serves as the main dashboard for the Eurobot application
 * 
 * This is a sample page component showing how the dashboard would be structured
 * using the proposed technology stack
 */
const HomePage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamData, setTeamData] = useState<TeamPerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<number>(1);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all team data
        const teams = await getAllTeamData();
        setTeamData(teams);
        
        // Get recent matches
        const series1Matches = await parseMatchesCSV(1);
        const series2Matches = await parseMatchesCSV(2);
        const series3Matches = await parseMatchesCSV(3);
        
        const allMatches = [...series1Matches, ...series2Matches, ...series3Matches];
        setMatches(allMatches);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate summary statistics
  const totalTeams = teamData.length;
  const totalMatches = matches.length;
  
  // Get top teams
  const topTeams = [...teamData]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);
  
  // Get recent matches for the selected series
  const seriesMatches = matches.filter(match => match.series === selectedSeries);
  
  // Handle match click (in a real app, this would navigate to match details)
  const handleMatchClick = (match: Match) => {
    console.log('Match clicked:', match);
    // In a real app: navigate(`/matches/${match.series}/${match.matchNumber}`);
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Eurobot Dashboard</Heading>
      
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
      
      {/* Dashboard content */}
      {!loading && !error && (
        <>
          {/* Summary statistics */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            <Box 
              p={5} 
              shadow="md" 
              borderWidth="1px" 
              borderRadius="lg" 
              borderColor={borderColor}
              bg={cardBg}
            >
              <Stat>
                <StatLabel>Total Teams</StatLabel>
                <StatNumber>{totalTeams}</StatNumber>
                <StatHelpText>From {teamData.reduce((acc, team) => acc.add(team.country), new Set()).size} countries</StatHelpText>
              </Stat>
            </Box>
            
            <Box 
              p={5} 
              shadow="md" 
              borderWidth="1px" 
              borderRadius="lg" 
              borderColor={borderColor}
              bg={cardBg}
            >
              <Stat>
                <StatLabel>Total Matches</StatLabel>
                <StatNumber>{totalMatches}</StatNumber>
                <StatHelpText>Across 3 series</StatHelpText>
              </Stat>
            </Box>
            
            <Box 
              p={5} 
              shadow="md" 
              borderWidth="1px" 
              borderRadius="lg" 
              borderColor={borderColor}
              bg={cardBg}
            >
              <Stat>
                <StatLabel>Highest Score</StatLabel>
                <StatNumber>
                  {Math.max(...matches.flatMap(m => [m.team1.score, m.team2.score]))}
                </StatNumber>
                <StatHelpText>Points in a single match</StatHelpText>
              </Stat>
            </Box>
          </SimpleGrid>
          
          {/* Team Performance Chart */}
          <Box mb={8}>
            <TeamPerformanceChart teams={teamData} limit={8} />
          </Box>
          
          {/* Recent Matches */}
          <Box mb={8}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading as="h2" size="md">Recent Matches</Heading>
              <Button 
                as={Link} 
                to="/matches" 
                size="sm" 
                colorScheme="blue"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('View all matches clicked');
                  // In a real app: navigate('/matches');
                }}
              >
                View All
              </Button>
            </Flex>
            
            <Tabs 
              variant="enclosed" 
              colorScheme="blue" 
              onChange={(index) => setSelectedSeries(index + 1)}
              defaultIndex={selectedSeries - 1}
            >
              <TabList>
                <Tab>Series 1</Tab>
                <Tab>Series 2</Tab>
                <Tab>Series 3</Tab>
              </TabList>
              
              <TabPanels>
                {[1, 2, 3].map((series) => (
                  <TabPanel key={series} p={0} pt={4}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {matches
                        .filter(match => match.series === series)
                        .slice(0, 6)
                        .map((match) => (
                          <MatchCard 
                            key={`${match.series}-${match.matchNumber}`}
                            match={match}
                            onClick={handleMatchClick}
                          />
                        ))}
                    </SimpleGrid>
                    
                    {matches.filter(match => match.series === series).length === 0 && (
                      <Box textAlign="center" py={10}>
                        <Text fontSize="lg">No matches found for Series {series}</Text>
                      </Box>
                    )}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Box>
          
          {/* Top Teams */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading as="h2" size="md">Top Teams</Heading>
              <Button 
                as={Link} 
                to="/teams" 
                size="sm" 
                colorScheme="blue"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('View all teams clicked');
                  // In a real app: navigate('/teams');
                }}
              >
                View All
              </Button>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {topTeams.map((team) => (
                <Box 
                  key={team.name}
                  p={5} 
                  shadow="md" 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  borderColor={borderColor}
                  bg={cardBg}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  onClick={() => {
                    console.log('Team clicked:', team);
                    // In a real app: navigate(`/teams/${team.standId}`);
                  }}
                >
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="bold" fontSize="lg">{team.name}</Text>
                    <Text color="gray.500">{team.country}</Text>
                  </Flex>
                  
                  <Stat mt={2}>
                    <StatLabel>Total Points</StatLabel>
                    <StatNumber>{team.totalPoints}</StatNumber>
                    <StatHelpText>
                      {Object.keys(team.rankings).length} series played
                    </StatHelpText>
                  </Stat>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </>
      )}
    </Container>
  );
};

export default HomePage;
