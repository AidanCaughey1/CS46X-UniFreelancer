import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Academy from './pages/Academy/Academy';
import LearningHub from './pages/Academy/LearningHub/LearningHub';
import CreateContent from './pages/Academy/CreateContent/CreateContent';
import CreateCourse from './pages/Academy/Courses/CreateCourse';
import CourseDetail from './pages/Academy/Courses/CourseDetail';
import CreateSeminar from './pages/Academy/Seminars/CreateSeminar';
import SeminarDetails from './pages/Academy/Seminars/SeminarDetails';
import SeminarZoomPage from './pages/Academy/Seminars/SeminarZoomPage';
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
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setAuthLoading(false);
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
        <Header user={user} />
        <Routes>
          <Route path="/" element={<Academy />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/courses" element={<LearningHub />} />
          <Route path="/academy/my-courses" element={<MyCourses />} />
          <Route path="/academy/create" element={<CreateContent user={user} />} />
          <Route path="/academy/seminars" element={<LearningHub />} />
          <Route path="/academy/tutorials" element={<LearningHub />} />
          <Route path="/academy/tutorials/:id" element={<TutorialDetail />} />
          <Route path="/academy/create/course" element={<CreateCourse />} />
          <Route path="/academy/courses/:id" element={<CourseDetail />} />
          <Route path="/academy/create/:courseId" element={<CreateCourse />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/academy/create/seminar" element={<CreateSeminar />} />
          <Route path="/academy/seminars/:id" element={<SeminarDetails />} />
          <Route path="/academy/seminars/:id/join" element={<SeminarZoomPage />} />
          <Route
            path="/academy/create/tutorial"
            element={(
              <AdminRoute user={user} authLoading={authLoading}>
                <CreateTutorial />
              </AdminRoute>
            )}
          />
          <Route
            path="/academy/tutorials/:id/edit"
            element={(
              <AdminRoute user={user} authLoading={authLoading}>
                <CreateTutorial />
              </AdminRoute>
            )}
          />
          <Route path="/academy/payment-success" element={<PaymentSuccess />} />
          <Route path="/academy/courses/:id/learn" element={<CourseLearning />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/grade/:submissionId" element={<GradingInterface />} />
          <Route
            path="/admin"
            element={(
              <AdminRoute user={user} authLoading={authLoading}>
                <AdminDashboard />
              </AdminRoute>
            )}
          />
        </Routes>
      </div>
    </Router>
  );
}

function AdminRoute({ user, authLoading, children }) {
  const location = useLocation();

  if (authLoading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (user.accountType !== 'admin') {
    return <Navigate to="/academy/tutorials" replace />;
  }

  return children;
}

function NavItem({ to, isActive, children, className = '' }) {
  const active = isActive(to);
  const baseClasses = 'relative pb-1 text-sm font-medium transition-colors duration-300 whitespace-nowrap after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent after:transition-transform after:duration-300 after:origin-left';
  const stateClasses = active
    ? 'text-dark font-semibold after:scale-x-100'
    : 'text-dark-tertiary hover:text-dark after:scale-x-0 hover:after:scale-x-100';

  return (
    <Link to={to} className={`${baseClasses} ${stateClasses} ${className}`.trim()}>
      {children}
    </Link>
  );
}

function Header({ user }) {
  const location = useLocation();
  const isSeminarJoinRoute = /^\/academy\/seminars\/[^/]+\/join$/.test(location.pathname);

  if (isSeminarJoinRoute) {
    return null;
  }

  // Function to check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const avatarLetter =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-8 py-4 lg:flex-nowrap">
        <div className="shrink-0">
          <Link to="/" className="text-inherit no-underline">
            <h1 className="mb-0.5 text-lg font-bold tracking-wide text-body">UniFreelancer</h1>
            <p className="text-[8px] font-medium uppercase tracking-[1.5px] text-muted">FREELANCE PORTAL</p>
          </Link>
        </div>

        <nav className="order-3 flex w-full grow items-center justify-start gap-5 overflow-x-auto lg:order-none lg:w-auto lg:justify-center lg:overflow-x-visible xl:gap-8">
          <NavItem to="/" isActive={isActive}>Home</NavItem>
          <NavItem to="/find-work" isActive={isActive}>Find Work</NavItem>
          <NavItem to="/browse-freelancers" isActive={isActive}>Browse Freelancers</NavItem>
          <NavItem to="/hire-talent" isActive={isActive}>Hire Talent</NavItem>
          <NavItem to="/academy" isActive={isActive}>UF Academy</NavItem>
          <NavItem to="/social" isActive={isActive}>UF Social</NavItem>
          <NavItem to="/about" isActive={isActive}>About Us</NavItem>
          <NavItem to="/inbox" isActive={isActive}>Inbox</NavItem>

          {user && user.accountType === 'instructor' && (
            <NavItem
              to="/instructor/dashboard"
              isActive={isActive}
              className="rounded-md bg-gradient-to-br from-accent to-accent-secondary px-4 py-2 font-semibold text-white shadow-accent after:hidden hover:-translate-y-0.5 hover:text-white hover:shadow-accent-hover"
            >
              Dashboard
            </NavItem>
          )}

          {user && user.accountType === 'admin' && (
            <NavItem
              to="/admin"
              isActive={isActive}
              className="rounded-md bg-gradient-to-br from-accent to-accent-secondary px-4 py-2 font-semibold text-white shadow-accent after:hidden hover:-translate-y-0.5 hover:text-white hover:shadow-accent-hover"
            >
              Admin
            </NavItem>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary text-sm font-semibold text-white shadow-accent transition-all duration-300 hover:scale-110 hover:shadow-accent-hover">
                  {avatarLetter}
                </div>
              </Link>
            </div>
          ) : (
            <>
              <NavItem to="/login" isActive={isActive}>Login</NavItem>
              <NavItem to="/signup" isActive={isActive}>Sign Up</NavItem>
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

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  isActive: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

AdminRoute.propTypes = {
  user: PropTypes.shape({
    accountType: PropTypes.string
  }),
  authLoading: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

export default App;
