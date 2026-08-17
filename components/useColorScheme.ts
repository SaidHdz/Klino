import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import React from 'react';
import { Appearance } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useNativewindColorScheme();
  return (colorScheme as 'light' | 'dark') ?? 'light';
}

export function useColorSchemeControls() {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();
  const [localScheme, setLocalScheme] = React.useState(colorScheme ?? 'light');

  React.useEffect(() => {
    setLocalScheme(colorScheme ?? 'light');
  }, [colorScheme]);

  const toggleColorScheme = () => {
    try {
      const next = (colorScheme ?? 'light') === 'dark' ? 'light' : 'dark';
      if (typeof setColorScheme === 'function') {
        setColorScheme(next);
        setLocalScheme(next);
        try { Appearance.setColorScheme(next); } catch (e) {}
      }
    } catch (e) {
      console.warn("Error cambiando esquema de color", e);
    }
  };

  return { colorScheme: localScheme, toggleColorScheme, setColorScheme };
}
