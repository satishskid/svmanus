import { Handler } from '@netlify/functions';

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'SecurePass2025!';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid authorization header' }),
      };
    }

    const token = authHeader.split(' ')[1];

    try {
      // Decode the token (basic implementation)
      const decoded = Buffer.from(token, 'base64').toString();
      const [timestamp, password] = decoded.split(':');

      // Check if token is expired (24 hours)
      if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token expired' }),
        };
      }

      // Verify password matches
      if (password === SITE_PASSWORD) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ valid: true }),
        };
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' }),
        };
      }
    } catch (decodeError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token format' }),
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
