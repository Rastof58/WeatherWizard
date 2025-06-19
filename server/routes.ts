import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWatchProgressSchema } from "@shared/schema";

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function registerRoutes(app: Express): Promise<Server> {
  
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

  // Movie routes
  app.get("/api/movies/trending", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || "Failed to fetch trending movies");
      }
      
      // Store movies in database
      const movies = [];
      for (const item of data.results.slice(0, 20)) {
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
          movie = await storage.createMovie({
            tmdbId: item.id,
            title: item.title || item.name,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date,
            voteAverage: item.vote_average,
            voteCount: item.vote_count,
            isMovie: !!item.title,
            runtime: null,
            genres: [],
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
      for (const item of data.results.slice(0, 20)) {
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
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
            genres: [],
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

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
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

        movie = await storage.createMovie({
          ...movie,
          runtime: details.runtime || details.episode_run_time?.[0],
          genres: details.genres,
          cast: credits.cast?.slice(0, 10).map((actor: any) => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profile_path: actor.profile_path
          })) || [],
        });
      }
      
      res.json({ movie });
    } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

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
      for (const item of data.results.slice(0, 10)) {
        if (item.media_type === 'person') continue;
        
        let movie = await storage.getMovieByTmdbId(item.id);
        if (!movie) {
          movie = await storage.createMovie({
            tmdbId: item.id,
            title: item.title || item.name,
            overview: item.overview,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            releaseDate: item.release_date || item.first_air_date,
            voteAverage: item.vote_average,
            voteCount: item.vote_count,
            isMovie: item.media_type === 'movie',
            runtime: null,
            genres: [],
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

  // Streaming routes
  app.get("/api/movies/:id/stream", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
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
      const progressData = insertWatchProgressSchema.parse({
        ...req.body,
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
      const item = await storage.addToWatchlist(req.session.userId, movieId);
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
      const inWatchlist = await storage.isInWatchlist(req.session.userId, movieId);
      res.json({ inWatchlist });
    } catch (error) {
      console.error("Error checking watchlist:", error);
      res.status(500).json({ error: "Failed to check watchlist" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
