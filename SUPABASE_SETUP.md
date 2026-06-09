# Supabase Setup Guide for AIM Global Talent Marketplace

## Step 1: Create free Supabase project
1. Go to https://supabase.com → Sign up free
2. Click "New Project" → name it "aim-talent-marketplace"
3. Set a database password → Save it somewhere
4. Wait ~2 minutes for project to spin up

## Step 2: Get your credentials
In your Supabase dashboard:
- Go to Settings → API
- Copy: Project URL (looks like https://xxxx.supabase.co)
- Copy: anon/public key (long string starting with eyJ...)

## Step 3: Add credentials to the app
Open `src/lib/supabase.js` and replace:
- `YOUR_SUPABASE_URL` with your Project URL
- `YOUR_SUPABASE_ANON_KEY` with your anon key

## Step 4: Run this SQL in Supabase SQL Editor
Go to SQL Editor in your Supabase dashboard and paste this entire block:

```sql
-- USERS / ROLES TABLE
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text check (role in ('superadmin','admin','staff','employer','beneficiary')),
  employer_id uuid,
  created_at timestamptz default now()
);

-- EMPLOYERS TABLE
create table employers (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  country text,
  industry text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text default 'active' check (status in ('active','inactive','pending')),
  access_browse boolean default true,
  access_shortlist boolean default true,
  access_download_cv boolean default false,
  access_raise_demand boolean default true,
  access_contact_details boolean default false,
  allowed_trades text[],
  allowed_countries text[],
  notes text,
  invited_by uuid,
  created_at timestamptz default now()
);

-- BENEFICIARIES TABLE
create table beneficiaries (
  id uuid default gen_random_uuid() primary key,
  aim_id text unique,
  full_name text not null,
  gender text,
  dob date,
  age int,
  city text,
  state text,
  phone text,
  email text,
  trade text,
  education text,
  experience_years int,
  experience_details text,
  target_country text[],
  readiness_score int default 0,
  status text default 'registered' check (status in ('registered','in_training','docs_pending','deployment_ready','deployed','on_hold')),
  -- Language
  german_level text,
  english_level text,
  other_languages jsonb,
  -- Documents
  passport_status text default 'pending' check (passport_status in ('pending','uploaded','verified','expired')),
  iti_certificate_status text default 'pending',
  police_clearance_status text default 'pending',
  medical_fitness_status text default 'pending',
  education_certificate_status text default 'pending',
  resume_url text,
  -- Timeline
  language_exam_date date,
  contract_expected_date date,
  visa_expected_date date,
  deployment_expected_date date,
  -- Meta
  source text,
  batch text,
  notes text,
  registered_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- EMPLOYER SHORTLISTS
create table shortlists (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employers(id) on delete cascade,
  beneficiary_id uuid references beneficiaries(id) on delete cascade,
  status text default 'interested' check (status in ('interested','approved','rejected','on_hold')),
  approved_by uuid,
  notes text,
  created_at timestamptz default now(),
  unique(employer_id, beneficiary_id)
);

-- EMPLOYER DEMANDS
create table demands (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employers(id) on delete cascade,
  trade text not null,
  country text not null,
  count_required int not null,
  count_mapped int default 0,
  language_required text,
  intake_date date,
  notes text,
  status text default 'open' check (status in ('open','in_progress','fulfilled','closed')),
  created_at timestamptz default now()
);

-- ACTIVITY LOG
create table activity_log (
  id uuid default gen_random_uuid() primary key,
  action text,
  entity_type text,
  entity_id uuid,
  performed_by uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- ENABLE ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table employers enable row level security;
alter table beneficiaries enable row level security;
alter table shortlists enable row level security;
alter table demands enable row level security;
alter table activity_log enable row level security;

-- POLICIES: Admin/staff see everything
create policy "Admins full access beneficiaries" on beneficiaries
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('superadmin','admin','staff'))
  );

create policy "Employers see mapped beneficiaries" on beneficiaries
  for select using (
    exists (
      select 1 from shortlists s
      join profiles p on p.id = auth.uid()
      where s.beneficiary_id = beneficiaries.id
      and s.employer_id = p.employer_id
      and p.role = 'employer'
    )
  );

create policy "Admins full access employers" on employers
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('superadmin','admin'))
  );

create policy "Employers see own record" on employers
  for select using (
    exists (select 1 from profiles where id = auth.uid() and employer_id = employers.id)
  );

create policy "Admins full access shortlists" on shortlists
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('superadmin','admin','staff'))
  );

create policy "Employers manage own shortlists" on shortlists
  for all using (
    exists (select 1 from profiles where id = auth.uid() and employer_id = shortlists.employer_id)
  );

create policy "Admins full access demands" on demands
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('superadmin','admin','staff'))
  );

create policy "Employers manage own demands" on demands
  for all using (
    exists (select 1 from profiles where id = auth.uid() and employer_id = demands.employer_id)
  );

create policy "Profiles accessible by owner" on profiles
  for all using (auth.uid() = id);

create policy "Admins see all profiles" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('superadmin','admin'))
  );
```

## Step 5: Create your superadmin account
1. In Supabase → Authentication → Users → Invite User
2. Use your email: deepak.duseja@ampersandimobility.com
3. After confirming email, go to SQL Editor and run:
```sql
update profiles set role = 'superadmin', full_name = 'Deepak Duseja' 
where email = 'deepak.duseja@ampersandimobility.com';
```

## Step 6: Run the app
```bash
npm install
npm start
```

That's it. Your platform is live locally. To deploy publicly (free): use Vercel.com → import this folder → deploy.
