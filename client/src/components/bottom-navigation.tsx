import { useLocation } from 'wouter';

interface BottomNavigationProps {
  onNavigate: (path: string) => void;
}

export const BottomNavigation = ({ onNavigate }: BottomNavigationProps) => {
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: 'fas fa-home', label: 'Home' },
    { path: '/search', icon: 'fas fa-search', label: 'Search' },
    { path: '/categories', icon: 'fas fa-th-large', label: 'Categories' },
    { path: '/watchlist', icon: 'fas fa-bookmark', label: 'My List' },
    { path: '/profile', icon: 'fas fa-user', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-netflix-gray border-t border-gray-800 z-40">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              location === item.path 
                ? 'text-netflix-red' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
