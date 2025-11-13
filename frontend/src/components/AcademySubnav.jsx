import React from 'react';
import { NavLink } from 'react-router-dom';
import './AcademySubnav.css';

const links = [
  { to: '/academy/courses', label: 'Courses', icon: '📚' },
  { to: '/academy/seminars', label: 'Seminars', icon: '📅' },
  { to: '/academy/tutorials', label: 'Tutorials', icon: '📖' },
  { to: '/academy/podcasts', label: 'Podcasts', icon: '🎧' },
];

function AcademySubnav() {
  return (
    <div className="academy-subnav" role="tablist" aria-label="Academy sections">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            'academy-subnav-pill' + (isActive ? ' academy-subnav-pill-active' : '')
          }
        >
          <span className="academy-subnav-icon">{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </div>
  );
}

export default AcademySubnav;
