# Supabase Migrations

This directory stores SQL migrations for SyncTrip.

Current migration history starts with:

1. `20260316000100_init_trips_schema.sql`
   - `trips`
   - `trip_members`
   - realtime publication
   - RLS policies
   - `create_trip_with_owner` Postgres function

Note:

- These files represent the schema history in the repository.
- If the remote Supabase project was created manually before migrations were added to the repo, the existing database state may already include part of this schema.
- From this point on, new schema changes should be added here as new migration files instead of being tracked only in the Supabase dashboard.
