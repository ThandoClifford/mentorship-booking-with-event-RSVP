import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clearAuth, register, setAuth, toErrorMessage } from '../api';
import AuthLayout from '../components/AuthLayout';
import { roleHomePath, roleValue, FACULTY_OPTIONS } from '../utils';

export default function RegisterPage({ onAuthenticated }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'student', faculty: '' });
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const role = searchParams.get('role');
        if (role === 'mentor') setForm((v) => ({ ...v, role: 'mentor' }));
    }, [searchParams]);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setStatus('');
        try {
            const data = await register(form);
            if (roleValue(data.user) === 'mentor') {
                clearAuth();
                onAuthenticated(null);
                setStatus('Mentor account created. Wait for admin verification before you can access the mentor dashboard.');
                navigate('/login?role=mentor&pending=1');
                return;
            }
            setAuth(data.token, data.user);
            onAuthenticated(data.user);
            navigate(roleHomePath(roleValue(data.user)));
        } catch (err) {
            setError(toErrorMessage(err, 'Registration failed'));
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Join The Mentorship Academy as a mentee or mentor.">
            <form className="grid gap-4" onSubmit={submit}>
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} required />
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} required />
                <select className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm((v) => ({ ...v, role: e.target.value }))}>
                    <option value="student">Mentee</option>
                    <option value="mentor">Mentor</option>
                </select>
                {form.role === 'mentor' ? (
                    <select className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" value={form.faculty} onChange={(e) => setForm((v) => ({ ...v, faculty: e.target.value }))} required>
                        <option value="">Select faculty / expertise area</option>
                        {FACULTY_OPTIONS.map((faculty) => (
                            <option key={faculty} value={faculty}>{faculty}</option>
                        ))}
                    </select>
                ) : null}
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} required />
                <input className="w-full rounded-md border border-[var(--tma-border)] bg-white px-3 py-2 text-sm" placeholder="Confirm password" type="password" value={form.password_confirmation} onChange={(e) => setForm((v) => ({ ...v, password_confirmation: e.target.value }))} required />
                {status ? <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{status}</p> : null}
                {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
                <button className="tma-btn tma-btn-primary w-full" type="submit">Register</button>
            </form>
            <p className="mt-4 text-center text-sm">
                Already have an account? <Link to="/login" className="font-medium text-[var(--tma-pink)] hover:underline">Sign in</Link>
            </p>
        </AuthLayout>
    );
}
