import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    approveAdminAppointment,
    bookAppointment,
    cancelAppointment,
    clearAuth,
    completeMentorAppointment,
    confirmMentorAppointment,
    createAdminAnnouncement,
    createAdminCentreEvent,
    createMentor,
    createMentorGroupSession,
    declineMentorAppointment,
    deleteAdminAnnouncement,
    deleteAdminCentreEvent,
    forgotPassword,
    getAdminAnnouncements,
    getAdminAppointment,
    getAdminAppointments,
    getAdminCentreEvents,
    getAdminMentors,
    getHomeData,
    getMentorAppointments,
    getMentorAvailability,
    getMentorGroupSessions,
    getPendingMentorVerifications,
    getStoredUser,
    getStudentAppointments,
    getStudentSlots,
    login,
    logout,
    me,
    register,
    resetPassword,
    saveMentorNotes,
    setAuth,
    setMentorAvailabilityStatus,
    toErrorMessage,
    verifyMentor,
} from './api';

const PARTNERS = [
    { file: '/images/partner-standard-bank.png', label: 'Standard Bank' },
    { file: '/images/partner-sedfa.png', label: 'SEDFA' },
    { file: '/images/partner-old-mutual.png', label: 'Old Mutual' },
    { file: '/images/partner-absa.png', label: 'ABSA' },
    { file: '/images/partner-nyda.png', label: 'NYDA' },
];

function roleValue(user) {
    return user?.role || '';
}

function roleHomePath(role) {
    if (role === 'student') return '/student';
    if (role === 'mentor') return '/mentor';
    if (role === 'admin' || role === 'super_admin') return '/admin';
    return '/login';
}

function formatTime(value) {
    if (!value) return '-';
    return String(value).slice(0, 5);
}

function Card({ title, subtitle, children, id }) {
    return (
        <section id={id} className="ump-card p-4">
            {title || subtitle ? (
                <div className="mb-3">
                    {title ? <h3 className="text-lg font-semibold text-[var(--ump-primary-navy)]">{title}</h3> : null}
                    {subtitle ? <p className="mt-1 text-sm ump-muted">{subtitle}</p> : null}
                </div>
            ) : null}
            {children}
        </section>
    );
}

function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="ump-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--ump-primary-navy)]">{title}</h2>
                    {subtitle ? <p className="mt-1 text-sm ump-muted">{subtitle}</p> : null}
                </div>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
        </div>
    );
}

