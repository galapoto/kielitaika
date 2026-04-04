import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { colors, componentSizes, spacing } from "../tokens";

type Props = PropsWithChildren<{
  actions?: ReactNode;
  actionsPosition?: "bottom" | "top";
  center?: boolean;
  content?: ReactNode;
  header?: ReactNode;
  scroll?: boolean;
}>;

export default function ScreenContainer({
  actions,
  actionsPosition = "bottom",
  center = false,
  children,
  content,
  header,
  scroll = true,
}: Props) {
  const hasDeterministicZones =
    header !== undefined || content !== undefined || actions !== undefined;

  const actionZone = <View style={styles.actionZone}>{actions}</View>;
  const contentZone = <View style={styles.contentZone}>{content}</View>;

  const frame = hasDeterministicZones ? (
    <View style={[styles.frame, center ? styles.frameCentered : null]}>
      <View style={styles.headerZone}>{header}</View>
      {actionsPosition === "top" ? actionZone : null}
      {contentZone}
      {actionsPosition === "bottom" ? actionZone : null}
    </View>
  ) : (
    <View style={[styles.legacyFrame, center ? styles.frameCentered : null]}>{children}</View>
  );

  if (!scroll) {
    return (
      <View style={styles.root}>
        <View style={styles.staticContent}>{frame}</View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.root}
    >
      {frame}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionZone: {
    alignSelf: "stretch",
    gap: componentSizes.layout.actionGap,
    zIndex: 10,
  },
  contentZone: {
    alignSelf: "stretch",
    gap: componentSizes.layout.sectionGap,
  },
  frame: {
    alignSelf: "center",
    gap: componentSizes.layout.zoneGap,
    maxWidth: componentSizes.layout.maxWidth,
    width: "100%",
  },
  frameCentered: {
    justifyContent: "center",
  },
  headerZone: {
    alignSelf: "stretch",
    minHeight: componentSizes.header.minHeight,
    paddingVertical: componentSizes.header.paddingVertical,
    width: componentSizes.header.width,
  },
  legacyFrame: {
    alignSelf: "center",
    gap: spacing.sm,
    maxWidth: componentSizes.layout.maxWidth,
    width: "100%",
  },
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: componentSizes.layout.screenPadding,
  },
  staticContent: {
    flex: 1,
    justifyContent: "center",
    padding: componentSizes.layout.screenPadding,
  },
});
