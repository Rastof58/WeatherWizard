import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { MovieCard } from '@/components/movie-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useTelegram } from '@/hooks/use-telegram';
import { Movie } from '@shared/schema';

interface MovieRecommendationsProps {
  currentMovieId?: number;
  genre?: string;
  limit?: number;
}

export const MovieRecommendations = ({ 
  currentMovieId, 
  genre, 
  limit = 6 
}: MovieRecommendationsProps) => {
  const [, navigate] = useLocation();
  const { user } = useTelegram();

  const { data: trendingData } = useQuery({
    queryKey: ['/api/movies/trending'],
  });

  const { data: popularData } = useQuery({
    queryKey: ['/api/movies/popular'],
  });

  const { data: watchProgressData } = useQuery({
    queryKey: ['/api/watch-progress'],
    enabled: !!user,
  });

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayMovie = (movie: Movie) => {
    navigate(`/player/${movie.id}`);
  };

  const getRecommendations = (): Movie[] => {
    const trending = (trendingData as any)?.movies || [];
    const popular = (popularData as any)?.movies || [];
    const watchProgress = (watchProgressData as any)?.progress || [];
    
    // Combine all movies
    const allMovies = [...trending, ...popular];
    
    // Remove duplicates
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.tmdbId === movie.tmdbId)
    );
    
    // Filter out current movie if specified
    let filteredMovies = currentMovieId 
      ? uniqueMovies.filter(movie => movie.id !== currentMovieId)
      : uniqueMovies;
    
    // Filter by genre if specified
    if (genre) {
      filteredMovies = filteredMovies.filter(movie => 
        movie.genres && movie.genres.some((g: any) => g.name === genre)
      );
    }
    
    // Get user's watched movies for better recommendations
    const watchedMovieIds = watchProgress
      .filter((p: any) => p.completed)
      .map((p: any) => p.movieId);
    
    // Prefer unwatched movies
    const unwatchedMovies = filteredMovies.filter(movie => 
      !watchedMovieIds.includes(movie.id)
    );
    
    const finalMovies = unwatchedMovies.length >= limit 
      ? unwatchedMovies 
      : [...unwatchedMovies, ...filteredMovies.filter(movie => 
          watchedMovieIds.includes(movie.id)
        )];
    
    // Sort by rating and popularity
    return finalMovies
      .sort((a, b) => {
        const scoreA = (a.voteAverage || 0) * Math.log(a.voteCount || 1);
        const scoreB = (b.voteAverage || 0) * Math.log(b.voteCount || 1);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {genre ? `More ${genre}` : 'Recommended for You'}
        </h3>
        <button
          onClick={() => navigate('/categories')}
          className="text-netflix-red hover:text-red-400 text-sm font-medium"
        >
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {recommendations.map((movie) => (
          <MovieCard
            key={movie.tmdbId}
            movie={movie}
            onPlay={() => handlePlayMovie(movie)}
            onDetails={() => handleMovieClick(movie)}
            size="medium"
          />
        ))}
      </div>
    </div>
  );
};