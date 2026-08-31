# HOSIS ARCHITECTURE PROJECT HUB

A standalone, responsive front-end prototype for architectural project delivery and coordination.

## Prototype features

- One full-screen entry experience: the annotated architectural video and Admin/User role selection share the same surface, with Skip, Pause, Replay and reduced-motion support
- Admin and assigned-user role simulation
- Six entirely fictional projects and organizations
- Portfolio project gallery with search and filters
- Dashboard project tasks sorted by priority and due date, followed by the portfolio schedule
- Client, consultant and contractor directories with company profiles, project-specific contacts and related projects
- Project-specific stage scope with hidden out-of-scope workflows
- Admin controls for scope, status, priority and assigned users
- Portfolio and project-level Gantt timelines with editable dates and visible overlaps
- Manual add, edit and delete controls for overview, team contacts, companies, schedule, milestones and tasks
- Site Survey, Design, Permit, Tender, Construction Administration and Closeout checklists
- Inline milestone statuses: Not started, In progress, Complete and N/A; completion excludes N/A items
- Project Notes above Project Tasks, with a company directory for clients, contractors and consultants
- Team email/phone fields and optional HTTPS company-logo URLs with initials as placeholders
- Square, colour-coded Project Scope stage cards
- Tasks, deadlines, activity, documents and auto-saved notes
- Browser Local Storage persistence
- Mock AI Project Assistant
- Responsive desktop, tablet and mobile interface
- Print / Save PDF project view

## Important

This repository contains demonstration data only. All project names, companies, contacts and project records are fictional. No real authentication, backend, database or AI service is connected.

## Deployment

The included GitHub Pages workflow builds with Vite, runs the interaction tests, and deploys only `dist/` from `main`.

## Development

Run `npm ci`, then `npm run dev`. Browser tests use Google Chrome for H.264 playback; install it with `npx playwright install --with-deps chrome`. Run `npm run build` for TypeScript validation and the production build. The original project hub remains in `app.js`; its localStorage schema and project records are unchanged. The React 18 intro is an isolated component in `src/intro/`.

## Cinematic intro

- The entry screen plays the supplied `assets/hosis-intro-annotated.mp4` (1280×720, about 5 seconds, no audio track) behind the role selection; there is no separate photo-based welcome page.
- The whole frame is preserved with `object-fit: contain`, including the architectural annotations on mobile.
- `src/intro/videoConfig.ts` selects the video, matching poster, and versioned session key. The app's `finishIntro` uses the same key.
- Muted inline autoplay, Pause/Resume, Skip and Replay preserve role selection on the same screen. Autoplay denial offers a Play button; video failure never blocks entry.
- Reduced motion shows the matching static poster with the same role controls without requesting the video.
- Map rendering is no longer loaded by the entry bundle. Prior map modules and assets remain available for recovery.
- Intro controls dispatch `hosis:intro:enter`; `hosis:intro:closed` unmounts and stops playback; `hosis:intro:replay` remounts it.

## Project layout update

Scope cards are the only stage selector; each stage uses a single-column milestone checklist. Design starts with 15 drawing milestones and other stages retain their own workflows. Optional milestones participate in progress until marked N/A; an empty or all-N/A checklist shows zero percent.

Existing browser data is migrated without a reset. Prior administration records/schedules are preserved in `legacyAdministration`, and new Site Survey records are separate. Existing design records remain alongside newly added drawing milestones, including custom titles, details and dates; old status labels are retained as `previousStatus`. Documents, deadlines and activity arrays are preserved, although their panels have been removed from the project detail page. Dashboard activity is unchanged.

Company and individual contact records are independently editable. Blank contact details are intentional; no real contact data is seeded. Logo images are loaded from an optional HTTPS URL, not uploaded. Role controls remain prototype UI only, not a security boundary.

Pull requests run browser checks and save review screenshots in the existing `hosis-intro-previews` artifact; only the main-branch Pages workflow deploys the site. Roll back a deployed change by reverting its merge commit. Browser migration retains legacy records but does not automatically restore the previous visual layout.

Site Survey precedes Design in scope cards, scope editing, stage summaries and schedules, including existing browser data. Reordering preserves saved dates, milestone records and project notes.
