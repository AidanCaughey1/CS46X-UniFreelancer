import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface AcademyLandingPageProps {
  onNavigate: (section: 'courses') => void;
}

export function AcademyLandingPage({ onNavigate }: AcademyLandingPageProps) {
  return (
    <div className="space-y-12 py-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="mb-6">UniFreelancer Academy</h1>
        <p className="text-muted-foreground text-lg">
          UniFreelancer cares about education and continued support for university students
          and alumni entering or already working in the freelance industry. The UniFreelancer
          Academy offers courses to help make you a better freelancer!
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card 
          className="overflow-hidden cursor-pointer transition-all hover:shadow-xl"
          onClick={() => onNavigate('courses')}
        >
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1588912914074-b93851ff14b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBjb3Vyc2VzJTIwbGFwdG9wfGVufDF8fHx8MTc2MTI0NDEwMXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Courses"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8 text-center">
            <h2 className="mb-4">Explore Courses</h2>
            <p className="text-muted-foreground mb-6">
              Browse our collection of courses designed to help you succeed as a freelancer.
            </p>
            <Button size="lg" onClick={() => onNavigate('courses')}>
              Browse Courses
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
