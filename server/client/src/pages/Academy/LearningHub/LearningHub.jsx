import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiPlayCircle,
  FiSearch,
  FiUser,
  FiVideo
} from "react-icons/fi";
import {
  getSeminarLocalScheduleLabel,
  getSeminarStatus
} from "../../../utils/seminarStatus";

const getLocationTab = (pathname) => {
  if (pathname === "/academy/seminars") return "seminars";
  if (pathname === "/academy/tutorials") return "tutorials";
  return "courses";
};

const includesId = (collection, targetId) => {
  if (!Array.isArray(collection) || !targetId) return false;
  return collection.some((item) => {
    if (!item) return false;
    if (typeof item === "string") return item === targetId;
    return item._id === targetId;
  });
};

const getCoursePrice = (course) => {
  if (
    course.subscription?.isSubscriptionCourse === true ||
    course.subscription?.isSubscriptionCourse === "true"
  ) {
    return "Included with subscription";
  }

  const amount = Number(course.priceAmount ?? course.pricing?.amount ?? 0);
  if (amount > 0) return `$${amount}`;
  return "Free";
};

const getCoursePriceValue = (course) =>
  Number(course.priceAmount ?? course.pricing?.amount ?? 0);

const formatMinutes = (value) => {
  const minutes = Number(value || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder
    ? `${hours}h ${String(remainder).padStart(2, "0")}m`
    : `${hours}h`;
};

const getCourseDuration = (course) =>
  formatMinutes(course.estimatedMinutes) ||
  (course.duration ? String(course.duration) : null) ||
  "Self-paced";

const getTutorialDuration = (tutorial) => {
  if (!tutorial?.duration) return "Self-paced";
  const normalized = String(tutorial.duration).trim();
  return /^\d+$/.test(normalized) ? `${normalized} minutes` : normalized;
};

const getTutorialFormats = (tutorial) => ({
  hasVideo: Boolean(tutorial?.videoUrl),
  hasWrittenContent: Boolean(String(tutorial?.writtenContent || "").trim())
});

const getSeminarDurationBucket = (seminar) => {
  const minutes = Number(seminar?.duration || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) return "unknown";
  if (minutes < 60) return "under-60";
  if (minutes <= 90) return "60-90";
  return "over-90";
};

const formatDescription = (value, max = 110) => {
  const text = String(value || "").trim();
  if (!text) return "Details will be available soon.";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
};

const sortByDateDescending = (items, accessor) =>
  [...items].sort((a, b) => accessor(b) - accessor(a));

function LearningHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationTab = getLocationTab(location.pathname);

  const [activeTab, setActiveTab] = useState(() => getLocationTab(location.pathname));
  const [courses, setCourses] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("recommended");
  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedCount: 0,
    learningHours: 0
  });
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [courseFilters, setCourseFilters] = useState({
    level: [],
    price: []
  });
  const [seminarFilters, setSeminarFilters] = useState({
    status: [],
    duration: []
  });
  const [tutorialFilters, setTutorialFilters] = useState({
    category: [],
    format: []
  });

  useEffect(() => {
    if (locationTab === "seminars" || locationTab === "tutorials") {
      setActiveTab(locationTab);
      return;
    }

    setActiveTab((prev) => (prev === "continue-learning" ? prev : "courses"));
  }, [locationTab]);

  useEffect(() => {
    let mounted = true;

    const fetchJson = async (url, options = {}) => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
      }
      return response.json();
    };

    const load = async () => {
      try {
        setLoading(true);

        const [coursesResult, seminarsResult, tutorialsResult, profileResult] =
          await Promise.allSettled([
            fetchJson("/api/academy/courses"),
            fetchJson("/api/academy/seminars"),
            fetchJson("/api/academy/tutorials"),
            fetchJson("/api/users/profile", { credentials: "include" })
          ]);

        if (!mounted) return;

        setCourses(
          coursesResult.status === "fulfilled" && Array.isArray(coursesResult.value)
            ? coursesResult.value
            : []
        );
        setSeminars(
          seminarsResult.status === "fulfilled" && Array.isArray(seminarsResult.value)
            ? seminarsResult.value
            : []
        );
        setTutorials(
          tutorialsResult.status === "fulfilled" && Array.isArray(tutorialsResult.value)
            ? tutorialsResult.value
            : []
        );

        if (profileResult.status === "fulfilled") {
          const profile = profileResult.value || {};
          const enrolledCourses = Array.isArray(profile.enrolledCourses)
            ? profile.enrolledCourses
            : [];
          const completedCourses = Array.isArray(profile.completedCourses)
            ? profile.completedCourses
            : [];

          setStats({
            enrolledCount: enrolledCourses.length,
            completedCount: completedCourses.length,
            learningHours: Math.round(
              completedCourses.reduce(
                (total, item) => total + Number(item?.estimatedMinutes || 0),
                0
              ) / 60
            )
          });
          setEnrolledCourseIds(
            enrolledCourses
              .map((course) => (typeof course === "string" ? course : course?._id))
              .filter(Boolean)
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const tutorialCategories = useMemo(
    () =>
      Array.from(
        new Set(
          tutorials
            .map((tutorial) => tutorial.category || tutorial.topic)
            .filter(Boolean)
        )
      ).sort((left, right) => left.localeCompare(right)),
    [tutorials]
  );

  const visibleCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let items =
      activeTab === "continue-learning"
        ? courses.filter((course) =>
            includesId(enrolledCourseIds, course._id || course.id)
          )
        : [...courses];

    if (normalizedSearch) {
      items = items.filter((course) =>
        [course.title, course.description, course.category, course.instructor?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch))
      );
    }

    if (courseFilters.level.length) {
      items = items.filter((course) =>
        courseFilters.level.includes(course.difficulty || "Beginner")
      );
    }

    if (courseFilters.price.length) {
      items = items.filter((course) => {
        const isSubscriptionCourse =
          course.subscription?.isSubscriptionCourse === true ||
          course.subscription?.isSubscriptionCourse === "true";
        const price = getCoursePriceValue(course);

        return courseFilters.price.some((value) => {
          if (value === "free") return price === 0 && !isSubscriptionCourse;
          if (value === "paid") return price > 0;
          if (value === "subscription") return isSubscriptionCourse;
          return false;
        });
      });
    }

    if (sortOption === "price-low") {
      return [...items].sort((left, right) => getCoursePriceValue(left) - getCoursePriceValue(right));
    }

    if (sortOption === "price-high") {
      return [...items].sort((left, right) => getCoursePriceValue(right) - getCoursePriceValue(left));
    }

    if (sortOption === "title") {
      return [...items].sort((left, right) => left.title.localeCompare(right.title));
    }

    return sortByDateDescending(
      items,
      (course) => new Date(course.updatedAt || course.createdAt || 0).getTime()
    );
  }, [activeTab, courseFilters.level, courseFilters.price, courses, enrolledCourseIds, searchTerm, sortOption]);

  const visibleSeminars = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const now = Date.now();
    let items = [...seminars];

    if (normalizedSearch) {
      items = items.filter((seminar) =>
        [seminar.title, seminar.description, seminar.speaker?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch))
      );
    }

    if (seminarFilters.status.length) {
      items = items.filter((seminar) =>
        seminarFilters.status.includes(getSeminarStatus(seminar, now))
      );
    }

    if (seminarFilters.duration.length) {
      items = items.filter((seminar) =>
        seminarFilters.duration.includes(getSeminarDurationBucket(seminar))
      );
    }

    if (sortOption === "live-first") {
      return [...items].sort((left, right) => {
        const leftStatus = getSeminarStatus(left, now);
        const rightStatus = getSeminarStatus(right, now);
        const order = { "Live Now": 0, Future: 1, Past: 2 };
        return order[leftStatus] - order[rightStatus];
      });
    }

    if (sortOption === "oldest") {
      return [...items].sort((left, right) => {
        const leftTime = new Date(left?.schedule?.startAt || 0).getTime();
        const rightTime = new Date(right?.schedule?.startAt || 0).getTime();
        return leftTime - rightTime;
      });
    }

    return [...items].sort((left, right) => {
      const leftTime = new Date(left?.schedule?.startAt || left?.createdAt || 0).getTime();
      const rightTime = new Date(right?.schedule?.startAt || right?.createdAt || 0).getTime();
      return rightTime - leftTime;
    });
  }, [searchTerm, seminarFilters.duration, seminarFilters.status, seminars, sortOption]);

  const visibleTutorials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let items = [...tutorials];

    if (normalizedSearch) {
      items = items.filter((tutorial) =>
        [tutorial.title, tutorial.description, tutorial.category, tutorial.topic]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch))
      );
    }

    if (tutorialFilters.category.length) {
      items = items.filter((tutorial) =>
        tutorialFilters.category.includes(tutorial.category || tutorial.topic || "General")
      );
    }

    if (tutorialFilters.format.length) {
      items = items.filter((tutorial) => {
        const formats = getTutorialFormats(tutorial);
        return tutorialFilters.format.some((value) => {
          if (value === "video") return formats.hasVideo;
          if (value === "written") return formats.hasWrittenContent;
          return false;
        });
      });
    }

    if (sortOption === "title") {
      return [...items].sort((left, right) => left.title.localeCompare(right.title));
    }

    if (sortOption === "shortest") {
      return [...items].sort(
        (left, right) => Number(left.duration || 0) - Number(right.duration || 0)
      );
    }

    return sortByDateDescending(
      items,
      (tutorial) => new Date(tutorial.updatedAt || tutorial.createdAt || 0).getTime()
    );
  }, [searchTerm, sortOption, tutorialFilters.category, tutorialFilters.format, tutorials]);

  const activeItems =
    activeTab === "seminars"
      ? visibleSeminars
      : activeTab === "tutorials"
      ? visibleTutorials
      : visibleCourses;

  const summary = {
    title:
      activeTab === "continue-learning"
        ? "Continue Learning"
        : activeTab === "seminars"
        ? "Seminars"
        : activeTab === "tutorials"
        ? "Tutorials"
        : "Courses",
    description:
      activeTab === "continue-learning"
        ? "Jump back into the courses already attached to your account."
        : activeTab === "seminars"
        ? "Live and scheduled sessions with current speakers and event timing."
        : activeTab === "tutorials"
        ? "Short, focused learning resources you can save and revisit."
        : "Structured Academy programs designed around deeper freelance skill-building."
  };

  const handleTabChange = (nextTab) => {
    setSearchTerm("");
    setSortOption("recommended");

    if (nextTab === "continue-learning") {
      setActiveTab("continue-learning");
      navigate("/academy/courses");
      return;
    }

    setActiveTab(nextTab);
    if (nextTab === "courses") navigate("/academy/courses");
    if (nextTab === "seminars") navigate("/academy/seminars");
    if (nextTab === "tutorials") navigate("/academy/tutorials");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortOption("recommended");
    setCourseFilters({ level: [], price: [] });
    setSeminarFilters({ status: [], duration: [] });
    setTutorialFilters({ category: [], format: [] });
  };

  const sortChoices =
    activeTab === "seminars"
      ? [
          { value: "recommended", label: "Newest First" },
          { value: "oldest", label: "Oldest First" },
          { value: "live-first", label: "Live First" }
        ]
      : activeTab === "tutorials"
      ? [
          { value: "recommended", label: "Newest First" },
          { value: "title", label: "Title A-Z" },
          { value: "shortest", label: "Shortest First" }
        ]
      : [
          { value: "recommended", label: "Recently Updated" },
          { value: "title", label: "Title A-Z" },
          { value: "price-low", label: "Price: Low to High" },
          { value: "price-high", label: "Price: High to Low" }
        ];

  const statsCards = [
    { icon: FiBookOpen, label: "Enrolled Courses", value: stats.enrolledCount },
    { icon: FiCheckCircle, label: "Completed Courses", value: stats.completedCount },
    { icon: FiClock, label: "Learning Hours", value: stats.learningHours }
  ];

  return (
    <div className="min-h-screen bg-main-bg pb-16 font-academy">
      <div className="mx-auto max-w-page px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <button
          type="button"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-dark transition hover:-translate-y-0.5 hover:bg-light-secondary"
          onClick={() => navigate("/academy")}
        >
          <FiArrowLeft />
          <span>Back to Academy</span>
        </button>

        <section className="rounded-[32px] border border-border bg-light-tertiary p-6 shadow-card lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                My Learning
              </p>
              <h1 className="mt-2 text-4xl font-bold text-dark sm:text-5xl">
                Academy library, redesigned for the active app
              </h1>
              <p className="mt-4 max-w-4xl text-base leading-8 text-dark-secondary">
                Browse courses, live seminars, and tutorials from the same data flow
                already used on this branch, with faster filtering and a unified
                Academy visual system.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {statsCards.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-accent/10 p-3 text-accent">
                      <Icon />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        {label}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-dark">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { id: "continue-learning", label: "Continue Learning" },
              { id: "courses", label: "Courses" },
              { id: "seminars", label: "Seminars" },
              { id: "tutorials", label: "Tutorials" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-dark text-white shadow-md"
                    : "bg-white text-dark hover:-translate-y-0.5 hover:bg-light-secondary"
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-border bg-white p-6 shadow-card lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Browse
              </p>
              <h2 className="mt-2 text-3xl font-bold text-dark">{summary.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-dark-secondary">
                {summary.description}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[540px] lg:flex-row">
              <label className="relative block flex-1">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dark-secondary" />
                <input
                  type="text"
                  className="w-full rounded-full border border-border bg-light-tertiary py-3 pl-11 pr-4 text-sm text-dark outline-none transition focus:border-dark"
                  placeholder={
                    activeTab === "seminars"
                      ? "Search seminars..."
                      : activeTab === "tutorials"
                      ? "Search tutorials..."
                      : "Search courses..."
                  }
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <select
                className="rounded-full border border-border bg-light-tertiary px-4 py-3 text-sm font-semibold text-dark outline-none transition focus:border-dark"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
              >
                {sortChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-border bg-light-tertiary p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-white p-3 text-accent shadow-sm">
                    <FiFilter />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Filters
                    </p>
                    <p className="text-lg font-bold text-dark">Refine results</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-sm font-semibold text-accent transition hover:text-accent-tertiary"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {(activeTab === "courses" || activeTab === "continue-learning") && (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        Level
                      </p>
                      <div className="mt-3 space-y-3">
                        {["Beginner", "Intermediate", "Advanced"].map((level) => (
                          <label
                            key={level}
                            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-dark"
                          >
                            <input
                              type="checkbox"
                              checked={courseFilters.level.includes(level)}
                              onChange={() =>
                                setCourseFilters((prev) => ({
                                  ...prev,
                                  level: prev.level.includes(level)
                                    ? prev.level.filter((value) => value !== level)
                                    : [...prev.level, level]
                                }))
                              }
                            />
                            <span>{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        Pricing
                      </p>
                      <div className="mt-3 space-y-3">
                        {[
                          { id: "free", label: "Free" },
                          { id: "paid", label: "Paid" },
                          { id: "subscription", label: "Subscription" }
                        ].map((filter) => (
                          <label
                            key={filter.id}
                            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-dark"
                          >
                            <input
                              type="checkbox"
                              checked={courseFilters.price.includes(filter.id)}
                              onChange={() =>
                                setCourseFilters((prev) => ({
                                  ...prev,
                                  price: prev.price.includes(filter.id)
                                    ? prev.price.filter((value) => value !== filter.id)
                                    : [...prev.price, filter.id]
                                }))
                              }
                            />
                            <span>{filter.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "seminars" && (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        Status
                      </p>
                      <div className="mt-3 space-y-3">
                        {["Future", "Live Now", "Past"].map((status) => (
                          <label
                            key={status}
                            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-dark"
                          >
                            <input
                              type="checkbox"
                              checked={seminarFilters.status.includes(status)}
                              onChange={() =>
                                setSeminarFilters((prev) => ({
                                  ...prev,
                                  status: prev.status.includes(status)
                                    ? prev.status.filter((value) => value !== status)
                                    : [...prev.status, status]
                                }))
                              }
                            />
                            <span>{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        Duration
                      </p>
                      <div className="mt-3 space-y-3">
                        {[
                          { id: "under-60", label: "Under 60 min" },
                          { id: "60-90", label: "60-90 min" },
                          { id: "over-90", label: "Over 90 min" }
                        ].map((filter) => (
                          <label
                            key={filter.id}
                            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-dark"
                          >
                            <input
                              type="checkbox"
                              checked={seminarFilters.duration.includes(filter.id)}
                              onChange={() =>
                                setSeminarFilters((prev) => ({
                                  ...prev,
                                  duration: prev.duration.includes(filter.id)
                                    ? prev.duration.filter((value) => value !== filter.id)
                                    : [...prev.duration, filter.id]
                                }))
                              }
                            />
                            <span>{filter.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "tutorials" && (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        Category
                      </p>
                      <div className="mt-3 space-y-3">
                        {tutorialCategories.length ? (
                          tutorialCategories.map((category) => (
                            <label
                              key={category}
                              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-dark"
                            >
                              <input
                                type="checkbox"
                                checked={tutorialFilters.category.includes(category)}
                                onChange={() =>
                                  setTutorialFilters((prev) => ({
                                    ...prev,
                                    category: prev.category.includes(category)
                                      ? prev.category.filter((value) => value !== category)
                                      : [...prev.category, category]
                                  }))
                                }
                              />
                              <span>{category}</span>
                            </label>
                          ))
                        ) : (
                          <p className="rounded-2xl bg-white px-4 py-3 text-sm text-dark-secondary">
                            No categories available yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        Format
                      </p>
                      <div className="mt-3 space-y-3">
                        {[
                          { id: "video", label: "Has Video" },
                          { id: "written", label: "Has Written Guide" }
                        ].map((filter) => (
                          <label
                            key={filter.id}
                            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-dark"
                          >
                            <input
                              type="checkbox"
                              checked={tutorialFilters.format.includes(filter.id)}
                              onChange={() =>
                                setTutorialFilters((prev) => ({
                                  ...prev,
                                  format: prev.format.includes(filter.id)
                                    ? prev.format.filter((value) => value !== filter.id)
                                    : [...prev.format, filter.id]
                                }))
                              }
                            />
                            <span>{filter.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>

            <div>
              {loading ? (
                <div className="rounded-[28px] border border-border bg-light-tertiary px-6 py-16 text-center text-dark-secondary">
                  Loading {summary.title.toLowerCase()}...
                </div>
              ) : activeItems.length === 0 ? (
                <div className="rounded-[28px] border border-border bg-light-tertiary px-6 py-16 text-center">
                  <h3 className="text-2xl font-bold text-dark">No results found</h3>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-dark-secondary">
                    No {summary.title.toLowerCase()} matched the current search and
                    filter combination.
                  </p>
                  <button
                    type="button"
                    className="mt-6 inline-flex rounded-full bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-dark-secondary"
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {(activeTab === "courses" || activeTab === "continue-learning") &&
                    visibleCourses.map((course) => {
                      const courseId = course._id || course.id;
                      const enrolled = includesId(enrolledCourseIds, courseId);

                      return (
                        <article
                          key={courseId}
                          className="flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
                        >
                          <div className="aspect-[16/10] bg-light-secondary">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ece8e4] via-[#f6f2ee] to-[#e5dfda]">
                                <FiBookOpen className="text-4xl text-accent" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col p-5">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                {course.category || "General"}
                              </span>
                              <span className="rounded-full bg-light-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-dark-secondary">
                                {course.difficulty || "Beginner"}
                              </span>
                            </div>

                            <h3 className="mt-4 text-2xl font-bold text-dark">
                              {course.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-dark-secondary">
                              {formatDescription(course.description)}
                            </p>

                            <div className="mt-5 space-y-3 rounded-2xl bg-light-tertiary px-4 py-4 text-sm text-dark-secondary">
                              <div className="flex items-center gap-2">
                                <FiClock className="text-accent" />
                                <span>{getCourseDuration(course)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiUser className="text-accent" />
                                <span>{course.instructor?.name || "UniFreelancer Academy"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiCheckCircle className="text-accent" />
                                <span>{enrolled ? "Enrolled" : getCoursePrice(course)}</span>
                              </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-4">
                              <span className="text-lg font-bold text-dark">
                                {enrolled ? "Ready to continue" : getCoursePrice(course)}
                              </span>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark-secondary"
                                onClick={() => navigate(`/academy/courses/${courseId}`)}
                              >
                                <span>{enrolled ? "Continue" : "View Details"}</span>
                                <FiArrowRight />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}

                  {activeTab === "seminars" &&
                    visibleSeminars.map((seminar) => {
                      const seminarStatus = getSeminarStatus(seminar, Date.now());

                      return (
                        <article
                          key={seminar._id}
                          className="flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
                        >
                          <div className="relative aspect-[16/10] bg-light-secondary">
                            {seminar.thumbnail ? (
                              <img
                                src={seminar.thumbnail}
                                alt={seminar.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ece8e4] via-[#f6f2ee] to-[#e5dfda]">
                                <FiVideo className="text-4xl text-accent" />
                              </div>
                            )}

                            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-dark shadow-sm">
                              {seminarStatus}
                            </span>
                          </div>

                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="text-2xl font-bold text-dark">{seminar.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-dark-secondary">
                              {formatDescription(seminar.description)}
                            </p>

                            <div className="mt-5 space-y-3 rounded-2xl bg-light-tertiary px-4 py-4 text-sm text-dark-secondary">
                              <div className="flex items-center gap-2">
                                <FiUser className="text-accent" />
                                <span>{seminar.speaker?.name || "Unknown Speaker"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiClock className="text-accent" />
                                <span>{getSeminarLocalScheduleLabel(seminar)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiPlayCircle className="text-accent" />
                                <span>
                                  {seminar.duration ? `${seminar.duration} min` : "Duration TBD"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark-secondary"
                                onClick={() => navigate(`/academy/seminars/${seminar._id}`)}
                              >
                                <span>View Details</span>
                                <FiArrowRight />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}

                  {activeTab === "tutorials" &&
                    visibleTutorials.map((tutorial) => {
                      const tutorialId = tutorial._id || tutorial.id;
                      const { hasVideo, hasWrittenContent } = getTutorialFormats(tutorial);

                      return (
                        <article
                          key={tutorialId || tutorial.title}
                          className="flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
                        >
                          <div className="aspect-[16/10] bg-light-secondary">
                            {tutorial.thumbnail ? (
                              <img
                                src={tutorial.thumbnail}
                                alt={tutorial.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ece8e4] via-[#f6f2ee] to-[#e5dfda]">
                                <FiBookOpen className="text-4xl text-accent" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col p-5">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                {tutorial.category || tutorial.topic || "General"}
                              </span>
                              {hasVideo ? (
                                <span className="rounded-full bg-light-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-dark-secondary">
                                  Video
                                </span>
                              ) : null}
                              {hasWrittenContent ? (
                                <span className="rounded-full bg-light-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-dark-secondary">
                                  Written
                                </span>
                              ) : null}
                            </div>

                            <h3 className="mt-4 text-2xl font-bold text-dark">
                              {tutorial.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-dark-secondary">
                              {formatDescription(tutorial.description)}
                            </p>

                            <div className="mt-5 space-y-3 rounded-2xl bg-light-tertiary px-4 py-4 text-sm text-dark-secondary">
                              <div className="flex items-center gap-2">
                                <FiClock className="text-accent" />
                                <span>{getTutorialDuration(tutorial)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiUser className="text-accent" />
                                <span>{tutorial.instructor?.name || "UniFreelancer Academy"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiPlayCircle className="text-accent" />
                                <span>
                                  {hasVideo && hasWrittenContent
                                    ? "Video + written guide"
                                    : hasVideo
                                    ? "Video tutorial"
                                    : hasWrittenContent
                                    ? "Written tutorial"
                                    : "Reference"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark-secondary disabled:cursor-not-allowed disabled:opacity-70"
                                onClick={() =>
                                  tutorialId && navigate(`/academy/tutorials/${tutorialId}`)
                                }
                                disabled={!tutorialId}
                              >
                                <span>View Tutorial</span>
                                <FiArrowRight />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LearningHub;
