import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, FileText, Calendar, User } from 'lucide-react-native';
import { View } from 'react-native';
import { KLINO_COLORS } from '../../src/constants/theme';
import { DictationHandle } from '../../src/components/dictation/DictationHandle';

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: KLINO_COLORS.verde,
          tabBarInactiveTintColor: KLINO_COLORS.gris,
          tabBarStyle: {
            backgroundColor: KLINO_COLORS.papelHondo,
            borderTopWidth: 1,
            borderTopColor: KLINO_COLORS.borderHairline,
            elevation: 0,
            shadowOpacity: 0,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontFamily: 'FamiljenGrotesk-SemiBold',
            fontSize: 10,
            textTransform: 'none',
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Panel',
            tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} strokeWidth={1.75} />,
          }}
        />
        <Tabs.Screen
          name="records"
          options={{
            title: 'Expedientes',
            tabBarIcon: ({ color }) => <FileText size={24} color={color} strokeWidth={1.75} />,
          }}
        />
        <Tabs.Screen
          name="agenda"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} strokeWidth={1.75} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Cuenta',
            tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={1.75} />,
          }}
        />
      </Tabs>
      <DictationHandle />
    </View>
  );
}