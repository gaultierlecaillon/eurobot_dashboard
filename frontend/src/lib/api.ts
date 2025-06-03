import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface Team {
  _id: string;
  name: string;
  stand: string;
  origin: string;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  _id: string;
  matchNumber: number;
  serie: number;
  team1: {
    name: string;
    stand: string;
    score: number;
  };
  team2: {
    name: string;
    stand: string;
    score: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Ranking {
  _id: string;
  serie: number;
  position: number;
  team: {
    name: string;
    stand: string;
    origin: string;
  };
  points: number;
  matchesPlayed: number;
  victories: number;
  draws: number;
  defeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface Serie {
  _id: string;
  serieNumber: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  totalTeams: number;
  totalMatches: number;
  location: string;
  rules: string;
  liveStreamUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerieStats {
  serie: Serie;
  totalMatches: number;
  totalTeams: number;
  totalScore: number;
  averageScore: number;
}

export interface Stats {
  totalTeams: number;
  totalMatches: number;
  totalRankings: number;
  totalSeries: number;
  matchesBySerie: Array<{ _id: number; count: number }>;
  topTeams: Ranking[];
  lastKnownSerie: number;
}

// API methods
export const apiService = {
  // Teams
  getTeams: (): Promise<{ data: Team[] }> => api.get('/teams'),
  getTeam: (id: string): Promise<{ data: Team }> => api.get(`/teams/${id}`),
  getTeamMatches: (teamName: string): Promise<{ data: Match[] }> => 
    api.get(`/teams/${encodeURIComponent(teamName)}/matches`),

  // Matches
  getMatches: (serie?: number): Promise<{ data: Match[] }> => {
    const params = serie ? { serie } : {};
    return api.get('/matches', { params });
  },
  getMatch: (id: string): Promise<{ data: Match }> => api.get(`/matches/${id}`),

  // Rankings
  getRankings: (serie?: number): Promise<{ data: Ranking[] }> => {
    const params = serie ? { serie } : {};
    return api.get('/rankings', { params });
  },
  getRankingsBySerie: (serie: number): Promise<{ data: Ranking[] }> => 
    api.get(`/rankings/serie/${serie}`),

  // Series
  getSeries: (): Promise<{ data: Serie[] }> => api.get('/series'),
  getSerie: (id: string): Promise<{ data: Serie }> => api.get(`/series/${id}`),
  getSerieByNumber: (number: number): Promise<{ data: Serie }> => 
    api.get(`/series/number/${number}`),
  createSerie: (serie: Partial<Serie>): Promise<{ data: Serie }> => 
    api.post('/series', serie),
  updateSerie: (id: string, serie: Partial<Serie>): Promise<{ data: Serie }> => 
    api.put(`/series/${id}`, serie),
  deleteSerie: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/series/${id}`),
  getSerieStats: (id: string): Promise<{ data: SerieStats }> => 
    api.get(`/series/${id}/stats`),

  // Statistics
  getStats: (): Promise<{ data: Stats }> => api.get('/stats'),

  // Utility
  healthCheck: (): Promise<{ data: { status: string; timestamp: string } }> => 
    api.get('/health'),
  reseedDatabase: (): Promise<{ data: { message: string } }> => 
    api.post('/reseed'),
};

export default api;
