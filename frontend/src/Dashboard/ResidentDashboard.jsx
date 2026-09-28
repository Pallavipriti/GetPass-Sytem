import React from 'react';

const ResidentDashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Resident Dashboard</h1>
      <p className="text-gray-700">
        Welcome to your dashboard! Here you can view your visitors, check statuses, and manage your resident account.
      </p>

      {/* Example section for future expansion */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold text-lg">Upcoming Visitors</h2>
          <p className="text-gray-600 mt-2">You have no visitors scheduled for today.</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold text-lg">Notifications</h2>
          <p className="text-gray-600 mt-2">No new notifications.</p>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;