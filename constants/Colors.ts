const tintColorLight = '#0D9488';
const tintColorDark = '#fff';

export const Klino = {
  primary: '#0D7E6E', // Teal marca
  specialties: {
    general: '#0D7E6E',
    surgery: '#1E3A5F',
    pediatrics: '#2D6A9F',
  },
  status: {
    pending: '#F97316',
    completed: '#22C55E',
    processed: '#3B82F6',
    archived: '#94A3B8',
  },
  background: '#F8FAFC',
  text: '#1E293B',
  card: '#FFFFFF',
};

export default {
  light: {
    text: Klino.text,
    background: Klino.background,
    tint: Klino.primary,
    tabIconDefault: '#94A3B8',
    tabIconSelected: Klino.primary,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
