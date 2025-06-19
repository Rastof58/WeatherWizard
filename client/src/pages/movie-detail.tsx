import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { useTelegram } from '@/hooks/use-telegram';
import { Movie } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MovieRecommendations } from '@/components/movie-recommendations';

export default function MovieDetail() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useTelegram();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Added to watchlist",
        description: "Movie has been added to your watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add movie to watchlist",
        variant: "destructive",
      });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/watchlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/check/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Removed from watchlist",
        description: "Movie has been removed from your watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove movie from watchlist",
        variant: "destructive",
      });
    },
  });

  const movie = (movieData as any)?.movie as Movie;
  const isInWatchlist = (watchlistData as any)?.inWatchlist;

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
    if (navigator.share && movie) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} on CineMini`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-netflix-red mb-4"></i>
          <p className="text-gray-400">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold mb-2">Movie Not Found</h2>
          <p className="text-gray-400 mb-6">The requested movie could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
            <span className="px-2 py-1 bg-netflix-gray rounded text-xs">
              {movie.isMovie ? 'Movie' : 'TV Show'}
            </span>
          </div>
          
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre: any) => (
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
          
          {user && (
            <button 
              onClick={handleWatchlistToggle}
              disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
              className="px-4 py-3 bg-netflix-gray hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className={`fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}`}></i>
              )}
            </button>
          )}
          
          <button 
            onClick={handleShare}
            className="px-4 py-3 bg-netflix-gray hover:bg-gray-600 rounded-lg transition-colors"
          >
            <i className="fas fa-share"></i>
          </button>
        </div>
        
        {/* Overview */}
        {movie.overview && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Overview</h3>
            <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
          </div>
        )}
        
        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Cast</h3>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {movie.cast.slice(0, 8).map((actor: any) => (
                <div key={actor.id} className="flex-none text-center">
                  {actor.profile_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                      alt={actor.name}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                  )}
                  <p className="text-xs font-medium text-white">{actor.name}</p>
                  <p className="text-xs text-gray-400">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <MovieRecommendations 
          currentMovieId={movie.id}
          genre={movie.genres && movie.genres.length > 0 ? movie.genres[0].name : undefined}
          limit={6}
        />
      </div>
    </div>
  );
}