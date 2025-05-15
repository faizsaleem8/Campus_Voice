import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle } from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../../config';
import axios from 'axios';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const ComplaintForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_URL}/complaints`,
        {
          title,
          description,
          category,
          isAnonymous,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success('Complaint submitted successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit a New Complaint</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center bg-blue-50 p-4 rounded-md mb-6">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            <strong>Your privacy matters.</strong> When "Anonymous" is selected, your identity will be hidden from other students and faculty. Only your submitted complaints will be visible on the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="label">
              Title <span className="text-error-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="input"
              placeholder="Brief title for your complaint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {title.length}/100 characters
            </div>
          </div>

          <div>
            <label htmlFor="category" className="label">
              Category <span className="text-error-500">*</span>
            </label>
            <select
              id="category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description <span className="text-error-500">*</span>
            </label>
            <textarea
              id="description"
              className="input h-40"
              placeholder="Provide details about your complaint. Be specific and include relevant information."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              required
            ></textarea>
            <div className="mt-1 text-right text-xs text-gray-500">
              {description.length}/2000 characters
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="anonymous"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
              Submit as anonymous (recommended)
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-ghost mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn btn-primary flex items-center ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;