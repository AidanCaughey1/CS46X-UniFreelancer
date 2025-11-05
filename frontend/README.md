# UniFreelancer Academy Frontend

This is the frontend for **UniFreelancer Academy**, built with **Vite**, **React**, **TypeScript**, and **TailwindCSS**.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or later)
- npm (comes with Node.js)
- Git

---

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AidanCaughey1/CS46X-UniFreelancer.git
cd CS46X-UniFreelancer/frontend
npm install
```

---

### Development

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Tech Stack

- **Vite** – Build tool for fast development
- **React + TypeScript** – Component-based UI with static typing
- **TailwindCSS** – Utility-first CSS framework
- **ShadCN/UI** – Prebuilt accessible component library

---

## Project Structure

```
src/
├── components/   # Reusable UI components (Navbar, Dialogs, etc.)
├── data/         # Static or mock data
├── pages/        # Page-level routes (Courses, AcademyLandingPage, etc.)
├── styles/       # Global CSS and Tailwind layers
└── main.tsx      # App entry point
```

---

## Current Progress

- Basic course pages implemented
- Enrollment dialog and navigation added
- Tailwind and UI components configured

---

## Next Steps

- Add additional course and dashboard views
- Improve responsiveness and interactivity
- Connect frontend to backend API once available

---

## Contribution Guidelines

All development should follow the project’s **Contributing Guide** in the root directory.

In summary:

1. Create a new branch from `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/<name>
```

2. Commit using Conventional Commit format:

```bash
git commit -m "feat(ui): add course enrollment dialog"
```

3. Push and open a pull request for review.

---
