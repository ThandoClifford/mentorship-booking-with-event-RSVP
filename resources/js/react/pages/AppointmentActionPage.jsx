import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import SiteFooter from '../components/SiteFooter';

export default function AppointmentActionPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid action link.');
      return;
    }

    let active = true;
    (async () => {
      try {
        const response = await fetch(`/api/v1/public/appointment-actions/${encodeURIComponent(token)}`);
        const data = await response.json();
        if (!active) return;

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Action completed successfully.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Unable to process this action.');
        }
      } catch {
        if (active) {
          setStatus('error');
          setMessage('Unable to process this action. Please try again later.');
        }
      }
    })();

    return () => { active = false; };
  }, [token]);

  return (
    <div className="ump-public-page">
      <PublicNavbar user={null} />
      <main className="flex items-center justify-center" style={{ minHeight: '60vh', padding: '24px' }}>
        <div style={{ maxWidth: '520px', width: '100%' }} className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Success'}
            {status === 'error' && 'Action unavailable'}
          </h1>
          <p className="mt-3 text-slate-600">{message}</p>
          {status !== 'loading' && (
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
