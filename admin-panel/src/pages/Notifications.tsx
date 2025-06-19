import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Placeholder for Shadcn UI Textarea
import { Button } from '@/components/ui/button';

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

const TextareaComponent = ({ placeholder, value, onChange, className }: any) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={5}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
  ></textarea>
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


const NotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUsers, setTargetUsers] = useState('all'); // 'all', 'active', 'telegram_ids'
  const [telegramIds, setTelegramIds] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus('');

    // In a real application, this would send a request to your backend
    // which would then use the Telegram Bot API to send messages.
    console.log('Sending notification:', { title, message, targetUsers, telegramIds });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setTelegramIds('');
    } catch (error) {
      setStatus('Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Send Notifications</h1>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>New Announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <InputComponent
                id="title"
                type="text"
                placeholder="e.g., New Movie Release!"
                value={title}
                onChange={(e: any) => setTitle(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <TextareaComponent
                id="message"
                placeholder="Write your announcement message here..."
                value={message}
                onChange={(e: any) => setMessage(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label htmlFor="targetUsers" className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience
              </label>
              <select
                id="targetUsers"
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
                className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="telegram_ids">Specific Telegram IDs (comma-separated)</option>
              </select>
            </div>
            {targetUsers === 'telegram_ids' && (
              <div>
                <label htmlFor="telegramIds" className="block text-sm font-medium text-gray-300 mb-2">
                  Telegram User IDs
                </label>
                <InputComponent
                  id="telegramIds"
                  type="text"
                  placeholder="e.g., 12345,67890"
                  value={telegramIds}
                  onChange={(e: any) => setTelegramIds(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            )}
            <ButtonComponent type="submit" disabled={sending} className="w-full bg-admin-primary hover:bg-admin-primary/90">
              {sending ? 'Sending...' : 'Send Announcement'}
            </ButtonComponent>
            {status && (
              <p className={`mt-4 text-center ${status.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                {status}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
