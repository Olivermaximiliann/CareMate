import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 46,
  },
  h2: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 40,
  },
  h3: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 34,
  },
  body: {
    fontSize: 22,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 32,
  },
  bodySmall: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 28,
  },
  button: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  caption: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 26,
  },
});
