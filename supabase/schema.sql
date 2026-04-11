create table if not exists profiles (
  id uuid primary key,
  email text not null,
  first_name text,
  last_name text,
  username text,
  updated_at timestamptz default now()
);

create table if not exists learning_progress (
  user_id uuid primary key,
  progress_json jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists community_posts (
  id text primary key,
  title text not null,
  body text not null,
  tag text not null,
  author text not null,
  moderation_state text default 'visible',
  created_at timestamptz default now()
);

create table if not exists community_post_reports (
  id bigint generated always as identity primary key,
  post_id text not null references community_posts(id) on delete cascade,
  reporter_id text not null,
  reason text not null,
  created_at timestamptz default now()
);

create table if not exists tutoring_requests (
  id bigint generated always as identity primary key,
  student_name text not null,
  student_email text not null,
  subject text not null,
  message text not null,
  preferred_time text,
  status text default 'new',
  created_at timestamptz default now()
);
