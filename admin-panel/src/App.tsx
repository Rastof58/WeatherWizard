import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation } from 'wouter';
import Dashboard from './pages/dashboard';
import Movies from './pages/movies';
import Users from './pages/users';
import { Button } from './components/ui/button';
import { 
  LayoutDashboard, 
  Film, 
  Users as UsersIcon, 
  Settings, 
  Menu,
  X
} from 'lucide-react';

const queryClient = new QueryClient();

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [location, navigate] = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Movies & TV', href: '/movies', icon: Film },
    { name: 'Users', href: '/users', icon: UsersIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Netflix Admin</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      navigate(item.href);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Netflix Admin</h1>
          <div className="w-8" />
        </div>
        
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/movies" component={Movies} />
          <Route path="/users" component={Users} />
          <Route path="/settings">
            <div className="p-8">
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-gray-600 mt-2">System settings and configuration</p>
            </div>
          </Route>
          <Route>
            <div className="p-8">
              <h2 className="text-2xl font-bold">Page Not Found</h2>
              <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
            </div>
          </Route>
        </Switch>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;