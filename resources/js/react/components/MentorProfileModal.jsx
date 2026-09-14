import React, { useEffect, useState } from 'react';
import BookSessionModal from './BookSessionModal';
import { getPublicMentorSlots, createPublicAppointment } from '../api';

const FALLBACK_IMAGE = '/images/ump-logo.png';

function isObjectId(value) {
    return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
}

export default function MentorProfileModal({ mentor, onClose }) {
    const [showBooking, setShowBooking] = useState(false);
    const [slots, setSlots] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    const avatarUrl = mentor?.profile_photo_path || mentor?.photo || FALLBACK_IMAGE;
    const name = mentor?.name || 'Mentor Profile';
    const title = mentor?.title || mentor?.role || 'Mentor';
    const faculty = mentor?.faculty || mentor?.expertise || null;
    const email = mentor?.email || null;
    const expertise = mentor?.expertise || null;
    const bio = mentor?.bio || mentor?.summary || null;
    const canBook = isObjectId(mentor?.id);

    useEffect(() => {
        if (showBooking) return;
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [showBooking, onClose]);

    const openBooking = async () => {
        if (!canBook) return;
        setLoadingSlots(true);
        setError('');
        try {
            const data = await getPublicMentorSlots(mentor.id);
            setSlots(Array.isArray(data) ? data : []);
            setShowBooking(true);
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to load available time slots.');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBookingSubmit = async (payload) => {
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await createPublicAppointment(payload);
            setSuccess('Your mentorship appointment request has been submitted successfully. The mentor will review your request and you will receive an email once it has been accepted or declined.');
            setShowBooking(false);
            setSlots((current) => current.filter((slot) => String(slot.id) !== String(payload.slot_id)));
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to submit appointment request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Mentor</div>
                            <h2 id="mentor-profile-title" className="mt-1 text-2xl font-bold text-slate-900">{name}</h2>
                            <p className="text-sm text-slate-600">{title}</p>
                            {faculty && <p className="text-sm text-slate-500">{faculty}</p>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        aria-label="Close mentor profile"
                    >
                        ✕
                    </button>
                </div>

                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

                <div className="grid gap-4 md:grid-cols-2">
                    {email && (
                        <div className="md:col-span-2">
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email</div>
                            <p className="mt-1 text-sm text-slate-700">{email}</p>
                        </div>
                    )}
                    {expertise && (
                        <div className="md:col-span-2">
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Expertise</div>
                            <p className="mt-1 text-sm text-slate-700">{expertise}</p>
                        </div>
                    )}
                    {bio ? (
                        <div className="md:col-span-2">
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">About</div>
                            <p className="mt-1 text-sm text-slate-700">{bio}</p>
                        </div>
                    ) : (
                        <div className="md:col-span-2">
                            <p className="text-sm text-slate-500">Mentor at UMP-CFERI</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={openBooking}
                        disabled={!canBook || loadingSlots}
                        className="rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white hover:bg-indigo-800 disabled:opacity-50 disabled:hover:bg-indigo-700"
                    >
                        {loadingSlots ? 'Loading...' : 'Book Appointment'}
                    </button>
                    {!canBook && (
                        <span className="text-sm text-slate-500">Booking details for this mentor will be available soon.</span>
                    )}
                </div>

                {showBooking && (
                    <BookSessionModal
                        mentor={mentor}
                        slots={slots}
                        onClose={() => setShowBooking(false)}
                        onSubmit={handleBookingSubmit}
                    />
                )}
            </div>
        </div>
    );
}
