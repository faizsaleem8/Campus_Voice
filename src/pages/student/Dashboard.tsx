import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import ComplaintCard from '../../components/ComplaintCard';
import CategoryFilter from '../../components/CategoryFilter';
import StatusFilter from '../../components/StatusFilter';
import SortOptions from '../../components/SortOptions';
import toast from 'react-hot-toast';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [previousStatuses, setPreviousStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchComplaints();
  }, [selectedCategory, selectedStatus, sortBy]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (selectedStatus) queryParams.append('status', selectedStatus);
      if (sortBy) queryParams.append('sort', sortBy);
      
      const response = await axios.get(`${API_URL}/complaints?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Initialize previous statuses
      const initialPreviousStatuses: Record<string, string> = {};
      response.data.forEach((complaint: any) => {
        initialPreviousStatuses[complaint._id] = complaint.status;
      });
      setPreviousStatuses(initialPreviousStatuses);
      
      setComplaints(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again later.');
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (complaintId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/complaints/${complaintId}/vote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update the complaint's vote count in the local state
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint: any) =>
          complaint._id === complaintId
            ? { ...complaint, votes: complaint.votes + 1 }
            : complaint
        )
      );
      
      toast.success('Vote recorded!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to vote. Please try again.');
    }
  };

  const handleComplaintClick = (complaintId: string) => {
    navigate(`/complaints/${complaintId}`);
  };

  const filteredComplaints = complaints.filter((complaint: any) => {
    return complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Complaints Dashboard</h1>
        <Link to="/new-complaint" className="btn btn-primary flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" />
          New Complaint
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onChange={setSelectedCategory}
            />
            <StatusFilter
              selectedStatus={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {filteredComplaints.length} {filteredComplaints.length === 1 ? 'complaint' : 'complaints'} found
            </div>
            <SortOptions sortBy={sortBy} onChange={setSortBy} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse-slow flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary-500 mb-3"></div>
                <p className="text-gray-600">Loading complaints...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-error-50 p-4 rounded-md text-error-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <p className="text-gray-600 mb-4">No complaints found matching your criteria.</p>
              <Link to="/new-complaint" className="btn btn-primary">
                Submit a new complaint
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
              {filteredComplaints.map((complaint: any) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'in-progress':
                      return 'border-blue-500 bg-blue-50';
                    case 'pending':
                      return 'border-yellow-500 bg-yellow-50';
                    case 'resolved':
                      return 'border-green-500 bg-green-50';
                    case 'rejected':
                      return 'border-red-500 bg-red-50';
                    default:
                      return 'border-gray-200 bg-white';
                  }
                };

                const formatTimeAgo = (date: string) => {
                  const now = new Date();
                  const complaintDate = new Date(date);
                  const diffInSeconds = Math.floor((now.getTime() - complaintDate.getTime()) / 1000);
                  
                  if (diffInSeconds < 60) {
                    return `${diffInSeconds} sec ago`;
                  }
                  
                  const diffInMinutes = Math.floor(diffInSeconds / 60);
                  if (diffInMinutes < 60) {
                    return `${diffInMinutes} mins ago`;
                  }
                  
                  const diffInHours = Math.floor(diffInMinutes / 60);
                  if (diffInHours < 24) {
                    return `${diffInHours} hrs ago`;
                  }
                  
                  const diffInDays = Math.floor(diffInHours / 24);
                  if (diffInDays < 7) {
                    return `${diffInDays} days ago`;
                  }
                  
                  return complaintDate.toLocaleDateString();
                };

                return (
                  <div 
                    key={complaint._id} 
                    className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 ${getStatusColor(complaint.status)} flex flex-col h-full`}
                    onClick={() => handleComplaintClick(complaint._id)}
                  >
                    <div className="p-6 flex-grow">
                      <ComplaintCard
                        complaint={complaint}
                        onVote={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleVote(complaint._id);
                        }}
                        previousStatus={previousStatuses[complaint._id]}
                        formatTimeAgo={formatTimeAgo}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;