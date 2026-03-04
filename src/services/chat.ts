import api from './api';

// From API
export interface ChatMessage {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
}

// For UI
export interface Message {
  id?: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SendMessageResponse {
  reply: string;
  timestamp: string;
}

const formatTimestamp = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
};

export const getChatHistory = async (): Promise<Message[]> => {
  try {
    const response = await api.get('/v1/chat/history');
    // Response is array of ChatMessage
    const chatMessages: ChatMessage[] = Array.isArray(response.data) ? response.data : [];
    
    // Transform to Message format
    return chatMessages.map((msg) => ({
      id: msg.id,
      type: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: formatTimestamp(msg.created_at),
    }));
  } catch (error) {
    console.error('fetch chat history failed', error);
    return [];
  }
};

export const sendMessage = async (message: string): Promise<SendMessageResponse> => {
  const response = await api.post('/v1/chat/send', { message });
  return response.data;
};
