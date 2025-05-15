import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortOptionsProps {
  sortBy: string;
  onChange: (sortBy: string) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({ sortBy, onChange }) => {
  const options = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'most-votes', label: 'Most Votes' },
    { value: 'least-votes', label: 'Least Votes' },
  ];

  return (
    <div className="flex items-center mb-6">
      <ArrowUpDown className="h-4 w-4 text-gray-400 mr-2" />
      <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 mr-2">
        Sort by:
      </label>
      <select
        id="sort-by"
        value={sortBy}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortOptions;