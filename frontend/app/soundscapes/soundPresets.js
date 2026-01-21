// Try to load ambient sound files - gracefully handle if they don't exist
let nordicCalmFile = null;
let coffeeHouseFile = null;
let forestBreathFile = null;
let arcticMinimalFile = null;

try {
  nordicCalmFile = require('../assets/sounds/ui/tap_soft.wav');
} catch (e) {
  nordicCalmFile = null;
}
try {
  coffeeHouseFile = require('../assets/sounds/ui/pop_light.wav');
} catch (e) {
  coffeeHouseFile = null;
}
try {
  forestBreathFile = require('../assets/sounds/ui/send1.wav');
} catch (e) {
  forestBreathFile = null;
}
try {
  arcticMinimalFile = require('../assets/sounds/ui/success_chime.wav');
} catch (e) {
  arcticMinimalFile = null;
}

export const soundPresets = {
  nordicCalm: {
    key: 'nordicCalm',
    file: nordicCalmFile,
    baseVolume: 0.25,
  },
  coffeeHouse: {
    key: 'coffeeHouse',
    file: coffeeHouseFile,
    baseVolume: 0.18,
  },
  forestBreath: {
    key: 'forestBreath',
    file: forestBreathFile,
    baseVolume: 0.22,
  },
  arcticMinimal: {
    key: 'arcticMinimal',
    file: arcticMinimalFile,
    baseVolume: 0.2,
  },
};
