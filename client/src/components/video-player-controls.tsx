import { useState, useEffect } from 'react';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onFullscreen: () => void;
  onClose: () => void;
  volume: number;
  isMuted: boolean;
  onMute: () => void;
}

export const VideoPlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onFullscreen,
  onClose,
  volume,
  isMuted,
  onMute
}: VideoPlayerControlsProps) => {
  const [showControls, setShowControls] = useState(true);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isPlaying && isControlsVisible) {
      timeout = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isPlaying, isControlsVisible]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMouseMove = () => {
    setIsControlsVisible(true);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div 
      className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 transition-opacity duration-300 ${
        isControlsVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <i className="fas fa-arrow-left text-white"></i>
        </button>
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors">
            <i className="fas fa-closed-captioning text-white"></i>
          </button>
          <button className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors">
            <i className="fas fa-cog text-white"></i>
          </button>
        </div>
      </div>
      
      {/* Center Play/Pause Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button 
          onClick={onPlayPause}
          className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-xl ${!isPlaying ? 'ml-0.5' : ''}`}></i>
        </button>
      </div>
      
      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="relative">
            <div 
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-netflix-red rounded-full relative" 
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-netflix-red rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onSeek(Math.max(0, currentTime - 10))}
                className="text-white hover:text-netflix-red transition-colors"
              >
                <i className="fas fa-backward text-lg"></i>
              </button>
              <button 
                onClick={onPlayPause}
                className="text-white hover:text-netflix-red transition-colors"
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-lg`}></i>
              </button>
              <button 
                onClick={() => onSeek(Math.min(duration, currentTime + 10))}
                className="text-white hover:text-netflix-red transition-colors"
              >
                <i className="fas fa-forward text-lg"></i>
              </button>
              <span className="text-white text-sm">{formatTime(currentTime)}</span>
              <span className="text-gray-400 text-sm">/</span>
              <span className="text-gray-400 text-sm">{formatTime(duration)}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={onMute}
                className="text-white hover:text-netflix-red transition-colors"
              >
                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-lg`}></i>
              </button>
              <button 
                onClick={onFullscreen}
                className="text-white hover:text-netflix-red transition-colors"
              >
                <i className="fas fa-expand text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
