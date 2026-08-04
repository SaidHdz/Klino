import React from 'react';
import { MaterialTopTabs } from '../../components/MaterialTopTabs';
import { LayoutDashboard, FileText, Smartphone, User } from 'lucide-react-native';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useProfile } from '../../src/context/ProfileContext';

export default function TabLayout() {
  const { primaryColor } = useProfile();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: isDark ? '#64748B' : '#5A6B7E',
        tabBarShowLabel: true,
        tabBarIndicatorStyle: { height: 0 },
        tabBarStyle: {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1E293B' : '#F4F7FB',
          height: 85,
          paddingBottom: 25,
          paddingTop: 15,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 4,
          textTransform: 'none',
        }
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Panel',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
              <LayoutDashboard size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="records"
        options={{
          title: 'Expedientes',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
              <FileText size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="devices"
        options={{
          title: 'Hardware',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
              <Smartphone size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
              <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </MaterialTopTabs>
  );
}