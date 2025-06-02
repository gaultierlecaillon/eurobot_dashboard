import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { TeamPerformance } from '../types/dataTypes';

interface TeamPerformanceChartProps {
  teams: TeamPerformance[];
  limit?: number;
}

/**
 * TeamPerformanceChart component displays a bar chart comparing team performance across series
 * 
 * This is a sample visualization component showing how team performance data
 * would be visualized using Recharts
 */
const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({ 
  teams,
  limit = 10
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Sort teams by total points and limit to top N
  const topTeams = [...teams]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
  
  // Prepare data for the chart
  const chartData = topTeams.map(team => {
    const series1Points = team.rankings.series1?.totalPoints || 0;
    const series2Points = team.rankings.series2?.totalPoints || 0;
    const series3Points = team.rankings.series3?.totalPoints || 0;
    
    return {
      name: team.name,
      series1: series1Points,
      series2: series2Points,
      series3: series3Points,
      total: team.totalPoints
    };
  });
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      p={4}
      shadow="md"
      bg={useColorModeValue('white', 'gray.800')}
    >
      <Heading as="h3" size="md" mb={4}>
        Top {limit} Teams Performance
      </Heading>
      
      <Text mb={4} fontSize="sm" color="gray.500">
        Points scored by each team across all three series
      </Text>
      
      <Box height="400px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end"
              height={70}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ 
                value: 'Points', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }} 
            />
            <Tooltip 
              formatter={(value, name) => {
                // Format the series names in the tooltip
                const seriesMap: Record<string, string> = {
                  series1: 'Series 1',
                  series2: 'Series 2',
                  series3: 'Series 3',
                  total: 'Total Points'
                };
                return [value, seriesMap[name] || name];
              }}
            />
            <Legend />
            <Bar dataKey="series1" name="Series 1" fill="#8884d8" />
            <Bar dataKey="series2" name="Series 2" fill="#82ca9d" />
            <Bar dataKey="series3" name="Series 3" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default TeamPerformanceChart;
