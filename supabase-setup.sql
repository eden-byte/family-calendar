-- Run this in your Supabase SQL editor

create table members (
  id text primary key,
  name text not null,
  color text not null,
  emoji text not null,
  created_at timestamptz default now()
);

create table conflicts (
  id text primary key,
  member_id text not null references members(id) on delete cascade,
  title text not null,
  category text not null,
  start_date text not null,
  end_date text not null,
  all_day boolean not null default true,
  start_time text,
  end_time text,
  notes text,
  created_at timestamptz default now()
);

-- Allow anyone with the anon key to read/write (family-only app, no auth needed)
alter table members enable row level security;
alter table conflicts enable row level security;

create policy "allow all" on members for all using (true) with check (true);
create policy "allow all" on conflicts for all using (true) with check (true);

-- Enable realtime
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table conflicts;
