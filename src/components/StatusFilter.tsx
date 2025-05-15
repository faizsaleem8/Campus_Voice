import React from 'react';
import { COMPLAINT_STATUS } from '../config';

interface StatusFilterProps {
  selectedStatus: string;
  onChange: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatus, onChange }) => {
  const statuses = [
    { id: '', label: 'All' },
    { id: COMPLAINT_STATUS.PENDING, label: 'Pending' },
    { id: COMPLAINT_STATUS.IN_PROGRESS, label: 'In Progress' },
    { id: COMPLAINT_STATUS.RESOLVED, label: 'Resolved' },
    { id: COMPLAINT_STATUS.REJECTED, label: 'Rejected' },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status</h3>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => onChange(status.id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedStatus === status.id
                ? 'bg-primary-100 text-primary-800 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;