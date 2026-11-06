# AI MYSTERY ROOM
## Product Requirements & Technical Specification
**Document Type:** Single Source of Truth (SSOT)  
**Development Methodology:** Spec-Driven Development (SDD)  
**Project Type:** AI-Powered Interactive Mystery Investigation Web Application  
**Version:** 1.0  
**Status:** Initial Development Specification

---

# 1. PROJECT OVERVIEW

## 1.1 Project Name
AI Mystery Room

## 1.2 Project Description

AI Mystery Room is an AI-powered interactive mystery investigation platform where users solve fictional criminal investigation cases generated dynamically using Google's Gemini AI.

The application provides users with a short scenario or story. Based on this scenario, the AI generates a complete fictional investigation containing:

- A mystery case.
- A collection of fictional suspects.
- One actual culprit.
- Suspect backgrounds and relationships.
- Evidence and investigation records.
- WhatsApp-style conversations.
- Images and photographs.
- Audio recordings or voice evidence.
- Witness statements.
- Timelines and other investigation clues.

Users must carefully examine the available evidence, analyze inconsistencies, connect clues, and identify the actual culprit.

At the end of the investigation, the user selects a suspect as the culprit and submits their final answer.

The application evaluates the answer and provides feedback explaining whether the selection is correct or incorrect, along with the actual culprit, supporting evidence, and complete case explanation.

## 1.3 Core Concept

**AI creates the mystery. The user investigates it. The user identifies the culprit.**

The application should feel like an interactive detective investigation rather than a conventional question-and-answer quiz.

## 1.4 Main Objectives

1. Generate unique and engaging mystery investigations using Gemini AI.
2. Provide realistic fictional evidence for each investigation.
3. Encourage logical reasoning, observation, and critical thinking.
4. Allow users to investigate cases independently.
5. Evaluate the user's final suspect selection.
6. Provide explanations and reveal hidden investigation details.
7. Create a replayable experience with dynamically generated mysteries.

---

# 2. TECHNOLOGY STACK

The application must use the MERN stack with Gemini AI for investigation generation.

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Styling | Tailwind CSS |
| UI Components | Lucide React |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| AI Integration | Google Gemini API |
| AI SDK | Official Google GenAI SDK |
| Authentication | JWT |
| Password Security | bcrypt |
| API Communication | Axios or Fetch |
| Image Storage | Cloudinary |
| Audio Storage | Cloudinary or compatible object storage |
| State Management | React Context API |
| Notifications | React Hot Toast |
| Development | VS Code |
| Version Control | Git and GitHub |

## 2.1 Architecture

Use a modular client-server architecture.

React communicates with the Express backend through REST APIs. The backend communicates with MongoDB and Gemini AI.

Gemini API requests must only originate from the backend.

Never expose the Gemini API key in frontend code.

---

# 3. USER ROLES

The initial version will support two roles.

## 3.1 Guest User

A guest user can:

- Visit the homepage.
- Read about the platform.
- View available mystery categories.
- Register an account.
- Log in.

Guest users cannot submit or save investigation results.

## 3.2 Registered User

A registered user can:

- Access the dashboard.
- Create a new mystery investigation.
- Select a mystery category.
- Select a difficulty level.
- Read the scenario.
- Investigate suspects.
- Examine evidence.
- View investigation timelines.
- Submit a culprit selection.
- View investigation results.
- View previous investigations.
- Track their scores and progress.
- Manage their profile.

## 3.3 Admin (Future Scope)

Admin functionality is not required for the first MVP.

Future admin functionality may include:

- User management.
- Case management.
- AI generation monitoring.
- Investigation statistics.
- Reported content management.

---

# 4. APPLICATION MODULES

The application must contain the following primary modules.

1. Authentication Module
2. Dashboard Module
3. Mystery Creation Module
4. AI Investigation Generation Module
5. Investigation Workspace
6. Suspect Management Module
7. Evidence Management Module
8. Culprit Selection Module
9. Result and Evaluation Module
10. Investigation History Module
11. User Profile Module

