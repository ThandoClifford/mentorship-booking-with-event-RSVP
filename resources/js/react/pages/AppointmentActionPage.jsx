import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import SiteFooter from '../components/SiteFooter';

export default function AppointmentActionPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionType, setActionType] = useState(null);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Invalid action link.');
      return;
    }

    let active = true;
    (async () => {
      try {
        const response = await fetch(`/api/v1/public/appointment-actions/${encodeURIComponent(token)}`);
        const data = await response.json();
        if (!active) return;

        if (!response.ok) {
          setLoading(false);
          setError(data.message || 'Unable to load this action link.');
          return;
        }

        if (active) {
          setActionType(data.data?.action || null);
          setAppointment(data.data?.appointment || null);
          setLoading(false);
        }
      } catch {
        if (active) {
          setLoading(false);
          setError('Unable to load this action link. Please try again later.');
        }
      }
    })();

    return () => { active = false; };
  }, [token]);

  const handleAction = async () => {
    if (!token || submitting) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/v1/public/appointment-actions/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Action completed successfully.');
        setActionType(null);
        setAppointment(null);
      } else {
        setError(data.message || 'Unable to process this action.');
      }
    } catch {
      setError('Unable to process this action. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const slot = appointment?.time_slot || {};
  const student = appointment?.public_student || appointment?.student || {};
  const date = slot.date || 'TBD';
  const startTime = String(slot.start_time || '').slice(0, 5);
  const endTime = String(slot.end_time || '').slice(0, 5);

  return (
    <div className="ump-public-page">
      <PublicNavbar user={null} />
      <main className="flex items-center justify-center" style={{ minHeight: '60vh', padding: '24px' }}>
        <div style={{ maxWidth: '520px', width: '100%' }} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            {success ? 'Success' : 'Mentorship Appointment Request'}
          </h1>

          {loading && (
            <p className="mt-3 text-center text-slate-600">Loading appointment details...</p>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>
          )}

          {!loading && !error && !success && appointment && actionType && (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 text-left">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Student</div>
                  <p className="mt-1 text-sm text-slate-900">{student.full_name || student.name || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Date</div>
                  <p className="mt-1 text-sm text-slate-900">{date}</p>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Time</div>
                  <p className="mt-1 text-sm text-slate-900">{startTime && endTime ? `${startTime} - ${endTime}` : 'TBD'}</p>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Reason</div>
                  <p className="mt-1 text-sm text-slate-900">{appointment.appointment_subject || 'N/A'}</p>
                </div>
              </div>

              <div className="pt-4">
                {actionType === 'accept' && (
                  <button
                    type="button"
                    onClick={handleAction}
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#09203F] px-6 py-3 font-semibold text-white hover:bg-[#0b1f45] disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : 'Confirm Appointment'}
                  </button>
                )}
                {actionType === 'decline' && (
                  <button
                    type="button"
                    onClick={handleAction}
                    disabled={submitting}
                    className="w-full rounded-xl border border-red-300 bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : 'Decline Appointment'}
                  </button>
                )}
              </div>
            </div>
          )}

          {!loading && (success || error) && (
            <a className="mt-6 inline-flex rounded-full bg-[#09203F] px-6 py-3 font-semibold text-white" href="/">
              Return to homepage
            </a>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
