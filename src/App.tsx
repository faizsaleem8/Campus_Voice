import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { detectServerPort } from './config';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import FacultyDashboard from './pages/faculty/Dashboard';
import Profile from './pages/Profile';
import ComplaintForm from './pages/student/ComplaintForm';
import ComplaintDetails from './pages/ComplaintDetails';
import NotFound from './pages/NotFound';

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    detectServerPort();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary-500 mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      
      {/* Protected routes */}
      <Route element={<Layout />}>
        <Route path="/" element={
          user ? (
            user.role === 'student' ? 
              <Navigate to="/dashboard" /> : 
              <Navigate to="/faculty/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        } />

        {/* Student routes */}
        <Route path="/dashboard" element={
          user && user.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/new-complaint" element={
          user && user.role === 'student' ? <ComplaintForm /> : <Navigate to="/login" />
        } />
        
        {/* Faculty routes */}
        <Route path="/faculty/dashboard" element={
          user && user.role === 'faculty' ? <FacultyDashboard /> : <Navigate to="/login" />
        } />
        
        {/* Common routes */}
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/complaints/:id" element={user ? <ComplaintDetails /> : <Navigate to="/login" />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;