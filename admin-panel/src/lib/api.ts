// API client for the admin panel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Movie management
  async getMovies(page: number = 1, limit: number = 20) {
    return this.request(`/api/admin/movies?page=${page}&limit=${limit}`);
  }

  async getMovie(id: number) {
    return this.request(`/api/admin/movies/${id}`);
  }

  async createMovie(movieData: any) {
    return this.request(`/api/admin/movies`, {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  async updateMovie(id: number, movieData: any) {
    return this.request(`/api/admin/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    });
  }

  async deleteMovie(id: number) {
    return this.request(`/api/admin/movies/${id}`, {
      method: 'DELETE',
    });
  }

  // User management
  async getUsers(page: number = 1, limit: number = 20) {
    return this.request(`/api/admin/users?page=${page}&limit=${limit}`);
  }

  async getUser(id: number) {
    return this.request(`/api/admin/users/${id}`);
  }

  async updateUser(id: number, userData: any) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Analytics
  async getAnalytics() {
    return this.request('/api/admin/analytics');
  }

  async getWatchStats() {
    return this.request('/api/admin/analytics/watch-stats');
  }

  async getUserStats() {
    return this.request('/api/admin/analytics/user-stats');
  }

  // TMDB integration
  async searchTMDB(query: string) {
    return this.request(`/api/admin/tmdb/search?q=${encodeURIComponent(query)}`);
  }

  async importFromTMDB(tmdbId: number, isMovie: boolean = true) {
    return this.request('/api/admin/tmdb/import', {
      method: 'POST',
      body: JSON.stringify({ tmdbId, isMovie }),
    });
  }

  // Bulk operations
  async bulkUpdateMovies(updates: any[]) {
    return this.request('/api/admin/movies/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async bulkDeleteMovies(ids: number[]) {
    return this.request('/api/admin/movies/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;