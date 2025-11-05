import { useState } from 'react';
import type { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { FilterPanel, type FilterCategory } from '../components/FilterPanel';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search } from 'lucide-react';

interface CoursesPageProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
}

const filterCategories: FilterCategory[] = [
  {
    id: 'level',
    label: 'Level',
    options: [
      { id: 'beginner', label: 'Beginner' },
      { id: 'intermediate', label: 'Intermediate' },
      { id: 'advanced', label: 'Advanced' }
    ]
  },
  {
    id: 'language',
    label: 'Language',
    options: [
      { id: 'english', label: 'English' },
      { id: 'spanish', label: 'Spanish' },
      { id: 'french', label: 'French' }
    ]
  },
  {
    id: 'duration',
    label: 'Duration',
    options: [
      { id: 'short', label: 'Less than 4 weeks' },
      { id: 'medium', label: '4-8 weeks' },
      { id: 'long', label: '8-12 weeks' },
      { id: 'extra-long', label: 'More than 12 weeks' }
    ]
  },
  {
    id: 'price',
    label: 'Price',
    options: [
      { id: 'free', label: 'Free' },
      { id: 'under-300', label: 'Under $300' },
      { id: '300-600', label: '$300 - $600' },
      { id: 'over-600', label: 'Over $600' }
    ]
  }
];

export function CoursesPage({ courses, onCourseClick }: CoursesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const handleFilterChange = (categoryId: string, optionId: string, checked: boolean) => {
    setSelectedFilters(prev => {
      const current = prev[categoryId] || [];
      if (checked) {
        return { ...prev, [categoryId]: [...current, optionId] };
      } else {
        return { ...prev, [categoryId]: current.filter(id => id !== optionId) };
      }
    });
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' ||
                          (filterType === 'free' && course.price === 'Free') ||
                          (filterType === 'paid' && course.price !== 'Free');
    
    // Level filter
    if (selectedFilters.level?.length > 0) {
      const levelMatch = selectedFilters.level.some(level => 
        course.difficulty.toLowerCase() === level
      );
      if (!levelMatch) return false;
    }

    // Duration filter
    if (selectedFilters.duration?.length > 0) {
      const weeks = parseInt(course.duration);
      const durationMatch = selectedFilters.duration.some(duration => {
        if (duration === 'short') return weeks < 4;
        if (duration === 'medium') return weeks >= 4 && weeks <= 8;
        if (duration === 'long') return weeks > 8 && weeks <= 12;
        if (duration === 'extra-long') return weeks > 12;
        return false;
      });
      if (!durationMatch) return false;
    }

    // Price filter
    if (selectedFilters.price?.length > 0) {
      const priceMatch = selectedFilters.price.some(priceRange => {
        if (priceRange === 'free') return course.price === 'Free';
        if (priceRange === 'under-300') return typeof course.price === 'number' && course.price < 300;
        if (priceRange === '300-600') return typeof course.price === 'number' && course.price >= 300 && course.price <= 600;
        if (priceRange === 'over-600') return typeof course.price === 'number' && course.price > 600;
        return false;
      });
      if (!priceMatch) return false;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Courses</h1>
        <p className="text-muted-foreground">
          Structured learning programs to master freelancing disciplines
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="free">Free Courses</SelectItem>
            <SelectItem value="paid">Paid Courses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-muted/30 rounded-lg p-4">
            <FilterPanel
              categories={filterCategories}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => onCourseClick(course)}
              />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No courses found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
