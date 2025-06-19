import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { MovieCard } from '@/components/movie-card';
import { useTelegram } from '@/hooks/use-telegram';
import { Movie, Watchlist } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function WatchlistPage() {
  const [, navigate] = useLocation();
  const { user } = useTelegram();
  const { toast } = useToast();

  const { data: watchlistData, isLoading } = useQuery({
    queryKey: ['/api/watchlist'],
    enabled: !!user,
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (movieId: number) => {
      return apiRequest('DELETE', `/api/watchlist/${movieId}`);
    },
    onSuccess: () => {
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

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayMovie = (movie: Movie) => {
    navigate(`/player/${movie.id}`);
  };

  const handleRemoveFromWatchlist = (movieId: number) => {
    removeFromWatchlistMutation.mutate(movieId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center pb-20">
        <div className="text-center">
          <i className="fas fa-user-circle text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold mb-2">Login Required</h2>
          <p className="text-gray-400">Please login to view your watchlist</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold">My Watchlist</h1>
        </div>
      </header>

      <div className="p-4">
        {isLoading && (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        )}

        {watchlistData?.watchlist && (watchlistData as any).watchlist.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-bookmark text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">No movies in watchlist</h2>
            <p className="text-gray-400 mb-6">Add movies to your watchlist to watch them later</p>
            <button
              onClick={() => navigate('/search')}
              className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Movies
            </button>
          </div>
        )}

        {watchlistData?.watchlist && (watchlistData as any).watchlist.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {(watchlistData as any).watchlist.length} {(watchlistData as any).watchlist.length === 1 ? 'Movie' : 'Movies'}
              </h2>
              <button
                onClick={() => navigate('/search')}
                className="text-netflix-red hover:text-red-400 text-sm font-medium"
              >
                Add More
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(watchlistData as any).watchlist.map((item: Watchlist & { movie: Movie }) => (
                <div key={item.id} className="relative group">
                  <MovieCard
                    movie={item.movie}
                    onPlay={() => handlePlayMovie(item.movie)}
                    onDetails={() => handleMovieClick(item.movie)}
                    size="medium"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWatchlist(item.movieId)}
                    disabled={removeFromWatchlistMutation.isPending}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {removeFromWatchlistMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin text-white text-xs"></i>
                    ) : (
                      <i className="fas fa-times text-white text-xs"></i>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}