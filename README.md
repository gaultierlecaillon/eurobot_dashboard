# Eurobot Dashboard

A web-based dashboard to visualize the Eurobot 2025 competition in real-time.

## Project Overview

This dashboard provides an interactive interface for exploring match results and team rankings across the three qualification rounds (series) of the Eurobot competition. Users can click on individual matches to view detailed information and explore team performance data.

## Key Features

- **Dashboard Overview**: Summary statistics and visualizations of the competition
- **Match Explorer**: Interactive list of matches with detailed information
- **Team Profiles**: Performance data for each team across all series
- **Data Visualization**: Charts and graphs showing team performance and match results
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Technology Stack

- **React** with **Next.js** for the core framework
- **Chakra UI** for the component library
- **Recharts** for data visualization
- **React Query** for data fetching and state management
- **Papa Parse** for CSV parsing
- **TypeScript** for type safety

## Getting Started

```bash
# Clone the repository
git clone [repository-url]
cd eurobot_dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

The project follows a standard Next.js structure with additional directories for components, utilities, and data:

- `components/`: UI components organized by feature
- `pages/`: Next.js pages for routing
- `utils/`: Utility functions including data parsing
- `public/data/`: CSV files containing match and ranking data
- `types/`: TypeScript type definitions

## Documentation

For more detailed information about the project, refer to the following documents:

- `eurobot_dashboard_databank.md`: Comprehensive reference for the project
- `eurobot_dashboard_summary.md`: Concise overview of the technology stack
- `eurobot_dashboard_implementation_guide.md`: Step-by-step implementation guide

## Sample Components

The `sample_components/` directory contains example implementations of key components that demonstrate how the application is structured and how the components work together.

## Data

Match results and team rankings at the end of each series are stored in the `data/` folder:

- `matchs_serie_X.csv`: Match results for series X
- `classement_serie_X.csv`: Team rankings for series X

## License

[MIT](LICENSE)
