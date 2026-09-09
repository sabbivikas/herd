# Supabase

- `migrations/202609090001_initial_schema.sql` - the approved 14-table schema,
  RLS policies, heart-count triggers, charts materialized view, `chart_refresh()`,
  and the `feed_page(cursor_score, cursor_id, page_limit)` RPC the feed uses.
- `seed.sql` - TEMPORARY genre list. Mario's real taxonomy replaces it in week 2.

Apply to a fresh project:

```sh
supabase link --project-ref <ref>
supabase db push
# then run seed.sql in the SQL editor
```

Edge functions (`upload-sign`, `stream-webhook`, `heart-toggle`, `chart-refresh`,
`moderation-act`, `notify`) land with their feature weeks.
