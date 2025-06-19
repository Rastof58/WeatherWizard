import { 
  users, 
  movies, 
  watchProgress, 
  watchlist,
  type User, 
  type InsertUser,
  type Movie,
  type InsertMovie,
  type WatchProgress,
  type InsertWatchProgress,
  type Watchlist,
  type InsertWatchlist
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Movie operations
  getMovie(id: number): Promise<Movie | undefined>;
  getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  getTrendingMovies(limit?: number): Promise<Movie[]>;
  getPopularMovies(limit?: number): Promise<Movie[]>;
  searchMovies(query: string): Promise<Movie[]>;
  
  // Watch progress operations
  getWatchProgress(userId: number, movieId: number): Promise<WatchProgress | undefined>;
  updateWatchProgress(progress: InsertWatchProgress): Promise<WatchProgress>;
  getUserWatchProgress(userId: number): Promise<(WatchProgress & { movie: Movie })[]>;
  
  // Watchlist operations
  getWatchlist(userId: number): Promise<(Watchlist & { movie: Movie })[]>;
  addToWatchlist(userId: number, movieId: number): Promise<Watchlist>;
  removeFromWatchlist(userId: number, movieId: number): Promise<void>;
  isInWatchlist(userId: number, movieId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie || undefined;
  }

  async getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.tmdbId, tmdbId));
    return movie || undefined;
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const [movie] = await db
      .insert(movies)
      .values(insertMovie)
      .returning();
    return movie;
  }

  async getTrendingMovies(limit: number = 20): Promise<Movie[]> {
    return await db
      .select()
      .from(movies)
      .orderBy(desc(movies.voteAverage))
      .limit(limit);
  }

  async getPopularMovies(limit: number = 20): Promise<Movie[]> {
    return await db
      .select()
      .from(movies)
      .orderBy(desc(movies.voteCount))
      .limit(limit);
  }

  async searchMovies(query: string): Promise<Movie[]> {
    return await db
      .select()
      .from(movies)
      .where(eq(movies.title, query))
      .limit(10);
  }

  async getWatchProgress(userId: number, movieId: number): Promise<WatchProgress | undefined> {
    const [progress] = await db
      .select()
      .from(watchProgress)
      .where(and(eq(watchProgress.userId, userId), eq(watchProgress.movieId, movieId)));
    return progress || undefined;
  }

  async updateWatchProgress(progress: InsertWatchProgress): Promise<WatchProgress> {
    const existing = await this.getWatchProgress(progress.userId, progress.movieId);
    
    if (existing) {
      const [updated] = await db
        .update(watchProgress)
        .set({
          currentTime: progress.currentTime,
          duration: progress.duration,
          completed: progress.completed,
          lastWatched: new Date(),
        })
        .where(and(eq(watchProgress.userId, progress.userId), eq(watchProgress.movieId, progress.movieId)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(watchProgress)
        .values(progress)
        .returning();
      return created;
    }
  }

  async getUserWatchProgress(userId: number): Promise<(WatchProgress & { movie: Movie })[]> {
    const results = await db
      .select()
      .from(watchProgress)
      .innerJoin(movies, eq(watchProgress.movieId, movies.id))
      .where(eq(watchProgress.userId, userId))
      .orderBy(desc(watchProgress.lastWatched));
    
    return results.map(result => ({
      ...result.watch_progress,
      movie: result.movies
    }));
  }

  async getWatchlist(userId: number): Promise<(Watchlist & { movie: Movie })[]> {
    const results = await db
      .select()
      .from(watchlist)
      .innerJoin(movies, eq(watchlist.movieId, movies.id))
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.addedAt));
    
    return results.map(result => ({
      ...result.watchlist,
      movie: result.movies
    }));
  }

  async addToWatchlist(userId: number, movieId: number): Promise<Watchlist> {
    const [item] = await db
      .insert(watchlist)
      .values({ userId, movieId })
      .returning();
    return item;
  }

  async removeFromWatchlist(userId: number, movieId: number): Promise<void> {
    await db
      .delete(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)));
  }

  async isInWatchlist(userId: number, movieId: number): Promise<boolean> {
    const [item] = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)));
    return !!item;
  }
}

export const storage = new DatabaseStorage();
