import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout as apiLogout, clearAuth } from '../api';
import { BRAND } from '../brand';

const ROLE_SIDEBAR_ITEMS = {
    student: [
        { label: 'Dashboard', to: '/student', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: 'Find a Mentor', to: '/mentors', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
        { label: 'My Appointments', to: '/student/appointments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { label: 'Profile', to: '/student/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ],
    mentor: [
        { label: 'Dashboard', to: '/mentor', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: 'Availability', to: '/mentor/availability', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { label: 'Upcoming Sessions', to: '/mentor/sessions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { label: 'Group Sessions', to: '/mentor#group-sessions', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { label: 'Profile', to: '/mentor', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ],
    admin: [
        { label: 'Dashboard', to: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: 'Overview', to: '/admin#admin-overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { label: 'Mentor Verification', to: '/admin#mentor-verification', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { label: 'Mentors & Availability', to: '/admin#mentors-availability', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { label: 'Upcoming Appointments', to: '/admin#upcoming-appointments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { label: 'Bookings', to: '/admin/bookings', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Announcements', to: '/admin#announcements', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { label: 'Centre Events', to: '/admin#centre-events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
};

function Sidebar({ role, isOpen, onClose }) {
    const items = ROLE_SIDEBAR_ITEMS[role] || ROLE_SIDEBAR_ITEMS.student;

    const handleNav = () => {
        if (window.innerWidth < 1024) onClose();
    };

    return (
        <>
            {isOpen && (
                <button type="button" className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} aria-label="Close sidebar overlay" />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-[var(--tma-border)] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ top: 0 }}
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--tma-border)]">
                        <Link to={role === 'admin' ? '/admin' : `/${role}`} className="flex items-center gap-3" onClick={onClose}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--tma-pink)] text-white font-bold text-lg">
                                {BRAND.shortName?.[0] || 'T'}
                            </div>
                            <div>
                                <span className="text-sm font-bold tracking-wide text-[var(--tma-text)]">MENTORSHIP</span>
                                <span className="text-sm font-bold tracking-wide text-[var(--tma-pink)]"> ACADEMY</span>
                            </div>
                        </Link>
                        <button type="button" className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100" onClick={onClose} aria-label="Close">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                        {items.map((item) => {
                            const isHash = item.to.includes('#');
                            if (isHash) {
                                return (
                                    <a
                                        key={item.label}
                                        href={item.to}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const target = document.getElementById(item.to.split('#')[1]);
                                            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            handleNav();
                                        }}
                                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--tma-text)] transition-all duration-200 hover:bg-[var(--tma-surface)] hover:text-[var(--tma-pink)]"
                                    >
                                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                                        {item.label}
                                    </a>
                                );
                            }
                            return (
                                <NavLink
                                    key={item.label}
                                    to={item.to}
                                    onClick={handleNav}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'bg-[var(--tma-pink)]/10 text-[var(--tma-pink)] shadow-sm'
                                                : 'text-[var(--tma-text)] hover:bg-[var(--tma-surface)] hover:text-[var(--tma-pink)]'
                                        }`
                                    }
                                >
                                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="border-t border-[var(--tma-border)] p-4">
                        <button
                            type="button"
                            onClick={() => { onClose(); apiLogout().catch(() => {}); clearAuth(); window.location.href = '/login'; }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default function DashboardShell({ user, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const navigate = useNavigate();
    const role = user?.role || 'student';
    const displayName = String(user?.name || user?.email || 'User').trim().split(' ')[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileMenuOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        apiLogout().catch(() => {});
        clearAuth();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[var(--tma-surface)] text-[var(--tma-text)]">
            <header className="sticky top-0 z-30 border-b border-[var(--tma-border)] bg-white/95 backdrop-blur-sm shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:pl-72 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--tma-border)] bg-white shadow-sm transition-all hover:border-[var(--tma-pink)] hover:shadow-md lg:hidden"
                            onClick={() => setSidebarOpen((v) => !v)}
                            aria-label="Toggle sidebar"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--tma-text)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={`hidden md:flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200 ${searchFocused ? 'border-[var(--tma-pink)] shadow-md w-64' : 'border-[var(--tma-border)] w-48'}`}>
                            <svg className="h-4 w-4 shrink-0 text-[var(--tma-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--tma-muted)]"
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                            />
                        </div>

                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                onClick={() => { setProfileMenuOpen(false); setNotifOpen((v) => !v); }}
                                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--tma-border)] bg-white shadow-sm transition-all hover:border-[var(--tma-pink)] hover:shadow-md"
                                aria-label="Notifications"
                                aria-expanded={notifOpen}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--tma-text)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--tma-pink)] text-[10px] font-bold text-white">3</span>
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--tma-border)] bg-white shadow-xl z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--tma-border)]">
                                        <p className="text-sm font-bold text-[var(--tma-text)]">Notifications</p>
                                        <span className="text-xs font-semibold text-[var(--tma-pink)]">3 new</span>
                                    </div>
                                    <div className="divide-y divide-[var(--tma-border)]">
                                        <button type="button" className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tma-surface)]">
                                            <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[var(--tma-pink)]" />
                                            <div>
                                                <p className="text-sm text-[var(--tma-text)]">Session confirmed with <strong>Dr. Sarah M.</strong></p>
                                                <p className="mt-1 text-xs text-[var(--tma-muted)]">2 minutes ago</p>
                                            </div>
                                        </button>
                                        <button type="button" className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tma-surface)]">
                                            <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[var(--tma-gold)]" />
                                            <div>
                                                <p className="text-sm text-[var(--tma-text)]">New mentorship cohort is now open</p>
                                                <p className="mt-1 text-xs text-[var(--tma-muted)]">1 hour ago</p>
                                            </div>
                                        </button>
                                        <button type="button" className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--tma-surface)]">
                                            <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[var(--tma-pink)]" />
                                            <div>
                                                <p className="text-sm text-[var(--tma-text)]">Mentor request pending approval</p>
                                                <p className="mt-1 text-xs text-[var(--tma-muted)]">Yesterday</p>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="border-t border-[var(--tma-border)] px-4 py-2.5 text-center">
                                        <button type="button" className="text-xs font-semibold text-[var(--tma-pink)] transition-colors hover:text-[var(--tma-pink-dark)]">View all notifications</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setProfileMenuOpen((v) => !v)}
                                className="flex items-center gap-2 rounded-xl border border-[var(--tma-border)] bg-white px-3 py-2 shadow-sm transition-all hover:border-[var(--tma-pink)] hover:shadow-md"
                                aria-expanded={profileMenuOpen}
                            >
                                <span className="hidden text-sm font-semibold text-[var(--tma-text)] sm:block">{displayName}</span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--tma-pink)]/10 text-sm font-bold text-[var(--tma-pink)]">
                                    {displayName?.[0]?.toUpperCase()}
                                </span>
                            </button>

                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--tma-border)] bg-white shadow-xl z-50">
                                    <div className="p-3 border-b border-[var(--tma-border)]">
                                        <p className="text-xs font-semibold text-[var(--tma-muted)]">Signed in as</p>
                                        <p className="text-sm font-semibold text-[var(--tma-text)] truncate">{displayName}</p>
                                    </div>
                                    <div className="p-1.5">
                                        <Link to={`/${role}/profile`} onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--tma-text)] hover:bg-[var(--tma-surface)] transition-colors">
                                            <svg className="h-4 w-4 text-[var(--tma-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            View Profile
                                        </Link>
                                        <Link to={`/${role}`} onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--tma-text)] hover:bg-[var(--tma-surface)] transition-colors">
                                            <svg className="h-4 w-4 text-[var(--tma-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                            Dashboard
                                        </Link>
                                        <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:pl-72">
                <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
                    {children}
                </div>
            </main>

            <footer className="border-t border-[var(--tma-border)] bg-white py-6 text-center text-xs text-[var(--tma-muted)]">
                {BRAND.name} · Mentorship operations portal
            </footer>
        </div>
    );
}
