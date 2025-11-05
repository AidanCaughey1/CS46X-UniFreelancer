import { useState } from 'react';
import type { Course, Lesson } from '../types';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CheckCircle2, Circle, Play, FileText, ClipboardList, HelpCircle, Award } from 'lucide-react';

interface CourseViewerPageProps {
  course: Course;
  onBack: () => void;
}

export function CourseViewerPage({ course, onBack }: CourseViewerPageProps) {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [currentLesson, setCurrentLesson] = useState<Lesson>(course.modules[0].lessons[0]);

  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const progress = (completedLessons.size / totalLessons) * 100;

  const handleCompleteLesson = () => {
    setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
  };

  const getLessonIcon = (type: string, completed: boolean) => {
    const iconClass = `w-4 h-4 ${completed ? 'text-green-600' : 'text-muted-foreground'}`;
    switch (type) {
      case 'video':
        return <Play className={iconClass} />;
      case 'reading':
        return <FileText className={iconClass} />;
      case 'assignment':
        return <ClipboardList className={iconClass} />;
      case 'quiz':
        return <HelpCircle className={iconClass} />;
      default:
        return <Play className={iconClass} />;
    }
  };

  const allLessonsComplete = completedLessons.size === totalLessons;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Course
          </Button>
          <Badge variant={allLessonsComplete ? "default" : "secondary"}>
            {completedLessons.size} / {totalLessons} Complete
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{course.title}</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="text-sm">Course Content</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Module {moduleIndex + 1}
                  </div>
                  <div className="text-sm mb-2">{module.title}</div>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isCompleted = completedLessons.has(lesson.id);
                      const isCurrent = currentLesson.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getLessonIcon(lesson.type, isCompleted)}
                                <span className="text-xs opacity-80 capitalize">{lesson.type}</span>
                              </div>
                              <div className="text-sm line-clamp-2">{lesson.title}</div>
                              <div className="text-xs opacity-70 mt-1">{lesson.duration}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8 space-y-6">
            {allLessonsComplete ? (
              <Card className="border-green-600">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Congratulations!</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        You've completed {course.title}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-primary/5 rounded-lg text-center">
                    <Award className="w-16 h-16 mx-auto mb-3 text-primary" />
                    <h3 className="mb-2">You've Earned a Badge!</h3>
                    <p className="text-muted-foreground mb-4">{course.badge}</p>
                    <Badge className="text-sm px-4 py-2">View Certificate</Badge>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    This badge has been added to your UniFreelancer profile and helps showcase your expertise to potential clients.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getLessonIcon(currentLesson.type, false)}
                    <span className="text-sm text-muted-foreground capitalize">{currentLesson.type}</span>
                  </div>
                  <h2>{currentLesson.title}</h2>
                  <p className="text-muted-foreground">{currentLesson.duration}</p>
                </div>

                {currentLesson.type === 'video' && (
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Play className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p className="text-sm opacity-70">Video Player Placeholder</p>
                    </div>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{currentLesson.content}</p>
                    
                    {currentLesson.type === 'quiz' && (
                      <div className="mt-6 space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="mb-2">Sample Quiz Question:</p>
                          <p className="text-sm text-muted-foreground">
                            This quiz will test your understanding of the concepts covered in this module.
                          </p>
                        </div>
                      </div>
                    )}

                    {currentLesson.type === 'assignment' && (
                      <div className="mt-6 space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="mb-2">Assignment Instructions:</p>
                          <p className="text-sm text-muted-foreground">
                            Complete the practical assignment to apply what you've learned.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline">Previous Lesson</Button>
                  {!completedLessons.has(currentLesson.id) ? (
                    <Button onClick={handleCompleteLesson}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Completed</span>
                    </div>
                  )}
                  <Button>Next Lesson</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
