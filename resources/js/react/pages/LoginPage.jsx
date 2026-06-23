import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, setAuth, toErrorMessage } from '../api';
import AuthLayout from '../components/AuthLayout';
import { roleHomePath, roleValue } from '../utils';

export default function LoginPage({ onAuthenticated, forcedRole = '' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [pendingMessage, setPendingMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const params = useMemo(() => new URLSearchParams(location.search || ''), [location.search]);
    const loginRole = useMemo(() => {
        const role = String(params.get('role') || '').toLowerCase();
        return forcedRole || role;
    }, [forcedRole, params]);

    const redirectTo = params.get('redirect') || '';

    const title = loginRole === 'admin' ? 'Admin Sign In' : loginRole === 'mentor' ? 'Mentor Sign In' : 'Mentee Sign In';

    useEffect(() => {
        if (params.get('pending') === '1') {
            setPendingMessage('Your mentor account is awaiting admin verification. You can sign in after approval.');
        }
    }, [params]);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setPendingMessage('');
        setLoading(true);
        try {
            const data = await login({ email, password });
            setAuth(data.token, data.user);
            onAuthenticated(data.user);
            if (redirectTo && redirectTo.startsWith('/')) {
                navigate(redirectTo);
                return;
            }
            navigate(roleHomePath(roleValue(data.user)));
        } catch (err) {
            const message = toErrorMessage(err, 'Login failed');
            if (/pending verification/i.test(message)) {
                setPendingMessage('Your mentor account is awaiting admin verification. You can sign in after approval.');
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title={title} subtitle="Sign in to The Mentorship Academy Platform.">
            <form className="grid gap-4" onSubmit={submit}>
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--tma-text)]" htmlFor="email">Email</label>
                    <input id="email" className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--tma-text)]" htmlFor="password">Password</label>
                    <input id="password" className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {pendingMessage ? <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{pendingMessage}</p> : null}
                {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
                <button className="tma-btn tma-btn-primary w-full" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign In'}</button>
            </form>
            <div className="mt-4 grid gap-2 text-sm">
                <Link className="text-center font-medium text-[var(--tma-pink)] hover:underline" to="/forgot-password">Forgot password?</Link>
                <Link className="text-center font-medium text-[var(--tma-pink)] hover:underline" to="/register">Create an account</Link>
            </div>
        </AuthLayout>
    );
}
