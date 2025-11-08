# UniFreelancer Academy Frontend

This is the frontend application for the UniFreelancer Academy platform, built with React.

## Features Implemented

### 1. UF Academy Main Page (`/academy`)
- Clean, modern landing page
- Three main content cards: Courses, Seminars, and Tutorials
- "Share Your Expertise" section with call-to-action button
- Fully responsive design

### 2. Create Content Selection Page (`/academy/create`)
- Navigation tabs for different content types
- Three content type cards (Course, Seminar, Tutorial)
- Color-coded icons (blue for courses, green for seminars, purple for tutorials)
- "Why Share Your Expertise?" benefits section
- Back to Academy navigation

### 3. Create Course Form Page (`/academy/create/course`)
- Multi-step navigation (Basic Info, Instructor, Pricing, Content, Modules)
- Comprehensive form fields for course creation:
  - Title and Description
  - Duration and Difficulty Level
  - Category/Badge
  - Thumbnail URL with upload option
  - Lite version checkbox
- Form validation with required fields
- Integration with backend API for course creation
- Cancel and Create Course actions

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Backend Connection

The frontend is configured to connect to the backend API at `http://localhost:5000`. Make sure the backend server is running before testing the course creation functionality.

To start the backend:
```bash
cd backend
npm start
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── pages/
│   │   ├── Academy.jsx     # Main Academy landing page
│   │   ├── Academy.css
│   │   ├── CreateContent.jsx   # Content type selection page
│   │   ├── CreateContent.css
│   │   ├── CreateCourse.jsx    # Course creation form
│   │   └── CreateCourse.css
│   ├── App.jsx            # Main app component with routing
│   ├── App.css            # Global styles
│   └── index.js           # Entry point
├── package.json
└── README.md
```

## Routing

- `/` or `/academy` - Main Academy landing page
- `/academy/create` - Content type selection page
- `/academy/create/course` - Course creation form

## Design Features

### Color Palette
- Primary: `#2c3e50` (Dark blue-gray)
- Secondary: `#ff6b35` (Orange for user avatar)
- Course icon: `#3498db` (Blue)
- Seminar icon: `#2ecc71` (Green)
- Tutorial icon: `#9b59b6` (Purple)

### Typography
- System font stack for optimal performance
- Clean, modern sans-serif fonts
- Hierarchical font sizes for clear information architecture

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px, 992px, and 1200px
- Flexible grid layouts

## Future Enhancements

The following features are planned for future development:

1. **Create Course Form**
   - Instructor information section
   - Pricing details section
   - Course content management
   - Module and lesson builder

2. **Additional Content Types**
   - Seminar creation form
   - Tutorial creation form

3. **User Features**
   - Course browsing and filtering
   - Enrollment functionality
   - Progress tracking
   - Course completion certificates

4. **Social Features**
   - Course reviews and ratings
   - Instructor profiles
   - Student discussion forums

## Contributing

Please refer to the main project's CONTRIBUTING.md for guidelines on contributing to this project.

## License

This project is part of the OSU 2025 Capstone Project for Team 37.




