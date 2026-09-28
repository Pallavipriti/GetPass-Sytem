import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, LogIn, LogOut, X, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVisitors } from '../../hooks/useVisitors';
import StatusBadge from '../common/StatusBadge';

export default function ScanQR() {
  const navigate = useNavigate();
  const { scanPass, checkIn, checkOut } = useVisitors();
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (passId) => {
    if (!passId.trim()) {
      toast.error('Please enter a Pass ID');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const visitor = await scanPass(passId.trim());
      console.log("visitor",visitor);
      setResult(visitor?.visitor);
    } catch (err) {
      console.error("Scan error", err);
      setError(err.response?.data?.message || 'Pass not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!result) return;
    
    try {
      const updated = await checkIn(result._id);
      setResult(updated);
      toast.success(`${result.visitorName} checked in successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    if (!result) return;
    
    try {
      const updated = await checkOut(result._id);
      setResult(updated);
      toast.success(`${result.visitorName} checked out successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-sm text-gray-600 mt-1">Scan or enter a pass ID to verify visitor</p>
      </div>

      {/* Manual Search */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
          <QrCode className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            QR camera scanning requires a native device app. Use manual Pass ID search below, or integrate with a hardware QR scanner.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Pass ID
          </label>
          <div className="flex gap-2">
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(manualId)}
              placeholder="GP-XXXXXXXX"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={() => handleSearch(manualId)}
              disabled={loading || !manualId}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 rounded-lg p-5 flex items-start gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Pass Not Found</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-5 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            {result.photo ? (
              <img 
                src={result.photo} 
                alt={result.name} 
                className="w-16 h-20 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-3xl border border-gray-200">
                👤
              </div>
            )}
            <div className="flex-1">
              <p className="text-xl font-bold text-gray-900">{result.name}</p>
              <p className="text-sm text-gray-600">{result.phone}</p>
              <p className="font-mono text-xs text-blue-600 mt-1">{result.passId}</p>
            </div>
          </div>
            <StatusBadge  status={result.status} />
          </div>

          

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Purpose</p>
              <p className="font-semibold text-gray-900 mt-1">{result.purpose || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Host</p>
              <p className="font-semibold text-gray-900 mt-1">{result.hostName || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Department</p>
              <p className="font-semibold text-gray-900 mt-1">{result.hostDepartment || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Expected Date</p>
              <p className="font-semibold text-gray-900 mt-1">{formatDate(result.expectedDate)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {result.status === 'pre-approved' && (
              <button 
                onClick={handleCheckIn} 
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> 
                Check In
              </button>
            )}
            {result.status === 'checked-in' && (
              <button 
                onClick={handleCheckOut} 
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> 
                Check Out
              </button>
            )}
            {/* <button 
              onClick={() => navigate(`/visitors/${result._id}`)} 
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              View Full Pass
            </button> */}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!result && !error && (
        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
          <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Enter a Pass ID above to find a visitor
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Example: GP-A1B2C3D4
          </p>
        </div>
      )}
    </div>
  );
}