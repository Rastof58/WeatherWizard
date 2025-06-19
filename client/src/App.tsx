import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { useEffect } from "react";

import Home from "@/pages/home";
import Search from "@/pages/search";
import MovieDetail from "@/pages/movie-detail";
import VideoPlayer from "@/pages/video-player";
import NotFound from "@/pages/not-found";

import { useTelegram } from "@/hooks/use-telegram";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

function Router() {
  const [location, navigate] = useLocation();
  const { user, isReady } = useTelegram();

  const authMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('POST', '/api/auth/telegram', userData);
    },
  });

  useEffect(() => {
    if (isReady && user && !authMutation.isSuccess) {
      authMutation.mutate({
        telegramId: user.id.toString(),
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        photoUrl: user.photo_url,
      });
    }
  }, [isReady, user, authMutation]);

  const showBottomNav = !location.includes('/player');

  return (
    <div className="min-h-screen bg-netflix-black">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/movie/:id" component={MovieDetail} />
        <Route path="/player/:id" component={VideoPlayer} />
        <Route component={NotFound} />
      </Switch>
      
      {showBottomNav && (
        <BottomNavigation onNavigate={navigate} />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
