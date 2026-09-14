import React, { useEffect, useMemo, useState } from 'react';
import {
  confirmMentorAppointment,
  declineMentorAppointment,
  getMentorAppointments,
  toErrorMessage,
} from '../api';

export default function MentorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const records = await getMentorAppointments();
      setAppointments(records);
    } catch (err) {
      setError(toErrorMessage(err, 'Unable to load appointments.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const onConfirm = async (id) => {
    try {
      setBusyId(id);
      setError('');
      await confirmMentorAppointment(id);
      await loadAppointments();
    } catch (err) {
      setError(toErrorMessage(err, 'Unable to confirm appointment.'));
    } finally {
      setBusyId(null);
    }
  };

  const onDecline = async (id) => {
    try {
      setBusyId(id);
      setError('');
      await declineMentorAppointment(id, 'Declined by mentor');
      await loadAppointments();
    } catch (err) {
      setError(toErrorMessage(err, 'Unable to decline appointment.'));
    } finally {
      setBusyId(null);
    }
  };

  const appointmentCount = appointments.length;
  const studentName = (appointment) => appointment.student?.name || appointment.public_student?.full_name || appointment.student_contact_details || 'Public student';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[var(--tma-text)]">Mentor Dashboard</h1>
          <p className="text-gray-600">Welcome to your mentor dashboard</p>
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
          <span className="font-semibold">{appointmentCount}</span> appointment{appointmentCount === 1 ? '' : 's'}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-slate-500">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
          No appointments yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {appointments.map((appointment) => {
            const student = appointment.student || appointment.public_student || null;
            const isPublic = student?.type === 'public' || Boolean(appointment.public_student);
            return (
              <div key={appointment.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold uppercase text-slate-500">{appointment.status}</span>
                      {isPublic && (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          Public student
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-[var(--tma-text)]">{studentName(appointment)}</h3>
                    <div className="mt-2 text-sm text-slate-500">
                      <span>{appointment.time_slot?.date}</span>
                      <span className="mx-2">•</span>
                      <span>{appointment.time_slot?.start_time} - {appointment.time_slot?.end_time}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      disabled={busyId === appointment.id || appointment.status === 'confirmed'}
                      onClick={() => onConfirm(appointment.id)}
                    >
                      {busyId === appointment.id ? 'Working...' : 'Confirm'}
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      disabled={busyId === appointment.id}
                      onClick={() => onDecline(appointment.id)}
                    >
                      {busyId === appointment.id ? 'Working...' : 'Decline'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <span className="font-semibold">Subject:</span> {appointment.appointment_subject || 'No subject'}
                  </div>
                  <div>
                    <span className="font-semibold">Contact:</span> {appointment.student_contact_details || student?.email || '-'}
                  </div>
                  {isPublic && (
                    <>
                      <div>
                        <span className="font-semibold">Student number:</span> {student?.student_number || '-'}
                      </div>
                      <div>
                        <span className="font-semibold">Faculty:</span> {student?.faculty || '-'}
                      </div>
                      <div>
                        <span className="font-semibold">Email:</span> {student?.email || '-'}
                      </div>
                      <div>
                        <span className="font-semibold">Phone:</span> {student?.phone || '-'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
