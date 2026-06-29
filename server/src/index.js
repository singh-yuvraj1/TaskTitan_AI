/**
 * Server Application Export
 * Exports the Express app factory for use in testing and external imports.
 * The actual server startup lives in ../server.js.
 */

import createApp from './app.js';

export { createApp };
export default createApp;
