import { useEffect, useState } from 'react'
import { UserCheck, UserX, Plus, Loader2 } from 'lucide-react'
import {  formatDate, getInitials } from '../utils/helpers'
import toast from 'react-hot-toast'
import axiosApi from '../services/api'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'guard', phone: '', department: '' })
  const [creating, setCreating] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axiosApi.get('users')
      setUsers(res.data.users)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleStatus = async (id) => {
    setToggling(id)
    try {
      const res = await axiosApi.patch(`users/${id}/toggle`)
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u))
      toast.success(res.data.message)
    } catch { toast.error('Failed to update user') }
    finally { setToggling(null) }
  }

  const createUser = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Fill required fields')
    setCreating(true)
    try {
      await api.post('/auth/register', form)
      toast.success('User created successfully')
      setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'guard', phone: '', department: '' })
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    } finally { setCreating(false) }
  }

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Manage Users</h1>
          <p className="text-sm text-brand-900/50">{users.length} users registered</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="card p-5">
          <p className="font-bold text-brand-900 mb-4">Create New User</p>
          <form onSubmit={createUser} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="label">Name *</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Full name" className="input-field" /></div>
            <div><label className="label">Email *</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="email@example.com" className="input-field" /></div>
            <div><label className="label">Password *</label><input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="Min 6 chars" className="input-field" /></div>
            <div><label className="label">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className="input-field">
                <option value="guard">Guard</option>
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div><label className="label">Phone</label><input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="9999999999" className="input-field" /></div>
            <div><label className="label">Department / Flat</label><input value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} placeholder="Optional" className="input-field" /></div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-brand-100/60">
                {['User', 'Role', 'Phone', 'Last Login', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-brand-900/50 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/40">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 shimmer rounded" /></td>)}</tr>
                ))
              ) : users.map(u => {
                const role = u.role || {}
                return (
                  <tr key={u._id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand-900">{u.name}</p>
                          <p className="text-xs text-brand-900/40">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${role.color}`}>{role.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-brand-900/60">{u.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-brand-900/50">{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleStatus(u._id)}
                        disabled={toggling === u._id}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          u.isActive
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {toggling === u._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />
                        }
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}