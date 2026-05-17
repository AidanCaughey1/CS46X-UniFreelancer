import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const COLLAPSED_VISIBLE_ITEMS = 2;
// Row height kept at 44px — matches h-[44px] on each <li>
const COLLAPSED_ROW_HEIGHT = 44;
const COLLAPSED_LIST_MAX_HEIGHT = COLLAPSED_VISIBLE_ITEMS * COLLAPSED_ROW_HEIGHT;

function CollapsibleListSection({
    title,
    items = [],
    emptyText = "No items yet.",
    itemToLabel = (item) => item.label || item.title || String(item),
    itemToKey = (item) => item.id || item._id || String(item),
    onItemClick = null,
}) {
    const [expanded, setExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const listRef = useRef(null);

    const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

    const measure = useCallback(() => {
        if (!listRef.current) return;
        setContentHeight(listRef.current.scrollHeight || 0);
    }, []);

    useEffect(() => {
        // Measure after paint so scrollHeight is accurate.
        const raf = window.requestAnimationFrame(measure);
        const onResize = () => measure();
        window.addEventListener('resize', onResize);
        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
        };
    }, [measure, safeItems.length]);

    const maxHeightPx = safeItems.length === 0
        ? 0
        : (expanded ? (contentHeight || COLLAPSED_LIST_MAX_HEIGHT) : COLLAPSED_LIST_MAX_HEIGHT);

    const minHeightPx = safeItems.length > 0 && !expanded ? COLLAPSED_LIST_MAX_HEIGHT : 0;
    const bodyMinHeightPx = !expanded ? COLLAPSED_LIST_MAX_HEIGHT : 0;

    const showToggle = safeItems.length > COLLAPSED_VISIBLE_ITEMS;

    return (
        <div className="bg-white/80 backdrop-blur-[10px] rounded-[15px] p-6 shadow-[0_4px_16px_0_rgba(31,38,135,0.1)] border border-white/20 md:p-5 sm:p-4 sm:rounded-md">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-black/5">
                <h3 className="text-dark m-0 md:text-lg sm:text-base">{title}</h3>
                {showToggle && (
                    <button
                        type="button"
                        className="appearance-none bg-transparent border-none p-2 rounded-[10px] cursor-pointer leading-[0] inline-flex items-center justify-center text-dark-secondary transition-colors duration-200 hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                        onClick={() => setExpanded(prev => !prev)}
                        aria-expanded={expanded}
                        aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
                    >
                        <span className={`w-2.5 h-2.5 border-r-2 border-b-2 border-current transition-transform duration-[250ms] ease-in-out ${expanded ? '-rotate-[135deg]' : 'rotate-45'}`} />
                    </button>
                )}
            </div>

            {safeItems.length > 0 ? (
                <div
                    className="overflow-hidden transition-[max-height] duration-[320ms] ease-in-out will-change-[max-height]"
                    style={{ maxHeight: `${maxHeightPx}px`, minHeight: `${minHeightPx}px` }}
                >
                    <ul ref={listRef} className="list-none p-0 m-0">
                        {safeItems.map((item) => {
                            const key = itemToKey(item);
                            const label = itemToLabel(item);
                            const clickable = typeof onItemClick === 'function';
                            return (
                                <li key={key} className="box-border h-[44px] p-0 border-b border-black/5 text-dark-secondary flex items-center last:border-b-0 sm:text-sm sm:py-2">
                                    {clickable ? (
                                        <button
                                            type="button"
                                            className="w-full text-left bg-transparent border-none p-0 text-dark-secondary cursor-pointer font-[inherit] flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis hover:text-dark hover:underline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:rounded-sm"
                                            onClick={() => onItemClick(item)}
                                        >
                                            {label}
                                        </button>
                                    ) : (
                                        <span className="w-full h-full flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <div className="flex items-center overflow-hidden" style={{ height: `${bodyMinHeightPx}px` }}>
                    <p className="text-muted italic m-0 w-full whitespace-nowrap overflow-hidden text-ellipsis">{emptyText}</p>
                </div>
            )}
        </div>
    );
}

CollapsibleListSection.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object),
    emptyText: PropTypes.string,
    itemToLabel: PropTypes.func,
    itemToKey: PropTypes.func,
    onItemClick: PropTypes.func,
};

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                // Fetch authenticated user's profile directly
                const response = await fetch(`${apiUrl}/api/users/profile`, {
                    credentials: 'include' // Send cookies
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else if (response.status === 401) {
                    // Not authenticated
                    navigate('/login');
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

    const handleSignOut = async () => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            await fetch(`${apiUrl}/api/users/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            navigate('/login');
            window.location.reload();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (loading) {
        return <div className="max-w-[1000px] mx-auto mt-10 p-5 md:mt-5 md:p-4 sm:mt-4 sm:p-3">Loading...</div>;
    }

    if (!user) {
        return <div className="max-w-[1000px] mx-auto mt-10 p-5 md:mt-5 md:p-4 sm:mt-4 sm:p-3">User not found</div>;
    }

    return (
        <div className="max-w-[1000px] mx-auto mt-10 p-5 md:mt-5 md:p-4 sm:mt-4 sm:p-3">
            <div className="bg-white/90 backdrop-blur-[10px] rounded-xl p-10 text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/20 mb-10 flex flex-col items-center md:p-8 md:px-5 md:mb-8 md:rounded-[15px] sm:p-6 sm:px-4 sm:rounded-md">
                <div className="w-[100px] h-[100px] bg-gradient-to-br from-accent to-accent-secondary rounded-full flex items-center justify-center text-5xl text-white font-bold mb-5 shadow-[0_4px_15px_rgba(0,0,0,0.1)] md:w-20 md:h-20 md:text-[2.5rem] sm:w-[70px] sm:h-[70px] sm:text-4xl">
                    {user.firstName && user.firstName.charAt(0).toUpperCase()}
                </div>
                <h2 className="m-0 mb-2.5 text-dark text-4xl md:text-2xl sm:text-[1.3rem]">{user.firstName} {user.lastName}</h2>
                <p className="text-accent font-semibold text-base m-0 my-[5px]">@{user.username}</p>
                <p className="text-dark-tertiary text-md m-0 mt-[5px] mb-5 md:text-base sm:text-sm">{user.email}</p>
                <button onClick={handleSignOut} className="py-2.5 px-6 bg-transparent border-2 border-accent text-accent rounded font-semibold cursor-pointer transition-all duration-300 hover:bg-accent hover:text-white md:py-2 md:px-5 md:text-sm">Sign Out</button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 items-start md:grid-cols-1 md:gap-5">
                <CollapsibleListSection
                    title="Enrolled Courses"
                    items={user.enrolledCourses}
                    emptyText="No enrolled courses yet."
                    itemToKey={(course) => course?._id || course?.id || course?.title}
                    itemToLabel={(course) => course?.title || 'Untitled course'}
                    onItemClick={(course) => {
                        const id = course?._id || course?.id;
                        if (id) navigate(`/academy/courses/${id}`);
                    }}
                />

                <CollapsibleListSection
                    title="Registered Seminars"
                    items={user.registeredSeminars}
                    emptyText="No registered seminars yet."
                    itemToKey={(seminar) => seminar?._id || seminar?.id || seminar?.title}
                    itemToLabel={(seminar) => seminar?.title || 'Untitled seminar'}
                />

                <CollapsibleListSection
                    title="Completed Tutorials"
                    items={user.completedTutorials}
                    emptyText="No completed tutorials yet."
                    itemToKey={(tutorial) => tutorial?._id || tutorial?.id || tutorial?.title}
                    itemToLabel={(tutorial) => tutorial?.title || 'Untitled tutorial'}
                    onItemClick={(tutorial) => {
                        const id = tutorial?._id || tutorial?.id;
                        if (id) navigate(`/academy/tutorials/${id}`);
                    }}
                />

                <CollapsibleListSection
                    title="Saved Podcasts"
                    items={user.savedPodcasts}
                    emptyText="No saved podcasts yet."
                    itemToKey={(podcast) => podcast?._id || podcast?.id || podcast?.title}
                    itemToLabel={(podcast) => podcast?.title || 'Untitled podcast'}
                />
            </div>
        </div>
    );
};

export default Profile;
