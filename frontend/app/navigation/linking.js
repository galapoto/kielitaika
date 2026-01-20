export const linking = {
  prefixes: ['ruka://', 'https://ruka.app', 'http://localhost'],
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
