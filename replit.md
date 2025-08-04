# LeadPilot - B2B SaaS Lead Generation Platform

## Overview

LeadPilot is a comprehensive B2B SaaS platform that enables businesses to automate their lead generation and email outreach processes. The application integrates AI-powered lead scoring, automated email campaigns using 30 pre-built French templates, multi-step sequences, comprehensive analytics tracking, and a planned professional closing service where human closers handle phone sales with commission-based compensation. Built as a full-stack TypeScript application, it features a modern React frontend with Tailwind CSS and a Node.js Express backend connected to a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.
Closing service preference: Human closers (not AI) for phone sales with commission structure.

## System Architecture

### Frontend Architecture
The frontend is built using React 18 with TypeScript, utilizing Vite for development and build tooling. The UI framework is based on shadcn/ui components with Radix UI primitives, styled using Tailwind CSS with a custom design system. The application uses Wouter for client-side routing and TanStack React Query for server state management and caching. The component architecture follows a modular dashboard pattern with separate sections for leads, templates, campaigns, sequences, calendar, analytics, and settings.

### Backend Architecture
The backend is implemented as a Node.js Express server with TypeScript. It follows a RESTful API design pattern with route handlers organized by feature domains. The server includes middleware for request logging, JSON parsing, and error handling. Authentication is handled through Replit's OpenID Connect integration with session management using PostgreSQL-backed sessions via connect-pg-simple.

### Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes tables for users, sessions (required for Replit Auth), email templates, leads, campaigns, campaign emails, sequences, and bookings. The database supports subscription-based quotas and usage tracking for different plan tiers (Free, Starter, Pro, Growth).

### Authentication System
Authentication is implemented using Replit's OAuth/OpenID Connect system with Passport.js strategies. Sessions are stored in PostgreSQL and the system supports automatic user provisioning and profile management. The authentication middleware protects all API routes and maintains user context throughout the application.

### State Management
Client-side state is managed through TanStack React Query for server state and local React state for UI interactions. The query client is configured with optimistic caching strategies and includes custom hooks for authentication state management. Form state is handled using React Hook Form with Zod validation schemas.

### Subscription and Quota Management
The platform implements a tiered subscription model with usage quotas for leads, templates, AI variations, and sequences. Current quota limits are: Free (5 leads), Starter (100 leads), Pro (500 leads), Growth (1500 leads). Usage tracking is built into the database schema and enforced at the API level with real-time quota validation and monthly usage calculation. The system is prepared for Stripe integration for payment processing, though payment functionality appears to be planned for future implementation.

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript for the frontend framework
- **Express.js** with TypeScript for the backend server
- **Vite** for frontend development and build tooling
- **Node.js** runtime environment

### Database and ORM
- **PostgreSQL** via Neon Database for cloud hosting
- **Drizzle ORM** with Zod integration for type-safe database operations
- **@neondatabase/serverless** for PostgreSQL connection pooling

### UI and Styling
- **Tailwind CSS** for utility-first styling approach
- **Radix UI** components for accessible UI primitives
- **shadcn/ui** component library built on Radix UI
- **Lucide React** for consistent iconography

### Authentication and Session Management
- **Passport.js** with OpenID Connect for Replit authentication
- **connect-pg-simple** for PostgreSQL-backed session storage
- **express-session** for session middleware

### Lead Generation and AI Services
- **Mock Lead Service** for development and testing lead generation
- **AI Lead Scoring Service** for intelligent prospect qualification
- **CSV Import/Export Service** for bulk lead management
- **External Lead API Integration** (configurable via LEAD_API_KEY and LEAD_API_URL)

### Planned External Integrations
- **External Lead APIs** for automated lead generation and data enrichment (architecture ready)
- **AI Services** for intelligent lead scoring and email variation generation (basic implementation complete)
- **Stripe** for subscription billing and payment processing (prepared but not implemented)
- **SMTP services** for email campaign delivery (configuration ready)

### Development and Build Tools
- **TypeScript** for type safety across the entire stack
- **ESBuild** for optimized production builds
- **PostCSS** with Autoprefixer for CSS processing
- **Replit development plugins** for enhanced development experience

## Recent Changes (August 2025)

### Lead Generation System Implementation
- **Lead Service Architecture**: Created modular lead generation system with mock service for development and external API integration capability
- **AI Lead Scoring**: Implemented intelligent lead scoring algorithm considering position seniority, company size, sector value, and enriched data
- **CSV Management**: Full CSV import/export functionality with smart field mapping and validation
- **API Endpoints**: Added `/api/leads/generate`, `/api/leads/import-csv`, `/api/leads/export-csv`, and `/api/leads/csv-template`
- **Frontend Integration**: Enhanced leads section with real-time generation, import/export controls, and loading states
- **Data Enrichment**: Lead enrichment pipeline with company and person data enhancement capabilities
- **Quota System Refinement**: Corrected Growth plan quota to 1500 leads maximum (was incorrectly set to 2000)
- **Input Field Enhancement**: Improved numeric input field with direct typing capability, auto-selection on focus, and proper validation
- **Real-time Synchronization**: Fixed sidebar analytics synchronization using live data queries instead of cached user properties
- **System Validation**: Complete lead generation workflow tested and confirmed working with real Apollo API integration, proper quota tracking, and synchronized UI updates

### Templates System Complete Overhaul (August 4, 2025)
- **Plan-Based Access Control**: Fixed Free plan to show exactly 1 template (1/30), removed duplicate templates from database
- **Custom Email Creation**: Replaced "Generate Variations" and "New Template" buttons with unified "Écrire Email Personnel" feature available to all plans
- **AI-Powered Variations System**: Advanced variation engine with 6 distinct French styles (Protocolaire, Moderne, Commercial, Chaleureux, Technique, Créatif) that transforms entire email content while preserving structure and formatting
- **Variation Quota System**: Implemented subscription-based limits (Free: 3, Starter: 15, Pro: 50, Growth: 150 variations/month) with real-time tracking and informative error messages
- **Template Restoration**: Added "Revenir à l'original" button to restore templates to their base version after variations
- **Enhanced Edit Interface**: Improved template editing dialog with larger text area (15 rows), monospace font, and helpful variable commands ([PRENOM], [ENTREPRISE], etc.)
- **French Language Optimization**: Variations now properly respect French grammar, sentence structure, and professional correspondence standards while preserving original spacing and line breaks
- **Template Management**: Removed delete functionality for templates per user request - templates are now protected from deletion
- **Custom Email Creation**: Enhanced with mandatory name field, subject validation, and proper integration with "Mes Emails" section
- **Quota Monitoring**: Real-time quota display in sidebar and variation success notifications showing remaining usage
- **Error Resolution**: Fixed cascading transformation bug that created incoherent French phrases, implemented independent style application directly on original content
- **Variation Quality Control**: Each of the 6 styles now applies transformations independently to prevent grammatical errors and maintain coherent French text