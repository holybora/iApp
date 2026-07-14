import { Redirect, SplashScreen, Tabs } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';

import {
  Goals as GoalsIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Stats as StatsIcon,
} from '@/components/ui/icons';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import { translate } from '@/lib/i18n';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        hideSplash();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: translate('tabs.today'),
          headerShown: false,
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarButtonTestID: 'today-tab',
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: translate('tabs.goals'),
          headerShown: false,
          tabBarIcon: ({ color }) => <GoalsIcon color={color} />,
          tabBarButtonTestID: 'goals-tab',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: translate('tabs.stats'),
          headerShown: false,
          tabBarIcon: ({ color }) => <StatsIcon color={color} />,
          tabBarButtonTestID: 'stats-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: translate('settings.title'),
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}
