import { useAuth } from "../../context/AuthContext";
import {  Navigate } from 'react-router-dom';

// components/Layout/ProtectedRoute.jsx
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // 👇 Wait for auth to finish before deciding anything
  if (loading) return <div className="flex font-100 items-center justify-center h-screen loader" ><p className="text-2xl font-bold loader" >Loading...</p></div>; // or a spinner

  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
export default ProtectedRoute;