---

# 5. USER INTERFACE REQUIREMENTS

## 5.1 Landing Page

Purpose: Introduce AI Mystery Room and encourage users to start investigating.

Required sections:

- Navigation bar.
- Project logo and name.
- Hero section.
- Main heading: "Every Mystery Has a Secret. Can You Find It?"
- Short description.
- Start Investigating button.
- How It Works section.
- Mystery categories.
- Features section.
- Footer.

The design should use a dark detective-investigation aesthetic.

Suggested visual direction:

- Background: Dark navy / charcoal.
- Primary accent: Electric cyan.
- Secondary accent: Purple.
- Highlight: Amber.
- Text: White and muted grey.
- Cards: Dark surfaces with subtle borders.
- Typography: Modern, readable sans-serif.

Avoid excessive animations and unnecessary visual effects.

## 5.2 Authentication Pages

Create:

- Registration page.
- Login page.
- Logout functionality.

Registration fields:

- Full name.
- Email.
- Password.
- Confirm password.

Requirements:

- Validate all fields.
- Validate email format.
- Enforce password requirements.
- Hash passwords before saving.
- Prevent duplicate email registration.
- Use JWT authentication.
- Protect private routes.

## 5.3 User Dashboard

The dashboard should display:

- Welcome message.
- Start New Investigation button.
- Total cases investigated.
- Cases solved.
- Success rate.
- Recent investigations.
- Available mystery categories.
- User progress.

The dashboard must be responsive.

## 5.4 New Mystery Page

The user should be able to configure a new investigation.

Required fields:

**Mystery Category**

- Murder Mystery.
- Theft.
- Missing Person.
- Cybercrime.
- Blackmail.
- Corporate Espionage.
- General Mystery.

**Difficulty**

- Easy.
- Medium.
- Hard.

**Scenario Input**

Provide two options:

1. AI Generated Scenario: Gemini creates a new scenario automatically.
2. Custom Scenario: The user provides a short story or situation, and Gemini generates an investigation from it.

Optional configuration:

- Investigation setting.
- Number of suspects.
- Additional story preferences.

Default suspect count: 4.

Allow 3–6 suspects.

The user should click "Generate Mystery" to begin case generation.

Display a loading interface while Gemini generates the case.

---

# 6. AI MYSTERY GENERATION ENGINE

This is the core functionality of the entire application.

## 6.1 Generation Workflow

When a user requests a new investigation:

1. Frontend sends the selected category, difficulty, and scenario to the backend.
2. Backend validates the request.
3. Backend constructs a structured prompt for Gemini.
4. Gemini generates a complete investigation.
5. Backend validates the AI response.
6. Backend checks that exactly one culprit exists.
7. Backend stores the investigation in MongoDB.
8. Backend returns the public investigation data to the frontend.
9. Frontend opens the investigation workspace.

## 6.2 AI Investigation Requirements

Every generated investigation must contain:

### A. Case Information

- Unique case title.
- Case ID.
- Category.
- Difficulty.
- Short description.
- Detailed story.
- Incident location.
- Incident date and time.
- Investigation objectives.

### B. Suspects

Generate 3–6 suspects.

Each suspect must contain:

- Unique suspect ID.
- Full name.
- Age.
- Occupation.
- Background.
- Relationship with the victim.
- Possible motive.
- Alibi.
- Suspicious behavior.
- Relevant information.

Exactly one suspect must be the actual culprit.

Other suspects should have believable motives, suspicious details, or misleading evidence without being arbitrarily guilty.

### C. Investigation Evidence

Generate multiple types of evidence:

1. WhatsApp-style conversations.
2. Images or photographs.
3. Audio recordings.
4. Witness statements.
5. Physical evidence.
6. Digital records.
7. Timeline records.

The number and complexity of clues should depend on difficulty.

Suggested minimum evidence counts:

- Easy: 5–7 evidence items.
- Medium: 8–11 evidence items.
- Hard: 12–16 evidence items.

