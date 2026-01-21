export const linking = {
  prefixes: ['kielitaika://', 'https://dev.kielitaika.fi'],
  config: {
    screens: {
      Tabs: {
        screens: {
          Home: 'home',
          Progress: 'progress',
          Workplace: 'work',
          Settings: 'settings',
        },
      },
      Recharge: 'recharge',
      Conversation: 'conversation/:topic?',
      YKI: 'yki',
      Workplace: 'work/:profession?',
    },
  },
};
