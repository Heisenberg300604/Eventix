# Eventix - React + Supabase Course Project

Eventix is a work-in-progress course project used to teach React and Supabase.
Students build a modern event discovery and booking experience while learning routing,
UI composition, data flows, and backend integration.

This repo is intentionally not complete yet. Each lesson adds features and refactors
the codebase as we move from a static UI to a fully connected app.

## Tech Stack

- React 19 + Vite
- React Router
- Tailwind CSS
- Supabase (Auth + database)
- Framer Motion

## App Overview

Planned and in-progress screens:

- Marketing homepage with event cards and animations
- Auth flow (login, signup)
- Event details and booking
- User bookings
- Dashboard for hosts (create and edit events)

Routes are defined in `src/App.jsx` and include:

- `/` home
- `/login`, `/signup`
- `/my-bookings`
- `/event/:id`
- `/dashboard`, `/dashboard/create`, `/dashboard/edit/:id`

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root with your Supabase project values:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
```

These are used in `utils/supabase.js` to create the Supabase client.

### 3) Run the dev server

```bash
npm run dev
```

## Scripts

- `npm run dev` Start the Vite dev server
- `npm run build` Build for production
- `npm run preview` Preview the production build locally
- `npm run lint` Run ESLint

## Project Structure (Highlights)

- `src/pages` Route-level screens
- `src/components` UI components
- `src/layouts` Shared layouts
- `src/data` Placeholder data used before Supabase wiring
- `utils/supabase.js` Supabase client

## Course Notes

This project evolves across lessons. You may see placeholder data and incomplete
features. That is expected, and it is part of the learning process.

If you are a student, follow the lesson order before attempting to fill in missing
pieces on your own.
