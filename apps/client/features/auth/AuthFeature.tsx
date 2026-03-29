import Center from "@ui/components/layout/Center";
import Text from "@ui/components/primitives/Text";

import useAuth from "./hooks/useAuth";

export default function AuthFeature() {
  const { data, loading, error } = useAuth();

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
      <Text size="lg">
        {data?.isAuthenticated ? "Logged In" : "Not Logged In"}
      </Text>
    </Center>
  );
}
