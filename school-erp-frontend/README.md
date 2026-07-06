# School ERP Frontend

School ERP Frontend is a Next.js dashboard application for managing schools, users, subscriptions, payments, support tickets, audit logs, and settings from one interface.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4

## Project Structure

```text
src/
  app/
    page.tsx
    login/
    register/
    dashboard/
    schools/
    users/
    subscriptions/
    payments/
    analytics/
    support/
    audit/
    settings/
  components/
    auth/
    dashboard/
  lib/
    auth.ts
    ThemeContext.tsx
public/
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - build the app for production
- `npm run start` - run the production build
- `npm run lint` - run ESLint

## Main Routes

- `/` - splash screen
- `/login` - login page
- `/register` - school registration flow
- `/dashboard` - admin dashboard
- `/schools` - school management
- `/users` - user management
- `/subscriptions` - subscription management
- `/payments` - payment tracking
- `/analytics` - analytics view
- `/support` - support tickets
- `/audit` - audit logs
- `/settings` - application settings

## Notes

- The current UI uses mock data and client-side state.
- Theme switching is handled through `src/lib/ThemeContext.tsx`.
- The dashboard shell is shared through `src/components/dashboard/DashboardLayout.tsx`.

