import { Avatar, AvatarFallback } from './ui/avatar';

interface NavbarProps {
  activeLink?: string;
  onAcademyClick?: () => void;
}

export function Navbar({ activeLink = 'UF Academy', onAcademyClick }: NavbarProps) {
  const navLinks = [
    'Home',
    'Find Work',
    'Browse Freelancers',
    'Hire Talent',
    'UF Academy',
    'UF Social',
    'About Us',
    'Inbox'
  ];

  return (
    <nav className="border-b bg-white sticky top-0 z-50 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <img
              src="/UnifreelancerInc.avif"
              alt="Unifreelancer Inc."
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (link === 'UF Academy' && onAcademyClick) {
                    onAcademyClick();
                  }
                }}
                className={`text-sm transition-colors hover:text-primary relative pb-[1.1rem] ${
                  activeLink === link
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link}
                {activeLink === link && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                )}
              </a>
            ))}
          </div>

          {/* Profile Avatar */}
          <Avatar className="shrink-0 bg-orange-500 w-10 h-10">
            <AvatarFallback className="bg-orange-500 text-white">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
