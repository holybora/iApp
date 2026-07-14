import * as React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

export function GoalsScreen() {
  return (
    <View className="flex-1 px-4 pt-16" testID="goals-screen">
      <FocusAwareStatusBar />
      <Text className="text-xl font-bold">{translate('tabs.goals')}</Text>
      <View className="flex-1 items-center justify-center">
        <Text className="text-neutral-500">
          {translate('tabs.goals_empty')}
        </Text>
      </View>
    </View>
  );
}
