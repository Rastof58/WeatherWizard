import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Mock components - replace with actual Shadcn UI imports later
const InputComponent = ({ type = "text", placeholder, value, onChange, className }: any) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const ButtonComponent = ({ children, onClick, className, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
  >
    {children}
  </button>
);


// Mock movie data (simplified from your shared/schema.ts for demonstration)
interface Movie {
  id: string;
  title: string;
  tmdbId: number;
  releaseDate: string;
  status: 'published' | 'hidden';
}

const mockMovies: Movie[] = [
  { id: '1', title: 'The Matrix', tmdbId: 603, releaseDate: '1999-03-31', status: 'published' },
  { id: '2', title: 'Inception', tmdbId: 27205, releaseDate: '2010-07-16', status: 'published' },
  { id: '3', title: 'Interstellar', tmdbId: 157336, releaseDate: '2014-11-05', status: 'hidden' },
  { id: '4', title: 'Pulp Fiction', tmdbId: 680, releaseDate: '1994-05-21', status: 'published' },
];

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState(mockMovies);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMovieDialogOpen, setIsAddMovieDialogOpen] = useState(false);
  const [newMovieTmdbId, setNewMovieTmdbId] = useState('');

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.tmdbId.toString().includes(searchTerm)
  );

  const handleToggleStatus = (id: string) => {
    setMovies(movies.map(movie =>
      movie.id === id ? { ...movie, status: movie.status === 'published' ? 'hidden' : 'published' } : movie
    ));
  };

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd call an API to fetch movie details from TMDB using newMovieTmdbId
    // and then add it to your database.
    console.log(`Adding movie with TMDB ID: ${newMovieTmdbId}`);
    // Simulate adding movie
    const newId = (movies.length + 1).toString();
    const newMockMovie: Movie = {
      id: newId,
      title: `New Movie (TMDB ID: ${newMovieTmdbId})`,
      tmdbId: parseInt(newMovieTmdbId),
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'published',
    };
    setMovies([...movies, newMockMovie]);
    setNewMovieTmdbId('');
    setIsAddMovieDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Movie/Series Management</h1>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Content List</CardTitle>
          <ButtonComponent onClick={() => setIsAddMovieDialogOpen(true)} className="bg-admin-primary hover:bg-admin-primary/90">
            Add New Movie
          </ButtonComponent>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <InputComponent
              placeholder="Search by title or TMDB ID..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    TMDB ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{movie.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.tmdbId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.releaseDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        movie.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {movie.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ButtonComponent
                        variant="outline"
                        size="sm"
                        onClick={() => console.log(`Editing movie ${movie.title}`)}
                        className="mr-2 border-gray-600 hover:bg-gray-700 text-gray-300"
                      >
                        Edit
                      </ButtonComponent>
                      <ButtonComponent
                        variant={movie.status === 'published' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleToggleStatus(movie.id)}
                        className={movie.status === 'published' ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                      >
                        {movie.status === 'published' ? 'Hide' : 'Unhide'}
                      </ButtonComponent>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMovies.length === 0 && (
            <p className="text-center text-gray-400 mt-4">No movies found.</p>
          )}
        </CardContent>
      </Card>

      {/* Add New Movie Dialog */}
      <Dialog open={isAddMovieDialogOpen} onOpenChange={setIsAddMovieDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Add New Movie</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMovie} className="space-y-4 py-4">
            <div>
              <label htmlFor="tmdbId" className="block text-sm font-medium text-gray-300 mb-2">
                TMDB ID
              </label>
              <InputComponent
                id="tmdbId"
                type="number"
                placeholder="e.g., 550 for Fight Club"
                value={newMovieTmdbId}
                onChange={(e: any) => setNewMovieTmdbId(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <DialogFooter>
              <ButtonComponent onClick={() => setIsAddMovieDialogOpen(false)} variant="outline" className="border-gray-600 hover:bg-gray-700 text-gray-300">
                Cancel
              </ButtonComponent>
              <ButtonComponent type="submit" className="bg-admin-primary hover:bg-admin-primary/90">
                Add Movie
              </ButtonComponent>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MoviesPage;
