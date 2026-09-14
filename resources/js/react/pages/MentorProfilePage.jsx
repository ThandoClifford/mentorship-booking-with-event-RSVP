import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicMentor, getPublicMentorSlots, createPublicAppointment } from '../api';
import BookSessionModal from '../components/BookSessionModal';

export default function MentorProfilePage({ user }) {
    const { id } = useParams();
    const [mentor, setMentor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState('');
    const [showBooking, setShowBooking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError('');
            setNotFound(false);
            try {
                const mentorData = await getPublicMentor(id);
                if (!mentorData || cancelled) {
                    setNotFound(true);
                    return;
                }
                const slotData = await getPublicMentorSlots(id);
                if (!cancelled) {
                    setMentor(mentorData);
                    setSlots(slotData);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err?.response?.data?.message || 'Unable to load the mentor profile.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [id]);

    const handleBookSubmit = async (payload) => {
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await createPublicAppointment(payload);
            setSuccess('Your mentorship appointment request has been submitted successfully. The mentor will review your request and you will receive an email once it has been accepted or declined.');
            setShowBooking(false);
            setSlots((current) => current.filter((slot) => slot.id !== payload.slot_id));
        } catch (err) {
            const message = err?.response?.data?.message || 'Unable to submit appointment request.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container mx-auto py-10"><div className="text-slate-700">Loading mentor profile...</div></div>;
    if (notFound) return <div className="container mx-auto py-10"><div className="rounded-xl border border-slate-200 bg-white p-8"><h1 className="text-3xl font-bold">Mentor not found</h1><p className="mt-3 text-slate-600">The requested mentor could not be found.</p></div></div>;
    if (error) return <div className="container mx-auto py-10"><div className="rounded-xl border border-red-200 bg-red-50 p-8 text-red-700">{error}</div></div>;

    return (
        <div className="container mx-auto py-10">
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                            {mentor?.name?.split(' ').map((x) => x[0]).slice(0, 2).join('') || 'MP'}
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Mentor</div>
                            <h1 className="mt-2 text-4xl font-black text-slate-900">{mentor?.name}</h1>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {mentor?.faculty && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{mentor.faculty}</span>}
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Public Profile</div>
                        <p className="text-slate-700">
                            {mentor?.bio || 'Mentor profile information is available for public mentorship booking.'}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button className="rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white hover:bg-indigo-800" onClick={() => setShowBooking(true)}>
                            Book Appointment
                        </button>
                        <a className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50" href="/mentors">
                            Browse Mentors
                        </a>
                    </div>

                    {success && <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">{success}</div>}
                </section>

                <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Available slots</div>
                    <div className="mt-4 space-y-3">
                        {slots.length === 0 ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">No future available slots.</div>
                        ) : (
                            slots.map((slot) => (
                                <div key={slot.id} className="rounded-xl border border-slate-200 px-4 py-3">
                                    <div className="font-bold text-slate-900">{slot.date}</div>
                                    <div className="mt-1 text-sm text-slate-600">{slot.start_time} - {slot.end_time}</div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>

            {showBooking && <BookSessionModal mentor={mentor} slots={slots} onClose={() => setShowBooking(false)} onSubmit={handleBookSubmit} />}
        </div>
    );
}
