import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './App.css';
import Academy from './pages/Academy/Academy';
import LearningHub from './pages/Academy/LearningHub/LearningHub';
import CreateContent from './pages/Academy/CreateContent/CreateContent';
import CreateCourse from './pages/Academy/Courses/CreateCourse';
import CourseDetail from './pages/Academy/Courses/CourseDetail';
import CreateSeminar from './pages/Academy/Seminars/CreateSeminar';
import CreateTutorial from './pages/Academy/Tutorials/CreateTutorial';
import TutorialDetail from './pages/Academy/Tutorials/TutorialDetail';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Profile from './pages/Auth/Profile';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import MyCourses from './pages/Academy/Courses/MyCourses';
import CourseLearning from './pages/Academy/Courses/CourseLearning';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import GradingInterface from './pages/Instructor/GradingInterface';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // eslint-disable-next-line no-undef
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };

    // Clear legacy localStorage item if it exists
    if (localStorage.getItem('user')) {
      localStorage.removeItem('user');
    }

    fetchUser();
  }, []);

  return (
    <Router>
      <div className="App">
        <Header user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Academy />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/courses" element={<LearningHub />} />
          <Route path="/academy/my-courses" element={<MyCourses />} />
          <Route path="/academy/create" element={<CreateContent />} />
          <Route path="/academy/seminars" element={<LearningHub />} />
          <Route path="/academy/tutorials" element={<LearningHub />} />
          <Route path="/academy/tutorials/:id" element={<TutorialDetail />} />
          <Route path="/academy/create/course" element={<CreateCourse />} />
          <Route path="/academy/courses/:id" element={<CourseDetail />} />
          <Route path="/academy/create/:courseId" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/academy/create/seminar" element={<CreateSeminar />} />
          <Route path="/academy/create/tutorial" element={<CreateTutorial />} />
          <Route path="/academy/payment-success" element={<PaymentSuccess />} />
          <Route path="/academy/courses/:id/learn" element={<CourseLearning />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/grade/:submissionId" element={<GradingInterface />} />
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

          {/* Instructor Dashboard Link - Only for instructors */}
          {user && user.accountType === 'instructor' && (
            <Link 
              to="/instructor/dashboard" 
              className={`instructor-dashboard-link ${isActive('/instructor/dashboard')}`}
            >
              📊 Dashboard
            </Link>
          )}

          {user ? (
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/profile" className={`user-profile-link ${isActive('/profile')}`}>
                <div className="nav-profile-avatar">
                  {user.firstName && user.firstName.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
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
    _id: PropTypes.string,
    accountType: PropTypes.string
  })
};

export default App;