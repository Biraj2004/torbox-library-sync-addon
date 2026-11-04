import app from "./app";

// Support both CommonJS direct require and ESM default import
(app as unknown as { default: typeof app }).default = app;

// In local execution, start HTTP listener. In Vercel serverless, export app directly.
if (!process.env.VERCEL && require.main === module) {
  const port = Number(process.env.PORT) || 7000;
  const host = process.env.HOST || "0.0.0.0";
  app.listen(port, host, () => {
    console.log(`Torbox Library Sync Addon listening on ${host}:${port}`);
    console.log(`Configuration: http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${port}/configure`);
  });
}

module.exports = app;
export default app;
