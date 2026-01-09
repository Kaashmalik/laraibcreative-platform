/**
 * Sentry Configuration
 * Error tracking and performance monitoring
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry
 */
function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Set sampling rate for profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Integrations
    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new Sentry.Integrations.Mongo(),
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Filter out sensitive request data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
        delete event.request.headers?.cookie;
      }

      return event;
    },
  });

  console.log('✅ Sentry initialized');
}

/**
 * Capture error with context
 */
function captureError(error, context = {}) {
  Sentry.captureException(error, {
    level: 'error',
    extra: context,
  });
}

/**
 * Capture message
 */
function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add user context
 */
function setUserContext(user) {
  Sentry.setUser({
    id: user._id || user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context
 */
function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Create transaction for performance tracking
 */
function startTransaction(name, op = 'http.server') {
  return Sentry.startSpan({
    name,
    op,
  }, (span) => {
    return span;
  });
}

/**
 * Close Sentry
 */
async function closeSentry() {
  await Sentry.close(2000);
}

module.exports = {
  initSentry,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  startTransaction,
  closeSentry
};
