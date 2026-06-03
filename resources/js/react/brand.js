export const BRAND = {
    name: 'The Mentorship Academy',
    shortName: 'TMA',
    platformName: 'Mentorship Academy Platform',
    logo: '/images/tma-logo.png',
    supportEmail: 'support@thementorshipacademy.com',
};

export const EXPERTISE_OPTIONS = [
    'Leadership',
    'Entrepreneurship',
    'Career Guidance',
    'Marketing',
    'Technology',
    'Finance',
    'Personal Development',
    'Business Development',
];

export const AVAILABILITY_FILTERS = [
    'Available Today',
    'Available This Week',
    'Online',
    'In Person',
];

export const SESSION_TYPE_FILTERS = [
    'One-on-One',
    'Group Mentorship',
    'Coaching',
];

export function mentorInitials(name) {
    const parts = String(name || 'M').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'M';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function mentorStats(mentor) {
    const seed = String(mentor?.id || mentor?.email || mentor?.name || '0');
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i) * (i + 1)) % 9973;
    const rating = (4.5 + (hash % 5) / 10).toFixed(1);
    const reviews = 40 + (hash % 120);
    const sessions = 20 + (hash % 180);
    const years = 3 + (hash % 12);
    const availability = hash % 3 === 0 ? 'Available Today' : 'Available This Week';
    return { rating, reviews, sessions, years, availability };
}
