import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Hook for managing push notifications.
 * 
 * Features:
 * - Request permissions
 * - Schedule daily notifications (morning, afternoon, evening)
 * - Handle notification interactions
 * - Register device token with backend
 */
export function useNotifications(userId = null) {
  const notificationListener = useRef();
  const responseListener = useRef();
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    // Request permissions on mount
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token && userId) {
        // Register token with backend
        registerTokenWithBackend(token, userId);
      }
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      // Handle navigation based on notification data
      if (data?.action === 'recharge') {
        // Navigate to RechargeScreen
      } else if (data?.action === 'micro_output') {
        // Navigate to MicroOutput screen
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [userId]);

  const scheduleDailyNotifications = async () => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Morning notification (8:00)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔋 Puhis says: Here are 3 words to warm up your Finnish today!",
          body: "Your daily recharge is ready",
          data: { action: 'recharge' },
        },
        trigger: {
          hour: 8,
          minute: 0,
          repeats: true,
        },
      });

      // Afternoon notification (13:00)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Your grammar snack is ready 🍪",
          body: "Ready to learn just 1 tiny thing?",
          data: { action: 'recharge' },
        },
        trigger: {
          hour: 13,
          minute: 0,
          repeats: true,
        },
      });

      // Evening notification (19:00)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Finish your day in Finnish: 10-second speaking challenge awaits! ⏱️",
          body: "Quick practice to keep your streak going",
          data: { action: 'micro_output' },
        },
        trigger: {
          hour: 19,
          minute: 0,
          repeats: true,
        },
      });

      console.log('Daily notifications scheduled');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const scheduleBehaviorDrivenNotification = async (event, delayMinutes = 30) => {
    try {
      let title, body, data;
      
      if (event === 'missed_yesterday') {
        title = "Start fresh today 💙";
        body = "A quick recharge keeps your Finnish growing.";
        data = { action: 'recharge' };
      } else if (event === 'streak_milestone') {
        title = "🔥 You're on fire!";
        body = "Keep your streak going!";
        data = { action: 'recharge' };
      } else {
        return; // Unknown event
      }

      await Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger: { seconds: delayMinutes * 60 },
      });
    } catch (error) {
      console.error('Error scheduling behavior notification:', error);
    }
  };

  return {
    expoPushToken,
    permissionStatus,
    scheduleDailyNotifications,
    scheduleBehaviorDrivenNotification,
  };
}

/**
 * Request push notification permissions and get Expo push token.
 */
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo push token:', token);

  return token;
}

/**
 * Register device token with backend.
 */
async function registerTokenWithBackend(token, userId) {
  try {
    const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';
    await fetch(`${API_BASE}/notifications/register_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, token }),
    });
  } catch (error) {
    console.error('Error registering token:', error);
  }
}
