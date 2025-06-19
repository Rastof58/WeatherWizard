import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; // Placeholder for Shadcn UI Switch

// Mock components - replace with actual Shadcn UI imports later
const InputComponent = ({ type = "text", placeholder, value, onChange, className }: any) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const ButtonComponent = ({ children, onClick, className, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
  >
    {children}
  </button>
);

const SwitchComponent = ({ checked, onCheckedChange, id, className, children }: any) => (
  <div className="flex items-center space-x-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-300">
      {children}
    </label>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange(!checked)}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-admin-primary data-[state=unchecked]:bg-gray-600 ${className}`}
    >
      <span data-state={checked ? "checked" : "unchecked"} className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"></span>
    </button>
  </div>
);


const SettingsPage: React.FC = () => {
  const [tmdbApiKey, setTmdbApiKey] = useState('YOUR_TMDB_API_KEY_HERE');
  const [vidsrcApiKey, setVidsrcApiKey] = useState('YOUR_VIDSRC_API_KEY_HERE'); // Assuming VidSrc might need an API key
  const [enableRateLimiting, setEnableRateLimiting] = useState(true);
  const [rateLimitRequests, setRateLimitRequests] = useState('100');
  const [rateLimitWindow, setRateLimitWindow] = useState('60'); // seconds

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving settings:', {
      tmdbApiKey,
      vidsrcApiKey,
      enableRateLimiting,
      rateLimitRequests,
      rateLimitWindow,
    });
    // In a real app, send this data to backend to update configuration
    alert('Settings saved! (Demo only)'); // Replace with a proper toast notification
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Application Settings</h1>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label htmlFor="tmdbApiKey" className="block text-sm font-medium text-gray-300 mb-2">
                TMDB API Key
              </label>
              <InputComponent
                id="tmdbApiKey"
                type="text"
                value={tmdbApiKey}
                onChange={(e: any) => setTmdbApiKey(e.target.value)}
                placeholder="Enter TMDB API Key"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label htmlFor="vidsrcApiKey" className="block text-sm font-medium text-gray-300 mb-2">
                VidSrc API Key (if applicable)
              </label>
              <InputComponent
                id="vidsrcApiKey"
                type="text"
                value={vidsrcApiKey}
                onChange={(e: any) => setVidsrcApiKey(e.target.value)}
                placeholder="Enter VidSrc API Key"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <h3 className="text-lg font-semibold mt-6">Rate Limiting</h3>
            <div className="space-y-4">
              <SwitchComponent
                id="enableRateLimiting"
                checked={enableRateLimiting}
                onCheckedChange={setEnableRateLimiting}
                className=""
              >
                Enable API Rate Limiting
              </SwitchComponent>
              {enableRateLimiting && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rateLimitRequests" className="block text-sm font-medium text-gray-300 mb-2">
                      Max Requests
                    </label>
                    <InputComponent
                      id="rateLimitRequests"
                      type="number"
                      value={rateLimitRequests}
                      onChange={(e: any) => setRateLimitRequests(e.target.value)}
                      min="1"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="rateLimitWindow" className="block text-sm font-medium text-gray-300 mb-2">
                      Time Window (seconds)
                    </label>
                    <InputComponent
                      id="rateLimitWindow"
                      type="number"
                      value={rateLimitWindow}
                      onChange={(e: any) => setRateLimitWindow(e.target.value)}
                      min="1"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
            <ButtonComponent type="submit" className="w-full bg-admin-primary hover:bg-admin-primary/90">
              Save Settings
            </ButtonComponent>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
