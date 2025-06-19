import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PlayCircle, HardDrive, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for demonstration
const mockStats = {
  totalUsers: 1250,
  activeSessions: 340,
  popularMovies: 15,
  apiStatus: 'Operational',
};

const mockAnalyticsData = [
  { name: 'Jan', views: 4000, users: 2400 },
  { name: 'Feb', views: 3000, users: 1398 },
  { name: 'Mar', views: 2000, users: 980 },
  { name: 'Apr', views: 2780, users: 3908 },
  { name: 'May', views: 1890, users: 4800 },
  { name: 'Jun', views: 2390, users: 3800 },
  { name: 'Jul', views: 3490, users: 4300 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-400">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <PlayCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeSessions.toLocaleString()}</div>
            <p className="text-xs text-gray-400">+180 since last hour</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Movies Tracked</CardTitle>
            <HardDrive className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.popularMovies}</div>
            <p className="text-xs text-gray-400">+5 new this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{mockStats.apiStatus}</div>
            <p className="text-xs text-gray-400">All services online</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Overview Chart */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Platform Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockAnalyticsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                <XAxis dataKey="name" stroke="#a1a1a1" />
                <YAxis stroke="#a1a1a1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="views" fill="hsl(var(--admin-primary))" name="Total Views" />
                <Bar dataKey="users" fill="hsl(var(--admin-accent))" name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
