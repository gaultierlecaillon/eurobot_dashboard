# Eurobot Dashboard - Sample Components

This directory contains sample components that demonstrate how the Eurobot Dashboard application would be implemented using the proposed technology stack. These components are not meant to be functional on their own but serve as examples of how the application would be structured and how the components would work together.

## Technology Stack

- **React** with **Next.js** for the core framework
- **Chakra UI** for the component library
- **Recharts** for data visualization
- **React Query** for data fetching and state management
- **Papa Parse** for CSV parsing
- **TypeScript** for type safety

## Directory Structure

- `types/` - TypeScript interfaces for the application's data models
- `utils/` - Utility functions for data parsing and other common operations
- `visualizations/` - Components for data visualization
- `MatchCard.tsx` - Component for displaying match information
- `MatchesPage.tsx` - Page component for displaying matches
- `HomePage.tsx` - Main dashboard page component
- `package.json` - Project dependencies

## Component Overview

### Data Models (`types/dataTypes.ts`)

The application uses three main data models:

1. **Match** - Represents a single match between two teams
2. **TeamRanking** - Represents a team's position in a series
3. **TeamPerformance** - Aggregates a team's performance across all series

### Data Parsing (`utils/dataParser.ts`)

The application uses utility functions to parse the CSV data files:

1. `parseMatchesCSV` - Parses match data for a specific series
2. `parseRankingsCSV` - Parses ranking data for a specific series
3. `getAllTeamData` - Aggregates team data across all series

### UI Components

1. **MatchCard** - Displays match information in a card format
2. **TeamPerformanceChart** - Visualizes team performance across series
3. **MatchesPage** - Displays a list of matches with filtering options
4. **HomePage** - Main dashboard with summary statistics and recent matches

## How to Use These Components

In a real project, these components would be integrated into a Next.js application. The application would use the following structure:

```
eurobot_dashboard/
├── components/
│   ├── MatchCard.tsx
│   ├── visualizations/
│   │   └── TeamPerformanceChart.tsx
│   └── ...
├── pages/
│   ├── index.tsx (HomePage)
│   ├── matches/
│   │   └── index.tsx (MatchesPage)
│   └── ...
├── types/
│   └── dataTypes.ts
├── utils/
│   └── dataParser.ts
└── ...
```

## Implementation Notes

1. **Data Fetching** - The components use React Query for data fetching, which provides caching, loading states, and error handling.
2. **Responsive Design** - The components use Chakra UI's responsive props to ensure they work well on all screen sizes.
3. **Visualization** - The application uses Recharts for data visualization, which provides interactive charts that work well with React.
4. **Type Safety** - The application uses TypeScript for type safety, which helps catch errors at compile time.

## Getting Started

To use these components in a real project, you would need to:

1. Create a Next.js project with TypeScript
2. Install the dependencies listed in `package.json`
3. Copy the components into the appropriate directories
4. Adjust the imports and file paths as needed
5. Set up the data fetching to work with your actual data sources

## Example Installation

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest eurobot_dashboard --typescript

# Navigate to project directory
cd eurobot_dashboard

# Install dependencies
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
npm install recharts react-query papaparse
npm install @types/papaparse --save-dev

# Start development server
npm run dev
```

These sample components provide a foundation for building the Eurobot Dashboard application. They demonstrate how the application would be structured and how the components would work together to create an interactive and informative dashboard for the Eurobot competition.
