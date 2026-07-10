# SchoolSaaS ERP Platform

A comprehensive, multi-tenant Software as a Service (SaaS) application for School Enterprise Resource Planning (ERP). It provides a complete administrative dashboard to manage schools, teachers, students, support tickets, and system analytics.

## Project Structure

This repository contains two main components:
- `school-erp-frontend`: The web portal built with Next.js and Tailwind CSS.
- `school-erp-backend`: The REST API built with NestJS and Prisma ORM.

## Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) (App Router, v16)
- [React](https://react.dev/) (v19)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (v4)
- Axios & Context API for State/Auth Management

**Backend:**
- [NestJS](https://nestjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- JWT-based Authentication (Passport.js)

---

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm or yarn
- PostgreSQL instance running locally or in the cloud.

### 1. Clone the Repository

If you are setting this up for the first time, clone the repository to your local machine and navigate into the project directory:

```bash
git clone <your-repository-url>
cd saas
```

---

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd school-erp-backend
```

Install dependencies:
```bash
npm install
```

Set up Environment Variables:
Copy `.env.example` to `.env` and configure your PostgreSQL database URL and JWT secret:
```bash
cp .env.example .env
```
*(Example: `DATABASE_URL="postgresql://user:password@localhost:5432/school_erp?schema=public"`)*

Initialize Database and Seed Data:
```bash
npx prisma migrate dev --name init
npm run seed
```
*(Seeding creates the default Owner and Admin accounts for testing)*

Run the Backend Server:
```bash
npm run dev
```
The API will start at `http://localhost:3001`.

---

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:
```bash
cd school-erp-frontend
```

Install dependencies:
```bash
npm install
```

Set up Environment Variables:
Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```
Ensure `NEXT_PUBLIC_API_URL` points to your running backend (default: `http://localhost:3001/api`).

Run the Frontend Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

---

## Authentication & Default Credentials

If you seeded the database using `npm run seed`, you can log in with:
- **System Owner:** `owner@schoolsaas.in` (Password: `School@123`)
- **School Admin:** `priya.s@greenfield.edu.in` (Password: `School@123`)
