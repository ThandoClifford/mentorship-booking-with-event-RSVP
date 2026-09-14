import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { clearAuth, getStoredUser, logout, me, setAuth } from './api';

import { BRAND } from './brand';
import DashboardShell from './components/DashboardShell';
import Homepage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfilePage from './pages/StudentProfilePage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointmentShowPage from './pages/AdminAppointmentShowPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import MentorsPage from './pages/MentorsPage';
import MentorProfilePage from './pages/MentorProfilePage';
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import ContactPage from './pages/ContactPage';
import AppointmentActionPage from './pages/AppointmentActionPage';

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

function AppRoutes({ user, setUser }) {
    const logoutNow = async () => {
        try { await logout(); } catch { }
        clearAuth();
        setUser(null);
        window.location.href = '/login';
    };

    function MentorSectionRoute({ section }) {
        React.useEffect(() => {
            const timer = window.setTimeout(() => {
                const target = document.getElementById(section);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
            return () => window.clearTimeout(timer);
        }, [section]);

        return (
            <DashboardShell user={user} onLogout={logoutNow}>
                <MentorDashboard user={user} />
            </DashboardShell>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Homepage user={user} />} />
            <Route path="/about" element={<AboutPage user={user} />} />
            <Route path="/mentors" element={<MentorsPage user={user} />} />
            <Route path="/mentors/:id" element={<MentorProfilePage user={user} />} />
            <Route path="/programs" element={<ProgramsPage user={user} />} />
            <Route path="/contact" element={<ContactPage user={user} />} />
            <Route path="/appointment-action" element={<AppointmentActionPage />} />
            <Route path="/login" element={user ? <Navigate to={roleHomePath(roleValue(user))} replace /> : <LoginPage onAuthenticated={setUser} />} />
            <Route path="/admin/login" element={user ? <Navigate to={roleHomePath(roleValue(user))} replace /> : <LoginPage onAuthenticated={setUser} forcedRole="admin" />} />
            <Route path="/register" element={user ? <Navigate to={roleHomePath(roleValue(user))} replace /> : <RegisterPage onAuthenticated={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/student" element={<DashboardShell user={user} onLogout={logoutNow}><StudentDashboard user={user} /></DashboardShell>} />
            <Route path="/student/profile" element={<DashboardShell user={user} onLogout={logoutNow}><StudentProfilePage user={user} onLogout={logoutNow} /></DashboardShell>} />
            <Route path="/student/appointments" element={<DashboardShell user={user} onLogout={logoutNow}><MyAppointmentsPage /></DashboardShell>} />
            <Route path="/mentor" element={<DashboardShell user={user} onLogout={logoutNow}><MentorDashboard user={user} /></DashboardShell>} />
            <Route path="/mentor/availability" element={<MentorSectionRoute section="availability" />} />
            <Route path="/mentor/sessions" element={<MentorSectionRoute section="upcoming" />} />
            <Route path="/admin" element={<DashboardShell user={user} onLogout={logoutNow}><AdminDashboard user={user} /></DashboardShell>} />
            <Route path="/admin/bookings" element={<DashboardShell user={user} onLogout={logoutNow}><AdminBookingsPage /></DashboardShell>} />
            <Route path="/admin/appointments/:id" element={<DashboardShell user={user} onLogout={logoutNow}><AdminAppointmentShowPage /></DashboardShell>} />

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
                    setAuth(getToken(), current);
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
