import { Handler } from '@netlify/functions';

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'SecurePass2025!';
const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { password, ip } = JSON.parse(event.body || '{}');

    // Check IP whitelist if configured
    if (ALLOWED_IPS.length > 0 && ip && !ALLOWED_IPS.includes(ip)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Access denied from your IP address' }),
      };
    }

    // Check password
    if (password === SITE_PASSWORD) {
      // Generate a temporary access token (in production, use JWT or similar)
      const accessToken = Buffer.from(`${Date.now()}:${password}`).toString('base64');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          accessToken,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        }),
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid password' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  }
};
