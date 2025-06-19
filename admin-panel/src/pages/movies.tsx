import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Download, Upload, Eye } from 'lucide-react';
import apiClient from '@/lib/api';

export default function Movies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const queryClient = useQueryClient();

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['admin-movies', currentPage, searchQuery],
    queryFn: () => apiClient.getMovies(currentPage, 20),
  });

  const { data: tmdbResults } = useQuery({
    queryKey: ['tmdb-search', tmdbSearchQuery],
    queryFn: () => apiClient.searchTMDB(tmdbSearchQuery),
    enabled: tmdbSearchQuery.length > 2,
  });

  const updateMovieMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.updateMovie(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      setIsEditDialogOpen(false);
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
    },
  });

  const importMovieMutation = useMutation({
    mutationFn: ({ tmdbId, isMovie }: { tmdbId: number; isMovie: boolean }) =>
      apiClient.importFromTMDB(tmdbId, isMovie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      setIsImportDialogOpen(false);
      setTmdbSearchQuery('');
    },
  });

  const handleEditMovie = (movie: any) => {
    setSelectedMovie(movie);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMovie = (id: number) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      deleteMovieMutation.mutate(id);
    }
  };

  const handleSaveMovie = (formData: FormData) => {
    const movieData = {
      title: formData.get('title'),
      overview: formData.get('overview'),
      releaseDate: formData.get('releaseDate'),
      voteAverage: parseFloat(formData.get('voteAverage') as string),
      runtime: parseInt(formData.get('runtime') as string),
      isActive: formData.get('isActive') === 'on',
    };

    updateMovieMutation.mutate({
      id: selectedMovie?.id,
      data: movieData,
    });
  };

  const handleImportMovie = (tmdbMovie: any) => {
    importMovieMutation.mutate({
      tmdbId: tmdbMovie.id,
      isMovie: tmdbMovie.media_type !== 'tv',
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Movies & TV Shows</h2>
        <div className="flex space-x-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Import from TMDB
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Import Movies from TMDB</DialogTitle>
                <DialogDescription>
                  Search and import movies or TV shows from The Movie Database
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search movies or TV shows..."
                    value={tmdbSearchQuery}
                    onChange={(e) => setTmdbSearchQuery(e.target.value)}
                  />
                  <Button>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {tmdbResults?.results && (
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {tmdbResults.results.map((movie: any) => (
                      <div key={movie.id} className="flex items-center space-x-4 p-4 border rounded">
                        {movie.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title || movie.name}
                            className="w-16 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{movie.title || movie.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {movie.release_date || movie.first_air_date} • 
                            Rating: {movie.vote_average?.toFixed(1)}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {movie.overview}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleImportMovie(movie)}
                          disabled={importMovieMutation.isPending}
                        >
                          Import
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Library</CardTitle>
          <CardDescription>
            Manage your movies and TV shows collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading movies...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {moviesData?.movies?.map((movie: any) => (
                <div key={movie.id} className="flex items-center space-x-4 p-4 border rounded">
                  {movie.posterPath && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{movie.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        movie.isMovie ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {movie.isMovie ? 'Movie' : 'TV Show'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {movie.releaseDate} • Rating: {movie.voteAverage?.toFixed(1)} • 
                      {movie.runtime && ` ${movie.runtime}m`}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {movie.overview}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Views: {movie.viewCount || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Added: {new Date(movie.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/movie/${movie.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMovie(movie)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) || []}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {moviesData?.movies?.length || 0} of {moviesData?.total || 0} movies
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!moviesData?.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Movie Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Movie</DialogTitle>
            <DialogDescription>
              Update movie information and settings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveMovie(new FormData(e.target as HTMLFormElement));
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={selectedMovie?.title}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="overview">Overview</Label>
                <Textarea
                  id="overview"
                  name="overview"
                  defaultValue={selectedMovie?.overview}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input
                    id="releaseDate"
                    name="releaseDate"
                    type="date"
                    defaultValue={selectedMovie?.releaseDate}
                  />
                </div>
                
                <div>
                  <Label htmlFor="runtime">Runtime (minutes)</Label>
                  <Input
                    id="runtime"
                    name="runtime"
                    type="number"
                    defaultValue={selectedMovie?.runtime}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="voteAverage">Rating</Label>
                <Input
                  id="voteAverage"
                  name="voteAverage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  defaultValue={selectedMovie?.voteAverage}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={selectedMovie?.isActive !== false}
                />
                <Label htmlFor="isActive">Active (visible to users)</Label>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMovieMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}