import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 40,
  },
  h2: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 34,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 30,
  },
  body: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 26,
  },
  button: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  caption: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
