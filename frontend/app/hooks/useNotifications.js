import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if running in Expo Go (push notifications not supported in SDK 53+)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Configure notification handler only if not in Expo Go
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.warn('Notifications not available:', error);
  }
}

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
    // Skip notification setup in Expo Go (not supported in SDK 53+)
    if (isExpoGo) {
      console.log('Push notifications not available in Expo Go');
      return;
    }

    // Request permissions on mount
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token && userId) {
        // Register token with backend
        registerTokenWithBackend(token, userId);
      }
    }).catch(error => {
      console.warn('Notification registration failed:', error);
    });

    // Listen for notifications received while app is foregrounded
    try {
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
    } catch (error) {
      console.warn('Notification listeners not available:', error);
    }

    return () => {
      if (notificationListener.current) {
        try {
          Notifications.removeNotificationSubscription(notificationListener.current);
        } catch (e) {}
      }
      if (responseListener.current) {
        try {
          Notifications.removeNotificationSubscription(responseListener.current);
        } catch (e) {}
      }
    };
  }, [userId]);

  const scheduleDailyNotifications = async () => {
    if (isExpoGo) {
      console.log('Notifications not available in Expo Go');
      return;
    }
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
    if (isExpoGo) {
      console.log('Notifications not available in Expo Go');
      return;
    }
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
  // Skip in Expo Go
  if (isExpoGo) {
    return null;
  }

  let token;

  try {
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
  } catch (error) {
    console.warn('Push notification registration error:', error);
    return null;
  }
}

/**
 * Register device token with backend.
 */
async function registerTokenWithBackend(token, userId) {
  try {
    const { HTTP_API_BASE } = require('../config/backend');
    await fetch(`${HTTP_API_BASE}/notifications/register_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, token }),
    });
  } catch (error) {
    console.error('Error registering token:', error);
  }
}
