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

**Prerequisites:**
Before starting, make sure you have the following installed:
- Node.js (v18 or higher)
- npm (comes with Node.js) or yarn
- MongoDB Atlas or a local MongoDB instance
- Stripe API key (for payment processing)
- Git for version control

**Project Setup:**

**1. Clone the repository:**

git clone https://github.com/UniFreelancerAcademy/UniFreelancer.git

cd UniFreelancer

**2. Install dependencies:**

npm install

**3. Create an environment file (.env):**

MONGODB_URI=your_mongodb_connection_string

STRIPE_SECRET_KEY=your_stripe_secret_key

PORT=3000

Note: Never commit .env files to GitHub as these contain sensitive credentials. 

**4. Start the development server:**

npm run dev

**5. Verify Installation:**

Visit http://localhost:3000 to confirm the frontend loads. 

**Environment and Secrets Handling:**

We follow strict security practices:
- Sensitive data (API keys, DB URIs, tokens) must never be pushed to GitHub.
- Always use environment variables stored in .env.
- If new secrets are added, document them in README.md under a “Configuration” section.

## Branching & Workflow

We use a GitFlow-style workflow to keep our code organized and prevent conflicts between team members.

**Main Branches:**

- main: Holds stable, production-ready code.
- dev: Used for active development. All new features and fixes start here.

**Working on a Feature:**

**1. Create a new branch from dev**

git checkout dev

git pull origin dev

git checkout -b feature/"file name"

**2. Complete and commit the changes**

ex. git commit -m "feat: add Stripe subscription page"

**3. Pull the latest dev updates before pushing**

git pull origin dev

git push origin feature/"file name"

**Merging:**

- Only reviewed and tested code can be merged.
- Merges into main happen only after full testing and approval from the team.
- Use rebase before merging to keep history clean:
ex:
git pull --rebase origin dev

## Issues & Planning
We use GitHub Issues to track all tasks, bugs, and feature requests.

Every change to the project should begin as an issue so the team can plan, assign, and discuss it before coding.

**Filing and issue:**

**1.** Go to the issues tab on GitHub

**2.** Click "New issue" and select the right template:

- Feature Request - for new features or improvements:
- Bug Report - for errors or unexpected behavior
- Documentation Update - for README, guides, or docs changes

