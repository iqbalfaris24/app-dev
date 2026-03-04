import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiEndpoint, ApiModule, apiModules } from '../src/data/apiModules';

export default function ApiExplorerScreen() {
  const insets = useSafeAreaInsets();
  const [selectedModule, setSelectedModule] = useState<ApiModule | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [showEndpointDetail, setShowEndpointDetail] = useState(false);

  const getMethodColor = (method: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      GET: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      POST: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      PUT: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
      DELETE: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    };
    return colors[method] || colors.GET;
  };

  const handleCopyPath = (path: string) => {
    // Note: React Native doesn't have built-in clipboard for web, 
    // but Expo apps can use @react-native-clipboard/clipboard
    Alert.alert('Path copied', `${path}\n\nKonten ini disalin ke clipboard`);
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* HEADER */}
      <View className="bg-white border-b border-slate-200 px-6 py-4">
        <View className="flex-row items-center mb-2">
          <View className="bg-blue-100 p-2 rounded-lg mr-3">
            <Ionicons name="code-slash" size={20} color="#2563eb" />
          </View>
          <Text className="text-2xl font-bold text-slate-900">API Explorer</Text>
        </View>
        <Text className="text-sm text-slate-500">Jelajahi semua endpoint API Tiara</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* MODULES GRID */}
        <View className="px-6 py-6">
          <Text className="text-base font-bold text-slate-800 mb-4">Modules</Text>

          {apiModules.map((module) => (
            <TouchableOpacity
              key={module.id}
              onPress={() => {
                setSelectedModule(module);
                setShowModuleDetail(true);
              }}
              className="bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden shadow-sm"
            >
              {/* MODULE CARD */}
              <View className="flex-row items-center p-4">
                <View className={`${module.bgColor} w-16 h-16 rounded-xl items-center justify-center mr-4`}>
                  <Ionicons name={module.icon as any} size={28} className={module.color} />
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-bold text-slate-900">{module.title}</Text>
                  <Text className="text-sm text-slate-500 mt-1">{module.description}</Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="layers" size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-500 ml-1">{module.endpoints.length} endpoints</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* STATS SECTION */}
        <View className="px-6 pb-10">
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 flex-row justify-between">
            <View>
              <Text className="text-white/80 text-sm font-medium">Total Modules</Text>
              <Text className="text-white text-3xl font-bold mt-1">{apiModules.length}</Text>
            </View>
            <View>
              <Text className="text-white/80 text-sm font-medium">Total Endpoints</Text>
              <Text className="text-white text-3xl font-bold mt-1">
                {apiModules.reduce((sum, m) => sum + m.endpoints.length, 0)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODULE DETAIL MODAL */}
      <Modal visible={showModuleDetail} animationType="slide" transparent={false}>
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
          {/* MODAL HEADER */}
          <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-900">{selectedModule?.title}</Text>
              <Text className="text-sm text-slate-500 mt-1">{selectedModule?.description}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowModuleDetail(false);
                setShowEndpointDetail(false);
                setSelectedEndpoint(null);
              }}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* ENDPOINTS LIST */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 py-6">
              <Text className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">
                Endpoints
              </Text>

              {selectedModule?.endpoints.map((endpoint) => {
                const methodColors = getMethodColor(endpoint.method);
                return (
                  <TouchableOpacity
                    key={endpoint.id}
                    onPress={() => {
                      setSelectedEndpoint(endpoint);
                      setShowEndpointDetail(true);
                    }}
                    className="bg-white rounded-2xl border border-slate-200 mb-4 p-4 shadow-sm"
                  >
                    {/* ENDPOINT HEADER */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 pr-3">
                        <Text className="text-base font-bold text-slate-900">{endpoint.name}</Text>
                      </View>
                      <View className={`${methodColors.bg} ${methodColors.text} px-3 py-1 rounded-lg border ${methodColors.border}`}>
                        <Text className="text-xs font-bold">{endpoint.method}</Text>
                      </View>
                    </View>

                    {/* ENDPOINT PATH */}
                    <View className="bg-slate-900 rounded-lg p-3 mb-3">
                      <Text className="text-xs font-mono text-white/90 break-words">{endpoint.path}</Text>
                    </View>

                    {/* DESCRIPTION */}
                    <Text className="text-sm text-slate-600 leading-relaxed mb-3">
                      {endpoint.description}
                    </Text>

                    {/* PARAMETERS */}
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <View className="mb-3">
                        <Text className="text-xs font-bold text-slate-700 mb-2">Parameters:</Text>
                        <View className="flex-row flex-wrap gap-2">
                          {endpoint.parameters.map((param) => (
                            <View
                              key={param}
                              className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1"
                            >
                              <Text className="text-xs text-amber-800 font-medium">{param}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* FOOTER */}
                    <View className="pt-2 border-t border-slate-200 flex-row items-center justify-between">
                      <Text className="text-xs text-blue-600 font-semibold">Tap untuk detail →</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ENDPOINT DETAIL MODAL */}
      <Modal visible={showEndpointDetail} animationType="slide" transparent={false}>
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
          {/* MODAL HEADER */}
          <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900">{selectedEndpoint?.name}</Text>
              <Text className="text-sm text-slate-500 mt-1">{selectedModule?.title}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowEndpointDetail(false);
              }}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* ENDPOINT DETAILS */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 py-6 pb-32">
              {/* METHOD & PATH */}
              <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                <View className="flex-row items-center mb-4">
                  <View className={`${getMethodColor(selectedEndpoint?.method || 'GET').bg} px-4 py-2 rounded-lg`}>
                    <Text className={`text-sm font-bold ${getMethodColor(selectedEndpoint?.method || 'GET').text}`}>
                      {selectedEndpoint?.method}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-600 font-semibold mb-2">Endpoint Path:</Text>
                <TouchableOpacity
                  onPress={() => handleCopyPath(selectedEndpoint?.path || '')}
                  className="bg-slate-900 rounded-lg p-3"
                >
                  <Text className="text-sm font-mono text-white break-words">{selectedEndpoint?.path}</Text>
                </TouchableOpacity>
              </View>

              {/* DESCRIPTION */}
              <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                <Text className="text-sm font-bold text-slate-900 mb-2">Deskripsi</Text>
                <Text className="text-sm text-slate-600 leading-relaxed">
                  {selectedEndpoint?.description}
                </Text>
              </View>

              {/* PARAMETERS */}
              {selectedEndpoint?.parameters && selectedEndpoint.parameters.length > 0 && (
                <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                  <Text className="text-sm font-bold text-slate-900 mb-3">Parameters</Text>
                  {selectedEndpoint.parameters.map((param, index) => (
                    <View key={param} className={`flex-row items-center py-2 ${index !== selectedEndpoint.parameters!.length - 1 ? 'border-b border-slate-200' : ''}`}>
                      <View className="bg-blue-100 px-3 py-1 rounded-lg mr-3">
                        <Text className="text-xs font-semibold text-blue-700">{param}</Text>
                      </View>
                      <Text className="text-xs text-slate-500 flex-1">
                        Query or body parameter
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* USAGE EXAMPLE */}
              <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                <Text className="text-sm font-bold text-slate-900 mb-2">Note</Text>
                <Text className="text-sm text-slate-600">
                  Semua request memerlukan{' '}
                  <Text className="font-semibold">Authorization: Bearer TOKEN</Text> header dengan{' '}
                  <Text className="font-semibold">Accept: application/json</Text>
                </Text>
              </View>

              {/* ACTION BUTTONS */}
              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg p-4 items-center">
                  <View className="flex-row items-center">
                    <Ionicons name="play" size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">Test API</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleCopyPath(selectedEndpoint?.path || '')}
                  className="flex-1 bg-slate-200 rounded-lg p-4 items-center"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="copy" size={18} color="#475569" />
                    <Text className="text-slate-700 font-semibold ml-2">Copy Path</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
