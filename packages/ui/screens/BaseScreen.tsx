import type { ReactNode } from "react";

import ScreenWrapper from "../components/layout/ScreenWrapper";
import Center from "../components/layout/Center";
import Text from "../components/primitives/Text";

type Props = {
  title: string;
  children?: ReactNode;
};

export default function BaseScreen({ title, children }: Props) {
  return (
    <ScreenWrapper>
      <Center>
        <Text size="lg">{title}</Text>
        {children}
      </Center>
    </ScreenWrapper>
  );
}
