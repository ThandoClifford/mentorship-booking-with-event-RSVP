import React from 'react';

export default function SiteFooter() {
    return (
        <footer className="ump-footer">
            <div className="ump-footer-grid">
                <div className="ump-footer-brand">
                    <div className="ump-footer-logo">UMP-CFERI</div>
                    <p>University of Mpumalanga Centre for Entrepreneurship, Food Security and Innovation.</p>
                </div>
                <div className="ump-footer-links">
                    <h4>Explore</h4>
                    <a href="#/">Home</a>
                    <a href="#/about">About</a>
                    <a href="#/mentors">Mentors</a>
                    <a href="#/programs">Programs</a>
                </div>
                <div className="ump-footer-links">
                    <h4>Public Services</h4>
                    <a href="#events">Events</a>
                    <a href="#stories">Success Stories</a>
                    <a href="#contact">Contact</a>
                </div>
                <div className="ump-footer-links">
                    <h4>Contact</h4>
                    <a href="mailto:mentorship@ump.ac.za">mentorship@ump.ac.za</a>
                    <span>UMPCFERI Mentorship Portal</span>
                </div>
            </div>
            <div className="ump-footer-bottom">
                &copy; 2025 University of Mpumalanga. UMP-CFERI Digital Engagement Platform.
            </div>
        </footer>
    );
}
