import React from 'react';

const statusConfig = {
  'pre-approved': {
    label: 'Pre-Approved',
    color: 'bg-blue-100 text-blue-800',
    icon: '✓',
  },
  'checked-in': {
    label: 'Checked In',
    color: 'bg-green-100 text-green-800',
    icon: '●',
  },
  'checked-out': {
    label: 'Checked Out',
    color: 'bg-gray-100 text-gray-800',
    icon: '○',
  },
  'expired': {
    label: 'Expired',
    color: 'bg-red-100 text-red-800',
    icon: '!',
  },
  'rejected': {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: '✗',
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status] || statusConfig['pre-approved'];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;