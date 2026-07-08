# Broadcast expiry — mobile integration note

The admin dashboard can now set **how long a broadcast stays live**, and admins
can **end or delete** broadcasts from a new Broadcasts management page. The mobile
app must respect the new `expires_at` column or expired broadcasts will keep
showing.

## DB change

Run `supabase/broadcasts_expiry.sql` (adds one nullable column + index):

```sql
alter table public.broadcasts
  add column if not exists expires_at timestamptz null;
```

- `expires_at IS NULL` → the broadcast never expires (permanent).
- `expires_at` set → stop showing the broadcast once `now()` passes it.

"End now" in the admin UI just sets `expires_at = now()`. "Delete" removes the
row entirely.

## What the mobile app must do

Add the expiry check to the broadcast fetch query. The full filter is now:

```sql
select *
from broadcasts
where archived_at is null                              -- NEW: skip archived
  and (expires_at is null or expires_at > now())      -- NEW: skip expired
  and (country = 'ALL' or country = <user_country>)    -- existing geo filter
  and (                                                 -- existing audience filter
        audience = 'all'
        or (audience = 'users'  and <user_is_regular>)
        or (audience = 'admins' and <user_is_admin>)
      )
order by created_at desc;
```

If you filter client-side instead, drop any broadcast where
`expiresAt != null && DateTime.parse(expiresAt).isBefore(DateTime.now().toUtc())`.

## Notes

- `expires_at` is stored in UTC (timestamptz). Compare against UTC now.
- No other columns changed. `severity`, `audience`, `country`, `title`, `body`
  are all the same.
- Deleted broadcasts simply disappear from the query — no tombstone to handle.
