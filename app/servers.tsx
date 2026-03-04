import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Credential, listCredentials, listServers, Server } from '../src/services/servers';

export default function ServersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credLoading, setCredLoading] = useState(false);

  const fetchServers = async () => {
    setLoading(true);
    try {
      const res = await listServers();
      setServers(res.data || []);
    } catch (e) {
      console.warn('fetch servers failed', e);
    } finally {
      setLoading(false);
    }
  };

  const openServer = async (server: Server) => {
    setSelectedServer(server);
    setCredLoading(true);
    try {
      const res = await listCredentials(server.id);
      setCredentials(res.credentials || []);
    } catch (e) {
      console.warn('fetch creds failed', e);
      setCredentials([]);
    } finally {
      setCredLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* header */}
      <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-slate-900">Servers</Text>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {loading && <ActivityIndicator size="large" color="#2563eb" />}
          {!loading && servers.length === 0 && (
            <Text className="text-slate-500 text-center">Tidak ada server ditemukan.</Text>
          )}
          {servers.map((srv) => (
            <TouchableOpacity
              key={srv.id}
              onPress={() => openServer(srv)}
              className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-semibold text-slate-900">{srv.hostname || srv.ip}</Text>
                  <Text className="text-sm text-slate-500">{srv.ip}</Text>
                </View>
                <View className="flex-row items-center">
                  {srv.status && (
                    <View className="bg-emerald-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-emerald-700 capitalize">{srv.status}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* server detail modal */}
      <Modal visible={!!selectedServer} animationType="slide" transparent={false}>
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
          <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">{selectedServer?.hostname || selectedServer?.ip}</Text>
            <TouchableOpacity
              onPress={() => setSelectedServer(null)}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 py-6">
              <Text className="text-sm text-slate-600 mb-2">IP Address: {selectedServer?.ip}</Text>
              <Text className="text-sm text-slate-600 mb-4">Layanan: {selectedServer?.layanan || '-'}</Text>
              <Text className="text-sm font-semibold text-slate-700 mb-4">Credentials</Text>
              {credLoading && <ActivityIndicator size="small" color="#2563eb" />}
              {!credLoading && credentials.length === 0 && (
                <Text className="text-slate-500">Tidak ada kredensial.</Text>
              )}
              {credentials.map((cred) => (
                <View key={cred.id} className="bg-white rounded-lg border border-slate-200 p-3 mb-2">
                  <Text className="text-sm font-semibold text-slate-800">{cred.username}</Text>
                  <Text className="text-xs text-slate-500">{cred.type}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
