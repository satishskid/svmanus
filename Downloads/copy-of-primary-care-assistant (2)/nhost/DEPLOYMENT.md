# Primary Care AI Assistant - Nhost Deployment Guide

This guide will walk you through deploying the Primary Care AI Assistant to Nhost.

## Prerequisites

1. **Nhost Account**: Create an account at [nhost.io](https://nhost.io)
2. **Google Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com)

## Step 1: Create Nhost Project

1. **Login to Nhost**: Visit [nhost.io](https://nhost.io) and sign in
2. **Create New Project**: Click "Create Project" and choose a name
3. **Note Your Credentials**: Copy your project's:
   - Subdomain (e.g., `abc123def456`)
   - Region (e.g., `us-east-1`)

## Step 2: Set up Database Schema

1. **Access Hasura Console**: In your Nhost project dashboard, click "Hasura Console"
2. **Go to Data Tab**: Click on the "Data" tab
3. **Run SQL**: Click "SQL" in the left sidebar
4. **Execute Schema**: Copy the contents of `migrations/001_initial_schema.sql` and paste it into the SQL editor
5. **Run Query**: Click "Run!" to create the database schema

## Step 3: Deploy Serverless Functions

### Option 1: Using Nhost CLI (Recommended)

1. **Install Nhost CLI**: 
   ```bash
   npm install -g @nhost/cli
   ```

2. **Initialize Project**:
   ```bash
   nhost init
   ```

3. **Copy Functions**: Copy all files from `nhost/functions/` to your project's `functions/` directory

4. **Deploy**:
   ```bash
   nhost deploy
   ```

### Option 2: Manual Upload via Dashboard

1. **Access Functions**: In your Nhost project dashboard, go to "Functions"
2. **Create Function**: For each function in `nhost/functions/`, create a new function:
   - `symptom-checker/initial-assessment`
   - `symptom-checker/provisional-diagnosis`
   - `symptom-checker/suggest-tests`
   - `symptom-checker/refine-diagnosis`
   - `symptom-checker/doctor-notes`
   - `marketplace/submit-application`
3. **Copy Code**: Copy the TypeScript code from each file into the corresponding function

## Step 4: Configure Environment Variables

1. **Access Settings**: In your Nhost project dashboard, go to "Settings" → "Environment Variables"
2. **Add API Key**: Create a new environment variable:
   - Name: `API_KEY`
   - Value: Your Google Gemini API key
   - Make sure it's available in both development and production

## Step 5: Configure Frontend

1. **Update Configuration**: Open `index.tsx` in the root project
2. **Replace Placeholders**: Update these values:
   ```typescript
   const NHOST_SUBDOMAIN = 'your-actual-subdomain'; // e.g., 'abc123def456'
   const NHOST_REGION = 'your-actual-region';       // e.g., 'us-east-1'
   ```

## Step 6: Test Your Deployment

1. **Start Frontend**: Run `npm run dev` to start the development server
2. **Test Features**:
   - Try the symptom checker
   - Test the marketplace onboarding
   - Verify the doctor's console works

## Step 7: Go Live (Optional)

### Deploy Frontend

You can deploy the frontend to any static hosting service:

- **Vercel**: `npm run build` then deploy the `dist/` folder
- **Netlify**: Connect your Git repository for automatic deployments
- **GitHub Pages**: Use GitHub Actions to build and deploy

### Custom Domain (Optional)

1. **Configure Domain**: In Nhost dashboard, go to "Settings" → "Custom Domains"
2. **Add Domain**: Follow the instructions to add your custom domain

## Troubleshooting

### Common Issues

1. **Function Errors**: Check the function logs in the Nhost dashboard
2. **Database Connection**: Verify your schema was applied correctly in Hasura Console
3. **API Key Issues**: Make sure the `API_KEY` environment variable is set correctly
4. **CORS Issues**: Nhost handles CORS automatically, but check if your domain is whitelisted

### Getting Help

- **Nhost Documentation**: [docs.nhost.io](https://docs.nhost.io)
- **Community Discord**: Join the Nhost Discord community
- **GitHub Issues**: Check the Nhost GitHub repository for known issues

## Security Notes

- Never expose your Google Gemini API key in the frontend
- All AI calls are processed securely in the serverless functions
- Nhost provides built-in authentication and security features
- Consider enabling rate limiting for production use

## Next Steps

Once deployed, your Primary Care AI Assistant will be fully functional with:

- ✅ Patient symptom checking with AI chat
- ✅ Clinic selection and appointment booking
- ✅ Doctor's console with AI assistance
- ✅ Marketplace for healthcare providers
- ✅ Real-time order tracking
- ✅ Secure, scalable backend infrastructure

Congratulations! Your AI-powered healthcare platform is now live! 🎉
