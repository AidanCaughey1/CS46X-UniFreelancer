<!-- 2025-11-02-CS.037-TeamCharter.md -->
# Team Charter & Working Agreement
**Team 37 – UniFreelancer Academy**  
**Partner:** Alina Padilla-Miller – UniFreelancer  
**Date:** 2025-11-02  
**Repo:** [github.com/AidanCaughey1/CS46X-UniFreelancer](https://github.com/AidanCaughey1/CS46X-UniFreelancer)

---

**Roles:**  
- Aidan Caughey – Project Manager / Backend Developer
- Aiden McCoy – Partner Liaison / Backend Developer
- Baron Baker – Data Lead / Backend Developer
- Daniel Molina – Technical Architect / Frontend Developer
- Nafizur Rahman – UI/UX Lead / Frontend Developer

**Decision Rule:** Consensus with majority vote (3/5) fallback.  
**Meeting Cadence:** Communicating daily (Discord), weekly partner check-ins, biweekly TA meetings, and sprint retros via Google Docs.  
**Core Tools:** GitHub (issues, CI/CD), Discord (communication), Google Docs (notes), Figma (design), VS Code.    
**Risks:** Integration complexity, database schema mismatch, and unclear payment platform (Stripe vs Sharetribe).    
**Escalation Path:**  
1. Peer discussion within 24 hrs.  
2. Escalate to TA/instructor if unresolved or blocking sprint progress.

**Owner:** Aidan Caughey  
**Review By:** 2025-12-01

---
## Conflict Resolution & Accountability
**Triggers:** Missed deadlines, unreviewed PRs > 48 h, repeated meeting absences.
**Step by Step Plan:**
1. Send a reminder and quick checkup - Make sure the team member(s) is aware of the problem and if they need any help to handle it. (Within 24h of conflict not resolving)
2. Meeting - Sit down with the team member(s) and discuss evidence and create an action plan to resolve the conflict. (Within 48h of conflict not resolving)
3. Follow Up - Following up with team members and making sure that the action plan is being followed. (Within 1w of the conflict)
4. Escalate - contact instructor and determine how to solve this issue (ASAP if follow up fails)

**Owner:** Nafizur Rahman
**Review By:** 2025-12-01

---
## Definition of Done (DoD) & Quality Gates
**DOD:** A task or feature is considered done when all of the following conditions are met:
1. The feature meets all acceptance criteria in the issue description and passes functional testing.
2. Code compiles without errors or warnings and passes all automated tests in CI.
3. Code has been reviewed and approved by at least one team member through a GitHub pull request.
4. Documentation (README, in-code comments, or API docs) has been updated to reflect changes.
5. No sensitive data is hardcoded or pushed to the repo.
6. The new functionality is deployed successfully to the test branch without breaking existing features.

**Quality Gates:** To ensure our main branch always remains shippable, each request must pass these quality checks before merging:
1. Run unit and integration tests through GitHub Actions
2. No new dependencies added without a review for licensing and security impact.
3. Changes that affect setup, APIs, or UI must include updates to relevant documentation
4. Reviewers verify readability, maintainability, and adherence to project structure

**Owner:** Baron Baker
**Review By:** 2025-12-01

---
## Accessibility & Inclusion Practices
