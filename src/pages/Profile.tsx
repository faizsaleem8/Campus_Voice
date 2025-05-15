import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import ComplaintCard from '../components/ComplaintCard';
import StatusFilter from '../components/StatusFilter';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchUserComplaints();
  }, [selectedStatus]);

  const fetchUserComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (selectedStatus) queryParams.append('status', selectedStatus);
      
      const response = await axios.get(`${API_URL}/complaints/user?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setComplaints(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user complaints:', err);
      setError('Failed to load your complaints. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <span className="badge badge-primary mt-2">
                {user?.role === 'student' ? 'Student' : 'Faculty'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'student' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Complaints</h2>
            <Link to="/new-complaint" className="btn btn-primary">
              New Complaint
            </Link>
          </div>

          <div className="mb-6">
            <StatusFilter selectedStatus={selectedStatus} onChange={setSelectedStatus} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse-slow flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary-500 mb-3"></div>
                <p className="text-gray-600">Loading your complaints...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-error-50 p-4 rounded-md text-error-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
              <p className="text-gray-600 mb-4">
                You haven't submitted any complaints yet.
              </p>
              <Link to="/new-complaint" className="btn btn-primary">
                Submit your first complaint
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint: any) => (
                <ComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;