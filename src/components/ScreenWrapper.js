import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';

export default function ScreenWrapper({ title, children, scrollable = true }) {
  const Content = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {title && (
        <View style={styles.header}>
          <Text style={typography.h1}>{title}</Text>
        </View>
      )}
      <Content
        style={styles.content}
        contentContainerStyle={scrollable ? styles.scrollContent : styles.flexContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  flexContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
