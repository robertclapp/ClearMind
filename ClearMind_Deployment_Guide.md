# ClearMind Deployment Guide

**Version:** 1.0.0  
**Last Updated:** December 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Deployment Options](#deployment-options)
3. [Manus Platform Deployment (Recommended)](#manus-platform-deployment)
4. [Alternative Deployment (Vercel + Supabase)](#alternative-deployment)
5. [Electron Desktop App](#electron-desktop-app)
6. [iOS App (PWA)](#ios-app-pwa)
7. [Environment Configuration](#environment-configuration)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Overview

ClearMind is designed for flexible deployment across multiple platforms:

- **Web App** (Primary): Works on all devices via browser
- **Desktop App**: Electron wrapper for Windows, Mac, Linux
- **Mobile App**: PWA installable on iOS and Android

This guide covers all deployment scenarios with step-by-step instructions.

---

## Deployment Options

### Option 1: Manus Platform (Recommended for Solo Developers)

**Pros:**
- ✅ Zero configuration
- ✅ Built-in database, storage, authentication
- ✅ Automatic SSL/HTTPS
- ✅ One-click deployment
- ✅ Custom domain support
- ✅ Automatic backups
- ✅ Free tier available

**Cons:**
- ❌ Vendor lock-in
- ❌ Limited customization

**Best for:** Solo developers, rapid prototyping, MVP launch

### Option 2: Vercel + Supabase

**Pros:**
- ✅ Industry-standard stack
- ✅ Generous free tiers
- ✅ Excellent performance
- ✅ Full control
- ✅ Easy scaling

**Cons:**
- ❌ More configuration required
- ❌ Multiple services to manage
- ❌ Need to implement OAuth

**Best for:** Production apps, teams, scaling beyond MVP

### Option 3: Self-Hosted

**Pros:**
- ✅ Complete control
- ✅ No vendor lock-in
- ✅ Cost-effective at scale

**Cons:**
- ❌ Requires DevOps expertise
- ❌ Manual maintenance
- ❌ Security responsibility

**Best for:** Enterprise, privacy-sensitive use cases

---

## Manus Platform Deployment

### Prerequisites

1. Manus account (sign up at https://manus.im)
2. ClearMind project initialized
3. Code committed to repository

### Step 1: Create Checkpoint

Before deploying, create a checkpoint to save the current state:

```bash
# Via Manus AI or Management UI
# This creates a versioned snapshot of your code
```

**In Management UI:**
1. Open your ClearMind project
2. Click "Save Checkpoint" button
3. Enter description: "Production v1.0.0"
4. Click "Save"

### Step 2: Configure Environment

**Required Environment Variables** (automatically injected by Manus):
- `DATABASE_URL` - MySQL/TiDB connection
- `JWT_SECRET` - Session signing
- `VITE_APP_ID` - OAuth app ID
- `OAUTH_SERVER_URL` - OAuth backend
- `BUILT_IN_FORGE_API_URL` - Manus APIs
- `BUILT_IN_FORGE_API_KEY` - API auth

**Optional Custom Variables:**
Add via Settings → Secrets:
- `CUSTOM_DOMAIN` - Your custom domain
- `ANALYTICS_ID` - Analytics tracking ID
- Any other app-specific variables

### Step 3: Deploy

**Via Management UI:**
1. Navigate to latest checkpoint
2. Click "Publish" button in header
3. Review deployment settings
4. Click "Confirm Deployment"
5. Wait for deployment to complete (usually 2-5 minutes)

**Deployment Process:**
1. Build frontend (Vite)
2. Build backend (esbuild)
3. Run database migrations
4. Upload assets to CDN
5. Start server
6. Health check
7. Route traffic to new version

### Step 4: Verify Deployment

**Check Deployment Status:**
1. Go to Dashboard in Management UI
2. View deployment logs
3. Check health status
4. Test deployed URL

**Test Checklist:**
- [ ] Homepage loads
- [ ] Login works
- [ ] Create page works
- [ ] Create database works
- [ ] Timeline loads
- [ ] Settings accessible
- [ ] No console errors

### Step 5: Configure Custom Domain (Optional)

**Purchase Domain:**
1. Go to Settings → Domains
2. Click "Purchase Domain"
3. Search for available domain
4. Complete purchase

**Or Bind Existing Domain:**
1. Go to Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

**DNS Configuration:**
```
Type: CNAME
Name: @
Value: your-app.manus.space
TTL: 3600
```

### Step 6: Enable Analytics (Optional)

Manus provides built-in analytics:
1. Go to Dashboard
2. View UV/PV metrics
3. See user activity
4. Track page views

### Rollback Procedure

If deployment has issues:

1. Go to Dashboard
2. Find previous checkpoint
3. Click "Rollback" button
4. Confirm rollback
5. Wait for rollback to complete

---

## Alternative Deployment (Vercel + Supabase)

### Prerequisites

1. Vercel account (https://vercel.com)
2. Supabase account (https://supabase.com)
3. GitHub repository with code
4. Node.js 22+ installed locally

### Step 1: Set Up Supabase Database

**Create Project:**
1. Log in to Supabase
2. Click "New Project"
3. Enter project name: "clearmind"
4. Choose region (closest to users)
5. Generate strong database password
6. Click "Create Project"

**Run Migrations:**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Push schema
cd /path/to/clearmind
pnpm db:push
```

**Get Connection String:**
1. Go to Project Settings → Database
2. Copy "Connection string" under "Connection pooling"
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save for later

### Step 2: Set Up Supabase Storage

**Create Storage Bucket:**
1. Go to Storage in Supabase dashboard
2. Click "New Bucket"
3. Name: "clearmind-files"
4. Public bucket: Yes
5. Click "Create Bucket"

**Configure CORS:**
```sql
-- Run in SQL Editor
ALTER TABLE storage.buckets
SET (
  public = true,
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf']
);
```

**Get Storage URL:**
```
https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/clearmind-files/
```

### Step 3: Set Up OAuth

**Option A: Use Supabase Auth**
```typescript
// Install Supabase client
pnpm add @supabase/supabase-js

// Update server/_core/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Implement OAuth flow
```

**Option B: Use NextAuth.js**
```bash
pnpm add next-auth
```

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});
```

### Step 4: Deploy to Vercel

**Connect Repository:**
1. Log in to Vercel
2. Click "New Project"
3. Import your GitHub repository
4. Select "clearmind" repo
5. Click "Import"

**Configure Build Settings:**
- Framework Preset: Vite
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

**Add Environment Variables:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-random-secret-here
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-key-here
VITE_APP_URL=https://your-app.vercel.app
```

**Deploy:**
1. Click "Deploy"
2. Wait for build to complete
3. Test deployment URL

### Step 5: Configure Custom Domain

**Add Domain in Vercel:**
1. Go to Project Settings → Domains
2. Enter your domain
3. Click "Add"
4. Follow DNS configuration instructions

**DNS Configuration:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 6: Set Up CI/CD

GitHub Actions is already configured (`.github/workflows/ci.yml`).

**Enable in GitHub:**
1. Go to repository Settings → Actions
2. Enable "Allow all actions"
3. Push to `main` branch triggers production deploy
4. Push to `develop` branch triggers staging deploy

---

## Electron Desktop App

### Prerequisites

1. Node.js 22+
2. Electron knowledge
3. Code signing certificates (for distribution)

### Step 1: Install Electron

```bash
cd /path/to/clearmind
pnpm add -D electron electron-builder
```

### Step 2: Create Electron Main Process

**File:** `electron/main.js`

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### Step 3: Configure Electron Builder

**File:** `electron-builder.json`

```json
{
  "appId": "com.clearmind.app",
  "productName": "ClearMind",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "target": ["dmg", "zip"],
    "icon": "assets/icon.icns"
  },
  "win": {
    "target": ["nsis", "portable"],
    "icon": "assets/icon.ico"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "category": "Office",
    "icon": "assets/icon.png"
  }
}
```

### Step 4: Add Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "electron:dev": "concurrently \"pnpm dev\" \"wait-on http://localhost:3000 && electron electron/main.js\"",
    "electron:build": "pnpm build && electron-builder",
    "electron:build:mac": "pnpm build && electron-builder --mac",
    "electron:build:win": "pnpm build && electron-builder --win",
    "electron:build:linux": "pnpm build && electron-builder --linux"
  }
}
```

### Step 5: Build and Distribute

**Build for Current Platform:**
```bash
pnpm electron:build
```

**Build for All Platforms:**
```bash
pnpm electron:build:mac
pnpm electron:build:win
pnpm electron:build:linux
```

**Output:**
- macOS: `release/ClearMind-1.0.0.dmg`
- Windows: `release/ClearMind Setup 1.0.0.exe`
- Linux: `release/ClearMind-1.0.0.AppImage`

### Step 6: Code Signing (Optional but Recommended)

**macOS:**
```bash
# Get Apple Developer certificate
# Add to Keychain
# Configure in electron-builder.json
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)"
  }
}
```

**Windows:**
```bash
# Get code signing certificate
# Configure in electron-builder.json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

### Step 7: Auto-Update (Optional)

**Install:**
```bash
pnpm add electron-updater
```

**Configure:**
```javascript
// electron/main.js
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});
```

---

## iOS App (PWA)

### Prerequisites

1. HTTPS domain
2. Service worker
3. Web app manifest

### Step 1: Create Web App Manifest

**File:** `public/manifest.json`

```json
{
  "name": "ClearMind",
  "short_name": "ClearMind",
  "description": "Neurodivergent-first productivity platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "business"],
  "screenshots": [
    {
      "src": "/screenshot-1.png",
      "sizes": "1170x2532",
      "type": "image/png"
    }
  ]
}
```

### Step 2: Add Manifest to HTML

**File:** `index.html`

```html
<head>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#3b82f6">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="ClearMind">
  <link rel="apple-touch-icon" href="/icon-180.png">
</head>
```

### Step 3: Create Service Worker

**File:** `public/sw.js`

```javascript
const CACHE_NAME = 'clearmind-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Step 4: Register Service Worker

**File:** `client/src/main.tsx`

```typescript
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

### Step 5: Test PWA

**Chrome DevTools:**
1. Open DevTools
2. Go to Application tab
3. Check Manifest
4. Check Service Workers
5. Run Lighthouse audit

**Install on iOS:**
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen

### Step 6: PWA Checklist

- [ ] HTTPS enabled
- [ ] Manifest.json present
- [ ] Service worker registered
- [ ] Icons (192x192, 512x512)
- [ ] Apple touch icon (180x180)
- [ ] Offline functionality works
- [ ] Lighthouse PWA score > 90

---

## Environment Configuration

### Development Environment

**File:** `.env.development`

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/clearmind_dev

# Auth
JWT_SECRET=dev-secret-change-in-production
OAUTH_SERVER_URL=http://localhost:3001

# APIs
OPENAI_API_KEY=sk-your-dev-key
VITE_APP_URL=http://localhost:3000

# Storage
S3_BUCKET=clearmind-dev
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

### Production Environment

**File:** `.env.production` (DO NOT COMMIT)

```bash
# Database
DATABASE_URL=mysql://user:password@production-db:3306/clearmind

# Auth
JWT_SECRET=super-secure-random-string-here
OAUTH_SERVER_URL=https://auth.clearmind.app

# APIs
OPENAI_API_KEY=sk-your-production-key
VITE_APP_URL=https://clearmind.app

# Storage
S3_BUCKET=clearmind-production
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

### Environment Variable Management

**Use Environment Variable Service:**
- Vercel: Project Settings → Environment Variables
- Manus: Settings → Secrets
- Supabase: Project Settings → API

**Never commit:**
- `.env.production`
- `.env.local`
- Any file with secrets

**Always commit:**
- `.env.example` (template without secrets)

---

## Post-Deployment Checklist

### Functionality Testing

- [ ] User registration works
- [ ] User login works
- [ ] Create workspace works
- [ ] Create page works
- [ ] Edit page works
- [ ] Create database works
- [ ] Add database items works
- [ ] Timeline events work
- [ ] Settings save correctly
- [ ] Sensory profiles switch correctly
- [ ] AI features work
- [ ] File uploads work
- [ ] Search works
- [ ] Offline mode works
- [ ] Sync works when back online

### Performance Testing

- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Lighthouse Performance score > 90
- [ ] No console errors
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Bundle size reasonable

### Security Testing

- [ ] HTTPS enabled
- [ ] CSP headers set
- [ ] CORS configured correctly
- [ ] XSS protection enabled
- [ ] SQL injection protection
- [ ] Rate limiting enabled
- [ ] Authentication required for protected routes
- [ ] JWT tokens expire correctly
- [ ] Passwords hashed (if applicable)
- [ ] Secrets not exposed in client

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Semantic HTML used
- [ ] Forms have labels
- [ ] Error messages clear
- [ ] Reduced motion respected

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Mobile Testing

- [ ] Responsive design works
- [ ] Touch targets large enough
- [ ] Gestures work correctly
- [ ] Viewport meta tag set
- [ ] PWA installable
- [ ] Offline mode works

---

## Monitoring & Maintenance

### Application Monitoring

**Set Up Sentry:**
```bash
pnpm add @sentry/react @sentry/node
```

```typescript
// client/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

**Set Up Analytics:**
```typescript
// Use Manus built-in analytics or Google Analytics
import { analytics } from './lib/analytics';

analytics.track('page_view', {
  page: window.location.pathname
});
```

### Database Monitoring

**Monitor Query Performance:**
```sql
-- Slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Check slow queries
SELECT * FROM mysql.slow_log;
```

**Monitor Database Size:**
```sql
SELECT 
  table_schema AS 'Database',
  SUM(data_length + index_length) / 1024 / 1024 AS 'Size (MB)'
FROM information_schema.tables
GROUP BY table_schema;
```

### Uptime Monitoring

**Use Uptime Robot or Similar:**
1. Create account at https://uptimerobot.com
2. Add monitor for your domain
3. Set check interval (5 minutes)
4. Configure alerts (email, SMS, Slack)

### Log Aggregation

**Use LogTail or Similar:**
```bash
pnpm add winston
```

```typescript
// server/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Backup Strategy

**Database Backups:**
- Automated daily backups (Manus/Supabase handle this)
- Weekly manual backups
- Test restore procedure monthly

**Code Backups:**
- Git repository (GitHub/GitLab)
- Multiple branches (main, develop, staging)
- Tagged releases

**User Data Backups:**
- Export functionality for users
- Admin backup scripts
- Offsite backup storage

---

## Troubleshooting

### Common Issues

#### "Database connection failed"

**Cause:** Incorrect DATABASE_URL or database not accessible

**Solution:**
1. Verify DATABASE_URL in environment variables
2. Check database is running
3. Verify network connectivity
4. Check firewall rules

#### "OAuth callback error"

**Cause:** OAuth configuration mismatch

**Solution:**
1. Verify OAUTH_SERVER_URL is correct
2. Check callback URL matches OAuth provider
3. Verify OAuth credentials
4. Check CORS settings

#### "Build fails"

**Cause:** TypeScript errors or missing dependencies

**Solution:**
```bash
# Clear cache
rm -rf node_modules .next dist
pnpm install

# Check TypeScript
pnpm check

# Try build again
pnpm build
```

#### "Slow page load"

**Cause:** Unoptimized assets or slow queries

**Solution:**
1. Run Lighthouse audit
2. Optimize images (WebP, lazy loading)
3. Enable caching
4. Add database indexes
5. Use CDN for static assets

#### "Offline mode not working"

**Cause:** Service worker not registered or IndexedDB issues

**Solution:**
1. Check service worker in DevTools
2. Verify IndexedDB is enabled
3. Check browser compatibility
4. Clear cache and retry

### Getting Help

**Documentation:**
- ClearMind Technical Blueprint
- Manus Documentation: https://docs.manus.im
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs

**Community:**
- GitHub Issues: Report bugs and feature requests
- Discord: Join ClearMind community
- Stack Overflow: Tag questions with `clearmind`

**Support:**
- Email: support@clearmind.app
- Twitter: @clearmindapp

---

## Conclusion

This deployment guide provides comprehensive instructions for deploying ClearMind across multiple platforms:

1. **Manus Platform**: Fastest and easiest for solo developers
2. **Vercel + Supabase**: Industry-standard stack for production
3. **Electron**: Desktop app for Windows, Mac, Linux
4. **PWA**: Mobile app for iOS and Android

Choose the deployment option that best fits your needs, follow the step-by-step instructions, and use the checklists to ensure a successful deployment.

**Recommended Path for Solo Developer:**
1. Start with Manus Platform for rapid MVP launch
2. Gather user feedback
3. Iterate on features
4. Scale to Vercel + Supabase when needed
5. Add Electron and PWA for broader reach

Good luck with your deployment! 🚀
