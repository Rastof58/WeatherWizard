import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useTelegram } from '@/hooks/use-telegram';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const [, navigate] = useLocation();
  const { user } = useTelegram();
  const { toast } = useToast();

  const { data: watchProgressData } = useQuery({
    queryKey: ['/api/watch-progress'],
    enabled: !!user,
  });

  const { data: watchlistData } = useQuery({
    queryKey: ['/api/watchlist'],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate('/');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getWatchedMoviesCount = () => {
    if (!(watchProgressData as any)?.progress) return 0;
    return (watchProgressData as any).progress.filter((p: any) => p.completed).length;
  };

  const getContinueWatchingCount = () => {
    if (!(watchProgressData as any)?.progress) return 0;
    return (watchProgressData as any).progress.filter((p: any) => !p.completed && p.currentTime > 0).length;
  };

  const getWatchlistCount = () => {
    return (watchlistData as any)?.watchlist?.length || 0;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center pb-20">
        <div className="text-center">
          <i className="fas fa-user-circle text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold mb-2">Login Required</h2>
          <p className="text-gray-400">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-netflix-black border-b border-gray-800">
        <div className="flex items-center p-4">
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <div className="bg-netflix-gray rounded-lg p-6">
          <div className="flex items-center space-x-4">
            {user.photo_url ? (
              <img 
                src={user.photo_url} 
                alt={user.first_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-2xl text-gray-300"></i>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h2>
              {user.username && (
                <p className="text-gray-400">@{user.username}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Telegram User ID: {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-netflix-gray rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-netflix-red">
              {getWatchedMoviesCount()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Watched
            </div>
          </div>
          
          <div className="bg-netflix-gray rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-netflix-red">
              {getContinueWatchingCount()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              In Progress
            </div>
          </div>
          
          <div className="bg-netflix-gray rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-netflix-red">
              {getWatchlistCount()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Watchlist
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          
          <button
            onClick={() => navigate('/watchlist')}
            className="w-full bg-netflix-gray hover:bg-gray-700 rounded-lg p-4 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-bookmark text-netflix-red"></i>
              <span>My Watchlist</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>

          <button
            onClick={() => navigate('/search')}
            className="w-full bg-netflix-gray hover:bg-gray-700 rounded-lg p-4 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-search text-netflix-red"></i>
              <span>Browse Movies</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Settings</h3>
          
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded-lg p-4 flex items-center justify-center space-x-2 transition-colors"
          >
            {logoutMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </>
            )}
          </button>
        </div>

        {/* App Info */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="text-center text-gray-500 text-sm">
            <p>CineMini v1.0</p>
            <p className="mt-1">Telegram Mini App for Movie Streaming</p>
          </div>
        </div>
      </div>
    </div>
  );
}