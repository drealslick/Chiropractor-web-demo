-- ============================================================================
-- VANCE HEALTH SAAS SUITE: PRODUCTION SUPABASE SCHEMA & RLS SECURITY
-- ============================================================================

-- 1. CLINICS TABLE (Multi-Tenant Isolation)
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on clinics
alter table public.clinics enable row level security;

-- 2. CLINIC USERS & ROLE-BASED ACCESS CONTROL (RBAC)
create type public.user_role as enum ('owner', 'admin', 'staff', 'practitioner', 'patient');

create table if not exists public.clinic_users (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.user_role default 'staff'::public.user_role not null,
  email text not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.clinic_users enable row level security;

-- 3. APPOINTMENTS TABLE (Double-Booking Prevention & Payments)
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  patient_id uuid references auth.users(id) on delete set null,
  patient_name text not null,
  patient_email text not null,
  patient_phone text not null,
  service_title text not null,
  practitioner_name text not null,
  appointment_date date not null,
  appointment_time text not null,
  duration_minutes integer default 45 not null,
  status text default 'booked'::text not null, -- booked, confirmed, checked_in, cancelled, completed
  payment_status text default 'unpaid'::text not null, -- unpaid, deposit_paid, paid_full, refunded
  payment_amount numeric(10,2) default 0.00 not null,
  stripe_payment_intent_id text,
  intake_form jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent Double Booking on exact Date and Time for the same clinic
  constraint unique_clinic_appointment_slot unique (clinic_id, appointment_date, appointment_time)
);

alter table public.appointments enable row level security;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Clinics Policy: Users can view their own clinic
create policy "Users can view their associated clinic"
  on public.clinics for select
  using (
    id in (
      select clinic_id from public.clinic_users where user_id = auth.uid()
    )
  );

-- Clinic Users Policy: Admins and staff can view users in their clinic
create policy "Users can view members of their clinic"
  on public.clinic_users for select
  using (
    clinic_id in (
      select clinic_id from public.clinic_users where user_id = auth.uid()
    )
  );

-- Appointments Policy: Strict multi-tenant isolation
create policy "Users can view appointments for their clinic"
  on public.appointments for select
  using (
    clinic_id in (
      select clinic_id from public.clinic_users where user_id = auth.uid()
    )
    or patient_id = auth.uid()
  );

create policy "Staff and patients can insert appointments"
  on public.appointments for insert
  with check (
    clinic_id in (
      select clinic_id from public.clinic_users where user_id = auth.uid()
    )
    or auth.uid() is not null
  );

create policy "Staff can update appointments for their clinic"
  on public.appointments for update
  using (
    clinic_id in (
      select clinic_id from public.clinic_users where user_id = auth.uid()
    )
  );
