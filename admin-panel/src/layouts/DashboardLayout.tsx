import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Users,
  Film,
  BarChart2,
  Bell,
  Settings,
  LogIn,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Assuming you will copy Shadcn UI Button

// Placeholder for Shadcn UI components (you'd typically generate these or install)
// For now, let's create simple mock components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
    {children}
  </div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);


const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-admin-primary">CineMini Admin</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden text-white">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center p-4 text-sm font-medium hover:bg-gray-800 transition-colors rounded-md mx-2",
                  location.pathname === item.path ? "bg-gray-800 text-admin-primary" : "text-gray-300"
                )}
                onClick={onClose} // Close sidebar on mobile after navigation
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <Button variant="ghost" className="w-full justify-start text-red-400 hover:bg-gray-800 hover:text-red-500">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar isOpen={true} onClose={() => {}} /> {/* Sidebar is always open on desktop */}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header (for mobile to toggle sidebar) */}
        <header className="bg-gray-900 p-4 border-b border-gray-800 flex items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-white mr-4">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-white">CineMini Admin</h1>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet /> {/* Renders the matched child route component */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
