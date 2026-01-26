export const linking = {
  prefixes: ['kielitaika://', 'https://dev.kielitaika.fi'],
  config: {
    // NOTE (Phase 0 isolation): keep linking config inert/restricted so
    // deep links cannot bypass mode authority into legacy or privileged routes.
    // Runtime navigation currently does not enable linking; this config is kept
    // intentionally minimal for safety if enabled later.
    screens: {},
  },
};
