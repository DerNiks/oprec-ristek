create table public.users (
  id uuid default gen_random_uuid() not null,
  name text not null,
  email text not null,
  password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key(id),
  unique(email)
);

alter table public.users enable row level security;

create type public.form_status as enum ('DRAFT', 'PUBLISHED', 'CLOSED');

create table public.forms (
  id uuid default gen_random_uuid() not null primary key,
  title text not null,
  description text,
  status public.form_status default 'DRAFT' not null,
  
  creator_id uuid not null references public.users(id) on delete cascade,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.forms enable row level security;

create type public.question_type as enum ('SHORT_ANSWER', 'MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN');

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

alter table public.questions enable row level security;

create table public.submissions (
  id uuid default gen_random_uuid() not null primary key,
  form_id uuid not null references public.forms(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.answers (
  id uuid default gen_random_uuid() not null primary key,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.submissions enable row level security;
alter table public.answers enable row level security;

ALTER TABLE public.submissions 
ADD COLUMN respondent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.submissions
ADD CONSTRAINT unique_respondent_per_form UNIQUE (form_id, respondent_id);

ALTER TABLE public.submissions 
DROP CONSTRAINT IF EXISTS submissions_respondent_id_fkey;

ALTER TABLE public.submissions
ADD CONSTRAINT submissions_respondent_id_fkey 
FOREIGN KEY (respondent_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.users ADD CONSTRAINT users_name_key UNIQUE (name);