import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { clearAuth, getStoredUser, logout, me, setAuth } from './api';

import { BRAND } from './brand';
import Homepage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointmentShowPage from './pages/AdminAppointmentShowPage';
import MentorsPage from './pages/MentorsPage';
import MentorProfilePage from './pages/MentorProfilePage';
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import ContactPage from './pages/ContactPage';

const FACULTY_OPTIONS = [
    'Faculty of Agriculture and Natural Sciences',
    'Faculty of Economics, Development and Business Sciences',
    'Faculty of Education',
    'Faculty of Humanities',
    'Faculty of Engineering and the Built Environment',
    'Faculty of Information and Communication Technology',
    'Faculty of Health Sciences',
    'Faculty of Law',
    'Faculty of Public Administration and Management',
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
                            <img src={BRAND.logo} alt={BRAND.name} className="h-14 w-auto md:h-16" />
                        </a>
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
                            <span aria-hidden="true">â˜°</span>
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
                        Ã—
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
        <aside className="ump-sidebar hidden h-fit p-4 lg:block">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Portal Modules</h2>
            <nav className="space-y-1">{items.map((item) => <a key={item.label} href={item.route} className="block rounded-md px-3 py-2 text-sm text-[var(--ump-text-dark)] hover:bg-[var(--ump-page-gray)]">{item.label}</a>)}</nav>
        </aside>
    );
}

function StudentChatWidget() {
    const [faqItems, setFaqItems] = useState([]);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([{ id: 1, fromBot: true, text: 'Hi, I can help with booking, appointments, and mentor info. What do you need?' }]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const faqResponse = await fetch('/data/faq.json', { cache: 'no-store' });
                if (!active || !faqResponse.ok) return;
                const faqData = await faqResponse.json();
                setFaqItems(Array.isArray(faqData) ? faqData : []);
            } catch {
                if (!active) return;
                setFaqItems([]);
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
        return 'I can help with login, mentor selection, and appointment booking. Please share a bit more detail.';
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
        <>
            {!chatOpen ? (
                <button
                    type="button"
                    aria-label="Open chat assistant"
                    className="tma-btn tma-btn-primary fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 shadow-lg"
                    onClick={() => setChatOpen(true)}
                >
                    Chat with Bot
                </button>
            ) : null}
            {chatOpen ? (
                <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-h-[85vh] max-w-sm overflow-hidden rounded-xl border border-[var(--ump-border)] bg-white shadow-lg">
                    <div className="flex items-center justify-between rounded-t-xl bg-[var(--ump-primary-navy)] px-4 py-3 text-white">
                        <p className="text-sm font-semibold">UMPCFERI Assistant</p>
                        <button type="button" className="ump-focusable rounded px-2 py-1 text-xs text-white/90 hover:bg-white/10" onClick={() => setChatOpen(false)}>Close</button>
                    </div>
                    <div className="ump-scrollbar-hidden max-h-64 space-y-2 overflow-y-auto p-3 text-sm">
                        {chatMessages.map((m) => (
                            <div key={m.id} className={m.fromBot ? 'max-w-[90%] rounded-md bg-[var(--ump-page-gray)] px-3 py-2 text-[var(--ump-text-dark)]' : 'ml-auto max-w-[90%] rounded-md bg-[var(--ump-primary-navy)] px-3 py-2 text-white'}>
                                {m.text}
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[var(--ump-border)] px-3 py-2">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Choose a question</p>
                        <div className="ump-scrollbar-hidden flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
                            {faqItems.slice(0, 12).map((item) => (
                                <button key={item.question} type="button" className="ump-focusable ump-gold-hover rounded-full border border-[var(--ump-border)] bg-white px-3 py-1 text-xs text-[var(--ump-text-dark)]" onClick={() => { setChatMessages((prev) => [...prev, { id: prev.length + 1, fromBot: false, text: item.question }, { id: prev.length + 2, fromBot: true, text: item.answer }]); }}>
                                    {item.question}
                                </button>
                            ))}
                        </div>
                    </div>
                    <form className="flex gap-2 border-t border-[var(--ump-border)] p-3" onSubmit={(e) => { e.preventDefault(); sendChat(chatInput); }}>
                        <input type="text" className="ump-focusable w-full rounded-md border border-[var(--ump-border)] px-3 py-2 text-sm" placeholder="Type your question..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} required />
                        <button type="submit" className="ump-btn ump-btn-primary">Send</button>
                    </form>
                </div>
            ) : null}
        </>
    );
}

function Shell({ user, onLogout, children }) {
    const role = roleValue(user);
    const hasSidebar = role !== 'admin' && role !== 'super_admin';
    const displayName = String(user?.name || user?.email || 'User').trim();
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        setShowWelcome(true);
        const timer = window.setTimeout(() => setShowWelcome(false), 4500);
        return () => window.clearTimeout(timer);
    }, [displayName, role]);

    return (
        <main className="min-h-screen bg-[var(--ump-page-gray)] text-[var(--ump-text-dark)]">
            <TopHeader user={user} onLogout={onLogout} />
            {showWelcome ? (
                <div className="pointer-events-none fixed left-1/2 top-24 z-50 w-[92vw] max-w-lg -translate-x-1/2 px-4 sm:top-28">
                    <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border border-[var(--ump-border)] bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ump-text-muted)]">Signed in</p>
                            <p className="truncate text-sm font-semibold text-[var(--ump-primary-navy)]">Welcome back, {displayName}</p>
                        </div>
                        <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--ump-accent-gold)]/20 text-center leading-9 text-[var(--ump-primary-navy)]">
                            {displayName ? String(displayName).slice(0, 1).toUpperCase() : 'U'}
                        </div>
                    </div>
                </div>
            ) : null}
            <div className={`mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:px-8 ${hasSidebar ? 'lg:grid-cols-[240px,1fr]' : ''}`}>
                <Sidebar role={role} />
                <main className="space-y-6">
                    {children}
                </main>
            </div>
            <footer className="mt-12 border-t border-[var(--tma-border)] bg-white py-6 text-center text-xs text-[var(--tma-muted)]">
                {BRAND.name} · Mentorship operations portal
            </footer>
        </main>
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
            <Route path="/" element={<Homepage user={user} />} />
            <Route path="/about" element={<AboutPage user={user} />} />
            <Route path="/mentors" element={<MentorsPage user={user} />} />
            <Route path="/mentors/:id" element={<MentorProfilePage user={user} />} />
            <Route path="/programs" element={<ProgramsPage user={user} />} />
            <Route path="/contact" element={<ContactPage user={user} />} />
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

