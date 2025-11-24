import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './App.css';
import Academy from './pages/Academy/Academy';
import Courses from './pages/Academy/Courses/Courses';
import Seminars from './pages/Academy/Seminars/Seminars';
import Tutorials from './pages/Academy/Tutorials/Tutorials';
import CreateContent from './pages/Academy/CreateContent/CreateContent';
import CreateCourse from './pages/Academy/Courses/CreateCourse';
import CreateSeminar from './pages/Academy/Seminars/CreateSeminar';
import CreateTutorial from './pages/Academy/Tutorials/CreateTutorial';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Profile from './pages/Auth/Profile';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Header user={user} />
        <Routes>
          <Route path="/" element={<Academy />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/courses" element={<Courses />} />
          <Route path="/academy/create" element={<CreateContent />} />
          <Route path="/academy/seminars" element={<Seminars />} />
          <Route path="/academy/tutorials" element={<Tutorials />} />
          <Route path="/academy/create/course" element={<CreateCourse />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/academy/create/seminar" element={<CreateSeminar />} />
          <Route path="/academy/create/tutorial" element={<CreateTutorial />} />
        </Routes>
      </div>
    </Router>
  );
}

function Header({ user }) {
  const location = useLocation();

  // Function to check if link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <h1>UniFreelancer</h1>
            <p>FREELANCE PORTAL</p>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/find-work" className={isActive('/find-work')}>Find Work</Link>
          <Link to="/browse-freelancers" className={isActive('/browse-freelancers')}>Browse Freelancers</Link>
          <Link to="/hire-talent" className={isActive('/hire-talent')}>Hire Talent</Link>
          <Link to="/academy" className={isActive('/academy')}>UF Academy</Link>
          <Link to="/social" className={isActive('/social')}>UF Social</Link>
          <Link to="/about" className={isActive('/about')}>About Us</Link>
          <Link to="/inbox" className={isActive('/inbox')}>Inbox</Link>

          {user ? (
            <Link to="/profile" className={`user-profile-link ${isActive('/profile')}`}>
              <div className="nav-profile-avatar">
                {user.firstName && user.firstName.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/signup" className={isActive('/signup')}>Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

Header.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    _id: PropTypes.string
  })
};

export default App;