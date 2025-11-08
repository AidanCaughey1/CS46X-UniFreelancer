/**
 * Seed Data Script for Dummy Backend
 * Run this to populate the backend with sample courses for testing
 * 
 * Usage: node seed-data.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');

// Sample courses data
const sampleCourses = [
  {
    id: "dm-mastery-001",
    title: "Digital Marketing Mastery",
    description: "Learn comprehensive digital marketing strategies including SEO, social media marketing, content marketing, email campaigns, and analytics. Perfect for freelancers looking to offer marketing services or promote their own business.",
    duration: "8 weeks",
    difficulty: "Intermediate",
    category: "Digital Marketing",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    isLiteVersion: false,
    priceAmount: 299,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "photo-basics-002",
    title: "Professional Photography",
    description: "Master the art of professional photography from composition to editing. Learn to use your camera like a pro, understand lighting, and develop your unique style. Includes basics of business photography for freelancers.",
    duration: "4 weeks",
    difficulty: "Beginner",
    category: "Photography",
    thumbnail: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=250&fit=crop",
    isLiteVersion: true,
    priceAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "webdev-bootcamp-003",
    title: "Web Development Bootcamp",
    description: "Become a full-stack web developer. Learn HTML, CSS, JavaScript, React, Node.js, and databases. Build real-world projects and launch your freelance web development career with confidence.",
    duration: "12 weeks",
    difficulty: "Advanced",
    category: "Web Development",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
    isLiteVersion: false,
    priceAmount: 599,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ui-ux-design-004",
    title: "UI/UX Design Fundamentals",
    description: "Learn the principles of user interface and user experience design. Master tools like Figma, create stunning designs, and understand user psychology to build better products.",
    duration: "6 weeks",
    difficulty: "Beginner",
    category: "Design",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
    isLiteVersion: false,
    priceAmount: 249,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "content-writing-005",
    title: "Content Writing for Freelancers",
    description: "Master the art of compelling content creation. Learn SEO writing, copywriting techniques, storytelling, and how to attract and retain clients as a freelance writer.",
    duration: "5 weeks",
    difficulty: "Beginner",
    category: "Writing",
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop",
    isLiteVersion: false,
    priceAmount: 199,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "social-media-006",
    title: "Social Media Management",
    description: "Become a social media expert. Learn platform strategies, content planning, community management, analytics, and how to grow accounts for clients or your own brand.",
    duration: "6 weeks",
    difficulty: "Intermediate",
    category: "Social Media",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop",
    isLiteVersion: false,
    priceAmount: 279,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "freelance-basics-007",
    title: "Freelancing 101",
    description: "Start your freelance journey with confidence. Learn how to find clients, set rates, manage projects, handle contracts, and build a sustainable freelance business.",
    duration: "3 weeks",
    difficulty: "Beginner",
    category: "Business",
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=250&fit=crop",
    isLiteVersion: true,
    priceAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "video-editing-008",
    title: "Video Editing Masterclass",
    description: "Learn professional video editing with Adobe Premiere Pro and DaVinci Resolve. Create stunning videos for clients, YouTube, or social media. Includes color grading and audio mixing.",
    duration: "10 weeks",
    difficulty: "Intermediate",
    category: "Video Production",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop",
    isLiteVersion: false,
    priceAmount: 399,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "graphic-design-009",
    title: "Graphic Design Essentials",
    description: "Master Adobe Photoshop, Illustrator, and design principles. Create logos, branding materials, social media graphics, and more. Perfect for aspiring freelance designers.",
    duration: "8 weeks",
    difficulty: "Beginner",
    category: "Design",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop",
    isLiteVersion: false,
    priceAmount: 329,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "data-analysis-010",
    title: "Data Analysis for Business",
    description: "Learn data analysis with Excel, Python, and visualization tools. Help businesses make data-driven decisions and offer valuable analytics services as a freelancer.",
    duration: "9 weeks",
    difficulty: "Advanced",
    category: "Data Science",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    isLiteVersion: false,
    priceAmount: 449,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('✅ Created data directory');
}

// Write sample courses
try {
  fs.writeFileSync(COURSES_FILE, JSON.stringify(sampleCourses, null, 2));
  console.log('✅ Successfully seeded courses!');
  console.log(`📊 Added ${sampleCourses.length} sample courses`);
  console.log(`📁 File location: ${COURSES_FILE}`);
  console.log('\n🎯 Sample courses:');
  sampleCourses.forEach((course, index) => {
    console.log(`   ${index + 1}. ${course.title} (${course.difficulty}) - ${course.priceAmount === 0 ? 'Free' : '$' + course.priceAmount}`);
  });
  console.log('\n🚀 Start the server to see these courses in action!');
  console.log('   Run: npm start');
} catch (error) {
  console.error('❌ Error seeding data:', error);
  process.exit(1);
}




