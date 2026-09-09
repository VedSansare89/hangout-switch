-- Schedule hourly cleanup of rooms (and their players, via cascade) older
-- than 24 hours, so the database doesn't grow unbounded on the free plan.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'cleanup-stale-rooms',
  '0 * * * *',
  $$select public.cleanup_stale_rooms();$$
);
