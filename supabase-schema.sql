-- Run this in your Supabase SQL editor

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Notes table
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text check (type in ('note', 'pdf', 'link')) not null,
  title text not null,
  content text,
  url text,
  pdf_url text,
  tag text default 'General',
  ai_summary text,
  pinned boolean default false,
  view_count integer default 0,
  like_count integer default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Likes table
create table likes (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(note_id, user_id)
);

-- Comments table
create table comments (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table notes enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;

-- RLS Policies
create policy "Profiles visible to authenticated users" on profiles for select using (auth.role() = 'authenticated');
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Notes visible to authenticated users" on notes for select using (auth.role() = 'authenticated');
create policy "Users can insert own notes" on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on notes for delete using (auth.uid() = user_id);

create policy "Likes visible to authenticated users" on likes for select using (auth.role() = 'authenticated');
create policy "Users can insert own likes" on likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on likes for delete using (auth.uid() = user_id);

create policy "Comments visible to authenticated users" on comments for select using (auth.role() = 'authenticated');
create policy "Users can insert own comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on comments for delete using (auth.uid() = user_id);

-- Storage bucket for PDFs
insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', true);
create policy "Authenticated users can upload PDFs" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'pdfs');
create policy "PDFs are publicly accessible" on storage.objects for select using (bucket_id = 'pdfs');

-- Enable realtime
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table likes;
alter publication supabase_realtime add table comments;
