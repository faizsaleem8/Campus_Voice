import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from '../utils/date';

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
  };
  onVote?: () => void;
  showActions?: boolean;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ 
  complaint, 
  onVote,
  showActions = true
}) => {
  const { _id, title, description, category, status, votes, createdAt, comments } = complaint;
  
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
      <div className="p-5">
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
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDistanceToNow(createdAt)}
            </span>
            <span className="flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
              <Link to={`/complaints/${_id}`} className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>
                  {comments} {comments === 1 ? 'comment' : 'comments'}
                </span>
              </Link>
            </span>

          </div>
          
          {showActions && (
            <button 
              onClick={onVote}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span>{votes}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;