### D. Hidden Solution

The generated investigation must also contain:

- Actual culprit ID.
- Actual motive.
- Method used.
- Explanation of the crime.
- Evidence supporting the culprit.
- Contradictions in false alibis.
- Explanation of misleading clues.
- Complete solution narrative.

IMPORTANT:

The hidden solution must be stored separately from the public case data.

The frontend must never receive the actual culprit ID or solution before the user submits their answer.

---

# 7. EVIDENCE SYSTEM

Evidence is the most important part of the investigation workspace.

Each evidence item should be presented in an interactive format.

## 7.1 WhatsApp Conversation Evidence

Display fictional chat conversations in a WhatsApp-inspired interface.

Each conversation contains:

- Sender name.
- Receiver name.
- Message content.
- Timestamp.
- Message status where appropriate.

The user should be able to open and examine conversations.

The conversations should contain meaningful clues, inconsistencies, suspicious statements, or misleading information.

## 7.2 Image Evidence

Display fictional investigation photographs.

Examples:

- Crime scene photograph.
- CCTV screenshot.
- Photograph of a suspicious object.
- Photograph of a location.
- Personal photograph.
- Document photograph.

Image generation requirements:

- Images must be fictional.
- Use AI-generated or procedurally created assets.
- Store generated image URLs in the database.
- Display images in an evidence viewer.
- Allow users to enlarge images.

Gemini should generate image descriptions and image-generation prompts when needed.

Use a dedicated image-generation provider for actual image creation. Gemini text generation alone must not be assumed to produce image files.

## 7.3 Audio Evidence

Provide fictional audio recordings.

Examples:

- Recorded phone conversation.
- Anonymous voice message.
- Witness recording.
- Background conversation.
- Suspicious voicemail.

Requirements:

- Store audio files using Cloudinary or compatible object storage.
- Provide an audio player.
- Display recording duration.
- Provide an AI-generated transcript.
- Include the recording timestamp.
- Make relevant clues discoverable through the recording.

Gemini may analyze audio when supported by the selected model and API.

## 7.4 Witness Statements

Display statements from people associated with the incident.

Each statement should include:

- Witness name.
- Relationship with the incident.
- Statement.
- Timestamp.
- Associated suspect, if applicable.

Statements may contain inconsistencies that users must discover.

## 7.5 Physical and Digital Evidence

Examples:

- Fingerprint reports.
- Access logs.
- Emails.
- Call records.
- Receipts.
- Security logs.
- Documents.
- Location records.

All evidence must be internally consistent with the case solution.

---

# 8. INVESTIGATION WORKSPACE

The investigation workspace is the primary gameplay screen.

It should contain:

## 8.1 Case Header

Display:

- Case title.
- Case ID.
- Category.
- Difficulty.
- Investigation status.

## 8.2 Story Panel

Display the complete mystery scenario.

The user should be able to revisit the story anytime.

## 8.3 Suspect Panel

Display all suspects in individual cards.

Each card contains:

- Name.
- Profile image or avatar.
- Occupation.
- Background.
- Relationship with the incident.
- Short description.

Clicking a suspect opens their detailed profile.

## 8.4 Evidence Panel

Organize evidence into categories:

- All Evidence.
- Messages.
- Images.
- Audio.
- Witness Statements.
- Physical Evidence.
- Digital Records.

Each item should open in a detailed viewer.

## 8.5 Investigation Timeline

Display important events chronologically.

Users should be able to understand the sequence of events.

## 8.6 Investigation Notes

Allow users to create personal notes.

Users can record:

- Suspicious observations.
- Suspect analysis.
- Important timestamps.
- Evidence connections.
- Possible motives.

Notes must be private to the user.

## 8.7 Final Accusation

Provide a dedicated section titled:

"Who Is the Culprit?"

Display all suspects as selectable options.

The user must select exactly one suspect.

Before final submission, show a confirmation message.

The accusation should be final for that investigation attempt.

---

# 9. CULPRIT EVALUATION SYSTEM

