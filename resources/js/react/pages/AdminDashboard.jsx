import React, { useEffect, useState } from 'react';
import { getAdminCentreEvents, getAdminCentreEventRsvps, getAdminCentreEventRsvpsExport, deleteAdminCentreEvent } from '../api';
import PublicNavbar from '../components/PublicNavbar';
import SiteFooter from '../components/SiteFooter';

export default function AdminDashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [rsvpData, setRsvpData] = useState(null);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const loadEvents = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAdminCentreEvents();
            setEvents(Array.isArray(data) ? data : []);
        } catch {
            setError('Unable to load events.');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleSelectEvent = async (eventId) => {
        setSelectedEventId(eventId);
        setRsvpData(null);
        setRsvpLoading(true);
        try {
            const data = await getAdminCentreEventRsvps(eventId);
            setRsvpData(data || null);
        } catch {
            setRsvpData(null);
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleExport = async (eventId, eventTitle) => {
        setExporting(true);
        try {
            const blob = await getAdminCentreEventRsvpsExport(eventId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeName = String(eventTitle || 'Event').replace(/[^a-z0-9]/gi, '_');
            link.download = `UMP-CFERI_${safeName}_RSVP_List.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Unable to export RSVP list. Please try again later.');
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await deleteAdminCentreEvent(id);
            await loadEvents();
            if (selectedEventId === id) {
                setSelectedEventId(null);
                setRsvpData(null);
            }
        } catch {
            alert('Unable to delete event. Please try again later.');
        }
    };

    const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId));

    return (
        <div className="ump-public-page">
            <PublicNavbar user={null} />
            <main className="container mx-auto py-8" style={{ maxWidth: '1200px' }}>
                <h1 className="text-3xl font-bold mb-6 text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 mb-8">Manage events and view RSVP lists</p>

                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-slate-900">Events</h2>
                        {loading ? (
                            <p className="text-slate-600">Loading events...</p>
                        ) : events.length === 0 ? (
                            <p className="text-slate-600">No events created yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {events.map((event) => (
                                    <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{event.title}</h3>
                                                <p className="text-sm text-slate-600">{event.event_date} • {String(event.event_time).slice(0, 5)}</p>
                                                <p className="text-sm text-slate-500">{event.venue}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectEvent(event.id)}
                                                    className="rounded-full bg-[#09203F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b1f45]"
                                                >
                                                    View RSVPs
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(event.id)}
                                                    className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4 text-slate-900">RSVP List</h2>
                        {!selectedEventId ? (
                            <p className="text-slate-600">Select an event to view its RSVP list.</p>
                        ) : rsvpLoading ? (
                            <p className="text-slate-600">Loading RSVPs...</p>
                        ) : rsvpData ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{rsvpData.event?.title}</h3>
                                        <p className="text-sm text-slate-600">
                                            {rsvpData.count} RSVP{rsvpData.count === 1 ? '' : 's'}
                                            {typeof rsvpData.capacity === 'number' && rsvpData.capacity > 0 && ` / ${rsvpData.capacity}`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleExport(selectedEventId, rsvpData.event?.title)}
                                        disabled={exporting}
                                        className="rounded-full bg-[#09203F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b1f45] disabled:opacity-50"
                                    >
                                        {exporting ? 'Exporting...' : 'Download RSVP List'}
                                    </button>
                                </div>

                                {rsvpData.rsvps.length === 0 ? (
                                    <p className="text-sm text-slate-600">No RSVPs yet.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="pb-2 font-semibold text-slate-700">Name</th>
                                                    <th className="pb-2 font-semibold text-slate-700">Student Number</th>
                                                    <th className="pb-2 font-semibold text-slate-700">Email</th>
                                                    <th className="pb-2 font-semibold text-slate-700">Phone</th>
                                                    <th className="pb-2 font-semibold text-slate-700">Faculty</th>
                                                    <th className="pb-2 font-semibold text-slate-700">RSVP At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rsvpData.rsvps.map((rsvp) => (
                                                    <tr key={rsvp.id} className="border-b border-slate-100">
                                                        <td className="py-2 text-slate-900">{rsvp.full_name}</td>
                                                        <td className="py-2 text-slate-600">{rsvp.student_number}</td>
                                                        <td className="py-2 text-slate-600">{rsvp.email}</td>
                                                        <td className="py-2 text-slate-600">{rsvp.phone || '-'}</td>
                                                        <td className="py-2 text-slate-600">{rsvp.faculty_programme || '-'}</td>
                                                        <td className="py-2 text-slate-600">{rsvp.created_at ? new Date(rsvp.created_at).toLocaleString() : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-slate-600">Unable to load RSVPs.</p>
                        )}
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
