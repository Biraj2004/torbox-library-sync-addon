import app from "../src/app";

(app as unknown as { default: typeof app }).default = app;
module.exports = app;
export default app;
