# HOSIS ARCHITECTURE PROJECT HUB

A standalone, responsive front-end prototype for architectural project delivery and coordination.

## Prototype features

- Full-screen world → Canada → Toronto → demo-building cinematic intro, with Skip, Pause, Replay and reduced-motion support
- Admin and assigned-user role simulation
- Six entirely fictional projects and organizations
- Portfolio project gallery with search and filters
- Project-specific stage scope with hidden out-of-scope workflows
- Admin controls for scope, status, priority and assigned users
- Portfolio and project-level Gantt timelines with editable dates and visible overlaps
- Manual add, edit and delete controls for overview, team, schedule, stage records, tasks, deadlines, activity and documents
- Design, Project Administration, Permit, Tender, Construction Administration and Closeout records
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

Run `npm ci`, then `npm run dev`. Run `npm run build` for TypeScript validation and the production build. The original project hub remains in `app.js`; its localStorage schema and project records are unchanged. The React 18 intro is an isolated component in `src/intro/`.

## Cinematic intro

- Edit `src/intro/config.ts` to change the address label, demo map anchor and camera waypoints.
- The map uses MapLibre GL JS and OpenFreeMap/OpenStreetMap data. It needs an internet connection; attribution remains visible.
- Three.js adds schematic CN Tower and demo-building models. They are not photogrammetry or surveyed models. The anchor is not a verified geocode for the displayed address.
- The existing, already-published `assets/intro-poster.jpg` remains the loading/reduced-motion/error poster. No newly uploaded private image is included.
- No map API key, user geolocation, real login or new paid service is configured.
- Map failure cannot block entry. The prior video and poster remain in `assets/` for recovery.
- Intro controls dispatch `hosis:intro:enter`; the existing hub owns role selection. `hosis:intro:closed` releases the map; `hosis:intro:replay` remounts it.
