import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Auth() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <Text>Auth Route</Text>
      <Text>Expo Router runtime is active.</Text>
      <Link href="/" asChild>
        <Pressable>
          <Text>Back to Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
