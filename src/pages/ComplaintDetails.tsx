import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, ThumbsUp, MessageSquare, CheckCircle, Clock, Send } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { COMPLAINT_CATEGORIES } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../utils/date';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  text: string;
  author: {
    _id: string;
    name: string;
  };
  isAnonymous: boolean;
  createdAt: string;
}

const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const complaintResponse = await axios.get(`${API_URL}/complaints/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const commentsResponse = await axios.get(`${API_URL}/complaints/${id}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setComplaint(complaintResponse.data);
      setComments(commentsResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError('Failed to load complaint details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/complaints/${id}/vote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setComplaint((prev: any) => ({
        ...prev,
        votes: prev.votes + 1,
      }));
      
      toast.success('Vote recorded!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to vote. Please try again.');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/complaints/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setComplaint((prev: any) => ({
        ...prev,
        status: newStatus,
      }));
      
      toast.success(`Complaint marked as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status. Please try again.');
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    try {
      setSubmittingComment(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/complaints/${id}/comments`,
        {
          text: newComment,
          isAnonymous: isAnonymousComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setComments((prev) => [...prev, response.data]);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = COMPLAINT_CATEGORIES.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'in-progress':
        return 'badge-primary';
      case 'resolved':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-primary-500 mb-3"></div>
          <p className="text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        
        <div className="bg-error-50 p-6 rounded-lg text-error-700 flex items-center justify-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        
        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 flex items-center justify-center">
          <p>Complaint not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-primary-600 hover:text-primary-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className={`badge ${getStatusBadgeClass(complaint.status)} flex items-center`}>
                <Clock className="w-3 h-3 mr-1" />
                {getStatusText(complaint.status)}
              </span>
              <span className="badge badge-secondary flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                {getCategoryName(complaint.category)}
              </span>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleVote}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span>{complaint.votes}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{complaint.title}</h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDistanceToNow(complaint.createdAt)}</span>
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-line">{complaint.description}</p>
          </div>
          
          {user?.role === 'faculty' && complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleStatusChange('in-progress')}
                className={`btn ${
                  complaint.status === 'in-progress' ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                Mark as In Progress
              </button>
              <button
                onClick={() => handleStatusChange('resolved')}
                className="btn btn-success flex items-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark as Resolved
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-gray-500" />
            Comments ({comments.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {comments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.isAnonymous ? 'Anonymous' : comment.author.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={submitComment} className="p-6 bg-gray-50">
          <div className="mb-4">
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment"
              rows={3}
              className="input h-auto"
              placeholder="Add your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-3 sm:mb-0">
              <input
                id="anonymous-comment"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={isAnonymousComment}
                onChange={(e) => setIsAnonymousComment(e.target.checked)}
              />
              <label htmlFor="anonymous-comment" className="ml-2 block text-sm text-gray-700">
                Post as anonymous
              </label>
            </div>
            
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className={`btn btn-primary flex items-center ${
                submittingComment || !newComment.trim() ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Send className="h-4 w-4 mr-2" />
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintDetails;