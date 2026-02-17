import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATIC_BASE = process.env.REACT_APP_STATIC_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
});

// Presentation APIs
export const uploadPresentation = async (formData) => {
  const response = await api.post('/presentations/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAllPresentations = async () => {
  const response = await api.get('/presentations');
  return response.data;
};

export const getPresentation = async (id) => {
  const response = await api.get(`/presentations/${id}`);
  return response.data;
};

export const addActivity = async (presentationId, activityData) => {
  const response = await api.post(`/presentations/${presentationId}/activities`, activityData);
  return response.data;
};

export const removeActivity = async (presentationId, activityId) => {
  const response = await api.delete(`/presentations/${presentationId}/activities/${activityId}`);
  return response.data;
};

export const deletePresentation = async (presentationId) => {
  const response = await api.delete(`/presentations/${presentationId}`);
  return response.data;
};

// Session APIs
export const createSession = async (presentationId, teacherName) => {
  const response = await api.post('/sessions/create', { presentationId, teacherName });
  return response.data;
};

export const joinSession = async (code, studentName) => {
  const response = await api.post('/sessions/join', { code, studentName });
  return response.data;
};

export const getSession = async (code) => {
  const response = await api.get(`/sessions/${code}`);
  return response.data;
};

// Helper to get full image URL
// If imagePath is already a full URL (Cloudinary), return as-is
// Otherwise prepend the static base URL (local dev)
export const getSlideImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${STATIC_BASE}${imagePath}`;
};

export default api;
