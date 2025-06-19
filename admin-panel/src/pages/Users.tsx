import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Assuming these will be copied/generated

// Mock data
const mockUsers = [
  { id: '1', telegramId: '123456789', username: 'john_doe', firstName: 'John', lastName: 'Doe', status: 'active' },
  { id: '2', telegramId: '987654321', username: 'jane_smith', firstName: 'Jane', lastName: 'Smith', status: 'active' },
  { id: '3', telegramId: '456789123', username: 'bot_user', firstName: 'Bot', lastName: 'User', status: 'banned' },
  { id: '4', telegramId: '654321987', username: 'guest_user', firstName: 'Guest', lastName: 'User', status: 'active' },
];

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [dialogAction, setDialogAction] = useState<'ban' | 'reset' | null>(null);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telegramId.includes(searchTerm)
  );

  const handleAction = (user: typeof mockUsers[0], action: 'ban' | 'reset') => {
    setSelectedUser(user);
    setDialogAction(action);
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedUser || !dialogAction) return;

    if (dialogAction === 'ban') {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'banned' } : u));
      console.log(`User ${selectedUser.username} banned.`);
    } else if (dialogAction === 'reset') {
      console.log(`Watch progress for ${selectedUser.username} reset.`);
    }
    setIsDialogOpen(false);
    setSelectedUser(null);
    setDialogAction(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">User Management</h1>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <InputComponent
              placeholder="Search users by username or ID..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Telegram ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.telegramId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.username || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.firstName} {user.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ButtonComponent
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction(user, 'ban')}
                        disabled={user.status === 'banned'}
                        className="mr-2 bg-red-600 hover:bg-red-700"
                      >
                        {user.status === 'banned' ? 'Banned' : 'Ban'}
                      </ButtonComponent>
                      <ButtonComponent
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(user, 'reset')}
                        className="border-gray-600 hover:bg-gray-700 text-gray-300"
                      >
                        Reset Progress
                      </ButtonComponent>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-400 mt-4">No users found.</p>
          )}
        </CardContent>
      </Card>

      {/* Dialog for confirmation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to {dialogAction === 'ban' ? 'ban' : 'reset watch progress for'} {selectedUser?.username || selectedUser?.firstName}?
          </div>
          <DialogFooter>
            <ButtonComponent onClick={() => setIsDialogOpen(false)} variant="outline" className="border-gray-600 hover:bg-gray-700 text-gray-300">
              Cancel
            </ButtonComponent>
            <ButtonComponent onClick={confirmAction} variant="destructive" className="bg-red-600 hover:bg-red-700">
              Confirm {dialogAction === 'ban' ? 'Ban' : 'Reset'}
            </ButtonComponent>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