When the user submits an accusation:

1. Frontend sends the selected suspect ID to the backend.
2. Backend verifies user authentication.
3. Backend verifies investigation ownership.
4. Backend retrieves the hidden solution.
5. Backend compares the selected suspect ID with the actual culprit ID.
6. Backend calculates the result.
7. Backend stores the investigation attempt.
8. Backend returns the result and explanation.

The result must be determined by backend logic, not by frontend logic.

## 9.1 Correct Answer

Display:

- Correct Investigation.
- Actual culprit.
- Culprit's motive.
- Explanation of how the incident happened.
- Important supporting clues.
- Evidence connections.
- Explanation of misleading suspects.

## 9.2 Incorrect Answer

Display:

- Incorrect Accusation.
- Selected suspect.
- Actual culprit.
- Correct explanation.
- Important clues the user may have missed.

The result should encourage learning rather than simply displaying a score.

## 9.3 Scoring

Initial scoring:

- Correct culprit: 100 points.
- Incorrect culprit: 0 points.

Optional future scoring factors:

- Investigation completion time.
- Number of hints used.
- Evidence examined.
- Difficulty multiplier.

Do not implement complex scoring until the basic investigation workflow works.

---

# 10. GEMINI AI INTEGRATION

## 10.1 Responsibilities of Gemini

Gemini will be responsible for:

- Generating mystery scenarios.
- Creating suspect profiles.
- Generating motives and alibis.
- Creating investigation evidence.
- Generating conversations.
- Generating witness statements.
- Creating investigation timelines.
- Creating image-generation prompts.
- Creating audio scripts.
- Generating final investigation explanations.
- Generating optional hints.

## 10.2 Structured Output

Gemini must return structured JSON rather than unstructured prose.

The backend must validate the JSON before saving it.

Use a schema-based validation library such as Zod.

If Gemini returns invalid JSON:

- Attempt a controlled repair or regeneration.
- Limit retry attempts.
- Return a meaningful error if generation fails.
- Do not save incomplete cases.

## 10.3 AI Generation Rules

Gemini must follow these rules:

1. Exactly one actual culprit.
2. Every suspect must have a logical background.
3. Every case must have a coherent timeline.
4. Evidence must support the final solution.
5. Red herrings must be explainable.
6. No contradictory facts that make the case impossible to solve.
7. The actual solution must remain hidden.
8. The case must be solvable using the provided evidence.
9. Evidence must not reveal the culprit immediately.
10. The difficulty must match the requested level.

## 10.4 AI Prompt Structure

Use a reusable backend prompt template.

System instruction:

"You are an expert mystery writer and criminal investigation game designer. Generate realistic, fictional, logically consistent mystery investigations for an interactive detective game.

Create a complete mystery containing one actual culprit, multiple believable suspects, motives, alibis, investigation evidence, witness statements, conversations, and a chronological timeline.

The user must be able to identify the culprit through logical analysis of the available evidence.

Create meaningful clues, contradictions, and red herrings. Every important part of the final solution must be supported by evidence.

Never create multiple actual culprits. Never create an investigation that is impossible to solve.

Return data according to the requested JSON schema. Separate public investigation information from the confidential solution."

The backend must append the user's category, difficulty, scenario, suspect count, and output schema.

---

# 11. DATABASE DESIGN

Use MongoDB with Mongoose.

## 11.1 User Collection

Fields:

- _id
- fullName
- email
- passwordHash
- role
- totalInvestigations
- solvedInvestigations
- totalScore
- createdAt
- updatedAt

## 11.2 Investigation Collection

Fields:

- _id
- userId
- caseTitle
- caseCategory
- difficulty
- scenario
- description
- incidentLocation
- incidentDate
- suspects
- evidence
- timeline
- status
- generatedAt
- completedAt
- createdAt
- updatedAt

## 11.3 Suspect Object

Fields:

- suspectId
- name
- age
- occupation
- background
- relationship
- motive
- alibi
- suspiciousDetails
- avatarUrl

