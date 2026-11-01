import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  size?: number;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 18, compact = false }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.button,
        compact ? styles.buttonCompact : null,
        {
          backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
          borderColor: isDark ? '#334155' : '#CBD5E1',
        },
      ]}
      activeOpacity={0.7}
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={size}
        color={isDark ? '#FACC15' : '#475569'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonCompact: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});

