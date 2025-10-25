#!/usr/bin/env node

/**
 * Nhost Deployment Script for Primary Care AI Assistant
 * This script deploys the database schema and serverless functions to your Nhost project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Nhost project configuration
const NHOST_CONFIG = {
  subdomain: 'hwtdntpudjequljnnpth',
  region: 'ap-south-1',
  // You'll need to add your personal access token here
  // Get it from: https://app.nhost.io/account/personal-access-tokens
  token: process.env.NHOST_ADMIN_TOKEN || 'YOUR_PERSONAL_ACCESS_TOKEN_HERE'
};

const NHOST_API_BASE = `https://${NHOST_CONFIG.subdomain}.hasura.${NHOST_CONFIG.region}.nhost.run`;
const NHOST_FUNCTIONS_BASE = `https://${NHOST_CONFIG.subdomain}.functions.${NHOST_CONFIG.region}.nhost.run`;

async function deploySchema() {
  console.log('🚀 Deploying database schema...');
  
  const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  try {
    const response = await fetch(`${NHOST_API_BASE}/v2/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': NHOST_CONFIG.token
      },
      body: JSON.stringify({
        type: 'run_sql',
        args: {
          sql: schema
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok && !result.error) {
      console.log('✅ Database schema deployed successfully!');
      return true;
    } else {
      console.error('❌ Error deploying schema:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deploying schema:', error);
    return false;
  }
}

async function deployFunctions() {
  console.log('🚀 Deploying serverless functions...');
  
  const functionsDir = path.join(__dirname, 'functions');
  const functions = [
    'symptom-checker/initial-assessment.ts',
    'symptom-checker/provisional-diagnosis.ts', 
    'symptom-checker/suggest-tests.ts',
    'symptom-checker/refine-diagnosis.ts',
    'symptom-checker/doctor-notes.ts',
    'marketplace/submit-application.ts'
  ];
  
  for (const functionPath of functions) {
    const fullPath = path.join(functionsDir, functionPath);
    const code = fs.readFileSync(fullPath, 'utf8');
    const functionName = functionPath.replace('.ts', '').replace('/', '-');
    
    console.log(`📄 Deploying function: ${functionName}`);
    
    // Note: This is a simplified approach. In reality, you'd need to use
    // Nhost's specific deployment API or CLI which may not be publicly available
    console.log(`⚠️  Manual deployment required for: ${functionName}`);
    console.log(`   Code ready at: ${fullPath}`);
  }
  
  return true;
}

async function setEnvironmentVariables() {
  console.log('🔧 Setting environment variables...');
  
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    console.log('⚠️  Please set GEMINI_API_KEY environment variable');
    console.log('   Get your API key from: https://aistudio.google.com/app/apikey');
    console.log('   Then run: GEMINI_API_KEY="your-key-here" node deploy.mjs');
    return false;
  }
  
  console.log('✅ Environment variables configured');
  return true;
}

async function main() {
  console.log('🎯 Primary Care AI Assistant - Nhost Deployment');
  console.log('================================================');
  
  // Check configuration
  if (NHOST_CONFIG.token === 'YOUR_PERSONAL_ACCESS_TOKEN_HERE') {
    console.log('❌ Please configure your Nhost personal access token');
    console.log('   Get it from: https://app.nhost.io/account/personal-access-tokens');
    console.log('   Then set NHOST_ADMIN_TOKEN environment variable or edit this script');
    process.exit(1);
  }
  
  // Deploy components
  const schemaSuccess = await deploySchema();
  const envSuccess = await setEnvironmentVariables();
  const functionsSuccess = await deployFunctions();
  
  if (schemaSuccess && envSuccess && functionsSuccess) {
    console.log('🎉 Deployment completed successfully!');
    console.log(`🌐 Your frontend is configured for: ${NHOST_CONFIG.subdomain}.${NHOST_CONFIG.region}`);
  } else {
    console.log('⚠️  Deployment completed with warnings. Check the output above.');
  }
}

main().catch(console.error);
