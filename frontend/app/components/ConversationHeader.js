import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';

export default function ConversationHeader({ topic }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversation</Text>
      {topic ? <Text style={styles.topic}>Topic: {topic}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.m,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLine,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  topic: {
    fontSize: 14,
    color: colors.textSoft,
    marginTop: spacing.xs,
  },
});
