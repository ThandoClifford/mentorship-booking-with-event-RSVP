import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPublicMentors } from '../api';
import FilterPanel from '../components/FilterPanel';
import MentorCard from '../components/MentorCard';
import PublicNavbar from '../components/PublicNavbar';
import SearchBar from '../components/SearchBar';
import SiteFooter from '../components/SiteFooter';
import BookSessionModal from '../components/BookSessionModal';

export default function MentorsPage({ user }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [mentors, setMentors] = useState([]);
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [filters, setFilters] = useState({ expertise: [], availability: [], sessionType: [] });

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) setQuery(q);
    }, [searchParams]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await getPublicMentors();
                if (active) setMentors(Array.isArray(data) ? data : []);
            } catch {
                if (active) setMentors([]);
            }
        })();
        return () => { active = false; };
    }, []);

    const toggleFilter = (group, value) => {
        setFilters((prev) => {
            const current = prev[group];
            const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
            return { ...prev, [group]: next };
        });
    };

    const filteredMentors = useMemo(() => {
        const q = query.trim().toLowerCase();
        return mentors.filter((mentor) => {
            const haystack = `${mentor.name} ${mentor.email || ''} ${mentor.faculty || ''}`.toLowerCase();
            const matchesQuery = !q || haystack.includes(q);
            const matchesExpertise = filters.expertise.length === 0 || filters.expertise.some((e) => (mentor.faculty || '').toLowerCase().includes(e.toLowerCase()));
            return matchesQuery && matchesExpertise;
        });
    }, [mentors, query, filters.expertise]);

    return (
        <main className="min-h-screen bg-[var(--tma-surface)] text-[var(--tma-text)]">
            <PublicNavbar user={user} />
            <section className="border-b border-[var(--tma-border)] bg-white py-10">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <h1 className="text-3xl font-bold">Find a Mentor</h1>
                    <div className="mt-6">
                        <SearchBar value={query} onChange={setQuery} onSubmit={(e) => { e.preventDefault(); }} />
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:px-8 lg:grid-cols-[280px,1fr]">
                <div className="hidden lg:block">
                    <div className="sticky top-20">
                        <FilterPanel filters={filters} onToggle={toggleFilter} />
                    </div>
                </div>
                <section className="space-y-4">
                    {mentors.length === 0 ? (
                        <p className="rounded-2xl border border-[var(--tma-border)] bg-white p-8 text-center text-sm text-[var(--tma-muted)]">Loading mentors...</p>
                    ) : null}
                    {mentors.length > 0 && filteredMentors.length === 0 ? (
                        <p className="rounded-2xl border border-[var(--tma-border)] bg-white p-8 text-center text-sm text-[var(--tma-muted)]">No mentors match your search yet.</p>
                    ) : null}
                    {filteredMentors.map((mentor) => (
                        <MentorCard key={mentor.id || mentor.email} mentor={mentor} user={user} onBook={() => navigate(`/mentors/${mentor.id || ''}`)} />
                    ))}
                </section>
            </div>
            <aside className="lg:hidden border-t border-[var(--tma-border)] bg-white p-4">
                <FilterPanel filters={filters} onToggle={toggleFilter} />
            </aside>
            <SiteFooter />
        </main>
    );
}
