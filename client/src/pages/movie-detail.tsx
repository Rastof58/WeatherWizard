import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { useTelegram } from '@/hooks/use-telegram';
import { Movie } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function MovieDetail() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useTelegram();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);

  const { data: movieData, isLoading } = useQuery({
    queryKey: [`/api/movies/${id}`],
    enabled: !!id,
  });

  const { data: watchlistData } = useQuery({
    queryKey: [`/api/watchlist/check/${id}`],
    enabled: !!user && !!id,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/watchlist', { movieId: parseInt(id!) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/check/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/watchlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/check/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
  });

  const movie = movieData?.movie as Movie;
  const isInWatchlist = watchlistData?.inWatchlist;

  const handlePlay = () => {
    navigate(`/player/${id}`);
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.title,
          text: movie?.overview,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black text-white">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-800"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-film text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-400">Movie not found</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-netflix-red rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdropPath 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
    : null;

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      {/* Movie Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <i className="fas fa-arrow-left text-white"></i>
        </button>
        
        {backdropUrl && !imageError ? (
          <img 
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <i className="fas fa-film text-6xl text-gray-400"></i>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent"></div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={handlePlay}
            className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-2xl"
          >
            <i className="fas fa-play text-white text-xl ml-1"></i>
          </button>
        </div>
      </div>
      
      {/* Movie Information */}
      <div className="p-4 space-y-6">
        {/* Movie Title and Meta */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
            {movie.releaseDate && (
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            )}
            {movie.runtime && (
              <span>{movie.runtime} min</span>
            )}
            {movie.voteAverage && movie.voteAverage > 0 && (
              <div className="flex items-center">
                <i className="fas fa-star text-yellow-400 mr-1"></i>
                <span>{movie.voteAverage.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="px-3 py-1 bg-netflix-gray rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button 
            onClick={handlePlay}
            className="flex-1 flex items-center justify-center py-3 bg-netflix-red hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            <i className="fas fa-play mr-2"></i>
            Play
          </button>
          <button 
            onClick={handleWatchlistToggle}
            disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
            className="px-4 py-3 bg-netflix-gray hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <i className={`fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}`}></i>
          </button>
          <button 
            onClick={handleShare}
            className="px-4 py-3 bg-netflix-gray hover:bg-gray-600 rounded-lg transition-colors"
          >
            <i className="fas fa-share"></i>
          </button>
        </div>
        
        {/* Movie Description */}
        {movie.overview && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Overview</h3>
            <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
          </div>
        )}
        
        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Cast</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {movie.cast.map((actor) => (
                <div key={actor.id} className="flex-shrink-0 text-center">
                  {actor.profile_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                      alt={actor.name}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                  )}
                  <p className="text-sm font-medium">{actor.name}</p>
                  <p className="text-xs text-gray-400">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
