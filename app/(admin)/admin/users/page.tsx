'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UsersAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([
    { id: '1', email: 'kolkollittle@gmail.com', name: 'Admin User', role: 'ADMIN', joined: '2026-04-25', status: 'active' },
    { id: '2', email: 'user1@example.com', name: 'Test User 1', role: 'USER', joined: '2026-04-24', status: 'active' },
    { id: '3', email: 'user2@example.com', name: 'Test User 2', role: 'USER', joined: '2026-04-23', status: 'active' },
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-palette-bgPrimary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palette-primary mx-auto"></div>
          <p className="mt-4 text-palette-textMuted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
  };

  const handleBanUser = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'banned' } : u
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <Header />
      <main className="flex-grow">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-palette-textPrimary">👥 Manage Users</h1>
              <p className="text-palette-textMuted mt-1">View and manage all user accounts</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 border border-palette-border rounded-lg bg-palette-bgCard text-palette-textPrimary placeholder-palette-textMuted focus:ring-2 focus:ring-palette-primary focus:border-palette-primary"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-palette-bgCard rounded-xl shadow-sm border border-palette-border overflow-hidden">
            <table className="min-w-full divide-y divide-palette-border">
              <thead className="bg-palette-bgSecondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-palette-textMuted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-palette-bgCard divide-y divide-palette-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-palette-bgSecondary transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-palette-bgTertiary flex items-center justify-center text-palette-primary font-bold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-palette-textPrimary">{user.name}</div>
                          <div className="text-sm text-palette-textMuted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-sm border border-palette-border rounded px-2 py-1 bg-palette-bgSecondary text-palette-textPrimary"
                      >
                        <option value="USER">User</option>
                        <option value="EDITOR">Editor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-palette-textPrimary">
                      {user.joined}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {user.email !== 'kolkollittle@gmail.com' && (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {user.status === 'active' ? 'Ban' : 'Unban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
