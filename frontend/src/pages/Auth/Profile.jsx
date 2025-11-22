import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${storedUser._id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleSignOut = () => {
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload(); // Force reload to update App state
    };

    if (loading) {
        return <div className="profile-container">Loading...</div>;
    }

    if (!user) {
        return <div className="profile-container">User not found</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.firstName && user.firstName.charAt(0).toUpperCase()}
                </div>
                <h2>{user.firstName} {user.lastName}</h2>
                <p className="profile-username">@{user.username}</p>
                <p className="profile-email">{user.email}</p>
                <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
            </div>

            <div className="profile-content">
                <div className="profile-section">
                    <h3>Enrolled Courses</h3>
                    {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                        <ul className="item-list">
                            {user.enrolledCourses.map(course => (
                                <li key={course._id}>{course.title}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">No enrolled courses yet.</p>
                    )}
                </div>

                <div className="profile-section">
                    <h3>Registered Seminars</h3>
                    {user.registeredSeminars && user.registeredSeminars.length > 0 ? (
                        <ul className="item-list">
                            {user.registeredSeminars.map(seminar => (
                                <li key={seminar._id}>{seminar.title}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">No registered seminars yet.</p>
                    )}
                </div>

                <div className="profile-section">
                    <h3>Completed Tutorials</h3>
                    {user.completedTutorials && user.completedTutorials.length > 0 ? (
                        <ul className="item-list">
                            {user.enrolledCourses.map(tutorial => (
                                <li key={tutorial._id}>{tutorial.title}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">No completed tutorials yet.</p>
                    )}
                </div>

                <div className="profile-section">
                    <h3>Saved Podcasts</h3>
                    {user.savedPodcasts && user.savedPodcasts.length > 0 ? (
                        <ul className="item-list">
                            {user.savedPodcasts.map(podcast => (
                                <li key={podcast._id}>{podcast.title}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">No saved podcasts yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;