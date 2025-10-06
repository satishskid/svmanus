# She&Her Demo Access System

## Overview
The She&Her healthcare platform now includes a secure demo access system that allows controlled access to the full application for demonstrations and customer presentations.

## Demo Access Codes

The following demo codes are available for accessing the platform:

### Primary Demo Codes:
- `SHEHER2025` - Main demo access code
- `HEALTHCARE` - Healthcare industry demo
- `ENTERPRISE` - Enterprise/corporate demo
- `CORPORATE` - Corporate wellness demo

### Role-Specific Demo Codes:
- `PROVIDER` - Healthcare provider demo
- `MANAGER` - Admin/manager demo
- `HRDEMO` - HR professional demo
- `USERDEMO` - End-user demo

### Personal Demo Codes:
- `SATISH` - Personal demo code
- `DEMO123` - Simple demo code

## How It Works

1. **Demo Access Screen**: When users first visit the application, they'll see a demo access screen requiring a code
2. **Code Validation**: Enter any of the above codes to gain access
3. **24-Hour Access**: Demo access is valid for 24 hours from activation
4. **Persistent Access**: The demo code is stored locally and persists across browser sessions
5. **Visual Indicator**: Demo mode shows a yellow "🎭 Demo Access Granted" indicator

## Configuration

Demo codes are configured in environment variables:

```bash
# In .env.local
VITE_DEMO_CODES="SHEHER2025,HEALTHCARE,ENTERPRISE,CORPORATE,PROVIDER,MANAGER,HRDEMO,USERDEMO,SATISH,DEMO123"
```

## For Customers and Demos

### Sharing Demo Access:
1. Share any of the demo codes above with customers
2. They can enter the code on the demo access screen
3. They'll get full access to explore all features
4. Access expires after 24 hours for security

### Demo Features Available:
- ✅ **All Role Types**: USER, HR, PROVIDER, MANAGER
- ✅ **Complete AI Consultation Engine**
- ✅ **Corporate Contract Management**
- ✅ **Provider Network Tools**
- ✅ **Appointment Booking System**
- ✅ **Real-time Chat with AI**
- ✅ **Progressive Web App Features**

## Security Features

- **Time-Limited Access**: Demo codes expire after 24 hours
- **Environment-Based Codes**: Demo codes stored securely in environment variables
- **Local Storage Only**: Demo access stored locally, not on server
- **No Database Dependency**: Demo mode works independently of backend

## Technical Implementation

### Files Modified:
- `components/DemoAccess.tsx` - Demo access screen component
- `App.tsx` - Main app with demo access integration
- `.env.example` - Environment variable configuration
- `vite-env.d.ts` - TypeScript definitions

### Demo Access Flow:
1. User visits application
2. DemoAccess component renders if no valid demo access exists
3. User enters demo code
4. Code validated against environment variable list
5. Demo access stored in localStorage with timestamp
6. Full application loads with demo mode enabled
7. Demo indicator shows in top-left corner

## Deployment Notes

After deploying to Netlify or your hosting platform:

1. **Environment Variables**: Ensure `VITE_DEMO_CODES` is set in your deployment environment
2. **Code Updates**: If you need to change demo codes, update the environment variable and redeploy
3. **Customer Sharing**: Share any of the demo codes listed above with customers for demo access

## Support

For questions about demo access or to request additional demo codes, contact the development team.
