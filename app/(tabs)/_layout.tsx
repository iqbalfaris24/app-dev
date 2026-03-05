import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- IMPORT INI

// --- KOMPONEN CUSTOM UNTUK ANIMASI ICON & TEKS ---
const AnimatedTabIcon = ({ focused, color, title, iconActive, iconInactive }: any) => {
  const animation = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      tension: 60,   
      friction: 8,   
    }).start();
  }, [focused]);

  const translateY = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const scale = animation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const textOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const textTranslateY = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const dotScale = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      width: 70,       
      height: 52,      
      marginTop: Platform.OS === 'ios' ? 14 : 0 
    }}>
      <Animated.View style={{ transform: [{ translateY }, { scale }], alignItems: 'center', zIndex: 2 }}>
        <Ionicons name={focused ? iconActive : iconInactive} size={24} color={color} />
        
        <Animated.View style={{
          marginTop: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: color,
          opacity: animation, transform: [{ scale: dotScale }],
          shadowColor: color, shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
        }} />
      </Animated.View>

      <Animated.Text style={{ 
        position: 'absolute', bottom: 0, color: color, fontSize: 10, fontWeight: '600',
        letterSpacing: 0.3, opacity: textOpacity, transform: [{ translateY: textTranslateY }], zIndex: 1
      }}>
        {title}
      </Animated.Text>
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets(); // <-- AMBIL DATA AREA AMAN HP (NAVIGASI BAWAH)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false, 
        tabBarActiveTintColor: isDark ? '#38bdf8' : '#2563eb', 
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8', 
        
        // --- FIX KEYBOARD MENUTUPI CHAT ---
        tabBarHideOnKeyboard: true, // Sembunyikan tab bar otomatis saat ngetik!
        
        tabBarStyle: {
          backgroundColor: isDark ? '#020617' : '#f8fafc', 
          borderTopWidth: 0, 
          elevation: 0,      
          shadowOpacity: 0,  
          // --- FIX TAB BAR TERTIMPA NAVIGASI SISTEM ---
          // Tinggi dasar (64) ditambah ketebalan navigasi bawaan HP (insets.bottom)
          // height: 64 + insets.bottom, 
          paddingBottom: insets.bottom, // Padding di bawah agar ikon tidak nabrak tombol Home HP
        },
      }}>
      
      {/* MENU 1: HOME DASHBOARD */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color} title="Home" iconActive="home" iconInactive="home-outline" />
          ),
        }}
      />

      {/* MENU 2: TIARA AI CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Tiara AI',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color} title="Tiara AI" iconActive="sparkles" iconInactive="sparkles-outline" />
          ),
        }}
      />
    </Tabs>
  );
}