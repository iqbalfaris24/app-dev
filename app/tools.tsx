import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createTool, deleteTool, listTools, Tool, updateTool } from '../src/services/tools';

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);

  // create/update state
  const [editingTool, setEditingTool] = useState<Partial<Tool> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await listTools();
      setTools(res.items || []);
    } catch (e) {
      console.warn('fetch tools failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleSave = async () => {
    if (!editingTool) return;
    setSaving(true);
    try {
      if (editingTool.id) {
        await updateTool(editingTool.id, editingTool as Tool);
      } else {
        await createTool(editingTool as Tool);
      }
      await fetchTools();
      setEditingTool(null);
    } catch (e) {
      console.warn('save tool failed', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTool = async (id: number) => {
    try {
      await deleteTool(id);
      await fetchTools();
    } catch (e) {
      console.warn('delete tool failed', e);
    }
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-slate-900">Tools Monitoring</Text>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={fetchTools} className="p-2 mr-2">
            <Ionicons name="refresh" size={24} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditingTool({})} className="p-2">
            <Ionicons name="add" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {loading && <ActivityIndicator size="large" color="#2563eb" />}
          {!loading && tools.length === 0 && (
            <Text className="text-slate-500 text-center">Tidak ada tools.</Text>
          )}
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              onPress={() => setEditingTool(tool)}
              className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-lg font-semibold text-slate-900">{tool.name}</Text>
                  <Text className="text-sm text-slate-500">{tool.url}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </View>
              {tool.status && (
                <View className="mt-2">
                  <Text className="text-xs text-slate-600">Status: {tool.status}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* edit/create modal */}
      <Modal visible={!!editingTool} animationType="slide" transparent={false}>
        <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
          <View className="bg-white border-b border-slate-200 px-6 py-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">
              {editingTool?.id ? 'Edit Tool' : 'New Tool'}
            </Text>
            <TouchableOpacity onPress={() => setEditingTool(null)} className="p-2">
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 py-6">
              <View className="mb-4">
                <Text className="text-sm font-medium text-slate-700 mb-1">Name</Text>
                <TextInput
                  value={editingTool?.name || ''}
                  onChangeText={(t) => setEditingTool({ ...editingTool, name: t })}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2"
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-slate-700 mb-1">URL</Text>
                <TextInput
                  value={editingTool?.url || ''}
                  onChangeText={(t) => setEditingTool({ ...editingTool, url: t })}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2"
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-slate-700 mb-1">Status</Text>
                <TextInput
                  value={editingTool?.status || ''}
                  onChangeText={(t) => setEditingTool({ ...editingTool, status: t })}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2"
                />
              </View>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="bg-blue-600 rounded-lg p-4 items-center"
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">
                    {editingTool?.id ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
              {editingTool?.id && (
                <TouchableOpacity
                  onPress={() => editingTool.id && handleDeleteTool(editingTool.id)}
                  className="mt-4 bg-red-600 rounded-lg p-4 items-center"
                >
                  <Text className="text-white font-semibold">Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
