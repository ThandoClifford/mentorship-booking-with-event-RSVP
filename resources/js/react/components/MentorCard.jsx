import React from 'react';

export default function MentorCard({ mentor, onBook, onViewProfile }) {
    const displayFaculty = mentor.faculty || mentor.expertise || mentor.title || 'Career & Innovation Mentor';
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
                    <button type="button" onClick={() => onViewProfile?.(mentor)} className="ump-card-button outline">
                        View Profile
                    </button>
                    <button className="ump-card-button primary" onClick={onBook || (() => window.location.assign(`/mentors/${mentor.id || ''}`))}>
                        Book Appointment
                    </button>
                </div>
            </div>
        </article>
    );
}
