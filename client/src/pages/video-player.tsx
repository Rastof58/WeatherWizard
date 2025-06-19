import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { VideoPlayerControls } from '@/components/video-player-controls';
import { useTelegram } from '@/hooks/use-telegram';
import { apiRequest } from '@/lib/queryClient';

export default function VideoPlayer() {
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useTelegram();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const { data: streamData, isLoading } = useQuery({
    queryKey: [`/api/movies/${id}/stream`],
    enabled: !!id,
  });

  const { data: watchProgressData } = useQuery({
    queryKey: [`/api/watch-progress`],
    enabled: !!user,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: { movieId: number; currentTime: number; duration: number; completed: boolean }) => {
      return apiRequest('POST', '/api/watch-progress', progressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watch-progress'] });
    },
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (user && id) {
        updateProgressMutation.mutate({
          movieId: parseInt(id),
          currentTime: video.duration,
          duration: video.duration,
          completed: true,
        });
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [user, id, updateProgressMutation]);

  // Update progress every 30 seconds
  useEffect(() => {
    if (!user || !id || !isPlaying) return;

    const interval = setInterval(() => {
      if (currentTime > 0 && duration > 0) {
        updateProgressMutation.mutate({
          movieId: parseInt(id),
          currentTime,
          duration,
          completed: false,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, id, isPlaying, currentTime, duration, updateProgressMutation]);

  // Load saved progress
  useEffect(() => {
    if (watchProgressData?.progress && id && videoRef.current) {
      const savedProgress = watchProgressData.progress.find(
        (p: any) => p.movieId === parseInt(id)
      );
      
      if (savedProgress && savedProgress.currentTime > 0 && !savedProgress.completed) {
        videoRef.current.currentTime = savedProgress.currentTime;
      }
    }
  }, [watchProgressData, id]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleClose = () => {
    navigate(`/movie/${id}`);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-60 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
          <p className="text-white">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!streamData) {
    return (
      <div className="fixed inset-0 bg-black z-60 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-white mb-4">Unable to load video stream</p>
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-netflix-red rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="video-container" className="fixed inset-0 bg-black z-60">
      <div className="relative w-full h-full">
        {/* VidSrc Iframe Player */}
        <iframe
          ref={iframeRef}
          src={streamData.streamUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media"
          sandbox="allow-same-origin allow-scripts allow-presentation"
          title={streamData.title}
        />
        
        {/* Fallback Video Element (hidden by default) */}
        <video
          ref={videoRef}
          className="w-full h-full hidden"
          controls={false}
          playsInline
        />
        
        {/* Custom Controls Overlay */}
        <VideoPlayerControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onFullscreen={handleFullscreen}
          onClose={handleClose}
          volume={volume}
          isMuted={isMuted}
          onMute={handleMute}
        />
      </div>
    </div>
  );
}
