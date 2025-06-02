# Eurobot Dashboard - Project Data Bank

This document serves as a comprehensive reference for building the Eurobot Dashboard application, including technology choices, data structures, and implementation guidelines.

## 1. Technology Stack

### Core Framework
- **React 18+**: Component-based UI library for building interactive interfaces
- **Next.js 13+**: React framework providing server-side rendering, routing, and development tools

### UI Components
- **Chakra UI** or **Material UI**: Comprehensive component libraries with modern design aesthetics
  - Chakra UI offers more flexibility and customization
  - Material UI provides a consistent, polished look with extensive components

### Data Visualization
- **Recharts**: React-based charting library for visualizing team performance
- **Victory**: Alternative React charting library with interactive capabilities

### Data Management
- **React Query**: Library for fetching, caching, and state management
- **Papa Parse**: CSV parsing library for browser-based applications

### Development Tools
- **TypeScript**: For type safety and better developer experience
- **ESLint/Prettier**: Code quality and formatting
- **Jest/React Testing Library**: Testing framework

## 2. Installation Guide

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest eurobot_dashboard --typescript

# Navigate to project directory
cd eurobot_dashboard

# Install UI library (choose one)
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
# OR
npm install @mui/material @emotion/react @emotion/styled

# Install data visualization
npm install recharts
# OR
npm install victory

# Install data management and parsing
npm install react-query papaparse
npm install @types/papaparse --save-dev

# Start development server
npm run dev
```

## 3. Data Structure

Based on the CSV files, here are the data models:

### Match Data Model
```typescript
interface Match {
  matchNumber: number;
  matchId: string;
  team1: {
    name: string;
    id: string;
    score: number;
  };
  team2: {
    name: string;
    id: string;
    score: number;
  };
  winner: string; // team1, team2, or draw
  series: number; // 1, 2, or 3
}
```

### Team Ranking Model
```typescript
interface TeamRanking {
  position: number;
  name: string;
  standId: string;
  country: string;
  totalPoints: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  series: number; // 1, 2, or 3
}
```

### Team Performance Model
```typescript
interface TeamPerformance {
  name: string;
  standId: string;
  country: string;
  matches: Match[];
  rankings: {
    series1?: TeamRanking;
    series2?: TeamRanking;
    series3?: TeamRanking;
  };
  totalPoints: number;
  averagePoints: number;
}
```

## 4. CSV Parsing Utilities

```typescript
// utils/dataParser.ts
import Papa from 'papaparse';

export const parseMatchesCSV = async (seriesNumber: number): Promise<Match[]> => {
  const response = await fetch(`/data/matchs_serie_${seriesNumber}.csv`);
  const csv = await response.text();
  
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  
  return data.map((row: any) => ({
    matchNumber: parseInt(row['#']),
    matchId: row[';;Équipe 1'].split(';')[0],
    team1: {
      name: row[';;Équipe 1'].split(';')[1],
      id: row[';;Équipe 1'].split(';')[2] || '',
      score: parseInt(row['Score'].split(';')[0])
    },
    team2: {
      name: row[';;Équipe 2'].split(';')[0],
      id: row[';;Équipe 2'].split(';')[1] || '',
      score: parseInt(row['Score'].split(';')[1])
    },
    winner: parseInt(row['Score'].split(';')[0]) > parseInt(row['Score'].split(';')[1]) ? 'team1' : 'team2',
    series: seriesNumber
  }));
};

export const parseRankingsCSV = async (seriesNumber: number): Promise<TeamRanking[]> => {
  const response = await fetch(`/data/classement_serie_${seriesNumber}.csv`);
  const csv = await response.text();
  
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  
  return data.map((row: any) => ({
    position: row[';Équipe'].split(';')[0],
    name: row[';Équipe'].split(';')[1],
    standId: row['Stand'].trim(),
    country: row[';Origine'].split(';')[1].trim(),
    totalPoints: parseInt(row['Cumul'].split(';')[0]),
    matchesPlayed: parseInt(row['Joués']),
    wins: parseInt(row['Vict.']),
    draws: parseInt(row['Égal.']),
    losses: parseInt(row['Déf.']),
    series: seriesNumber
  }));
};

