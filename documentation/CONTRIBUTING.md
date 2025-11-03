# Contributing Guide
How to set up, code, test, review, and release so contributions meet our Definition
of Done.
## Code of Conduct
Our goal is to foster a respectful, inclusive, and professional environment for everyone contributing to UniFreelancer Academy. This Code of Conduct defines how all participants, including contributors, maintainers, and collaborators, are expected to behave.
**1. Expected Behavior**
All contributors are expected to:
- Treat others with respect, empathy, and professionalism.
- Communicate constructively, listen actively, and assume good intentions.
- Provide and receive feedback graciously.
- Use language that is welcoming and inclusive.

**2. Principles and Values**
Our community operates on principles of:
- Integrity: Do the right thing, even when no one is watching.
- Collaboration: Support teammates and value their perspectives.
- Transparency: Communicate progress, blockers, and decisions clearly.
- Inclusivity: Foster a safe environment for contributors of all backgrounds, experiences, and identities.
- Quality: Uphold high standards of work that align with our Definition of Done (DoD)
 and project goals.
## Getting Started
Note: The project is still in its early development phase. Some setup steps and dependencies may evolve as the team finalizes backend and API integration. 

**Prerequisites**
Before starting, make sure you have the following installed:
- Node.js (v18 or higher)
- npm (comes with Node.js) or yarn
- MongoDB Atlas or a local MongoDB instance
- Stripe API key (for payment processing)
- Git for version control

**Project Setup**
**1. Clone the repository**
git clone https://github.com/UniFreelancerAcademy/UniFreelancer.git
cd UniFreelancer

**2. Install dependencies**
npm install

**3. Create an environment file (.env)**
MONGODB_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=3000

Note: Never commit .env files to GitHub as these contain sensitive credentials. 

**4. Start the development server**
npm run dev

**5. Verify Installation**
Visit http://localhost:3000 to confirm the frontend loads. 

**Environment and Secrets Handling**
We follow strict security practices:
- Sensitive data (API keys, DB URIs, tokens) must never be pushed to GitHub.
- Always use environment variables stored in .env.
- If new secrets are added, document them in README.md under a “Configuration” section.

## Branching & Workflow
Describe the workflow (e.g., trunk-based or GitFlow), default branch, branch
naming, and when to rebase vs. merge.
## Issues & Planning
Explain how to file issues, required templates/labels, estimation, and
triage/assignment practices.
## Commit Messages
State the convention (e.g., Conventional Commits), include examples, and how to
reference issues.
## Code Style, Linting & Formatting
Name the formatter/linter, config file locations, and the exact commands to
check/fix locally.
## Testing
Define required test types, how to run tests, expected coverage thresholds, and
when new/updated tests are mandatory.
## Pull Requests & Reviews
Outline PR requirements (template, checklist, size limits), reviewer expectations,
approval rules, and required status checks.
## CI/CD
Link to pipeline definitions, list mandatory jobs, how to view logs/re-run jobs,
and what must pass before merge/release.
## Security & Secrets
State how to report vulnerabilities, prohibited patterns (hard-coded secrets),
dependency update policy, and scanning tools.
## Documentation Expectations
Specify what must be updated (README, docs/, API refs, CHANGELOG) and
docstring/comment standards.
## Release Process
Describe versioning scheme, tagging, changelog generation, packaging/publishing
steps, and rollback process.
## Support & Contact
Provide maintainer contact channel, expected response windows, and where to ask
questions.
