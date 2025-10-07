# 🔐 Password Authentication System - Maintenance Guide

## Current Password
**Current Password**: `SheHerSecure2025!`

This password provides access to the She&Her Healthcare Platform at `https://sheandher.netlify.app`.

## Changing the Password

### Method 1: Netlify Dashboard (Recommended)
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Navigate to your site: **sheandher**
3. Go to **Site settings** → **Environment variables**
4. Find `SITE_PASSWORD` variable
5. Click **Edit** and update the value
6. Click **Save**
7. **Important**: The new password takes effect immediately on the live site

### Method 2: Netlify CLI
```bash
# Set new password for production
netlify env:set SITE_PASSWORD "YourNewSecurePassword!" --context production

# Set for all contexts (production, deploy-preview, branch-deploy)
netlify env:set SITE_PASSWORD "YourNewSecurePassword!" --context production
netlify env:set SITE_PASSWORD "YourNewSecurePassword!" --context deploy-preview
netlify env:set SITE_PASSWORD "YourNewSecurePassword!" --context branch-deploy
```

## Security Best Practices

### Password Requirements
- **Minimum 12 characters** (recommended)
- **Mix of uppercase and lowercase** letters
- **Include numbers and special characters**
- **Change every 30-90 days**
- **Never use common words or personal information**

### Additional Security Measures

#### IP Whitelisting (Optional)
To restrict access to specific IP addresses:
```bash
netlify env:set ALLOWED_IPS "1.2.3.4,5.6.7.8,9.10.11.12"
```

#### Token Expiration
- Current setting: **24 hours**
- Tokens automatically expire after this period
- Users must re-authenticate after expiration

## Monitoring & Logs

### Access Monitoring
- **Function Logs**: https://app.netlify.com/projects/sheandher/logs/functions
- **Deploy Logs**: https://app.netlify.com/projects/sheandher/deploys/

### Security Events to Monitor
- Failed authentication attempts
- Token expiration patterns
- Unusual access times/locations

## Emergency Procedures

### If Password is Compromised
1. **Immediately change the password** via Netlify dashboard
2. **Clear all existing tokens** (users will need to re-authenticate)
3. **Review access logs** for suspicious activity
4. **Consider enabling IP whitelisting** for additional security

### Development Access
- **Demo mode** still available for development/testing
- **Bypass password** using demo access codes during development
- **Local development** doesn't require password authentication

## Maintenance Schedule

### Regular Tasks
- [ ] **Weekly**: Review function logs for failed attempts
- [ ] **Monthly**: Change password (recommended)
- [ ] **Quarterly**: Review and update security settings
- [ ] **As needed**: Update password after sharing with new team members

### Backup Access
Keep a secure record of the current password in your password manager or secure location.

---

**Last Updated**: $(date)
**Maintained by**: Development Team
**Contact**: [Your Contact Information]
