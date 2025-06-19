import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  UserX, 
  UserCheck, 
  RotateCcw, 
  Calendar,
  Globe,
  MessageCircle,
  MoreHorizontal,
  Shield,
  Ban,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { adminApi } from '../services/api';
import { User, PaginatedResponse } from '../types';

interface UsersPageState {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  selectedUsers: Set<number>;
  searchQuery: string;
  statusFilter: string;
  showFilters: boolean;
  showBulkActions: boolean;
}

const Users: React.FC = () => {
  const [state, setState] = useState<UsersPageState>({
    users: [],
    loading: true,
    error: null,
    page: 1,
    totalPages: 1,
    selectedUsers: new Set(),
    searchQuery: '',
    statusFilter: 'all',
    showFilters: false,
    showBulkActions: false,
  });

  useEffect(() => {
    fetchUsers();
  }, [state.page, state.searchQuery, state.statusFilter]);

  const fetchUsers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await adminApi.getUsers(
        state.page,
        20,
        state.searchQuery || undefined
      );
      
      setState(prev => ({
        ...prev,
        users: response.items,
        totalPages: Math.ceil(response.total / 20),
        loading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch users',
        loading: false,
      }));
    }
  };

  const handleSelectUser = (userId: number) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedUsers);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return { ...prev, selectedUsers: newSelected };
    });
  };

  const handleSelectAll = () => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.size === prev.users.length 
        ? new Set() 
        : new Set(prev.users.map(u => u.id))
    }));
  };

  const handleBulkAction = async (action: 'block' | 'unblock' | 'reset_progress') => {
    if (state.selectedUsers.size === 0) return;

    const confirmMessage = action === 'block'
      ? `Are you sure you want to block ${state.selectedUsers.size} users?`
      : action === 'unblock'
      ? `Are you sure you want to unblock ${state.selectedUsers.size} users?`
      : `Are you sure you want to reset watch progress for ${state.selectedUsers.size} users?`;

    if (!confirm(confirmMessage)) return;

    try {
      await adminApi.bulkUserAction(Array.from(state.selectedUsers), action);
      setState(prev => ({ ...prev, selectedUsers: new Set() }));
      await fetchUsers();
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
      alert(`Failed to ${action} users. Please try again.`);
    }
  };

  const handleUserAction = async (userId: number, action: 'block' | 'unblock' | 'reset_progress') => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    const confirmMessage = action === 'block'
      ? `Are you sure you want to block ${user.firstName || user.username || 'this user'}?`
      : action === 'unblock'
      ? `Are you sure you want to unblock ${user.firstName || user.username || 'this user'}?`
      : `Are you sure you want to reset watch progress for ${user.firstName || user.username || 'this user'}?`;

    if (!confirm(confirmMessage)) return;

    try {
      if (action === 'block') {
        await adminApi.blockUser(userId);
      } else if (action === 'unblock') {
        await adminApi.unblockUser(userId);
      } else {
        await adminApi.resetUserProgress(userId);
      }
      await fetchUsers();
    } catch (err) {
      console.error(`${action} failed:`, err);
      alert(`Failed to ${action} user. Please try again.`);
    }
  };

  const UserRow: React.FC<{ user: User }> = ({ user }) => (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 ${state.selectedUsers.has(user.id) ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={state.selectedUsers.has(user.id)}
          onChange={() => handleSelectUser(user.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.firstName || 'User'}
              className="h-10 w-10 rounded-full mr-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <span className="text-gray-600 font-medium">
                {(user.firstName || user.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">@{user.username || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="flex items-center">
          <MessageCircle className="h-4 w-4 mr-1 text-blue-400" />
          {user.telegramId}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="flex items-center">
          <Globe className="h-4 w-4 mr-1 text-gray-400" />
          {user.languageCode || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.isBlocked 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
      </td>
      <td className="px-6 py-4 text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {user.isBlocked ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUserAction(user.id, 'unblock')}
              className="text-green-600 hover:text-green-900"
              title="Unblock user"
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUserAction(user.id, 'block')}
              className="text-red-600 hover:text-red-900"
              title="Block user"
            >
              <UserX className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUserAction(user.id, 'reset_progress')}
            className="text-orange-600 hover:text-orange-900"
            title="Reset watch progress"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  const Pagination: React.FC = () => (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={state.page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setState(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          disabled={state.page >= state.totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{state.page}</span> of{' '}
            <span className="font-medium">{state.totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={state.page <= 1}
              className="rounded-l-md"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={state.page >= state.totalPages}
              className="rounded-r-md"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );

  if (state.loading && state.users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white shadow-sm rounded-lg">
            <div className="h-16 bg-gray-200 rounded-t-lg"></div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.users.length > 0 ? state.users.length : '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.users.filter(u => !u.isBlocked).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-md">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Blocked Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.users.filter(u => u.isBlocked).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.users.filter(u => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(u.createdAt) > weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {state.showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={state.statusFilter}
                onChange={(e) => setState(prev => ({ ...prev, statusFilter: e.target.value, page: 1 }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {state.selectedUsers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {state.selectedUsers.size} user(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('unblock')}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Unblock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('block')}
              >
                <UserX className="h-4 w-4 mr-1" />
                Block
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('reset_progress')}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset Progress
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={state.users.length > 0 && state.selectedUsers.size === state.users.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telegram ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Language
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>

        {state.users.length === 0 && !state.loading && (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {state.searchQuery || state.statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Users will appear here as they join your platform.'}
            </p>
          </div>
        )}

        {state.users.length > 0 && <Pagination />}
      </div>

      {/* Error State */}
      {state.error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-800">
              <h3 className="font-medium">Error Loading Users</h3>
              <p className="mt-1 text-sm">{state.error}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={fetchUsers} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;