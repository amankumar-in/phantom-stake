"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isBlocked: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;
  investments?: unknown[];
  earnings?: number;
}

// Define a type for the form state
interface FormState {
  username: string;
  email: string;
  password?: string;
  isAdmin: boolean;
}

const initialForm: FormState = { username: '', email: '', password: '', isAdmin: false };

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<User | null>(null);
  const [showReset, setShowReset] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [pw, setPw] = useState('');
  const [modalError, setModalError] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Add User
  const handleAdd = async () => {
    setModalError('');
    if (!form.username || !form.email || !form.password) {
      setModalError('All fields required'); return;
    }
    const res = await fetch(`${API}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowAdd(false); setForm(initialForm); fetchUsers();
    } else {
      const err = await res.json(); setModalError(err.message || 'Error');
    }
  };

  // Edit User
  const handleEdit = async () => {
    if (!showEdit) return;
    setModalError('');
    const res = await fetch(`${API}/admin/users/${showEdit._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ username: form.username, email: form.email, isAdmin: form.isAdmin }),
    });
    if (res.ok) {
      setShowEdit(null); setForm(initialForm); fetchUsers();
    } else {
      const err = await res.json(); setModalError(err.message || 'Error');
    }
  };

  // Delete User
  const handleRemove = async (user: User) => {
    if (!confirm(`Delete user ${user.username}?`)) return;
    await fetch(`${API}/admin/users/${user._id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    fetchUsers();
  };

  // Reset Password
  const handleReset = async () => {
    if (!showReset) return;
    setModalError('');
    if (!pw) { setModalError('Password required'); return; }
    const res = await fetch(`${API}/admin/users/${showReset._id}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ newPassword: pw }),
    });
    if (res.ok) {
      setShowReset(null); setPw('');
    } else {
      const err = await res.json(); setModalError(err.message || 'Error');
    }
  };

  // Toggle actions
  const toggle = async (user: User, field: string, enable: boolean) => {
    let url = `${API}/admin/users/${user._id}/`;
    if (field === 'isAdmin') url += enable ? 'set-admin' : 'unset-admin';
    if (field === 'isBlocked') url += enable ? 'block' : 'unblock';
    if (field === 'canDeposit') url += enable ? 'enable-deposit' : 'disable-deposit';
    if (field === 'canWithdraw') url += enable ? 'enable-withdrawal' : 'disable-withdrawal';
    await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    fetchUsers();
  };

  // Investments/Earnings
  const [showInvest, setShowInvest] = useState<User | null>(null);
  const [investments, setInvestments] = useState<unknown[]>([]);
  const [earnings, setEarnings] = useState<number>(0);
  const fetchInvestments = async (user: User) => {
    setShowInvest(user); setInvestments([]); setEarnings(0);
    const res1 = await fetch(`${API}/admin/users/${user._id}/investments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const res2 = await fetch(`${API}/admin/users/${user._id}/earnings`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    setInvestments((await res1.json()).data || []);
    setEarnings((await res2.json()).data || 0);
  };

  if (loading) return <div className="text-white">Loading users...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
      <button className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={() => { setShowAdd(true); setForm(initialForm); }}>Add User</button>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Blocked</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Deposit</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Withdraw</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Investments</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap text-white">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="checkbox" checked={user.isAdmin} onChange={e => toggle(user, 'isAdmin', e.target.checked)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="checkbox" checked={user.isBlocked} onChange={e => toggle(user, 'isBlocked', e.target.checked)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="checkbox" checked={user.canDeposit} onChange={e => toggle(user, 'canDeposit', e.target.checked)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input type="checkbox" checked={user.canWithdraw} onChange={e => toggle(user, 'canWithdraw', e.target.checked)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button className="text-blue-400 underline" onClick={() => fetchInvestments(user)}>View</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button className="text-green-400 underline" onClick={() => fetchInvestments(user)}>View</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { setShowEdit(user); setForm({ username: user.username, email: user.email, isAdmin: user.isAdmin }); }} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">Edit</button>
                      <button onClick={() => handleRemove(user)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">Remove</button>
                      <button onClick={() => { setShowReset(user); setPw(''); }} className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs">Reset PW</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add User</h2>
            <input className="w-full mb-2 p-2 rounded" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <input className="w-full mb-2 p-2 rounded" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="w-full mb-2 p-2 rounded" placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <label className="flex items-center mb-2 text-white"><input type="checkbox" checked={form.isAdmin} onChange={e => setForm({ ...form, isAdmin: e.target.checked })} className="mr-2" />Admin</label>
            {modalError && <div className="text-red-400 mb-2">{modalError}</div>}
            <div className="flex gap-2">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={handleAdd}>Add</button>
              <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Edit User</h2>
            <input className="w-full mb-2 p-2 rounded" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <input className="w-full mb-2 p-2 rounded" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <label className="flex items-center mb-2 text-white"><input type="checkbox" checked={form.isAdmin} onChange={e => setForm({ ...form, isAdmin: e.target.checked })} className="mr-2" />Admin</label>
            {modalError && <div className="text-red-400 mb-2">{modalError}</div>}
            <div className="flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={handleEdit}>Save</button>
              <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => setShowEdit(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Reset Password</h2>
            <input className="w-full mb-2 p-2 rounded" placeholder="New Password" type="password" value={pw} onChange={e => setPw(e.target.value)} />
            {modalError && <div className="text-red-400 mb-2">{modalError}</div>}
            <div className="flex gap-2">
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded" onClick={handleReset}>Reset</button>
              <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => setShowReset(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Investments/Earnings Modal */}
      {showInvest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">{showInvest.username}&apos;s Investments & Earnings</h2>
            <div className="mb-4">
              <h3 className="text-lg text-white font-semibold mb-2">Investments</h3>
              <pre className="bg-gray-800 text-white p-2 rounded overflow-x-auto max-h-40">{JSON.stringify(investments, null, 2)}</pre>
            </div>
            <div className="mb-4">
              <h3 className="text-lg text-white font-semibold mb-2">Earnings</h3>
              <div className="text-green-400 text-2xl font-bold">${earnings.toLocaleString()}</div>
            </div>
            <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => setShowInvest(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
