import type { Course } from '../types';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { ArrowLeft, Clock, Award, Play, FileText, ClipboardList, HelpCircle, Lock, BarChart, Star } from 'lucide-react';

interface CourseDetailPageProps {
  course: Course;
  onBack: () => void;
  onEnroll: () => void;
  onStartCourse: () => void;
  isEnrolled?: boolean;
}

export function CourseDetailPage({ course, onBack, onEnroll, onStartCourse, isEnrolled = false }: CourseDetailPageProps) {
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'reading':
        return <FileText className="w-4 h-4" />;
      case 'assignment':
        return <ClipboardList className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Courses
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video overflow-hidden rounded-lg">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1>{course.title}</h1>
              {course.isLite && (
                <Badge variant="secondary">Lite Version</Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-4">{course.description}</p>
            
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span>{course.badge}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-muted-foreground" />
                <span>{course.difficulty}</span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                {course.modules.length} modules • {totalLessons} lessons
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {course.modules.map((module, index) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <span>Module {index + 1}: {module.title}</span>
                        <span className="text-sm text-muted-foreground">
                          ({module.lessons.length} lesson{module.lessons.length > 1 ? 's' : ''})
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              {getLessonIcon(lesson.type)}
                              <span className="text-sm">{lesson.title}</span>
                              {lesson.locked && !isEnrolled && (
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews & Ratings</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
                <span className="text-sm text-muted-foreground">5.0 out of 5</span>
              </div>
              <p className="text-sm text-muted-foreground">Based on 127 reviews</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Be the first to leave a review for this course</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {course.price === 'Free' ? 'Free Course' : `$${course.price}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEnrolled ? (
                <>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors" size="lg" onClick={onEnroll}>
                    {course.price === 'Free' ? 'Start Learning Free' : 'Enroll Now'}
                  </Button>
                  {course.price !== 'Free' && (
                    <p className="text-xs text-muted-foreground text-center">
                      Choose from monthly, 6-month, or yearly plans
                    </p>
                  )}
                </>
              ) : (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors" size="lg" onClick={onStartCourse}>
                  Continue Learning
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p>{course.instructor.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{course.instructor.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.modules.map((module, index) => (
                <div key={module.id} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm">{module.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
