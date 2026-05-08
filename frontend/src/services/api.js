import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const handleError = (error) => {
  console.error('API Error:', error.response?.data || error.message);
  throw error;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const signup = async (userData) => {
  const { data } = await api.post('/auth/signup', userData);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const getUsers = async () => {
  const { data } = await api.get('/users/');
  return data;
};

export const createUser = async (userData) => {
  const { data } = await api.post('/users/', userData);
  return data;
};

export const getEmployees = async (department = null) => {
  const params = department ? { department } : {};
  const { data } = await api.get('/employees/', { params });
  return data;
};

export const createEmployee = async (employeeData) => {
  const { data } = await api.post('/employees/', employeeData);
  return data;
};

export const getBonuses = async (status = null, employeeId = null) => {
  const params = {};
  if (status) params.status = status;
  if (employeeId) params.employee_id = employeeId;
  const { data } = await api.get('/bonuses/', { params });
  return data;
};

export const createBonus = async (bonusData, userId) => {
  const { data } = await api.post(`/bonuses/?user_id=${userId}`, bonusData);
  return data;
};

export const validateBonus = async (bonusId, validationData, step) => {
  const { data } = await api.post(`/bonuses/${bonusId}/validate?step=${step}`, validationData);
  return data;
};

export default api;
