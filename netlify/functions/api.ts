// netlify/functions/api.ts
import { handle } from '@hono/netlify';
import { app } from '../../server'; // Imports your existing Hono app

// This is the main entry point for Netlify's serverless functions
export const handler = handle(app);