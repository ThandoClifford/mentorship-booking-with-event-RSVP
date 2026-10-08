import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    createAdminAnnouncement,
    createAdminCentreEvent,
    deleteAdminAnnouncement,
    getAdminAppointments,
    getAdminCentreEvents,
    getAdminCentreEventRsvps,
    getAdminCentreEventRsvpsExport,
    getAdminAnnouncements,
    getAdminMentorAvailability,
    getAdminMentors,
    getPendingMentorVerifications,
    deleteAdminCentreEvent,
    verifyMentor,
} from '../api';
import SiteFooter from '../components/SiteFooter';

const EMPTY_EVENT_FORM = {
    event_title: '',
    event_date: '',
    event_time: '',
    end_time: '',
    event_venue: '',
    event_category: '',
    description: '',
    capacity: '',
    registration_deadline: '',
    image: '',
};

const EMPTY_ANNOUNCEMENT_FORM = {
    title: '',
    type: '',
    message: '',
    published_on: new Date().toISOString().slice(0, 10),
};

export default function AdminDashboard() {
    const { hash } = useLocation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingMentors, setPendingMentors] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [sectionErrors, setSectionErrors] = useState({});
    const [sectionLoading, setSectionLoading] = useState(true);
    const [verifyingMentorId, setVerifyingMentorId] = useState('');
    const [selectedAvailabilityMentor, setSelectedAvailabilityMentor] = useState('');
    const [mentorAvailability, setMentorAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [announcementForm, setAnnouncementForm] = useState(EMPTY_ANNOUNCEMENT_FORM);
    const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
    const [announcementMessage, setAnnouncementMessage] = useState('');
    const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
    const [eventFormOpen, setEventFormOpen] = useState(false);
    const [eventSubmitting, setEventSubmitting] = useState(false);
    const [eventFormError, setEventFormError] = useState('');
    const [eventFormSuccess, setEventFormSuccess] = useState('');
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

    useEffect(() => {
        let active = true;
        setSectionLoading(true);
        Promise.allSettled([
            getPendingMentorVerifications(),
            getAdminMentors(),
            getAdminAppointments(),
            getAdminAnnouncements(),
        ]).then((results) => {
            if (!active) return;
            const errors = {};
            const [pendingResult, mentorsResult, appointmentsResult, announcementsResult] = results;
            if (pendingResult.status === 'fulfilled') setPendingMentors(pendingResult.value);
            else errors.verification = 'Unable to load pending mentor verifications.';
            if (mentorsResult.status === 'fulfilled') setMentors(mentorsResult.value);
            else errors.mentors = 'Unable to load mentors.';
            if (appointmentsResult.status === 'fulfilled') setAppointments(appointmentsResult.value);
            else errors.appointments = 'Unable to load appointments.';
            if (announcementsResult.status === 'fulfilled') setAnnouncements(announcementsResult.value);
            else errors.announcements = 'Unable to load announcements.';
            setSectionErrors(errors);
            setSectionLoading(false);
        });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!hash) return;
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [hash]);

    const handleEventFieldChange = (event) => {
        const { name, value } = event.target;
        setEventForm((current) => ({ ...current, [name]: value }));
    };

    const handleVerifyMentor = async (mentorId) => {
        setVerifyingMentorId(mentorId);
        setSectionErrors((current) => ({ ...current, verification: '' }));
        try {
            await verifyMentor(mentorId);
            setPendingMentors((current) => current.filter((mentor) => mentor.id !== mentorId));
            const updatedMentors = await getAdminMentors();
            setMentors(updatedMentors);
        } catch (err) {
            setSectionErrors((current) => ({
                ...current,
                verification: err?.response?.data?.message || 'Unable to verify this mentor.',
            }));
        } finally {
            setVerifyingMentorId('');
        }
    };

    const handleViewAvailability = async (mentorId) => {
        setSelectedAvailabilityMentor(mentorId);
        setAvailabilityLoading(true);
        setSectionErrors((current) => ({ ...current, availability: '' }));
        try {
            const data = await getAdminMentorAvailability(mentorId);
            setMentorAvailability(data);
        } catch (err) {
            setMentorAvailability([]);
            setSectionErrors((current) => ({
                ...current,
                availability: err?.response?.data?.message || 'Unable to load this mentor’s availability.',
            }));
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const handleCreateAnnouncement = async (event) => {
        event.preventDefault();
        setAnnouncementSubmitting(true);
        setAnnouncementMessage('');
        setSectionErrors((current) => ({ ...current, announcements: '' }));
        try {
            const created = await createAdminAnnouncement(announcementForm);
            setAnnouncements((current) => [created, ...current]);
            setAnnouncementForm({ ...EMPTY_ANNOUNCEMENT_FORM, published_on: new Date().toISOString().slice(0, 10) });
            setAnnouncementMessage('Announcement published.');
        } catch (err) {
            setSectionErrors((current) => ({
                ...current,
                announcements: err?.response?.data?.message || 'Unable to publish this announcement.',
            }));
        } finally {
            setAnnouncementSubmitting(false);
        }
    };

    const handleDeleteAnnouncement = async (announcementId) => {
        if (!confirm('Delete this announcement?')) return;
        setSectionErrors((current) => ({ ...current, announcements: '' }));
        try {
            await deleteAdminAnnouncement(announcementId);
            setAnnouncements((current) => current.filter((item) => item.id !== announcementId));
        } catch (err) {
            setSectionErrors((current) => ({
                ...current,
                announcements: err?.response?.data?.message || 'Unable to delete this announcement.',
            }));
        }
    };

    const handleCreateEvent = async (event) => {
        event.preventDefault();
        if (eventForm.end_time && eventForm.end_time <= eventForm.event_time) {
            setEventFormError('The end time must be later than the start time.');
            setEventFormSuccess('');
            return;
        }

        setEventSubmitting(true);
        setEventFormError('');
        setEventFormSuccess('');

        try {
            const createdEvent = await createAdminCentreEvent({
                ...eventForm,
                capacity: eventForm.capacity ? Number(eventForm.capacity) : null,
                end_time: eventForm.end_time || null,
                registration_deadline: eventForm.registration_deadline || null,
                image: eventForm.image.trim() || null,
            });
            setEvents((current) => [...current, createdEvent].sort((a, b) => (
                `${a.event_date} ${a.event_time}`.localeCompare(`${b.event_date} ${b.event_time}`)
            )));
            setEventForm(EMPTY_EVENT_FORM);
            setEventFormOpen(false);
            setEventFormSuccess('Event created successfully.');
        } catch (err) {
            setEventFormError(err?.response?.data?.message || 'Unable to create the event. Please check the details and try again.');
        } finally {
            setEventSubmitting(false);
        }
    };

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
        <div className="ump-admin-page">
            <main className="container mx-auto py-8" style={{ maxWidth: '1200px' }}>
                <h1 id="admin-overview" className="scroll-mt-24 text-3xl font-bold mb-6 text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 mb-8">Manage events and view RSVP lists</p>

                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Admin overview">
                    {[
                        { label: 'Pending mentor verification', value: pendingMentors.length, href: '#mentor-verification' },
                        { label: 'Mentors', value: mentors.length, href: '#mentors-availability' },
                        { label: 'Upcoming appointments', value: appointments.filter((item) => ['pending', 'confirmed'].includes(item.status) && item.time_slot?.date >= new Date().toISOString().slice(0, 10)).length, href: '#upcoming-appointments' },
                        { label: 'Centre events', value: events.length, href: '#centre-events' },
                    ].map((metric) => (
                        <a key={metric.label} href={metric.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#09203F]">
                            <span className="text-sm text-slate-600">{metric.label}</span>
                            <strong className="mt-2 block text-3xl text-[#09203F]">{sectionLoading ? '—' : metric.value}</strong>
                        </a>
                    ))}
                </section>

                <section id="mentor-verification" className="mb-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Mentor Verification</h2>
                            <p className="mt-1 text-sm text-slate-600">Review and verify mentor applications.</p>
                        </div>
                    </div>
                    {sectionErrors.verification && <p role="alert" className="mb-3 text-sm text-red-700">{sectionErrors.verification}</p>}
                    {sectionLoading ? <p className="text-sm text-slate-600">Loading mentor applications...</p>
                        : pendingMentors.length === 0 ? <p className="text-sm text-slate-600">There are no mentors awaiting verification.</p>
                            : <div className="space-y-3">
                                {pendingMentors.map((mentor) => (
                                    <div key={mentor.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                                        <div><h3 className="font-semibold text-slate-900">{mentor.name}</h3><p className="text-sm text-slate-600">{mentor.email}</p></div>
                                        <button type="button" disabled={verifyingMentorId === mentor.id} onClick={() => handleVerifyMentor(mentor.id)} className="rounded-full bg-[#09203F] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                                            {verifyingMentorId === mentor.id ? 'Verifying...' : 'Verify Mentor'}
                                        </button>
                                    </div>
                                ))}
                            </div>}
                </section>

                <section id="mentors-availability" className="mb-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Mentors & Availability</h2>
                    <p className="mb-4 mt-1 text-sm text-slate-600">View mentor status and their configured weekly availability.</p>
                    {sectionErrors.mentors && <p role="alert" className="mb-3 text-sm text-red-700">{sectionErrors.mentors}</p>}
                    {sectionErrors.availability && <p role="alert" className="mb-3 text-sm text-red-700">{sectionErrors.availability}</p>}
                    {sectionLoading ? <p className="text-sm text-slate-600">Loading mentors...</p>
                        : mentors.length === 0 ? <p className="text-sm text-slate-600">No mentors found.</p>
                            : <div className="space-y-3">
                                {mentors.map((mentor) => (
                                    <div key={mentor.id} className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{mentor.name}</h3>
                                                <p className="text-sm text-slate-600">{mentor.email} · {mentor.mentor_verified_at ? 'Verified' : 'Pending verification'}</p>
                                            </div>
                                            <button type="button" onClick={() => handleViewAvailability(mentor.id)} className="rounded-full border border-[#09203F] px-4 py-2 text-sm font-semibold text-[#09203F] hover:bg-slate-50">
                                                {selectedAvailabilityMentor === mentor.id ? 'Refresh availability' : 'View availability'}
                                            </button>
                                        </div>
                                        {selectedAvailabilityMentor === mentor.id && (
                                            <div className="mt-3 border-t border-slate-100 pt-3">
                                                {availabilityLoading ? <p className="text-sm text-slate-600">Loading availability...</p>
                                                    : mentorAvailability.length === 0 ? <p className="text-sm text-slate-600">No weekly availability configured.</p>
                                                        : <ul className="space-y-1 text-sm text-slate-700">
                                                            {mentorAvailability.map((availability) => (
                                                                <li key={availability.id}>{availability.day_of_week}: {availability.start_time}–{availability.end_time} · {availability.is_active ? 'Active' : 'Inactive'}</li>
                                                            ))}
                                                        </ul>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>}
                </section>

                <section id="upcoming-appointments" className="mb-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                            <p className="mt-1 text-sm text-slate-600">Pending and confirmed appointments from today onward.</p>
                        </div>
                        <Link to="/admin/bookings" className="rounded-full border border-[#09203F] px-4 py-2 text-sm font-semibold text-[#09203F]">Manage bookings</Link>
                    </div>
                    {sectionErrors.appointments && <p role="alert" className="mb-3 text-sm text-red-700">{sectionErrors.appointments}</p>}
                    {sectionLoading ? <p className="text-sm text-slate-600">Loading appointments...</p>
                        : appointments.filter((item) => ['pending', 'confirmed'].includes(item.status) && item.time_slot?.date >= new Date().toISOString().slice(0, 10)).length === 0
                            ? <p className="text-sm text-slate-600">No upcoming appointments.</p>
                            : <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] text-left text-sm">
                                    <thead><tr className="border-b border-slate-200 text-slate-600"><th className="py-2">Student</th><th>Mentor</th><th>Date & time</th><th>Status</th></tr></thead>
                                    <tbody>{appointments.filter((item) => ['pending', 'confirmed'].includes(item.status) && item.time_slot?.date >= new Date().toISOString().slice(0, 10)).map((item) => (
                                        <tr key={item.id} className="border-b border-slate-100">
                                            <td className="py-3">{item.student?.name || item.student?.email || 'Student'}</td>
                                            <td>{item.mentor?.name || 'Mentor'}</td>
                                            <td>{item.time_slot?.date || '—'} · {item.time_slot?.start_time || '—'}</td>
                                            <td className="capitalize">{item.status}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>}
                </section>

                <section id="announcements" className="mb-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Announcements</h2>
                    <p className="mb-4 mt-1 text-sm text-slate-600">Publish updates for the UMP-CFERI portal.</p>
                    {announcementMessage && <p role="status" className="mb-3 text-sm text-emerald-700">{announcementMessage}</p>}
                    {sectionErrors.announcements && <p role="alert" className="mb-3 text-sm text-red-700">{sectionErrors.announcements}</p>}
                    <form onSubmit={handleCreateAnnouncement} className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
                        <input aria-label="Announcement title" required maxLength={160} placeholder="Title" value={announcementForm.title} onChange={(event) => setAnnouncementForm((current) => ({ ...current, title: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        <input aria-label="Announcement type" required maxLength={80} placeholder="Type (e.g. General)" value={announcementForm.type} onChange={(event) => setAnnouncementForm((current) => ({ ...current, type: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        <input aria-label="Publish date" type="date" required value={announcementForm.published_on} onChange={(event) => setAnnouncementForm((current) => ({ ...current, published_on: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        <textarea aria-label="Announcement message" required maxLength={2000} rows={2} placeholder="Announcement message" value={announcementForm.message} onChange={(event) => setAnnouncementForm((current) => ({ ...current, message: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
                        <button type="submit" disabled={announcementSubmitting} className="justify-self-start rounded-full bg-[#09203F] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{announcementSubmitting ? 'Publishing...' : 'Publish announcement'}</button>
                    </form>
                    {sectionLoading ? <p className="text-sm text-slate-600">Loading announcements...</p>
                        : announcements.length === 0 ? <p className="text-sm text-slate-600">No announcements have been published.</p>
                            : <div className="space-y-3">
                                {announcements.map((announcement) => (
                                    <article key={announcement.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 p-4">
                                        <div><h3 className="font-semibold text-slate-900">{announcement.title}</h3><p className="text-xs text-slate-500">{announcement.type} · {announcement.published_on}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{announcement.message}</p></div>
                                        <button type="button" onClick={() => handleDeleteAnnouncement(announcement.id)} className="rounded-full border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>
                                    </article>
                                ))}
                            </div>}
                </section>

                <section id="centre-events" className="scroll-mt-24">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-slate-900">Events</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setEventFormOpen((open) => !open);
                                    setEventFormError('');
                                    setEventFormSuccess('');
                                }}
                                aria-expanded={eventFormOpen}
                                className="rounded-full bg-[#09203F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b1f45]"
                            >
                                {eventFormOpen ? 'Cancel' : 'Add Event'}
                            </button>
                        </div>
                        {eventFormSuccess && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{eventFormSuccess}</div>}
                        {eventFormOpen && (
                            <form onSubmit={handleCreateEvent} className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-900">Create a centre event</h3>
                                {eventFormError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{eventFormError}</div>}
                                <div>
                                    <label htmlFor="event-title" className="mb-1 block text-sm font-medium text-slate-700">Event title *</label>
                                    <input id="event-title" name="event_title" value={eventForm.event_title} onChange={handleEventFieldChange} required maxLength={160} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="event-date" className="mb-1 block text-sm font-medium text-slate-700">Date *</label>
                                        <input id="event-date" type="date" name="event_date" value={eventForm.event_date} onChange={handleEventFieldChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="event-category" className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
                                        <input id="event-category" name="event_category" value={eventForm.event_category} onChange={handleEventFieldChange} required maxLength={80} placeholder="Workshop, Talk, Panel..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="event-start-time" className="mb-1 block text-sm font-medium text-slate-700">Start time *</label>
                                        <input id="event-start-time" type="time" name="event_time" value={eventForm.event_time} onChange={handleEventFieldChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="event-end-time" className="mb-1 block text-sm font-medium text-slate-700">End time</label>
                                        <input id="event-end-time" type="time" name="end_time" value={eventForm.end_time} onChange={handleEventFieldChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="event-venue" className="mb-1 block text-sm font-medium text-slate-700">Venue *</label>
                                    <input id="event-venue" name="event_venue" value={eventForm.event_venue} onChange={handleEventFieldChange} required maxLength={160} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="event-description" className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                                    <textarea id="event-description" name="description" value={eventForm.description} onChange={handleEventFieldChange} rows={3} maxLength={2000} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="event-capacity" className="mb-1 block text-sm font-medium text-slate-700">Capacity</label>
                                        <input id="event-capacity" type="number" name="capacity" value={eventForm.capacity} onChange={handleEventFieldChange} min="1" step="1" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="event-registration-deadline" className="mb-1 block text-sm font-medium text-slate-700">Registration deadline</label>
                                        <input id="event-registration-deadline" type="date" name="registration_deadline" value={eventForm.registration_deadline} onChange={handleEventFieldChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="event-image" className="mb-1 block text-sm font-medium text-slate-700">Image URL or public image path</label>
                                    <input id="event-image" type="text" name="image" value={eventForm.image} onChange={handleEventFieldChange} maxLength={500} placeholder="/images/event-photo.jpg" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                </div>
                                <button type="submit" disabled={eventSubmitting} className="justify-self-start rounded-full bg-[#09203F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b1f45] disabled:cursor-not-allowed disabled:opacity-60">
                                    {eventSubmitting ? 'Creating event...' : 'Create Event'}
                                </button>
                            </form>
                        )}
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
                </section>
            </main>
            <SiteFooter />
        </div>
    );
}
