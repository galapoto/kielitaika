const seasonPresets = {
  winter: {
    key: 'winter',
    orbTint: 'rgba(101,247,215,0.18)',
    overlays: { snow: true, fog: true, frost: true },
  },
  ruska: {
    key: 'ruska',
    orbTint: 'rgba(220,140,60,0.18)',
    overlays: { leaves: true, fog: false, frost: false },
  },
  spring_melt: {
    key: 'spring_melt',
    orbTint: 'rgba(150,220,200,0.16)',
    overlays: { shimmer: true, fog: false, frost: false },
  },
  midnight_sun: {
    key: 'midnight_sun',
    orbTint: 'rgba(250,210,120,0.18)',
    overlays: { dust: true, fog: false, frost: false },
  },
};

export function SeasonManager(season = 'winter') {
  const current = seasonPresets[season] || seasonPresets.winter;

  const getSceneModifiers = (sceneKey) => {
    return {
      tint: current.orbTint,
      overlays: current.overlays,
    };
  };

  const getOrbModifiers = () => ({
    tint: current.orbTint,
    frost: current.overlays.frost,
  });

  return {
    currentSeason: current.key,
    getSceneModifiers,
    getOrbModifiers,
  };
}
