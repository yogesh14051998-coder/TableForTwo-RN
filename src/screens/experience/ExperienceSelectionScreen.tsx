import React from 'react';
import { View, Text } from 'react-native';
import { T42, Fonts } from '../../theme/theme';

// Replaced by DateIntentScreen in the new intent-first flow.
export default function ExperienceSelectionScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: T42.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[Fonts.body, { color: T42.textSecondary }]}>This screen is no longer in use.</Text>
    </View>
  );
}
