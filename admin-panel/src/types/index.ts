// Core Admin Panel Types
export interface Admin {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'moderator';
  createdAt: string;
  lastLogin?: string;
}

export interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  photoUrl?: string;
  isBlocked: boolean;
  createdAt: string;
  lastActive?: string;
}

export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview?: string;
  releaseDate?: string;
  posterPath?: string;
  backdropPath?: string;
  voteAverage?: number;
  voteCount?: number;
  genres?: string[];
  runtime?: number;
  status: 'published' | 'hidden' | 'draft';
  isCustom: boolean;
  streamingSources: StreamingSource[];
  createdAt: string;
  updatedAt: string;
}

export interface StreamingSource {
  id: number;
  movieId: number;
  provider: 'vidsrc' | 'custom' | 'backup';
  url: string;
  quality: '720p' | '1080p' | '4K';
  isActive: boolean;
  priority: number;
}

export interface WatchStats {
  movieId: number;
  movieTitle: string;
  totalViews: number;
  uniqueViewers: number;
  totalWatchTime: number; // in minutes
  averageWatchTime: number;
  completionRate: number; // percentage
  lastWatched: string;
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalMovies: number;
  totalWatchHours: number;
  popularGenres: GenreStats[];
  recentActivity: ActivityLog[];
  userGrowth: GrowthData[];
  contentPerformance: ContentStats[];
}

export interface GenreStats {
  genre: string;
  count: number;
  percentage: number;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: 'login' | 'watch' | 'search' | 'add_watchlist';
  details: string;
  timestamp: string;
}

export interface GrowthData {
  date: string;
  users: number;
  sessions: number;
  watchTime: number;
}

export interface ContentStats {
  movieId: number;
  title: string;
  views: number;
  rating: number;
  trending: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetUsers: 'all' | 'active' | 'specific';
  userIds?: number[];
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

export interface APIConfig {
  tmdbApiKey: string;
  telegramBotToken: string;
  streamingProviders: {
    vidsrc: { baseUrl: string; isActive: boolean };
    backup: { baseUrl: string; isActive: boolean };
  };
  rateLimits: {
    perUser: number;
    perIP: number;
    timeWindow: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface MovieForm {
  title: string;
  overview: string;
  releaseDate: string;
  genres: string[];
  posterUrl?: string;
  streamingUrl: string;
  isCustom: boolean;
}

export interface UserActionForm {
  userIds: number[];
  action: 'block' | 'unblock' | 'reset_progress';
  reason?: string;
}

export interface NotificationForm {
  title: string;
  message: string;
  type: Notification['type'];
  targetUsers: Notification['targetUsers'];
  userIds?: number[];
  scheduledAt?: string;
}