// API configuration
let API_PORT = localStorage.getItem('apiPort') || '5000';
export let API_URL = `http://localhost:${API_PORT}/api`;

// Function to update API port
export const updateApiPort = (port: string) => {
  localStorage.setItem('apiPort', port);
  API_PORT = port;
  API_URL = `http://localhost:${port}/api`;
};

// Function to detect server port
export const detectServerPort = async () => {
  try {
    // Try ports 5000-5010
    for (let port = 5000; port <= 5010; port++) {
      try {
        const response = await fetch(`http://localhost:${port}/api/server-port`, {
          signal: AbortSignal.timeout(1000) // 1 second timeout
        });
        if (response.ok) {
          const data = await response.json();
          updateApiPort(data.port.toString());
          return true;
        }
      } catch (err) {
        continue;
      }
    }
    console.error('Could not find server on any port between 5000-5010');
    return false;
  } catch (err) {
    console.error('Error detecting server port:', err);
    return false;
  }
};

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