import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listNetboxDevices, NetboxDevice } from '../src/services/netbox';

export default function NetboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [devices, setDevices] = useState<NetboxDevice[]>([]);
  const [loading, setLoading] = useState(false);

  const formatValue = (val: any) => {
    if (val == null) return '';
    if (typeof val === 'object') {
      // try common properties
      return val.display || val.name || val.slug || JSON.stringify(val);
    }
    return String(val);
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await listNetboxDevices();
      setDevices(res.items || []);
    } catch (e) {
      console.warn('fetch devices failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-slate-900">Netbox Devices</Text>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {loading && <ActivityIndicator size="large" color="#2563eb" />}
          {!loading && devices.length === 0 && (
            <Text className="text-slate-500 text-center">Tidak ada device.</Text>
          )}
          {devices.map((dev) => (
            <View
              key={dev.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm"
            >
              <Text className="text-lg font-semibold text-slate-900">{dev.name || `#${dev.id}`}</Text>
              {dev.device_type && (
                <Text className="text-sm text-slate-500">
                  Type: {formatValue(dev.device_type)}
                </Text>
              )}
              {dev.site && (
                <Text className="text-sm text-slate-500">
                  Site: {formatValue(dev.site)}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