export const getAllTeamData = async (): Promise<TeamPerformance[]> => {
  // Fetch all data
  const series1Matches = await parseMatchesCSV(1);
  const series2Matches = await parseMatchesCSV(2);
  const series3Matches = await parseMatchesCSV(3);
  
  const series1Rankings = await parseRankingsCSV(1);
  const series2Rankings = await parseRankingsCSV(2);
  const series3Rankings = await parseRankingsCSV(3);
  
  const allMatches = [...series1Matches, ...series2Matches, ...series3Matches];
  
  // Create team performance objects
  const teamMap = new Map<string, TeamPerformance>();
  
  // Process rankings to get team names and IDs
  [...series1Rankings, ...series2Rankings, ...series3Rankings].forEach(ranking => {
    if (!teamMap.has(ranking.name)) {
      teamMap.set(ranking.name, {
        name: ranking.name,
        standId: ranking.standId,
        country: ranking.country,
        matches: [],
        rankings: {},
        totalPoints: 0,
        averagePoints: 0
      });
    }
    
    const team = teamMap.get(ranking.name);
    if (team) {
      team.rankings[`series${ranking.series}`] = ranking;
      team.totalPoints += ranking.totalPoints;
    }
  });
  
  // Add matches to each team
  allMatches.forEach(match => {
    const team1 = teamMap.get(match.team1.name);
    const team2 = teamMap.get(match.team2.name);
    
    if (team1) team1.matches.push(match);
    if (team2) team2.matches.push(match);
  });
  
  // Calculate average points
  teamMap.forEach(team => {
    const seriesPlayed = Object.keys(team.rankings).length;
    team.averagePoints = seriesPlayed > 0 ? team.totalPoints / seriesPlayed : 0;
  });
  
  return Array.from(teamMap.values());
};
```

## 5. Component Breakdown

### Layout Components
- **Header**: Navigation, title, series selector
- **Footer**: Credits, links
- **Layout**: Page structure, responsive container

### Match Components
- **MatchCard**: Compact display of match info (teams, scores)
- **MatchList**: Grid/list of all matches with filtering
- **MatchDetails**: Expanded view with detailed match information

### Team Components
- **TeamCard**: Compact display of team info (name, rank, points)
- **TeamList**: Grid/list of all teams with filtering
- **TeamDetails**: Expanded view with performance across series
- **TeamRankings**: Table showing rankings for all teams

### Visualization Components
- **SeriesComparison**: Chart comparing team performance across series
- **PointsDistribution**: Visualization of points distribution
- **TeamPerformanceChart**: Line/bar chart of team's progression

## 6. Page Structure

### Home Page (`pages/index.tsx`)
- Dashboard overview
- Summary statistics
- Quick links to matches and teams
- Top performers visualization

### Matches Page (`pages/matches/index.tsx`)
- List of all matches
- Filtering by series, team, result
- Sorting options

### Match Details Page (`pages/matches/[id].tsx`)
- Detailed information about a specific match
- Team information
- Score breakdown
- Match statistics

### Teams Page (`pages/teams/index.tsx`)
- List of all teams
- Ranking table
- Filtering and sorting options

### Team Details Page (`pages/teams/[id].tsx`)
- Team profile
- Performance across series
- Match history
- Ranking progression

## 7. Implementation Steps

### Phase 1: Project Setup
1. Initialize Next.js project with TypeScript
2. Install dependencies (UI library, data visualization, etc.)
3. Set up project structure and basic routing
4. Create data parsing utilities

### Phase 2: Core Components
1. Implement layout components
2. Build basic match and team card components
3. Create list views for matches and teams
4. Implement detail views

### Phase 3: Data Integration
1. Connect CSV parsing utilities
2. Implement data fetching with React Query
3. Create data context for global state
4. Connect components to data sources

### Phase 4: Visualizations
1. Implement basic charts for team performance
2. Create series comparison visualizations
3. Add interactive elements to charts
4. Optimize visualizations for different screen sizes

### Phase 5: Interactivity & Polish
1. Add filtering and sorting functionality
2. Implement responsive design
3. Add animations and transitions
4. Optimize performance

### Phase 6: Testing & Deployment
1. Write unit tests for critical components
2. Perform cross-browser testing
3. Optimize for production
4. Deploy to hosting platform

## 8. Responsive Design Considerations

- Mobile-first approach
- Breakpoints:
  - Small: 0-600px (mobile)
  - Medium: 600-960px (tablet)
  - Large: 960-1280px (desktop)
  - Extra Large: 1280px+ (large desktop)
- Adaptive layouts:
  - Single column on mobile
  - Two columns on tablet
  - Multi-column grid on desktop
- Touch-friendly interactions:
  - Larger touch targets on mobile
  - Swipe gestures for navigation
  - Collapsible sections for better space utilization

## 9. Performance Optimization

- Implement code splitting with Next.js
- Use React.memo for expensive components
- Optimize CSV parsing with web workers
- Implement virtualized lists for large datasets
- Use Next.js Image component for optimized images
- Implement proper caching strategies with React Query

## 10. Accessibility Considerations

- Semantic HTML structure
- ARIA attributes for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility
- Focus management for modals and dialogs

This data bank provides a comprehensive foundation for building the Eurobot Dashboard application. The technologies, data structures, and implementation steps outlined here will guide the development process and ensure a successful project outcome.
