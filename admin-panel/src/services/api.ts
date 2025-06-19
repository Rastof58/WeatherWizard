import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse, Analytics, Movie, User, Admin, WatchStats, Notification } from '../types';

class AdminApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = '/api/admin') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(username: string, password: string): Promise<ApiResponse<{ admin: Admin; token: string }>> {
    try {
      const response = await this.api.post('/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      localStorage.removeItem('admin_token');
    }
  }

  async getCurrentAdmin(): Promise<ApiResponse<Admin>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const response = await this.api.get('/analytics');
    return response.data;
  }

  async getWatchStats(movieId?: number): Promise<WatchStats[]> {
    const response = await this.api.get('/analytics/watch-stats', {
      params: movieId ? { movieId } : {},
    });
    return response.data;
  }

  async getUserGrowth(period: '7d' | '30d' | '90d' = '30d'): Promise<any[]> {
    const response = await this.api.get('/analytics/user-growth', {
      params: { period },
    });
    return response.data;
  }

  // User Management
  async getUsers(page = 1, limit = 20, search?: string): Promise<PaginatedResponse<User>> {
    const response = await this.api.get('/users', {
      params: { page, limit, search },
    });
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async blockUser(id: number, reason?: string): Promise<ApiResponse<void>> {
    const response = await this.api.patch(`/users/${id}/block`, { reason });
    return response.data;
  }

  async unblockUser(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.patch(`/users/${id}/unblock`);
    return response.data;
  }

  async resetUserProgress(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/users/${id}/progress`);
    return response.data;
  }

  async bulkUserAction(userIds: number[], action: 'block' | 'unblock' | 'reset_progress', reason?: string): Promise<ApiResponse<void>> {
    const response = await this.api.post('/users/bulk-action', {
      userIds,
      action,
      reason,
    });
    return response.data;
  }

  // Movie Management
  async getMovies(page = 1, limit = 20, search?: string, status?: string): Promise<PaginatedResponse<Movie>> {
    const response = await this.api.get('/movies', {
      params: { page, limit, search, status },
    });
    return response.data;
  }

  async getMovie(id: number): Promise<Movie> {
    const response = await this.api.get(`/movies/${id}`);
    return response.data;
  }

  async createMovie(movieData: Partial<Movie>): Promise<ApiResponse<Movie>> {
    const response = await this.api.post('/movies', movieData);
    return response.data;
  }

  async updateMovie(id: number, movieData: Partial<Movie>): Promise<ApiResponse<Movie>> {
    const response = await this.api.patch(`/movies/${id}`, movieData);
    return response.data;
  }

  async deleteMovie(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/movies/${id}`);
    return response.data;
  }

  async hideMovie(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.patch(`/movies/${id}/hide`);
    return response.data;
  }

  async publishMovie(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.patch(`/movies/${id}/publish`);
    return response.data;
  }

  async bulkMovieAction(movieIds: number[], action: 'hide' | 'publish' | 'delete'): Promise<ApiResponse<void>> {
    const response = await this.api.post('/movies/bulk-action', {
      movieIds,
      action,
    });
    return response.data;
  }

  // TMDB Integration
  async searchTMDB(query: string): Promise<any[]> {
    const response = await this.api.get('/tmdb/search', {
      params: { query },
    });
    return response.data;
  }

  async importFromTMDB(tmdbId: number, isMovie = true): Promise<ApiResponse<Movie>> {
    const response = await this.api.post('/tmdb/import', {
      tmdbId,
      isMovie,
    });
    return response.data;
  }

  // Streaming Sources
  async updateStreamingSources(movieId: number, sources: any[]): Promise<ApiResponse<void>> {
    const response = await this.api.patch(`/movies/${movieId}/sources`, { sources });
    return response.data;
  }

  async testStreamingSource(url: string): Promise<ApiResponse<{ isValid: boolean; quality?: string }>> {
    const response = await this.api.post('/streaming/test', { url });
    return response.data;
  }

  // Notifications
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const response = await this.api.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  }

  async createNotification(notification: Partial<Notification>): Promise<ApiResponse<Notification>> {
    const response = await this.api.post('/notifications', notification);
    return response.data;
  }

  async sendNotification(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/notifications/${id}/send`);
    return response.data;
  }

  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/notifications/${id}`);
    return response.data;
  }

  // System Settings
  async getSystemSettings(): Promise<any> {
    const response = await this.api.get('/settings');
    return response.data;
  }

  async updateSystemSettings(settings: any): Promise<ApiResponse<void>> {
    const response = await this.api.patch('/settings', settings);
    return response.data;
  }

  // System Health
  async getSystemHealth(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }

  async getLogs(page = 1, limit = 50, level?: string): Promise<any> {
    const response = await this.api.get('/logs', {
      params: { page, limit, level },
    });
    return response.data;
  }

  // Error handler
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }
}

export const adminApi = new AdminApiService();
export default AdminApiService;