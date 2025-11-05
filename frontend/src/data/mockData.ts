import type { Course } from '@/types';

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Digital Marketing Mastery',
    description: 'Learn comprehensive digital marketing strategies including SEO, social media, email marketing, and analytics. Perfect for freelancers looking to expand their service offerings.',
    thumbnail: 'https://images.unsplash.com/photo-1562577309-2592ab84b1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwY291cnNlfGVufDF8fHx8MTc2MTE5MzQ5OXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 299,
    duration: '8 weeks',
    badge: 'Certified Digital Marketer',
    difficulty: 'Intermediate',
    isLite: false,
    instructor: {
      name: 'Sarah Johnson',
      bio: 'Digital marketing expert with 10+ years of experience helping brands grow online. Former Marketing Director at Fortune 500 companies.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    enrollmentOptions: [
      { id: 'monthly-1', type: 'monthly', price: 299, duration: '1 month access' },
      { id: '6month-1', type: '6-month', price: 499, duration: '6 months access' },
      { id: 'yearly-1', type: 'yearly', price: 799, duration: '1 year access' }
    ],
    modules: [
      {
        id: 'module-1-1',
        title: 'Introduction to Digital Marketing',
        completed: true,
        lessons: [
          {
            id: 'lesson-1-1-1',
            title: 'Course Overview & Welcome',
            type: 'video',
            duration: '12 min',
            content: 'Welcome video introducing the course structure and learning objectives.',
            completed: true,
            locked: false
          },
          {
            id: 'lesson-1-1-2',
            title: 'Digital Marketing Landscape',
            type: 'video',
            duration: '25 min',
            content: 'Understanding the current digital marketing ecosystem.',
            completed: true,
            locked: false
          }
        ]
      },
      {
        id: 'module-1-2',
        title: 'SEO Fundamentals',
        completed: false,
        lessons: [
          {
            id: 'lesson-1-2-1',
            title: 'Search Engine Optimization Basics',
            type: 'video',
            duration: '30 min',
            content: 'Learn the fundamentals of SEO and how search engines work.',
            completed: true,
            locked: false
          },
          {
            id: 'lesson-1-2-2',
            title: 'Keyword Research',
            type: 'assignment',
            duration: '45 min',
            content: 'Hands-on assignment to research keywords for a sample business.',
            completed: true,
            locked: false
          }
        ]
      },
      {
        id: 'module-1-3',
        title: 'Social Media Marketing',
        completed: false,
        lessons: [
          {
            id: 'lesson-1-3-1',
            title: 'Social Media Strategy',
            type: 'video',
            duration: '35 min',
            content: 'Building effective social media strategies.',
            completed: false,
            locked: true
          },
          {
            id: 'lesson-1-3-2',
            title: 'Content Creation',
            type: 'reading',
            duration: '20 min',
            content: 'Best practices for creating engaging social media content.',
            completed: false,
            locked: true
          }
        ]
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Professional Photography',
    description: 'Master the art of professional photography from composition to editing. Learn to capture stunning images and build a photography portfolio.',
    thumbnail: 'https://images.unsplash.com/photo-1622319977720-9949ac28adc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNhbWVyYXxlbnwxfHx8fDE3NjExNTg4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 'Free',
    duration: '4 weeks',
    badge: 'Photography Basics',
    difficulty: 'Beginner',
    isLite: true,
    instructor: {
      name: 'Michael Chen',
      bio: 'Award-winning photographer specializing in portrait and commercial photography. Published in National Geographic and Vogue.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    enrollmentOptions: [],
    modules: [
      {
        id: 'module-2-1',
        title: 'Camera Basics',
        completed: false,
        lessons: [
          {
            id: 'lesson-2-1-1',
            title: 'Understanding Your Camera',
            type: 'video',
            duration: '20 min',
            content: 'Introduction to camera settings and controls.',
            completed: false,
            locked: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Web Development Bootcamp',
    description: 'Become a full-stack web developer. Learn HTML, CSS, JavaScript, React, and Node.js to build modern web applications from scratch.',
    thumbnail: 'https://images.unsplash.com/photo-1593720213681-e9a8778330a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjEyMDY1MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 599,
    duration: '12 weeks',
    badge: 'Full-Stack Developer',
    difficulty: 'Advanced',
    isLite: false,
    instructor: {
      name: 'Alex Rivera',
      bio: 'Senior software engineer with expertise in modern web technologies. Built applications for startups and enterprise clients.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    enrollmentOptions: [
      { id: 'monthly-3', type: 'monthly', price: 599, duration: '1 month access' },
      { id: '6month-3', type: '6-month', price: 999, duration: '6 months access' },
      { id: 'yearly-3', type: 'yearly', price: 1499, duration: '1 year access' }
    ],
    modules: [
      {
        id: 'module-3-1',
        title: 'Frontend Fundamentals',
        completed: true,
        lessons: [
          {
            id: 'lesson-3-1-1',
            title: 'HTML & CSS Basics',
            type: 'video',
            duration: '45 min',
            content: 'Foundation of web development.',
            completed: true,
            locked: false
          }
        ]
      },
      {
        id: 'module-3-2',
        title: 'JavaScript Essentials',
        completed: false,
        lessons: [
          {
            id: 'lesson-3-2-1',
            title: 'JavaScript Fundamentals',
            type: 'video',
            duration: '60 min',
            content: 'Core JavaScript concepts.',
            completed: false,
            locked: false
          }
        ]
      }
    ]
  }
];
