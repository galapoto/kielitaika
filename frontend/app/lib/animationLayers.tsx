/**
 * Animation Layers - Module to animation mapping
 * 
 * Automatically provides appropriate animation layers for each module
 */

import React from 'react';
import Snowfall from '../components/background/layers/Snowfall';
import LottieSnowfall from '../components/background/layers/LottieSnowfall';
import LottieAurora from '../components/background/layers/LottieAurora';
import FogBreath from '../components/background/layers/FogBreath';
import Starfield from '../components/background/layers/Starfield';
import AuroraRipple from '../components/background/layers/AuroraRipple';
import AnimatedCloudLayer from '../components/AnimatedCloudLayer';
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ModuleKey = 
  | "login" 
  | "home" 
  | "conversation" 
  | "practice" 
  | "workplace" 
  | "yki_read" 
  | "yki_write" 
  | "yki_listen" 
  | "yki_speak";

/**
 * Get animation layers for a module
 */
export function getAnimationLayers(module: ModuleKey): React.ReactNode[] {
  const layers: React.ReactNode[] = [];

  switch (module) {
    case "login":
      // Winter theme with snowfall - prefer Lottie if available
      if (Platform.OS !== 'web') {
        layers.push(
          <LottieSnowfall key="lottie-snowfall" opacity={0.6} speed={0.9} />,
          <LottieAurora key="lottie-aurora" opacity={0.3} speed={0.5} />
        );
      } else {
        layers.push(
          <Snowfall key="snowfall" particleCount={120} speedMultiplier={0.9} />,
          <FogBreath key="fog" />
        );
      }
      break;

    case "home":
      // Subtle ambient effects with optional aurora
      if (Platform.OS !== 'web') {
        layers.push(
          <LottieAurora key="lottie-aurora" opacity={0.25} speed={0.4} />
        );
      } else {
        layers.push(
          <FogBreath key="fog" />
        );
      }
      break;

    case "conversation":
      // Cloud layer for conversation
      layers.push(
        <AnimatedCloudLayer key="clouds" />
      );
      break;

    case "practice":
      // Light snowfall for practice - prefer Lottie if available
      if (Platform.OS !== 'web') {
        layers.push(
          <LottieSnowfall key="lottie-snowfall" opacity={0.5} speed={0.7} />
        );
      } else {
        layers.push(
          <Snowfall key="snowfall" particleCount={80} speedMultiplier={0.7} />
        );
      }
      break;

    case "workplace":
      // Professional, minimal effects
      layers.push(
        <FogBreath key="fog" />
      );
      break;

    case "yki_read":
    case "yki_write":
      // Minimal distractions for reading/writing
      // No animations to avoid distraction
      break;

    case "yki_listen":
    case "yki_speak":
      // Subtle ambient for listening/speaking
      layers.push(
        <FogBreath key="fog" />
      );
      break;

    default:
      break;
  }

  return layers;
}

/**
 * Get aurora layers for special screens (if needed)
 */
export function getAuroraLayers(): React.ReactNode[] {
  return [
    <Starfield key="starfield" starCount={250} />,
    <AuroraRipple 
      key="aurora" 
      intensity={1.0} 
      width={SCREEN_WIDTH} 
      height={SCREEN_HEIGHT} 
    />,
  ];
}

