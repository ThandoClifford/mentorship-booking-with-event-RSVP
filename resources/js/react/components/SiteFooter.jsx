import React from 'react';
import { Link } from 'react-router-dom';

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
                    <Link to="/#home">Home</Link>
                    <Link to="/#about">About</Link>
                    <Link to="/#mentors">Mentors</Link>
                    <Link to="/#programs">Programs</Link>
                </div>
                <div className="ump-footer-links">
                    <h4>Public Services</h4>
                    <Link to="/#events">Events</Link>
                    <Link to="/#stories">Success Stories</Link>
                    <Link to="/#contact">Contact</Link>
                </div>
                <div id="contact" className="ump-footer-links">
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
