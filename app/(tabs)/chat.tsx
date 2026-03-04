import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChatHistory, Message, sendMessage } from '../../src/services/chat';

// Simple markdown parser for AI responses
const parseMarkdown = (text: string) => {
  // Replace **bold** with bold styling
  const parts: (string | { type: 'bold'; content: string })[] = [];
  let lastIndex = 0;
  const regex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ type: 'bold', content: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const RenderMarkdownText = ({ text }: { text: string | any }) => {
  const parsed = parseMarkdown(text);

  if (typeof parsed === 'string') {
    return <Text className="text-blue-100 text-base leading-relaxed">{parsed}</Text>;
  }

  return (
    <Text className="text-blue-100 text-base leading-relaxed">
      {(parsed as any[]).map((part, idx) =>
        typeof part === 'string' ? (
          <Text key={idx}>{part}</Text>
        ) : (
          <Text key={idx} className="font-semibold text-white">
            {part.content}
          </Text>
        )
      )}
    </Text>
  );
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchHistory = async () => {
    setInitialLoading(true);
    try {
      const res = await getChatHistory();
      setMessages(res || []);
    } catch (e) {
      console.warn('fetch history failed', e);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const paddingToBottom = 100; // Show button if scroll is more than 100px from bottom
    
    const isScrolledUp =
      layoutMeasurement.height + contentOffset.y < contentSize.height - paddingToBottom;
    
    setShowScrollButton(isScrolledUp);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setShowScrollButton(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await sendMessage(inputText);
      const aiMessage: Message = {
        type: 'assistant',
        content: response.reply,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e: any) {
      const errorMsg: Message = {
        type: 'assistant',
        content: e.response?.data?.error || 'Gagal terhubung ke AI server.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900"
      style={{ paddingTop: insets.top }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header dengan Gradient */}
      <View className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-white/20 p-2 rounded-full mr-3">
              <Ionicons name="sparkles" size={24} color="#ffffff" />
            </View>
            <View>
              <Text className="text-white text-xl font-bold">Tiara AI</Text>
              <Text className="text-blue-100 text-xs">Asisten cerdas Anda</Text>
            </View>
          </View>
          <View className="w-2 h-2 bg-green-400 rounded-full shadow-glow" />
        </View>
      </View>

      {/* Chat Messages Container */}
      <View className="flex-1 relative">
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {initialLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#93c5fd" />
              <Text className="text-blue-300 text-center mt-4">Memuat chat history...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-32">
              <View className="bg-white/5 p-8 rounded-3xl border border-blue-500/30 backdrop-blur-md">
                <Ionicons name="sparkles" size={48} color="#60a5fa" />
                <Text className="text-white text-center text-lg font-semibold mt-4">
                  Halo! Saya Tiara AI
                </Text>
                <Text className="text-blue-200 text-center text-sm mt-2 px-2">
                  Mulai percakapan dengan menanyakan apapun tentang server Anda
                </Text>
              </View>
            </View>
          ) : (
            messages.map((msg, idx) => (
              msg.type === 'user' ? (
                // USER MESSAGE - WITH BUBBLE
                <View key={idx} className="mb-4 flex-row justify-end">
                  <View className="mr-2 max-w-xs bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl rounded-br-none px-4 py-3 shadow-lg">
                    <Text className="text-white text-base leading-relaxed">
                      {msg.content}
                    </Text>
                    <Text className="text-blue-100 text-xs mt-1">
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              ) : (
                // AI MESSAGE - NO BUBBLE, JUST TEXT WITH MARKDOWN
                <View key={idx} className="mb-4 flex-row justify-start">
                  <View className="flex-1 pl-1">
                    <RenderMarkdownText text={msg.content} />
                    <Text className="text-blue-300 text-xs mt-2">
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              )
            ))
          )}
          {loading && (
            <View className="mb-4 flex-row justify-start">
              <View className="flex-1 pl-1">
                <View className="flex-row items-center space-x-2">
                  <View className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <View className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <View className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Floating Scroll to Bottom Button */}
        {showScrollButton && (
          <TouchableOpacity
            onPress={scrollToBottom}
            className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3 shadow-lg"
          >
            <Ionicons name="arrow-down" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Input Area */}
      <View className="bg-gradient-to-t from-slate-900 to-slate-800/80 px-4 py-4" style={{ paddingBottom: insets.bottom + 12 }}>
        <View className="flex-row items-center bg-white/10 border border-blue-400/40 rounded-full px-4 py-3 backdrop-blur-md">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tanyakan sesuatu..."
            placeholderTextColor="#93c5fd"
            className="flex-1 text-white text-base"
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={loading || !inputText.trim()}
            className={`ml-2 p-2 rounded-full ${
              loading || !inputText.trim()
                ? 'bg-slate-600'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={loading || !inputText.trim() ? '#9ca3af' : '#ffffff'}
              />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-blue-300 text-xs text-center mt-2">
          Tiara AI v1.0 - Server Knowledge Assistant
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
