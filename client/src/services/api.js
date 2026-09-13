const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // 204 No Content — no body to parse
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw data; // throw the error object so callers can inspect it
  return data;
}

export const fetchAppointments = () =>
  request('/api/appointments');

export const createAppointment = (body) =>
  request('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateStatus = (id, status) =>
  request(`/api/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const deleteAppointment = (id) =>
  request(`/api/appointments/${id}`, { method: 'DELETE' });
