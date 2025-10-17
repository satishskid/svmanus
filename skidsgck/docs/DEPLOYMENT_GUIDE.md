# SKIDS EYEAR - Deployment Guide
**Version:** 1.0.0  
**Date:** October 17, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Admin Portal Deployment](#admin-portal-deployment)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [Backend Services](#backend-services)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

---

## Overview

SKIDS EYEAR consists of three deployable components:

1. **Admin Portal** - React/Vite PWA (web application)
2. **Mobile App** - React Native/Expo (iOS/Android)
3. **Backend Scripts** - Node.js utilities (optional)

### Architecture

```
┌─────────────────┐
│   Mobile App    │
│  (iOS/Android)  │
│                 │
│  - SQLite DB    │
│  - Offline-first│
└────────┬────────┘
         │
         │ File/USB Sync
         ↓
┌─────────────────┐
│  Admin Portal   │
│   (PWA/Web)     │
│                 │
│  - IndexedDB    │
│  - Service Worker
└─────────────────┘
```

---

## Prerequisites

### System Requirements

**Development Machine:**
- Node.js 18+ LTS
- npm 9+
- Git

**Admin Portal Hosting:**
- Web server (nginx, Apache, or CDN)
- HTTPS certificate (required for PWA)
- 100MB storage minimum

**Mobile App:**
- Expo account (free tier)
- Apple Developer Account ($99/year) for iOS
- Google Play Developer Account ($25 one-time) for Android

---

## Admin Portal Deployment

### Option 1: Static Hosting (Recommended)

#### Step 1: Build Production Bundle

```bash
cd admin-portal
npm install
npm run build
```

This creates an optimized production build in `admin-portal/dist/`.

**Build Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── manifest.json
├── service-worker.js
└── icons/
```

#### Step 2: Deploy to Hosting Provider

**Option A: Netlify** (Easiest)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
cd admin-portal
netlify deploy --prod --dir=dist
```

3. Configure:
   - Add `_redirects` file for SPA routing:
   ```
   /*    /index.html   200
   ```

**Option B: Vercel**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd admin-portal
vercel --prod
```

**Option C: GitHub Pages**

1. Install gh-pages:
```bash
npm install -D gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run build
npm run deploy
```

**Option D: AWS S3 + CloudFront**

1. Create S3 bucket
2. Enable static website hosting
3. Upload dist/ contents
4. Create CloudFront distribution
5. Configure HTTPS certificate

**Option E: Docker + nginx**

```dockerfile
# Dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t skids-admin-portal .
docker run -d -p 80:80 skids-admin-portal
```

#### Step 3: Verify Deployment

1. Visit your deployed URL
2. Check:
   - [ ] Application loads
   - [ ] Service worker registers
   - [ ] PWA install prompt appears (mobile/Chrome)
   - [ ] Offline functionality works
   - [ ] File upload/download works

---

### Option 2: Server Deployment

#### nginx Configuration

```nginx
server {
    listen 80;
    server_name admin.skidseyear.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.skidseyear.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/skids-admin-portal;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service worker - no cache
    location /service-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Deploy to Server

```bash
# Build
cd admin-portal
npm run build

# Upload to server
rsync -avz dist/ user@server:/var/www/skids-admin-portal/

# Restart nginx
ssh user@server 'sudo systemctl restart nginx'
```

---

## Mobile App Deployment

### Development Build

```bash
cd app
npm install
npx expo start
```

### Production Build

#### iOS App Store

**Prerequisites:**
- Mac with Xcode
- Apple Developer Account
- iOS distribution certificate

**Steps:**

1. Configure app.json:
```json
{
  "expo": {
    "name": "SKIDS EYEAR",
    "slug": "skids-eyear",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.skids.eyear",
      "buildNumber": "1"
    }
  }
}
```

2. Build with EAS:
```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

3. Submit to App Store:
```bash
eas submit --platform ios
```

#### Android Play Store

**Prerequisites:**
- Google Play Developer Account
- Keystore file

**Steps:**

1. Configure app.json:
```json
{
  "expo": {
    "android": {
      "package": "com.skids.eyear",
      "versionCode": 1
    }
  }
}
```

2. Build with EAS:
```bash
eas build --platform android
```

3. Submit to Play Store:
```bash
eas submit --platform android
```

#### Over-the-Air (OTA) Updates

```bash
# Publish update without rebuilding
eas update --branch production --message "Bug fixes"
```

---

## Backend Services

### QR Code Generator

```bash
cd scripts
npm install

# Generate QR roster
node generate_qr_roster.js --input students.json --output roster.pdf
```

### FHIR to HL7 Converter

```bash
cd scripts
node fhir-to-hl7.js --input fhir_sample.json --output out.hl7
```

---

## Environment Configuration

### Admin Portal

Create `.env.production`:

```env
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.skidseyear.com
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### Mobile App

Create `.env.production`:

```env
EXPO_PUBLIC_API_URL=https://api.skidseyear.com
EXPO_PUBLIC_APP_ENV=production
```

---

## Monitoring & Logging

### Error Tracking (Sentry)

**Admin Portal:**

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 1.0,
});
```

**Mobile App:**

```bash
npm install @sentry/react-native
```

```javascript
// App.js
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: "production",
});
```

### Analytics

**Admin Portal (Google Analytics):**

```bash
npm install @analytics/google-analytics analytics
```

```javascript
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

