import { useState } from 'react';
import type { Course } from './types';
import { mockCourses } from './data/mockData';
import { Navbar } from './components/Navbar';
import { AcademyLandingPage } from './pages/AcademyLandingPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CourseViewerPage } from './pages/CourseViewerPage';
import { EnrollmentDialog } from './components/EnrollmentDialog';
import { Toaster } from './components/ui/sonner';

type View = 'landing' | 'courses';
type ViewState = 
  | { type: 'list'; view: View }
  | { type: 'courseDetail'; course: Course }
  | { type: 'courseViewer'; course: Course };

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'list', view: 'landing' });
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set(['course-1']));
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState<Course | null>(null);

  const handleCourseClick = (course: Course) => {
    setCurrentView({ type: 'courseDetail', course });
  };

  const handleEnrollClick = (course: Course) => {
    setSelectedCourseForEnrollment(course);
    setEnrollmentDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEnroll = (_optionId: string) => {
    if (selectedCourseForEnrollment) {
      setEnrolledCourses(prev => new Set([...prev, selectedCourseForEnrollment.id]));
      setCurrentView({ type: 'courseViewer', course: selectedCourseForEnrollment });
    }
  };

  const handleStartCourse = (course: Course) => {
    setCurrentView({ type: 'courseViewer', course });
  };

  // Render course viewer in full screen
  if (currentView.type === 'courseViewer') {
    return (
      <>
        <CourseViewerPage
          course={currentView.course}
          onBack={() => setCurrentView({ type: 'list', view: 'courses' })}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        activeLink="UF Academy" 
        onAcademyClick={() => setCurrentView({ type: 'list', view: 'landing' })}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {currentView.type === 'list' && currentView.view === 'landing' && (
          <AcademyLandingPage
            onNavigate={(section) => {
              if (section === 'courses') {
                setCurrentView({ type: 'list', view: 'courses' });
              }
            }}
          />
        )}

        {currentView.type === 'list' && currentView.view === 'courses' && (
          <CoursesPage
            courses={mockCourses}
            onCourseClick={handleCourseClick}
          />
        )}

        {currentView.type === 'courseDetail' && (
          <CourseDetailPage
            course={currentView.course}
            onBack={() => setCurrentView({ type: 'list', view: 'courses' })}
            onEnroll={() => handleEnrollClick(currentView.course)}
            onStartCourse={() => handleStartCourse(currentView.course)}
            isEnrolled={enrolledCourses.has(currentView.course.id)}
          />
        )}

        {selectedCourseForEnrollment && (
          <EnrollmentDialog
            course={selectedCourseForEnrollment}
            open={enrollmentDialogOpen}
            onOpenChange={setEnrollmentDialogOpen}
            onEnroll={handleEnroll}
          />
        )}
      </div>

      <Toaster />
    </div>
  );
}
