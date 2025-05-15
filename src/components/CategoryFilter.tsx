import React from 'react';
import { COMPLAINT_CATEGORIES } from '../config';

interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onChange }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange('')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedCategory === ''
              ? 'bg-primary-100 text-primary-800 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        
        {COMPLAINT_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onChange(category.id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary-100 text-primary-800 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;