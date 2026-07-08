import type { IncomingMessage, ServerResponse } from 'http';
import { app, connectToMongo } from '../server/app.js';

// connectToMongo() caches its connection promise internally, so calling it
// on every invocation just reuses the existing connection on warm lambdas.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await connectToMongo();
  // Express apps are callable as (req, res), matching Vercel's Node handler signature.
  return app(req, res);
}
