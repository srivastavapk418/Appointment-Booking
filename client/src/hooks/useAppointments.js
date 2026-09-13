import { useState, useEffect, useCallback } from 'react';
import {
  fetchAppointments,
  createAppointment,
  updateStatus,
  deleteAppointment,
} from '../services/api';

export default function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addAppointment = async (formData) => {
    const created = await createAppointment(formData);
    // Optimistic: prepend to list
    setAppointments((prev) => [created, ...prev]);
    return created;
  };

  const changeStatus = async (id, status) => {
    const updated = await updateStatus(id, status);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? updated : a))
    );
    return updated;
  };

  const removeAppointment = async (id) => {
    await deleteAppointment(id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    appointments,
    loading,
    error,
    addAppointment,
    changeStatus,
    removeAppointment,
    reload: load,
  };
}
