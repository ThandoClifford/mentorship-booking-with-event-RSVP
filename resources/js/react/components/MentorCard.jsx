import React from 'react';

export default function MentorCard({ mentor, onBook }) {
    const displayFaculty = mentor.faculty || mentor.expertise || mentor.title || 'Career & Innovation Mentor';
    const profileHref = mentor.id ? `/mentors/${mentor.id}` : '/mentors';
    const avatarUrl = mentor.profile_photo_path || mentor.photo || '/images/ump-logo.png';

    return (
        <article className="ump-mentor-card">
            <div className="ump-mentor-card-head">
                <img src={avatarUrl} alt={mentor.name || 'Mentor'} className="ump-mentor-avatar" />
                <div>
                    <h3>{mentor.name || 'Mentor Profile'}</h3>
                    <p className="ump-mentor-title">{mentor.title || mentor.role || 'Mentor'}</p>
                    <p className="ump-mentor-faculty">{displayFaculty}</p>
                </div>
            </div>
            <div className="ump-mentor-card-body">
                <p className="ump-mentor-description">{mentor.bio || mentor.summary || 'Public mentorship guidance and professional development support.'}</p>
                <div className="ump-mentor-card-actions">
                    <a href={profileHref} className="ump-card-button outline">View Profile</a>
                    <button className="ump-card-button primary" onClick={onBook || (() => window.location.assign(profileHref))}>
                        Book Appointment
                    </button>
                </div>
            </div>
        </article>
    );
}