## 11.4 Evidence Object

Fields:

- evidenceId
- title
- description
- evidenceType
- category
- content
- fileUrl
- transcript
- timestamp
- relatedSuspectIds
- importance

Evidence types:

- MESSAGE
- IMAGE
- AUDIO
- WITNESS_STATEMENT
- PHYSICAL
- DIGITAL

## 11.5 Confidential Solution

Store separately in a private collection or protected nested document.

Fields:

- investigationId
- culpritSuspectId
- motive
- method
- completeExplanation
- supportingEvidenceIds
- redHerringExplanations
- solutionNarrative

This information must never be returned through public investigation APIs.

## 11.6 Investigation Attempt Collection

Fields:

- _id
- userId
- investigationId
- selectedSuspectId
- isCorrect
- score
- submittedAt

## 11.7 Investigation Notes Collection

Fields:

- _id
- userId
- investigationId
- noteContent
- createdAt
- updatedAt

---

# 12. BACKEND API SPECIFICATION

Base URL:

`/api`

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/register | Register a user |
| POST | /auth/login | Authenticate a user |
| GET | /auth/me | Get current user |
| POST | /auth/logout | Logout |

## Investigation

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /investigations/generate | Generate a new mystery |
| GET | /investigations | Get user's investigations |
| GET | /investigations/:id | Get investigation details |
| GET | /investigations/:id/suspects | Get suspects |
| GET | /investigations/:id/evidence | Get evidence |
| GET | /investigations/:id/timeline | Get timeline |
| POST | /investigations/:id/submit | Submit culprit selection |
| GET | /investigations/:id/result | Get completed result |

## Investigation Notes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /notes/:investigationId | Get investigation notes |
| POST | /notes/:investigationId | Create note |
| PUT | /notes/:noteId | Update note |
| DELETE | /notes/:noteId | Delete note |

## Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /dashboard/stats | Get user statistics |
| GET | /dashboard/recent | Get recent investigations |

All private endpoints must require authentication.

The backend must verify that the authenticated user owns the requested investigation.

Never expose confidential solution data through the normal investigation endpoints.

---

# 13. FRONTEND PROJECT STRUCTURE

Recommended React structure:

