# LeadPilot - B2B SaaS Lead Generation Platform

## Overview
LeadPilot is a comprehensive B2B SaaS platform designed to automate lead generation and email outreach. It features AI-powered lead scoring, automated email campaigns with pre-built French templates, multi-step sequences, and extensive analytics. The platform aims to streamline lead management and outreach for businesses, with a future vision to integrate a professional human closing service for sales. It's built as a full-stack TypeScript application, utilizing React for the frontend and Node.js with Express for the backend, supported by a PostgreSQL database.

## User Preferences
Preferred communication style: Simple, everyday language.
Closing service preference: Human closers (not AI) for phone sales with commission structure.

## System Architecture
The application is a full-stack TypeScript project. The frontend, built with React 18, Vite, and TypeScript, uses `shadcn/ui` and Radix UI components styled with Tailwind CSS, `Wouter` for routing, and TanStack React Query for state management. The backend is a Node.js Express server with TypeScript, implementing a RESTful API. Authentication is handled via Replit's OpenID Connect and Passport.js, with sessions stored in PostgreSQL. PostgreSQL, managed with Drizzle ORM, serves as the primary database, storing user, session, email template, lead, campaign, sequence, and booking data. The system supports a tiered subscription model with usage quotas for leads, templates, AI variations, and sequences, enforced at the API level with real-time validation.

**UI/UX Decisions:**
The frontend utilizes `shadcn/ui` components built on Radix UI primitives, styled with Tailwind CSS, to ensure a modular and accessible user interface. The design incorporates a custom system for consistent branding. The booking system UI is designed for simplicity, featuring white text on a dark theme and scrollable modals for enhanced usability.

**Technical Implementations:**
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, `shadcn/ui`, Radix UI, Wouter, TanStack React Query, React Hook Form with Zod validation.
- **Backend**: Node.js, Express, TypeScript, RESTful API design, Passport.js for authentication, `connect-pg-simple` for session management.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Lead Management**: Includes AI lead scoring based on various criteria, CSV import/export with field mapping, and lead enrichment capabilities.
- **Email Campaigns**: Features 30 pre-built French templates, AI-powered email variation generation (6 styles), and a system for creating custom emails. Campaigns support flexible lead targeting with quick selection actions.
- **Automated Sequences**: A comprehensive system for creating multi-step email sequences with configurable delays and smart response detection to stop sequences.
- **Booking System**: Allows users to propose meeting times via a public booking page, with configurable availability and automatic text insertion into emails.
- **Subscription & Quota**: Implements a tiered subscription model (Free, Starter, Pro, Growth) with usage-based quotas for features like leads, templates, and AI variations.

## External Dependencies

- **Frameworks & Runtimes**: React 18, Express.js, Vite, Node.js.
- **Database**: PostgreSQL (hosted on Neon Database), Drizzle ORM, `@neondatabase/serverless`.
- **UI & Styling**: Tailwind CSS, Radix UI, `shadcn/ui`, Lucide React.
- **Authentication**: Passport.js (for Replit OAuth/OpenID Connect), `connect-pg-simple`, `express-session`.
- **Lead & AI Services**: Mock Lead Service (for development), AI Lead Scoring Service, CSV Import/Export Service, External Lead API Integration (configurable).
- **Planned Integrations**: Stripe (for payments), SMTP services (for email delivery).
- **Development Tools**: TypeScript, ESBuild, PostCSS with Autoprefixer.