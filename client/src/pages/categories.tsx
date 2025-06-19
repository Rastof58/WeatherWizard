import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { MovieCard } from '@/components/movie-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Movie } from '@shared/schema';

const movieGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const tvGenres = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' }
];

export default function Categories() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<'movies' | 'tv'>('movies');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
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

  const getGenres = () => {
    return selectedCategory === 'movies' ? movieGenres : tvGenres;
  };

  const getFilteredMovies = () => {
    const allMovies = [
      ...((trendingData as any)?.movies || []),
      ...((popularData as any)?.movies || [])
    ];

    // Remove duplicates
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.tmdbId === movie.tmdbId)
    );

    if (!selectedGenre) {
      return uniqueMovies.filter(movie => 
        selectedCategory === 'movies' ? movie.isMovie : !movie.isMovie
      );
    }

    return uniqueMovies.filter(movie => {
      const categoryMatch = selectedCategory === 'movies' ? movie.isMovie : !movie.isMovie;
      const genreMatch = movie.genres && movie.genres.some((g: any) => g.id === selectedGenre);
      return categoryMatch && genreMatch;
    });
  };

  const isLoading = trendingLoading || popularLoading;
  const filteredMovies = getFilteredMovies();

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
          <h1 className="text-xl font-semibold">Browse by Category</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Category Toggle */}
        <div className="flex bg-netflix-gray rounded-lg p-1">
          <button
            onClick={() => {
              setSelectedCategory('movies');
              setSelectedGenre(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === 'movies'
                ? 'bg-netflix-red text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => {
              setSelectedCategory('tv');
              setSelectedGenre(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === 'tv'
                ? 'bg-netflix-red text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TV Shows
          </button>
        </div>

        {/* Genre Filter */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Genres</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === null
                  ? 'bg-netflix-red text-white'
                  : 'bg-netflix-gray text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {getGenres().map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === genre.id
                    ? 'bg-netflix-red text-white'
                    : 'bg-netflix-gray text-gray-300 hover:bg-gray-600'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" text="Loading content..." />
          </div>
        )}

        {!isLoading && filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-film text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">No Content Found</h2>
            <p className="text-gray-400 mb-6">
              No {selectedCategory} found in this genre. Try a different category or genre.
            </p>
            <button
              onClick={() => setSelectedGenre(null)}
              className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View All
            </button>
          </div>
        )}

        {!isLoading && filteredMovies.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {filteredMovies.length} {selectedCategory === 'movies' ? 'Movies' : 'TV Shows'}
                {selectedGenre && ` in ${getGenres().find(g => g.id === selectedGenre)?.name}`}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filteredMovies.map((movie) => (
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
        )}
      </div>
    </div>
  );
}