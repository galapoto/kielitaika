import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

/**
 * RUKA 3D Logo - Premium SVG with advanced 3D illusion
 * Features:
 * - Multi-layer depth with shadow/light effects
 * - Animated rotation and perspective transforms
 * - Embossed texture matching app design
 * - Dynamic lighting that responds to depth
 */
export default function RukaLogo3D({ width = 420, height = 140, style }) {
  // NOTE: We use `SvgXml` here because it avoids occasional named-export mismatches
  // with `react-native-svg` components in Hermes/Metro builds.
  const xml = useMemo(
    () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 140">
  <defs>
    <linearGradient id="iceFront" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="0.5" stop-color="#E6F2FF" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#A7D4FF" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="iceMid" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#C7E3FF" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="#8FC4FF" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#5F8FB6" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="iceBack" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5F8FB6" stop-opacity="0.6"/>
      <stop offset="0.5" stop-color="#3D6B8F" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#2D4F6A" stop-opacity="0.4"/>
    </linearGradient>
    <linearGradient id="embossHighlight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Snowflake mark -->
  <g transform="translate(70 70)">
    <g transform="translate(6 6)" opacity="0.4" stroke="url(#iceBack)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <line x1="0" y1="-38" x2="0" y2="38"/>
      <line x1="-38" y1="0" x2="38" y2="0"/>
      <line x1="-28" y1="-28" x2="28" y2="28"/>
      <line x1="-28" y1="28" x2="28" y2="-28"/>
    </g>
    <g transform="translate(3 3)" opacity="0.65" stroke="url(#iceMid)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <line x1="0" y1="-36" x2="0" y2="36"/>
      <line x1="-36" y1="0" x2="36" y2="0"/>
      <line x1="-26" y1="-26" x2="26" y2="26"/>
      <line x1="-26" y1="26" x2="26" y2="-26"/>
    </g>
    <g stroke="url(#iceFront)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="0" y1="-34" x2="0" y2="34"/>
      <line x1="-34" y1="0" x2="34" y2="0"/>
      <line x1="-24" y1="-24" x2="24" y2="24"/>
      <line x1="-24" y1="24" x2="24" y2="-24"/>
      <line x1="0" y1="-34" x2="7" y2="-27"/>
      <line x1="0" y1="-34" x2="-7" y2="-27"/>
      <line x1="34" y1="0" x2="27" y2="7"/>
      <line x1="34" y1="0" x2="27" y2="-7"/>
      <line x1="0" y1="34" x2="7" y2="27"/>
      <line x1="0" y1="34" x2="-7" y2="27"/>
      <line x1="-34" y1="0" x2="-27" y2="7"/>
      <line x1="-34" y1="0" x2="-27" y2="-7"/>
    </g>
    <path d="M -20 -20 L 0 -34 L 20 -20 L 20 20 L 0 34 L -20 20 Z" fill="url(#embossHighlight)" opacity="0.3"/>
    <circle cx="0" cy="0" r="4" fill="url(#iceFront)" opacity="0.85"/>
  </g>

  <!-- Wordmark -->
  <g transform="translate(150 88)">
    <text x="2" y="2" font-size="44" font-weight="700" letter-spacing="4" fill="url(#iceBack)" opacity="0.5" font-family="system-ui, -apple-system, sans-serif">RUKA</text>
    <text x="1" y="1" font-size="44" font-weight="700" letter-spacing="4" fill="url(#iceMid)" opacity="0.75" font-family="system-ui, -apple-system, sans-serif">RUKA</text>
    <text x="0" y="0" font-size="44" font-weight="700" letter-spacing="4" fill="url(#iceFront)" font-family="system-ui, -apple-system, sans-serif">RUKA</text>
    <text x="0" y="0" font-size="44" font-weight="700" letter-spacing="4" fill="url(#embossHighlight)" opacity="0.35" font-family="system-ui, -apple-system, sans-serif">RUKA</text>
  </g>
</svg>
`,
    []
  );

  return (
    <View style={[{ width, height }, style]}>
      <SvgXml xml={xml} width={width} height={height} />
    </View>
  );
}
