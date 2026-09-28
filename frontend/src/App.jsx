import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Auth/Login';
import GuardDashboard from './Dashboard/GuardDashboard';
import ResidentDashboard from './Dashboard/ResidentDashboard';
import AddVisitor from './components/Visitors/AddVisitor';
import VisitorList from './components/Visitors/VisitorList';
import Analytics from './components/Analytics/Analytics';
import Sidebar from './components/Layout/Sidebar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminDashboard from './Dashboard/AdminDashboard';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScanQR from './components/Scanner/ScanQR';
import ManageUsers from './components/Manageusers';
import VisitorDetail from './components/Visitors/VisitorDetail';
import ResidentList from './components/Residents/ResidentsList';
import GuardList from './components/Guards/GuardsList';
import Register from './components/Register';
import ResidentDetail from './components/Residents/ResidentDetail';
import GuardDetail from './components/Guards/GuardDetail';

const AppContent = () => {
  const { user } = useAuth();
  console.log("user=====>",user?.role)

  const getDashboard = () => {
    switch (user?.role) {
      case 'admin':
        console.log("adminnnn")
        return <AdminDashboard/>;
      case 'guard':
        console.log("guarddddddd")

        return <GuardDashboard/>;
      case 'resident':
        console.log("residenttttt")
        return <ResidentDashboard/>;
      default:
        console.log("defaulttt");
        return <Navigate to="/login" />;
    }
  };

  return (
   <Router>
  <Toaster position="top-right" />

  <div className="flex min-h-screen bg-blue-100">
    
    {/* Sidebar (Left) */}
    {user && <Sidebar />}

    {/* Main Content (Right) */}
    <div className="flex-1">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {getDashboard()}
            </ProtectedRoute>
          }
        />
         <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-visitor"
          element={
            <ProtectedRoute allowedRoles={['admin', 'guard']}>
              <AddVisitor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/visitors"
          element={
            <ProtectedRoute allowedRoles={['admin', 'guard', 'resident']}>
              <VisitorList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'guard', 'resident']}>
              <VisitorDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scan-qr"
          element={
            <ProtectedRoute allowedRoles={['admin','guard']}>
              <ScanQR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/residents"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ResidentList />
            </ProtectedRoute>
          }
        />
         <Route
          path="/residents/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'guard', 'resident']}>
              <ResidentDetail />
            </ProtectedRoute>
          }
        />
            <Route
          path="/guards"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GuardList />
            </ProtectedRoute>
          }
        />
         <Route
          path="/guards/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'guard', 'resident']}>
              <GuardDetail />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/add-resident"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </div>

  </div>
</Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;