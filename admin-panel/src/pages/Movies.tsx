import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Download,
  Upload,
  MoreHorizontal,
  Star,
  Calendar,
  Play,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { adminApi } from '../services/api';
import { Movie, PaginatedResponse } from '../types';

interface MoviesPageState {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  selectedMovies: Set<number>;
  searchQuery: string;
  statusFilter: string;
  showFilters: boolean;
  showAddModal: boolean;
  showEditModal: boolean;
  editingMovie: Movie | null;
}

const Movies: React.FC = () => {
  const [state, setState] = useState<MoviesPageState>({
    movies: [],
    loading: true,
    error: null,
    page: 1,
    totalPages: 1,
    selectedMovies: new Set(),
    searchQuery: '',
    statusFilter: 'all',
    showFilters: false,
    showAddModal: false,
    showEditModal: false,
    editingMovie: null,
  });

  useEffect(() => {
    fetchMovies();
  }, [state.page, state.searchQuery, state.statusFilter]);

  const fetchMovies = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await adminApi.getMovies(
        state.page,
        20,
        state.searchQuery || undefined,
        state.statusFilter === 'all' ? undefined : state.statusFilter
      );
      
      setState(prev => ({
        ...prev,
        movies: response.items,
        totalPages: Math.ceil(response.total / 20),
        loading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch movies',
        loading: false,
      }));
    }
  };

  const handleSelectMovie = (movieId: number) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedMovies);
      if (newSelected.has(movieId)) {
        newSelected.delete(movieId);
      } else {
        newSelected.add(movieId);
      }
      return { ...prev, selectedMovies: newSelected };
    });
  };

  const handleSelectAll = () => {
    setState(prev => ({
      ...prev,
      selectedMovies: prev.selectedMovies.size === prev.movies.length 
        ? new Set() 
        : new Set(prev.movies.map(m => m.id))
    }));
  };

  const handleBulkAction = async (action: 'hide' | 'publish' | 'delete') => {
    if (state.selectedMovies.size === 0) return;

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to delete ${state.selectedMovies.size} movies? This action cannot be undone.`
      : `Are you sure you want to ${action} ${state.selectedMovies.size} movies?`;

    if (!confirm(confirmMessage)) return;

    try {
      await adminApi.bulkMovieAction(Array.from(state.selectedMovies), action);
      setState(prev => ({ ...prev, selectedMovies: new Set() }));
      await fetchMovies();
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
      alert(`Failed to ${action} movies. Please try again.`);
    }
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      await adminApi.deleteMovie(movieId);
      await fetchMovies();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete movie. Please try again.');
    }
  };

  const handleToggleStatus = async (movie: Movie) => {
    try {
      if (movie.status === 'published') {
        await adminApi.hideMovie(movie.id);
      } else {
        await adminApi.publishMovie(movie.id);
      }
      await fetchMovies();
    } catch (err) {
      console.error('Status toggle failed:', err);
      alert('Failed to update movie status. Please try again.');
    }
  };

  const MovieRow: React.FC<{ movie: Movie }> = ({ movie }) => (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 ${state.selectedMovies.has(movie.id) ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={state.selectedMovies.has(movie.id)}
          onChange={() => handleSelectMovie(movie.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          {movie.posterPath && (
            <img
              src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
              alt={movie.title}
              className="h-12 w-8 object-cover rounded mr-3"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{movie.title}</div>
            <div className="text-sm text-gray-500">TMDB ID: {movie.tmdbId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-400" />
          {movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          movie.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : movie.status === 'hidden'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {movie.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          movie.isCustom ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {movie.isCustom ? 'Custom' : 'TMDB'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(movie.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(movie)}
            title={movie.status === 'published' ? 'Hide movie' : 'Publish movie'}
          >
            {movie.status === 'published' ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, editingMovie: movie, showEditModal: true }))}
            title="Edit movie"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteMovie(movie.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete movie"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  const Pagination: React.FC = () => (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={state.page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setState(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          disabled={state.page >= state.totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{state.page}</span> of{' '}
            <span className="font-medium">{state.totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={state.page <= 1}
              className="rounded-l-md"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={state.page >= state.totalPages}
              className="rounded-r-md"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );

  if (state.loading && state.movies.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white shadow-sm rounded-lg">
            <div className="h-16 bg-gray-200 rounded-t-lg"></div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Movies</h1>
            <p className="text-gray-600">Manage your movie library</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button onClick={() => setState(prev => ({ ...prev, showAddModal: true }))}>
              <Plus className="h-4 w-4 mr-2" />
              Add Movie
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {state.showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={state.statusFilter}
                onChange={(e) => setState(prev => ({ ...prev, statusFilter: e.target.value, page: 1 }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {state.selectedMovies.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {state.selectedMovies.size} movie(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('publish')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('hide')}
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Hide
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Movies Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={state.movies.length > 0 && state.selectedMovies.size === state.movies.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Movie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.movies.map((movie) => (
              <MovieRow key={movie.id} movie={movie} />
            ))}
          </tbody>
        </table>

        {state.movies.length === 0 && !state.loading && (
          <div className="text-center py-12">
            <Film className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No movies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {state.searchQuery || state.statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Get started by adding your first movie.'}
            </p>
            {!state.searchQuery && state.statusFilter === 'all' && (
              <div className="mt-6">
                <Button onClick={() => setState(prev => ({ ...prev, showAddModal: true }))}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Movie
                </Button>
              </div>
            )}
          </div>
        )}

        {state.movies.length > 0 && <Pagination />}
      </div>

      {/* Error State */}
      {state.error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-800">
              <h3 className="font-medium">Error Loading Movies</h3>
              <p className="mt-1 text-sm">{state.error}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={fetchMovies} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;