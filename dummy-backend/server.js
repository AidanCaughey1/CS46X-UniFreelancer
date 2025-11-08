const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const SEMINARS_FILE = path.join(DATA_DIR, 'seminars.json');
const TUTORIALS_FILE = path.join(DATA_DIR, 'tutorials.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Initialize data files if they don't exist
const initializeFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
};

initializeFile(COURSES_FILE);
initializeFile(SEMINARS_FILE);
initializeFile(TUTORIALS_FILE);

// Helper functions
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ==================== COURSES ROUTES ====================

// Get all courses
app.get('/api/academy/courses', (req, res) => {
  const courses = readData(COURSES_FILE);
  res.status(200).json(courses);
});

// Get course by ID
app.get('/api/academy/courses/:id', (req, res) => {
  const courses = readData(COURSES_FILE);
  const course = courses.find(c => c.id === req.params.id);
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  res.status(200).json(course);
});

// Create a new course
app.post('/api/academy/courses', (req, res) => {
  const courses = readData(COURSES_FILE);
  
  const newCourse = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  courses.push(newCourse);
  
  if (writeData(COURSES_FILE, courses)) {
    console.log('✅ Course created:', newCourse.title);
    res.status(201).json(newCourse);
  } else {
    res.status(500).json({ error: 'Failed to save course' });
  }
});

// Update a course
app.put('/api/academy/courses/:id', (req, res) => {
  const courses = readData(COURSES_FILE);
  const index = courses.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  courses[index] = {
    ...courses[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  
  if (writeData(COURSES_FILE, courses)) {
    console.log('✅ Course updated:', courses[index].title);
    res.status(200).json(courses[index]);
  } else {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete a course
app.delete('/api/academy/courses/:id', (req, res) => {
  const courses = readData(COURSES_FILE);
  const filteredCourses = courses.filter(c => c.id !== req.params.id);
  
  if (courses.length === filteredCourses.length) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  if (writeData(COURSES_FILE, filteredCourses)) {
    console.log('✅ Course deleted');
    res.status(200).json({ message: 'Course deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// ==================== SEMINARS ROUTES ====================

// Get all seminars
app.get('/api/academy/seminars', (req, res) => {
  const seminars = readData(SEMINARS_FILE);
  res.status(200).json(seminars);
});

// Create a new seminar
app.post('/api/academy/seminars', (req, res) => {
  const seminars = readData(SEMINARS_FILE);
  
  const newSeminar = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  seminars.push(newSeminar);
  
  if (writeData(SEMINARS_FILE, seminars)) {
    console.log('✅ Seminar created:', newSeminar.title);
    res.status(201).json(newSeminar);
  } else {
    res.status(500).json({ error: 'Failed to save seminar' });
  }
});

// ==================== TUTORIALS ROUTES ====================

// Get all tutorials
app.get('/api/academy/tutorials', (req, res) => {
  const tutorials = readData(TUTORIALS_FILE);
  res.status(200).json(tutorials);
});

// Create a new tutorial
app.post('/api/academy/tutorials', (req, res) => {
  const tutorials = readData(TUTORIALS_FILE);
  
  const newTutorial = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  tutorials.push(newTutorial);
  
  if (writeData(TUTORIALS_FILE, tutorials)) {
    console.log('✅ Tutorial created:', newTutorial.title);
    res.status(201).json(newTutorial);
  } else {
    res.status(500).json({ error: 'Failed to save tutorial' });
  }
});

// ==================== ACADEMY ROUTES ====================

app.get('/api/academy', (req, res) => {
  res.json({ message: 'Welcome to UniFreelancer Academy API' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Dummy Backend is running',
    timestamp: new Date().toISOString(),
    coursesCount: readData(COURSES_FILE).length,
    seminarsCount: readData(SEMINARS_FILE).length,
    tutorialsCount: readData(TUTORIALS_FILE).length,
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'UniFreelancer Academy Dummy Backend',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      courses: '/api/academy/courses',
      seminars: '/api/academy/seminars',
      tutorials: '/api/academy/tutorials',
    }
  });
});

// Export app for testing
module.exports = app;

// Only start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   UniFreelancer Academy - Dummy Backend           ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`\n📊 Data stored in: ${DATA_DIR}`);
    console.log(`\n📍 Endpoints:`);
    console.log(`   - GET  /api/health`);
    console.log(`   - GET  /api/academy/courses`);
    console.log(`   - POST /api/academy/courses`);
    console.log(`   - GET  /api/academy/seminars`);
    console.log(`   - POST /api/academy/seminars`);
    console.log(`   - GET  /api/academy/tutorials`);
    console.log(`   - POST /api/academy/tutorials`);
    console.log(`\n✨ Ready to accept requests!\n`);
  });
}





