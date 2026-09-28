import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  // common
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'resident',
  address: '',
  emergencyContact: '',
  // resident-only
  flatNumber: '',
  block: '',
  ownershipType: 'owner', // owner | tenant
  familyMembers: '',
  vehicleNumber: '',
  // guard-only
  idType: 'aadhar', // aadhar | voter | driving_license | passport
  idNumber: '',
  shift: 'morning', // morning | evening | night
  assignedGate: '',
  dateOfJoining: '',
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    // fields required for every role
    if (!form.name.trim()) return 'Full name is required'
    if (!form.email.trim()) return 'Email is required'
    if (!form.password) return 'Password is required'
    if (form.password.length < 6) return 'Password must be 6+ characters'
    if (!form.phone.trim()) return 'Phone number is required'
    if (!/^\d{10}$/.test(form.phone.trim())) return 'Phone number must be 10 digits'

    if (form.role === 'resident') {
      if (!form.flatNumber.trim()) return 'Flat / Room number is required'
      if (!form.block.trim()) return 'Block / Wing is required'
    }

    if (form.role === 'guard') {
      if (!form.idType) return 'ID type is required'
      if (!form.idNumber.trim()) return 'ID number is required'
      if (!form.shift) return 'Shift is required'
      if (!form.dateOfJoining) return 'Date of joining is required'
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const error = validate()
    if (error) return toast.error(error)

    setLoading(true)
    try {
      const user = await register(form)
      if (user) {
        toast.success(`Account created! Welcome, ${user?.name?.split(' ')[0]}!`)
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Registration error', err)
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50">
      <div className="w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-brand-900 mb-1">Create account</h2>
        <p className="text-brand-900/50 text-sm mb-8">Join the visitor management system</p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-[24px] border border-slate-200 p-6 shadow-lg shadow-slate-200/40">
          <div className="grid grid-cols-2 gap-4">

            {/* ---------- Common fields ---------- */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="John Doe" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="john@example.com" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="9999999999" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select name="role" value={form.role} onChange={handleChange} className="form-select">
                <option value="resident">Resident</option>
                <option value="guard">Guard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Number</label>
              <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange}
                placeholder="Alternate number for emergencies" className="form-input" />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Address</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="Permanent / local address" className="form-input" />
            </div>

            {/* ---------- Resident-only fields ---------- */}
            {form.role === 'resident' && (
              <>
                <div className="form-group">
                  <label className="form-label">Block / Wing *</label>
                  <input name="block" value={form.block} onChange={handleChange}
                    placeholder="e.g. B Wing" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Flat / Room Number *</label>
                  <input name="flatNumber" value={form.flatNumber} onChange={handleChange}
                    placeholder="A-101" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Ownership Type</label>
                  <select name="ownershipType" value={form.ownershipType} onChange={handleChange} className="form-select">
                    <option value="owner">Owner</option>
                    <option value="tenant">Tenant</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Family Members</label>
                  <input type="number" min="0" name="familyMembers" value={form.familyMembers} onChange={handleChange}
                    placeholder="Number of occupants" className="form-input" />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Vehicle Number</label>
                  <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange}
                    placeholder="e.g. PB-10-AB-1234 (optional)" className="form-input" />
                </div>
              </>
            )}

            {/* ---------- Guard-only fields ---------- */}
            {form.role === 'guard' && (
              <>
                <div className="form-group">
                  <label className="form-label">ID Type *</label>
                  <select name="idType" value={form.idType} onChange={handleChange} className="form-select">
                    <option value="aadhar">Aadhar Card</option>
                    <option value="voter_id">Voter ID</option>
                    <option value="driving_license">Driving License</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">ID Number *</label>
                  <input name="idNumber" value={form.idNumber} onChange={handleChange}
                    placeholder="Enter ID number" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Shift *</label>
                  <select name="shift" value={form.shift} onChange={handleChange} className="form-select">
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Gate / Post</label>
                  <input name="assignedGate" value={form.assignedGate} onChange={handleChange}
                    placeholder="e.g. Main Gate (optional)" className="form-input" />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Date of Joining *</label>
                  <input type="date" name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange}
                    className="form-input" />
                </div>
              </>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  )
}