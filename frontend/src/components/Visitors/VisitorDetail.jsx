import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, LogIn, LogOut, User, Phone, Building, Calendar, Clock, Shield, FileText, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useVisitors } from '../../hooks/useVisitors'
import StatusBadge from '../common/StatusBadge'
import { formatTime,formatDateTime, formatDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function VisitorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {visitor, loading, fetchVisitor, checkIn, checkOut } = useVisitors();
  const printRef = useRef()

  useEffect(() => { fetchVisitor(id) }, [id])

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML
    const originalBody = document.body.innerHTML
    document.body.innerHTML = `
      <html><head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', Arial, sans-serif; background: #fff; }
        .print-pass { width: 148mm; margin: 10mm auto; padding: 8mm; border: 2px solid #1a1a2e; border-radius: 8px; }
        .pass-header { text-align: center; padding-bottom: 6mm; border-bottom: 1px dashed #ddd; margin-bottom: 6mm; }
        .pass-header h1 { font-size: 18px; color: #1a1a2e; font-weight: 800; }
        .pass-header p { font-size: 11px; color: #666; margin-top: 2px; }
        .pass-body { display: flex; gap: 6mm; }
        .pass-photo { width: 25mm; height: 32mm; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; flex-shrink: 0; }
        .pass-photo img { width: 100%; height: 100%; object-fit: cover; }
        .pass-photo .no-photo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f4ff; color: #4361ee; font-size: 24px; }
        .pass-details { flex: 1; }
        .pass-field { margin-bottom: 3mm; }
        .pass-field label { font-size: 8px; font-weight: 700; color: #4361ee; text-transform: uppercase; letter-spacing: 0.5px; display: block; }
        .pass-field span { font-size: 11px; color: #1a1a2e; font-weight: 600; }
        .pass-id-badge { display: inline-block; background: #1a1a2e; color: #fff; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4mm; }
        .pass-footer { margin-top: 6mm; padding-top: 4mm; border-top: 1px dashed #ddd; display: flex; justify-content: space-between; align-items: center; }
        .pass-qr { text-align: center; }
        .pass-qr p { font-size: 8px; color: #999; margin-top: 1mm; }
        .status-chip { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; background: #e8f5e9; color: #2e7d32; }
      </style>
      </head><body>${printContent}</body></html>
    `
    window.print()
    document.body.innerHTML = originalBody
    window.location.reload()
  }

  if (loading || !visitor) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="card p-6 space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-5 rounded shimmer" />)}
        </div>
      </div>
    )
  }

  const canCheckIn = visitor?.status === 'pre-approved' && ['admin', 'guard'].includes(user.role)
  const canCheckOut = visitor?.status === 'checked-in' && ['admin', 'guard'].includes(user.role)

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary !px-3 !py-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-brand-900">{visitor?.visitorName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-brand-900/50">{visitor?.passId}</span>
              <StatusBadge status={visitor?.status} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canCheckIn && (
            <button onClick={() => checkIn(visitor?._id).then(() => fetchVisitor(id))} className="btn-primary">
              <LogIn className="w-4 h-4" /> Check In
            </button>
          )}
          {canCheckOut && (
            <button onClick={() => checkOut(visitor?._id).then(() => fetchVisitor(id))} className="btn-secondary">
              <LogOut className="w-4 h-4" /> Check Out
            </button>
          )}
          <button onClick={handlePrint} className="btn-secondary">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Photo */}
          <div className="card p-5 flex flex-col items-center gap-4">
            <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-brand-100 bg-surface-100 flex items-center justify-center">
              {visitor?.photo
                ? <img src={visitor?.photo} alt="Visitor" className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-brand-900/20" />
              }
            </div>
            <div className="text-center">
              <p className="font-bold text-brand-900">{visitor?.visitorName}</p>
              <p className="text-sm text-brand-900/50">{visitor?.visitorContact}</p>
              {visitor?.visitorEmail && <p className="text-xs text-brand-500 mt-0.5">{visitor?.visitorEmail}</p>}
            </div>
          </div>

          {/* QR Code */}
          <div className="card p-5 flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-brand-900/50 uppercase tracking-wider self-start flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </p>
            <div className="p-3 bg-white rounded-xl border border-brand-100">
              <QRCodeSVG
                value={JSON.stringify({ passId: visitor?.passId, id: visitor?._id, name: visitor?.visitorName })}
                size={140}
                bgColor="#ffffff"
                fgColor="#1a1a2e"
                level="M"
              />
            </div>
            <p className="text-xs text-brand-900/40 text-center">Scan at entry/exit gate</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Visit Details */}
          <div className="card p-5">
            <p className="text-xs font-bold text-brand-900/50 uppercase tracking-wider mb-4">Visit Information</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: FileText, label: 'Purpose', value: visitor?.purpose },
                { icon: Building, label: 'Host', value: visitor?.hostName },
                { icon: Building, label: 'Department', value: visitor?.hostDepartment || '—' },
                { icon: Building, label: 'Company', value: visitor?.companyName || '—' },
                { icon: Calendar, label: 'Expected Date', value: formatDate(visitor?.expectedDate) },
                { icon: Clock, label: 'Check-In', value: visitor?.timeIn ? formatDateTime(visitor?.timeIn) : '—' },
                { icon: Clock, label: 'Check-Out', value: visitor?.timeOut ? formatDateTime(visitor?.timeOut) : '—' },
                { icon: Shield, label: 'Security', value: visitor?.securityPersonnel?.name || '—' },
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
            {visitor?.comments && (
              <div className="mt-4 p-3 bg-surface-50 rounded-xl border border-brand-100">
                <p className="text-xs text-brand-900/40 font-medium mb-1">Comments</p>
                <p className="text-sm text-brand-900/70">{visitor?.comments}</p>
              </div>
            )}
          </div>

          {/* ID & Vehicle */}
          {(visitor?.idProofType || visitor?.vehicleNumber) && (
            <div className="card p-5">
              <p className="text-xs font-bold text-brand-900/50 uppercase tracking-wider mb-4">Identity & Vehicle</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {visitor?.idProofType && (
                  <div>
                    <p className="text-xs text-brand-900/40 font-medium">ID Type</p>
                    <p className="text-sm font-semibold text-brand-900 mt-0.5">{visitor?.idProofType}</p>
                  </div>
                )}
                {visitor?.idProofNumber && (
                  <div>
                    <p className="text-xs text-brand-900/40 font-medium">ID Number</p>
                    <p className="text-sm font-semibold text-brand-900 font-mono mt-0.5">{visitor?.idProofNumber}</p>
                  </div>
                )}
                {visitor?.vehicleNumber && (
                  <div>
                    <p className="text-xs text-brand-900/40 font-medium">Vehicle Number</p>
                    <p className="text-sm font-semibold text-brand-900 font-mono mt-0.5">{visitor?.vehicleNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="card p-5">
            <p className="text-xs font-bold text-brand-900/50 uppercase tracking-wider mb-4">System Information</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-brand-900/40">Created by</p>
                <p className="font-medium text-brand-900 mt-0.5">{visitor?.createdBy?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-brand-900/40">Created at</p>
                <p className="font-medium text-brand-900 mt-0.5">{formatDateTime(visitor?.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-900/40">Visitor type</p>
                <p className="font-medium text-brand-900 capitalize mt-0.5">{visitor?.visitorType?.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-brand-900/40">Expires at</p>
                <p className="font-medium text-brand-900 mt-0.5">{formatDateTime(visitor?.expiresAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Gate Pass (hidden) */}
      <div className="hidden">
        <div ref={printRef}>
          <div className="print-pass">
            <div className="pass-header">
              <h1>🔐 GATE PASS</h1>
              <p>Visitor Management System</p>
            </div>
            <div className="pass-body">
              <div className="pass-photo">
                {visitor?.photo
                  ? <img src={visitor?.photo} alt="visitor" />
                  : <div className="no-photo">👤</div>
                }
              </div>
              <div className="pass-details">
                <div className="pass-id-badge">{visitor?.passId}</div>
                <div className="pass-field"><label>Visitor Name</label><span>{visitor?.visitorName}</span></div>
                <div className="pass-field"><label>Contact</label><span>{visitor?.visitorContact}</span></div>
                <div className="pass-field"><label>Purpose</label><span>{visitor?.purpose}</span></div>
                <div className="pass-field"><label>Host</label><span>{visitor?.hostName}</span></div>
                <div className="pass-field"><label>Date</label><span>{formatDate(visitor?.expectedDate)}</span></div>
                {visitor?.timeIn && <div className="pass-field"><label>Check-In</label><span>{formatTime(visitor?.timeIn)}</span></div>}
              </div>
            </div>
            <div className="pass-footer">
              <div>
                <div className={`status-chip`}>{visitor?.status.toUpperCase()}</div>
                <div style={{marginTop: '3mm', fontSize: '8px', color: '#999'}}>
                  Generated: {formatDateTime(visitor?.createdAt)}
                </div>
              </div>
              <div className="pass-qr">
                <QRCodeSVG
                  value={JSON.stringify({ passId: visitor?.passId, id: visitor?._id })}
                  size={60}
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                />
                <p>Scan to verify</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}