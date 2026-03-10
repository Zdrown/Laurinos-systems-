# Laurino's Tavern — System Architecture Platform

Interactive web application for the Laurino's Tavern operational system architecture document.

## Setup

### 1. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable **Email + Password** auth in Authentication → Providers
3. Run the SQL in `supabase-migrations.sql` in the Supabase SQL Editor
4. Copy your project URL and anon key from Settings → API

### 2. Environment Variables

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. First User

Sign up at `/signup`. To set a user as `owner` or `manager`, update their `role` field in the `profiles` table via Supabase dashboard.

## Features

- **Supabase Auth** — signup, login, forgot/reset password
- **Notes** — add notes to any section or subsection
- **Corrections** — flag errors with a title and body
- **Add Subsection** — extend any section with new subsections
- **Add Section** — create new top-level sections
- **Export** — download as structured HTML or print as PDF
- **All original content preserved** — every word from the static document
