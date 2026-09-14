import axios from 'axios';

const API_BASE = '/api/v1';
const TOKEN_KEY = 'ump_api_token';
const USER_KEY = 'ump_user';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuth(token, user) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

const client = axios.create({
    baseURL: API_BASE,
    headers: {
        Accept: 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

function unwrap(response) {
    return response?.data?.data;
}

function messageFromError(error, fallback = 'Request failed') {
    return error?.response?.data?.message || fallback;
}

export async function login(payload) {
    const response = await client.post('/auth/login', payload);
    return unwrap(response);
}

export async function register(payload) {
    const response = await client.post('/auth/register', payload);
    return unwrap(response);
}

export async function forgotPassword(email) {
    const response = await client.post('/auth/password/forgot', { email });
    return unwrap(response);
}

export async function resetPassword(payload) {
    const response = await client.post('/auth/password/reset', payload);
    return unwrap(response);
}

export async function me() {
    const response = await client.get('/auth/me');
    return unwrap(response);
}

export async function logout() {
    await client.post('/auth/logout');
}

export async function getStudentSlots(params = {}) {
    const response = await client.get('/student/slots', { params });
    return unwrap(response) || [];
}

export async function getStudentAppointments() {
    const response = await client.get('/student/appointments');
    return unwrap(response) || [];
}

export async function bookAppointment(timeSlotId) {
    const response = await client.post('/student/appointments', { time_slot_id: timeSlotId });
    return unwrap(response);
}

export async function cancelAppointment(id, cancelledReason = '') {
    const response = await client.patch(`/student/appointments/${id}/cancel`, {
        cancelled_reason: cancelledReason,
    });

    return unwrap(response);
}

export async function getMentorAppointments(params = {}) {
    const response = await client.get('/mentor/appointments', { params });
    return unwrap(response) || [];
}

export async function completeMentorAppointment(id) {
    const response = await client.patch(`/mentor/appointments/${id}/complete`);
    return unwrap(response);
}

export async function saveMentorNotes(id, notes) {
    const response = await client.post(`/mentor/appointments/${id}/notes`, { notes });
    return unwrap(response);
}

export async function getAdminMentors() {
    const response = await client.get('/admin/mentors');
    return unwrap(response) || [];
}

export async function getPendingMentorVerifications() {
    const response = await client.get('/admin/mentors/pending-verification');
    return unwrap(response) || [];
}

export async function verifyMentor(id) {
    const response = await client.post(`/admin/mentors/${id}/verify`);
    return unwrap(response);
}

export async function createMentor(payload) {
    const response = await client.post('/admin/mentors', payload);
    return unwrap(response);
}

export async function getAdminReports(params = {}) {
    const response = await client.get('/admin/reports/summary', { params });
    return unwrap(response);
}

export async function getAdminOps() {
    const response = await client.get('/admin/ops');
    return unwrap(response);
}

export async function getAdminAlerts() {
    const response = await client.get('/admin/ops/alerts');
    return unwrap(response);
}

export async function sendAdminTestEmail(email = '') {
    const response = await client.post('/admin/ops/test-email', email ? { email } : {});
    return unwrap(response);
}

export async function getAdminAppointments() {
    const response = await client.get('/admin/appointments');
    return unwrap(response) || [];
}

export async function getAdminAppointment(id) {
    const response = await client.get(`/admin/appointments/${id}`);
    return unwrap(response);
}

export async function approveAdminAppointment(id) {
    const response = await client.post(`/admin/appointments/${id}/approve`);
    return unwrap(response);
}

export async function declineAdminAppointment(id, cancelledReason = 'Declined by admin') {
    const response = await client.post(`/admin/appointments/${id}/decline`, { cancelled_reason: cancelledReason });
    return unwrap(response);
}

export async function getAdminAnnouncements() {
    const response = await client.get('/admin/announcements');
    return unwrap(response) || [];
}

export async function createAdminAnnouncement(payload) {
    const response = await client.post('/admin/announcements', payload);
    return unwrap(response);
}

export async function deleteAdminAnnouncement(id) {
    const response = await client.delete(`/admin/announcements/${id}`);
    return unwrap(response);
}

export async function getAdminCentreEvents() {
    const response = await client.get('/admin/centre-events');
    return unwrap(response) || [];
}

export async function createAdminCentreEvent(payload) {
    const response = await client.post('/admin/centre-events', payload);
    return unwrap(response);
}

export async function deleteAdminCentreEvent(id) {
    const response = await client.delete(`/admin/centre-events/${id}`);
    return unwrap(response);
}

export async function getHomeData() {
    const response = await client.get('/public/home');
    return unwrap(response) || { announcements: [], centreEvents: [] };
}

export async function getPublicMentor(id) {
    const response = await client.get(`/public/mentors/${id}`);
    return unwrap(response) || null;
}

export async function getPublicMentorSlots(id) {
    const response = await client.get(`/public/mentors/${id}/slots`);
    return unwrap(response) || [];
}

export async function createPublicAppointment(payload) {
    const response = await client.post('/public/appointments', payload);
    return unwrap(response);
}

export async function getPublicMentors() {
    const response = await client.get('/public/mentors');
    return unwrap(response) || [];
}

export async function getMentorAvailability() {
    const response = await client.get('/mentor/availability');
    return unwrap(response) || [];
}

export async function setMentorAvailabilityStatus(id, isActive) {
    const response = await client.patch(`/mentor/availability/${id}/status`, { is_active: Boolean(isActive) });
    return unwrap(response);
}

export async function confirmMentorAppointment(id) {
    const response = await client.post(`/mentor/appointments/${id}/confirm`);
    return unwrap(response);
}

export async function declineMentorAppointment(id, cancelledReason = 'Declined by mentor') {
    const response = await client.post(`/mentor/appointments/${id}/decline`, { cancelled_reason: cancelledReason });
    return unwrap(response);
}

export async function getMentorGroupSessions() {
    const response = await client.get('/mentor/group-sessions');
    return unwrap(response) || [];
}

export async function createMentorGroupSession(payload) {
    const response = await client.post('/mentor/group-sessions', payload);
    return unwrap(response);
}

export function toErrorMessage(error, fallback) {
    return messageFromError(error, fallback);
}
