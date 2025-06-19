import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export interface SearchFilters {
  genre: string;
  minRating: number;
  year: string;
  sortBy: string;
}

const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

export const SearchFilters = ({ onFiltersChange, isVisible, onToggle }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    genre: '',
    minRating: 0,
    year: '',
    sortBy: 'popularity'
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      genre: '',
      minRating: 0,
      year: '',
      sortBy: 'popularity'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.genre) count++;
    if (filters.minRating > 0) count++;
    if (filters.year) count++;
    if (filters.sortBy !== 'popularity') count++;
    return count;
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={onToggle}
        className="relative border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
      >
        <i className="fas fa-filter mr-2"></i>
        Filters
        {getActiveFiltersCount() > 0 && (
          <Badge className="ml-2 bg-netflix-red text-white px-1.5 py-0.5 text-xs">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isVisible && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
          <div className="space-y-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Genre</label>
              <Select value={filters.genre} onValueChange={(value) => handleFilterChange('genre', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Minimum Rating: {filters.minRating}/10
              </label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => handleFilterChange('minRating', value[0])}
                max={10}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Release Year</label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-48">
                  <SelectItem value="">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="release_date">Release Date</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="flex-1 border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
              >
                Clear All
              </Button>
              <Button
                onClick={onToggle}
                size="sm"
                className="flex-1 bg-netflix-red hover:bg-red-600 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};