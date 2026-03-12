import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Academy from './pages/Academy/Academy';
import LearningHub from './pages/Academy/LearningHub/LearningHub';
import CreateContent from './pages/Academy/CreateContent/CreateContent';
import CreateCourse from './pages/Academy/Courses/CreateCourse';
import CourseDetail from './pages/Academy/Courses/CourseDetail';
import MyCourses from './pages/Academy/Courses/MyCourses';
import CourseLearning from './pages/Academy/Courses/CourseLearning';
import CreateSeminar from './pages/Academy/Seminars/CreateSeminar';
import SeminarDetails from './pages/Academy/Seminars/SeminarDetails';
import SeminarZoomPage from './pages/Academy/Seminars/SeminarZoomPage';
import CreateTutorial from './pages/Academy/Tutorials/CreateTutorial';
import TutorialDetail from './pages/Academy/Tutorials/TutorialDetail';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import GradingInterface from './pages/Instructor/GradingInterface';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Profile from './pages/Auth/Profile';
import PaymentSuccess from './pages/Payment/PaymentSuccess';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || '';
        const response = await fetch(`${apiUrl}/api/users/me`, {
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
      <div className="min-h-screen">
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
          <Route path="/academy/create/:courseId" element={<CreateCourse />} />
          <Route path="/academy/courses/:id" element={<CourseDetail />} />
          <Route path="/academy/courses/:id/learn" element={<CourseLearning />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/academy/seminars/:id" element={<SeminarDetails />} />
          <Route path="/academy/seminars/:id/join" element={<SeminarZoomPage />} />
          <Route path="/academy/create/seminar" element={<CreateSeminar />} />
          <Route path="/academy/create/tutorial" element={<CreateTutorial />} />
          <Route path="/academy/payment-success" element={<PaymentSuccess />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/grade/:submissionId" element={<GradingInterface />} />
        </Routes>
      </div>
    </Router>
  );
}

function NavLink({ to, isActive, children }) {
  const active = isActive(to);
  return (
    <Link
      to={to}
      className={`relative pb-1 text-sm font-medium transition-colors duration-300 whitespace-nowrap
        after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent after:transition-transform after:duration-300 after:origin-left
        ${active
          ? 'text-dark font-semibold after:scale-x-100'
          : 'text-dark-tertiary hover:text-dark after:scale-x-0 hover:after:scale-x-100'
        }`}
    >
      {children}
    </Link>
  );
}

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  isActive: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

function Header({ user }) {
  const location = useLocation();
  const isSeminarJoinRoute = /^\/academy\/seminars\/[^/]+\/join$/.test(location.pathname);

  if (isSeminarJoinRoute) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-page mx-auto px-8 flex items-center justify-between py-4 flex-wrap lg:flex-nowrap">
        <div className="shrink-0">
          <Link to="/" className="no-underline text-inherit">
            <h1 className="text-[22px] font-bold text-body mb-0.5 tracking-wide">UniFreelancer</h1>
            <p className="text-[10px] font-medium text-muted tracking-[1.5px] uppercase">FREELANCE PORTAL</p>
          </Link>
        </div>

        <nav className="flex items-center gap-8 grow justify-center order-3 w-full mt-4 overflow-x-auto lg:order-none lg:w-auto lg:mt-0 xl:gap-8">
          <NavLink to="/" isActive={isActive}>Home</NavLink>
          <NavLink to="/find-work" isActive={isActive}>Find Work</NavLink>
          <NavLink to="/browse-freelancers" isActive={isActive}>Browse Freelancers</NavLink>
          <NavLink to="/hire-talent" isActive={isActive}>Hire Talent</NavLink>
          <NavLink to="/academy" isActive={isActive}>UF Academy</NavLink>
          <NavLink to="/social" isActive={isActive}>UF Social</NavLink>
          <NavLink to="/about" isActive={isActive}>About Us</NavLink>
          <NavLink to="/inbox" isActive={isActive}>Inbox</NavLink>
          {user?.accountType === 'instructor' && (
            <NavLink to="/instructor/dashboard" isActive={isActive}>Dashboard</NavLink>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-secondary text-white flex items-center justify-center font-semibold text-sm cursor-pointer transition-all duration-300 shadow-accent hover:scale-110 hover:shadow-accent-hover">
                  {user.firstName && user.firstName.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          ) : (
            <>
              <NavLink to="/login" isActive={isActive}>Login</NavLink>
              <NavLink to="/signup" isActive={isActive}>Sign Up</NavLink>
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
    accountType: PropTypes.string,
  })
};

export default App;
