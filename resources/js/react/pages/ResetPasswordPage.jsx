import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword, toErrorMessage } from '../api';
import AuthLayout from '../components/AuthLayout';

export default function ResetPasswordPage() {
    const [form, setForm] = useState({ email: '', token: '', password: '', password_confirmation: '' });
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await resetPassword(form);
            setStatus('Password reset successful. You can now sign in.');
        } catch (err) {
            setError(toErrorMessage(err, 'Failed to reset password'));
        }
    };

    return (
        <AuthLayout title="Reset Password" subtitle="Set a new secure password for your account.">
            {status ? <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{status}</div> : null}
            {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
            <form className="grid gap-4" onSubmit={submit}>
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} required />
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" placeholder="Reset token" value={form.token} onChange={(e) => setForm((v) => ({ ...v, token: e.target.value }))} required />
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" placeholder="New password" type="password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} required />
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" placeholder="Confirm password" type="password" value={form.password_confirmation} onChange={(e) => setForm((v) => ({ ...v, password_confirmation: e.target.value }))} required />
                <button className="tma-btn tma-btn-primary w-full" type="submit">Reset Password</button>
            </form>
            <p className="mt-4 text-center text-sm"><Link to="/login" className="text-[var(--tma-pink)] hover:underline">Back to sign in</Link></p>
        </AuthLayout>
    );
}
