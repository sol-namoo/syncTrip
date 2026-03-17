# SyncTrip

> This project is currently in MVP development. It is not a finished product yet, and the current focus is on the core user flow and realtime collaboration features.

SyncTrip is a collaborative travel planning product where multiple users can build and edit a trip together. The goal is to let users search places, organize them by day in a kanban board, and shape a shared itinerary alongside a map view.

The current MVP is focused on the following:

- Social login and trip space creation
- Place search and drag-and-drop itinerary planning
- Multi-cursor and realtime card movement sync with Supabase Realtime
- 3D passport-style itinerary rendering with image download

## Current Direction

- Desktop-first workspace with a split map and kanban board layout
- Mobile-first share/export flow for viewing and sharing the 3D passport result
- Supabase-based auth, persistence, and realtime collaboration

## Documentation

- Implementation plan: [`docs/synctrip-mvp-implementation-plan.md`](./docs/synctrip-mvp-implementation-plan.md)

## Environment Variables

To run the project locally, set these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
```

## Database

This project also requires a Supabase-backed Postgres database. The MVP currently assumes at least these core tables:

- `trips`
- `trip_members`
- `trip_items`

## Run Locally

```bash
npm run dev
```
