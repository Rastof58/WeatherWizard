import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { MovieCard } from '@/components/movie-card';
import { useTelegram } from '@/hooks/use-telegram';
import { Movie, WatchProgress } from '@shared/schema';

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useTelegram();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/movies/trending'],
    enabled: true,
  });

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['/api/movies/popular'],
    enabled: true,
  });

  const { data: watchProgressData } = useQuery({
    queryKey: ['/api/watch-progress'],
    enabled: !!user,
  });

  useEffect(() => {
    if (trendingData?.movies?.length > 0) {
      setFeaturedMovie(trendingData.movies[0]);
    }
  }, [trendingData]);

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayMovie = (movie: Movie) => {
    navigate(`/player/${movie.id}`);
  };

  const getContinueWatchingMovies = () => {
    if (!watchProgressData?.progress) return [];
    
    return watchProgressData.progress
      .filter((p: WatchProgress & { movie: Movie }) => !p.completed && p.currentTime > 0)
      .slice(0, 10);
  };

  const getProgressPercent = (progress: WatchProgress) => {
    return progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-netflix-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-netflix-red rounded-lg flex items-center justify-center">
              <i className="fas fa-play text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-white">CineMini</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/search')}
              className="p-2 rounded-full bg-netflix-gray hover:bg-gray-600 transition-colors"
            >
              <i className="fas fa-search text-white"></i>
            </button>
            {user && (
              <div className="w-8 h-8 rounded-full bg-telegram-green flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {user.first_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/50 to-transparent z-10"></div>
          
          {featuredMovie.backdropPath ? (
            <img 
              src={`https://image.tmdb.org/t/p/w1280${featuredMovie.backdropPath}`}
              alt={featuredMovie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <i className="fas fa-film text-6xl text-gray-400"></i>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold mb-2">{featuredMovie.title}</h2>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{featuredMovie.overview}</p>
              
              <div className="flex items-center space-x-3 mb-4">
                {featuredMovie.voteAverage && (
                  <div className="flex items-center text-yellow-400">
                    <i className="fas fa-star text-sm"></i>
                    <span className="ml-1 text-sm font-medium">{featuredMovie.voteAverage.toFixed(1)}</span>
                  </div>
                )}
                {featuredMovie.releaseDate && (
                  <span className="text-gray-400 text-sm">
                    {new Date(featuredMovie.releaseDate).getFullYear()}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => handlePlayMovie(featuredMovie)}
                  className="flex items-center px-6 py-3 bg-netflix-red hover:bg-red-700 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-play mr-2"></i>
                  Play Now
                </button>
                <button 
                  onClick={() => handleMovieClick(featuredMovie)}
                  className="flex items-center px-4 py-3 bg-netflix-gray hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  <i className="fas fa-info-circle mr-2"></i>
                  More Info
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="px-4 space-y-8 mt-8">
        
        {/* Continue Watching */}
        {getContinueWatchingMovies().length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Continue Watching</h3>
            </div>
            
            <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
              {getContinueWatchingMovies().map((progress: WatchProgress & { movie: Movie }) => (
                <div key={progress.id} className="flex-shrink-0 w-40 group cursor-pointer">
                  <div className="relative mb-2">
                    {progress.movie.backdropPath ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w500${progress.movie.backdropPath}`}
                        alt={progress.movie.title}
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        onClick={() => handlePlayMovie(progress.movie)}
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-800 rounded-lg flex items-center justify-center">
                        <i className="fas fa-film text-gray-400"></i>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg">
                      <div 
                        className="h-full bg-netflix-red rounded-b-lg" 
                        style={{ width: `${getProgressPercent(progress)}%` }}
                      />
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-netflix-red rounded-full flex items-center justify-center">
                        <i className="fas fa-play text-white text-xs ml-0.5"></i>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-medium mb-1">{progress.movie.title}</h4>
                  <p className="text-xs text-gray-400">
                    {Math.floor(getProgressPercent(progress))}% watched
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Now */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Trending Now</h3>
            <button className="text-netflix-red hover:text-red-400 text-sm font-medium">
              View All
            </button>
          </div>
          
          {trendingLoading ? (
            <div className="flex space-x-3 overflow-x-auto pb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32">
                  <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
              {trendingData?.movies?.map((movie: Movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={() => handlePlayMovie(movie)}
                  onDetails={() => handleMovieClick(movie)}
                  size="small"
                />
              ))}
            </div>
          )}
        </section>

        {/* Popular Movies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Popular Movies</h3>
            <button className="text-netflix-red hover:text-red-400 text-sm font-medium">
              View All
            </button>
          </div>
          
          {popularLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="w-full h-40 bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {popularData?.movies?.slice(0, 6).map((movie: Movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={() => handlePlayMovie(movie)}
                  onDetails={() => handleMovieClick(movie)}
                  size="medium"
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
