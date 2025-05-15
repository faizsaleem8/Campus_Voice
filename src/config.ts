// API configuration
export const API_URL = 'http://localhost:5000/api';

// Complaint Categories
export const COMPLAINT_CATEGORIES = [
  { id: 'academics', name: 'Academics' },
  { id: 'infrastructure', name: 'Infrastructure' },
  { id: 'faculty', name: 'Faculty' },
  { id: 'administration', name: 'Administration' },
  { id: 'hostel', name: 'Hostel' },
  { id: 'canteen', name: 'Canteen' },
  { id: 'library', name: 'Library' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'labs', name: 'Labs & Equipment' },
  { id: 'other', name: 'Other' },
];

// Complaint Status
export const COMPLAINT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};