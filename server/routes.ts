import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWatchProgressSchema, insertAdminSchema, users, movies, watchProgress, watchlist, admins } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

interface AuthenticatedRequest extends Request {
  session: {
    userId?: number;
    adminId?: number;
    destroy: (callback: (err?: any) => void) => void;
  } & any;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || "6ed856acc634e8fbd3cb391dcafc5a01";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve admin panel FIRST - before any other routes
  app.get('/admin*', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CineMini Admin Panel</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .btn { @apply px-4 py-2 rounded font-medium transition-colors; }
        .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
        .form-input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500; }
    </style>
</head>
<body class="bg-gray-100">
    <div id="admin-root"></div>
    
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        function LoginForm({ onLogin }) {
            const [username, setUsername] = useState('');
            const [password, setPassword] = useState('');
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');
            
            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                
                try {
                    const response = await fetch('/api/admin/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        onLogin(data.admin);
                    } else {
                        setError(data.error || 'Login failed');
                    }
                } catch (err) {
                    setError('Network error');
                } finally {
                    setLoading(false);
                }
            };
            
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full space-y-8">
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                CineMini Admin Panel
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Sign in to manage your movie streaming platform
                            </p>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    className="form-input mt-1"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="form-input mt-1"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && (
                                <div className="text-red-600 text-sm text-center">{error}</div>
                            )}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
        
        function Dashboard({ admin, onLogout }) {
            const [stats, setStats] = useState(null);
            const [loading, setLoading] = useState(true);
            
            useEffect(() => {
                fetchStats();
            }, []);
            
            const fetchStats = async () => {
                try {
                    const response = await fetch('/api/admin/analytics');
                    if (response.ok) {
                        const data = await response.json();
                        setStats(data);
                    }
                } catch (err) {
                    console.error('Failed to fetch stats:', err);
                } finally {
                    setLoading(false);
                }
            };
            
            const handleLogout = async () => {
                try {
                    await fetch('/api/admin/auth/logout', { method: 'POST' });
                    onLogout();
                } catch (err) {
                    console.error('Logout failed:', err);
                }
            };
            
            return (
                <div className="min-h-screen bg-gray-100">
                    <nav className="bg-white shadow">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="flex justify-between h-16">
                                <div className="flex items-center">
                                    <h1 className="text-xl font-semibold">CineMini Admin</h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700">Welcome, {admin.username}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-primary"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </nav>
                    
                    <main className="max-w-7xl mx-auto py-6 px-4">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                            <p className="text-gray-600">Overview of your movie streaming platform</p>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-8">Loading statistics...</div>
                        ) : stats ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Total Movies</h3>
                                    <p className="text-3xl font-bold text-green-600">{stats.totalMovies}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
                                    <p className="text-3xl font-bold text-purple-600">{stats.activeUsers}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-900">Watch Hours</h3>
                                    <p className="text-3xl font-bold text-red-600">{stats.totalWatchHours}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Failed to load statistics
                            </div>
                        )}
                        
                        <div className="mt-8 bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium">Movie Management</h4>
                                    <p className="text-sm text-gray-600">Add, edit, and manage movies</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium">User Management</h4>
                                    <p className="text-sm text-gray-600">View and manage user accounts</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium">Analytics</h4>
                                    <p className="text-sm text-gray-600">View detailed analytics and reports</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        }
        
        function AdminApp() {
            const [admin, setAdmin] = useState(null);
            const [loading, setLoading] = useState(true);
            
            useEffect(() => {
                checkAuth();
            }, []);
            
            const checkAuth = async () => {
                try {
                    const response = await fetch('/api/admin/auth/me');
                    if (response.ok) {
                        const data = await response.json();
                        setAdmin(data.admin);
                    }
                } catch (err) {
                    console.error('Auth check failed:', err);
                } finally {
                    setLoading(false);
                }
            };
            
            if (loading) {
                return (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">Loading...</div>
                    </div>
                );
            }
            
            return admin ? (
                <Dashboard admin={admin} onLogout={() => setAdmin(null)} />
            ) : (
                <LoginForm onLogin={setAdmin} />
            );
        }
        
        ReactDOM.render(<AdminApp />, document.getElementById('admin-root'));
    </script>
