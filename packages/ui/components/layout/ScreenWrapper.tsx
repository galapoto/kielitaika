import type { ReactNode } from "react";
import { StyleSheet } from "react-native";

import Screen from "./Screen";

type Props = {
  children: ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  void styles;

  return <Screen>{children}</Screen>;
}

const styles = StyleSheet.create({});
