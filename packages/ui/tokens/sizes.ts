export const radius = {
  small: 8,
  medium: 16,
  large: 24,
} as const;

export const componentSizes = {
  button: {
    width: "100%",
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    width: "100%",
    minHeight: 96,
    padding: 16,
  },
  input: {
    singleLine: {
      width: "100%",
      height: 48,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    multiline: {
      width: "100%",
      height: 160,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
  },
  micButton: {
    width: 48,
    height: 48,
    padding: 8,
  },
  header: {
    width: "100%",
    minHeight: 96,
    paddingVertical: 16,
  },
  layout: {
    maxWidth: 640,
    zoneGap: 24,
    sectionGap: 16,
    actionGap: 8,
    screenPadding: 16,
  },
} as const;
