import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Film, Play, TrendingUp, Eye, Clock } from 'lucide-react';
import apiClient from '@/lib/api';

export default function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiClient.getAnalytics(),
  });

  const { data: watchStats } = useQuery({
    queryKey: ['watch-stats'],
    queryFn: () => apiClient.getWatchStats(),
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiClient.getUserStats(),
  });

  const statsCards = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      description: '+12% from last month',
      icon: Users,
      trend: '+12%'
    },
    {
      title: 'Total Movies',
      value: analytics?.totalMovies || 0,
      description: '+5 new movies this week',
      icon: Film,
      trend: '+5'
    },
    {
      title: 'Watch Hours',
      value: `${analytics?.totalWatchHours || 0}h`,
      description: '+23% from last month',
      icon: Play,
      trend: '+23%'
    },
    {
      title: 'Active Users',
      value: analytics?.activeUsers || 0,
      description: 'Last 24 hours',
      icon: TrendingUp,
      trend: 'Live'
    }
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  {watchStats?.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">{activity.movieTitle}</p>
                          <p className="text-muted-foreground">
                            Watched by {activity.userCount} users
                          </p>
                        </div>
                      </div>
                      <div className="ml-auto text-sm text-muted-foreground">
                        {activity.timestamp}
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Movies</CardTitle>
                <CardDescription>
                  Most watched this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {watchStats?.topMovies?.slice(0, 5).map((movie: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Film className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">{movie.title}</p>
                          <p className="text-muted-foreground">
                            {movie.watchCount} views
                          </p>
                        </div>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  User growth chart would be implemented here
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Watch Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Movies</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">TV Shows</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>
                Generate and download system reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">User Activity Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed user engagement metrics
                  </p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                  Generate
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Content Performance Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Movie and TV show analytics
                  </p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                  Generate
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}