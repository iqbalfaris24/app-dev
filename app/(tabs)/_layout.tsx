import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';

// --- KOMPONEN CUSTOM UNTUK ANIMASI ICON & TEKS ---
const AnimatedTabIcon = ({ focused, color, title, iconActive, iconInactive }: any) => {
  // Nilai animasi dasar (0 saat tidak aktif, 1 saat aktif)
  const animation = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      tension: 60,   // Kecepatan pegas
      friction: 8,   // Pantulan (bounce)
    }).start();
  }, [focused]);

  // 1. Ikon turun ke tengah saat aktif
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10] 
  });

  // 2. Ikon sedikit membesar saat aktif
  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15]
  });

  // 3. Teks memudar secara perlahan
  const textOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  // 4. Teks ikut turun ke bawah hingga menghilang
  const textTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10]
  });

  // 5. Titik glow membesar dari 0 ke ukuran asli
  const dotScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      width: 70,       // Lebar area sentuh diperbesar agar tidak memotong ikon
      height: 52,      // Tinggi statis agar proporsional
      marginTop: Platform.OS === 'ios' ? 14 : 0 
    }}>
      {/* Container Icon & Titik */}
      <Animated.View style={{ transform: [{ translateY }, { scale }], alignItems: 'center', zIndex: 2 }}>
        <Ionicons name={focused ? iconActive : iconInactive} size={24} color={color} />
        
        {/* Titik Indikator Glow */}
        <Animated.View style={{
          marginTop: 4,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          opacity: animation, // Ikut memudar
          transform: [{ scale: dotScale }], // Ikut membesar
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
          elevation: 4,
        }} />
      </Animated.View>

      {/* Container Teks */}
      <Animated.Text style={{ 
        position: 'absolute',
        bottom: 0, // Posisi aman agar tidak menabrak padding atas
        color: color, 
        fontSize: 10, 
        fontWeight: '600',
        letterSpacing: 0.3,
        opacity: textOpacity,
        transform: [{ translateY: textTranslateY }],
        zIndex: 1
      }}>
        {title}
      </Animated.Text>
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false, 
        tabBarActiveTintColor: isDark ? '#38bdf8' : '#2563eb', 
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        tabBarStyle: {
          backgroundColor: isDark ? '#020617' : '#f8fafc', 
          borderTopWidth: 0, 
          elevation: 0,      
          shadowOpacity: 0, 
          height: Platform.OS === 'ios' ? 88 : 64, 
        },
      }}>
      
      {/* MENU 1: HOME DASHBOARD */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              focused={focused} 
              color={color} 
              title="Home"
              iconActive="home"
              iconInactive="home-outline"
            />
          ),
        }}
      />

      {/* MENU 2: TIARA AI CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Tiara AI',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              focused={focused} 
              color={color} 
              title="Tiara AI"
              iconActive="sparkles"
              iconInactive="sparkles-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}