import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ApiEndpoint, apiModules } from '../data/apiModules';

interface ApiMenuProps {
  onSelectEndpoint?: (moduleId: string, endpoint: ApiEndpoint) => void;
}

export function ApiModuleMenu({ onSelectEndpoint }: ApiMenuProps) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const selectedModuleData = apiModules.find(m => m.id === selectedModule);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-700';
      case 'POST':
        return 'bg-green-100 text-green-700';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      {/* MODULES GRID */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
      >
        <Text className="text-lg font-bold text-slate-800 mb-4">API Modules</Text>

        <View className="flex-row flex-wrap justify-between mb-6">
          {apiModules.map((module) => (
            <TouchableOpacity
              key={module.id}
              onPress={() => {
                setSelectedModule(module.id);
                setShowDetails(true);
              }}
              className={`w-[48%] rounded-2xl p-4 mb-4 border-2 ${
                selectedModule === module.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white'
              } shadow-sm`}
            >
              <View className={`${module.bgColor} w-12 h-12 rounded-xl items-center justify-center mb-3`}>
                <Ionicons name={module.icon as any} size={24} className={module.color} />
              </View>
              <Text className="text-sm font-semibold text-slate-800">{module.title}</Text>
              <Text className="text-xs text-slate-500 mt-1">
                {module.endpoints.length} endpoints
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal
        visible={showDetails && !!selectedModuleData}
        animationType="slide"
        transparent={false}
      >
        <View className="flex-1 bg-slate-50">
          {/* HEADER */}
          <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between pt-12">
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-900">{selectedModuleData?.title}</Text>
              <Text className="text-sm text-slate-500 mt-1">{selectedModuleData?.description}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowDetails(false);
              }}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* ENDPOINTS LIST */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 py-6">
              <Text className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">
                Available Endpoints ({selectedModuleData?.endpoints.length})
              </Text>

              {selectedModuleData?.endpoints.map((endpoint, index) => (
                <TouchableOpacity
                  key={endpoint.id}
                  onPress={() => {
                    if (onSelectEndpoint && selectedModule) {
                      onSelectEndpoint(selectedModule, endpoint);
                    }
                  }}
                  className="bg-white rounded-2xl p-4 mb-3 border border-slate-200 shadow-sm active:bg-slate-50"
                >
                  {/* METHOD BADGE & ENDPOINT NAME */}
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 pr-3">
                      <Text className="text-sm font-semibold text-slate-900">{endpoint.name}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded-md ${getMethodColor(endpoint.method)}`}>
                      <Text className="text-xs font-bold">{endpoint.method}</Text>
                    </View>
                  </View>

                  {/* PATH */}
                  <View className="bg-slate-100 rounded-lg p-2 mb-2">
                    <Text className="text-xs font-mono text-slate-700 break-words">{endpoint.path}</Text>
                  </View>

                  {/* DESCRIPTION */}
                  <Text className="text-sm text-slate-600 mb-3 leading-relaxed">
                    {endpoint.description}
                  </Text>

                  {/* PARAMETERS */}
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <View>
                      <Text className="text-xs font-semibold text-slate-700 mb-2">Parameters:</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {endpoint.parameters.map((param) => (
                          <View key={param} className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                            <Text className="text-xs text-amber-800 font-medium">{param}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* QUICK ACTION */}
                  <View className="mt-3 pt-3 border-t border-slate-200">
                    <Text className="text-xs text-blue-600 font-semibold">Tap untuk detail lebih lanjut →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
