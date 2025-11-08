# Testing Directory – UniFreelancer Academy

This directory contains the **automated tests** for the UniFreelancer Academy project. These tests are executed locally and in the CI pipeline to ensure backend endpoints work as expected.
testing/ 
├─ tests/ 
│ ├─ courses.test.js 
│ ├─ seminars.test.js 
│ └─ tutorials.test.js 
└─ README.md <-- this file 
---

## Writing Tests

We use **Mocha** as the test framework and **Chai + Chai HTTP** for assertions and HTTP requests.

- Test files should **end with `.test.js`** to be automatically discovered by Mocha.

## How to Run
Install dependencies  
npm install 
Run tests 
npm test
