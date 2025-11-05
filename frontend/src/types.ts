// Shared types for the learning platform

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number | 'Free';
  duration: string;
  badge: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: {
    name: string;
    bio: string;
    avatar: string;
  };
  isLite: boolean;
  modules: Module[];
  enrollmentOptions: EnrollmentOption[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'assignment' | 'quiz';
  duration: string;
  content: string;
  completed: boolean;
  locked: boolean;
}

export interface EnrollmentOption {
  id: string;
  type: 'monthly' | '6-month' | 'yearly';
  price: number;
  duration: string;
}
