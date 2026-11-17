-- ==============================================================================
-- BusBridge – Supabase PostgreSQL Production Schema & Row Level Security (RLS)
-- Target: Supabase Postgres 15+
-- Safe for execution on fresh or existing database
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Profiles (linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bus Routes (Master transit directory)
create table if not exists public.bus_routes (
  id text primary key,
  bus_number text not null,
  name text not null,
  from_stop text not null,
  to_stop text not null,
  duration integer default 0,
  total_stops integer default 0,
  distance numeric(5,2) default 0.0,
  frequency text,
  type text default 'Ordinary',
  is_active boolean default true,
  source text default 'mtc_directory',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bus Stops (Sequential stop coordinates and details for routes)
create table if not exists public.bus_stops (
  id serial primary key,
  route_id text not null references public.bus_routes(id) on delete cascade,
  stop_order integer not null,
  name text not null,
  lat numeric(10,7),
  lng numeric(10,7),
  major_stop boolean default false,
  created_at timestamptz default now()
);

-- Crowd Reports (Passenger community crowd intelligence)
create table if not exists public.crowd_reports (
  id text primary key,
  route_id text,
  bus_number text not null,
  route_name text,
  stop_location text,
  crowd_level text not null check (crowd_level in ('low', 'medium', 'high', 'very_high')),
  notes text,
  source text default 'community',
  reported_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null
);

-- Issue Reports (Passenger grievance tracking)
create table if not exists public.issue_reports (
  id text primary key,
  title text not null,
  category text not null,
  bus_number text not null,
  location text not null,
  description text not null,
  route_id text,
  image_attachment text,
  status text default 'pending' check (status in ('pending', 'under_review', 'resolved', 'rejected')),
  timeline jsonb default '[]'::jsonb,
  reported_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null
);

-- Saved Routes (User favourites & frequent corridors)
-- Note: user_id is nullable to support client tokens / anonymous users when auth is optional,
-- but enforces auth.uid() match when authenticated.
create table if not exists public.saved_routes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  route_id text,
  bus_number text,
  name text,
  from_stop text not null,
  to_stop text not null,
  journey_type text default 'direct',
  duration integer default 0,
  distance numeric(5,2) default 0.0,
  transfers_count integer default 0,
  legs jsonb default '[]'::jsonb,
  saved_at timestamptz default now()
);

-- Service Alerts (Official and community transit advisories)
create table if not exists public.service_alerts (
  id text primary key,
  title text not null,
  description text not null,
  category text not null default 'announcement',
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  affected_routes text[] default '{}',
  is_active boolean default true,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
create index if not exists idx_bus_routes_stops on public.bus_routes(from_stop, to_stop);
create index if not exists idx_bus_routes_bus_number on public.bus_routes(bus_number);
create index if not exists idx_bus_stops_route_id on public.bus_stops(route_id);
create index if not exists idx_crowd_reports_bus on public.crowd_reports(bus_number);
create index if not exists idx_crowd_reports_reported_at on public.crowd_reports(reported_at desc);
create index if not exists idx_issue_reports_status on public.issue_reports(status);
create index if not exists idx_issue_reports_reported_at on public.issue_reports(reported_at desc);
create index if not exists idx_saved_routes_user on public.saved_routes(user_id);
create index if not exists idx_service_alerts_active on public.service_alerts(is_active);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.bus_routes enable row level security;
alter table public.bus_stops enable row level security;
alter table public.crowd_reports enable row level security;
alter table public.issue_reports enable row level security;
alter table public.saved_routes enable row level security;
alter table public.service_alerts enable row level security;

-- Profiles: Users can view all profiles, but only edit their own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Bus Routes & Stops: Public readable; mutations restricted
create policy "Bus routes are readable by everyone"
  on public.bus_routes for select
  using (true);

create policy "Bus stops are readable by everyone"
  on public.bus_stops for select
  using (true);

-- Service Alerts: Public readable
create policy "Service alerts are readable by everyone"
  on public.service_alerts for select
  using (true);

-- Crowd Reports: Anyone (including anonymous commuters) can read and insert
create policy "Crowd reports are readable by everyone"
  on public.crowd_reports for select
  using (true);

create policy "Anyone can submit crowd reports"
  on public.crowd_reports for insert
  with check (
    (auth.uid() is null and user_id is null) or
    (auth.uid() is not null and (user_id is null or user_id = auth.uid()))
  );

-- Issue Reports: Anyone can submit and view community issues
create policy "Issue reports are readable by everyone"
  on public.issue_reports for select
  using (true);

create policy "Anyone can submit issue reports"
  on public.issue_reports for insert
  with check (
    (auth.uid() is null and user_id is null) or
    (auth.uid() is not null and (user_id is null or user_id = auth.uid()))
  );

-- Saved Routes:
-- Enforces true user isolation via auth.uid() (works with both Supabase Auth and Anonymous Auth).
create policy "Users can read their own saved routes"
  on public.saved_routes for select
  using (
    auth.uid() is not null and user_id = auth.uid()
  );

create policy "Users can insert their own saved routes"
  on public.saved_routes for insert
  with check (
    auth.uid() is not null and user_id = auth.uid()
  );

create policy "Users can delete their own saved routes"
  on public.saved_routes for delete
  using (
    auth.uid() is not null and user_id = auth.uid()
  );