```text
client/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SuspectCard.jsx
│   │   ├── EvidenceCard.jsx
│   │   ├── EvidenceViewer.jsx
│   │   ├── AudioPlayer.jsx
│   │   ├── Timeline.jsx
│   │   └── LoadingScreen.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CreateMystery.jsx
│   │   ├── Investigation.jsx
│   │   ├── Result.jsx
│   │   ├── History.jsx
│   │   └── Profile.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── investigationService.js
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

---

# 14. BACKEND PROJECT STRUCTURE

Recommended Express structure:

```text
server/
│
├── config/
│   ├── db.js
│   └── gemini.js
│
├── controllers/
│   ├── authController.js
│   ├── investigationController.js
│   ├── dashboardController.js
│   └── notesController.js
│
├── models/
│   ├── User.js
│   ├── Investigation.js
│   ├── Solution.js
│   ├── Attempt.js
│   └── Note.js
│
├── routes/
│   ├── authRoutes.js
│   ├── investigationRoutes.js
│   ├── dashboardRoutes.js
│   └── noteRoutes.js
│
├── services/
│   ├── geminiService.js
│   ├── mysteryGenerator.js
│   ├── evidenceService.js
│   └── evaluationService.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
│
├── validators/
│
├── utils/
│
├── .env
├── server.js
└── package.json
```

---

# 15. SECURITY REQUIREMENTS

The following requirements are mandatory:

1. Store passwords using bcrypt.
2. Use JWT authentication.
3. Store API keys in environment variables.
4. Never expose Gemini credentials to React.
5. Validate all user inputs.
6. Sanitize custom scenario inputs.
7. Protect all private APIs.
8. Verify investigation ownership.
9. Prevent users from accessing other users' investigations.
10. Keep culprit and solution data confidential.
11. Prevent answer submission from being modified through frontend manipulation.
12. Add rate limiting to authentication and AI generation APIs.
13. Apply secure CORS configuration.
14. Limit file upload size and validate file types.
15. Avoid storing sensitive credentials in logs.

Use secure cookie-based authentication where practical, with appropriate CSRF protection.

---

# 16. ERROR HANDLING

The application must handle:

- Invalid login credentials.
- Duplicate email registration.
- Missing form fields.
- Invalid mystery configuration.
- Gemini API failure.
- Gemini response timeout.
- Invalid AI-generated JSON.
- MongoDB connection failure.
- Missing investigation.
- Unauthorized access.
- Duplicate accusation submission.
- File upload failure.
- Audio playback failure.
- Network errors.

Display understandable error messages to users.

Never expose raw server errors, API keys, stack traces, or internal AI prompts.

---

# 17. RESPONSIVE DESIGN

The application must work on:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Desktop should provide a multi-panel investigation workspace.

Mobile should reorganize the workspace into separate accessible tabs or collapsible panels.

Evidence viewers, chat interfaces, and audio players must remain usable on small screens.

---

# 18. COMPLETE USER WORKFLOW

The intended application flow is:

1. User visits the website.
2. User registers or logs in.
3. User enters the dashboard.
4. User clicks Start New Investigation.
5. User chooses a mystery category.
6. User selects difficulty.
7. User chooses an AI-generated or custom scenario.
8. User clicks Generate Mystery.
9. Gemini generates the investigation.
10. Backend validates and stores the case.
11. User enters the investigation workspace.
12. User reads the mystery story.
13. User examines the suspects.
14. User opens conversations and reads messages.
15. User examines photographs.
16. User listens to audio recordings.
17. User reads witness statements.
18. User studies the timeline.
19. User creates investigation notes.
20. User analyzes all available clues.
21. User selects one suspect.
22. User submits the final accusation.
23. Backend evaluates the selection.
24. User sees the investigation result.
25. User reads the complete solution.
26. Investigation is saved in history.
27. Dashboard statistics are updated.

---

# 19. MVP SCOPE

The first working version must prioritize a complete end-to-end investigation.

## Mandatory Features

- User registration and login.
- User dashboard.
- Mystery category selection.
- Difficulty selection.
- AI scenario generation.
- Custom scenario input.
- Gemini mystery generation.
- 3–6 suspects.
- WhatsApp-style fictional conversations.
- Image evidence support.
- Audio evidence support.
- Witness statements.
- Investigation timeline.
- Evidence viewer.
- Culprit selection.
- Backend answer evaluation.
- Correct/incorrect result page.
- Complete solution explanation.
- Investigation history.
- Basic user statistics.

## Future Enhancements

- AI-generated interactive detective assistant.
- Dynamic hint system.
- Multiplayer investigations.
- Competitive leaderboard.
- Daily mystery challenges.
- Investigation timer.
- Advanced scoring system.
- Achievements and badges.
- Admin dashboard.
- More advanced AI-generated image and audio assets.
- User-created mystery sharing.

Do not prioritize future enhancements until all mandatory MVP features work correctly.

---

# 20. ACCEPTANCE CRITERIA

The application will be considered functionally complete when all of the following conditions are satisfied.

### Authentication
- Users can register and log in.
- Passwords are securely hashed.
- Private pages are protected.

### Mystery Generation
- A user can generate a mystery using Gemini.
- A user can provide a custom scenario.
- Every investigation contains 3–6 suspects.
- Every investigation has exactly one culprit.
- Evidence is consistent with the solution.
- The case is successfully saved in MongoDB.

### Investigation
- Users can examine every evidence type.
- Users can view suspect profiles.
- Users can access the investigation timeline.
- Users can create private notes.

### Evaluation
- Users can submit exactly one accusation.
- The backend determines correctness.
- The solution is hidden before submission.
- The final result contains a meaningful explanation.

### Data and Security
- Users can only access their own investigations.
- Hidden solutions are not exposed in API responses.
- API credentials remain server-side.
- Invalid requests are handled safely.

### UI
- All primary pages work.
- Navigation works correctly.
- Loading and error states are implemented.
- The website is responsive.

---

# 21. DEVELOPMENT PHASES

Codex must develop the application in the following order.

## Phase 1: Project Setup
- Create React frontend.
- Create Express backend.
- Connect MongoDB.
- Configure environment variables.
- Establish API communication.

## Phase 2: Authentication
- Implement registration.
- Implement login.
- Implement JWT authentication.
- Implement protected routes.

## Phase 3: Dashboard and UI
- Build landing page.
- Build dashboard.
- Build mystery creation page.
- Implement the design system.

## Phase 4: Gemini Integration
- Connect Gemini API.
- Create mystery generation prompts.
- Define JSON schemas.
- Implement output validation.
- Generate suspects and evidence.
- Separate public and confidential data.

## Phase 5: Investigation Workspace
- Build suspect cards.
- Build evidence panels.
- Build WhatsApp-style conversations.
- Add image viewer.
- Add audio player.
- Build timeline.
- Add personal notes.

## Phase 6: Evaluation
- Implement culprit selection.
- Implement backend evaluation.
- Build results page.
- Reveal the final solution.

## Phase 7: History and Statistics
- Save investigation attempts.
- Display previous investigations.
- Calculate dashboard statistics.

## Phase 8: Testing and Deployment
- Test all APIs.
- Test authentication.
- Test AI generation.
- Test solution confidentiality.
- Test responsive layouts.
- Fix bugs.
- Prepare deployment.

---

# 22. DEVELOPMENT RULES FOR CODEX

This document is the authoritative product and technical specification for AI Mystery Room.

Codex must follow these rules throughout development:

1. Treat this document as the Single Source of Truth (SSOT).
2. Do not independently change the product concept or core workflow.
3. Do not introduce unnecessary technologies outside the defined stack.
4. Follow the specified folder structure unless a documented technical reason requires modification.
5. Use reusable React components.
6. Maintain separation between controllers, services, models, routes, and middleware.
7. Keep Gemini integration inside backend services.
8. Use structured JSON responses from Gemini.
9. Validate all AI-generated data before database insertion.
10. Keep confidential solutions separate from public investigation data.
11. Never send the actual culprit ID to the frontend before final submission.
12. Use environment variables for all credentials.
13. Implement proper error handling.
14. Do not use hardcoded dummy data as a replacement for working backend functionality.
15. Do not leave buttons or UI elements without functional actions.
16. Maintain consistent UI design throughout the application.
17. Test each development phase before moving to the next.
18. Update technical documentation whenever an implementation decision changes.
19. Do not implement future-scope features before the MVP is complete.
20. Never claim a feature is complete unless it has been implemented and tested.

## 22.1 Codex Development Process

Before implementing a feature:

- Read this specification.
- Understand its dependencies.
- Identify the frontend, backend, and database components involved.
- Implement the feature.
- Test the feature.
- Fix related errors.
- Update the project documentation.

If a technical detail is not specified, choose the simplest maintainable implementation that preserves the defined product behavior.

If a decision changes a core requirement, document it and request approval rather than silently changing the specification.

---

# 23. FINAL PRODUCT DEFINITION

AI Mystery Room is an interactive AI-powered mystery investigation platform built using the MERN stack and Google Gemini.

It transforms dynamically generated fictional stories into interactive investigation experiences.

Users receive a mystery, analyze multiple suspects, investigate AI-generated evidence, identify contradictions, connect clues, and ultimately accuse the culprit.

The system evaluates their decision and reveals the complete investigation solution.

**Core Product Promise:**

"Don't just read the mystery. Investigate it, connect the evidence, and solve the case."

**Primary Technical Stack:** MERN + Gemini AI.

**Primary Product Goal:** Deliver a complete, logically consistent, replayable AI-powered detective investigation experience.

**This document is the authoritative baseline for the initial MVP implementation.**