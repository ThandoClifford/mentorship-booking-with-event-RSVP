import React, { useMemo, useState } from 'react';

export default function BookSessionModal({ mentor, slots = [], onClose, onSubmit }) {
    const [submitting, setSubmitting] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(slots[0]?.id || '');
    const [form, setForm] = useState({
        full_name: '',
        student_number: '',
        email: '',
        faculty: '',
        phone: '',
        reason: ''
    });

    const selected = useMemo(() => slots.find((slot) => String(slot.id) === String(selectedSlot)) || null, [selectedSlot, slots]);

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selected || submitting) return;

        setSubmitting(true);
        try {
            await onSubmit({
                mentor_id: mentor?.id,
                slot_id: selected.id,
                full_name: form.full_name,
                student_number: form.student_number,
                email: form.email,
                faculty: form.faculty,
                phone: form.phone,
                reason: form.reason
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Book Appointment</div>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">Request a mentorship session</h2>
                        <p className="mt-1 text-sm text-slate-600">With {mentor?.name || 'your mentor'}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full border px-3 py-1 text-sm hover:bg-slate-100">Close</button>
                </div>

                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Mentor</label>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900">{mentor?.name}</div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Choose a real available time slot</label>
                        <select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                            <option value="">Select a time slot</option>
                            {slots.map((slot) => (
                                <option key={slot.id} value={slot.id}> {slot.date} {slot.start_time}-{slot.end_time} </option>
                            ))}
                        </select>
                        {selected && (
                            <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm">
                                <span className="font-semibold">Selected:</span> {selected.date} {selected.start_time}-{selected.end_time}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Full name *</label>
                        <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Student number *</label>
                        <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.student_number} onChange={(e) => updateField('student_number', e.target.value)} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">UMP email *</label>
                        <input type="email" className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Faculty/program</label>
                        <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.faculty} onChange={(e) => updateField('faculty', e.target.value)} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
                        <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Reason for appointment *</label>
                        <textarea className="min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3" value={form.reason} onChange={(e) => updateField('reason', e.target.value)} required />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 hover:bg-slate-300">Cancel</button>
                        <button type="submit" disabled={submitting || !selected} className="rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-60 hover:bg-indigo-800">
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

