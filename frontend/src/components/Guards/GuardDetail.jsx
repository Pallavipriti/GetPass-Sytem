import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, User, Phone, Mail, MapPin, CreditCard, Clock, DoorOpen, CalendarDays, ShieldAlert } from 'lucide-react'
import { useGuards } from '../../hooks/useGuards'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'

const ID_TYPE_LABELS = {
  aadhar: 'Aadhar Card',
  voter_id: 'Voter ID',
  driving_license: 'Driving License',
  passport: 'Passport',
}

export default function GuardDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { guard, loading, fetchGuard, deleteGuard } = useGuards()

  useEffect(() => { fetchGuard(id) }, [id])

  const canManage = ['admin'].includes(user?.role)

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${guard?.name} as a guard? This cannot be undone.`)) return
    await deleteGuard(id)
    navigate('/guards')
  }

  if (loading || !guard) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="card p-6 space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-5 rounded shimmer" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary !px-3 !py-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-brand-900">{guard?.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-brand-900/50 capitalize">{guard?.shift ? `${guard?.shift} shift` : '—'}</span>
              <span className="text-xs text-brand-900/30">·</span>
              <span className="text-xs text-brand-900/50">{guard?.assignedGate || 'Unassigned'}</span>
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => navigate(`/guards/${id}/edit`)} className="btn-secondary">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="btn-secondary !text-red-600 hover:!bg-red-50">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Avatar */}
          <div className="card p-5 flex flex-col items-center gap-4">
            <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-brand-100 bg-surface-100 flex items-center justify-center">
              {guard?.photo
                ? <img src={guard?.photo} alt="Guard" className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-brand-900/20" />
              }
            </div>
            <div className="text-center">
              <p className="font-bold text-brand-900">{guard?.name}</p>
              <p className="text-sm text-brand-900/50">{guard?.phone}</p>
              {guard?.email && <p className="text-xs text-brand-500 mt-0.5">{guard?.email}</p>}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Duty Info */}
          <div className="card p-5">
            <p className="text-xs font-bold text-brand-900/50 uppercase tracking-wider mb-4">Duty Information</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Clock, label: 'Shift', value: guard?.shift ? guard?.shift.charAt(0).toUpperCase() + guard?.shift.slice(1) : '—' },
                { icon: DoorOpen, label: 'Assigned Gate / Post', value: guard?.assignedGate || '—' },
                { icon: CalendarDays, label: 'Date of Joining', value: guard?.dateOfJoining ? formatDate(guard?.dateOfJoining) : '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-900/40 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-brand-900 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Identity Info */}
          <div className="card p-5">
            <p className="text-xs font-bold text-brand-900/50 uppercase tracking-wider mb-4">Identity Verification</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: CreditCard, label: 'ID Type', value: ID_TYPE_LABELS[guard?.idType] || guard?.idType || '—' },
                { icon: CreditCard, label: 'ID Number', value: guard?.idNumber || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-900/40 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-brand-900 font-mono mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="card p-5">
            <p className="text-xs font-bold text-brand-900/50 uppercase tracking-wider mb-4">Contact Information</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Phone, label: 'Phone', value: guard?.phone || '—' },
                { icon: Mail, label: 'Email', value: guard?.email || '—' },
                { icon: ShieldAlert, label: 'Emergency Contact', value: guard?.emergencyContact || '—' },
                { icon: MapPin, label: 'Address', value: guard?.address || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-900/40 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-brand-900 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}