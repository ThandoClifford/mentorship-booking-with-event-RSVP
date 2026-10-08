import React from 'react';
import { Link } from 'react-router-dom';

export default function PublicNavbar({ user, onLogout }) {
    return (
        <nav className="ump-public-navbar">
            <div className="ump-public-navbar-inner">
                <Link className="ump-public-brand" to="/#home">
                    <span className="ump-public-brand-mark">UMP-CFERI</span>
                </Link>

                <div className="ump-public-navlinks">
                    <Link to="/#home" className="ump-public-navlink">Home</Link>
                    <Link to="/#about" className="ump-public-navlink">About</Link>
                    <Link to="/#mentors" className="ump-public-navlink">Mentors</Link>
                    <Link to="/#events" className="ump-public-navlink">Events</Link>
                    <Link to="/#stories" className="ump-public-navlink">Success Stories</Link>
                    <Link to="/#programs" className="ump-public-navlink">Programs</Link>
                    <Link to="/#contact" className="ump-public-navlink">Contact</Link>
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