function PublicPortalHeader() {
    return (
        <header className="border-b border-[var(--ump-border)] bg-white">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3">
                <a href="/" className="ump-focusable inline-flex" aria-label="Go to home">
                    <img src="/images/ump-logo.png" alt="University of Mpumalanga" className="h-14 w-auto rounded bg-white px-2 py-1 md:h-16" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </a>
                <div className="ump-partner-marquee flex-1 bg-white py-0">
                    <div className="ump-partner-marquee-track">
                        {[1, 2].map((copy) => (
                            <div key={copy} className="ump-partner-marquee-set" aria-hidden={copy === 2}>
                                {PARTNERS.map((partner) => (
                                    <div key={`${copy}-${partner.label}`} className="ump-partner-marquee-item">
                                        <img src={partner.file} alt={partner.label} className="h-10 w-auto md:h-12" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}

function TopHeader({ user, onLogout }) {
    const role = roleValue(user);
    const location = useLocation();
    const headerRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [sidebarTop, setSidebarTop] = useState(0);
    const menuItems = role === 'student'
        ? [
            { label: 'Browse Slots', href: '/student#browse-slots' },
            { label: 'My Appointments', href: '/student#my-appointments' },
        ]
        : role === 'mentor'
            ? [
                { label: 'Availability', href: '/mentor#availability' },
                { label: 'Upcoming Sessions', href: '/mentor#upcoming' },
                { label: 'Session Calendar', href: '/mentor#calendar' },
            ]
            : [
                { label: 'Admin Overview', href: '/admin#admin-overview' },
                { label: 'Mentor Verification', href: '/admin#mentor-verification' },
                { label: 'Mentors & Availability', href: '/admin#mentors-availability' },
                { label: 'Upcoming Appointments', href: '/admin#upcoming-appointments' },
                { label: 'Announcements', href: '/admin#announcements' },
                { label: 'Centre Events', href: '/admin#centre-events' },
            ];

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname, location.hash]);

    useEffect(() => {
        const updateSidebarTop = () => {
            if (!headerRef.current) return;
            const { bottom } = headerRef.current.getBoundingClientRect();
            setSidebarTop(Math.max(0, Math.round(bottom)));
        };

        updateSidebarTop();
        window.addEventListener('resize', updateSidebarTop);
        window.addEventListener('scroll', updateSidebarTop, { passive: true });
        return () => {
            window.removeEventListener('resize', updateSidebarTop);
            window.removeEventListener('scroll', updateSidebarTop);
        };
    }, []);

    useEffect(() => {
        if (!menuOpen || !headerRef.current) return;
        const { bottom } = headerRef.current.getBoundingClientRect();
        setSidebarTop(Math.max(0, Math.round(bottom)));
    }, [menuOpen, location.pathname, location.hash]);

    return (
        <header ref={headerRef} className="w-full bg-[var(--ump-white)] shadow-sm">
            <div className="ump-top-header">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8">
                    <div className="flex w-full flex-wrap items-center gap-4 md:flex-nowrap md:gap-6">
                        <a href={roleHomePath(role)} className="inline-flex shrink-0">
                            <img src="/images/ump-logo.png" alt="University of Mpumalanga" className="h-14 w-auto md:h-16" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </a>
                        <div className="ump-partner-marquee flex-1 bg-white py-0">
                            <div className="ump-partner-marquee-track">
                                {[1, 2].map((copy) => (
                                    <div key={copy} className="ump-partner-marquee-set" aria-hidden={copy === 2}>
                                        {PARTNERS.map((partner) => (
                                            <div key={`${copy}-${partner.label}`} className="ump-partner-marquee-item">
                                                <img src={partner.file} alt={partner.label} className="h-10 w-auto md:h-12" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <nav className="ump-main-nav">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="flex items-center gap-1 py-2 text-sm">
                        <button
                            type="button"
                            aria-label="Toggle portal sections"
                            aria-expanded={menuOpen}
                            className="ump-focusable flex h-9 w-9 items-center justify-center rounded-md border border-white/30 bg-white text-base font-semibold text-[var(--ump-primary-navy)]"
                            onClick={() => setMenuOpen((prev) => !prev)}
                        >
                            <span aria-hidden="true">☰</span>
                        </button>
                        <div className="ml-auto"><button type="button" className="ump-btn ump-btn-secondary" onClick={onLogout}>Logout</button></div>
                    </div>
                </div>
            </nav>

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[var(--ump-border)] bg-white p-4 shadow-xl transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-hidden={!menuOpen}
                style={{ top: `${sidebarTop}px` }}
            >
                <div className="mb-3 flex items-center justify-between">
                    <p className="px-2 text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Portal Sections</p>
                    <button
                        type="button"
                        className="ump-focusable inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--ump-border)] text-[var(--ump-text-dark)] hover:bg-[var(--ump-page-gray)]"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close sidebar"
                    >
                        ×
                    </button>
                </div>
                <div className="space-y-1 text-sm">
                    {menuItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="ump-focusable block rounded-md px-2 py-2 hover:bg-[var(--ump-surface)]"
                            onClick={() => setMenuOpen(false)}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </aside>

            {menuOpen ? (
                <button
                    type="button"
                    aria-label="Close sidebar overlay"
                    className="fixed inset-0 z-30 bg-black/30"
                    style={{ top: `${sidebarTop}px` }}
                    onClick={() => setMenuOpen(false)}
                />
            ) : null}
        </header>
    );
}

function Sidebar({ role }) {
    if (!role || role === 'admin' || role === 'super_admin') return null;
    const items = role === 'student'
        ? [{ label: 'Browse Slots', route: '/student#browse-slots' }, { label: 'My Appointments', route: '/student#my-appointments' }]
        : role === 'mentor'
            ? [{ label: 'Availability', route: '/mentor#availability' }, { label: 'Upcoming Sessions', route: '/mentor#upcoming' }, { label: 'Session Calendar', route: '/mentor#calendar' }]
            : [{ label: 'Admin Overview', route: '/admin#admin-overview' }, { label: 'Mentor Verification', route: '/admin#mentor-verification' }, { label: 'Mentors & Availability', route: '/admin#mentors-availability' }, { label: 'Upcoming Appointments', route: '/admin#upcoming-appointments' }, { label: 'Announcements', route: '/admin#announcements' }, { label: 'Centre Events', route: '/admin#centre-events' }];
    return (
        <aside className="ump-sidebar h-fit p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Portal Modules</h2>
            <nav className="space-y-1">{items.map((item) => <a key={item.label} href={item.route} className="block rounded-md px-3 py-2 text-sm text-[var(--ump-text-dark)] hover:bg-[var(--ump-page-gray)]">{item.label}</a>)}</nav>
        </aside>
    );
}

function Shell({ user, onLogout, children }) {
    const role = roleValue(user);
    const hasSidebar = role !== 'admin' && role !== 'super_admin';
    const displayName = String(user?.name || user?.email || 'User').trim();

    return (
        <main className="min-h-screen bg-[var(--ump-page-gray)] text-[var(--ump-text-dark)]">
            <TopHeader user={user} onLogout={onLogout} />
            <div className={`mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:px-8 ${hasSidebar ? 'lg:grid-cols-[240px,1fr]' : ''}`}>
                <Sidebar role={role} />
                <main className="space-y-6">
                    <section className="rounded-xl border border-[var(--ump-border)] bg-white px-4 py-3 shadow-sm">
                        <p className="text-sm font-semibold text-[var(--ump-primary-navy)]">Welcome back, {displayName}.</p>
                    </section>
                    {children}
                </main>
            </div>
        </main>
    );
}

function LoginPage({ onAuthenticated, forcedRole = '' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [pendingMessage, setPendingMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const loginRole = useMemo(() => {
        const role = String(new URLSearchParams(location.search || '').get('role') || '').toLowerCase();
        return forcedRole || role;
    }, [forcedRole, location.search]);
    const title = loginRole === 'admin' ? 'UMPCFERI Admin Access' : loginRole === 'mentor' ? 'Mentor Sign In' : loginRole === 'student' ? 'Mentee Sign In' : 'User Sign In';

    useEffect(() => {
        const pending = String(new URLSearchParams(location.search || '').get('pending') || '');
        if (pending === '1') {
            setPendingMessage('Your mentor account is awaiting admin verification. You can sign in after approval.');
        }
    }, [location.search]);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setPendingMessage('');
        setLoading(true);
        try {
            const data = await login({ email, password });
            setAuth(data.token, data.user);
            onAuthenticated(data.user);
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
        <main className="min-h-screen bg-[var(--ump-page-gray)] text-[var(--ump-text-dark)]">
            <PublicPortalHeader />
            <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10">
                <section className="ump-card w-full max-w-md p-6 sm:p-8">
                    <div className="mb-5 text-center"><p className="text-xl font-semibold text-[var(--ump-primary-navy)]">{title}</p><p className="mt-1 text-sm ump-muted">Sign in as a mentee, mentor, or admin.</p></div>
                    <form className="grid gap-4" onSubmit={submit}>
                        <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]" htmlFor="email">Email</label><input id="email" className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]" htmlFor="password">Password</label><input id="password" className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                        {pendingMessage ? <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{pendingMessage}</p> : null}
                        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
                        <button className="ump-btn ump-btn-primary w-full" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign In'}</button>
                    </form>
                    <div className="mt-4 grid gap-2 text-sm">
                        <a className="text-center font-medium text-[var(--ump-deep-blue)] hover:underline" href="/forgot-password">Forgot password?</a>
                        <a className="text-center font-medium text-[var(--ump-deep-blue)] hover:underline" href="/register">Create an account</a>
                    </div>
                </section>
            </div>
        </main>
    );
}

function RegisterPage({ onAuthenticated }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'student', faculty: '' });
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
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
        <main className="min-h-screen bg-[var(--ump-page-gray)] text-[var(--ump-text-dark)]">
            <PublicPortalHeader />
            <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10">
                <section className="ump-card w-full max-w-md p-6 sm:p-8">
                    <div className="mb-5 text-center"><p className="text-xl font-semibold text-[var(--ump-primary-navy)]">Create Account</p><p className="mt-1 text-sm ump-muted">Register as a mentee or mentor.</p><p className="mt-1 text-xs ump-muted">Mentor accounts require admin verification before mentor portal access.</p></div>
                    <form className="grid gap-4" onSubmit={submit}>
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} required />
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} required />
                        <select className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm((v) => ({ ...v, role: e.target.value }))}><option value="student">Mentee</option><option value="mentor">Mentor</option></select>
                        {form.role === 'mentor' ? <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Faculty" value={form.faculty} onChange={(e) => setForm((v) => ({ ...v, faculty: e.target.value }))} /> : null}
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} required />
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Confirm password" type="password" value={form.password_confirmation} onChange={(e) => setForm((v) => ({ ...v, password_confirmation: e.target.value }))} required />
                        {status ? <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{status}</p> : null}
                        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
                        <button className="ump-btn ump-btn-primary w-full" type="submit">Register</button>
                    </form>
                </section>
            </div>
        </main>
    );
}

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [devToken, setDevToken] = useState('');
    const [error, setError] = useState('');
    return (
        <main className="min-h-screen bg-[var(--ump-page-gray)] text-[var(--ump-text-dark)]">
            <PublicPortalHeader />
            <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10">
                <section className="ump-card w-full max-w-md p-6 sm:p-8">
                    <div className="mb-5 text-center"><p className="text-xl font-semibold text-[var(--ump-primary-navy)]">Recover Password</p><p className="mt-1 text-sm ump-muted">Enter your email and we will send a reset link.</p></div>
                    {status ? <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{status}</div> : null}
                    {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
                    <form className="grid gap-4" onSubmit={async (event) => { event.preventDefault(); setError(''); try { const data = await forgotPassword(email); setStatus('If the email exists, a reset link has been issued.'); setDevToken(data?.reset_token || ''); } catch (err) { setError(toErrorMessage(err, 'Failed to send reset link')); } }}>
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <button className="ump-btn ump-btn-primary w-full" type="submit">Send Reset Link</button>
                    </form>
                    {devToken ? <p className="mt-3 text-xs ump-muted">Dev reset token: {devToken}</p> : null}
                </section>
            </div>
        </main>
    );
}

function ResetPasswordPage() {
    const [form, setForm] = useState({ email: '', token: '', password: '', password_confirmation: '' });
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    return (
        <main className="min-h-screen bg-[var(--ump-page-gray)] text-[var(--ump-text-dark)]">
            <PublicPortalHeader />
            <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10">
                <section className="ump-card w-full max-w-md p-6 sm:p-8">
                    <div className="mb-5 text-center"><p className="text-xl font-semibold text-[var(--ump-primary-navy)]">Reset Password</p><p className="mt-1 text-sm ump-muted">Set a new secure password.</p></div>
                    {status ? <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{status}</div> : null}
                    {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
                    <form className="grid gap-4" onSubmit={async (event) => { event.preventDefault(); setError(''); try { await resetPassword(form); setStatus('Password reset successful. You can now sign in.'); } catch (err) { setError(toErrorMessage(err, 'Failed to reset password')); } }}>
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} required />
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Reset token" value={form.token} onChange={(e) => setForm((v) => ({ ...v, token: e.target.value }))} required />
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="New password" type="password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} required />
                        <input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Confirm password" type="password" value={form.password_confirmation} onChange={(e) => setForm((v) => ({ ...v, password_confirmation: e.target.value }))} required />
                        <button className="ump-btn ump-btn-primary w-full" type="submit">Reset Password</button>
                    </form>
                </section>
            </div>
        </main>
    );
}

function LandingPage({ user }) {
    const [announcements, setAnnouncements] = useState([]);
    const [centreEvents, setCentreEvents] = useState([]);
    const [faqItems, setFaqItems] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([{ id: 1, fromBot: true, text: 'Hi, I can help with sign in, mentor verification, and appointments. What do you need?' }]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [home, faqResponse] = await Promise.all([
                    getHomeData(),
                    fetch('/data/faq.json', { cache: 'no-store' }),
                ]);
                if (!active) return;
                setAnnouncements(Array.isArray(home?.announcements) ? home.announcements : []);
                setCentreEvents(Array.isArray(home?.centreEvents) ? home.centreEvents : []);
                if (faqResponse.ok) {
                    const faqData = await faqResponse.json();
                    setFaqItems(Array.isArray(faqData) ? faqData : []);
                }
            } catch {
                if (!active) return;
                setAnnouncements([]);
                setCentreEvents([]);
            }
        })();
        return () => { active = false; };
    }, []);

    const replyFor = (value) => {
        const text = String(value || '').toLowerCase();
        for (const item of faqItems) {
            const keywords = Array.isArray(item.keywords) ? item.keywords : [];
            if (keywords.some((k) => text.includes(String(k).toLowerCase()))) return item.answer;
        }
        return 'I can help with login, mentor verification, and appointment booking. Please share a bit more detail.';
    };

    const sendChat = (value) => {
        const trimmed = String(value || '').trim();
        if (!trimmed) return;
        setChatMessages((prev) => [...prev, { id: prev.length + 1, fromBot: false, text: trimmed }]);
        setChatInput('');
        window.setTimeout(() => {
            setChatMessages((prev) => [...prev, { id: prev.length + 1, fromBot: true, text: replyFor(trimmed) }]);
        }, 250);
    };

    return (
        <main className="min-h-screen bg-[var(--ump-page-gray)] text-[var(--ump-text-dark)]">
            <PublicPortalHeader />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6">
                <section className="ump-card overflow-hidden p-0">
                    <div className="bg-[var(--ump-primary-navy)] px-6 py-12 text-white sm:px-10">
                        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--ump-accent-gold)]">UMPCFERI</p>
                        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to the UMPCFERI Mentorship Portal</h1>
                        <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">Connect mentees and mentors, manage availability, and oversee engagement outcomes from a single professional platform.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {user ? <a href={roleHomePath(roleValue(user))} className="ump-btn ump-btn-primary">Go to My Portal</a> : <><a href="/login?role=student" className="ump-btn ump-btn-primary">Mentee Portal</a><a href="/login?role=mentor" className="ump-btn ump-btn-secondary">Mentor Portal</a><a href="/admin/login" className="ump-btn border border-white/20 bg-transparent text-white hover:bg-white/10">Admin Portal</a></>}
                        </div>
                    </div>
                    <div className="grid gap-4 bg-white p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
                        <div className="rounded-lg border border-[var(--ump-border)] p-4"><h2 className="text-base font-semibold text-[var(--ump-primary-navy)]">Mentee</h2><p className="mt-2 text-sm ump-muted">Browse available slots and manage upcoming mentorship appointments.</p></div>
                        <div className="rounded-lg border border-[var(--ump-border)] p-4"><h2 className="text-base font-semibold text-[var(--ump-primary-navy)]">Mentor</h2><p className="mt-2 text-sm ump-muted">Review schedules, capture notes, and support mentee progression.</p></div>
                        <div className="rounded-lg border border-[var(--ump-border)] p-4"><h2 className="text-base font-semibold text-[var(--ump-primary-navy)]">Admin</h2><p className="mt-2 text-sm ump-muted">Manage mentors, availability, reports, operations, and system alerts.</p></div>
                    </div>
                </section>

                <Card title="Announcements" subtitle="Latest admin notices.">{announcements.length === 0 ? <p className="text-sm ump-muted">No announcements available.</p> : <div className="space-y-3">{announcements.map((a) => <div key={a.id} className="rounded-md border border-[var(--ump-border)] p-3"><div className="mb-1 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[var(--ump-primary-navy)]">{a.title}</p><span className="text-xs ump-muted">{a.type}</span></div><p className="text-sm text-[var(--ump-text-dark)]">{a.message}</p><p className="mt-1 text-xs ump-muted">{a.published_on || '-'}</p></div>)}</div>}</Card>

                <Card title="Upcoming Centre Events" subtitle="Events that will be held at UMPCFERI.">
                    <div className="overflow-x-auto">
                        <table className="ump-table min-w-[760px]"><thead><tr><th>Event</th><th>Date</th><th>Time</th><th>Venue</th><th>Category</th></tr></thead><tbody>{centreEvents.length === 0 ? <tr><td colSpan={5} className="ump-muted">No upcoming centre events yet.</td></tr> : centreEvents.map((event) => <tr key={event.id}><td>{event.title}</td><td>{event.event_date}</td><td>{formatTime(event.event_time)}</td><td>{event.venue}</td><td>{event.category}</td></tr>)}</tbody></table>
                    </div>
                </Card>

                <footer className="rounded-xl border border-[var(--ump-border)] bg-[var(--ump-primary-navy)] px-6 py-5 text-white">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><h2 className="text-base font-semibold">Support</h2><p className="mt-1 text-sm text-white/85">Need assistance with the portal?</p><p className="mt-2 text-sm"><span className="font-semibold text-[var(--ump-accent-gold)]">Email:</span> umpcferi-support@ump.ac.za</p><p className="mt-1 text-sm"><span className="font-semibold text-[var(--ump-accent-gold)]">Office Hours:</span> Mon-Fri, 08:00-16:30</p></div>
                        <button type="button" className="ump-btn inline-flex items-center gap-2 border border-white/20 bg-white text-[var(--ump-primary-navy)] hover:bg-[var(--ump-page-gray)]" onClick={() => setChatOpen(true)}>Chat with Bot</button>
                    </div>
                </footer>

                {chatOpen ? <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-h-[85vh] max-w-sm overflow-hidden rounded-xl border border-[var(--ump-border)] bg-white shadow-lg"><div className="flex items-center justify-between rounded-t-xl bg-[var(--ump-primary-navy)] px-4 py-3 text-white"><p className="text-sm font-semibold">UMPCFERI Assistant</p><button type="button" className="ump-focusable rounded px-2 py-1 text-xs text-white/90 hover:bg-white/10" onClick={() => setChatOpen(false)}>Close</button></div><div className="ump-scrollbar-hidden max-h-64 space-y-2 overflow-y-auto p-3 text-sm">{chatMessages.map((m) => <div key={m.id} className={m.fromBot ? 'max-w-[90%] rounded-md bg-[var(--ump-page-gray)] px-3 py-2 text-[var(--ump-text-dark)]' : 'ml-auto max-w-[90%] rounded-md bg-[var(--ump-primary-navy)] px-3 py-2 text-white'}>{m.text}</div>)}</div><div className="border-t border-[var(--ump-border)] px-3 py-2"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Choose a question</p><div className="ump-scrollbar-hidden flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">{faqItems.slice(0, 12).map((item) => <button key={item.question} type="button" className="ump-focusable rounded-full border border-[var(--ump-border)] bg-white px-3 py-1 text-xs text-[var(--ump-text-dark)] transition hover:bg-[var(--ump-page-gray)]" onClick={() => { setChatMessages((prev) => [...prev, { id: prev.length + 1, fromBot: false, text: item.question }, { id: prev.length + 2, fromBot: true, text: item.answer }]); }}>{item.question}</button>)}</div></div><form className="flex gap-2 border-t border-[var(--ump-border)] p-3" onSubmit={(e) => { e.preventDefault(); sendChat(chatInput); }}><input type="text" className="ump-focusable w-full rounded-md border border-[var(--ump-border)] px-3 py-2 text-sm" placeholder="Type your question..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} required /><button type="submit" className="ump-btn ump-btn-primary">Send</button></form></div> : null}
            </div>
        </main>
    );
}

