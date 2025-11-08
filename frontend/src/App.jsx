import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Academy from './pages/Academy';
import Courses from './pages/Courses';
import CreateContent from './pages/CreateContent';
import CreateCourse from './pages/CreateCourse';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Academy />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/courses" element={<Courses />} />
          <Route path="/academy/create" element={<CreateContent />} />
          <Route path="/academy/create/course" element={<CreateCourse />} />
        </Routes>
      </div>
    </Router>
  );
}

function Header() {
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
          <Link to="/">Home</Link>
          <Link to="/find-work">Find Work</Link>
          <Link to="/browse-freelancers">Browse Freelancers</Link>
          <Link to="/hire-talent">Hire Talent</Link>
          <Link to="/academy" className="active">UF Academy</Link>
          <Link to="/social">UF Social</Link>
          <Link to="/about">About Us</Link>
          <Link to="/inbox">Inbox</Link>
        </nav>
        <div className="user-profile">
          <div className="avatar">JD</div>
        </div>
      </div>
    </header>
  );
}

export default App;

