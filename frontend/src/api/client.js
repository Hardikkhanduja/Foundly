const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const UPLOADS_URL = BASE_URL.replace('/api', '');

let onUnauthorized = null;

export function setOnUnauthorized(cb) {
  onUnauthorized = cb;
}

async function request(method, path, body = null, isMultipart = false) {
  const token = localStorage.getItem('token');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (body && !isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const options = { method, headers };
  if (body) {
    options.body = isMultipart ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, options);

    if (res.status === 401) {
      if (onUnauthorized) onUnauthorized();
      return { error: { message: 'Unauthorized. Please log in again.' } };
    }

    const data = await res.json();

    if (!res.ok) {
      return { error: { message: data.message || 'Something went wrong.' } };
    }

    return { data };
  } catch (err) {
    return { error: { message: 'Network error. Please check your connection.' } };
  }
}

// Auth
export const registerUser = (name, email, password) =>
  request('POST', '/auth/register', { name, email, password });

export const loginUser = (email, password) =>
  request('POST', '/auth/login', { email, password });

// Items
export const getItems = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, v);
  });
  const qs = query.toString();
  return request('GET', `/items${qs ? `?${qs}` : ''}`);
};

export const getItemById = (id) => request('GET', `/items/${id}`);
export const getItemStats = () => request('GET', '/items/stats');
export const createItem = (data) => request('POST', '/items', data);
export const updateItem = (id, data) => request('PUT', `/items/${id}`, data);
export const deleteItem = (id) => request('DELETE', `/items/${id}`);
export const getMyItems = () => request('GET', '/items/myitems');

// Claims
export const createClaim = (itemId, message) =>
  request('POST', '/claims', { item: itemId, message });

export const getItemClaims = (itemId) => request('GET', `/claims/item/${itemId}`);
export const getMyClaims = () => request('GET', '/claims/myclaims');
export const updateClaimStatus = (claimId, status) =>
  request('PUT', `/claims/${claimId}/status`, { status });

// Upload
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return request('POST', '/upload', formData, true);
};

export { UPLOADS_URL };

// Admin
export const getAdminStats = () => request('GET', '/admin/stats');
export const getAdminUsers = () => request('GET', '/admin/users');
export const deleteAdminUser = (id) => request('DELETE', `/admin/users/${id}`);
