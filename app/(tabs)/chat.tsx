import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChatHistory, Message, sendMessage } from '../../src/services/chat';

// Simple markdown parser untuk respons AI
const RenderMarkdownText = ({ text }: { text: string | any }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <View className="flex-col">
      {lines.map((line: string, lineIdx: number) => {
        // Jeda / spasi untuk baris kosong
        if (line.trim() === '') return <View key={lineIdx} className="h-2" />;

        // Deteksi List / Bullet
        const isListItem = /^(\*|\-)\s+(.*)/.test(line);
        const isNumberedList = /^(\d+\.)\s+(.*)/.test(line);

        let contentText = line;
        let bulletSymbol = '';

        if (isListItem) {
          bulletSymbol = '•';
          contentText = line.replace(/^(\*|\-)\s+/, '');
        } else if (isNumberedList) {
          const match = line.match(/^(\d+\.)\s+/);
          bulletSymbol = match ? match[1] : '';
          contentText = line.replace(/^(\d+\.)\s+/, '');
        }

        // Parsing teks tebal (Bold)
        const parts: any[] = [];
        let lastIndex = 0;
        const regex = /\*\*(.*?)\*\*/g;
        let match;

        while ((match = regex.exec(contentText)) !== null) {
          if (match.index > lastIndex) {
            parts.push(contentText.slice(lastIndex, match.index));
          }
          parts.push({ type: 'bold', content: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < contentText.length) {
          parts.push(contentText.slice(lastIndex));
        }

        // Fungsi render gabungan teks (normal + tebal)
        const renderTextParts = () => (
          parts.map((part, pIdx) =>
            typeof part === 'string' ? (
              <Text key={pIdx}>{part}</Text>
            ) : (
              <Text key={pIdx} className="font-bold text-slate-900 dark:text-white">
                {part.content}
              </Text>
            )
          )
        );

        // Jika List: Buat format menjorok ke dalam (Flex Row)
        if (isListItem || isNumberedList) {
          return (
            <View key={lineIdx} className="flex-row pl-1 mb-1.5 pr-2">
              <Text className="text-slate-800 dark:text-slate-200 mr-2 font-bold text-base w-4">
                {bulletSymbol}
              </Text>
              <Text className="flex-1 text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                {renderTextParts()}
              </Text>
            </View>
          );
        }

        // Jika Teks Paragraf Biasa
        return (
          <Text key={lineIdx} className="text-slate-800 dark:text-slate-200 text-base leading-relaxed mb-1.5">
            {renderTextParts()}
          </Text>
        );
      })}
    </View>
  );
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme(); // Deteksi Light/Dark mode otomatis
  const isDark = colorScheme === 'dark';

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
    const paddingToBottom = 100;
    const isScrolledUp = layoutMeasurement.height + contentOffset.y < contentSize.height - paddingToBottom;
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
      const response = await sendMessage(userMessage.content);
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
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages]);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

