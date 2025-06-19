import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { MovieCard } from '@/components/movie-card';
import { SearchFilters, SearchFilters as SearchFiltersType } from '@/components/search-filters';
import { Movie } from '@shared/schema';

export default function Search() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({
    genre: '',
    minRating: 0,
    year: '',
    sortBy: 'popularity'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/movies/search', { q: debouncedQuery }],
    enabled: debouncedQuery.length > 2,
  });

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayMovie = (movie: Movie) => {
    navigate(`/player/${movie.id}`);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const applyFilters = (movies: Movie[]) => {
    let filtered = movies;

    // Filter by genre
    if (filters.genre) {
      filtered = filtered.filter(movie => 
        movie.genres && movie.genres.some((g: any) => g.name === filters.genre)
      );
    }

    // Filter by minimum rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(movie => 
        (movie.voteAverage || 0) >= filters.minRating
      );
    }

    // Filter by year
    if (filters.year) {
      filtered = filtered.filter(movie => {
        const movieYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : '';
        return movieYear === filters.year;
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.voteAverage || 0) - (a.voteAverage || 0);
        case 'release_date':
          return new Date(b.releaseDate || '').getTime() - new Date(a.releaseDate || '').getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default: // popularity
          return (b.voteCount || 0) - (a.voteCount || 0);
      }
    });

    return filtered;
  };

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
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-netflix-gray text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              autoFocus
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
      </header>

      {/* Search Results */}
      <div className="p-4">
        {/* Filter Controls */}
        {debouncedQuery && searchResults?.movies && searchResults.movies.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-300">
              {applyFilters(searchResults.movies).length} results found
            </p>
            <SearchFilters
              onFiltersChange={handleFiltersChange}
              isVisible={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </div>
        )}

        {!debouncedQuery && (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-400">Start typing to search for movies and TV shows</p>
          </div>
        )}

        {debouncedQuery && debouncedQuery.length <= 2 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Please enter at least 3 characters to search</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
                <div className="w-12 h-16 bg-gray-800 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults?.movies && searchResults.movies.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-film text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-400">No results found for "{debouncedQuery}"</p>
          </div>
        )}

        {searchResults?.movies && searchResults.movies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              Search Results ({searchResults.movies.length})
            </h2>
            
            {searchResults.movies.map((movie: Movie) => (
              <div 
                key={movie.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-netflix-gray cursor-pointer transition-colors"
                onClick={() => handleMovieClick(movie)}
              >
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
                
                <div className="flex-1">
                  <h4 className="text-white font-medium">{movie.title}</h4>
                  <p className="text-gray-400 text-sm">
                    {movie.releaseDate && `${new Date(movie.releaseDate).getFullYear()} • `}
                    {movie.isMovie ? 'Movie' : 'TV Show'}
                  </p>
                  {movie.voteAverage && movie.voteAverage > 0 && (
                    <div className="flex items-center mt-1">
                      <i className="fas fa-star text-yellow-400 text-xs"></i>
                      <span className="text-gray-400 text-xs ml-1">
                        {movie.voteAverage.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayMovie(movie);
                  }}
                  className="p-2 rounded-full bg-netflix-red hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-play text-white text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
