import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect ke halaman login jika tidak ada token
    return <Navigate to="/login" replace />;
  }

  return children;
} 