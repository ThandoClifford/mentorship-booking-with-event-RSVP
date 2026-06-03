import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword, toErrorMessage } from '../api';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [devToken, setDevToken] = useState('');
    const [error, setError] = useState('');

    return (
        <AuthLayout title="Recover Password" subtitle="Enter your email and we will send a reset link.">
            {status ? <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{status}</div> : null}
            {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
            <form className="grid gap-4" onSubmit={async (event) => {
                event.preventDefault();
                setError('');
                try {
                    const data = await forgotPassword(email);
                    setStatus('If the email exists, a reset link has been issued.');
                    setDevToken(data?.reset_token || '');
                } catch (err) {
                    setError(toErrorMessage(err, 'Failed to send reset link'));
                }
            }}>
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button className="tma-btn tma-btn-primary w-full" type="submit">Send Reset Link</button>
            </form>
            {devToken ? <p className="mt-3 text-xs text-[var(--tma-muted)]">Dev reset token: {devToken}</p> : null}
            <p className="mt-4 text-center text-sm"><Link to="/login" className="text-[var(--tma-pink)] hover:underline">Back to sign in</Link></p>
        </AuthLayout>
    );
}
