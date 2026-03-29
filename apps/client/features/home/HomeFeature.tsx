import Center from "@ui/components/layout/Center";
import Text from "@ui/components/primitives/Text";

import useHome from "./hooks/useHome";

export default function HomeFeature() {
  const { data, loading, error } = useHome();

  if (loading) {
    return (
      <Center>
        <Text>Loading...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center>
        <Text>Error</Text>
      </Center>
    );
  }

  return (
    <Center>
      <Text size="lg">{data?.message}</Text>
    </Center>
  );
}
