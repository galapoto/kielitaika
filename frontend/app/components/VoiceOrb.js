import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { useVoiceReactiveRing } from '../hooks/conversationMotion/useVoiceReactiveRing';
import { useVoiceOrbAnimation } from '../hooks/conversationMotion/useVoiceOrbAnimation';
import OrbOverlaySnow from '../orb/effects/OrbOverlaySnow';
import OrbEvolutionBurst from '../orb/effects/OrbEvolutionBurst';
import EvolutionCinematic from '../orb/effects/EvolutionCinematic';
import FireSpirits from '../orb/effects/FireSpirits';
import VoiceTrail from './orb/trails/VoiceTrail';
import OrbGravityField from './orb/lens/OrbGravityField';
import SpiritLights from './orb/spirit/SpiritLights';
import ConstellationLinks from './orb/spirit/ConstellationLinks';

/**
 * Breathing orb with concentric rings.
 * Props:
 * - amplitude (0-1) to modulate scale/glow
 * - mode: 'idle' | 'listening' | 'speaking'
 */
export default function VoiceOrb({
  amplitude = 0,
  mode = 'idle',
  size = 160,
  season = 'winter',
  evolutionTrigger = 0,
  pitchDelta = 0,
  speechSpeed = 0,
  showConstellations = true,
  skills = [
    { key: 'vocab', energy: 0.6, color: '#4EC5FF' },
    { key: 'grammar', energy: 0.4, color: '#1B4EDA' },
    { key: 'pronunciation', energy: 0.7, color: '#65F7D7' },
  ],
}) {
  const ampShared = useSharedValue(amplitude);
  const ringPhase = useSharedValue(0);
  const { coreStyle } = useVoiceOrbAnimation({ amplitude, mode });

  useEffect(() => {
    ampShared.value = amplitude;
    ringPhase.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.linear }), -1, false);
  }, [ampShared, amplitude, ringPhase]);

  const baseSize = size;
  const ringCount = 4;
  const rings = useMemo(() => Array.from({ length: ringCount }).map((_, i) => i), [ringCount]);
  const orbitRadius = baseSize * 0.7;
  const nodes = useMemo(
    () =>
      skills.map((s, idx) => {
        const angle = (idx / Math.max(1, skills.length)) * Math.PI * 2;
        return {
          key: s.key,
          x: baseSize / 2 + Math.cos(angle) * orbitRadius,
          y: baseSize / 2 + Math.sin(angle) * orbitRadius * 0.8,
          color: s.color,
        };
      }),
    [skills, baseSize, orbitRadius]
  );

  const ringStyle = (i) =>
    {
      const reactive = useVoiceReactiveRing(ampShared);
      return {
        ...reactive,
      };
    };

  return (
    <View style={[styles.container, { width: baseSize, height: baseSize }]}>
      <OrbGravityField strength={0.05} speaking={mode === 'speaking'} />
      <VoiceTrail amplitude={amplitude} pitchDelta={pitchDelta} centerX={baseSize / 2} centerY={baseSize / 2} />
      <FireSpirits
        enabled
        amplitude={amplitude}
        speechSpeed={speechSpeed}
        centerX={baseSize / 2}
        centerY={baseSize / 2}
      />
      <SpiritLights skills={skills} radius={orbitRadius} />
      {showConstellations && <ConstellationLinks nodes={nodes} active={skills.some((s) => (s.energy ?? 0) > 0.8)} />}
      {rings.map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            { width: baseSize, height: baseSize, borderRadius: baseSize / 2 },
            ringStyle(i),
          ]}
        />
      ))}
      <Animated.View
        style={[
          styles.core,
          { width: baseSize * 0.68, height: baseSize * 0.68, borderRadius: (baseSize * 0.68) / 2 },
          coreStyle,
        ]}
      />
      {season === 'winter' && <OrbOverlaySnow amplitude={amplitude} />}
      {evolutionTrigger > 0 && <OrbEvolutionBurst trigger={evolutionTrigger} color={colors.mintSoft} />}
      {evolutionTrigger > 0 && <EvolutionCinematic trigger={evolutionTrigger} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(78,197,255,0.45)',
  },
  core: {
    shadowColor: colors.mintSoft,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
});
