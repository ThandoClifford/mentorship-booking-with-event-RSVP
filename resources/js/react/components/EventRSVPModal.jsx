import React, { useEffect, useState } from 'react';
import { createPublicEventRsvp } from '../api';

const FALLBACK_IMAGE = '/images/panel-discussion.jpg';

export default function EventRSVPModal({ event, onClose }) {
    const [form, setForm] = useState({
        full_name: '',
        student_number: '',
        email: '',
        phone: '',
        faculty_programme: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await createPublicEventRsvp(event.id, form);
            setSuccess('Your RSVP has been confirmed. A confirmation email will be sent to you shortly.');
            setForm({ full_name: '', student_number: '', email: '', phone: '', faculty_programme: '' });
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to submit RSVP. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    const eventDate = event?.event_date || 'TBD';
    const eventTime = event?.event_time ? String(event.event_time).slice(0, 5) : 'TBD';
    const endTime = event?.end_time ? String(event.end_time).slice(0, 5) : null;
    const timeLabel = endTime ? `${eventTime} - ${endTime}` : eventTime;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Event RSVP</div>
                        <h2 id="event-rsvp-title" className="mt-1 text-2xl font-bold text-slate-900">{event?.title || 'Event'}</h2>
                        <p className="mt-1 text-sm text-slate-600">{eventDate} • {timeLabel}</p>
                        <p className="text-sm text-slate-500">{event?.venue}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        aria-label="Close RSVP form"
                    >
                        ✕
                    </button>
                </div>

                {event?.description && (
                    <p className="mb-4 text-sm text-slate-600">{event.description}</p>
                )}

                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

                {!success && (
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                type="text"
                                required
                                value={form.full_name}
                                onChange={handleChange('full_name')}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Student Number</label>
                            <input
                                type="text"
                                required
                                value={form.student_number}
                                onChange={handleChange('student_number')}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                                placeholder="Enter your student number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">UMP Email</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={handleChange('email')}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                                placeholder="your.name@ump.ac.za"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={handleChange('phone')}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                                placeholder="+27 71 000 0000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Faculty / Programme</label>
                            <input
                                type="text"
                                value={form.faculty_programme}
                                onChange={handleChange('faculty_programme')}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                                placeholder="e.g. BSc Computer Science"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-xl bg-[#09203F] px-6 py-3 font-semibold text-white hover:bg-[#0b1f45] disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit RSVP'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
