import React, { useEffect, useState } from 'react';
import { getHomeData, getPublicMentors } from '../api';
import PublicNavbar from '../components/PublicNavbar';
import SiteFooter from '../components/SiteFooter';
import MentorCard from '../components/MentorCard';
import MentorProfileModal from '../components/MentorProfileModal';
import EventRSVPModal from '../components/EventRSVPModal';

export default function LandingPage({ user }) {
    const [dbMentors, setDbMentors] = useState([]);
    const [mentorsLoading, setMentorsLoading] = useState(true);
    const [mentorsError, setMentorsError] = useState('');
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState('');
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const mentors = Array.isArray(dbMentors) ? dbMentors : [];

    const openMentorProfile = (mentor) => setSelectedMentor(mentor || null);
    const closeMentorProfile = () => setSelectedMentor(null);
    const openEventRsvp = (event) => setSelectedEvent(event || null);
    const closeEventRsvp = () => setSelectedEvent(null);

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const [mentorData, homeData] = await Promise.all([
                    getPublicMentors(),
                    getHomeData(),
                ]);

                if (!active) return;

                if (Array.isArray(mentorData)) {
                    setDbMentors(mentorData);
                }

                if (homeData && Array.isArray(homeData.centreEvents)) {
                    const mappedEvents = homeData.centreEvents.map((event) => ({
                        id: event.id,
                        title: event.title,
                        description: event.description || event.summary || event.category || 'Public UMP-CFERI engagement event.',
                        event_date: event.event_date,
                        event_time: event.event_time,
                        end_time: event.end_time || null,
                        venue: event.venue,
                        category: event.category,
                        image: event.image || event.image_url || '/images/panel-discussion.jpg',
                    }));

                    if (mappedEvents.length > 0) {
                        setEvents(mappedEvents);
                    } else {
                        setEvents([]);
                    }
                } else {
                    setEvents([]);
                }
            } catch (err) {
                if (active) {
                    setMentorsError(err?.response?.data?.message || 'Mentors are temporarily unavailable. Please try again shortly.');
                    setDbMentors([]);
                    setEventsError('Events are temporarily unavailable. Please try again shortly.');
                    setEvents([]);
                }
            } finally {
                if (active) {
                    setMentorsLoading(false);
                    setEventsLoading(false);
                }
            }
        })();

        return () => { active = false; };
    }, []);

    return (
        <div className="ump-public-page">
            <PublicNavbar user={user} />
            <main>
                <section id="home" className="ump-hero-section">
                    <div className="ump-hero-grid">
                        <div className="ump-hero-copy">
                            <span className="ump-kicker">University of Mpumalanga</span>
                            <h1>Connect. Learn. Grow with UMP-CFERI.</h1>
                            <p className="ump-hero-lede">University of Mpumalanga Centre for Entrepreneurship, Food Security and Innovation connects students, innovators, mentors, and communities through practical mentorship and engagement.</p>

                            <div className="ump-hero-actions">
                                <a className="ump-cta-button primary" href="/mentors">Find a Mentor</a>
                                <a className="ump-cta-button secondary" href="#events">Explore Events</a>
                            </div>

                            <div className="ump-hero-proof">
                                <span><b>500+</b> Sessions</span>
                                <span><b>50+</b> Active Mentors</span>
                                <span><b>1K+</b> Learners</span>
                            </div>
                        </div>

                        <div className="ump-hero-visual">
                            <img src="/images/UMP-2024-Entrepreneurship-Summit-31-of-81.jpg" alt="UMP Entrepreneurship Summit" />
                            <div className="ump-floating-card">
                                <span>Next Engagement</span>
                                <strong>Entrepreneurship & Career Clinic</strong>
                                <small>09 Sep • 10:00</small>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="ump-section ump-section-about">
                    <div className="ump-section-title centered">
                        <span className="ump-kicker">About UMP-CFERI</span>
                        <h2>Empowering Innovation Through Mentorship and Entrepreneurship.</h2>
                    </div>
                    <div className="ump-about-grid">
                        <div className="ump-about-image">
                            <img src="/images/ump-edit-1-of-44.jpg" alt="UMP-CFERI entrepreneurship and mentorship" />
                        </div>
                        <div className="ump-about-copy">
                            <p>The UMP-CFERI Mentorship Programme supports students, emerging entrepreneurs, and innovators through practical mentorship, business incubation, professional development, and community engagement.</p>
                            <div className="ump-about-features">
                                <div className="ump-about-feature">
                                    <span className="ump-icon">✦</span>
                                    <div>
                                        <h3>Expert Mentors</h3>
                                        <p>Connect with academics, entrepreneurs, and industry experts who offer practical guidance.</p>
                                    </div>
                                </div>
                                <div className="ump-about-feature">
                                    <span className="ump-icon">↗</span>
                                    <div>
                                        <h3>Entrepreneurship Support</h3>
                                        <p>Access coaching, networking, and development opportunities for new ideas and ventures.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="mentors" className="ump-section ump-section-surface">
                    <div className="ump-section-title">
                        <div>
                            <span className="ump-kicker">Featured Mentors</span>
                            <h2>Meet the UMP-CFERI Mentor Network</h2>
                        </div>
                        <a className="ump-link-button" href="/mentors">View all</a>
                    </div>
                    <div className="ump-mentor-grid">
                        {mentorsLoading && (
                            <div className="ump-mentor-empty">Loading mentors...</div>
                        )}
                        {mentorsError && !mentorsLoading && (
                            <div className="ump-mentor-empty">{mentorsError}</div>
                        )}
                        {!mentorsLoading && !mentorsError && mentors.length === 0 && (
                            <div className="ump-mentor-empty">No mentors are currently available.</div>
                        )}
                        {!mentorsLoading && !mentorsError && mentors.map((mentor) => (
                            <MentorCard key={mentor.id || mentor.email || mentor.name} mentor={mentor} onBook={() => window.location.assign(`/mentors/${mentor.id || ''}`)} onViewProfile={openMentorProfile} />
                        ))}
                    </div>
                </section>

                <section id="events" className="ump-section">
                    <div className="ump-section-title">
                        <div>
                            <span className="ump-kicker">Upcoming Events</span>
                            <h2>Events and Engagement Opportunities</h2>
                        </div>
                        <a className="ump-link-button" href="#events">All Events</a>
                    </div>
                    <div className="ump-event-grid">
                        {eventsLoading && (
                            <div className="ump-mentor-empty">Loading events...</div>
                        )}
                        {eventsError && !eventsLoading && (
                            <div className="ump-mentor-empty">{eventsError}</div>
                        )}
                        {!eventsLoading && !eventsError && events.length === 0 && (
                            <div className="ump-mentor-empty">No upcoming events at the moment.</div>
                        )}
                        {!eventsLoading && !eventsError && events.map((event) => (
                            <article className="ump-event-card" key={event.id || event.title}>
                                <div className="ump-event-image">
                                    <img src={event.image || '/images/panel-discussion.jpg'} alt={event.title} />
                                </div>
                                <div className="ump-event-content">
                                    <span className="ump-event-date">{event.event_date || 'Upcoming'}</span>
                                    <h3>{event.title}</h3>
                                    <p>{event.description}</p>
                                    <div className="ump-event-meta">
                                        <span>{event.event_time ? String(event.event_time).slice(0, 5) : 'Time TBD'}</span>
                                        <span>{event.venue || 'UMP Campus'}</span>
                                    </div>
                                    <div className="ump-event-actions">
                                        <button className="ump-card-button outline" onClick={() => window.location.assign('#')}>View Event</button>
                                        <button className="ump-card-button primary" onClick={() => openEventRsvp(event)}>RSVP</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="stories" className="ump-section ump-section-surface">
                    <div className="ump-section-title centered">
                        <span className="ump-kicker">Success Stories</span>
                        <h2>UMP Success Stories</h2>
                        <p className="ump-subtitle">Real outcomes from learners and entrepreneurs who invested in guided growth.</p>
                    </div>
                    <div className="ump-story-grid">
                        <article className="ump-story-card">
                            <p>“My mentor helped me refine my business plan and pitch with confidence. The sessions were practical and motivating.”</p>
                            <strong>Thandi M.</strong>
                            <span>Entrepreneur</span>
                        </article>
                        <article className="ump-story-card">
                            <p>“I gained clarity on my career path and built a stronger professional network through structured mentorship.”</p>
                            <strong>James K.</strong>
                            <span>Graduate</span>
                        </article>
                        <article className="ump-story-card">
                            <p>“Leadership coaching improved how I communicate with my team and manage priorities under pressure.”</p>
                            <strong>Nomsa P.</strong>
                            <span>Team Lead</span>
                        </article>
                    </div>
                </section>

                <section id="programs" className="ump-section">
                    <div className="ump-section-title">
                        <div>
                            <span className="ump-kicker">Programs & Services</span>
                            <h2>Upcoming Programs</h2>
                        </div>
                    </div>
                    <div className="ump-program-grid">
                        <article className="ump-program-card">
                            <h3>Leadership Accelerator</h3>
                            <p>Coming soon • Online</p>
                        </article>
                        <article className="ump-program-card">
                            <h3>Entrepreneur Launchpad</h3>
                            <p>Coming soon • Hybrid</p>
                        </article>
                        <article className="ump-program-card">
                            <h3>Career Clarity Cohort</h3>
                            <p>Coming soon • Campus</p>
                        </article>
                    </div>
                </section>

                <section id="why" className="ump-section ump-section-surface">
                    <div className="ump-section-title centered">
                        <span className="ump-kicker">Why Choose UMP-CFERI</span>
                        <h2>Why Choose the University of Mpumalanga</h2>
                    </div>
                    <div className="ump-benefit-grid">
                        <article className="ump-benefit-card">
                            <h3>Verified Mentors</h3>
                            <p>Work with mentors reviewed and approved for quality mentorship delivery.</p>
                        </article>
                        <article className="ump-benefit-card">
                            <h3>Flexible Booking</h3>
                            <p>Browse public mentors and prepare a future public booking session.</p>
                        </article>
                        <article className="ump-benefit-card">
                            <h3>Growth-Focused Programs</h3>
                            <p>Access structured pathways for leadership, entrepreneurship, and career success.</p>
                        </article>
                    </div>
                </section>

                <section id="cta" className="ump-cta-section">
                    <div className="ump-cta-panel">
                        <div>
                            <span className="ump-kicker light">UMP-CFERI Public Engagement</span>
                            <h2>Ready to start your UMP-CFERI journey?</h2>
                            <p>Find a mentor, explore events, and connect with the right opportunity for your academic and entrepreneurial development.</p>
                        </div>
                        <div className="ump-cta-actions">
                            <a className="ump-cta-button light" href="/mentors">Find a Mentor</a>
                            <a className="ump-cta-button dark" href="#events">Explore Events</a>
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter />
            {selectedMentor && <MentorProfileModal mentor={selectedMentor} onClose={closeMentorProfile} />}
            {selectedEvent && <EventRSVPModal event={selectedEvent} onClose={closeEventRsvp} />}
        </div>
    );
}