function StudentDashboard() {
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedMentorId, setSelectedMentorId] = useState('');
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const [slotData, appointmentData] = await Promise.all([getStudentSlots({ from: new Date().toISOString().slice(0, 10) }), getStudentAppointments()]);
            setSlots(slotData);
            setAppointments(appointmentData);
        } catch (err) {
            setError(toErrorMessage(err, 'Failed to load student dashboard'));
        }
    };

    useEffect(() => { load(); }, []);

    const mentors = useMemo(() => {
        const map = new Map();
        slots.forEach((slot) => { if (slot.mentor?.id && !map.has(slot.mentor.id)) map.set(slot.mentor.id, slot.mentor); });
        return [...map.values()];
    }, [slots]);

    const filteredSlots = selectedMentorId ? slots.filter((slot) => slot.mentor?.id === selectedMentorId).slice(0, 20) : slots.slice(0, 20);

    return (
        <div className="space-y-6">
            <PageHeader title="Mentee Portal" subtitle="View mentors, check availability, and book a mentorship slot." />
            {error ? <Card><p className="text-sm text-red-700">{error}</p></Card> : null}
            <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
                <Card title="Mentors" subtitle="Select a mentor to view availability and slots."><div className="space-y-2">{mentors.map((mentor) => <button type="button" key={mentor.id} onClick={() => setSelectedMentorId(mentor.id)} className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${selectedMentorId === mentor.id ? 'border-[var(--ump-accent-gold)] bg-[var(--ump-accent-gold)]/20 font-semibold' : 'border-[var(--ump-border)] hover:bg-[var(--ump-page-gray)]'}`}><p>{mentor.name}</p><p className="text-xs ump-muted">{mentor.email}</p></button>)}</div></Card>
                <Card id="browse-slots" title="Availability and Slots" subtitle="Selected mentor availability and available bookable slots."><div className="overflow-x-auto"><table className="ump-table"><thead><tr><th>Date</th><th>Time</th><th>Mentor</th><th>Action</th></tr></thead><tbody>{filteredSlots.map((slot) => <tr key={slot.id}><td>{slot.date}</td><td>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</td><td>{slot.mentor?.name || '-'}</td><td><button className="ump-btn ump-btn-primary" onClick={async () => { await bookAppointment(slot.id); await load(); }}>Make Appointment</button></td></tr>)}</tbody></table></div></Card>
            </div>
            <Card id="my-appointments" title="My Appointments" subtitle="Booked sessions for the selected mentee."><div className="mt-3 overflow-x-auto"><table className="ump-table"><thead><tr><th>Date</th><th>Time</th><th>Mentor</th><th>Status</th><th>Action</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td>{appointment.time_slot?.date || '-'}</td><td>{formatTime(appointment.time_slot?.start_time)} - {formatTime(appointment.time_slot?.end_time)}</td><td>{appointment.mentor?.name || '-'}</td><td>{appointment.status}</td><td>{appointment.status !== 'cancelled' && appointment.status !== 'completed' ? <button className="ump-btn ump-btn-destructive" onClick={async () => { await cancelAppointment(appointment.id); await load(); }}>Cancel</button> : '-'}</td></tr>)}</tbody></table></div></Card>
        </div>
    );
}

function MentorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [availabilities, setAvailabilities] = useState([]);
    const [groupSessions, setGroupSessions] = useState([]);
    const [noteDrafts, setNoteDrafts] = useState({});
    const [groupForm, setGroupForm] = useState({ title: '', event_date: '', event_time: '', venue: '' });

    const load = async () => {
        const [appointmentsData, availabilityData, groupData] = await Promise.all([getMentorAppointments(), getMentorAvailability(), getMentorGroupSessions()]);
        setAppointments(appointmentsData);
        setAvailabilities(availabilityData);
        setGroupSessions(groupData);
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="space-y-4">
            <PageHeader title="Mentor Calendar" subtitle="Manage your mentorship sessions month by month." />
            <Card id="availability" title="My Availability Status" subtitle="Control your own availability windows."><div className="space-y-2 text-sm">{availabilities.length === 0 ? <p className="text-sm ump-muted">No availability windows assigned yet. Contact admin to add time windows.</p> : availabilities.map((a) => <div key={a.id} className="rounded-md border border-[var(--ump-border)] p-3 sm:flex sm:items-center sm:justify-between sm:gap-3"><div><p className="font-semibold text-[var(--ump-primary-navy)]">{String(a.day_of_week || '').replace(/^./, (x) => x.toUpperCase())} - {formatTime(a.start_time)} - {formatTime(a.end_time)}</p><p className={`mt-1 text-xs uppercase tracking-wide ${a.is_active ? 'text-green-700' : 'text-slate-500'}`}>{a.is_active ? 'Window Enabled' : 'Window Disabled'}</p></div><button type="button" className="ump-btn ump-btn-secondary !px-3 !py-1.5 !text-xs" onClick={async () => { await setMentorAvailabilityStatus(a.id, !a.is_active); await load(); }}>{a.is_active ? 'Set Unavailable' : 'Set Available'}</button></div>)}</div></Card>
            <Card id="upcoming" title="Upcoming Sessions" subtitle="Your next scheduled mentorship meetings."><div className="space-y-2 text-sm">{appointments.length === 0 ? <p className="text-sm ump-muted">No upcoming sessions found.</p> : appointments.map((a) => <div key={a.id} className="rounded-md border border-[var(--ump-border)] p-3"><p className="font-semibold text-[var(--ump-primary-navy)]">{a.time_slot?.date || '-'}</p><p className="mt-1">{formatTime(a.time_slot?.start_time)} - {formatTime(a.time_slot?.end_time)}</p><p className="mt-1">{a.student?.name || 'Mentee'}</p><p className="mt-1 text-xs uppercase tracking-wide">{a.status}</p><div className="mt-2 flex flex-wrap gap-2">{a.status === 'pending' ? <button type="button" className="ump-btn ump-btn-primary !px-3 !py-1.5 !text-xs" onClick={async () => { await confirmMentorAppointment(a.id); await load(); }}>Confirm</button> : null}{a.status === 'pending' ? <button type="button" className="ump-btn ump-btn-destructive !px-3 !py-1.5 !text-xs" onClick={async () => { await declineMentorAppointment(a.id); await load(); }}>Decline</button> : null}{a.status === 'confirmed' ? <button type="button" className="ump-btn ump-btn-primary !px-3 !py-1.5 !text-xs" onClick={async () => { await completeMentorAppointment(a.id); await load(); }}>Complete</button> : null}<input className="rounded border border-[var(--ump-border)] px-2 py-1" placeholder="Session note" value={noteDrafts[a.id] || ''} onChange={(e) => setNoteDrafts((v) => ({ ...v, [a.id]: e.target.value }))} /><button type="button" className="ump-btn ump-btn-secondary !px-3 !py-1.5 !text-xs" onClick={async () => { await saveMentorNotes(a.id, noteDrafts[a.id] || ''); }}>Save Note</button></div></div>)}</div></Card>
            <Card title="Events" subtitle="Create and manage mentor group sessions."><form className="grid gap-3 rounded-md border border-[var(--ump-border)] bg-white p-3 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); await createMentorGroupSession(groupForm); setGroupForm({ title: '', event_date: '', event_time: '', venue: '' }); await load(); }}><input className="sm:col-span-2 w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Group Session Title" value={groupForm.title} onChange={(e) => setGroupForm((v) => ({ ...v, title: e.target.value }))} required /><input type="date" className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" value={groupForm.event_date} onChange={(e) => setGroupForm((v) => ({ ...v, event_date: e.target.value }))} required /><input type="time" className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" value={groupForm.event_time} onChange={(e) => setGroupForm((v) => ({ ...v, event_time: e.target.value }))} required /><input className="sm:col-span-2 w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Venue" value={groupForm.venue} onChange={(e) => setGroupForm((v) => ({ ...v, venue: e.target.value }))} required /><div className="sm:col-span-2"><button className="ump-btn ump-btn-primary" type="submit">Create Group Session</button></div></form><div className="mt-3 space-y-2 text-sm">{groupSessions.length === 0 ? <p className="ump-muted">No group sessions created yet.</p> : groupSessions.map((s) => <div key={s.id} className="rounded-md border border-[var(--ump-border)] p-3"><p className="font-semibold text-[var(--ump-primary-navy)]">{s.title}</p><p className="mt-1 text-xs ump-muted">{s.event_date} - {formatTime(s.event_time)} - {s.venue}</p></div>)}</div></Card>
            <Card id="calendar" title="Session Calendar" subtitle="Month-style session overview."><p className="text-sm ump-muted">Calendar grid parity can be expanded, and all session actions are already wired.</p></Card>
        </div>
    );
}

function AdminDashboard() {
    const location = useLocation();
    const [mentors, setMentors] = useState([]);
    const [pendingMentors, setPendingMentors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [centreEvents, setCentreEvents] = useState([]);
    const [newMentor, setNewMentor] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [announcementForm, setAnnouncementForm] = useState({ title: '', type: '', message: '', published_on: '' });
    const [eventForm, setEventForm] = useState({ event_title: '', event_category: '', event_date: '', event_time: '', event_venue: '' });

    const activeSection = useMemo(() => {
        const hash = String(location.hash || '').replace('#', '');
        return hash || 'admin-overview';
    }, [location.hash]);

    const isActive = (sectionId) => activeSection === sectionId;

    const overviewData = useMemo(() => {
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const sevenDaysMs = 7 * oneDayMs;

        const parseAppointmentTime = (appointment) => {
            const date = appointment?.time_slot?.date;
            const start = appointment?.time_slot?.start_time;
            if (!date) return null;
            const datePart = String(date).slice(0, 10);
            const timePart = start ? `${String(start).slice(0, 5)}:00` : '00:00:00';
            const parsed = new Date(`${datePart}T${timePart}`);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        };

        const appointmentRows = appointments.map((appointment) => {
            const when = parseAppointmentTime(appointment);
            return {
                id: appointment.id,
                status: String(appointment.status || '').toLowerCase(),
                mentorName: appointment?.mentor?.name || 'Unassigned',
                studentName: appointment?.student?.name || 'Mentee',
                when,
            };
        });

        const pendingAppointments = appointmentRows.filter((row) => row.status === 'pending');
        const upcoming24h = appointmentRows.filter((row) => row.when && row.when >= now && row.when.getTime() - now.getTime() <= oneDayMs);
        const overdueConfirmations = pendingAppointments.filter((row) => row.when && row.when < now);
        const upcomingWeek = appointmentRows.filter((row) => row.when && row.when >= now && row.when.getTime() - now.getTime() <= sevenDaysMs);

        const bookingsByMentor = appointmentRows.reduce((acc, row) => {
            const key = row.mentorName;
            acc.set(key, (acc.get(key) || 0) + 1);
            return acc;
        }, new Map());

        const mentorLoad = [...bookingsByMentor.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        const mentorLowCapacity = mentors
            .map((mentor) => {
                const count = bookingsByMentor.get(mentor.name) || 0;
                const unavailable = Boolean(mentor.is_available === false || mentor.available === false || mentor.availability_status === false);
                return { id: mentor.id, name: mentor.name, count, unavailable };
            })
            .filter((mentor) => mentor.unavailable || mentor.count <= 1)
            .slice(0, 5);

        const slotDemand = appointmentRows.reduce((acc, row) => {
            if (!row.when) return acc;
            const key = row.when.toTimeString().slice(0, 5);
            acc.set(key, (acc.get(key) || 0) + 1);
            return acc;
        }, new Map());

        const peakSlots = [...slotDemand.entries()]
            .map(([slot, count]) => ({ slot, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthAppointments = appointmentRows.filter((row) => row.when && row.when.getMonth() === currentMonth && row.when.getFullYear() === currentYear);

        const bookingsByWeek = [0, 0, 0, 0, 0];
        monthAppointments.forEach((row) => {
            const week = Math.min(4, Math.floor((row.when.getDate() - 1) / 7));
            bookingsByWeek[week] += 1;
        });

        const completedCount = appointmentRows.filter((row) => row.status === 'completed').length;
        const cancelledCount = appointmentRows.filter((row) => row.status === 'cancelled').length;

        const newApplicationsThisMonth = pendingMentors.filter((mentor) => {
            const created = mentor?.created_at ? new Date(mentor.created_at) : null;
            return created && !Number.isNaN(created.getTime()) && created.getMonth() === currentMonth && created.getFullYear() === currentYear;
        }).length;

        const upcomingEvents = centreEvents
            .map((event) => {
                const datePart = event?.event_date ? String(event.event_date).slice(0, 10) : '';
                const timePart = event?.event_time ? `${String(event.event_time).slice(0, 5)}:00` : '00:00:00';
                const when = datePart ? new Date(`${datePart}T${timePart}`) : null;
                return { ...event, when };
            })
            .filter((event) => event.when && !Number.isNaN(event.when.getTime()) && event.when >= now)
            .sort((a, b) => a.when.getTime() - b.when.getTime());

        const nextEvent = upcomingEvents[0] || null;

        const recentActivity = [
            ...announcements.map((announcement) => ({
                id: `announcement-${announcement.id}`,
                label: `Announcement posted: ${announcement.title}`,
                when: announcement.published_on ? new Date(`${String(announcement.published_on).slice(0, 10)}T00:00:00`) : null,
            })),
            ...centreEvents.map((event) => ({
                id: `event-${event.id}`,
                label: `Centre event added: ${event.title}`,
                when: event.event_date ? new Date(`${String(event.event_date).slice(0, 10)}T00:00:00`) : null,
            })),
            ...pendingMentors.map((mentor) => ({
                id: `mentor-${mentor.id}`,
                label: `Mentor awaiting verification: ${mentor.name}`,
                when: mentor.created_at ? new Date(mentor.created_at) : null,
            })),
        ]
            .filter((item) => item.when && !Number.isNaN(item.when.getTime()))
            .sort((a, b) => b.when.getTime() - a.when.getTime())
            .slice(0, 10);

        return {
            pendingMentors: pendingMentors.length,
            upcoming24hCount: upcoming24h.length,
            overdueConfirmationsCount: overdueConfirmations.length,
            urgentUnassignedCount: appointmentRows.filter((row) => row.mentorName === 'Unassigned').length,
            mentorLoad,
            mentorLowCapacity,
            peakSlots,
            recentActivity,
            bookingsByWeek,
            completedCount,
            cancelledCount,
            newApplicationsThisMonth,
            announcementsCount: announcements.length,
            latestAnnouncementDate: announcements[0]?.published_on || null,
            upcomingEventsCount: upcomingEvents.length,
            nextEvent,
            weekCoverageGaps: mentors.length > 0 ? mentors.filter((mentor) => !upcomingWeek.some((row) => row.mentorName === mentor.name)).length : 0,
        };
    }, [appointments, announcements, centreEvents, mentors, pendingMentors]);

    const load = async () => {
        const [mentorData, pendingData, appointmentData, announcementData, eventData] = await Promise.all([
            getAdminMentors(),
            getPendingMentorVerifications(),
            getAdminAppointments(),
            getAdminAnnouncements(),
            getAdminCentreEvents(),
        ]);
        setMentors(mentorData);
        setPendingMentors(pendingData);
        setAppointments(appointmentData);
        setAnnouncements(announcementData);
        setCentreEvents(eventData);
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="space-y-6">
            {isActive('admin-overview') ? (
                <Card id="admin-overview" title="Admin Overview" subtitle="Quick summary of portal operations.">
                    <div className="relative overflow-hidden rounded-xl border border-[var(--ump-border)] bg-[var(--ump-primary-navy)] px-4 py-5 text-white sm:px-5">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-[var(--ump-accent-gold)]/20" />
                        <div className="relative">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Operations Cockpit</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg border border-white/20 bg-white/10 p-3"><p className="text-xs uppercase tracking-wide text-white/80">Pending Verifications</p><p className="mt-1 text-2xl font-semibold">{overviewData.pendingMentors}</p></div>
                                <div className="rounded-lg border border-white/20 bg-white/10 p-3"><p className="text-xs uppercase tracking-wide text-white/80">Sessions in 24h</p><p className="mt-1 text-2xl font-semibold">{overviewData.upcoming24hCount}</p></div>
                                <div className="rounded-lg border border-white/20 bg-white/10 p-3"><p className="text-xs uppercase tracking-wide text-white/80">Overdue Confirmations</p><p className="mt-1 text-2xl font-semibold">{overviewData.overdueConfirmationsCount}</p></div>
                                <div className="rounded-lg border border-white/20 bg-white/10 p-3"><p className="text-xs uppercase tracking-wide text-white/80">Unassigned Sessions</p><p className="mt-1 text-2xl font-semibold">{overviewData.urgentUnassignedCount}</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr,1fr]">
                        <div className="space-y-4">
                            <div className="rounded-lg border border-[var(--ump-border)] bg-white p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Approval Shortcuts</p>
                                    <span className="rounded-full bg-[var(--ump-page-gray)] px-2.5 py-1 text-xs font-semibold text-[var(--ump-primary-navy)]">Action Rail</span>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-3">
                                    <a href="/admin#mentor-verification" className="ump-focusable rounded-md border border-[var(--ump-border)] p-3 transition hover:-translate-y-0.5 hover:bg-[var(--ump-page-gray)]">
                                        <p className="text-xs uppercase tracking-wide text-[var(--ump-text-muted)]">Mentor Queue</p>
                                        <p className="mt-1 text-base font-semibold text-[var(--ump-primary-navy)]">{overviewData.pendingMentors}</p>
                                    </a>
                                    <a href="/admin#upcoming-appointments" className="ump-focusable rounded-md border border-[var(--ump-border)] p-3 transition hover:-translate-y-0.5 hover:bg-[var(--ump-page-gray)]">
                                        <p className="text-xs uppercase tracking-wide text-[var(--ump-text-muted)]">Pending Appointments</p>
                                        <p className="mt-1 text-base font-semibold text-[var(--ump-primary-navy)]">{overviewData.overdueConfirmationsCount}</p>
                                    </a>
                                    <a href="/admin#announcements" className="ump-focusable rounded-md border border-[var(--ump-border)] p-3 transition hover:-translate-y-0.5 hover:bg-[var(--ump-page-gray)]">
                                        <p className="text-xs uppercase tracking-wide text-[var(--ump-text-muted)]">Broadcast Desk</p>
                                        <p className="mt-1 text-base font-semibold text-[var(--ump-primary-navy)]">Publish</p>
                                    </a>
                                </div>
                            </div>

                            <div className="rounded-lg border border-[var(--ump-border)] bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Student Demand Radar</p>
                                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                                    <div className="rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)]/60 p-3">
                                        <p className="text-sm font-semibold text-[var(--ump-primary-navy)]">Most Requested Time Slots</p>
                                        {overviewData.peakSlots.length === 0 ? <p className="mt-2 text-sm ump-muted">No slot demand data yet.</p> : <ul className="mt-2 space-y-2 text-sm">{overviewData.peakSlots.map((slot, idx) => <li key={slot.slot} className="grid grid-cols-[18px,1fr,30px] items-center gap-2"><span className="text-xs font-semibold text-[var(--ump-accent-gold)]">{idx + 1}</span><span>{slot.slot}</span><span className="text-right font-semibold text-[var(--ump-primary-navy)]">{slot.count}</span></li>)}</ul>}
                                    </div>
                                    <div className="rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)]/60 p-3">
                                        <p className="text-sm font-semibold text-[var(--ump-primary-navy)]">Highest Booking Load</p>
                                        {overviewData.mentorLoad.length === 0 ? <p className="mt-2 text-sm ump-muted">No mentor load data yet.</p> : <ul className="mt-2 space-y-2 text-sm">{overviewData.mentorLoad.map((mentor) => <li key={mentor.name}><div className="mb-1 flex items-center justify-between"><span className="truncate pr-2">{mentor.name}</span><span className="font-semibold text-[var(--ump-primary-navy)]">{mentor.count}</span></div><div className="h-2 rounded bg-white"><div className="h-2 rounded bg-[var(--ump-primary-navy)]" style={{ width: `${Math.max(12, Math.min(100, mentor.count * 16))}%` }} /></div></li>)}</ul>}
                                    </div>
                                </div>
                                <div className="mt-3 rounded-md border border-[var(--ump-border)] p-3">
                                    <p className="text-sm font-semibold text-[var(--ump-primary-navy)]">Low Capacity Watchlist</p>
                                    {overviewData.mentorLowCapacity.length === 0 ? <p className="mt-1 text-sm ump-muted">No mentor capacity risks detected.</p> : <div className="mt-2 flex flex-wrap gap-2">{overviewData.mentorLowCapacity.map((mentor) => <span key={mentor.id} className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{mentor.name}<span className="text-[10px] uppercase tracking-wide">{mentor.count <= 1 ? 'Low' : 'Off'}</span></span>)}</div>}
                                </div>
                            </div>

                            <div className="rounded-lg border border-[var(--ump-border)] bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Monthly Trend Mini-Charts</p>
                                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                                    <div>
                                        <p className="mb-2 text-sm font-semibold text-[var(--ump-primary-navy)]">Bookings by Week</p>
                                        <div className="flex items-end gap-2 rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)]/60 px-3 pb-2 pt-4">{overviewData.bookingsByWeek.map((value, idx) => { const max = Math.max(1, ...overviewData.bookingsByWeek); const height = 24 + Math.round((value / max) * 72); return <div key={`week-bar-${idx}`} className="flex-1 text-center"><div className="mx-auto w-full max-w-10 rounded-t bg-[var(--ump-deep-blue)]" style={{ height: `${height}px` }} /><p className="mt-1 text-[11px] font-semibold text-[var(--ump-primary-navy)]">W{idx + 1}</p><p className="text-[11px] ump-muted">{value}</p></div>; })}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="rounded-md border border-[var(--ump-border)] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Completed vs Cancelled</p><p className="mt-1 text-sm text-[var(--ump-text-dark)]">{overviewData.completedCount} completed / {overviewData.cancelledCount} cancelled</p></div>
                                        <div className="rounded-md border border-[var(--ump-border)] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">New Mentor Applications</p><p className="mt-1 text-sm text-[var(--ump-text-dark)]">{overviewData.newApplicationsThisMonth} this month</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-lg border border-[var(--ump-border)] bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Alert Stack</p>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-800">Overdue confirmations: <span className="font-semibold">{overviewData.overdueConfirmationsCount}</span></div>
                                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">Mentors without bookings in next 7 days: <span className="font-semibold">{overviewData.weekCoverageGaps}</span></div>
                                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">Reminder delivery status is not currently tracked in this view.</div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-[var(--ump-border)] bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Communication Status</p>
                                <div className="mt-2 grid gap-2 text-sm">
                                    <div className="rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)]/60 p-3"><p className="text-xs uppercase tracking-wide text-[var(--ump-text-muted)]">Announcements Live</p><p className="mt-1 text-xl font-semibold text-[var(--ump-primary-navy)]">{overviewData.announcementsCount}</p><p className="mt-1 text-xs ump-muted">Latest: {overviewData.latestAnnouncementDate || '-'}</p></div>
                                    <div className="rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)]/60 p-3"><p className="text-xs uppercase tracking-wide text-[var(--ump-text-muted)]">Upcoming Centre Events</p><p className="mt-1 text-xl font-semibold text-[var(--ump-primary-navy)]">{overviewData.upcomingEventsCount}</p><p className="mt-1 text-xs ump-muted">Next: {overviewData.nextEvent?.title || '-'} {overviewData.nextEvent?.event_date ? `(${overviewData.nextEvent.event_date})` : ''}</p></div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-[var(--ump-border)] bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Recent Activity Feed</p>
                                {overviewData.recentActivity.length === 0 ? <p className="mt-2 text-sm ump-muted">No recent activity available.</p> : <ul className="mt-2 border-l-2 border-[var(--ump-border)] pl-3 text-sm">{overviewData.recentActivity.map((item) => <li key={item.id} className="relative mb-3 last:mb-0"><span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--ump-primary-navy)]" /><p className="font-medium text-[var(--ump-text-dark)]">{item.label}</p><p className="mt-0.5 text-xs ump-muted">{item.when.toLocaleString()}</p></li>)}</ul>}
                            </div>
                        </div>
                    </div>
                </Card>
            ) : null}

            {isActive('mentor-verification') ? (
                <Card id="mentor-verification" title="Mentors Waiting Verification" subtitle="Approve mentor profiles before they can access the mentor portal.">
                    {mentors.length === 0 ? <p className="text-sm ump-muted">No mentors found.</p> : <div className="space-y-3">{mentors.map((m) => {
                        const isPending = pendingMentors.some((pendingMentor) => pendingMentor.id === m.id);
                        return <div key={m.id} className="flex flex-col gap-3 rounded-md border border-[var(--ump-border)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[var(--ump-primary-navy)]">{m.name}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isPending ? 'border border-amber-200 bg-amber-50 text-amber-800' : 'border border-green-200 bg-green-50 text-green-800'}`}>{isPending ? 'Unverified' : 'Verified'}</span></div><p className="text-xs ump-muted">{m.email}</p></div>{isPending ? <button type="button" className="ump-btn ump-btn-primary !px-3 !py-1.5 !text-xs" onClick={async () => { await verifyMentor(m.id); await load(); }}>Verify Mentor</button> : <span className="text-xs font-semibold uppercase tracking-wide text-green-700">Verified</span>}</div>;
                    })}</div>}
                </Card>
            ) : null}

            {isActive('mentors-availability') ? (
                <Card id="mentors-availability" title="Mentors and Availability" subtitle="Manage existing mentors and edit their availability windows.">
                    <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={async (e) => { e.preventDefault(); await createMentor(newMentor); setNewMentor({ name: '', email: '', password: '', password_confirmation: '' }); await load(); }}><input className="rounded border border-[var(--ump-border)] px-3 py-2" placeholder="Name" value={newMentor.name} onChange={(e) => setNewMentor((v) => ({ ...v, name: e.target.value }))} required /><input className="rounded border border-[var(--ump-border)] px-3 py-2" type="email" placeholder="Email" value={newMentor.email} onChange={(e) => setNewMentor((v) => ({ ...v, email: e.target.value }))} required /><input className="rounded border border-[var(--ump-border)] px-3 py-2" type="password" placeholder="Password" value={newMentor.password} onChange={(e) => setNewMentor((v) => ({ ...v, password: e.target.value }))} required /><input className="rounded border border-[var(--ump-border)] px-3 py-2" type="password" placeholder="Confirm" value={newMentor.password_confirmation} onChange={(e) => setNewMentor((v) => ({ ...v, password_confirmation: e.target.value }))} required /><button className="ump-btn ump-btn-primary md:col-span-4" type="submit">Create Mentor</button></form>
                    <ul className="mt-2 list-disc pl-5 text-sm">{mentors.map((mentor) => <li key={mentor.id}>{mentor.name} ({mentor.email})</li>)}</ul>
                </Card>
            ) : null}

            {isActive('upcoming-appointments') ? (
                <Card id="upcoming-appointments" title="Upcoming Appointments" subtitle="Admin-only scheduling overview.">
                    <div className="overflow-x-auto"><table className="ump-table min-w-[760px]"><thead><tr><th>Mentee</th><th>Mentor</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead><tbody>{appointments.length === 0 ? <tr><td colSpan={6} className="ump-muted">No upcoming appointments found.</td></tr> : appointments.map((a) => <tr key={a.id}><td>{a.student?.name || '-'}</td><td>{a.mentor?.name || '-'}</td><td>{a.time_slot?.date || '-'}</td><td>{formatTime(a.time_slot?.start_time)}</td><td>{a.status}</td><td><div className="flex flex-wrap gap-2">{a.status === 'pending' ? <button type="button" className="ump-btn ump-btn-primary !px-3 !py-1.5 !text-xs" onClick={async () => { await approveAdminAppointment(a.id); await load(); }}>Approve</button> : null}<a href={`/admin/appointments/${a.id}`} className="ump-focusable inline-flex items-center justify-center rounded-md border border-[var(--ump-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ump-text-dark)] transition hover:bg-[var(--ump-page-gray)]">View</a></div></td></tr>)}</tbody></table></div>
                </Card>
            ) : null}

            {isActive('announcements') ? (
                <Card id="announcements" title="Announcements" subtitle="Latest admin notices.">
                    <form className="mt-3 grid gap-3 border-t border-[var(--ump-border)] pt-3" onSubmit={async (e) => { e.preventDefault(); await createAdminAnnouncement(announcementForm); setAnnouncementForm({ title: '', type: '', message: '', published_on: '' }); await load(); }}><input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm((v) => ({ ...v, title: e.target.value }))} required /><input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Type" value={announcementForm.type} onChange={(e) => setAnnouncementForm((v) => ({ ...v, type: e.target.value }))} required /><textarea className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" rows={3} placeholder="Message" value={announcementForm.message} onChange={(e) => setAnnouncementForm((v) => ({ ...v, message: e.target.value }))} required /><input type="date" className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" value={announcementForm.published_on} onChange={(e) => setAnnouncementForm((v) => ({ ...v, published_on: e.target.value }))} required /><button className="ump-btn ump-btn-primary" type="submit">Add Announcement</button></form>
                    <div className="mt-3 space-y-3">{announcements.length === 0 ? <p className="text-sm ump-muted">No announcements yet. Add one using the form.</p> : announcements.map((a) => <div key={a.id} className="rounded-md border border-[var(--ump-border)] p-3"><div className="mb-1 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[var(--ump-primary-navy)]">{a.title}</p><span className="text-xs ump-muted">{a.type}</span></div><p className="text-sm text-[var(--ump-text-dark)]">{a.message}</p><div className="mt-2 flex items-center justify-between gap-3"><p className="text-xs ump-muted">{a.published_on || '-'}</p><button type="button" className="ump-btn ump-btn-destructive !px-3 !py-1.5 !text-xs" onClick={async () => { await deleteAdminAnnouncement(a.id); await load(); }}>Delete</button></div></div>)}</div>
                </Card>
            ) : null}

            {isActive('centre-events') ? (
                <Card id="centre-events" title="Centre Events" subtitle="Manage events shown in Upcoming Centre Events on the home page.">
                    <form className="mt-3 grid gap-3 border-t border-[var(--ump-border)] pt-3 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); await createAdminCentreEvent(eventForm); setEventForm({ event_title: '', event_category: '', event_date: '', event_time: '', event_venue: '' }); await load(); }}><input className="sm:col-span-2 w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Event" value={eventForm.event_title} onChange={(e) => setEventForm((v) => ({ ...v, event_title: e.target.value }))} required /><input type="date" className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" value={eventForm.event_date} onChange={(e) => setEventForm((v) => ({ ...v, event_date: e.target.value }))} required /><input type="time" className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" value={eventForm.event_time} onChange={(e) => setEventForm((v) => ({ ...v, event_time: e.target.value }))} required /><input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Venue" value={eventForm.event_venue} onChange={(e) => setEventForm((v) => ({ ...v, event_venue: e.target.value }))} required /><input className="w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" placeholder="Category" value={eventForm.event_category} onChange={(e) => setEventForm((v) => ({ ...v, event_category: e.target.value }))} required /><div className="sm:col-span-2"><button className="ump-btn ump-btn-primary" type="submit">Add Centre Event</button></div></form>
                    <div className="mt-3 space-y-3">{centreEvents.length === 0 ? <p className="text-sm ump-muted">No centre events yet. Add one using the form.</p> : centreEvents.map((event) => <div key={event.id} className="rounded-md border border-[var(--ump-border)] p-3"><div className="mb-1 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[var(--ump-primary-navy)]">{event.title}</p><span className="text-xs ump-muted">{event.category}</span></div><p className="text-sm text-[var(--ump-text-dark)]">{event.event_date} - {formatTime(event.event_time)} - {event.venue}</p><div className="mt-2 flex items-center justify-end"><button type="button" className="ump-btn ump-btn-destructive !px-3 !py-1.5 !text-xs" onClick={async () => { await deleteAdminCentreEvent(event.id); await load(); }}>Delete</button></div></div>)}</div>
                </Card>
            ) : null}
        </div>
    );
}

