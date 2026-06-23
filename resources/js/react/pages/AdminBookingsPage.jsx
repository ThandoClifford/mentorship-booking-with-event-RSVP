import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { approveAdminAppointment, declineAdminAppointment, getAdminAppointments, toErrorMessage } from '../api';
import { DataTable, EmptyState, SectionCard, StatusBadge } from '../components/DashboardComponents';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'declined', 'cancelled'];

export default function AdminBookingsPage() {
    const [appointments, setAppointments] = useState([]);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingId, setSavingId] = useState(null);

    const loadAppointments = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getAdminAppointments();
            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(toErrorMessage(err, 'Failed to load bookings'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const filteredAppointments = useMemo(() => {
        if (statusFilter === 'all') return appointments;
        return appointments.filter((appointment) => String(appointment.status || '').toLowerCase() === statusFilter);
    }, [appointments, statusFilter]);

    const handleAction = async (id, action) => {
        setSavingId(id);
        setError('');

        try {
            if (action === 'approve') await approveAdminAppointment(id);
            if (action === 'decline') await declineAdminAppointment(id);
            await loadAppointments();
        } catch (err) {
            setError(toErrorMessage(err, 'Unable to update booking status'));
        } finally {
            setSavingId(null);
        }
    };

    const rows = filteredAppointments.map((appointment) => [
        <span key="student" className="font-medium text-[var(--tma-text)]">{appointment.student?.name || '-'}</span>,
        <span key="mentor" className="text-[var(--tma-muted)]">{appointment.mentor?.name || 'Unassigned'}</span>,
        <span key="date" className="text-[var(--tma-muted)]">{appointment.time_slot?.date || '-'}</span>,
        <span key="time" className="text-[var(--tma-muted)]">{appointment.time_slot ? `${appointment.time_slot.start_time || '-'} - ${appointment.time_slot.end_time || '-'}` : '-'}</span>,
        <span key="status"><StatusBadge status={appointment.status} /></span>,
        <div key="actions" className="flex flex-wrap gap-2">
            {appointment.status === 'pending' ? (
                <>
                    <button
                        type="button"
                        disabled={savingId === appointment.id}
                        onClick={() => handleAction(appointment.id, 'approve')}
                        className="tma-btn tma-btn-primary text-xs"
                    >
                        {savingId === appointment.id ? 'Saving...' : 'Approve'}
                    </button>
                    <button
                        type="button"
                        disabled={savingId === appointment.id}
                        onClick={() => handleAction(appointment.id, 'decline')}
                        className="tma-btn tma-btn-destructive text-xs"
                    >
                        {savingId === appointment.id ? 'Saving...' : 'Reject'}
                    </button>
                </>
            ) : null}
            <Link to={`/admin/appointments/${appointment.id}`} className="tma-btn tma-btn-outline text-xs">
                View
            </Link>
        </div>,
    ]);

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--tma-border)] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--tma-text)]">Bookings</h1>
                        <p className="mt-2 text-sm text-[var(--tma-muted)]">Review pending booking requests and update status in real time.</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="flex items-center gap-2 text-sm text-[var(--tma-text)]">
                            <span>Status</span>
                            <select
                                className="rounded-xl border border-[var(--tma-border)] bg-white px-3 py-2 text-sm text-[var(--tma-text)]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                {STATUS_FILTERS.map((status) => (
                                    <option key={status} value={status}>{status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                ))}
                            </select>
                        </label>
                        <button type="button" onClick={loadAppointments} className="tma-btn tma-btn-outline text-sm">
                            Refresh
                        </button>
                    </div>
                </div>
                {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
            </div>

            <SectionCard title="Booking Requests" subtitle="Filter and act on student bookings.">
                {loading ? (
                    <div className="py-12 text-center text-sm text-[var(--tma-muted)]">Loading bookings...</div>
                ) : (
                    <DataTable headers={['Student', 'Mentor', 'Date', 'Time', 'Status', 'Actions']} rows={rows} emptyMessage="No bookings match this filter." />
                )}
            </SectionCard>

            {!loading && filteredAppointments.length === 0 && appointments.length > 0 ? (
                <EmptyState title="No bookings found" copy="Try a different filter or refresh to load the latest bookings." />
            ) : null}
        </div>
    );
}
