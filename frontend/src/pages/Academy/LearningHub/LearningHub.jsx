import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';


function LearningHub() {
  const location = useLocation();
  const navigate = useNavigate();
  // Set default tab based on URL
  const getInitialTab = () => {
    if (location.pathname === '/academy/seminars') return 'seminars';
    if (location.pathname === '/academy/tutorials') return 'tutorials';
    return 'courses';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab()); // 'continue-learning', 'courses', 'seminars', 'tutorials'
  const [courses, setCourses] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredSeminars, setFilteredSeminars] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedCount: 0,
    learningHours: 0
  });

  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  const [courseFilters, setCourseFilters] = useState({
    level: [],
    language: [],
    duration: [],
    price: []
  });

  const [seminarFilters, setSeminarFilters] = useState({
    type: [],
    duration: [],
    status: []
  });

  const [tutorialFilters, setTutorialFilters] = useState({
    topic: [],
    difficulty: [],
    length: []
  });

  // Update tab when URL changes
  useEffect(() => {
    const newTab = location.pathname === '/academy/seminars' ? 'seminars' :
      location.pathname === '/academy/tutorials' ? 'tutorials' :
        'courses';
    setActiveTab(newTab);
  }, [location.pathname]);

  // Fetch data
  useEffect(() => {
    fetchCourses();
    fetchSeminars();
    fetchTutorials();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use configured API URL and new profile endpoint
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        credentials: 'include' // Use cookies!
      });

      if (response.ok) {
        const userData = await response.json();
        const enrolledCount = userData.enrolledCourses ? userData.enrolledCourses.length : 0;
        const completedCount = userData.completedCourses ? userData.completedCourses.length : 0;
        const learningHours = userData.completedCourses
          ? Math.round(userData.completedCourses.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0) / 60)
          : 0;

        setStats({ enrolledCount, completedCount, learningHours });
        const enrolledIds = userData.enrolledCourses ? userData.enrolledCourses.map(c => c._id) : [];
        setEnrolledCourseIds(enrolledIds);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/academy/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeminars = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/academy/seminars');
      if (response.ok) {
        const data = await response.json();
        setSeminars(data);
        setFilteredSeminars(data);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    }
  };

  const fetchTutorials = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/academy/tutorials');
      if (response.ok) {
        const data = await response.json();
        setTutorials(data);
        setFilteredTutorials(data);
      }
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    }
  };

  // Filter courses
  const filterCourses = useCallback(() => {
    let filtered = [...courses];

    if (activeTab === 'continue-learning') {
      filtered = filtered.filter(course => enrolledCourseIds.includes(course._id));
    }

    if (searchTerm && (activeTab === 'courses' || activeTab === 'continue-learning')) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (courseFilters.level.length > 0) {
      filtered = filtered.filter(course => courseFilters.level.includes(course.difficulty));
    }

    if (courseFilters.duration.length > 0) {
      filtered = filtered.filter(course => {
        const weeks = parseInt(course.duration);
        return courseFilters.duration.some(range => {
          if (range === 'less-4') return weeks < 4;
          if (range === '4-8') return weeks >= 4 && weeks <= 8;
          if (range === '8-12') return weeks > 8 && weeks <= 12;
          if (range === 'more-12') return weeks > 12;
          return false;
        });
      });
    }

    if (courseFilters.price.length > 0) {
      filtered = filtered.filter(course => {
        const isFree = course.isLiteVersion || !course.priceAmount || course.priceAmount === 0;
        const price = course.priceAmount || 0;
        return courseFilters.price.some(range => {
          if (range === 'free') return isFree;
          if (range === 'under-300') return price > 0 && price < 300;
          if (range === '300-600') return price >= 300 && price <= 600;
          if (range === 'over-600') return price > 600;
          return false;
        });
      });
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, courseFilters, activeTab, enrolledCourseIds]);

  // Filter seminars
  const filterSeminars = useCallback(() => {
    let filtered = [...seminars];

    if (searchTerm && activeTab === 'seminars') {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.speaker?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (seminarFilters.type.length > 0) {
      filtered = filtered.filter(s => seminarFilters.type.includes(s.type));
    }

    if (seminarFilters.duration.length > 0) {
      filtered = filtered.filter(s => {
        const mins = parseInt(s.duration) || 0;
        return seminarFilters.duration.some(range => {
          if (range === 'less-60') return mins < 60;
          if (range === '60-90') return mins >= 60 && mins <= 90;
          if (range === 'more-90') return mins > 90;
          return false;
        });
      });
    }

    if (seminarFilters.status.length > 0) {
      filtered = filtered.filter(s => {
        const watched = s.watched ? 'Watched' : 'Not Watched';
        return seminarFilters.status.includes(watched);
      });
    }

    setFilteredSeminars(filtered);
  }, [seminars, searchTerm, seminarFilters, activeTab]);

  // Filter tutorials
  const filterTutorials = useCallback(() => {
    let filtered = [...tutorials];

    if (searchTerm && activeTab === 'tutorials') {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tutorialFilters.topic.length > 0) {
      filtered = filtered.filter(t => tutorialFilters.topic.includes(t.topic));
    }

    if (tutorialFilters.difficulty.length > 0) {
      filtered = filtered.filter(t => tutorialFilters.difficulty.includes(t.difficulty));
    }

    if (tutorialFilters.length.length > 0) {
      filtered = filtered.filter(t => tutorialFilters.length.includes(t.lengthCategory));
    }

    setFilteredTutorials(filtered);
  }, [tutorials, searchTerm, tutorialFilters, activeTab]);

  useEffect(() => {
    if (activeTab === 'courses' || activeTab === 'continue-learning') {
      filterCourses();
    } else if (activeTab === 'seminars') {
      filterSeminars();
    } else if (activeTab === 'tutorials') {
      filterTutorials();
    }
  }, [filterCourses, filterSeminars, filterTutorials, activeTab]);

  const handleCourseFilterChange = (category, value) => {
    setCourseFilters(prev => {
      const currentFilters = prev[category];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value];
      return { ...prev, [category]: newFilters };
    });
  };

  const handleSeminarFilterChange = (category, value) => {
    setSeminarFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleTutorialFilterChange = (category, value) => {
    setTutorialFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const getCourseDuration = (duration) => {
    if (!duration) return 'Self-paced';
    return duration.includes('week') ? duration : `${duration} weeks`;
  };

  const getCoursePrice = (course) => {
    if (course.subscription && (course.subscription.isSubscriptionCourse === true || course.subscription.isSubscriptionCourse === 'true')) {
      return 'Included in subscription';
    }
    const amountFromPricing = typeof course.pricing?.amount === 'number' ? course.pricing.amount : undefined;
    const amount = amountFromPricing ?? Number(course.priceAmount || 0);
    if (amount > 0) return `$${amount}`;
    if (course.isLiteVersion) return 'Free';
    return 'Free';
  };

  const handleBackToAcademy = () => {
    navigate('/academy');
  };

  return (
    <div className="min-h-screen bg-main-bg pb-16">
      <div className="max-w-page mx-auto pt-24 px-10 md:px-5">
        <button
          className="bg-transparent border-none text-dark-primary text-base cursor-pointer mb-8 py-2 inline-flex items-center transition-colors duration-300 hover:text-dark-secondary"
          onClick={handleBackToAcademy}
        >
          <FiArrowLeft className="inline mr-1" /> Back to Academy
        </button>

        {/* My Learning Section */}
        <div className="bg-light-tertiary rounded-md p-10 mb-10 shadow-sm md:p-6">
          <h2 className="text-4xl font-bold text-dark-primary mb-2">My Learning</h2>
          <p className="text-base text-dark-secondary mb-8">Track your progress and continue your learning journey</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="flex items-center gap-4 p-5 bg-light-secondary rounded-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-4xl w-[50px] h-[50px] flex items-center justify-center bg-light-secondary rounded-[10px]">📖</span>
              <div className="flex-1">
                <div className="text-[28px] font-bold text-body leading-none mb-1">{stats.enrolledCount}</div>
                <div className="text-sm text-[#666]">Enrolled Courses</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-light-secondary rounded-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-4xl w-[50px] h-[50px] flex items-center justify-center bg-light-secondary rounded-[10px]">🎓</span>
              <div className="flex-1">
                <div className="text-[28px] font-bold text-body leading-none mb-1">{stats.completedCount}</div>
                <div className="text-sm text-[#666]">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-light-secondary rounded-[10px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-4xl w-[50px] h-[50px] flex items-center justify-center bg-light-secondary rounded-[10px]">🕐</span>
              <div className="flex-1">
                <div className="text-[28px] font-bold text-body leading-none mb-1">{stats.learningHours}</div>
                <div className="text-sm text-[#666]">Learning Hours</div>
              </div>
            </div>
          </div>

          <div className="flex border-b-2 border-border">
            <button
              className={`py-3 px-6 bg-transparent border-none border-b-[3px] border-transparent text-[#666] text-md font-medium cursor-pointer transition-all duration-300 -mb-[2px] hover:text-body ${activeTab === 'continue-learning' ? '!text-body !border-b-body' : ''}`}
              onClick={() => {
                setActiveTab('continue-learning');
                setSearchTerm('');
                navigate('/academy/courses');
              }}
            >
              Continue Learning
            </button>
            <button
              className={`py-3 px-6 bg-transparent border-none border-b-[3px] border-transparent text-[#666] text-md font-medium cursor-pointer transition-all duration-300 -mb-[2px] hover:text-body ${activeTab === 'courses' ? '!text-body !border-b-body' : ''}`}
              onClick={() => {
                setActiveTab('courses');
                setSearchTerm('');
                navigate('/academy/courses');
              }}
            >
              Courses
            </button>
            <button
              className={`py-3 px-6 bg-transparent border-none border-b-[3px] border-transparent text-[#666] text-md font-medium cursor-pointer transition-all duration-300 -mb-[2px] hover:text-body ${activeTab === 'seminars' ? '!text-body !border-b-body' : ''}`}
              onClick={() => {
                setActiveTab('seminars');
                setSearchTerm('');
                navigate('/academy/seminars');
              }}
            >
              Seminars
            </button>
            <button
              className={`py-3 px-6 bg-transparent border-none border-b-[3px] border-transparent text-[#666] text-md font-medium cursor-pointer transition-all duration-300 -mb-[2px] hover:text-body ${activeTab === 'tutorials' ? '!text-body !border-b-body' : ''}`}
              onClick={() => {
                setActiveTab('tutorials');
                setSearchTerm('');
                navigate('/academy/tutorials');
              }}
            >
              Tutorials
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-main-bg rounded-md p-10 shadow-sm mt-10 md:p-6">
          <h2 className="text-4xl font-bold text-dark-primary mb-2">
            {activeTab === 'continue-learning' ? 'Continue Learning' :
              activeTab === 'courses' ? 'Courses' :
                activeTab === 'seminars' ? 'Seminars & Events' :
                  'Tutorials'}
          </h2>
          <p className="text-base text-dark-secondary mb-8">
            {activeTab === 'continue-learning' ? 'Continue your learning journey with enrolled courses' :
              activeTab === 'courses' ? 'Structured learning programs to master freelancing disciplines' :
                activeTab === 'seminars' ? 'Interactive live sessions and expert workshops' :
                  'Quick, focused lessons to learn specific skills'}
          </p>

          <div className="flex gap-4 mb-8 md:flex-col">
            <div className="flex-1 relative flex items-center">
              <span className="absolute left-[15px] text-lg text-muted">🔍</span>
              <input
                type="text"
                className="w-full py-3 pr-4 pl-[45px] border border-[#ddd] rounded focus:outline-none focus:border-body text-md transition-colors duration-300"
                placeholder={
                  activeTab === 'continue-learning' || activeTab === 'courses' ? 'Search courses...' :
                    activeTab === 'seminars' ? 'Search seminars...' :
                      'Search tutorials...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="py-3 px-5 border border-[#ddd] rounded text-md bg-white cursor-pointer min-w-[150px] focus:outline-none focus:border-body md:w-full">
              {activeTab === 'continue-learning' || activeTab === 'courses' ? (
                <>
                  <option>All Courses</option>
                  <option>Most Popular</option>
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </>
              ) : activeTab === 'seminars' ? (
                <>
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Live Sessions</option>
                </>
              ) : (
                <>
                  <option>Newest First</option>
                  <option>Most Popular</option>
                  <option>Duration: Short to Long</option>
                </>
              )}
            </select>
          </div>

          <div className="flex gap-8 max-md:flex-col">
            {/* Filters Sidebar */}
            <div className="w-[250px] shrink-0 bg-light-tertiary rounded-[14px] p-4 px-5 sticky top-20 h-fit max-md:w-full max-md:relative max-md:top-0">
              <h3 className="text-lg font-bold text-body mb-5">Filter By</h3>

              {(activeTab === 'courses' || activeTab === 'continue-learning') ? (
                <>
                  {/* Level Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Level</h4>
                    {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                      <label key={level} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={courseFilters.level.includes(level)}
                          onChange={() => handleCourseFilterChange('level', level)}
                        />
                        <span>{level}</span>
                      </label>
                    ))}
                  </div>

                  {/* Duration Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Duration</h4>
                    {['less-4', '4-8', '8-12', 'more-12'].map(range => (
                      <label key={range} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={courseFilters.duration.includes(range)}
                          onChange={() => handleCourseFilterChange('duration', range)}
                        />
                        <span>
                          {range === 'less-4' ? 'Less than 4 weeks' :
                            range === '4-8' ? '4-8 weeks' :
                              range === '8-12' ? '8-12 weeks' :
                                'More than 12 weeks'}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Price Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Price</h4>
                    {['free', 'under-300', '300-600', 'over-600'].map(range => (
                      <label key={range} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={courseFilters.price.includes(range)}
                          onChange={() => handleCourseFilterChange('price', range)}
                        />
                        <span>
                          {range === 'free' ? 'Free' :
                            range === 'under-300' ? 'Under $300' :
                              range === '300-600' ? '$300 - $600' :
                                'Over $600'}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              ) : activeTab === 'seminars' ? (
                <>
                  {/* Type Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Type</h4>
                    {['Live', 'Recorded', 'Podcast'].map(type => (
                      <label key={type} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={seminarFilters.type.includes(type)}
                          onChange={() => handleSeminarFilterChange('type', type)}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>

                  {/* Duration Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Duration</h4>
                    {['less-60', '60-90', 'more-90'].map(range => (
                      <label key={range} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={seminarFilters.duration.includes(range)}
                          onChange={() => handleSeminarFilterChange('duration', range)}
                        />
                        <span>
                          {range === 'less-60' ? 'Less than 60 min' :
                            range === '60-90' ? '60–90 min' :
                              'More than 90 min'}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Status</h4>
                    {['Watched', 'Not Watched'].map(status => (
                      <label key={status} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={seminarFilters.status.includes(status)}
                          onChange={() => handleSeminarFilterChange('status', status)}
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Topic Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Topic</h4>
                    {['Design', 'Marketing', 'Development', 'Business'].map(topic => (
                      <label key={topic} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={tutorialFilters.topic.includes(topic)}
                          onChange={() => handleTutorialFilterChange('topic', topic)}
                        />
                        <span>{topic}</span>
                      </label>
                    ))}
                  </div>

                  {/* Difficulty Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Difficulty</h4>
                    {['Beginner', 'Intermediate', 'Advanced'].map(difficulty => (
                      <label key={difficulty} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={tutorialFilters.difficulty.includes(difficulty)}
                          onChange={() => handleTutorialFilterChange('difficulty', difficulty)}
                        />
                        <span>{difficulty}</span>
                      </label>
                    ))}
                  </div>

                  {/* Length Filter */}
                  <div className="mb-8 pb-5 border-b border-border last:border-b-0 max-md:inline-block max-md:w-auto max-md:mr-[30px] max-md:align-top">
                    <h4 className="text-md font-semibold text-body mb-3">Length</h4>
                    {['Short', 'Medium', 'Long'].map(length => (
                      <label key={length} className="flex items-center gap-3 py-2 cursor-pointer text-base text-[#555] hover:[&>span]:text-body">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] cursor-pointer"
                          checked={tutorialFilters.length.includes(length)}
                          onChange={() => handleTutorialFilterChange('length', length)}
                        />
                        <span>{length}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-3 auto-rows-[1fr] gap-6 max-md:grid-cols-1">
              {loading ? (
                <div className="col-span-full text-center py-16 px-5 text-[#666] text-base">
                  Loading {activeTab === 'courses' || activeTab === 'continue-learning' ? 'courses' : activeTab === 'seminars' ? 'seminars' : 'tutorials'}...
                </div>
              ) : (activeTab === 'courses' || activeTab === 'continue-learning' ? filteredCourses : activeTab === 'seminars' ? filteredSeminars : activeTab === 'tutorials' ? filteredTutorials : []).length === 0 ? (
                <div className="col-span-full text-center py-16 px-5 text-[#666] text-base">
                  <p className="mb-5">No {activeTab === 'courses' || activeTab === 'continue-learning' ? 'courses' : activeTab === 'seminars' ? 'seminars' : 'tutorials'} found matching your criteria.</p>
                  <button
                    className="py-3 px-5 bg-body text-white border-none rounded-sm text-base cursor-pointer hover:bg-[#1a252f]"
                    onClick={() => {
                      setSearchTerm('');
                      if (activeTab === 'courses' || activeTab === 'continue-learning') {
                        setCourseFilters({ level: [], language: [], duration: [], price: [] });
                      } else if (activeTab === 'seminars') {
                        setSeminarFilters({ type: [], duration: [], status: [] });
                      } else if (activeTab === 'tutorials') {
                        setTutorialFilters({ topic: [], difficulty: [], length: [] });
                      }
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (activeTab === 'courses' || activeTab === 'continue-learning') ? (
                filteredCourses.map(course => (
                  <div
                    key={course.id || course._id}
                    className="bg-light-tertiary border border-border rounded-[14px] overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover flex flex-col"
                    onClick={() => navigate(`/academy/courses/${course._id || course.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="w-full h-[180px] overflow-hidden bg-[#f5f5f5]">
                      {course.thumbnail ? (
                        <img className="w-full h-full object-cover" src={course.thumbnail} alt={course.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">📚</div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-dark-primary flex-1">{course.title}</h3>
                        {course.isLiteVersion && <span className="py-1 px-3 bg-[#e8e8e8] text-[#666] text-xs font-medium rounded-md">Lite</span>}
                      </div>
                      <p className="text-base text-dark-secondary leading-relaxed mb-4">
                        {course.description?.substring(0, 80)}...
                      </p>
                      <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-border-light mt-auto">
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <span className="text-base">🕐</span>
                          <span>{getCourseDuration(course.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <span className="text-base">🏷️</span>
                          <span>{course.category || 'General'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <span className="text-base">📊</span>
                          <span>{course.difficulty}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-body">{getCoursePrice(course)}</div>
                        <button
                          className="py-2 px-4 bg-accent text-white border-none rounded-sm text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-accent-tertiary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/academy/courses/${course._id || course.id}`);
                          }}
                        >
                          View Details <FiArrowRight className="inline ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : activeTab === 'seminars' ? (
                filteredSeminars.map(seminar => (
                  <div key={seminar._id} className="bg-light-tertiary border border-border rounded-[14px] overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="w-full h-[180px] overflow-hidden bg-[#f5f5f5]">
                      {seminar.thumbnail ? (
                        <img className="w-full h-full object-cover" src={seminar.thumbnail} alt={seminar.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">🎤</div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-dark-primary mb-2.5">{seminar.title}</h3>
                      <p className="text-base text-dark-secondary leading-relaxed mb-4">
                        {seminar.description?.substring(0, 80)}...
                      </p>
                      <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-border-light">
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <span className="text-base">🗣️</span>
                          <span>{seminar.speaker?.name || 'Unknown Speaker'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <span className="text-base">📅</span>
                          <span>{seminar.schedule?.date || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <span className="text-base">🎧</span>
                          <span>{seminar.type}</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button className="py-2 px-4 bg-accent text-white border-none rounded-sm text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-accent-tertiary" onClick={() => navigate(`/academy/seminars/${seminar._id}`)}>View Details <FiArrowRight className="inline ml-1" /></button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredTutorials.map((tutorial) => {
                  const tutorialId = tutorial._id || tutorial.id;
                  const goToTutorial = () => {
                    if (!tutorialId) return;
                    navigate(`/academy/tutorials/${tutorialId}`);
                  };

                  return (
                    <div
                      key={tutorialId || tutorial.title}
                      className="bg-light-tertiary border border-border rounded-[14px] overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                      onClick={goToTutorial}
                      style={{ cursor: tutorialId ? "pointer" : "default" }}
                    >
                      <div className="w-full h-[180px] overflow-hidden bg-[#f5f5f5]">
                        {tutorial.thumbnail ? (
                          <img className="w-full h-full object-cover" src={tutorial.thumbnail} alt={tutorial.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">📘</div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-dark-primary mb-2.5">{tutorial.title}</h3>
                        <p className="text-base text-dark-secondary leading-relaxed mb-4">
                          {tutorial.description?.substring(0, 90)}...
                        </p>
                        <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-border-light">
                          <div className="flex items-center gap-2 text-sm text-[#666]">
                            <span className="text-base">📚</span>
                            <span>{tutorial.topic}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#666]">
                            <span className="text-base">🎯</span>
                            <span>{tutorial.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#666]">
                            <span className="text-base">⏱️</span>
                            <span>{tutorial.lengthCategory}</span>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="py-2 px-4 bg-accent text-white border-none rounded-sm text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-accent-tertiary"
                            onClick={(e) => {
                              e.stopPropagation();
                              goToTutorial();
                            }}
                          >
                            View Tutorial <FiArrowRight className="inline ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningHub;
