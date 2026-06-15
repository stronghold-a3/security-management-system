# Environment Configuration Guide

## Overview

The Security Management System supports multiple environments with different configurations. Each environment can have specific settings for security, performance, compliance, and features.

## Environment Files

### File Structure
```
.env                    # Shared defaults
.env.local             # Local overrides (gitignored)
.env.development       # Development environment
.env.staging           # Staging environment
.env.production        # Production environment
```

### Priority Order (highest to lowest)
1. `.env.{environment}.local` (if exists)
2. `.env.local`
3. `.env.{environment}`
4. `.env`

## Environment Variables

### Application Configuration

```env
# App Identity
VITE_APP_NAME=Security Management System
VITE_APP_VERSION=1.0.0

# Environment
NODE_ENV=production              # development, staging, production
VITE_LOG_LEVEL=info             # debug, info, warn, error
```

### API Configuration

```env
# API Endpoints
VITE_API_BASE_URL=https://api.strongholda3.com
VITE_API_TIMEOUT=30000          # milliseconds

# Audit Logs
VITE_AUDIT_LOG_ENDPOINT=/api/audit-logs
VITE_LOG_ENDPOINT=/api/logs
```

### Supabase Configuration

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Security Configuration

```env
# HTTPS & CORS
VITE_ENABLE_HTTPS=true
VITE_CORS_ORIGINS=https://strongholda3.com,https://www.strongholda3.com
VITE_RATE_LIMIT_WINDOW=900000   # 15 minutes
VITE_RATE_LIMIT_MAX=100         # requests per window

# CSP Report
VITE_CSP_REPORT_URI=https://api.strongholda3.com/csp-report
```

### Monitoring & Error Tracking

```env
# Sentry
VITE_SENTRY_DSN=https://your_key@sentry.io/project_id
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### Feature Flags

```env
# Features
VITE_FEATURE_SMS_GATEWAY=true
VITE_FEATURE_VIBER=true
VITE_FEATURE_RADIO_MESH=true
VITE_FEATURE_OFFLINE=true
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_BULK_OPS=true

# Service Worker
VITE_ENABLE_SW=true
VITE_ENABLE_SW_DEV=false        # Enable in development
```

### Compliance & Organization

```env
# DOLE DO-174 Compliance
VITE_DOLE_REG_NUMBER=DO-174-XXXXX
VITE_ORG_NAME=Stronghold A3 Security Agency
VITE_ORG_TAX_ID=123-456-789-000
VITE_ORG_LOCATION=Eastern Visayas, Philippines
```

### Performance

```env
# React Query
VITE_QUERY_STALE_TIME=300000    # 5 minutes
VITE_QUERY_GC_TIME=600000       # 10 minutes

# Caching
VITE_CACHE_TTL=3600             # seconds
```

## Environment Profiles

### Development

```env
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001
VITE_LOG_LEVEL=debug
VITE_ENABLE_HTTPS=false
VITE_ENABLE_SW_DEV=false
VITE_SENTRY_TRACES_SAMPLE_RATE=1.0
```

### Staging

```env
NODE_ENV=staging
VITE_API_BASE_URL=https://staging-api.strongholda3.com
VITE_LOG_LEVEL=info
VITE_ENABLE_HTTPS=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.5
```

### Production

```env
NODE_ENV=production
VITE_API_BASE_URL=https://api.strongholda3.com
VITE_LOG_LEVEL=error
VITE_ENABLE_HTTPS=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_ENABLE_SW=true
```

## Database Configuration

### Supabase

```env
# Connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Features
SUPABASE_JS_VERSION=2.0
```

### Backups

```env
# Daily Backups
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *       # 2 AM daily (cron format)
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION_KEY=your_key_here
```

## Deployment Configuration

### CI/CD

```env
# GitHub Actions
GH_ACTION_VERSION=v4
DEPLOY_KEY_PASSPHRASE=your_passphrase

# Slack Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Infrastructure

```env
# Database
DATABASE_URL=postgresql://user:pass@db.host:5432/sms_db
DB_SSL_MODE=require
DB_CONNECTION_POOL_MIN=5
DB_CONNECTION_POOL_MAX=20

# Redis Cache
REDIS_URL=redis://cache.strongholda3.com:6379
REDIS_TLS=true
CACHE_TTL_SECONDS=3600

# CDN
CDN_URL=https://cdn.strongholda3.com
STATIC_ASSETS_PATH=https://cdn.strongholda3.com/assets
```

## Security Best Practices

### ✅ Do

- Use strong, unique values for secrets
- Rotate secrets regularly
- Use `.env.local` for local development
- Store secrets in GitHub Actions Secrets
- Document all custom variables
- Use environment-specific configurations

### ❌ Don't

- Commit `.env.local` to version control
- Commit `.env.production` to version control
- Use weak or predictable secret values
- Expose API keys in logs
- Use same secrets across environments
- Share `.env` files via email

## Setup Instructions

### 1. Clone Example
```bash
cp .env.example .env.local
```

### 2. Add Secrets
Edit `.env.local` and add:
- Supabase credentials
- Sentry DSN
- API keys
- Organization details

### 3. Validate Configuration
```bash
npm run validate-env
```

### 4. Verify in Browser Console
```javascript
// Check config is loaded
console.log(import.meta.env)
```

## Troubleshooting

### Variables Not Loading
- Check file names are exact (case-sensitive)
- Ensure format: `VITE_VARIABLE_NAME=value`
- Restart dev server after changing .env
- Clear `.vite` cache: `rm -rf node_modules/.vite`

### Secrets Not Available
- Use `VITE_` prefix for frontend variables
- Backend variables don't need prefix
- Check GitHub Actions secrets are set
- Verify environment name is correct

### CORS Issues
- Add domain to `VITE_CORS_ORIGINS`
- Use comma-separated list
- Restart dev server
- Check trailing slashes

## GitHub Actions Secrets

Set these in repository Settings > Secrets:

```
DEPLOY_KEY              # SSH private key
DEPLOY_HOST             # Deployment server host
DEPLOY_USER             # Deployment user
SLACK_WEBHOOK           # Slack notification webhook
SENTRY_DSN              # Sentry error tracking
VITE_SUPABASE_KEY       # Supabase anonymous key
```

## CI/CD Environment Variables

GitHub Actions uses secrets for sensitive data:

```yaml
env:
  VITE_API_BASE_URL: https://api.strongholda3.com
  VITE_APP_VERSION: ${{ github.ref_name }}
secrets:
  VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

For more information, see the main README.md
