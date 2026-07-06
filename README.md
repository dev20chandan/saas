# School ERP SaaS

A comprehensive Software as a Service (SaaS) application for School Enterprise Resource Planning (ERP).

## Project Structure

This repository contains the following main components:
- `school-erp-frontend`: The web frontend built with Next.js, React, TypeScript, and Tailwind CSS.

## Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) (v16)
- [React](https://react.dev/) (v19)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (v4)

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd saas
   ```

2. **Frontend Setup:**
   Navigate into the frontend directory:
   ```bash
   cd school-erp-frontend
   ```
   Install the dependencies:
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Copy the example environment file to create your local environment configuration:
   ```bash
   cp env.example .env.local
   ```
   Update `.env.local` with your local values if needed.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

Inside the `school-erp-frontend` directory, you can run:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run start`: Runs the built app in production mode.
- `npm run lint`: Runs ESLint to catch linting errors.

# saas

