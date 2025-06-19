import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Film, 
  TrendingUp, 
  Clock, 
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { adminApi } from '../services/api';
import { Analytics, WatchStats, User, Movie } from '../types';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [watchStats, setWatchStats] = useState<WatchStats[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for charts (replace with real API calls)
  const userGrowthData = [
    { date: '2024-01-01', users: 120, sessions: 350, watchTime: 1200 },
    { date: '2024-01-02', users: 132, sessions: 380, watchTime: 1350 },
    { date: '2024-01-03', users: 145, sessions: 420, watchTime: 1500 },
    { date: '2024-01-04', users: 160, sessions: 450, watchTime: 1680 },
    { date: '2024-01-05', users: 175, sessions: 500, watchTime: 1800 },
    { date: '2024-01-06', users: 190, sessions: 550, watchTime: 1950 },
    { date: '2024-01-07', users: 208, sessions: 600, watchTime: 2100 },
  ];

  const genreData = [
    { name: 'Action', value: 35, color: '#3B82F6' },
    { name: 'Drama', value: 25, color: '#EF4444' },
    { name: 'Comedy', value: 20, color: '#10B981' },
    { name: 'Thriller', value: 12, color: '#F59E0B' },
    { name: 'Horror', value: 8, color: '#8B5CF6' },
  ];

  const topMoviesData = [
    { title: 'Movie A', views: 1250 },
    { title: 'Movie B', views: 980 },
    { title: 'Movie C', views: 750 },
    { title: 'Movie D', views: 620 },
    { title: 'Movie E', views: 540 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data
      const analyticsData = await adminApi.getAnalytics();
      setAnalytics(analyticsData);

      // Fetch watch stats
      const watchStatsData = await adminApi.getWatchStats();
      setWatchStats(watchStatsData.slice(0, 5)); // Top 5 movies

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-80 rounded-lg"></div>
            <div className="bg-gray-200 h-80 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your CineMini admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          change="+12% from last month"
          trend="up"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={analytics?.activeUsers || 0}
          change="+8% from yesterday"
          trend="up"
          icon={Activity}
          color="bg-green-500"
        />
        <StatCard
          title="Total Movies"
          value={analytics?.totalMovies || 0}
          change="+5 this week"
          trend="up"
          icon={Film}
          color="bg-purple-500"
        />
        <StatCard
          title="Watch Hours"
          value={`${analytics?.totalWatchHours || 0}h`}
          change="+23% from last week"
          trend="up"
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [value, name === 'users' ? 'Users' : name === 'sessions' ? 'Sessions' : 'Watch Time (min)']}
              />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Popular Genres</h3>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Movies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Watched Movies</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMoviesData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="title" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="views" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">API Server</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">Database</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">TMDB API</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">Streaming Service</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Uptime:</span>
                <span className="ml-2 font-medium">99.9%</span>
              </div>
              <div>
                <span className="text-gray-600">Response Time:</span>
                <span className="ml-2 font-medium">45ms</span>
              </div>
              <div>
                <span className="text-gray-600">Active Sessions:</span>
                <span className="ml-2 font-medium">{analytics?.activeUsers || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">API Calls Today:</span>
                <span className="ml-2 font-medium">15,247</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;