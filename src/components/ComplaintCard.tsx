import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from '../utils/date';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';

interface ComplaintCardProps {
  complaint: {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    votes: number;
    createdAt: string;
    comments: number;
    studentName: string;
    author: string;
  };
  onVote?: (e: React.MouseEvent) => void;
  showActions?: boolean;
  previousStatus?: string;
  onStatusChange?: (newStatus: string) => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ 
  complaint, 
  onVote,
  showActions = true,
  previousStatus,
  onStatusChange
}) => {
  const { _id, title, description, category, status, votes, createdAt, comments, studentName, author } = complaint;
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    // Only add notification if the current user is the author of the complaint
    if (previousStatus && previousStatus !== status && user && user.id === author) {
      addNotification({
        userId: user.id,
        studentName,
        complaintTitle: title,
        newStatus: status,
        timestamp: new Date().toISOString(),
      });
    }
  }, [status, previousStatus, studentName, title, addNotification, user, author]);

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

  return (
    <div className="card hover:border-primary-300 transition-all duration-300">
      <div className="p-1">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3>
              {title}
            </h3>
            <div className="flex items-center mt-1 space-x-3">
              <span className={`badge ${getStatusBadgeClass(status)} flex items-center`}>
                <Clock className="w-3 h-3 mr-1" />
                {getStatusText(status)}
              </span>
              <span className="badge badge-secondary flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                {category}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDistanceToNow(createdAt)}
            </span>
            <span className="flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
              <Link to={`/complaints/${_id}`} className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>
                  {comments} comments
                </span>
              </Link>
            </span>
          </div>
          
          
            <button 
              onClick={onVote}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span>{votes}</span>
            </button>
         
        </div>

        {/* Status Change Dropdown for Faculty */}
        {onStatusChange && (
          <div className="mt-4">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;