function AdminAppointmentShowPage() {
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await getAdminAppointment(id);
                if (active) setAppointment(data);
            } catch (err) {
                if (active) setError(toErrorMessage(err, 'Failed to load appointment details'));
            }
        })();
        return () => { active = false; };
    }, [id]);

    if (error) return <Card><p className="text-sm text-red-700">{error}</p></Card>;
    if (!appointment) return <Card><p className="text-sm ump-muted">Loading appointment details...</p></Card>;

    return (
        <div className="space-y-6">
            <PageHeader title="Appointment Details" subtitle="Admin review of a mentorship appointment." actions={<a href="/admin#upcoming-appointments" className="ump-focusable inline-flex items-center justify-center rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--ump-text-dark)] transition hover:bg-[var(--ump-page-gray)]">Back to Appointments</a>} />
            <Card>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Mentee</p><p className="mt-1 font-semibold text-[var(--ump-text-dark)]">{appointment.student?.name || '-'}</p><p className="text-xs ump-muted">{appointment.student?.email || '-'}</p></div>
                    <div className="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Mentor</p><p className="mt-1 font-semibold text-[var(--ump-text-dark)]">{appointment.mentor?.name || '-'}</p><p className="text-xs ump-muted">{appointment.mentor?.email || '-'}</p></div>
                    <div className="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Date and Time</p><p className="mt-1 font-semibold text-[var(--ump-text-dark)]">{appointment.time_slot?.date || '-'} {formatTime(appointment.time_slot?.start_time)} - {formatTime(appointment.time_slot?.end_time)}</p></div>
                    <div className="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Status</p><p className="mt-1 font-semibold text-[var(--ump-text-dark)]">{appointment.status || '-'}</p></div>
                </div>
                {appointment.status === 'pending' ? <div className="mt-4"><button type="button" className="ump-btn ump-btn-primary" onClick={async () => { const updated = await approveAdminAppointment(appointment.id); setAppointment(updated); }}>Approve Appointment</button></div> : null}
            </Card>
        </div>
    );
}

