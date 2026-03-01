create table public.users (
  id uuid default gen_random_uuid() not null primary key,
  name text not null unique,
  email text not null unique,
  password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create type public.form_status as enum ('DRAFT', 'PUBLISHED', 'CLOSED');
create type public.question_type as enum ('SHORT_ANSWER', 'MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN');

create table public.forms (
  id uuid default gen_random_uuid() not null primary key,
  title text not null,
  description text,
  status public.form_status default 'DRAFT' not null,
  creator_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.questions (
  id uuid default gen_random_uuid() not null primary key,
  form_id uuid not null references public.forms(id) on delete cascade,
  text text not null default 'Untitled Question',
  type public.question_type not null default 'SHORT_ANSWER',
  is_required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.submissions (
  id uuid default gen_random_uuid() not null primary key,
  form_id uuid not null references public.forms(id) on delete cascade,
  respondent_id uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(form_id, respondent_id)
);

create table public.answers (
  id uuid default gen_random_uuid() not null primary key,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;
alter table public.forms enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;
alter table public.answers enable row level security;