# CineMini - Telegram Movie Streaming App

## Overview

CineMini is a full-stack movie streaming application designed to work seamlessly within Telegram's WebApp environment. It provides users with the ability to browse, search, and stream movies directly through Telegram, featuring a Netflix-inspired interface with comprehensive movie management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL storage
- **External APIs**: TMDB (The Movie Database) for movie data

### Key Design Decisions
- **Telegram Integration**: Built specifically for Telegram WebApp with native SDK integration
- **Mobile-First**: Optimized for mobile devices with touch-friendly interfaces
- **Serverless Database**: Uses Neon Database for scalable PostgreSQL hosting
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Component Library**: shadcn/ui for consistent, accessible UI components

## Key Components

### Database Schema
- **Users**: Stores Telegram user information (ID, username, profile data)
- **Movies**: Caches movie data from TMDB API with additional metadata
- **Watch Progress**: Tracks user viewing progress for each movie
- **Watchlist**: Manages user's saved movies for later viewing

### API Routes
- **Authentication**: Telegram-based authentication with session management
- **Movies**: CRUD operations for movie data, trending, popular, and search
- **Watch Progress**: Tracking and updating user viewing progress
- **Watchlist**: Managing user's saved movies
- **Streaming**: Movie streaming URL generation and access

### Frontend Pages
- **Home**: Featured movies, trending content, and continue watching
- **Search**: Movie search with filters and sorting options
- **Categories**: Genre-based movie browsing
- **Movie Detail**: Comprehensive movie information and actions
- **Video Player**: Full-screen movie streaming interface
- **Watchlist**: User's saved movies
- **Profile**: User account management and statistics

## Data Flow

1. **User Authentication**: Telegram WebApp provides user data, backend creates/updates user records
2. **Movie Data**: TMDB API provides movie information, cached in local database
3. **Streaming**: Backend generates streaming URLs, frontend handles video playback
4. **Progress Tracking**: Real-time progress updates during video playback
5. **Watchlist Management**: User actions sync with backend database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

### External Services
- **TMDB API**: Movie database for content information
- **Neon Database**: Serverless PostgreSQL hosting
- **Telegram WebApp**: Platform integration and user authentication

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon Database connection via environment variables
- **Port Configuration**: Frontend on port 5000, backend integrated

### Production Deployment
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Deployment Target**: Replit autoscale deployment
- **Static Assets**: Frontend builds to `dist/public`
- **Environment Variables**: Database URL and API keys via environment

### Configuration
- **Database Migrations**: Drizzle Kit for schema management
- **Session Security**: Configurable session secrets
- **API Keys**: TMDB API key configuration
- **CORS**: Configured for Telegram WebApp origin

## Changelog

- June 19, 2025. Initial setup
- June 19, 2025. Successfully migrated from Replit Agent to standard Replit environment:
  - Created PostgreSQL database with all required tables
  - Installed tsx package for TypeScript execution
  - Added TMDB API keys for movie data functionality
  - Fixed loading overlay issue in App.tsx
  - Created .env.example for environment variables documentation
  - All database migrations applied successfully
  - Application now running without errors on port 5000
- June 19, 2025. Enhanced admin panel with production-ready architecture:
  - Created comprehensive admin panel structure in `/admin-panel/` directory
  - Implemented advanced Dashboard with real-time analytics and charts
  - Built professional Movie Management with TMDB integration and bulk operations
  - Created User Management with block/unblock functionality and bulk actions
  - Added proper TypeScript types and API service layer with authentication
  - Designed responsive UI components with Tailwind CSS
  - Integrated Recharts for data visualization and analytics
  - Created production deployment configuration and documentation

## User Preferences

Preferred communication style: Simple, everyday language.