return (
    // 1. KEYBOARD AVOIDING VIEW SEBAGAI ROOT (ELEMEN PALING LUAR)
    // Ini sangat penting agar iOS dan Android bisa mengkalkulasi sisa layar dengan 100% akurat
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0} 
    >
      {/* 2. HEADER: Area aman (insets.top) langsung disuntikkan di sini */}
      <View 
        className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 pb-4 flex-row items-center justify-between shadow-sm z-10"
        style={{ paddingTop: insets.top + 16 }} 
      >
        <View className="flex-row items-center">
          <View className="bg-blue-600 p-2 rounded-2xl mr-3 shadow-sm shadow-blue-500/50">
            <Ionicons name="sparkles" size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-slate-900 dark:text-white text-lg font-extrabold tracking-tight">Tiara AI</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Server Knowledge Assistant</Text>
          </View>
        </View>
        <View className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm" />
      </View>

      {/* 3. CHAT AREA */}
      <View className="flex-1 relative">
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled" // Agar ketukan di luar form menutup keyboard
        >
          {initialLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#3b82f6"} />
              <Text className="text-slate-500 dark:text-slate-400 text-center mt-4 font-medium">Memuat riwayat chat...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-32 px-6">
              <View className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 items-center shadow-lg shadow-slate-200/50 dark:shadow-none">
                <View className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-full mb-4">
                  <Ionicons name="sparkles" size={40} color={isDark ? "#60a5fa" : "#3b82f6"} />
                </View>
                <Text className="text-slate-900 dark:text-white text-center text-xl font-bold">Halo! Saya Tiara AI</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-center text-sm mt-2 leading-relaxed">
                  Asisten pintar Anda siap membantu. Tanyakan seputar server, infrastruktur, atau laporan harian.
                </Text>
              </View>
            </View>
          ) : (
            messages.map((msg, idx) => (
              msg.type === 'user' ? (
                // BUBBLE USER
                <View key={idx} className="mb-6 flex-row justify-end pl-12">
                  <View className="bg-blue-600 px-4 py-3 rounded-t-2xl rounded-bl-2xl rounded-br-none shadow-sm">
                    <Text className="text-white text-base leading-relaxed">{msg.content}</Text>
                    <Text className="text-blue-200 text-[10px] mt-1 text-right">{msg.timestamp}</Text>
                  </View>
                </View>
              ) : (
                // BUBBLE AI
                <View key={idx} className="mb-8 flex-row justify-start pr-4">
                  <View className="mr-3 mt-1">
                    <View className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-full">
                      <Ionicons name="sparkles" size={16} color={isDark ? "#60a5fa" : "#3b82f6"} />
                    </View>
                  </View>
                  <View className="flex-1">
                    <RenderMarkdownText text={msg.content} />
                    <Text className="text-slate-400 dark:text-slate-500 text-[10px] mt-1">{msg.timestamp}</Text>
                  </View>
                </View>
              )
            ))
          )}

          {loading && (
            <View className="mb-8 flex-row justify-start pr-6">
              <View className="mr-3 mt-1">
                <View className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-full">
                  <Ionicons name="sparkles" size={16} color={isDark ? "#60a5fa" : "#3b82f6"} />
                </View>
              </View>
              <View className="flex-row items-center space-x-2 h-8 mt-2">
                <View className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <View className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <View className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </View>
            </View>
          )}
        </ScrollView>

        {showScrollButton && (
          <TouchableOpacity
            onPress={scrollToBottom}
            className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <Ionicons name="arrow-down" size={20} color={isDark ? "#ffffff" : "#0f172a"} />
          </TouchableOpacity>
        )}
      </View>

      {/* 4. INPUT AREA */}
      <View 
        className="bg-white dark:bg-slate-900 px-4 py-3 border-t border-slate-200 dark:border-slate-800"
        // Gunakan margin aman statis untuk iOS saat tidak mengetik, 
        // saat ngetik (isKeyboardVisible), ubah ke 12px agar menempel persis di atas keyboard.
        style={{ paddingBottom: isKeyboardVisible ? 12 : (Platform.OS === 'ios' ? insets.bottom + 12 : 16) }}
      >
        <View className="flex-row items-end bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl px-4 py-2">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tanyakan sesuatu..."
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            className="flex-1 text-slate-900 dark:text-white text-base max-h-32 pt-2 pb-2"
            multiline
            maxLength={500}
            editable={!loading}
          />
          
          <View className="ml-3 mb-1">
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={loading || !inputText.trim()}
              style={{
                backgroundColor: (loading || !inputText.trim()) ? (isDark ? '#1e293b' : '#cbd5e1') : '#2563eb',
                padding: 10,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: (loading || !inputText.trim()) ? 0 : 0.3,
                shadowRadius: 3,
                elevation: (loading || !inputText.trim()) ? 0 : 3,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={(loading || !inputText.trim()) ? (isDark ? '#475569' : '#94a3b8') : '#ffffff'}
                  style={{ marginLeft: 2 }} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
}