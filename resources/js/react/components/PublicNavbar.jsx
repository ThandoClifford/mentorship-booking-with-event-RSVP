import React from 'react';

export default function PublicNavbar({ user, onLogout }) {
    return (
        <nav className="ump-public-navbar">
            <div className="ump-public-navbar-inner">
                <a className="ump-public-brand" href="/">
                    <span className="ump-public-brand-mark">UMP-CFERI</span>
                </a>

                <div className="ump-public-navlinks">
                    <a href="/" className="ump-public-navlink">Home</a>
                    <a href="/about" className="ump-public-navlink">About</a>
                    <a href="/mentors" className="ump-public-navlink">Mentors</a>
                    <a href="/#events" className="ump-public-navlink">Events</a>
                    <a href="/#stories" className="ump-public-navlink">Success Stories</a>
                    <a href="/programs" className="ump-public-navlink">Programs</a>
                    <a href="/contact" className="ump-public-navlink">Contact</a>
                </div>

                <div className="ump-public-auth">
                    {user ? (
                        <button onClick={onLogout} className="ump-public-login">Logout</button>
                    ) : (
                        <>
                            <a href="/login" className="ump-public-login">Staff Login</a>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
