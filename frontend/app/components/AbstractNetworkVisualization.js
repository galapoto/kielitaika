/**
 * AbstractNetworkVisualization - Glowing network lines and nodes for conversation page
 * Matches the left side of the last image
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

export default function AbstractNetworkVisualization({ style }) {
  // Generate network nodes and connections (matching image)
  const nodes = [
    { id: 1, x: 15, y: 20, size: 2.5 },
    { id: 2, x: 35, y: 15, size: 3 },
    { id: 3, x: 55, y: 25, size: 2.5 },
    { id: 4, x: 70, y: 20, size: 3 },
    { id: 5, x: 25, y: 40, size: 3.5 },
    { id: 6, x: 50, y: 45, size: 3 },
    { id: 7, x: 75, y: 40, size: 2.5 },
    { id: 8, x: 20, y: 60, size: 3 },
    { id: 9, x: 45, y: 65, size: 3.5 },
    { id: 10, x: 65, y: 60, size: 2.5 },
  ];

  const connections = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 1, to: 5 },
    { from: 2, to: 5 },
    { from: 3, to: 6 },
    { from: 4, to: 7 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
    { from: 5, to: 8 },
    { from: 6, to: 9 },
    { from: 7, to: 10 },
    { from: 8, to: 9 },
    { from: 9, to: 10 },
  ];

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Glowing network lines */}
        {connections.map((conn, index) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          
          return (
            <Line
              key={`line-${index}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
              opacity={0.6}
            />
          );
        })}
        
        {/* Glowing nodes */}
        {nodes.map((node) => (
          <Circle
            key={`node-${node.id}`}
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill="rgba(255,255,255,0.8)"
            opacity={0.7}
          />
        ))}
        
        {/* Smaller scattered dots */}
        {Array.from({ length: 15 }).map((_, i) => {
          const x = (i * 7) % 100;
          const y = (i * 11) % 100;
          return (
            <Circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={0.8}
              fill="rgba(255,255,255,0.3)"
              opacity={0.5}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    opacity: 0.6,
  },
});
