import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTelegram } from '@/hooks/use-telegram';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: number;
  type: 'new_movie' | 'watchlist_reminder' | 'trending' | 'recommendation';
  title: string;
  message: string;
  movieId?: number;
  read: boolean;
  createdAt: string;
}

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useTelegram();
  const { toast } = useToast();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    refetchInterval: 30000, // Check for new notifications every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('PUT', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const unreadCount = (notifications as any[]).filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.movieId) {
      window.location.href = `/movie/${notification.movieId}`;
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_movie': return 'fas fa-plus-circle';
      case 'watchlist_reminder': return 'fas fa-bookmark';
      case 'trending': return 'fas fa-fire';
      case 'recommendation': return 'fas fa-star';
      default: return 'fas fa-bell';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
      >
        <i className="fas fa-bell text-white text-lg"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-netflix-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-netflix-gray border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400">{unreadCount} unread</p>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {(notifications as any[]).length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <i className="fas fa-bell-slash text-3xl mb-2"></i>
                <p>No notifications yet</p>
              </div>
            ) : (
              (notifications as any[]).map((notification: any) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-700 hover:bg-gray-600 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-netflix-red/10' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <i className={`${getNotificationIcon(notification.type)} text-netflix-red mt-1`}></i>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-netflix-red rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};