**3.** Fill out the description clearly:
- What's the problem or goal?
- Steps to reproduce (if it's a bug)
- Expected result or proposed solution

| **Size** | **Meaning** |
|-----------|-------------|
| S | Small – quick fix or minor change (≤ 1 hr) |
| M | Medium – single feature or bug fix (1–4 hrs) |
| L | Large – multi-step feature or refactor (4+ hrs) |

**Triage:**

New issues are reviewed by the project lead or a designated member to:
- Confirm it's valid and in scope.
- Add missing labels or details.
- Assign to the right person or backlog if not urgent. 


## Commit Messages

We use the Conventional Commits format to keep our history clear and easy to track. Every commit message should explain what changed and why in a short, meaningful way.

**Format**

type(optional scope): short description

**Common Types**

| **Type** | **Purpose** |
|-----------|-------------|
| `feat` | A new feature or enhancement |
| `fix` | A bug fix |
| `docs` | Documentation-only changes |
| `style` | Formatting, styling, or code style fixes (no logic changes) |
| `refactor` | Code restructuring without changing behavior |
| `test` | Adding or updating tests |
| `chore` | Maintenance, build, or dependency updates |

**Examples:**

<ins>Good examples:</ins>

feat(auth): add password reset endpoint

fix(api): resolve 500 error on course creation

<ins>Bad Examples:</ins>

update stuff 

fixed things 

final changes  

**Referencing issues:**

When your commit relates to a GitHub issue, link it directly in the footer:

feat(payments): add Stripe subscription integration 

Closes #42

## Code Style, Linting & Formatting  

To keep the codebase consistent and readable, all contributors must follow the project’s code style and formatting standards.  
Our goal is that all code looks like it was written by a single person, regardless of who contributed it.  

### Tools Used  
- **Formatter:** [Prettier](https://prettier.io/) – for consistent code formatting across JavaScript, React, and CSS files.  
- **Linter:** [ESLint](https://eslint.org/) – for detecting syntax errors and enforcing style rules.  

### Local Commands  

Run these commands before committing any changes:  

**Check for linting errors:**

npm run lint

**Automatically fix linting and formatting issues:**

npm run lint:fix

**Format code with Prettier:**

npm run format

## Testing  

Testing ensures that every new feature, fix, or update in UniFreelancer Academy works as intended and doesn’t break existing functionality.  
All contributors are expected to write and run tests before submitting pull requests.

### Test Types  

We use a combination of automated and manual testing methods to maintain quality:

| **Type** | **Purpose** |
|-----------|-------------|
| **Unit Tests** | Verify that individual functions or components work correctly. |
| **Integration Tests** | Check that different modules (e.g., backend API + database) work together properly. |
| **End-to-End (E2E) Tests** | Simulate real user interactions to ensure full workflows (e.g., login → checkout) behave as expected. |
| **UI/Component Tests** | Test visual and interactive elements using React Testing Library or similar tools. |

### Running Tests  

Use the following commands to run tests locally before pushing code:

**Run all tests**

npm test

**Run only unit tests**

npm run test:unit

**Run integration or e2e tests (if available)**

npm run test:e2e

## Pull Requests & Reviews  

Pull Requests (PRs) are how all changes are proposed, discussed, and merged into the UniFreelancer Academy codebase.  
This process ensures that all contributions meet our quality standards, follow the Definition of Done(DoD), and maintain project stability.

### PR Requirements  

Before submitting a PR, make sure you’ve completed the following checklist:

-  The branch name follows our convention: `feature/<name>`, `fix/<name>`, or `docs/<name>`.  
- Code compiles and runs without errors or warnings.  
- All tests pass locally (`npm test`).  
- The code is formatted with Prettier and passes ESLint checks.  
- No sensitive information (API keys, secrets, tokens) is included.  
- The PR includes relevant documentation or README updates if new features were added.  
- A clear and descriptive title and summary are provided.  

### PR Template  

Every pull request should follow this template for clarity and consistency:  


## CI/CD  

Continuous Integration and Continuous Deployment (CI/CD) ensures that every change to UniFreelancer Academy is automatically built, tested, and validated before merging.  
This process helps maintain code quality, prevent regressions, and keep the main branch ready for release at all times.  

Each workflow runs automatically when code is pushed or when a pull request is opened.  
You can view workflow results under the **Actions** tab in the GitHub repository.  

**Mandatory Jobs:**

Each pull request must pass all of the following checks before it can be merged:  

| Job | Description |
|------|-------------|
| Test | Runs the automated test suite (`npm test`) to ensure functionality and prevent regressions. |
| Lint | Runs ESLint (`npm run lint`) to verify code style and formatting standards. |
| Build | Builds the project to ensure all code compiles and dependencies are correctly configured. |
| Deploy (on main) | Automatically deploys approved code to the staging or production environment. |

If any job fails, the merge will be blocked until all checks pass successfully.  

**Viewing Logs:**  

To review CI/CD logs:
1. Go to the **Actions** tab in the repository.  
2. Select the workflow run for your branch or pull request.  
3. Click on a job to view detailed logs, errors, and output.  

If a job fails, correct the issue locally, commit the fix, and push again.

**Merge and Release Requirements:**

A pull request can only be merged when:  
- All CI jobs have passed successfully.  
- At least one reviewer has approved the pull request.  
- There are no merge conflicts with the `main` or `dev` branch.  

## Security & Secrets  

Security is a top priority for UniFreelancer Academy. Contributors are expected to follow best practices for protecting sensitive data, reporting vulnerabilities, and maintaining the overall safety of the project.  

**Handling Secrets**

Do not include any sensitive information in commits, pull requests, or shared documents.  
Sensitive data includes but is not limited to:  
- API keys  
- Database connection strings  
- Authentication tokens  
- Passwords or private credentials  

All secrets must be stored securely using environment variables in a local `.env` file.  
Never commit `.env` or configuration files containing secrets to the repository.  

Example `.env` file variables:  

### Reporting Security Issues  

If you discover a vulnerability or security risk:  
1. **Do not** open a public GitHub issue.  
2. Instead, email any of the developers directly at the contact listed in the `README.md`.  
3. Provide detailed information about the issue, how it can be reproduced, and potential impact.  

The team will acknowledge receipt and begin the investigation within 48 hours.  


## Documentation Expectations  

Clear and up-to-date documentation is essential for maintaining project quality and helping new contributors understand the system quickly.  
All contributors are responsible for ensuring that their code changes include any necessary documentation updates.  

### Required Documentation Updates  

Whenever you make changes that affect functionality, configuration, or workflows, update the following as applicable:  

| File / Location | Purpose |
|-----------------|----------|
| **README.md** | Update setup instructions, environment variables, or usage steps if changes affect the project setup or behavior. |
| **docs/** | Add or modify technical or user-facing documentation related to new features, APIs, or design decisions. |
| **In-code comments** | Explain complex logic, data models, or functions where clarity is needed for future developers. |

### Writing Guidelines  

- Use clear, concise language and consistent formatting.  
- Write for both technical and non-technical readers.  
- Avoid unnecessary jargon or acronyms unless defined.  
- Use Markdown headings (`##`, `###`, etc.) and bullet points for readability.  
- Follow the project’s established tone: professional, concise, and explanatory.  

## Release Process  

The release process for UniFreelancer Academy is **still in progress**, as the team is currently in the early stages of development.  
This section outlines the intended process that will be followed once the codebase and CI/CD pipeline are implemented.  

### Planned Versioning  

We plan to use **Semantic Versioning (SemVer)** for all future releases:  

## Support & Contact  

If you have questions, encounter issues, or want to contribute to the UniFreelancer Academy project, please reach out through the following channels:  

### Contact Channels  

| Purpose | Contact Method |
|----------|----------------|
| **General Questions** | Open a discussion in the **GitHub Discussions** tab or leave a comment on a related issue. |
| **Bug Reports / Feature Requests** | File a new issue under the **Issues** tab using the appropriate template. |
| **Private or Sensitive Matters** | Email the project maintainer directly at: **mccoaide@oregonstate.edu** |
| **Team Collaboration** | Communication within the project team is managed through our shared **Discord workspace**. |

### Response Time  

- Maintainers aim to respond to GitHub issues or questions **within 48 hours** on weekdays.  
- Complex technical questions or security-related issues may take longer for review and testing before response.  

### Support Guidelines  

- Always review the **README.md** and existing **Issues** before opening a new one — your question may already be answered.  
- When reporting bugs, include:
  - The branch or feature you were using  
  - Steps to reproduce the issue  
  - Expected vs. actual behavior  
  - Any relevant error messages or screenshots  
- Keep communication professional and aligned with our [Code of Conduct](#code-of-conduct).  

### Maintainer  

**Primary Maintainer:**  
Aiden McCoy
Email: **mccoaide@oregonstate.edu**  

If the maintainer is unavailable, contact another core contributor listed in the project’s README or assign your issue the `@team` tag for visibility.  

### Summary  

For general inquiries or collaboration, use GitHub Discussions.  
For technical issues or bugs, create an Issue.  
For sensitive matters, contact the maintainer via email.  
All communication should follow the project’s Code of Conduct and maintain professional standards.  