const analytics = Analytics({
  app: 'skids-eyear',
  plugins: [
    googleAnalytics({
      trackingId: 'G-XXXXXXXXXX'
    })
  ]
});
```

### Uptime Monitoring

**Recommended Services:**
- UptimeRobot (free tier)
- Pingdom
- StatusCake

**Configure alerts for:**
- Admin portal downtime
- SSL certificate expiration
- Performance degradation

---

## Backup & Recovery

### IndexedDB Backup

Users can export their data:
```javascript
// Manual export through Data Manager screen
dataManagerService.exportData('json');
```

### Automated Backup Strategy

1. **User-initiated exports** (recommended)
   - Users export data periodically
   - Store in secure cloud storage

2. **Server-side sync** (future enhancement)
   - Periodic background sync to server
   - Encrypted backups

### Disaster Recovery

**Scenario 1: Data Loss**
- Users restore from their last export
- School maintains backup exports

**Scenario 2: Server Failure**
- Deploy from Git repository
- Restore from hosting provider backup

**Scenario 3: Mobile App Data Loss**
- SQLite database backed up to device storage
- Export to external storage recommended

---

## SSL/TLS Configuration

### Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d admin.skidseyear.com

# Auto-renewal (cron job)
0 0 1 * * certbot renew --quiet
```

---

## Performance Optimization

### Enable Compression

**nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Enable HTTP/2

```nginx
listen 443 ssl http2;
```

### CDN Configuration

**CloudFlare:**
1. Add site to CloudFlare
2. Update DNS to CloudFlare nameservers
3. Enable Auto Minify (JS, CSS, HTML)
4. Enable Brotli compression
5. Set cache TTL

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] Security headers configured
- [ ] CORS policy set
- [ ] CSP (Content Security Policy) configured
- [ ] No sensitive data in client-side code
- [ ] Regular dependency updates
- [ ] npm audit run regularly

### Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## Rollback Procedure

### Admin Portal

```bash
# Tag current version
git tag v1.0.1

# Rollback to previous version
git checkout v1.0.0
npm run build
# Deploy dist/ folder
```

### Mobile App

```bash
# Revert OTA update
eas update:republish --branch production --group <previous-group-id>

# Rollback native build
# Resubmit previous build to app stores
```

---

## Health Checks

### Admin Portal

```bash
# Check if service worker is registered
curl https://admin.skidseyear.com/service-worker.js

# Check manifest
curl https://admin.skidseyear.com/manifest.json

# Check app loads
curl -I https://admin.skidseyear.com
```

### Mobile App

```bash
# Check Expo status
eas build:list

# Check updates
eas update:list --branch production
```

---

## Troubleshooting

### Common Issues

**1. Service Worker Not Updating**
```javascript
// Clear old service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

**2. PWA Not Installing**
- Verify HTTPS is enabled
- Check manifest.json is accessible
- Verify all PWA criteria met
- Check browser console for errors

**3. File Upload Not Working**
- Check MIME type restrictions
- Verify file size limits
- Check CORS policy

**4. Mobile App Crash**
- Check Sentry for error logs
- Verify native dependencies installed
- Clear app cache

**5. Build Failures**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist/`
- Check Node.js version

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (mobile: 77/77, admin: 60/60, e2e: TBD)
- [ ] Code reviewed
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Environment variables configured
- [ ] SSL certificate valid
- [ ] Backup taken

### Deployment

- [ ] Build production bundle
- [ ] Deploy to hosting
- [ ] Verify deployment
- [ ] Run smoke tests
- [ ] Monitor for errors

### Post-Deployment

- [ ] Verify in production
- [ ] Check monitoring dashboards
- [ ] Notify stakeholders
- [ ] Update documentation
- [ ] Tag release in Git

---

## Support & Maintenance

### Update Schedule

- **Security patches:** Immediate
- **Bug fixes:** Weekly
- **Feature updates:** Monthly
- **Major versions:** Quarterly

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Audit security
npm audit fix
```

---

## Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Expo Build Guide](https://docs.expo.dev/build/introduction/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

## Contact & Support

- **Technical Issues:** [GitHub Issues]
- **Security Concerns:** security@skidseyear.com
- **General Support:** support@skidseyear.com

---

**Last Updated:** October 17, 2025  
**Next Review:** January 2026
