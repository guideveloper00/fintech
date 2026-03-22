'use strict';

/**
 * Vercel serverless entry point.
 * Written in plain JS so Vercel does not attempt to compile it with esbuild
 * (which doesn't support emitDecoratorMetadata required by NestJS DI).
 * Instead it requires the pre-compiled dist/ output produced by `nest build`.
 */

let serverPromise;

module.exports = async (req, res) => {
  if (!serverPromise) {
    // Lazily load the compiled NestJS app on first invocation (cold start).
    serverPromise = require('../dist/serverless').getServer();
  }
  const server = await serverPromise;
  server(req, res);
};
