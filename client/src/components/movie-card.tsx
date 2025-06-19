import { useState } from 'react';
import { Movie } from '@shared/schema';

interface MovieCardProps {
  movie: Movie;
  onPlay?: () => void;
  onDetails?: () => void;
  showProgress?: boolean;
  progressPercent?: number;
  size?: 'small' | 'medium' | 'large';
}

export const MovieCard = ({ 
  movie, 
  onPlay, 
  onDetails, 
  showProgress = false, 
  progressPercent = 0,
  size = 'small' 
}: MovieCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = () => {
    if (onDetails) {
      onDetails();
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    }
  };

  const sizeClasses = {
    small: 'w-32 h-48',
    medium: 'w-40 h-60',
    large: 'w-48 h-72'
  };

  const posterUrl = movie.posterPath 
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  return (
    <div 
      className={`flex-shrink-0 ${size === 'small' ? 'w-32' : size === 'medium' ? 'w-40' : 'w-48'} group cursor-pointer`}
      onClick={handleClick}
    >
      <div className="relative mb-2">
        {posterUrl && !imageError ? (
          <img 
            src={posterUrl}
            alt={movie.title}
            className={`w-full ${sizeClasses[size]} object-cover rounded-lg group-hover:scale-105 transition-transform duration-300`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className={`w-full ${sizeClasses[size]} bg-gray-800 rounded-lg flex items-center justify-center`}>
            <div className="text-center text-gray-400">
              <i className="fas fa-film text-2xl mb-2"></i>
              <p className="text-xs">{movie.title}</p>
            </div>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors"></div>
        
        {/* Play button overlay */}
        {onPlay && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handlePlayClick}
              className="w-12 h-12 bg-netflix-red rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-2xl"
            >
              <i className="fas fa-play text-white ml-0.5"></i>
            </button>
          </div>
        )}
        
        {/* Progress bar */}
        {showProgress && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg">
            <div 
              className="h-full bg-netflix-red rounded-b-lg" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}
        
        {/* Rating badge */}
        {movie.voteAverage && movie.voteAverage > 0 && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center bg-black/70 rounded-full px-2 py-1">
              <i className="fas fa-star text-yellow-400 text-xs"></i>
              <span className="text-white text-xs ml-1 font-medium">
                {movie.voteAverage.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-netflix-red transition-colors">
        {movie.title}
      </h4>
      
      {movie.releaseDate && (
        <p className="text-xs text-gray-400 mt-1">
          {new Date(movie.releaseDate).getFullYear()}
        </p>
      )}
    </div>
  );
};
