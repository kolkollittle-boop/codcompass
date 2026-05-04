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
      <div className="flex flex-1 items-center justify-center bg-docs-bg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-docs-accent"></div>
          <p className="mt-4 text-docs-muted">Loading...</p>
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
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-grow">
        <div className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-docs-heading">👥 Manage Users</h1>
              <p className="mt-1 text-docs-muted">View and manage all user accounts</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search users..."
                className="rounded-lg border border-docs-border bg-docs-surface px-4 py-2 text-docs-heading placeholder:text-docs-muted focus:border-docs-accent focus:ring-2 focus:ring-docs-accent"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="docs-card overflow-hidden rounded-xl border border-docs-border bg-docs-surface">
            <table className="min-w-full divide-y divide-docs-border">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-docs-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-docs-border bg-docs-surface">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-docs-accent">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-docs-heading">{user.name}</div>
                          <div className="text-sm text-docs-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="rounded border border-docs-border bg-white/5 px-2 py-1 text-sm text-docs-heading"
                      >
                        <option value="USER">User</option>
                        <option value="EDITOR">Editor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === 'active' 
                          ? 'border border-green-500/20 bg-green-500/10 text-green-400' 
                          : 'border border-red-500/20 bg-red-500/10 text-red-400'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-docs-heading">
                      {user.joined}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {user.email !== 'kolkollittle@gmail.com' && (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-400 hover:text-red-300"
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
      <Footer variant="docs" />
    </div>
  );
}