</body>
</html>
    `);
  });

  // Auth routes
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      let user = await storage.getUserByTelegramId(userData.telegramId);
      if (!user) {
        user = await storage.createUser(userData);
      }
      
      req.session.userId = user.id;
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Admin authentication routes
  app.post("/api/admin/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const admin = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
      
      if (!admin.length) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin[0].password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      (req.session as any).adminId = admin[0].id;
      res.json({ 
        success: true, 
        admin: { 
          id: admin[0].id, 
          username: admin[0].username, 
          role: admin[0].role 
        } 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/admin/auth/me", async (req: AuthenticatedRequest, res) => {
    if (!(req.session as any).adminId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const admin = await db.select().from(admins).where(eq(admins.id, (req.session as any).adminId)).limit(1);
    if (!admin.length) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    res.json({ 
      admin: { 
        id: admin[0].id, 
        username: admin[0].username, 
        role: admin[0].role 
      } 
    });
  });

  // Movie routes
  app.get("/api/movies/trending", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || "Failed to fetch trending movies");
      }
      
      // Store movies in database with genre mapping
      const movies = [];
      
      // Define genre mappings
      const movieGenres = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      };
      
      const tvGenres = {
        10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
        9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
        10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
      };
      
      for (const item of data.results.slice(0, 20)) {
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
          const isMovie = !!item.title;
          const genreMap = isMovie ? movieGenres : tvGenres;
          const genres = item.genre_ids ? item.genre_ids.map((id: number) => ({
            id,
            name: genreMap[id as keyof typeof genreMap] || 'Unknown'
          })).filter((g: any) => g.name !== 'Unknown') : [];
          
          movie = await storage.createMovie({
            tmdbId: item.id,
            title: item.title || item.name,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date,
            voteAverage: item.vote_average,
            voteCount: item.vote_count,
            isMovie,
            runtime: null,
            genres,
            cast: [],
          });
        }
        movies.push(movie);
      }
      
      res.json({ movies });
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ error: "Failed to fetch trending movies" });
    }
  });

  app.get("/api/movies/popular", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || "Failed to fetch popular movies");
      }
      
      const movies = [];
      
      // Define genre mappings
      const movieGenres = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      };
      
      for (const item of data.results.slice(0, 20)) {
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
          const genres = item.genre_ids ? item.genre_ids.map((id: number) => ({
            id,
            name: movieGenres[id as keyof typeof movieGenres] || 'Unknown'
          })).filter((g: any) => g.name !== 'Unknown') : [];
          
          movie = await storage.createMovie({
            tmdbId: item.id,
            title: item.title,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date,
            voteAverage: item.vote_average,
            voteCount: item.vote_count,
            isMovie: true,
            runtime: null,
            genres,
            cast: [],
          });
        }
        movies.push(movie);
      }
      
      res.json({ movies });
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      res.status(500).json({ error: "Failed to fetch popular movies" });
    }
  });

  // Search route must come before the :id route to avoid conflicts
  app.get("/api/movies/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || "Failed to search movies");
      }
      
      const movies = [];
      
      // Define genre mappings
      const movieGenres = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      };
      
      const tvGenres = {
        10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
        9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
        10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
      };
      
      for (const item of data.results.slice(0, 10)) {
        if (item.media_type === 'person') continue;
        
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
          const isMovie = item.media_type === 'movie';
          const genreMap = isMovie ? movieGenres : tvGenres;
          const genres = item.genre_ids ? item.genre_ids.map((id: number) => ({
            id,
            name: genreMap[id as keyof typeof genreMap] || 'Unknown'
          })).filter((g: any) => g.name !== 'Unknown') : [];
          
          movie = await storage.createMovie({
            tmdbId: item.id,
            title: item.title || item.name,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date,
            voteAverage: item.vote_average,
            voteCount: item.vote_count,
            isMovie,
            runtime: null,
            genres,
            cast: [],
          });
        }
        movies.push(movie);
      }
      
      res.json({ movies });
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ error: "Failed to search movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      let movie = await storage.getMovie(movieId);
      
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      // Fetch detailed info from TMDB if needed
      if (!movie.cast || movie.cast.length === 0) {
        const [detailsResponse, creditsResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/${movie.isMovie ? 'movie' : 'tv'}/${movie.tmdbId}?api_key=${TMDB_API_KEY}`),
          fetch(`${TMDB_BASE_URL}/${movie.isMovie ? 'movie' : 'tv'}/${movie.tmdbId}/credits?api_key=${TMDB_API_KEY}`)
        ]);

        const [details, credits] = await Promise.all([
          detailsResponse.json(),
          creditsResponse.json()
        ]);

        // Update the existing movie with detailed info
        const updatedMovieData = {
          tmdbId: movie.tmdbId,
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,
          releaseDate: movie.releaseDate,
          voteAverage: movie.voteAverage,
          voteCount: movie.voteCount,
          runtime: details.runtime || details.episode_run_time?.[0] || null,
          genres: details.genres || [],
          cast: credits.cast?.slice(0, 10).map((actor: any) => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profile_path: actor.profile_path
          })) || [],
          isMovie: movie.isMovie
        };
        
        // For now, return the movie with updated data
        movie = { ...movie, ...updatedMovieData };
      }
      
      res.json({ movie });
    } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

  // Streaming routes
  app.get("/api/movies/:id/stream", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      const movie = await storage.getMovie(movieId);
      
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      // VidSrc integration
      const streamUrl = `https://vidsrc.to/embed/${movie.isMovie ? 'movie' : 'tv'}/${movie.tmdbId}`;
      
      res.json({ 
        streamUrl,
        title: movie.title,
        tmdbId: movie.tmdbId,
        isMovie: movie.isMovie
      });
    } catch (error) {
      console.error("Error getting stream URL:", error);
      res.status(500).json({ error: "Failed to get stream URL" });
    }
  });

  // Watch progress routes
  app.get("/api/watch-progress", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const progress = await storage.getUserWatchProgress(req.session.userId);
      res.json({ progress });
    } catch (error) {
      console.error("Error fetching watch progress:", error);
      res.status(500).json({ error: "Failed to fetch watch progress" });
    }
  });

  app.post("/api/watch-progress", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { movieId, currentTime, duration, completed } = req.body;
      const parsedMovieId = parseInt(movieId);
      
      if (isNaN(parsedMovieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      const progressData = insertWatchProgressSchema.parse({
        movieId: parsedMovieId,
        currentTime: currentTime || 0,
        duration: duration || 0,
        completed: completed || false,
        userId: req.session.userId
      });
      
      const progress = await storage.updateWatchProgress(progressData);
      res.json({ progress });
    } catch (error) {
      console.error("Error updating watch progress:", error);
      res.status(400).json({ error: "Invalid progress data" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const watchlist = await storage.getWatchlist(req.session.userId);
      res.json({ watchlist });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { movieId } = req.body;
      const parsedMovieId = parseInt(movieId);
      
      if (isNaN(parsedMovieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      const item = await storage.addToWatchlist(req.session.userId, parsedMovieId);
      res.json({ item });
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:movieId", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const movieId = parseInt(req.params.movieId);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      await storage.removeFromWatchlist(req.session.userId, movieId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  app.get("/api/watchlist/check/:movieId", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const movieId = parseInt(req.params.movieId);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }
      
      const inWatchlist = await storage.isInWatchlist(req.session.userId, movieId);
      res.json({ inWatchlist });
    } catch (error) {
      console.error("Error checking watchlist:", error);
      res.status(500).json({ error: "Failed to check watchlist" });
    }
  });

  // Admin routes
  app.get('/api/admin/analytics', async (req: AuthenticatedRequest, res) => {
    try {
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const totalMovies = await db.select({ count: sql<number>`count(*)` }).from(movies);
      const activeUsers = await db.select({ count: sql<number>`count(distinct ${watchProgress.userId})` })
        .from(watchProgress)
        .where(sql`${watchProgress.lastWatched} > NOW() - INTERVAL '24 hours'`);
      
      const totalWatchHours = await db.select({ 
        hours: sql<number>`sum(${watchProgress.currentTime}) / 3600` 
      }).from(watchProgress);

      res.json({
        totalUsers: totalUsers[0]?.count || 0,
        totalMovies: totalMovies[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0,
        totalWatchHours: Math.round(totalWatchHours[0]?.hours || 0)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/admin/movies', async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const moviesResult = await db.select()
        .from(movies)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(movies.createdAt));
      
      const totalCount = await db.select({ count: sql<number>`count(*)` }).from(movies);
      
      res.json({
        movies: moviesResult,
        total: totalCount[0]?.count || 0,
        page,
        limit,
        hasNextPage: offset + limit < (totalCount[0]?.count || 0)
      });
    } catch (error) {
      console.error('Error fetching admin movies:', error);
      res.status(500).json({ error: 'Failed to fetch movies' });
    }
  });

  app.put('/api/admin/movies/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedMovie = await db.update(movies)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(movies.id, movieId))
        .returning();
      
      if (updatedMovie.length === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      
      res.json({ movie: updatedMovie[0] });
    } catch (error) {
      console.error('Error updating movie:', error);
      res.status(500).json({ error: 'Failed to update movie' });
    }
  });

  app.delete('/api/admin/movies/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const movieId = parseInt(req.params.id);
      
      // Delete related records first
      await db.delete(watchProgress).where(eq(watchProgress.movieId, movieId));
      await db.delete(watchlist).where(eq(watchlist.movieId, movieId));
      
      const deletedMovie = await db.delete(movies)
        .where(eq(movies.id, movieId))
        .returning();
      
      if (deletedMovie.length === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting movie:', error);
      res.status(500).json({ error: 'Failed to delete movie' });
    }
  });

  app.get('/api/admin/analytics/watch-stats', async (req: AuthenticatedRequest, res) => {
    try {
      const topMovies = await db.select({
        title: movies.title,
        watchCount: sql<number>`count(${watchProgress.id})`,
        avgRating: movies.voteAverage
      })
        .from(movies)
        .leftJoin(watchProgress, eq(movies.id, watchProgress.movieId))
        .groupBy(movies.id, movies.title, movies.voteAverage)
        .orderBy(desc(sql`count(${watchProgress.id})`))
        .limit(10);

      const recentActivity = await db.select({
        movieTitle: movies.title,
        userCount: sql<number>`count(distinct ${watchProgress.userId})`,
        timestamp: sql<string>`max(${watchProgress.lastWatched})`
      })
        .from(watchProgress)
        .innerJoin(movies, eq(movies.id, watchProgress.movieId))
        .where(sql`${watchProgress.lastWatched} > NOW() - INTERVAL '7 days'`)
        .groupBy(movies.id, movies.title)
        .orderBy(desc(sql`max(${watchProgress.lastWatched})`))
        .limit(10);

      res.json({
        topMovies,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching watch stats:', error);
      res.status(500).json({ error: 'Failed to fetch watch stats' });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
