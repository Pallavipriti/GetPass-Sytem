import { format, parseISO, isToday, isTomorrow, differenceInDays, differenceInHours, formatDistanceToNow } from 'date-fns';


export const formatDateTime = (date, formatStr = 'MMM dd, yyyy hh:mm a') => {
  if (!date) return '—';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};


export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '—';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};


export const formatTime = (date, formatStr = 'hh:mm a') => {
  if (!date) return '—';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
};


export const getRelativeTime = (date) => {
  if (!date) return '—';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Relative time error:', error);
    return 'Invalid Date';
  }
};


export const isDateToday = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isToday(dateObj);
  } catch (error) {
    console.error('Date check error:', error);
    return false;
  }
};


export const isDateTomorrow = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isTomorrow(dateObj);
  } catch (error) {
    console.error('Date check error:', error);
    return false;
  }
};


export const getDaysDifference = (date1, date2 = new Date()) => {
  if (!date1) return 0;
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInDays(d1, d2);
  } catch (error) {
    console.error('Days difference error:', error);
    return 0;
  }
};


export const getHoursDifference = (date1, date2 = new Date()) => {
  if (!date1) return 0;
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInHours(d1, d2);
  } catch (error) {
    console.error('Hours difference error:', error);
    return 0;
  }
};


export const formatDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '—';
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    const hours = differenceInHours(end, start);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  } catch (error) {
    console.error('Duration formatting error:', error);
    return '—';
  }
};


export const formatPhoneNumber = (phone) => {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+91 ${cleaned.slice(1, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};


export const formatPassId = (passId) => {
  if (!passId) return '—';
  return passId.toUpperCase();
};


export const truncateText = (text, length = 50) => {
  if (!text) return '—';
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};


export const capitalizeWords = (text) => {
  if (!text) return '—';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};


export const generatePassId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'GP-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};


export const isValidPassId = (passId) => {
  if (!passId) return false;
  const passIdRegex = /^GP-[A-Z0-9]{8}$/;
  return passIdRegex.test(passId.toUpperCase());
};


export const getStatusConfig = (status) => {
  const statusMap = {
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
  return statusMap[status] || statusMap['pre-approved'];
};


export const getPurposeColor = (purpose) => {
  const purposeColors = {
    'Meeting': '#3b82f6',
    'Delivery': '#10b981',
    'Interview': '#f59e0b',
    'Maintenance': '#ef4444',
    'Guest': '#8b5cf6',
    'Other': '#6b7280',
  };
  return purposeColors[purpose] || '#6b7280';
};


export const downloadCSV = (data, filename = 'export') => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ];
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};


export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};


export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};


export const getTimeSlots = (intervalMinutes = 30) => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = new Date(2000, 0, 1, hour, minute);
      slots.push(format(time, 'hh:mm a'));
    }
  }
  return slots;
};


export const getDateRange = (range) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      return null;
  }
  
  return { start, end };
};


export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};


export const calculateVisitDuration = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return 0;
  try {
    const checkIn = typeof checkInTime === 'string' ? parseISO(checkInTime) : checkInTime;
    const checkOut = typeof checkOutTime === 'string' ? parseISO(checkOutTime) : checkOutTime;
    return Math.round((checkOut - checkIn) / (1000 * 60));
  } catch (error) {
    console.error('Duration calculation error:', error);
    return 0;
  }
};


export const formatVisitDuration = (minutes) => {
  if (!minutes) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};


export const isPassExpired = (expectedDate) => {
  if (!expectedDate) return false;
  try {
    const expected = typeof expectedDate === 'string' ? parseISO(expectedDate) : expectedDate;
    const now = new Date();
    return expected < now;
  } catch (error) {
    console.error('Expiry check error:', error);
    return false;
  }
};


export const getInitials = (name) => {
  if (!name) return '?';
  const words = name.split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};


export const stringToColor = (str) => {
  if (!str) return '#3b82f6';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};