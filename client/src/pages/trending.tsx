import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { MovieCard } from '@/components/movie-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Movie } from '@shared/schema';

export default function Trending() {
  const [, navigate] = useLocation();
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('day');

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['/api/movies/trending'],
  });

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['/api/movies/popular'],
  });

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayMovie = (movie: Movie) => {
    navigate(`/player/${movie.id}`);
  };

  const getAllMovies = () => {
    const trending = (trendingData as any)?.movies || [];
    const popular = (popularData as any)?.movies || [];
    
    // Combine and remove duplicates
    const allMovies = [...trending, ...popular];
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.tmdbId === movie.tmdbId)
    );
    
    // Sort by vote average and popularity
    return uniqueMovies.sort((a, b) => b.voteAverage - a.voteAverage);
  };

  const loading = isLoading || popularLoading;
  const movies = getAllMovies();

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-netflix-black border-b border-gray-800">
        <div className="flex items-center p-4">
          <button 
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-arrow-left text-white"></i>
          </button>
          <h1 className="text-xl font-semibold">Trending Now</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Time Window Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-netflix-gray rounded-lg p-1">
            <button
              onClick={() => setTimeWindow('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeWindow === 'day'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeWindow('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeWindow === 'week'
                  ? 'bg-netflix-red text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" text="Loading trending content..." />
          </div>
        )}

        {/* Content */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-film text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">No Trending Content</h2>
            <p className="text-gray-400">Check back later for trending movies and shows.</p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="space-y-6">
            {/* Featured Trending Movie */}
            {movies[0] && (
              <div className="relative">
                <div className="relative h-48 rounded-lg overflow-hidden">
                  {movies[0].backdropPath ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w1280${movies[0].backdropPath}`}
                      alt={movies[0].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <i className="fas fa-film text-6xl text-gray-400"></i>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-netflix-red text-white px-2 py-1 rounded text-xs font-semibold mr-2">
                        #1 TRENDING
                      </span>
                      {movies[0].voteAverage && (
                        <div className="flex items-center">
                          <i className="fas fa-star text-yellow-400 mr-1"></i>
                          <span className="text-sm">{movies[0].voteAverage.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-2">{movies[0].title}</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePlayMovie(movies[0])}
                        className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <i className="fas fa-play mr-2"></i>
                        Play
                      </button>
                      <button
                        onClick={() => handleMovieClick(movies[0])}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        More Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trending List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">All Trending Content</h3>
              <div className="space-y-3">
                {movies.slice(0, 20).map((movie, index) => (
                  <div 
                    key={movie.tmdbId}
                    className="flex items-center space-x-3 p-3 bg-netflix-gray/50 rounded-lg hover:bg-netflix-gray cursor-pointer transition-colors group"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <div className="flex-none w-8 text-center">
                      <span className="text-lg font-bold text-netflix-red">#{index + 1}</span>
                    </div>
                    
                    {movie.posterPath ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center">
                        <i className="fas fa-film text-gray-400"></i>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{movie.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        {movie.releaseDate && (
                          <span>{new Date(movie.releaseDate).getFullYear()}</span>
                        )}
                        <span>•</span>
                        <span>{movie.isMovie ? 'Movie' : 'TV Show'}</span>
                        {movie.voteAverage && movie.voteAverage > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center">
                              <i className="fas fa-star text-yellow-400 mr-1"></i>
                              <span>{movie.voteAverage.toFixed(1)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayMovie(movie);
                      }}
                      className="flex-none p-2 rounded-full bg-netflix-red hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <i className="fas fa-play text-white text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}