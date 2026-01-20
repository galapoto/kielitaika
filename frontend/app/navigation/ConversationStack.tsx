// ConversationStack - Stack navigation for conversation flow
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConversationScreen from "../screens/ConversationScreen";

const Stack = createNativeStackNavigator();

export default function ConversationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
}
