# CineMini Admin Panel

> **Production-Ready Admin Dashboard for CineMini Telegram Mini App**

A comprehensive admin panel for managing your CineMini movie streaming platform with advanced analytics, user management, and content control features.

## 📋 Overview

This admin panel provides complete administrative control over your CineMini platform:

- **Dashboard Analytics** - Real-time platform metrics and performance insights
- **Movie Management** - Add, edit, hide/publish movies with TMDB integration
- **User Management** - View, block/unblock users, reset watch progress
- **Streaming Control** - Manage multiple streaming sources and quality options
- **Notifications** - Send Telegram announcements to users
- **System Monitoring** - API health, uptime, and performance metrics

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Custom components with Tailwind CSS
- **Charts**: Recharts for data visualization
- **State Management**: React hooks + TanStack Query
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT tokens with automatic refresh

### Project Structure

```
admin-panel/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, etc.)
│   │   ├── charts/         # Chart components for analytics
│   │   └── forms/          # Form components
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx   # Main dashboard with analytics
│   │   ├── Movies.tsx      # Movie management interface
│   │   ├── Users.tsx       # User management interface
│   │   ├── Analytics.tsx   # Detailed analytics page
│   │   ├── Notifications.tsx # Notification center
│   │   └── Settings.tsx    # System settings
│   ├── layouts/            # Layout components
│   │   └── AdminLayout.tsx # Main admin layout with sidebar
│   ├── services/           # API services and data fetching
│   │   ├── api.ts          # Main API client with auth
│   │   └── tmdb.ts         # TMDB integration service
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── constants/          # App constants and config
├── public/                 # Static assets
└── dist/                   # Production build output
```

## 🚀 Features

### Dashboard & Analytics
- **Real-time Metrics**: Users, movies, watch hours, active sessions
- **Visual Charts**: User growth, genre distribution, content performance
- **System Health**: API status, uptime monitoring, response times
- **Quick Actions**: Direct access to key management features

### Movie Management
- **TMDB Integration**: Import movies directly from TMDB
- **Bulk Operations**: Hide/publish/delete multiple movies
- **Streaming Sources**: Manage multiple streaming providers
- **Content Control**: Hide inappropriate content, manage ratings
- **Search & Filters**: Advanced filtering by status, genre, rating

### User Management
- **User Overview**: Complete user profiles with Telegram data
- **Bulk Actions**: Block/unblock multiple users, reset progress
- **Activity Tracking**: Last active, join dates, engagement metrics
- **Security Controls**: Block malicious users, manage permissions

### Notifications & Communication
- **Telegram Integration**: Send announcements via bot
- **Targeted Messaging**: Send to all users, active users, or specific groups
- **Scheduling**: Schedule notifications for optimal timing
- **Templates**: Pre-built message templates for common announcements

### System Settings
- **API Configuration**: Manage TMDB, streaming provider keys
- **Rate Limiting**: Configure request limits and throttling
- **Security Settings**: Authentication timeouts, session management
- **Platform Settings**: Platform-wide configuration options

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Access to CineMini backend API
- Admin credentials for authentication

### Development Setup

1. **Install Dependencies**
   ```bash
   cd admin-panel
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/admin
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_APP_ENV=development
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Admin Panel**
   - Navigate to `http://localhost:3000/admin`
   - Login with admin credentials (`admin` / `password`)

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based login
- **Automatic Token Refresh**: Seamless session management
- **Role-based Access**: Admin vs moderator permissions
- **Session Timeout**: Configurable inactivity logout

### API Security
- **Request Interceptors**: Automatic auth header injection
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Client and server-side validation

### Data Protection
- **Sensitive Data Masking**: Hide sensitive user information
- **Audit Logging**: Track administrative actions
- **Secure Communication**: HTTPS-only in production
- **Permission Checks**: Granular action permissions

## 📊 Analytics & Monitoring

### Key Metrics Tracked
- **User Metrics**: Registration, activation, retention rates
- **Content Metrics**: Most watched, completion rates, trending
- **Performance Metrics**: API response times, error rates
- **System Metrics**: Uptime, database performance, storage

### Reporting Features
- **Real-time Dashboards**: Live updating metrics
- **Historical Data**: Trend analysis over time
- **Export Capabilities**: Download reports as CSV/PDF
- **Custom Date Ranges**: Flexible time period analysis

## 🔧 API Integration

### Backend Requirements
Your CineMini backend must implement these admin API endpoints:

```typescript
// Authentication
POST /api/admin/auth/login
POST /api/admin/auth/logout
GET  /api/admin/auth/me

// Analytics
GET  /api/admin/analytics
GET  /api/admin/analytics/watch-stats
GET  /api/admin/analytics/user-growth

// Movies
GET    /api/admin/movies
POST   /api/admin/movies
PUT    /api/admin/movies/:id
DELETE /api/admin/movies/:id
POST   /api/admin/movies/bulk-action

// Users
GET    /api/admin/users
PATCH  /api/admin/users/:id/block
PATCH  /api/admin/users/:id/unblock
DELETE /api/admin/users/:id/progress
POST   /api/admin/users/bulk-action

// Notifications
GET  /api/admin/notifications
POST /api/admin/notifications
POST /api/admin/notifications/:id/send

// System
GET   /api/admin/settings
PATCH /api/admin/settings
GET   /api/admin/health
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify
```bash
# Build and deploy
npm run build
# Upload dist/ folder to Netlify
```

### Option 3: Traditional Hosting
```bash
# Build for production
npm run build

# Upload dist/ folder to your web server
# Configure nginx/apache to serve React app
```

### Option 4: Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=https://your-api.com/api/admin
VITE_TMDB_API_KEY=your_tmdb_key

# App Configuration
VITE_APP_NAME=CineMini Admin
VITE_APP_ENV=production
VITE_DEBUG_MODE=false

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_BULK_ACTIONS=true
```

### Customization
- **Branding**: Update logo, colors, and styling in `src/constants/theme.ts`
- **Features**: Enable/disable features via environment variables
- **API Endpoints**: Modify API base URLs for different environments

## 📱 Mobile Responsiveness

The admin panel is fully responsive and works on:
- **Desktop**: Full featured interface with sidebars
- **Tablet**: Collapsible navigation, optimized layouts
- **Mobile**: Touch-friendly interface, swipe gestures

## 🔍 Troubleshooting

### Common Issues

**Authentication Errors**
- Verify API endpoint URLs
- Check admin credentials
- Ensure backend is running

**Build Errors**
- Clear `node_modules` and reinstall
- Check Node.js version compatibility
- Verify environment variables

**Performance Issues**
- Enable production builds
- Check network connectivity
- Monitor API response times

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG_MODE=true npm run dev
```

## 📈 Performance Optimization

- **Code Splitting**: Lazy loading for better initial load times
- **Image Optimization**: Optimized poster images from TMDB
- **Caching**: API response caching with TanStack Query
- **Bundle Optimization**: Tree shaking and minification

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **API Documentation**: Refer to your CineMini backend API docs

---

Built with ❤️ for the CineMini platform. Empowering movie streaming administration with modern web technologies.