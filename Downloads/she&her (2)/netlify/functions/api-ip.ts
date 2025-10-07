import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get client IP from various possible sources
    const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               event.headers['x-real-ip'] ||
               'unknown';

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ip }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({ error: 'Internal server error', ip: 'unknown' }),
    };
  }
};