function RequireRole({ user, allowed, children }) {
    if (!user) return <Navigate to="/login" replace />;
    const role = roleValue(user);
    if (!allowed.includes(role)) return <Navigate to={roleHomePath(role)} replace />;
    return children;
}

function AppRoutes({ user, setUser }) {
    const logoutNow = async () => {
        try { await logout(); } catch { }
        clearAuth();
        setUser(null);
    };

    return (
        <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/login" element={user ? <Navigate to={roleHomePath(roleValue(user))} replace /> : <LoginPage onAuthenticated={setUser} />} />
            <Route path="/admin/login" element={user ? <Navigate to={roleHomePath(roleValue(user))} replace /> : <LoginPage onAuthenticated={setUser} forcedRole="admin" />} />
            <Route path="/register" element={user ? <Navigate to={roleHomePath(roleValue(user))} replace /> : <RegisterPage onAuthenticated={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/student" element={<RequireRole user={user} allowed={['student']}><Shell user={user} onLogout={logoutNow}><StudentDashboard /></Shell></RequireRole>} />
            <Route path="/mentor" element={<RequireRole user={user} allowed={['mentor']}><Shell user={user} onLogout={logoutNow}><MentorDashboard /></Shell></RequireRole>} />
            <Route path="/admin" element={<RequireRole user={user} allowed={['admin', 'super_admin']}><Shell user={user} onLogout={logoutNow}><AdminDashboard /></Shell></RequireRole>} />
            <Route path="/admin/appointments/:id" element={<RequireRole user={user} allowed={['admin', 'super_admin']}><Shell user={user} onLogout={logoutNow}><AdminAppointmentShowPage /></Shell></RequireRole>} />

            <Route path="/portal" element={<Navigate to={user ? roleHomePath(roleValue(user)) : '/login'} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    const [user, setUser] = useState(getStoredUser());
    const [booting, setBooting] = useState(true);

    useEffect(() => {
        let active = true;
        const boot = async () => {
            if (!user) {
                setBooting(false);
                return;
            }
            try {
                const current = await me();
                if (active) {
                    setUser(current);
                    setAuth('', current);
                }
            } catch {
                clearAuth();
                if (active) setUser(null);
            } finally {
                if (active) setBooting(false);
            }
        };
        boot();
        return () => { active = false; };
    }, []);

    if (booting) return <main className="grid min-h-screen place-items-center">Loading...</main>;
    return <BrowserRouter><AppRoutes user={user} setUser={setUser} /></BrowserRouter>;
}
