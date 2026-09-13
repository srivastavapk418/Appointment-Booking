const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BASE_URL = RAW_URL.replace(/\/+$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // 204 No Content — no body to parse
  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: `Server returned status ${res.status}` };
  }

  if (!res.ok) throw data;
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
