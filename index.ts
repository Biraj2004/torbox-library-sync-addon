import app from "./src/app";

// Support both CommonJS direct require and ESM default import
(app as unknown as { default: typeof app }).default = app;
module.exports = app;
export default app;
